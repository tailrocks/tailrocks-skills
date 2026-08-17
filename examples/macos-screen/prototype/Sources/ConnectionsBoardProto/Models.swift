// View-model shapes for the ConnectionsBoard sessions workspace.
// Production code: the real app's data layer produces these same shapes.

import Foundation
import Observation

/// Session health.
///
/// Per the experience brief's normal state (mixed healthy/slow/blocked) plus
/// idle (no current statement). State is always carried by symbol + text,
/// never color alone.
enum SessionState: String, Sendable {
    case healthy
    case slow
    case blocked
    case idle

    var label: String {
        switch self {
        case .healthy: "Healthy"
        case .slow: "Slow"
        case .blocked: "Blocked"
        case .idle: "Idle"
        }
    }

    var symbol: String {
        switch self {
        case .healthy: "checkmark.circle.fill"
        case .slow: "tortoise.fill"
        case .blocked: "hand.raised.fill"
        case .idle: "moon.zzz.fill"
        }
    }
}

/// One database connection shown in the sidebar.
struct ConnectionInfo: Identifiable, Sendable {
    let id: String
    let name: String
    let symbol: String
}

/// One live session row.
struct SessionInfo: Identifiable, Sendable {
    /// Backend process ID; stable row identity.
    let id: Int
    let name: String
    let user: String
    let client: String
    let state: SessionState
    let startedAt: Date
    /// `nil` for idle sessions (brief: missing values).
    let statement: String?
}

/// Which top-level state the workspace renders (brief: States).
enum BoardPhase: Sendable {
    case empty
    case normal
    case error
}

/// A fixture scenario: everything the workspace renders, with a frozen clock.
struct Scenario: Sendable {
    let name: String
    /// The frozen `now`; every derived timestamp renders from it.
    let now: Date
    let phase: BoardPhase
    let connections: [ConnectionInfo]
    let sessions: [SessionInfo]
    let selectedConnectionID: String?
    let selectedSessionID: Int?
    let feedPaused: Bool
    let inspectorPresented: Bool
    /// Read-only role hides Terminate (brief: permission denied).
    let readOnly: Bool
}

/// Observable UI state over a scenario.
///
/// The real app replaces the fixture initializer with its live data source;
/// the shape stays.
@MainActor
@Observable
final class BoardModel {
    let scenarioName: String
    let now: Date
    let connections: [ConnectionInfo]
    let sessions: [SessionInfo]
    let readOnly: Bool

    var phase: BoardPhase
    var selectedConnectionID: String?
    var selectedSessionID: Int?
    var feedPaused: Bool
    var inspectorPresented: Bool
    var terminateRequested = false

    init(scenario: Scenario) {
        scenarioName = scenario.name
        now = scenario.now
        connections = scenario.connections
        sessions = scenario.sessions
        readOnly = scenario.readOnly
        phase = scenario.phase
        selectedConnectionID = scenario.selectedConnectionID
        selectedSessionID = scenario.selectedSessionID
        feedPaused = scenario.feedPaused
        inspectorPresented = scenario.inspectorPresented
    }

    var selectedSession: SessionInfo? {
        sessions.first { $0.id == selectedSessionID }
    }

    /// The floating cluster exists only while the feed is live
    /// (contract: hidden on error and empty).
    var clusterVisible: Bool { phase == .normal }

    /// Elapsed time from the frozen clock; locale-sensitive numeric pattern.
    func durationText(for session: SessionInfo) -> String {
        let seconds = max(0, Int(now.timeIntervalSince(session.startedAt)))
        return Duration.seconds(seconds).formatted(.time(pattern: .hourMinuteSecond))
    }

    /// Deterministic absolute timestamp for the inspector's timings section.
    func startedText(for session: SessionInfo) -> String {
        Self.timestampFormatter.string(from: session.startedAt)
    }

    func togglePause() { feedPaused.toggle() }

    /// Fixture data is static; refresh and clear are wired for menu and
    /// toolbar completeness and become real operations in the app.
    func refresh() {}

    func clearFeed() {}

    func retry() {}

    func requestTerminate() {
        guard selectedSession != nil, !readOnly else { return }
        terminateRequested = true
    }

    /// Pinned to a fixed locale and zone so captures reproduce anywhere;
    /// the real app formats in the user's locale per the brief.
    private static let timestampFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(identifier: "UTC")
        formatter.dateFormat = "yyyy-MM-dd HH:mm:ss 'UTC'"
        return formatter
    }()
}
