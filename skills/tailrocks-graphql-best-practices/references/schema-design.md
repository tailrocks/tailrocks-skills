# Schema Design

The schema is a public contract read by strangers. Every shape below exists to
keep that contract evolvable without version numbers: connections can grow
fields, payloads can grow error codes, `Node` can absorb new types — none of it
breaks an existing client.

## Naming

- Types `PascalCase`, fields and arguments `camelCase`, enum values
  `SCREAMING_SNAKE_CASE`.
- Queries are nouns for what they return: `invoice`, `invoices`, `viewer`.
  Never `getInvoice` — `get` states nothing a query does not already state.
- Mutations are verb-first domain operations: `submitInvoice`, `voidInvoice`,
  `inviteMember`. The verb names what the business does, not what the row
  update looks like.
- Booleans read as assertions (`isOverdue`, `hasAttachments`), dates end in
  `At` (`issuedAt`), durations name the unit (`gracePeriodDays`).
- No abbreviations a new client author must decode: `customer`, not `cust`.

## Global object identification

Every addressable object implements `Node` and exposes one opaque `ID`:

```graphql
interface Node {
  id: ID!
}

type Invoice implements Node {
  id: ID!          # opaque, e.g. base64 of "Invoice:01J…" — never a bare i64
  number: String!
}

type Query {
  node(id: ID!): Node
}
```

Mechanism: opaque IDs let clients cache and refetch any object uniformly, and
they keep database key strategy (integer, UUID, ULID, sharding) out of the
public contract — you can change storage without a schema change. Encode the
concrete type into the ID and reject an `Invoice` ID passed where a `Customer`
ID is expected; that turns a whole class of confused-object bugs into typed
user errors. Never expose raw database keys, even alongside the opaque ID.

## Lists are connections

The default shape for every list field is a Relay-style connection:

```graphql
type InvoiceConnection {
  edges: [InvoiceEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type InvoiceEdge {
  cursor: String!
  node: Invoice!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type Query {
  invoices(first: Int, after: String, last: Int, before: String,
           filter: InvoiceFilter): InvoiceConnection!
}
```

- Cursors are opaque and encode a stable sort position, not an offset — offset
  pagination skips or repeats rows under concurrent writes and invites
  `OFFSET 500000` table scans.
- Cap `first`/`last` server-side (a stated number, typically 100) and reject
  requests that pass neither.
- A plain `[Thing!]!` list is a deviation that needs a written reason: the set
  is small, bounded by construction, and always fetched whole (e.g. the ≤ 10
  members of a fixed enumeration-like collection).
- Connections may grow — `totalCount`, aggregates, edge metadata — without
  breaking anyone. A bare list cannot; that asymmetry is why connections are
  the default even when today's UI shows ten rows.

## Mutations

One input object, one payload type per mutation, user errors as data:

```graphql
input SubmitInvoiceInput {
  invoiceId: ID!
  note: String
}

type SubmitInvoicePayload {
  invoice: Invoice
  userErrors: [UserError!]!
}

type UserError {
  code: UserErrorCode!
  field: [String!]      # path into the input, e.g. ["note"]
  message: String!      # safe, human-readable, already localizable
}

enum UserErrorCode {
  INVOICE_ALREADY_SUBMITTED
  INVOICE_EMPTY
  NOT_AUTHORIZED
}

type Mutation {
  submitInvoice(input: SubmitInvoiceInput!): SubmitInvoicePayload!
}
```

- **Expected failures are payload data, not thrown errors.** A validation or
  precondition failure is a domain outcome the client must render; the
  top-level GraphQL `errors` array is reserved for transport and system
  failures (auth, rate limit, internal). Mechanism: payload errors are typed,
  enumerable, and testable per mutation; thrown errors are stringly-typed and
  force clients to parse messages.
- The payload's success field (`invoice`) is nullable precisely because
  `userErrors` may be non-empty; that pairing is the one sanctioned use of
  output nullability without a bespoke reason.
- One payload type per mutation, never a shared `MutationResult` — each
  operation's error codes and result fields evolve independently.
- One `input` object per mutation, even for a single field: arguments can then
  grow additively without a breaking argument-list change.

## Nullability policy

Non-null (`!`) by default. A nullable field carries a written reason, one of:

1. **Partial failure**: the field is resolved from a source that can fail
   while the rest of the object succeeds, and the product accepts a hole.
2. **Genuinely optional domain value**: the relation truly may not exist
   (`invoice.voidedAt`).
3. **Mutation payload success field**, paired with `userErrors` as above.

List positions are always non-null (`[Invoice!]`). Inputs invert the ratchet:
a new input field or argument must be nullable or carry a default, because
requiring it breaks every existing operation — see
`references/contract-gates.md`.

## Model operations, not tables

An anemic CRUD schema (`createInvoice`, `updateInvoice(status:…)`,
`deleteInvoice`) leaks storage shape and forces business rules into clients —
exactly what the thin-UI rule forbids. Instead each state transition the
domain recognizes is its own mutation (`submitInvoice`, `voidInvoice`,
`recordPayment`), validated in the Rust core, with its own payload and error
codes. A generic `update` mutation whose semantics depend on which fields were
set cannot be typed, gated, or audited — reject it in review.

## Polymorphism

- **Union** when members share no contract: `union TimelineEntry =
  PaymentRecorded | NoteAdded | StatusChanged`. Clients must handle each
  member; adding a member is additive (clients need a fallback case).
- **Interface** when members share fields the client selects uniformly
  (`Node`, `Actor`). Prefer a union unless that shared selection genuinely
  exists — an interface invented to avoid writing fragments couples types
  that will want to diverge.

## When not to add a field

Client-specific display logic stays in the client: `formattedTotal`,
`statusColor`, `shortLabel` are rendering decisions, and baking one client's
rendering into the public contract makes every other client carry it forever.
The server exposes the domain value (`totalCents`, `currency`, `status`); the
UI formats it. The test: if two clients could reasonably want different
values, it is not a server field.

**Complete when:** every object is a `Node` with an opaque ID, every list is a
connection or has a written exemption, every mutation has its own input,
payload, and error codes, every nullable output cites one of the three
reasons, and no mutation mirrors a table update.
