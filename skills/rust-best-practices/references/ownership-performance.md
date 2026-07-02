# Ownership, Allocation, and Performance

Use this reference when changing function signatures, removing clones,
optimizing allocation, choosing dispatch, selecting pointer types, or reviewing
hot paths.

## Contents

- Borrowing and ownership
- Passing by value and `Copy`
- Cloning
- Lazy fallbacks and allocation
- Iterators and control flow
- Static and dynamic dispatch
- Stack, heap, and size
- Pointers and shared state
- Performance discipline

## Borrowing and Ownership

- Prefer `&str`, `&[T]`, `&Path`, and `Option<&T>` in parameters when the
  function only reads data.
- Prefer `&mut T` when the caller retains ownership and the function mutates in
  place.
- Take `T`, `String`, `Vec<T>`, or `PathBuf` when the function stores the value,
  moves it into another owner, sends it to another thread, or would otherwise
  clone immediately.
- Push unavoidable ownership decisions to the caller so allocation and cloning
  costs are visible at the call site.
- Use `Cow<'_, T>` only when accepting either borrowed or owned data materially
  avoids clones at an API boundary.

## Passing by Value and `Copy`

- Pass small, cheap `Copy` types by value.
- Derive `Copy` only when all fields are `Copy`, the type is small enough to copy
  cheaply, and it represents plain data with no ownership or heap allocation.
- Treat two or three machine words as a useful heuristic for custom `Copy`
  structs, not a hard law.
- Large arrays can be `Copy` when their element type is `Copy`, but large stack
  copies can still be expensive or risky.
- Enum size is governed by the largest variant. Large variants can make every
  enum value large.

## Cloning

Treat `.clone()` as a visible cost and semantic choice.

Good reasons:

- Ownership must cross a lifetime, task, thread, storage, or cache boundary.
- Cloning an `Arc` or `Rc` is intentionally sharing ownership.
- An API requires owned data and changing it is out of scope.
- A snapshot is needed for later comparison.
- The value is small, clone cost is irrelevant, and code clarity improves.

Warning signs:

- A clone appears after a borrow-checker error without changing the design.
- A loop clones the same input repeatedly.
- A function accepts `&T` and clones unconditionally.
- A clone hides that two values no longer stay synchronized.
- Large `Vec`, `HashMap`, `String`, or tree-like values are cloned casually.

Prefer `.cloned()` or `.copied()` at the point where iterator item ownership is
intended. Avoid ad-hoc `.map(|x| x.clone())` unless the closure is doing more
than cloning.

## Lazy Fallbacks and Allocation

- Do not collect into `Vec` just to inspect length, first element, any/all, or a
  fixed small number of elements.
- Prefer lazy fallback combinators when the fallback allocates, formats, logs, or
  calls a function:
  - `ok_or_else` over eager `ok_or` for non-trivial errors.
  - `map_or_else` over eager `map_or` for non-trivial defaults.
  - `unwrap_or_else` or `unwrap_or_default` over eager `unwrap_or` when fallback
    construction has cost.
- Use `inspect_err` to log or observe an error without changing it.
- Use `map_err` to transform errors at a boundary.
- If a recursive traversal builds a collection, consider passing an accumulator
  to reuse allocation.
- Avoid string formatting on hot paths unless the formatted string is needed.

## Iterators and Control Flow

- Use `for` loops when early exits, side effects, IO, logging, mutation, or
  readability are clearer with explicit control flow.
- Use iterator adapters when transforming collections, composing `Option` or
  `Result`, enumerating indexes, using `windows` or `chunks`, combining sources,
  or avoiding intermediate allocations.
- Iterators are lazy until consumed by `.collect`, `.sum`, `.for_each`, or
  another consumer.
- Format long chains one method per line.
- Prefer `.iter()` over `.into_iter()` when ownership is still needed.
- Prefer `.iter()` over `.into_iter()` for collections of `Copy` items unless
  consuming ownership is intentional.
- Prefer `.sum()` over `.fold()` for ordinary summation.
- Prefer explicit type ascription when inference-heavy chains obscure the result
  type.
- Do not force `map`, `then`, `filter`, or other combinators when `for`, `if`, or
  `match` communicates more clearly.

## Static and Dynamic Dispatch

Use static dispatch (`T: Trait`, `impl Trait`) when:

- The code is performance-sensitive.
- Concrete types are known at compile time.
- Inlining or layout specialization matters.
- The implementation is small enough that monomorphization cost is acceptable.

Use dynamic dispatch (`&dyn Trait`, `Box<dyn Trait>`, `Arc<dyn Trait>`) when:

- Heterogeneous values must share one container or API.
- Runtime plugins or hot-swappable components are required.
- Code size and compile time matter more than call-site specialization.
- A stable abstraction boundary is more important than direct calls.

Prefer `&dyn Trait` when borrowing is enough and `Arc<dyn Trait>` for shared
access across threads. Box at public or architectural boundaries when type
erasure is required; avoid boxing too early inside internal structs.

Avoid making large bodies generic, especially across crate boundaries. A small
generic wrapper can call a non-generic implementation to reduce duplicated
machine code.

## Stack, Heap, and Size

- Keep small `Copy` values on the stack.
- Avoid passing huge values by value; use references for large values. Values
  above a few hundred bytes deserve scrutiny.
- Heap-allocate recursive structures with `Box`, `Vec`, or another owning
  pointer.
- Return small `Copy` or cheaply cloned values by value.
- Add `#[inline]` only when measurement shows it helps.
- Be careful with `Box::new([0; N])` for large arrays because it may create a
  large stack value before boxing. Prefer heap-first construction patterns for
  large buffers.
- Use specialized containers such as `smallvec` only when their stack/heap
  tradeoff fits the workload.

## Pointers and Shared State

Prefer plain ownership and borrowing first.

- `&T`: shared read-only borrow.
- `&mut T`: exclusive mutable borrow.
- `Box<T>`: single-owner heap allocation, recursive types, or large values.
- `Rc<T>`: single-threaded shared ownership.
- `Arc<T>`: multi-threaded shared ownership.
- `Cell<T>`: copy-only interior mutability for single-threaded cases.
- `RefCell<T>`: runtime-checked interior mutability; borrow violations panic.
- `Mutex<T>`: thread-safe exclusive interior mutability, often under `Arc`.
- `RwLock<T>`: thread-safe multiple-reader or single-writer access, often under
  `Arc`.
- `OnceCell<T>` and `LazyCell<T>`: single-threaded one-time or lazy
  initialization.
- `OnceLock<T>` and `LazyLock<T>`: thread-safe one-time or lazy initialization,
  often useful for statics.
- Raw pointers: unsafe, mainly for FFI or low-level memory work.

Use `Arc<[T]>` for shared read-only data across threads when appropriate. Use
`Arc<Mutex<T>>` or `Arc<RwLock<T>>` only when shared mutable state is necessary.
Keep lock and `RefCell` borrow scopes tight.

Avoid `Deref` as inheritance or API delegation. If callers need methods,
implement explicit methods or traits.

## Performance Discipline

- Do not guess; measure.
- Build and benchmark optimized code when making performance claims.
- Use `cargo bench`, criterion, project-provided benchmarks, `cargo flamegraph`,
  `samply`, or targeted timing around real workloads.
- Profile release builds unless debug behavior is the thing being investigated.
- Treat tiny improvements cautiously; make sure the difference is larger than
  benchmark noise.
- Let Clippy catch obvious issues such as redundant clones, clone-on-copy,
  needless collect, large enum variants, and avoidable allocation.
- Do not trade readability for speculative micro-optimizations. Make costs
  visible first, then optimize measured bottlenecks.
