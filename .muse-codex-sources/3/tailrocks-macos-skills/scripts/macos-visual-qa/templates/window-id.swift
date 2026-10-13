import AppKit
import CoreGraphics
import Foundation

struct Window {
    let id: CGWindowID
    let pid: pid_t
    let owner: String
    let name: String
    let bounds: CGRect
    let onScreen: Bool
}

func fail(_ message: String, _ code: Int32 = 1) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8))
    exit(code)
}

let arguments = CommandLine.arguments
guard arguments.count >= 2, let pid = Int32(arguments[1]), pid > 1 else {
    fail("usage: window-id <pid> [exact-window-title] [--json|--list]", 2)
}
let jsonMode = arguments.contains("--json")
let listMode = arguments.contains("--list")
let title = arguments.dropFirst(2).first { !$0.hasPrefix("--") }

guard let raw = CGWindowListCopyWindowInfo(.optionAll, kCGNullWindowID) as? [[String: Any]] else {
    fail("window server unavailable", 3)
}
let owned = raw.compactMap { entry -> Window? in
    guard let ownerNumber = entry[kCGWindowOwnerPID as String] as? NSNumber,
          ownerNumber.int32Value == pid,
          let idNumber = entry[kCGWindowNumber as String] as? NSNumber,
          (entry[kCGWindowLayer as String] as? NSNumber)?.intValue ?? 0 == 0
    else { return nil }
    let ownerPID = ownerNumber.int32Value
    let id = CGWindowID(idNumber.uint32Value)
    var bounds = CGRect.zero
    if let dictionary = entry[kCGWindowBounds as String] as? NSDictionary {
        bounds = CGRect(dictionaryRepresentation: dictionary) ?? .zero
    }
    guard bounds.width >= 64, bounds.height >= 64 else { return nil }
    return Window(
        id: id,
        pid: ownerPID,
        owner: entry[kCGWindowOwnerName as String] as? String ?? "",
        name: entry[kCGWindowName as String] as? String ?? "",
        bounds: bounds,
        onScreen: entry[kCGWindowIsOnscreen as String] as? Bool ?? false
    )
}.sorted { $0.id < $1.id }

let matches = title.map { wanted in owned.filter { $0.name == wanted } } ?? owned
if listMode {
    for window in matches {
        print("id=\(window.id) pid=\(window.pid) title=\(window.name.debugDescription) \(Int(window.bounds.width))x\(Int(window.bounds.height))")
    }
    exit(matches.isEmpty ? 1 : 0)
}
guard matches.count == 1 else {
    if matches.isEmpty { fail("no normal window matched exact pid \(pid)") }
    fail("ambiguous windows for exact pid \(pid): \(matches.map { String($0.id) }.joined(separator: ","))", 4)
}
let window = matches[0]
if jsonMode {
    let object: [String: Any] = [
        "windowID": Int(window.id), "pid": Int(window.pid), "owner": window.owner,
        "windowTitle": window.name,
        "frameSize": ["width": window.bounds.width, "height": window.bounds.height],
        "onScreen": window.onScreen,
    ]
    let data = try JSONSerialization.data(withJSONObject: object, options: [.prettyPrinted, .sortedKeys])
    FileHandle.standardOutput.write(data)
    FileHandle.standardOutput.write(Data("\n".utf8))
} else { print(window.id) }
