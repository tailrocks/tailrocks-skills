#!/bin/sh
set -eu

OUT=${1:?non-temporary absent output directory required}
case "$OUT" in /tmp/*|/private/tmp/*|/var/folders/*|/private/var/folders/*) echo "temporary output refused" >&2; exit 2 ;; esac
PARENT=$(cd "$(dirname "$OUT")" 2>/dev/null && pwd -P) || { echo "output parent missing" >&2; exit 2; }
OUT="$PARENT/$(basename "$OUT")"; [ ! -e "$OUT" ] && [ ! -L "$OUT" ] || { echo "fixture destination exists" >&2; exit 2; }
HERE=$(cd "$(dirname "$0")" && pwd -P)
STAGE=$(mktemp -d "$PARENT/.tailrocks-fixtures.XXXXXX")
cleanup() { [ -d "$STAGE" ] && rm -rf "$STAGE"; }
trap cleanup EXIT INT TERM
mkdir -p "$STAGE/Fixture.app/Contents/MacOS" "$STAGE/DecoyFixture.app/Contents/MacOS"
swiftc -O "$HERE/FixtureApp.swift" -o "$STAGE/Fixture.app/Contents/MacOS/Fixture"
swiftc -O "$HERE/FixtureApp.swift" -o "$STAGE/DecoyFixture.app/Contents/MacOS/DecoyFixture"
for app in Fixture DecoyFixture; do
  plist="$STAGE/$app.app/Contents/Info.plist"
  plutil -create xml1 "$plist"
  plutil -insert CFBundleExecutable -string "$app" "$plist"
  plutil -insert CFBundleIdentifier -string "dev.tailrocks.VisualQA$app" "$plist"
  plutil -insert CFBundleName -string "$app" "$plist"
  plutil -insert CFBundlePackageType -string APPL "$plist"
done
mv -n "$STAGE" "$OUT"
[ ! -d "$STAGE" ] || { echo "fixture publication raced" >&2; exit 2; }
trap - EXIT INT TERM
printf '%s\n' "$OUT/Fixture.app" "$OUT/DecoyFixture.app"
