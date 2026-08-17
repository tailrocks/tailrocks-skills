// Prototype entry point: applies the launch contract (ProtoMain.swift),
// resolves the scenario, and hosts the production view layer.

import AppKit
import SwiftUI

enum Proto {
    /// Parsed once at launch, immutable afterwards.
    static let config = ProtoConfig.parse(Array(CommandLine.arguments))
}

/// Adaptor shell around the template harness.
///
/// `ProtoDelegate` stays as shipped; this wrapper only satisfies
/// `NSApplicationDelegateAdaptor`'s parameterless-init requirement.
final class AppDelegate: NSObject, NSApplicationDelegate {
    private let harness = ProtoDelegate(config: Proto.config)

    func applicationDidFinishLaunching(_ notification: Notification) {
        harness.applicationDidFinishLaunching(notification)
    }
}

/// Per-process reduction overrides from `--tr-reduce`; views OR these with
/// the real accessibility settings.
struct ReduceOverrides: Sendable {
    var transparency = false
    var motion = false
}

extension EnvironmentValues {
    @Entry var protoReduce = ReduceOverrides()
}

@main
struct ConnectionsBoardProtoApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var delegate
    @State private var model: BoardModel

    init() {
        guard let scenario = Fixtures.scenario(Proto.config.scenario) else {
            FileHandle.standardError.write(
                Data("unknown --tr-scenario '\(Proto.config.scenario)'\n".utf8))
            exit(64)
        }
        _model = State(initialValue: BoardModel(scenario: scenario))
    }

    var body: some Scene {
        WindowGroup("ConnectionsBoard") {
            ConnectionsBoardView(model: model)
                .environment(
                    \.protoReduce,
                    ReduceOverrides(
                        transparency: Proto.config.reduceTransparency,
                        motion: Proto.config.reduceMotion))
        }
        .defaultSize(width: 1100, height: 700)
        .commands {
            BoardCommands(model: model)
        }
    }
}

/// Menu commands from the brief's action table; the menu owns the shortcuts.
struct BoardCommands: Commands {
    let model: BoardModel

    var body: some Commands {
        CommandGroup(after: .sidebar) {
            Divider()
            Button("Refresh Sessions") { model.refresh() }
                .keyboardShortcut("r", modifiers: .command)
            Button(model.inspectorPresented ? "Hide Inspector" : "Show Inspector") {
                model.inspectorPresented.toggle()
            }
            .keyboardShortcut("i", modifiers: [.command, .option])
            Divider()
            Button(model.feedPaused ? "Resume Live Feed" : "Pause Live Feed") {
                model.togglePause()
            }
            .keyboardShortcut("p", modifiers: .command)
            .disabled(!model.clusterVisible)
            Button("Clear Feed") { model.clearFeed() }
                .disabled(!model.clusterVisible)
        }
        CommandMenu("Session") {
            Button("Terminate…") { model.requestTerminate() }
                .keyboardShortcut(.delete, modifiers: .command)
                .disabled(model.selectedSession == nil || model.readOnly)
        }
    }
}
