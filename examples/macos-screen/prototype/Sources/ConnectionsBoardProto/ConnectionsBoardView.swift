// The ConnectionsBoard sessions workspace, per the approved component map:
// NavigationSplitView(sidebar: List, detail: Table + .inspector), system
// toolbar, floating LiveFeedCluster over the table. No added cards or
// containers; native regions keep system materials untouched.

import SwiftUI

struct ConnectionsBoardView: View {
    @Bindable var model: BoardModel

    var body: some View {
        NavigationSplitView {
            List(model.connections, selection: $model.selectedConnectionID) { connection in
                Label(connection.name, systemImage: connection.symbol)
                    .accessibilityIdentifier("sidebar.connection.\(connection.id)")
            }
            .navigationSplitViewColumnWidth(min: 220, ideal: 240, max: 280)
            .accessibilityIdentifier("sidebar.connections")
        } detail: {
            detail
                // The toolbar persists across phases: Refresh is a constant
                // action in the brief's action table, not a table feature.
                .toolbar {
                    ToolbarItem {
                        Button("Inspector", systemImage: "sidebar.right") {
                            model.inspectorPresented.toggle()
                        }
                        .disabled(model.phase != .normal)
                        .accessibilityIdentifier("toolbar.inspector")
                    }
                    ToolbarItem(placement: .primaryAction) {
                        Button("Refresh Sessions", systemImage: "arrow.clockwise") {
                            model.refresh()
                        }
                        .accessibilityIdentifier("toolbar.refresh")
                    }
                }
                .confirmationDialog(
                    "Terminate this session?",
                    isPresented: $model.terminateRequested
                ) {
                    Button("Terminate", role: .destructive) {}
                    Button("Cancel", role: .cancel) {}
                } message: {
                    if let session = model.selectedSession {
                        Text(
                            "Session \(session.name) (\(String(session.id))) will be disconnected."
                        )
                    }
                }
        }
    }

    @ViewBuilder private var detail: some View {
        switch model.phase {
        case .empty:
            ContentUnavailableView {
                Label("No Connection Selected", systemImage: "cylinder.split.1x2")
            } description: {
                Text("Select a connection in the sidebar to monitor its sessions.")
            }
            .accessibilityIdentifier("board.empty")
        case .error:
            ContentUnavailableView {
                Label("Connection Unreachable", systemImage: "exclamationmark.triangle")
            } description: {
                Text("The selected connection did not respond.")
            } actions: {
                Button("Retry") { model.retry() }
                    .accessibilityIdentifier("board.retry")
            }
            .accessibilityIdentifier("board.error")
        case .normal:
            sessionsTable
        }
    }

    private var sessionsTable: some View {
        Table(model.sessions, selection: $model.selectedSessionID) {
            TableColumn("State") { (session: SessionInfo) in
                SessionStateBadge(state: session.state)
            }
            .width(min: 80, ideal: 96)

            TableColumn("Session") { (session: SessionInfo) in
                Text(session.name)
                    .accessibilityLabel("\(session.name), \(session.state.label)")
            }
            .width(min: 110, ideal: 140)

            TableColumn("User") { (session: SessionInfo) in
                Text(session.user)
            }
            .width(min: 80, ideal: 110)

            TableColumn("Duration") { (session: SessionInfo) in
                Text(model.durationText(for: session))
                    .monospacedDigit()
            }
            .width(min: 70, ideal: 84)

            TableColumn("Statement") { (session: SessionInfo) in
                Text(session.statement ?? "—")
                    .lineLimit(1)
                    .truncationMode(.tail)
                    .foregroundStyle(session.statement == nil ? .secondary : .primary)
            }
        }
        .accessibilityIdentifier("sessions.table")
        .contextMenu(forSelectionType: SessionInfo.ID.self) { ids in
            Button("Inspect") {
                model.selectedSessionID = ids.first
                model.inspectorPresented = true
            }
            if !model.readOnly {
                Button("Terminate…", role: .destructive) {
                    model.selectedSessionID = ids.first
                    model.requestTerminate()
                }
            }
        }
        .overlay(alignment: .bottomTrailing) {
            if model.clusterVisible {
                LiveFeedCluster(model: model)
                    .padding(16)
            }
        }
        .inspector(isPresented: $model.inspectorPresented) {
            SessionInspector(model: model)
                .inspectorColumnWidth(min: 260, ideal: 280, max: 320)
        }
    }
}

/// Session state cell: symbol + text + semantic color — never color alone
/// (brief: color independence, Increase Contrast).
struct SessionStateBadge: View {
    let state: SessionState

    var body: some View {
        Label {
            Text(state.label)
        } icon: {
            Image(systemName: state.symbol)
                .foregroundStyle(tint)
        }
        .accessibilityLabel(state.label)
    }

    private var tint: Color {
        switch state {
        case .healthy: .green
        case .slow: .orange
        case .blocked: .red
        case .idle: .secondary
        }
    }
}
