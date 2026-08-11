import XCTest

// BUNDLE_ID=com.example.App xcodebuild test -scheme App -destination 'platform=macOS' -only-testing:AppUITests/AuditTests/testAccessibility
final class AuditTests: XCTestCase {
    func testAccessibility() throws {
        let bundleID = try XCTUnwrap(ProcessInfo.processInfo.environment["BUNDLE_ID"])
        let app = XCUIApplication(bundleIdentifier: bundleID)
        app.launch()
        try app.performAccessibilityAudit()
    }
}
