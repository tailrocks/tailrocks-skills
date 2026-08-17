// LiveFeedCluster — the one CUSTOM region, per its contract:
// functional control layer floating above content; Liquid Glass
// Glass.regular, untinted, two surfaces in one GlassEffectContainer
// (container spacing 20, 10pt between surfaces, capsule per control);
// Reduce Transparency substitutes Glass.identity plus an opaque
// .regularMaterial-backed capsule, keyed off accessibilityReduceTransparency.

import SwiftUI

struct LiveFeedCluster: View {
    @Bindable var model: BoardModel
    @Environment(\.accessibilityReduceTransparency) private var systemReduceTransparency
    @Environment(\.accessibilityReduceMotion) private var systemReduceMotion
    @Environment(\.protoReduce) private var protoReduce

    // The app's own accessibility hooks; the launch contract's --tr-reduce
    // previews the same substitution per process.
    private var reduceTransparency: Bool {
        systemReduceTransparency || protoReduce.transparency
    }

    private var reduceMotion: Bool {
        systemReduceMotion || protoReduce.motion
    }

    private var glass: Glass {
        reduceTransparency ? .identity : .regular
    }

    var body: some View {
        GlassEffectContainer(spacing: 20) {
            HStack(spacing: 10) {
                pauseControl
                clearControl
            }
        }
    }

    private var pauseControl: some View {
        Button {
            model.togglePause()
        } label: {
            Label(
                model.feedPaused ? "Resume" : "Pause",
                systemImage: model.feedPaused ? "play.fill" : "pause.fill"
            )
            .labelStyle(.titleAndIcon)
            // Reduce Motion: symbol crossfade only (contract: Motion).
            .contentTransition(reduceMotion ? .opacity : .symbolEffect(.replace))
            .padding(.horizontal, 14)
            .frame(minHeight: 28)
        }
        .buttonStyle(.plain)
        .glassEffect(glass)
        .background {
            if reduceTransparency {
                Capsule().fill(.regularMaterial)
            }
        }
        .accessibilityLabel(model.feedPaused ? "Resume live feed" : "Pause live feed")
        .accessibilityIdentifier("cluster.pause")
    }

    private var clearControl: some View {
        Button {
            model.clearFeed()
        } label: {
            Label("Clear", systemImage: "trash")
                .labelStyle(.iconOnly)
                .padding(.horizontal, 10)
                .frame(minWidth: 28, minHeight: 28)
        }
        .buttonStyle(.plain)
        .glassEffect(glass)
        .background {
            if reduceTransparency {
                Capsule().fill(.regularMaterial)
            }
        }
        .accessibilityLabel("Clear feed")
        .accessibilityIdentifier("cluster.clear")
    }
}
