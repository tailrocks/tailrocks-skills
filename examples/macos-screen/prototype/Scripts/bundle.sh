#!/bin/sh
# Build the prototype and assemble a launchable .app bundle in a NON-temporary
# staging directory. An app launched from /tmp, /private/tmp, or /var/folders
# loses its windows within seconds, which breaks the capture loop — the same
# refusal the capture harness enforces.
set -eu

STAGE=${1:?staging directory required (must NOT be under /tmp, /private/tmp, or /var/folders)}
case "$STAGE" in
  /tmp/*|/private/tmp/*|/var/folders/*|/private/var/folders/*)
    echo "refusing temporary staging directory $STAGE" >&2; exit 2 ;;
esac

PKG=$(cd "$(dirname "$0")/.." && pwd -P)
cd "$PKG"
swift build -c release

APP="$STAGE/ConnectionsBoardProto.app"
rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS"
cp "$PKG/.build/release/ConnectionsBoardProto" "$APP/Contents/MacOS/"

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>ConnectionsBoardProto</string>
    <key>CFBundleIdentifier</key>
    <string>com.tailrocks.proto.connectionsboard</string>
    <key>CFBundleName</key>
    <string>ConnectionsBoardProto</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>0.1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>26.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>
PLIST

# Ad-hoc local signing, per the project-setup baseline.
codesign --force -s - "$APP"
echo "$APP"
