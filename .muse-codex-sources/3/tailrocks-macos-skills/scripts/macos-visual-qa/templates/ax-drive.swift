import ApplicationServices
import Foundation

func fail(_ message: String, _ code: Int32 = 1) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8)); exit(code)
}
guard AXIsProcessTrusted() else { fail("Accessibility permission missing", 3) }
let args = CommandLine.arguments
guard args.count == 4, let pid = Int32(args[1]), pid > 1, ["find", "press", "read"].contains(args[2]) else {
    fail("usage: ax-drive <exact-pid> find|press|read <AXIdentifier>", 2)
}

func attribute(_ element: AXUIElement, _ name: CFString) -> CFTypeRef? {
    var value: CFTypeRef?
    return AXUIElementCopyAttributeValue(element, name, &value) == .success ? value : nil
}

let root = AXUIElementCreateApplication(pid)
var queue: [(AXUIElement, Int)] = [(root, 0)]
var cursor = 0
var visited = 0
var matches: [AXUIElement] = []
while cursor < queue.count {
    let (item, depth) = queue[cursor]
    cursor += 1
    visited += 1
    if visited > 10_000 { fail("accessibility tree exceeded 10000 nodes", 4) }
    if (attribute(item, kAXIdentifierAttribute as CFString) as? String) == args[3] { matches.append(item) }
    if depth < 64, let children = attribute(item, kAXChildrenAttribute as CFString) as? [AXUIElement] {
        queue.append(contentsOf: children.map { ($0, depth + 1) })
    }
}
guard matches.count == 1 else {
    fail(matches.isEmpty ? "identifier not found" : "identifier is ambiguous: \(matches.count) matches", matches.isEmpty ? 1 : 4)
}
let element = matches[0]
switch args[2] {
case "find": print(args[3])
case "press":
    guard AXUIElementPerformAction(element, kAXPressAction as CFString) == .success else { fail("press failed") }
case "read":
    guard let value = attribute(element, kAXValueAttribute as CFString) else { fail("value unavailable") }
    print(value)
default: fail("unmatched action", 2)
}
