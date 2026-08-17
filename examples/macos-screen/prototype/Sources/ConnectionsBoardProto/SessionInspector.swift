// Session detail inspector: metadata, statement, timings (experience brief,
// information hierarchy). Native .inspector material — never customized.

import SwiftUI

struct SessionInspector: View {
    @Bindable var model: BoardModel

    var body: some View {
        if let session = model.selectedSession {
            Form {
                Section("Session") {
                    LabeledContent("Name", value: session.name)
                    LabeledContent("PID", value: String(session.id))
                    LabeledContent("User", value: session.user)
                    LabeledContent("Client", value: session.client)
                    LabeledContent("State") {
                        SessionStateBadge(state: session.state)
                    }
                }
                Section("Statement") {
                    if let statement = session.statement {
                        Text(statement)
                            .font(.callout.monospaced())
                            .textSelection(.enabled)
                    } else {
                        Text("No current statement")
                            .foregroundStyle(.secondary)
                    }
                }
                Section("Timings") {
                    LabeledContent("Started", value: model.startedText(for: session))
                    LabeledContent("Elapsed", value: model.durationText(for: session))
                }
            }
            .formStyle(.grouped)
            .accessibilityIdentifier("session.inspector")
        } else {
            ContentUnavailableView {
                Label("No Session Selected", systemImage: "list.bullet.rectangle")
            } description: {
                Text("Select a session to inspect it.")
            }
            .accessibilityIdentifier("session.inspector.empty")
        }
    }
}
