#!/bin/sh
set -eu

SCHEMA='tailrocks.macos-state/v1'
KEYS='com.apple.universalaccess|increaseContrast|-bool
com.apple.universalaccess|reduceTransparency|-bool
com.apple.universalaccess|reduceMotion|-bool
com.apple.universalaccess|differentiateWithoutColor|-bool
NSGlobalDomain|AppleInterfaceStyle|-string
NSGlobalDomain|AppleInterfaceStyleSwitchesAutomatically|-bool'
DEFAULTS=/usr/bin/defaults
OSASCRIPT=/usr/bin/osascript
read_value() { domain=$1; [ "$domain" = NSGlobalDomain ] && domain=-g; "$DEFAULTS" read "$domain" "$2" 2>/dev/null; }
snapshot() {
  umask 077; file=$1; printf '%s\n' "$SCHEMA" > "$file"; chmod 600 "$file"
  echo "$KEYS" | while IFS='|' read -r domain key type; do
    value=$(read_value "$domain" "$key") || value=ABSENT
    case "$value" in *'|'*|*'
'*) echo "unsupported defaults value" >&2; return 1 ;; esac
    printf '%s|%s|%s|%s\n' "$domain" "$key" "$type" "$value" >> "$file"
  done
}
validate_snapshot() {
  file=$1
  [ -f "$file" ] && [ ! -L "$file" ] || { echo "snapshot must be regular" >&2; return 1; }
  [ "$(stat -f %u "$file")" = "$(id -u)" ] && [ "$(stat -f %Lp "$file")" = 600 ] || { echo "snapshot owner or mode invalid" >&2; return 1; }
  awk -F '|' -v schema="$SCHEMA" '
    NR==1 { if ($0 != schema) exit 1; next }
    NR==2 { ok=$1=="com.apple.universalaccess"&&$2=="increaseContrast"&&$3=="-bool" }
    NR==3 { ok=ok&&$1=="com.apple.universalaccess"&&$2=="reduceTransparency"&&$3=="-bool" }
    NR==4 { ok=ok&&$1=="com.apple.universalaccess"&&$2=="reduceMotion"&&$3=="-bool" }
    NR==5 { ok=ok&&$1=="com.apple.universalaccess"&&$2=="differentiateWithoutColor"&&$3=="-bool" }
    NR==6 { ok=ok&&$1=="NSGlobalDomain"&&$2=="AppleInterfaceStyle"&&$3=="-string"&&($4=="ABSENT"||$4=="Dark") }
    NR==7 { ok=ok&&$1=="NSGlobalDomain"&&$2=="AppleInterfaceStyleSwitchesAutomatically"&&$3=="-bool" }
    NR>=2&&NR<=5 { ok=ok&&($4=="ABSENT"||$4=="0"||$4=="1") }
    NR==7 { ok=ok&&($4=="ABSENT"||$4=="0"||$4=="1") }
    END { exit !(NR==7&&ok) }
  ' "$file" || { echo "snapshot registry invalid" >&2; return 1; }
}
write_verified() {
  domain=$1 key=$2 type=$3 value=$4; target=$domain; [ "$target" = NSGlobalDomain ] && target=-g
  write_value=$value; if [ "$type" = -bool ]; then [ "$value" = 1 ] && write_value=true || write_value=false; fi
  "$DEFAULTS" write "$target" "$key" "$type" "$write_value"
  actual=$(read_value "$domain" "$key") || return 1; [ "$actual" = "$value" ]
}
delete_verified() { domain=$1 key=$2; target=$domain; [ "$target" = NSGlobalDomain ] && target=-g; "$DEFAULTS" delete "$target" "$key" 2>/dev/null || true; ! read_value "$domain" "$key" >/dev/null 2>&1; }
apply_state() {
  case "$1" in
    increase-contrast) write_verified com.apple.universalaccess increaseContrast -bool 1 ;;
    reduce-transparency) write_verified com.apple.universalaccess reduceTransparency -bool 1 ;;
    reduce-motion) write_verified com.apple.universalaccess reduceMotion -bool 1 ;;
    differentiate-without-color) write_verified com.apple.universalaccess differentiateWithoutColor -bool 1 ;;
    dark) write_verified NSGlobalDomain AppleInterfaceStyleSwitchesAutomatically -bool 0 && "$OSASCRIPT" -e 'tell application "System Events" to tell appearance preferences to set dark mode to true' && [ "$(read_value NSGlobalDomain AppleInterfaceStyle)" = Dark ] ;;
    light) write_verified NSGlobalDomain AppleInterfaceStyleSwitchesAutomatically -bool 0 && "$OSASCRIPT" -e 'tell application "System Events" to tell appearance preferences to set dark mode to false' && ! read_value NSGlobalDomain AppleInterfaceStyle >/dev/null 2>&1 ;;
    *) echo "unknown state: $1" >&2; return 2 ;;
  esac
}
restore_once() {
  before=$1 applied=$2; validate_snapshot "$before"; validate_snapshot "$applied"; line=2
  tail -n +2 "$before" | while IFS='|' read -r domain key type value; do
    applied_value=$(sed -n "${line}p" "$applied" | awk -F '|' '{ print $4 }')
    current=$(read_value "$domain" "$key") || current=ABSENT
    if [ "$current" = "$value" ]; then :
    elif [ "$current" != "$applied_value" ]; then echo "restore conflict: $domain $key" >&2; return 1
    elif [ "$value" = ABSENT ]; then delete_verified "$domain" "$key" || return 1
    else write_verified "$domain" "$key" "$type" "$value" || return 1; fi
    line=$((line + 1))
  done
}
report_recovery() { encoded=$(printf '%s' "$1" | /usr/bin/base64 | /usr/bin/tr -d '\n'); printf 'tailrocks-recovery-artifact-base64:%s\n' "$encoded" >&2; }
restore() { attempt=1; while [ "$attempt" -le 3 ]; do restore_once "$1" "$2" && { echo "tailrocks-state-restoration:restored" >&2; return 0; }; attempt=$((attempt + 1)); sleep 1; done; echo "tailrocks-state-restoration:recovery-required" >&2; echo "restore failed after 3 attempts" >&2; report_recovery "$1"; report_recovery "$2"; return 1; }
command=${1:?snapshot|recover|with required}
case "$command" in
  snapshot) snapshot "${2:?snapshot file required}" ;;
  recover) restore "${2:?before snapshot required}" "${3:?applied snapshot required}" ;;
  with)
    state=${2:?state required}; shift 2; [ "${1:-}" = -- ] || { echo "with requires --" >&2; exit 2; }; shift; [ "$#" -gt 0 ] || { echo "with requires command argv" >&2; exit 2; }
    HERE=$(cd "$(dirname "$0")" && pwd -P)
    [ "$#" -ge 4 ] && [ "$1" = /bin/sh ] && [ "$2" = "$HERE/capture.sh" ] || { echo "with permits only the installed capture operation" >&2; exit 2; }
    before=${TAILROCKS_STATE_BEFORE:-}; applied=${TAILROCKS_STATE_APPLIED:-}
    [ -n "$before" ] || before=$(mktemp "${TMPDIR:-/tmp}/tailrocks-state-before.XXXXXX")
    [ -n "$applied" ] || applied=$(mktemp "${TMPDIR:-/tmp}/tailrocks-state-applied.XXXXXX")
    applied_ready=0
    snapshot "$before"
    cleanup() { status=$?; trap - EXIT INT TERM; if [ "$applied_ready" -eq 0 ]; then snapshot "$applied" || status=1; fi; if restore "$before" "$applied"; then rm -f "$before" "$applied"; else status=1; fi; exit "$status"; }
    trap cleanup EXIT INT TERM; apply_state "$state"; snapshot "$applied"; applied_ready=1; "$@"
    ;;
  *) echo "usage: state.sh snapshot FILE | recover BEFORE APPLIED | with STATE -- COMMAND" >&2; exit 2 ;;
esac
