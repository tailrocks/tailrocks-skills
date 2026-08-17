#!/bin/sh
# Copied from tailrocks-macos-visual-qa templates/capture.sh (the standard
# harness: temp-dir refusal, kill loop, window-ID resolution, capture by
# window ID, sidecar metadata). The prototype's launch-contract integration
# — the only deltas from the source — is:
#   1. Launch execs the bundle binary directly with the tr-* launch-contract
#      arguments (after `--`) and waits for the app's TR-READY line instead
#      of `open` + fixed sleeps. The stock harness's `open` re-activation is
#      KEPT (against the running instance): on macOS 26 a direct-exec'd
#      SwiftUI app does not create its WindowGroup window until activated,
#      and self-activation from a background process is not honored —
#      verified, not assumed.
#   2. The sidecar additionally records the launch-contract cell (scenario,
#      appearance, window, reduce, backdrop), the producing binary and
#      version, and the OS build and SDK — required by the cross-binary
#      match policy.
#
# Usage:
#   capture.sh <App.app> <owner> <out.png> [windowName] -- <tr args...>
set -eu

APP=${1:?app bundle path required}
OWNER=${2:?owner name required}
OUT=${3:?output path required}
WINDOW_NAME=""
shift 3
if [ "${1:-}" != "--" ] && [ $# -gt 0 ]; then WINDOW_NAME=$1; shift; fi
[ "${1:-}" = "--" ] && shift
# Remaining arguments are the launch-contract arguments.

HERE=$(cd "$(dirname "$0")" && pwd -P)

app_dir=$(cd "$(dirname "$APP")" 2>/dev/null && pwd -P) || { echo "app directory not found" >&2; exit 2; }
APP="$app_dir/$(basename "$APP")"
case "$APP" in
  /tmp/*|/private/tmp/*|/var/folders/*|/private/var/folders/*)
    echo "refusing to launch app from temporary directory" >&2; exit 2 ;;
esac
if [ -n "${TMPDIR:-}" ]; then
  tmp_dir=$(cd "$TMPDIR" 2>/dev/null && pwd -P) || tmp_dir=$TMPDIR
  case "$APP" in "$tmp_dir"|"$tmp_dir"/*) echo "refusing to launch app from TMPDIR" >&2; exit 2 ;; esac
fi

mkdir -p "$(dirname "$OUT")"
TOOL=${WINDOW_ID_TOOL:-"${TMPDIR:-/tmp}/tailrocks-window-id"}
if [ ! -x "$TOOL" ]; then
  command -v swiftc >/dev/null 2>&1 || { echo "swiftc missing; set WINDOW_ID_TOOL" >&2; exit 2; }
  swiftc -O "$HERE/window-id.swift" -o "$TOOL"
fi

EXEC="$APP/Contents/MacOS/"
matched=$(pgrep -f "$EXEC" 2>/dev/null | wc -l | tr -d ' ')
echo "kill matched $matched processes"
if [ "$matched" -gt 0 ]; then
  pgrep -f "$EXEC" | xargs kill -TERM
  i=0; while pgrep -f "$EXEC" >/dev/null 2>&1 && [ "$i" -lt 10 ]; do sleep 0.5; i=$((i + 1)); done
  pgrep -f "$EXEC" >/dev/null 2>&1 && pgrep -f "$EXEC" | xargs kill -KILL
  i=0; while pgrep -f "$EXEC" >/dev/null 2>&1 && [ "$i" -lt 10 ]; do sleep 0.5; i=$((i + 1)); done
  pgrep -f "$EXEC" >/dev/null 2>&1 && { echo "app process survived kill" >&2; exit 1; }
fi

# Launch-contract launch: direct exec so TR-READY is observable on stdout.
BIN="$EXEC$(basename "$APP" .app)"
LOG="$OUT.launch.log"
: > "$LOG"
"$BIN" "$@" > "$LOG" 2>&1 &
APP_PID=$!
# Activate the running instance; without activation macOS 26 defers the
# SwiftUI window's creation and TR-READY never comes. Re-issue while
# waiting — an activation arriving mid-launch can be coalesced away.
sleep 1
open "$APP"
i=0
while [ "$i" -lt 60 ]; do
  grep -q '^TR-READY ' "$LOG" 2>/dev/null && break
  kill -0 "$APP_PID" 2>/dev/null || { echo "prototype exited before TR-READY:" >&2; cat "$LOG" >&2; exit 1; }
  [ $((i % 10)) -eq 9 ] && open "$APP"
  sleep 0.5; i=$((i + 1))
done
grep -q '^TR-READY ' "$LOG" || { echo "TR-READY not printed within 30s" >&2; cat "$LOG" >&2; exit 1; }

WID=""; i=0
while [ "$i" -lt 10 ]; do
  if [ -n "$WINDOW_NAME" ]; then WID=$("$TOOL" "$OWNER" "$WINDOW_NAME" || true); else WID=$("$TOOL" "$OWNER" || true); fi
  [ -n "$WID" ] && break
  sleep 1; i=$((i + 1))
done
case "$WID" in ''|*[!0-9]*) echo "no numeric window id resolved for $OWNER" >&2; "$TOOL" "$OWNER" --list >&2 || true; exit 1 ;; esac

screencapture -x -o -l "$WID" "$OUT"
[ -f "$OUT" ] && [ "$(wc -c < "$OUT")" -ge 8192 ] || { echo "capture empty — check the Screen Recording grant for this terminal" >&2; exit 1; }
dims=$(sips -g pixelWidth -g pixelHeight "$OUT" 2>/dev/null)
echo "$dims" | grep -Eq 'pixelWidth: [1-9][0-9]*' && echo "$dims" | grep -Eq 'pixelHeight: [1-9][0-9]*' || { echo "capture has zero dimensions" >&2; exit 1; }
pixel_width=$(echo "$dims" | awk '/pixelWidth:/ { print $2 }')
pixel_height=$(echo "$dims" | awk '/pixelHeight:/ { print $2 }')
SIDECAR="$OUT.json"
if [ -n "$WINDOW_NAME" ]; then "$TOOL" "$OWNER" "$WINDOW_NAME" --json > "$SIDECAR"; else "$TOOL" "$OWNER" --json > "$SIDECAR"; fi
plutil -replace pixelDimensions -json "{\"width\":$pixel_width,\"height\":$pixel_height}" "$SIDECAR"
frame_width=$(plutil -extract frameSize.width raw "$SIDECAR")
scale=$(awk -v pixels="$pixel_width" -v points="$frame_width" 'BEGIN { if (points > 0) printf "%.3f", pixels / points; else print "0" }')
plutil -replace backingScale -float "$scale" "$SIDECAR"

# Launch-contract cell + producing binary, for the cross-binary match policy.
SCENARIO="default"; APPEARANCE="system"; WINDOWSZ=""; REDUCE=""; BACKDROP=""
prev=""
for arg in "$@"; do
  case "$prev" in
    --tr-scenario) SCENARIO=$arg ;;
    --tr-appearance) APPEARANCE=$arg ;;
    --tr-window) WINDOWSZ=$arg ;;
    --tr-reduce) REDUCE=$arg ;;
    --tr-backdrop) BACKDROP=$arg ;;
  esac
  prev=$arg
done
BIN_VERSION=$(defaults read "$APP/Contents/Info" CFBundleShortVersionString 2>/dev/null || echo unknown)
plutil -replace launchContract -json "{\"scenario\":\"$SCENARIO\",\"appearance\":\"$APPEARANCE\",\"window\":\"$WINDOWSZ\",\"reduce\":\"$REDUCE\",\"backdrop\":\"$BACKDROP\"}" "$SIDECAR"
plutil -replace producedBy -json "{\"binary\":\"$(basename "$APP" .app)\",\"version\":\"$BIN_VERSION\"}" "$SIDECAR"
plutil -replace environment -json "{\"osBuild\":\"$(sw_vers -buildVersion)\",\"sdk\":\"macosx$(xcrun --show-sdk-version --sdk macosx 2>/dev/null || echo unknown)\"}" "$SIDECAR"
echo "$OUT"
