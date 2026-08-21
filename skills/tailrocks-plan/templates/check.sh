#!/bin/sh
# roadmap/<slug>/goal/check.sh — the machine gate for one item.
#
# Proves what a script can prove: the frozen contract is unedited, the tree is
# clean, every manifest row reached a terminal status, and every gate command
# both succeeded AND executed work. It cannot prove the shipped behavior is
# right — that is `tailrocks-prove`'s job, and its rounds live beside this one.

set -u

verdict() {
  printf '%s\n' "TAILROCKS GOAL: $1"
  case "$1" in
    PASS\ *) exit 0 ;;
    *) exit 1 ;;
  esac
}

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" 2>/dev/null && pwd) ||
  verdict "BLOCKED malformed=script-path"
item_dir=$(dirname -- "$script_dir")
slug=${1:-$(basename -- "$item_dir")}
item="roadmap/$slug"
hub="$item/plan/README.md"
start="$item/goal/START.md"

[ -f "$hub" ] || verdict "BLOCKED malformed=missing-hub"
[ -f "$start" ] || verdict "BLOCKED malformed=missing-start"

[ -z "$(git status --porcelain 2>/dev/null)" ] ||
  verdict "BLOCKED dirty-tree"

expected_fingerprint=$(sed -n \
  's/^Frozen contract fingerprint: `\([^`]*\)`.*/\1/p' "$hub" | sed -n '1p')
case "$expected_fingerprint" in
  ''|*[!0-9a-f]*) verdict "BLOCKED malformed=fingerprint" ;;
esac

# The frozen contract: every plan file, the spec, the coverage ledger, and the
# goal package. The item, the manifest's status rows, and every verification
# round stay outside it — those are what the loop must be able to move.
frozen_files=$(
  find "$item/plan" "$item/goal" -type f ! -path "$hub" -print 2>/dev/null |
    LC_ALL=C sort
)
[ -n "$frozen_files" ] || verdict "BLOCKED malformed=frozen-files"
actual_fingerprint=$(
  printf '%s\n' "$frozen_files" |
    while IFS= read -r file; do
      printf '%s %s\n' "$(git hash-object -- "$file")" "$file"
    done |
    git hash-object --stdin
) || verdict "BLOCKED malformed=fingerprint"
[ "$actual_fingerprint" = "$expected_fingerprint" ] ||
  verdict "BLOCKED plan-drift"

# The decisions snapshot: the item's ## Decisions body is writable (record-
# decision appends to it), so planning froze a verbatim copy into the spec.
# Any later difference — whatever hand made it — means the contract's ground
# moved; only a re-plan may re-stamp the snapshot. Blank lines are stripped
# on both sides; the snapshot is stored pre-stripped. Older packages carry
# no snapshot and skip this check.
decisions_snapshot="$item/plan/spec/decisions.md"
if [ -f "$decisions_snapshot" ]; then
  strip_blanks() { grep -v '^[[:space:]]*$' || true; }
  current_decisions=$(
    awk '
      /^## Decisions[[:space:]]*$/ { inside = 1; next }
      inside && /^## / { exit }
      inside { print }
    ' "$item/README.md" | strip_blanks | git hash-object --stdin
  )
  expected_decisions=$(strip_blanks < "$decisions_snapshot" | git hash-object --stdin)
  [ "$current_decisions" = "$expected_decisions" ] ||
    verdict "BLOCKED decisions-drift"
fi

status_counts=$(awk -F '|' '
  /^\|/ {
    status = $(NF - 1)
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", status)
    if (status == "DONE") done++
    else if (status == "REJECTED" || status ~ /^REJECTED \(/) rejected++
    else if (status == "TODO" || status == "STALE" ||
             status == "IN PROGRESS" || status == "BLOCKED" ||
             status ~ /^BLOCKED \(/) nonterminal++
  }
  END { print done + 0, rejected + 0, nonterminal + 0 }
' "$hub")
set -- $status_counts
done_count=$1
terminal_count=$((done_count + $2))
nonterminal_count=$3
[ "$nonterminal_count" -eq 0 ] ||
  verdict "BLOCKED nonterminal-rows=$nonterminal_count"
[ "$done_count" -gt 0 ] || verdict "BLOCKED malformed=status-table"
[ "$terminal_count" -gt 0 ] || verdict "BLOCKED malformed=status-table"

gates=$(awk '
  /^```sh gates[[:space:]]*$/ { inside = 1; found = 1; next }
  inside && /^```[[:space:]]*$/ { inside = 0; closed = 1; exit }
  inside { print }
  END { if (!found || !closed) exit 1 }
' "$start") || verdict "BLOCKED malformed=gates-block"
[ -n "$gates" ] || verdict "BLOCKED malformed=gates-block"

# Each gate line is `<command> ||| <proof>`. The proof prints how many units
# the gate executed — tests run, targets built, files checked. Exit 0 from a
# command that executed nothing is the failure this rejects: a gate that cannot
# tell "all tests passed" from "no tests ran" is not a gate.
printf '%s\n' "$gates" | while IFS= read -r line; do
  [ -n "$line" ] || continue
  command=$(printf '%s' "${line%%|||*}" | sed 's/[[:space:]]*$//')
  proof=$(printf '%s' "${line#*|||}" | sed 's/^[[:space:]]*//')
  [ "$proof" != "$line" ] || {
    printf '%s\n' "TAILROCKS GOAL: BLOCKED gate-unproven=$line"
    exit 1
  }
  sh -c "$command" || {
    printf '%s\n' "TAILROCKS GOAL: BLOCKED gate-failed=$command"
    exit 1
  }
  executed=$(sh -c "$proof" 2>/dev/null | tr -cd '0-9')
  case "$executed" in
    ''|0) printf '%s\n' "TAILROCKS GOAL: BLOCKED gate-vacuous=$command"
          exit 1 ;;
  esac
done
gate_status=$?
[ "$gate_status" -eq 0 ] || exit "$gate_status"

head_sha=$(git rev-parse --short HEAD 2>/dev/null) ||
  verdict "BLOCKED malformed=head-sha"
verdict "PASS $head_sha"
