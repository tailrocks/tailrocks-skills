#!/bin/sh
# Atomic build-launch-capture loop for a native macOS app.
#
# Process and window state does not survive reliably between separate agent tool
# calls, so kill, launch, wait, and capture happen in one invocation.
#
# Requires: Screen Recording permission for the invoking terminal application.
#
# Usage:
#   capture.sh <app-bundle-path> <owner-name> <output.png> [window-name]

set -eu

APP="${1:?app bundle path required}"
OWNER="${2:?owner name required}"
OUT="${3:?output path required}"
WINDOW_NAME="${4:-}"

HERE="$(cd "$(dirname "$0")" && pwd)"
WINDOW_ID_TOOL="$HERE/window-id"

if [ ! -x "$WINDOW_ID_TOOL" ]; then
    swiftc -O "$HERE/window-id.swift" -o "$WINDOW_ID_TOOL"
fi

case "$APP" in
    /tmp/*|/private/tmp/*)
        echo "refusing to launch from a temporary directory: windows die within seconds" >&2
        echo "move derivedDataPath outside /tmp" >&2
        exit 2
        ;;
esac

# `open` on a running app only reactivates it; a windowless process stays
# windowless forever. The kill is mandatory, not defensive.
pkill -9 -f "$(basename "$APP")/Contents/MacOS" 2>/dev/null || true
sleep 1

open "$APP"
sleep 3

WID=""
i=0
while [ "$i" -lt 10 ]; do
    if [ -n "$WINDOW_NAME" ]; then
        WID="$("$WINDOW_ID_TOOL" "$OWNER" "$WINDOW_NAME" 2>/dev/null || true)"
    else
        WID="$("$WINDOW_ID_TOOL" "$OWNER" 2>/dev/null || true)"
    fi
    [ -n "$WID" ] && break
    sleep 1
    i=$((i + 1))
done

if [ -z "$WID" ]; then
    echo "no window resolved for owner $OWNER" >&2
    "$WINDOW_ID_TOOL" "$OWNER" --list >&2 || true
    exit 1
fi

mkdir -p "$(dirname "$OUT")"

# -x no sound, -o no window shadow, -l capture by window ID.
# Capture by ID works even when the window is off the current Space, where a
# rectangle capture would silently grab unrelated pixels.
screencapture -x -o -l "$WID" "$OUT"

echo "$OUT"
