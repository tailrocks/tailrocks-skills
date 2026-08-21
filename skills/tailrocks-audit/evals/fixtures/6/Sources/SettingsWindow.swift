import SwiftUI

enum SettingsPane: String, CaseIterable, Identifiable, Hashable {
    case general, accounts, advanced

    var id: Self { self }

    var title: String {
        switch self {
        case .general: "General"
        case .accounts: "Accounts"
        case .advanced: "Advanced"
        }
    }

    var symbol: String {
        switch self {
        case .general: "gearshape"
        case .accounts: "person.crop.circle"
        case .advanced: "slider.horizontal.3"
        }
    }
}

struct SettingsWindow: View {
    @State private var selection: SettingsPane = .general

    var body: some View {
        NavigationSplitView {
            List(SettingsPane.allCases, selection: $selection) { pane in
                Label(pane.title, systemImage: pane.symbol)
            }
        } detail: {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    header
                    PaneForm(pane: selection)
                }
                .padding(20)
            }
        }
    }

    // Hand-rolled imitation of the system material: a translucent fill plus a
    // blur, drawn behind the header instead of using the platform's own
    // container. It does not react to what scrolls under it and does not
    // change with the accessibility reduce-transparency setting.
    private var header: some View {
        Text(selection.title)
            .font(.title2)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(12)
            .background(
                Color.white.opacity(0.18)
                    .background(.ultraThinMaterial)
                    .blur(radius: 12)
            )
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

private struct PaneForm: View {
    let pane: SettingsPane

    var body: some View {
        Form {
            Text("Settings for \(pane.title)")
        }
    }
}
