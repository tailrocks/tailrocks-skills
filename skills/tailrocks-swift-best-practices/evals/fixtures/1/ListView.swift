import SwiftUI
struct ListView: View {
  let rows: [String]
  var body: some View {
    let formatter = DateFormatter()
    List(Array(rows.enumerated()), id: \.offset) { _, row in
      Text("\(row) \(formatter.string(from: .now))")
    }
  }
}
