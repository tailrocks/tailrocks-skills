#!/bin/sh
set -eu

APP=${1:?app bundle path required}; OUT=${2:?output path required}; shift 2
WINDOW_NAME=""
if [ "${1:-}" = --window-title ]; then WINDOW_NAME=${2:?window title required}; shift 2; fi
[ "${1:-}" = -- ] && shift
HERE=$(cd "$(dirname "$0")" && pwd -P)
APP_PARENT=$(cd "$(dirname "$APP")" 2>/dev/null && pwd -P) || { echo "app parent missing" >&2; exit 2; }
APP="$APP_PARENT/$(basename "$APP")"
case "$APP" in /tmp/*|/private/tmp/*|/var/folders/*|/private/var/folders/*) echo "temporary app refused" >&2; exit 2 ;; esac
[ ! -L "$APP" ] || { echo "symlink app bundle refused" >&2; exit 2; }
APP=$(cd "$APP" && pwd -P)
CONTENTS="$APP/Contents"; [ -d "$CONTENTS" ] && [ ! -L "$CONTENTS" ] || { echo "invalid Contents directory" >&2; exit 2; }
CONTENTS=$(cd "$CONTENTS" && pwd -P); case "$CONTENTS" in "$APP"/*) ;; *) echo "Contents escaped app bundle" >&2; exit 2 ;; esac
MACOS="$CONTENTS/MacOS"; [ -d "$MACOS" ] && [ ! -L "$MACOS" ] || { echo "invalid MacOS directory" >&2; exit 2; }
MACOS=$(cd "$MACOS" && pwd -P)
case "$MACOS" in "$CONTENTS"/*) ;; *) echo "MacOS escaped Contents" >&2; exit 2 ;; esac
EXECUTABLE_NAME=$(plutil -extract CFBundleExecutable raw "$APP/Contents/Info.plist")
case "$EXECUTABLE_NAME" in ''|*[!A-Za-z0-9._-]*) echo "unsafe CFBundleExecutable" >&2; exit 2 ;; esac
EXECUTABLE="$MACOS/$EXECUTABLE_NAME"
[ -f "$EXECUTABLE" ] && [ ! -L "$EXECUTABLE" ] && [ -x "$EXECUTABLE" ] || { echo "bundle executable must be regular, non-symlink, executable" >&2; exit 2; }
EXECUTABLE_REAL=$(cd "$(dirname "$EXECUTABLE")" && pwd -P)/$(basename "$EXECUTABLE")
case "$EXECUTABLE_REAL" in "$MACOS"/*) ;; *) echo "bundle executable escaped MacOS" >&2; exit 2 ;; esac

OUT_PARENT_INPUT=$(dirname "$OUT"); [ ! -L "$OUT_PARENT_INPUT" ] || { echo "symlink output parent refused" >&2; exit 2; }
OUT_PARENT=$(cd "$OUT_PARENT_INPUT" 2>/dev/null && pwd -P) || { echo "output parent must already exist" >&2; exit 2; }
OUT_NAME=$(basename "$OUT"); SIDECAR_NAME="$OUT_NAME.json"
case "$OUT_NAME" in ''|.|..|*/*) echo "unsafe output name" >&2; exit 2 ;; esac
OUT_PARENT_ID=$(stat -f '%d:%i' "$OUT_PARENT")
cd "$OUT_PARENT"
OUT_ANCHOR=.
OUT="$OUT_ANCHOR/$OUT_NAME"; SIDECAR="$OUT_ANCHOR/$SIDECAR_NAME"
[ ! -e "$OUT" ] && [ ! -L "$OUT" ] && [ ! -e "$SIDECAR" ] && [ ! -L "$SIDECAR" ] || { echo "output exists" >&2; exit 2; }

TOOLS=$(mktemp -d "${TMPDIR:-/tmp}/tailrocks-visual-qa-tools.XXXXXX"); chmod 700 "$TOOLS"
PROCESS_TOOL="$TOOLS/process-owner"; WINDOW_TOOL="$TOOLS/window-id"; LAUNCHER_TOOL="$TOOLS/app-launcher"
TMP_OUT=""; PRE_JSON=""; POST_JSON=""; PUBLISHED_SIDECAR=0; PUBLISHED_OUT=0; SIDECAR_ID=""; OUT_ID=""; IDENTITY=""; SUCCESS=0
report_recovery() {
  encoded=$(printf '%s' "$1" | /usr/bin/base64 | /usr/bin/tr -d '\n')
  printf 'tailrocks-recovery-artifact-base64:%s\n' "$encoded" >&2
}
cleanup() {
  if [ -n "$IDENTITY" ] && [ -x "$PROCESS_TOOL" ]; then
    cleanup_pid=${IDENTITY%%|*}; cleanup_token=${IDENTITY#*|}
    "$PROCESS_TOOL" terminate "$EXECUTABLE_REAL" "$cleanup_pid" "$cleanup_token" >/dev/null 2>&1 || true
    cleanup_attempt=0
    while "$PROCESS_TOOL" verify "$EXECUTABLE_REAL" "$cleanup_pid" "$cleanup_token" >/dev/null 2>&1 && [ "$cleanup_attempt" -lt 20 ]; do sleep 0.25; cleanup_attempt=$((cleanup_attempt + 1)); done
    "$PROCESS_TOOL" verify "$EXECUTABLE_REAL" "$cleanup_pid" "$cleanup_token" >/dev/null 2>&1 && "$PROCESS_TOOL" force-terminate "$EXECUTABLE_REAL" "$cleanup_pid" "$cleanup_token" >/dev/null 2>&1 || true
  fi
  [ -n "$TMP_OUT" ] && rm -f "$TMP_OUT"
  [ -n "$PRE_JSON" ] && rm -f "$PRE_JSON"
  [ -n "$POST_JSON" ] && rm -f "$POST_JSON"
  if [ "$SUCCESS" -eq 0 ] && [ "$PUBLISHED_OUT" -eq 1 ] && [ -e "$OUT" ]; then
    current=$(stat -f '%d:%i' "$OUT" 2>/dev/null || true)
    if [ "$current" = "$OUT_ID" ]; then rm -f "$OUT" || report_recovery "$OUT_PARENT/$OUT_NAME"
    else report_recovery "$OUT_PARENT/$OUT_NAME"; fi
  fi
  if [ "$SUCCESS" -eq 0 ] && [ "$PUBLISHED_SIDECAR" -eq 1 ] && [ -e "$SIDECAR" ]; then
    current=$(stat -f '%d:%i' "$SIDECAR" 2>/dev/null || true)
    if [ "$current" = "$SIDECAR_ID" ]; then rm -f "$SIDECAR" || report_recovery "$OUT_PARENT/$SIDECAR_NAME"
    else report_recovery "$OUT_PARENT/$SIDECAR_NAME"; fi
  fi
  rm -f "$PROCESS_TOOL" "$WINDOW_TOOL" "$LAUNCHER_TOOL" "$TOOLS/window-error" "$TOOLS/window-candidate"; rmdir "$TOOLS" 2>/dev/null || true
}
trap cleanup EXIT INT TERM
swiftc -O "$HERE/process-owner.swift" -o "$PROCESS_TOOL"; swiftc -O "$HERE/window-id.swift" -o "$WINDOW_TOOL"; swiftc -O "$HERE/app-launcher.swift" -o "$LAUNCHER_TOOL"

set +e; IDENTITY=$("$LAUNCHER_TOOL" "$APP" "$EXECUTABLE_REAL" "$@"); launch_code=$?; set -e
[ "$launch_code" -eq 0 ] || exit "$launch_code"
PID=${IDENTITY%%|*}; TOKEN=${IDENTITY#*|}
ACTIVATION=$("$PROCESS_TOOL" request-activation "$EXECUTABLE_REAL" "$PID" "$TOKEN")

PRE_JSON=$(mktemp "$OUT_ANCHOR/.tailrocks-window-pre.XXXXXX")
WINDOW_CANDIDATE="$TOOLS/window-candidate"; attempt=0; code=1; stable=0
while [ "$attempt" -lt 40 ]; do
  set +e
  if [ -n "$WINDOW_NAME" ]; then "$WINDOW_TOOL" "$PID" "$WINDOW_NAME" --json > "$PRE_JSON" 2>"$TOOLS/window-error"; code=$?
  else "$WINDOW_TOOL" "$PID" --json > "$PRE_JSON" 2>"$TOOLS/window-error"; code=$?; fi
  set -e
  [ "$code" -eq 4 ] && { cat "$TOOLS/window-error" >&2; exit 4; }
  if [ "$code" -eq 0 ]; then
    if [ -f "$WINDOW_CANDIDATE" ] && cmp -s "$PRE_JSON" "$WINDOW_CANDIDATE"; then stable=$((stable + 1)); else stable=0; cp "$PRE_JSON" "$WINDOW_CANDIDATE"; fi
    [ "$stable" -ge 3 ] && break
    code=1
  fi
  sleep 0.25; attempt=$((attempt + 1))
done
[ "$code" -eq 0 ] || { echo "window resolution timed out after 10 seconds" >&2; exit 1; }
WID=$(plutil -extract windowID raw "$PRE_JSON"); case "$WID" in ''|*[!0-9]*) echo "invalid window identity" >&2; exit 1 ;; esac
"$PROCESS_TOOL" verify "$EXECUTABLE_REAL" "$PID" "$TOKEN"

TMP_OUT=$(mktemp "$OUT_ANCHOR/.tailrocks-capture.XXXXXX")
screencapture -x -o -l "$WID" "$TMP_OUT"
[ -f "$TMP_OUT" ] && [ ! -L "$TMP_OUT" ] || { echo "capture invalid" >&2; exit 1; }
capture_bytes=$(wc -c < "$TMP_OUT")
[ "$capture_bytes" -ge 8192 ] && [ "$capture_bytes" -le 67108864 ] || { echo "capture byte bound failed" >&2; exit 1; }
dims=$(sips -g pixelWidth -g pixelHeight "$TMP_OUT" 2>/dev/null)
pixel_width=$(printf '%s\n' "$dims" | awk '/pixelWidth:/ { print $2 }'); pixel_height=$(printf '%s\n' "$dims" | awk '/pixelHeight:/ { print $2 }')
case "$pixel_width:$pixel_height" in *[!0-9:]*|0:*|*:0|:) echo "capture dimensions invalid" >&2; exit 1 ;; esac
[ "$pixel_width" -le 16384 ] && [ "$pixel_height" -le 16384 ] && [ $((pixel_width * pixel_height)) -le 100000000 ] || { echo "capture pixel bound failed" >&2; exit 1; }
POST_JSON=$(mktemp "$OUT_ANCHOR/.tailrocks-window-post.XXXXXX")
if [ -n "$WINDOW_NAME" ]; then "$WINDOW_TOOL" "$PID" "$WINDOW_NAME" --json > "$POST_JSON"; else "$WINDOW_TOOL" "$PID" --json > "$POST_JSON"; fi
cmp -s "$PRE_JSON" "$POST_JSON" || { echo "window identity changed during capture" >&2; exit 1; }
"$PROCESS_TOOL" verify "$EXECUTABLE_REAL" "$PID" "$TOKEN"
plutil -replace pixelDimensions -json "{\"width\":$pixel_width,\"height\":$pixel_height}" "$PRE_JSON"
plutil -replace activation -json "$ACTIVATION" "$PRE_JSON"
plutil -replace permissions -json '{"interactiveSession":"granted","screenRecording":"granted","accessibility":"not-checked","automation":"not-required"}' "$PRE_JSON"
[ "$(stat -f '%d:%i' "$OUT_PARENT")" = "$OUT_PARENT_ID" ] || { echo "output parent identity changed" >&2; exit 2; }
SIDECAR_ID=$(stat -f '%d:%i' "$PRE_JSON")
OUT_ID=$(stat -f '%d:%i' "$TMP_OUT")
ln "$PRE_JSON" "$SIDECAR" || { echo "sidecar publication raced" >&2; exit 2; }; PUBLISHED_SIDECAR=1
[ "$(stat -f '%d:%i' "$SIDECAR")" = "$SIDECAR_ID" ] || { echo "sidecar publication identity changed" >&2; exit 2; }
ln "$TMP_OUT" "$OUT" || { echo "capture publication raced" >&2; exit 2; }; PUBLISHED_OUT=1
[ "$(stat -f '%d:%i' "$OUT")" = "$OUT_ID" ] || { echo "capture publication identity changed" >&2; exit 2; }
[ "$(stat -f '%d:%i' "$OUT_PARENT")" = "$OUT_PARENT_ID" ] || { echo "output parent identity changed after publication" >&2; exit 2; }
rm -f "$TMP_OUT"; TMP_OUT=""; SUCCESS=1
plutil -convert json -o - "$SIDECAR"
