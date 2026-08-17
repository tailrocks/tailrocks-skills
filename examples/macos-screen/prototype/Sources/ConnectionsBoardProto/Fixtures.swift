// Fixture scenarios realized from the experience brief's States section.
// Frozen clock: 2026-08-11 14:32:05 UTC — every duration derives from it.
//
// Design finding (routed to tailrocks-macos-design, recorded in SIGNOFF.md):
// the approved package specifies states but ships no concrete fixture
// dataset; the values below are mechanical realizations of the named states
// and are ratified at the blessing gate, not invented design.

import Foundation

enum Fixtures {
    /// 2026-08-11T14:32:05Z, matching the design approval date.
    static let frozenNow = Date(timeIntervalSince1970: 1_786_458_725)

    /// Resolves a scenario by name; `nil` means unknown, and the caller
    /// fails loudly at launch (launch contract: never fall back silently).
    static func scenario(_ name: String) -> Scenario? {
        switch name {
        case "default": defaultScenario(named: "default", paused: false)
        case "paused": defaultScenario(named: "paused", paused: true)
        case "empty": emptyScenario()
        case "error": errorScenario()
        default: nil
        }
    }

    static let connections: [ConnectionInfo] = [
        ConnectionInfo(
            id: "prod-payments-primary",
            name: "prod-payments (primary)",
            symbol: "cylinder.split.1x2.fill"),
        ConnectionInfo(
            id: "prod-payments-replica",
            name: "prod-payments (replica)",
            symbol: "cylinder.split.1x2"),
        ConnectionInfo(
            id: "staging-payments",
            name: "staging-payments",
            symbol: "cylinder"),
    ]

    /// Normal state: mixed healthy/slow/blocked, one idle session with no
    /// statement (missing values), one long statement that must truncate.
    private static func defaultScenario(named name: String, paused: Bool) -> Scenario {
        Scenario(
            name: name,
            now: frozenNow,
            phase: .normal,
            connections: connections,
            sessions: sessions,
            selectedConnectionID: "prod-payments-primary",
            selectedSessionID: 51_882,
            feedPaused: paused,
            inspectorPresented: true,
            readOnly: false)
    }

    /// Empty state: no connection selected → guidance text.
    private static func emptyScenario() -> Scenario {
        Scenario(
            name: "empty",
            now: frozenNow,
            phase: .empty,
            connections: connections,
            sessions: [],
            selectedConnectionID: nil,
            selectedSessionID: nil,
            feedPaused: false,
            inspectorPresented: false,
            readOnly: false)
    }

    /// Error state: connection unreachable → non-modal error with retry;
    /// the live-feed cluster is hidden (feed not live).
    private static func errorScenario() -> Scenario {
        Scenario(
            name: "error",
            now: frozenNow,
            phase: .error,
            connections: connections,
            sessions: [],
            selectedConnectionID: "prod-payments-primary",
            selectedSessionID: nil,
            feedPaused: false,
            inspectorPresented: false,
            readOnly: false)
    }

    private static let sessions: [SessionInfo] = [
        SessionInfo(
            id: 51_882,
            name: "orders-api",
            user: "orders_rw",
            client: "10.4.12.31:58211",
            state: .blocked,
            startedAt: frozenNow.addingTimeInterval(-2_467),
            statement:
                "UPDATE payments SET state = 'captured', captured_at = now() WHERE order_id = $1"),
        SessionInfo(
            id: 51_740,
            name: "settlement-batch",
            user: "settlement",
            client: "10.4.12.44:60102",
            state: .slow,
            startedAt: frozenNow.addingTimeInterval(-753),
            statement:
                "SELECT p.id, p.order_id, p.amount_cents, p.currency, l.ledger_ref, l.posted_at, "
                + "m.merchant_name, m.settlement_account FROM payments p "
                + "JOIN ledger_entries l ON l.payment_id = p.id "
                + "JOIN merchants m ON m.id = p.merchant_id "
                + "WHERE p.state = 'captured' AND l.posted_at >= $1 AND l.posted_at < $2 "
                + "ORDER BY l.posted_at, p.id"),
        SessionInfo(
            id: 51_901,
            name: "checkout-web",
            user: "checkout_rw",
            client: "10.4.13.9:51877",
            state: .slow,
            startedAt: frozenNow.addingTimeInterval(-214),
            statement: "SELECT * FROM carts WHERE session_token = $1 FOR UPDATE"),
        SessionInfo(
            id: 51_923,
            name: "orders-api",
            user: "orders_rw",
            client: "10.4.12.31:58414",
            state: .healthy,
            startedAt: frozenNow.addingTimeInterval(-41),
            statement: "SELECT id, state FROM payments WHERE order_id = $1"),
        SessionInfo(
            id: 51_927,
            name: "orders-api",
            user: "orders_rw",
            client: "10.4.12.32:49220",
            state: .healthy,
            startedAt: frozenNow.addingTimeInterval(-18),
            statement: "INSERT INTO payment_events (payment_id, kind, payload) VALUES ($1, $2, $3)"),
        SessionInfo(
            id: 51_930,
            name: "checkout-web",
            user: "checkout_rw",
            client: "10.4.13.9:51902",
            state: .healthy,
            startedAt: frozenNow.addingTimeInterval(-9),
            statement: "SELECT price_cents FROM products WHERE sku = ANY($1)"),
        SessionInfo(
            id: 51_931,
            name: "risk-scorer",
            user: "risk_ro",
            client: "10.4.14.2:44510",
            state: .healthy,
            startedAt: frozenNow.addingTimeInterval(-6),
            statement: "SELECT features FROM risk_profiles WHERE customer_id = $1"),
        SessionInfo(
            id: 51_933,
            name: "metrics-agent",
            user: "telemetry_ro",
            client: "10.4.15.7:39001",
            state: .healthy,
            startedAt: frozenNow.addingTimeInterval(-2),
            statement: "SELECT count(*) FROM pg_stat_activity"),
        SessionInfo(
            id: 50_112,
            name: "admin-console",
            user: "ops_admin",
            client: "10.4.16.20:52660",
            state: .idle,
            startedAt: frozenNow.addingTimeInterval(-12_161),
            statement: nil),
    ]
}
