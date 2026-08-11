// Resolve the CGWindowID of a running application's window.
//
// Build once:
//   swiftc -O window-id.swift -o window-id
//
// Use:
//   window-id <ownerName> [windowName]
//   window-id App "App"        -> prints the first matching window ID
//   window-id App --list       -> prints every window owned by App
//
// Enumerates with .optionAll and does NOT filter on kCGWindowIsOnscreen.
// A SwiftUI window that is not on the current Space is absent from the
// on-screen list and reports zero windows through the accessibility API, yet
// still captures correctly by ID with:
//
//   screencapture -x -o -l "$WID" out.png

import CoreGraphics
import Foundation

struct Window {
    let id: CGWindowID
    let owner: String
    let name: String
    let bounds: CGRect
    let onScreen: Bool
    let layer: Int
}

func windows(ownedBy owner: String) -> [Window] {
    let options: CGWindowListOption = [.optionAll]
    guard let raw = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] else {
        return []
    }

    return raw.compactMap { entry in
        guard
            let id = entry[kCGWindowNumber as String] as? CGWindowID,
            let ownerName = entry[kCGWindowOwnerName as String] as? String,
            ownerName == owner
        else { return nil }

        let name = entry[kCGWindowName as String] as? String ?? ""
        let layer = entry[kCGWindowLayer as String] as? Int ?? 0
        let onScreen = (entry[kCGWindowIsOnscreen as String] as? Bool) ?? false

        var bounds = CGRect.zero
        if let dictionary = entry[kCGWindowBounds as String] {
            bounds = CGRect(dictionaryRepresentation: dictionary as! CFDictionary) ?? .zero
        }

        return Window(id: id, owner: ownerName, name: name, bounds: bounds, onScreen: onScreen, layer: layer)
    }
}

let arguments = CommandLine.arguments
guard arguments.count >= 2 else {
    FileHandle.standardError.write(Data("usage: window-id <ownerName> [windowName|--list]\n".utf8))
    exit(2)
}

let owner = arguments[1]
let filter = arguments.count >= 3 ? arguments[2] : nil

// Layer 0 is the normal window layer. Anything above it is a panel, menu, or
// status item and is almost never the window under verification.
let candidates = windows(ownedBy: owner).filter { $0.layer == 0 }

if filter == "--list" {
    for window in candidates {
        let flag = window.onScreen ? "onscreen" : "offscreen"
        let size = "\(Int(window.bounds.width))x\(Int(window.bounds.height))"
        print("id=\(window.id) name=\"\(window.name)\" \(size) \(flag)")
    }
    exit(candidates.isEmpty ? 1 : 0)
}

let matches = filter.map { wanted in candidates.filter { $0.name == wanted } } ?? candidates

guard let window = matches.first else {
    FileHandle.standardError.write(Data("no window found for owner \(owner)\n".utf8))
    exit(1)
}

print(window.id)
