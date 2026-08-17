// The launch-contract harness. Copy into Sources/<Feature>Proto/ and keep
// the contract intact: --tr-scenario, --tr-appearance, --tr-window,
// --tr-reduce, --tr-backdrop. Feature code supplies `Fixtures.scenario(_:)`
// and the root view; nothing here is feature-specific.
//
// Compile-required delta from the template (Swift 6.3.3 / macOS 26.5 SDK):
// the readiness poll runs as a MainActor task loop instead of a
// `Timer.scheduledTimer` block — the SDK marks every AppKit property the
// poll touches main-actor-isolated, and a `@Sendable` timer closure cannot
// carry them. Cadence (0.4s), the two-stable-ticks rule, and the TR-READY
// line are unchanged.
//
// Two defect fixes (verified on macOS 26.5, routed back to the template):
// 1. The poll's window match requires `level == .normal`. The backdrop
//    window is visible at level normal − 1, and the unfiltered
//    `first(where: isVisible)` matched it — clamping the backdrop to the
//    --tr-window size and printing the backdrop's number as TR-READY.
// 2. The backdrop is created on the poll tick that first finds the main
//    window, not in applicationDidFinishLaunching. When the delegate
//    creates a window before SwiftUI's scene setup, SwiftUI never creates
//    the WindowGroup's initial window (observed across repeated launches;
//    without the early backdrop the window appears on activation). The
//    contract's ordering holds: the backdrop still exists before TR-READY.

import AppKit
import SwiftUI

struct ProtoConfig {
    var scenario = "default"
    var appearance: NSAppearance.Name?
    var window: CGSize?
    var reduceTransparency = false
    var reduceMotion = false
    var backdrop: NSColor?

    static func parse(_ args: [String]) -> ProtoConfig {
        var config = ProtoConfig()
        func value(after flag: String) -> String? {
            guard let index = args.firstIndex(of: flag), args.indices.contains(index + 1)
            else { return nil }
            return args[index + 1]
        }
        if let name = value(after: "--tr-scenario") { config.scenario = name }
        switch value(after: "--tr-appearance") {
        case "light": config.appearance = .aqua
        case "dark": config.appearance = .darkAqua
        case .some(let other): fatalError("unknown --tr-appearance \(other)")
        case nil: break
        }
        if let size = value(after: "--tr-window") {
            let parts = size.split(separator: "x").compactMap { Double($0) }
            guard parts.count == 2 else { fatalError("--tr-window expects WxH, got \(size)") }
            config.window = CGSize(width: parts[0], height: parts[1])
        }
        if let list = value(after: "--tr-reduce") {
            for item in list.split(separator: ",") {
                switch item {
                case "transparency": config.reduceTransparency = true
                case "motion": config.reduceMotion = true
                default: fatalError("unknown --tr-reduce item \(item)")
                }
            }
        }
        switch value(after: "--tr-backdrop") {
        case "standard":
            config.backdrop = NSColor(srgbRed: 0.42, green: 0.45, blue: 0.50, alpha: 1)
        case .some(let hex):
            config.backdrop = NSColor(hex: hex) ?? { fatalError("bad --tr-backdrop \(hex)") }()
        case nil: break
        }
        return config
    }
}

final class ProtoDelegate: NSObject, NSApplicationDelegate {
    let config: ProtoConfig
    private var backdrop: NSWindow?
    private var lastFrame: CGRect = .zero
    private var stableTicks = 0

    init(config: ProtoConfig) { self.config = config }

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Defaults leak across runs (table column autosave, restoration);
        // a deterministic prototype starts clean every launch.
        if let bundleID = Bundle.main.bundleIdentifier {
            UserDefaults.standard.removePersistentDomain(forName: bundleID)
        }
        if let name = config.appearance { NSApp.appearance = NSAppearance(named: name) }
        // Announce readiness only after geometry holds still twice — the
        // capture harness waits for this line.
        Task { @MainActor [weak self] in
            while true {
                try? await Task.sleep(for: .milliseconds(400))
                guard let self else { return }
                guard
                    let window = NSApp.windows.first(where: {
                        $0.isVisible && $0.level == .normal
                    })
                else { continue }
                if let size = self.config.window, window.contentLayoutRect.size != size {
                    window.setContentSize(size)
                    window.isRestorable = false
                }
                if let color = self.config.backdrop, self.backdrop == nil {
                    let screen = NSScreen.main!.frame
                    let backdrop = NSWindow(
                        contentRect: screen, styleMask: .borderless, backing: .buffered,
                        defer: false)
                    backdrop.backgroundColor = color
                    backdrop.level = NSWindow.Level(rawValue: NSWindow.Level.normal.rawValue - 1)
                    backdrop.collectionBehavior = [.canJoinAllSpaces, .stationary]
                    backdrop.orderFrontRegardless()
                    self.backdrop = backdrop
                }
                NSApp.activate(ignoringOtherApps: true)
                if window.frame == self.lastFrame {
                    self.stableTicks += 1
                    if self.stableTicks == 2 {
                        print("TR-READY \(window.windowNumber)")
                        fflush(stdout)
                        return
                    }
                } else {
                    self.stableTicks = 0
                    self.lastFrame = window.frame
                }
            }
        }
    }
}

extension NSColor {
    convenience init?(hex: String) {
        var value: UInt64 = 0
        guard
            Scanner(string: hex.replacingOccurrences(of: "#", with: ""))
                .scanHexInt64(&value)
        else { return nil }
        self.init(
            srgbRed: CGFloat((value >> 16) & 0xFF) / 255,
            green: CGFloat((value >> 8) & 0xFF) / 255,
            blue: CGFloat(value & 0xFF) / 255,
            alpha: 1)
    }
}
