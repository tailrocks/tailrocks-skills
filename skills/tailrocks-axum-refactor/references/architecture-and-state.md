# Architecture and State

Keep dependency direction inward:

```text
app-domain <- app-application <- app-adapters <- app-http <- app-bin
```

Domain owns invariants and typed failure. Application owns use cases and narrow
ports. Adapters implement persistence/external clients. HTTP owns Axum extractors,
routers, DTOs, status codes, headers, and Tower policy. The binary owns config,
construction, listener, signals, and process exit.

Build feature routers as `Router<AppState>` and compose them before supplying
state. Use one concrete, cheaply cloneable state whose fields are pools, clients,
configuration, clocks, and narrow application services. Put `Arc` around the
non-cloneable shared field that needs it, not reflexively around a mutable service
locator. Use `FromRef` for substates when it reduces handler authority.

Handlers orchestrate only: extract, authorize, convert DTO to command, call one
use case, convert result to response. Domain branching, SQL, retries, and external
protocol details live below HTTP.

Route modules own coherent resources and nest under explicit paths. Avoid giant
router files, stringly shared extensions, and global state. Keep route
construction callable from tests without binding a socket.

**Complete when:** dependency direction is acyclic, handler bodies remain thin,
state cloning is cheap and capability-scoped, and router construction is a pure
composition seam.
