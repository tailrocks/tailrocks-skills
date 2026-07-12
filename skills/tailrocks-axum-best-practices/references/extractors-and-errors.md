# Extractors and Errors

Use typed `Path`, `Query`, `State`, headers, and `Json` extractors. Put body
extractors last because request bodies can be consumed once. Wrap external IDs,
pagination, auth, and validated JSON in custom extractors when multiple routes
share the contract.

Validate syntax and transport shape at extraction. Domain constructors validate
business invariants. Keep raw strings/maps and serde-only DTOs out of domain code.
Configure body limits before parsing and reject unknown fields where write/config
contracts require exactness.

Define a closed `ApiError` adapter over domain/application failures. Its
`IntoResponse` implementation maps each variant to a stable status, machine code,
safe message, details shape, and request ID. Preserve unexpected sources for
tracing while returning an opaque internal error. Log an error once at the layer
that has the full context; avoid duplicate handler/middleware logs.

Handler success types state the intended status explicitly. Use separate request
and response DTOs so database/domain representation never becomes an accidental
wire contract. Version or deliberately migrate externally consumed contracts.

Extractor rejections use the same error envelope as handler failures. Never leak
SQL, filesystem paths, stack traces, tokens, or upstream response bodies.

**Complete when:** every raw input crosses one validator, every rejection and
domain failure maps exhaustively, all responses are deliberate DTOs, and clients
receive one stable error schema without internal detail.
