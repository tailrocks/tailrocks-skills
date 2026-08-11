# macOS distribution scope spike

Sources checked 2026-08-11.

## Verifiable without paid credentials

- Build an archive with `xcodebuild archive` and validate the archive shape;
  Apple defines the archive as the prerequisite distribution artifact:
  https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases
- Enable and inspect `ENABLE_HARDENED_RUNTIME`, produce/inspect entitlement
  plists, apply an ad-hoc signature, and run
  `codesign --verify --deep --strict --verbose=2`. Apple's signing note explains
  that strict recursive verification approximates Gatekeeper's structural
  checks: https://developer.apple.com/library/archive/technotes/tn2206/
- Exercise the shape of `xcodebuild -exportArchive -exportOptionsPlist`; a real
  Developer ID export remains credential-gated.
- Run `spctl --assess` and require rejection for unsigned/ad-hoc builds. Apple
  states default Gatekeeper policy accepts Developer ID or Mac App Store apps,
  not ad-hoc signatures: https://developer.apple.com/library/archive/technotes/tn2206/

These checks prove bundle/signature structure. They do not prove public
distribution acceptance.

## Credential-gated and unverifiable here

- `notarytool submit`, status, and log round-trip: Developer ID Application
  certificate plus Apple notary-service authentication (App Store Connect API
  key or Apple ID app-specific password and team ID).
- Stapling: a successful notarization ticket from the preceding round-trip.
- Developer ID signing: Developer ID Application certificate/private key;
  installer packages additionally need Developer ID Installer credentials.
- App Store Connect/TestFlight submission: Apple Developer Program membership,
  App Store Connect role, signing assets, and submission authentication.

Apple requires Developer ID signing, hardened runtime, secure timestamp, and
valid entitlements for normal notarization, and explicitly rejects ad-hoc or
local-development certificates:
https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution
and
https://developer.apple.com/documentation/security/resolving-common-notarization-issues.
`notarytool`/`stapler` are the supported scripted tools:
https://developer.apple.com/documentation/security/customizing-the-notarization-workflow.

## Recommendation

Add a bounded `references/distribution.md` to
`tailrocks-swift-project-setup`: executable checks for archive shape, hardened
runtime, entitlements, ad-hoc structural verification, and expected Gatekeeper
rejection; then a clearly labeled credentialed checklist for Developer ID,
notarization, log review, stapling, and final `spctl`. Do not create a seventh
skill: it would launch below the W1 evidence grade of its siblings and split
project mechanics from their existing owner. Trade-off: the reference keeps one
owner and honest limits, but cannot claim the credentialed round-trip passed.

**Maintainer decision: APPROVE or REJECT the bounded setup reference.**

## Icon pipeline decision

The editable Icon Composer `.icon` source belongs in the sketch-handoff package;
`tailrocks-sketch-handoff` owns delivery of the design source. Project setup owns
only build wiring once that source exists. Until the handoff row and a verified
XcodeGen spelling land together, the scaffold setting stays commented and
explicitly inert; `.icon` is not an asset-catalog entry.
