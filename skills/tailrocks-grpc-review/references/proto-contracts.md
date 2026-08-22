# Proto Contracts

Scope: proto3 style, contract ownership and layout, field-number discipline,
presence, enums, message-per-RPC, pagination, well-known types, comments, buf
gates, and major-version migration.

## Ownership and layout

- The contract lives in a dedicated proto module: a `proto/` directory at the
  repository root with `buf.yaml` at its top, or a dedicated proto repository
  when several repositories consume the same contracts. Application crates
  consume generated code; they never own `.proto` files ad hoc.
- Directory layout mirrors the package: package `tailrocks.inventory.v1`
  lives at `proto/tailrocks/inventory/v1/inventory.proto`. buf's standard
  lint set enforces the mirror (`PACKAGE_DIRECTORY_MATCH`), which makes the
  package name derivable from the path and vice versa.
- Package names are `tailrocks.<domain>.v<major>`. The version suffix is
  mandatory (`PACKAGE_VERSION_SUFFIX`): it is the unit of breaking-change
  isolation — see the migration section below.
- Generated code is build output, never hand-edited. Hand edits die on the
  next build and, worse, can survive long enough to ship a Rust type that no
  longer matches the wire.

`buf.yaml` (v2 config):

```yaml
version: v2
modules:
  - path: proto
lint:
  use:
    - STANDARD
breaking:
  use:
    - FILE
```

buf is installed via mise (`mise use buf@latest`), never a standalone
download, so the version CI runs is the version developers run. The gates:

```sh
buf lint
buf breaking --against '.git#branch=main'
```

Both run in CI on every PR. Mechanism: `lint` catches style drift at write
time; `breaking` compiles both sides to descriptors and compares them, so a
wire-incompatible edit fails the PR instead of failing a peer service at
runtime — where it surfaces as corrupted data, not as an error.

## Field numbers are the wire format

Names never travel; numbers do. Every field-number rule follows from that.

- **Never renumber.** A payload written under the old numbering decodes under
  the new one with values landing in the wrong fields. If the types happen to
  be compatible (two `string` fields swapped), nothing errors — customer
  names arrive in address fields, silently, until a human notices.
- **Never reuse a removed number or name.** Old peers, queued messages, and
  persisted payloads still carry the old meaning at that number. On removal,
  reserve both the number and the name so the compiler rejects reintroduction:

  ```proto
  message Item {
    reserved 4, 7;
    reserved "legacy_state", "old_notes";

    string id = 1;
    string name = 2;
  }
  ```

- Numbers 1–15 encode tag and wire type in one byte. Spend them on hot,
  frequently set fields and leave a little headroom for hot fields added
  later.
- `buf breaking` rejects renumbering and reuse against the current baseline;
  the `reserved` statements protect against the same edit landing later, when
  the baseline has moved past the removal.

## Presence

- proto3 scalars have implicit presence: unset and zero-valued are
  indistinguishable on the wire. Where "not provided" must differ from the
  zero value, mark the field `optional` — explicit presence, generated as
  `Option<T>` by prost.
- Message-typed fields always have presence (`Option<T>` in prost).
- Failure scenario for getting this wrong: an implicit `int32 quantity` on an
  update RPC cannot distinguish "set quantity to 0" from "quantity not
  sent" — the server zeroes inventory the caller meant to leave untouched.
  Any update RPC with skippable fields uses `optional` fields or a
  `FieldMask`, decided per RPC and stated in its comment.

## Enums

```proto
enum ItemState {
  ITEM_STATE_UNSPECIFIED = 0;
  ITEM_STATE_ACTIVE = 1;
  ITEM_STATE_ARCHIVED = 2;
}
```

- The zero value is `<ENUM_NAME>_UNSPECIFIED`, always. An absent enum field
  decodes as 0; if 0 were `ACTIVE`, "never set" and "active" merge into one
  value and no code can tell them apart again.
- Values carry the enum-name prefix (`ENUM_VALUE_PREFIX`,
  `ENUM_ZERO_VALUE_SUFFIX` in buf's standard set).
- proto3 enums are open: a value sent by a newer peer arrives as an integer
  the local build has no variant for. In Rust, convert at the adapter with
  the generated `try_from` and decide explicitly — reject with
  `InvalidArgument`, or map to a documented default. Never assume the match
  is exhaustive forever.

## One request and one response message per RPC

```proto
service InventoryService {
  rpc GetItem(GetItemRequest) returns (GetItemResponse);
  rpc DeleteItem(DeleteItemRequest) returns (DeleteItemResponse);
}
```

- Never primitive-shaped requests, never a shared message across RPCs, never
  `google.protobuf.Empty` in a service definition — even when the message has
  no fields today. Mechanism: the request/response message is the only
  evolution point an RPC has. A field added to a shared message changes every
  RPC using it at once; an `Empty` response can never gain a field without a
  breaking signature change. `message DeleteItemResponse {}` costs nothing
  now and preserves the ability to return, say, a deletion timestamp later.
- buf's standard set enforces the naming and uniqueness
  (`RPC_REQUEST_STANDARD_NAME`, `RPC_RESPONSE_STANDARD_NAME`,
  `RPC_REQUEST_RESPONSE_UNIQUE`).

## Pagination

Every `List`/`Search` RPC paginates from day one; retrofitting pagination
onto an unpaginated RPC is a behavioral break clients cannot detect from the
schema.

```proto
message ListItemsRequest {
  int32 page_size = 1;
  string page_token = 2;
}

message ListItemsResponse {
  repeated Item items = 1;
  string next_page_token = 2;
}
```

- The server caps `page_size`, treats 0 as "server default", and returns an
  empty `next_page_token` on the last page.
- The token is an opaque cursor, not an offset. Offsets skip or duplicate
  rows under concurrent writes and freeze the sort order into the contract;
  a cursor encodes position and leaves the server free to change its query.

## Well-known types

- Every instant is `google.protobuf.Timestamp`; every span is
  `google.protobuf.Duration`. Never `int64` epoch fields or ISO strings —
  "seconds or milliseconds?" is a classic silent cross-service defect, and
  the well-known types delete the question. prost provides them via
  `prost-types`; convert to domain time types at the adapter boundary.
- `google.protobuf.FieldMask` policy: used only on genuine partial-update
  RPCs, as an `update_mask` field whose comment states the mask semantics
  (unset mask means full replace, or is rejected — decide and document).
  Everywhere else, writes are full-resource. FieldMask-driven response
  filtering on reads is not used: cross-service payloads are small, and the
  complexity is not earned.

## Comments are the API documentation

Every service, RPC, message, field, and enum value carries a comment; they
propagate into the generated Rust docs and are what a calling team actually
reads. The RPC comment states two things prose elsewhere cannot be trusted
to carry:

```proto
// Creates an item.
// Not idempotent: retries must resend the same request_id, which the
// server deduplicates for 24 hours.
// Errors: ALREADY_EXISTS if the SKU is taken; INVALID_ARGUMENT if the
// SKU is malformed.
rpc CreateItem(CreateItemRequest) returns (CreateItemResponse);
```

- **Idempotency**, because retry policy is decided per RPC from this line
  (see [`references/operations.md`](operations.md)).
- **The non-OK codes the RPC returns deliberately**, because callers branch
  on them.

## When a break genuinely requires v2

Additive changes — new fields, new RPCs, new enum values, new messages — are
backward compatible in place and never justify a version bump. A new major
version is for the rare change that cannot be expressed additively: a field
whose type or meaning must change, or a resource model that must be
restructured.

Procedure:

1. Create `proto/tailrocks/inventory/v2/` with package
   `tailrocks.inventory.v2`. v1 files are untouched; `buf breaking` stays
   green because breaking-change detection is scoped by file and package.
2. Compile and serve both: the server registers the v1 and v2 services
   side by side, both delegating to the same domain layer — the adapters
   differ, the domain does not.
3. Migrate callers one at a time; per-RPC call metrics (see
   [`references/operations.md`](operations.md)) show v1 traffic draining.
4. Retire v1 only when its call rate has read zero over an agreed window,
   then delete the v1 directory in a reviewed change that acknowledges the
   `buf breaking` failure as intended.

Version the package, not the repository and not the server binary — both
sides of the migration must exist in one build.
