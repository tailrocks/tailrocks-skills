# Boundaries and Data Ownership

Load this reference for server functions, middleware, environment variables,
Router loaders, Query caching, SSR, or external data.

## Execution boundary

Use TanStack Start primitives to state where code runs:

- `createServerFn` for typed client-to-server calls;
- `createServerOnlyFn` for utilities that must never bundle for clients;
- `createClientOnlyFn` for browser-only capabilities;
- `createIsomorphicFn` only when both implementations are deliberate.

Validate every `createServerFn` input before its handler. Authentication and
authorization occur on the server even when client middleware adds headers or
optimistic checks. Request middleware owns cross-cutting request policy; function
middleware owns reusable server-function context.

Read secrets from server environment only. Client-visible values use the
framework's public prefix and contain no secrets. Parse both server and public
environment values once, fail startup with structured diagnostics, and expose
validated configuration rather than raw environment access.

## Trust boundaries

Parse route params, search params, form/request bodies, cookies, external API
responses, and persisted values from `unknown`. Translate dependency exceptions
and schema issues into closed application errors before they cross into routes or
components.

Return serializable values from server functions. Avoid returning database rows,
class instances, error objects, or capability-bearing objects directly.

## Router and Query

Router owns route matching, search params, loader lifecycle, pending/error states,
and route-scoped data. Query owns server state that is shared, interactive,
invalidated after mutations, polled, or background-refetched.

When both need the same remote data, define one `queryOptions` factory. The route
loader calls `context.queryClient.ensureQueryData(options)`; the component uses
the same options. Define stable keys from validated identifiers and set freshness
from product semantics, not arbitrary defaults.

Avoid duplicate Router and Query caches for the same datum without an explicit
handoff. Mutations update or invalidate the owning Query key and then navigate or
refresh route state only when route semantics require it.

## SSR

Keep browser globals behind client-only boundaries or effects. Make module
initialization deterministic and request-safe; global mutable server state must
not leak between requests. Ensure loader/query results serialize and hydrate
without environment-dependent shapes.

## Completion check

Every execution environment is explicit, every untrusted value is parsed once,
authorization is server-enforced, returned data is serializable, each remote
datum has one cache owner, and SSR/client hydration agree on shape and identity.
