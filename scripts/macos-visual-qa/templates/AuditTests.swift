import XCTest

final class AuditTests: XCTestCase {
    func testAccessibility() throws {
        let bundleID = try XCTUnwrap(ProcessInfo.processInfo.environment["BUNDLE_ID"])
        let app = XCUIApplication(bundleIdentifier: bundleID)
        app.launch()
        let owned = [app] + app.descendants(matching: .any).allElementsBoundByAccessibilityElement
        try app.performAccessibilityAudit(for: [
            .contrast, .elementDetection, .hitRegion, .sufficientElementDescription,
        ]) { issue in
            guard let element = issue.element else { return true }
            return !owned.contains(element)
        }
    }
}
