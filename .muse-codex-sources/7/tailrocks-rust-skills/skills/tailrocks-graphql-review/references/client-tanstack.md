# Client: TanStack on Bun

Tailrocks choice: the web client uses TanStack Query with Bun codegen.
GraphQL itself needs no specific client stack.

The web app is a renderer of server-owned state. It sends operations, caches
results, and maps typed outcomes to UI. It holds no business rules. A
behavior that needs a unit test to be trusted — a total, a permission, a
state transition — belongs in the Rust core. It arrives as schema data. The
test
for smuggled logic: could the server change this decision without a client
deploy? If not, the decision is in the wrong place.

## Codegen under Bun

All types come from GraphQL codegen with the client preset, run by Bun against
the committed SDL snapshot. That snapshot is the same artifact the server
gates on, so client types can never drift ahead of the contract:

```ts
// codegen.ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "../api/schema.graphql", // the committed SDL snapshot
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/graphql/": {
      preset: "client",
      presetConfig: { persistedDocuments: true },
    },
  },
};

export default config;
```

```sh
bun run graphql-codegen --config codegen.ts
```

`@graphql-codegen/cli` and the client preset are devDependencies installed
with `bun add -d`. The codegen run is a `bun run` script and a mise task so
local and CI invoke the identical command. Hand-written types for a GraphQL
response are a finding: they are a second, unverified copy of the contract.

## Executing operations with TanStack Query

Use one small typed executor. TanStack Query owns caching, retries, and
invalidation. Query keys derive from operation name plus variables so
invalidation targets an operation family without string drift:

```ts
// src/graphql/execute.ts
import type { TypedDocumentString } from "./graphql";

export async function execute<TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  const response = await fetch("/graphql", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: document.toString(), variables }),
  });
  if (!response.ok) throw new TransportError(response.status);
  const payload = (await response.json()) as {
    data?: TResult;
    errors?: ReadonlyArray<{ message: string }>;
  };
  if (payload.errors?.length || payload.data === undefined) {
    throw new TransportError(response.status, payload.errors);
  }
  return payload.data;
}
```

```ts
const ActiveInvoices = graphql(`
  query ActiveInvoices($first: Int!, $after: String) {
    invoices(first: $first, after: $after, filter: { status: OPEN }) {
      edges { cursor node { id ...InvoiceRow } }
      pageInfo { hasNextPage endCursor }
    }
  }
`);

function useActiveInvoices(variables: { first: number; after?: string }) {
  return useQuery({
    queryKey: ["ActiveInvoices", variables],
    queryFn: () => execute(ActiveInvoices, variables),
  });
}
```

Mutations invalidate by operation-name prefix
(`queryClient.invalidateQueries({ queryKey: ["ActiveInvoices"] })`), which is
why the name — not the document text — leads the key.

## Fragments live with components

Each component declares the fields it renders as a colocated fragment. Pages
compose fragments into one operation. With the client preset's fragment
masking, a component can only read fields its own fragment named:

```tsx
export const InvoiceRow = graphql(`
  fragment InvoiceRow on Invoice {
    number
    totalCents
    currency
    status
  }
`);

export function InvoiceRowView(props: { invoice: FragmentType<typeof InvoiceRow> }) {
  const invoice = useFragment(InvoiceRow, props.invoice);
  return <Row title={invoice.number} amount={formatMoney(invoice.totalCents, invoice.currency)} />;
}
```

Mechanism: masking makes data dependencies local — deleting a component
deletes its field selections, and no component silently depends on fields a
sibling happened to fetch. Formatting (money, dates) is rendering and belongs
here. The *values* come from the server.

## Persisted operations in production builds

The codegen `persistedDocuments` output is a manifest mapping hash to document
text. The production build ships only hashes. The executor sends
`{ documentId: hash, variables }`. The manifest is delivered to the server
as a build artifact, and the server rejects unknown hashes
(`references/server-rust.md`). Development builds keep sending full documents
so iteration never waits on a manifest sync. The manifest handoff is part of
the deploy pipeline, not a manual step.

## Error display

Two error channels reach the UI, and they render differently:

- **Typed user errors** from a mutation payload map to product UI. A `field`
  path attaches the message to its form control. A code like
  `INVOICE_ALREADY_SUBMITTED` selects copy the product team owns. Exhaustive
  `switch` on the code enum with a generic fallback arm, so a new server code
  degrades gracefully instead of crashing rendering.
- **Transport errors** (network failure, non-200, top-level GraphQL errors)
  render one generic failure state with a retry affordance and the request ID
  for support. Never render a transport `message` string to the user: it is
  not localized, not stable, and any leaked internal detail would surface here
  first.

**Complete when:** every operation's types are generated from the committed
SDL. Every query key starts with the operation name. Every component reads
only its own fragment. Production sends hashes not documents. User-error codes
switch exhaustively with a fallback. No transport message reaches the
screen.
