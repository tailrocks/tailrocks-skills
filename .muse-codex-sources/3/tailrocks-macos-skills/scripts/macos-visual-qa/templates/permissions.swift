import ApplicationServices
import CoreGraphics
import CoreServices
import Foundation

func fail(_ permission: String, _ detail: String, _ code: Int32 = 3) -> Never {
    let data = try! JSONSerialization.data(withJSONObject: [
        "schema": "tailrocks.macos-permission/v1", "permission": permission,
        "outcome": "blocked", "detail": detail,
    ], options: [.sortedKeys])
    FileHandle.standardError.write(data); FileHandle.standardError.write(Data("\n".utf8)); exit(code)
}
func pass(_ permission: String) -> Never {
    let data = try! JSONSerialization.data(withJSONObject: [
        "schema": "tailrocks.macos-permission/v1", "permission": permission,
        "outcome": "granted", "detail": "preflight passed without prompting",
    ], options: [.sortedKeys])
    FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data("\n".utf8)); exit(0)
}

let args = CommandLine.arguments
guard args.count == 2 else { fail("unknown", "usage: permissions session|screen-recording|accessibility|automation-system-events", 2) }
switch args[1] {
case "session":
    guard CGSessionCopyCurrentDictionary() != nil else { fail("interactive-session", "interactive graphical session missing") }
    pass("interactive-session")
case "screen-recording":
    guard CGPreflightScreenCaptureAccess() else { fail("screen-recording", "Screen Recording permission missing") }
    pass("screen-recording")
case "accessibility":
    guard AXIsProcessTrusted() else { fail("accessibility", "Accessibility permission missing") }
    pass("accessibility")
case "automation-system-events":
    var target = AEAddressDesc()
    let identifier = Data("com.apple.systemevents".utf8)
    let create = identifier.withUnsafeBytes { bytes in
        AECreateDesc(DescType(typeApplicationBundleID), bytes.baseAddress, identifier.count, &target)
    }
    guard create == noErr else { fail("automation-system-events", "System Events identity could not be constructed") }
    defer { AEDisposeDesc(&target) }
    let status = AEDeterminePermissionToAutomateTarget(&target, AEEventClass(typeWildCard), AEEventID(typeWildCard), false)
    guard status == noErr else { fail("automation-system-events", "Automation permission for System Events missing") }
    pass("automation-system-events")
default: fail("unknown", "unknown permission selector", 2)
}
