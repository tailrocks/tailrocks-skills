import SwiftUI

struct RecordsWindow: View {
  var body: some View {
    List(0..<20) { row in
      Text("Record \(row)").glassEffect().padding(12)
    }
    .toolbar {
      Button("Delete") {}.tint(.red)
      Button("Save") {}.tint(.blue)
    }
    .overlay(alignment: .bottom) {
      Text("Status").glassEffect(in: .rect(cornerRadius: 12))
    }
  }
}
