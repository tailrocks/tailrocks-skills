# Design pipeline

The design stage sits between READY and planning: finalization grants READY, the
medium's design owner produces the blessed reference, and planning refuses a
screen contract that cites none. A work item with no visual surface explicitly
skips the stage.

The stages use the same words on every medium — **design**, **bless**,
**freeze**, and **audit**:

- **Design:** author the reference on the real rendering substrate from
  realistic fixtures.
- **Bless:** the user signs off on the live reference. An agent never blesses
  its own output.
- **Freeze:** capture the deterministic mechanical baseline from the blessed
  reference. Missing blessing blocks the freeze.
- **Audit:** compare the implementation against that reference under the
  medium's conformance rules.

Each medium keeps its substrate, taste, capture, and conformance mechanism with
its stage owner. A shared pipeline never assigns platform-specific behavior.
