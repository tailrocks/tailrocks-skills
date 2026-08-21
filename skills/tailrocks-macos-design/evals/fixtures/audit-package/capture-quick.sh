#!/bin/sh
# Faster than the visual-qa harness: grab the front window by screen rect.
swift run -c release SessionsProto --tr-scenario "$1" &
sleep 2
screencapture -R 0,0,1280,720 "captures/$1.png"
kill %1
