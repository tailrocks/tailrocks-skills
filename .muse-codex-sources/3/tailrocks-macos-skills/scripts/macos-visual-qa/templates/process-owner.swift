import AppKit
import Foundation

func fail(_ message: String, _ code: Int32 = 1) -> Never { FileHandle.standardError.write(Data((message + "\n").utf8)); exit(code) }
func canonical(_ value: String) -> String { URL(fileURLWithPath: value).resolvingSymlinksInPath().standardizedFileURL.path }
func identity(_ app: NSRunningApplication) -> Int64? { app.launchDate.map { Int64(($0.timeIntervalSinceReferenceDate * 1_000_000).rounded()) } }
func exact(_ executable: String, _ pid: pid_t, _ token: Int64) -> NSRunningApplication? {
    guard let app = NSRunningApplication(processIdentifier: pid), !app.isTerminated,
          let actual = app.executableURL, canonical(actual.path) == executable, identity(app) == token else { return nil }
    return app
}

let args = CommandLine.arguments
guard args.count >= 3, ["list", "request-activation", "terminate", "force-terminate", "verify"].contains(args[1]) else {
    fail("usage: process-owner list EXEC | process-owner request-activation|terminate|force-terminate|verify EXEC PID TOKEN", 2)
}
let executable = canonical(args[2])
guard executable.hasPrefix("/"), FileManager.default.isExecutableFile(atPath: executable) else { fail("invalid executable", 2) }
if args[1] == "list" {
    let matches = NSWorkspace.shared.runningApplications.compactMap { app -> (pid_t, Int64)? in
        guard !app.isTerminated, let actual = app.executableURL, canonical(actual.path) == executable,
              let token = identity(app) else { return nil }
        return (app.processIdentifier, token)
    }.sorted { $0.0 < $1.0 }
    for (pid, token) in matches { print("\(pid)|\(token)") }
    exit(0)
}
guard args.count == 5, let pid = Int32(args[3]), pid > 1, let token = Int64(args[4]),
      let app = exact(executable, pid, token) else { fail("process identity changed", 4) }
switch args[1] {
case "verify": break
case "request-activation":
    let requested = app.isActive || app.activate(options: [.activateAllWindows])
    let data = try! JSONSerialization.data(withJSONObject: ["requested": requested, "active": app.isActive], options: [.sortedKeys])
    FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data("\n".utf8))
case "terminate": guard app.terminate() else { fail("termination refused") }
case "force-terminate": guard app.forceTerminate() else { fail("force termination refused") }
default: fail("unmatched action", 2)
}
