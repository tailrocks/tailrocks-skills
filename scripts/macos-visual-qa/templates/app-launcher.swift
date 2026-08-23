import AppKit
import Foundation

func fail(_ message: String, _ code: Int32 = 1) -> Never {
    FileHandle.standardError.write(Data((message + "\n").utf8)); exit(code)
}
func canonical(_ value: String) -> String {
    URL(fileURLWithPath: value).resolvingSymlinksInPath().standardizedFileURL.path
}
func token(_ app: NSRunningApplication) -> Int64? {
    app.launchDate.map { Int64(($0.timeIntervalSinceReferenceDate * 1_000_000).rounded()) }
}
func owners(_ executable: String) -> [NSRunningApplication] {
    NSWorkspace.shared.runningApplications.filter {
        !$0.isTerminated && $0.executableURL.map { canonical($0.path) == executable } == true
    }
}
func stopOwned(_ app: NSRunningApplication) {
    _ = app.terminate()
    let deadline = Date().addingTimeInterval(2)
    while !app.isTerminated && Date() < deadline { RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.05)) }
    if !app.isTerminated { _ = app.forceTerminate() }
}

let args = CommandLine.arguments
guard args.count >= 3 else { fail("usage: app-launcher APP EXEC [ARG...]", 2) }
let appURL = URL(fileURLWithPath: canonical(args[1])), executable = canonical(args[2])
guard owners(executable).isEmpty else { fail("preexisting exact-owned process", 4) }
let configuration = NSWorkspace.OpenConfiguration()
configuration.arguments = Array(args.dropFirst(3))
configuration.activates = false
configuration.createsNewApplicationInstance = true
var launched: NSRunningApplication?, launchError: Error?, complete = false
NSWorkspace.shared.openApplication(at: appURL, configuration: configuration) { application, error in
    launched = application; launchError = error; complete = true
}
let deadline = Date().addingTimeInterval(10)
while !complete && Date() < deadline { RunLoop.current.run(mode: .default, before: Date().addingTimeInterval(0.05)) }
guard complete else { fail("launch timed out") }
guard let application = launched else { fail(launchError.map(String.init(describing:)) ?? "launch returned no application") }
guard launchError == nil else {
    stopOwned(application); fail(String(describing: launchError!))
}
guard !application.isTerminated,
      application.executableURL.map({ canonical($0.path) == executable }) == true,
      let identity = token(application)
else {
    stopOwned(application); fail("launch returned invalid application identity")
}
let exact = owners(executable)
guard exact.count == 1, exact[0].processIdentifier == application.processIdentifier else {
    stopOwned(application); fail("owned app launch became ambiguous", 4)
}
print("\(application.processIdentifier)|\(identity)")
