import AppKit

final class AppDelegate: NSObject, NSApplicationDelegate {
    private var windows: [NSWindow] = []

    func applicationDidFinishLaunching(_ notification: Notification) {
        let count = CommandLine.arguments.contains("--two-windows") ? 2 : 1
        for index in 0..<count {
            let window = NSWindow(
                contentRect: NSRect(x: 160 + index * 40, y: 160 + index * 40, width: 480, height: 320),
                styleMask: [.titled, .closable, .miniaturizable, .resizable],
                backing: .buffered,
                defer: false
            )
            window.title = "Tailrocks Visual QA Fixture"
            let button = NSButton(title: "Fixture Action", target: nil, action: nil)
            button.setAccessibilityIdentifier("fixture-action")
            window.contentView = button
            window.makeKeyAndOrderFront(nil)
            windows.append(window)
        }
        NSApp.activate(ignoringOtherApps: true)
        print("TR-READY")
        fflush(stdout)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
