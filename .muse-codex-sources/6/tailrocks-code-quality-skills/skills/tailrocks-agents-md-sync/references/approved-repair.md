# Approved topology repair

The approval names the exact repository, HEAD, finding identity,
affected paths, preimage hashes, intended content, client
basenames, and raw link targets. Any drift invalidates it.
Approval for one link authorizes no rule movement. Approval for
one deletion authorizes no nearby cleanup.

Use this order:

1. Discover.
2. Validate preimages and parents.
3. Stage reviewed content and link operations.
4. Publish with compare-and-swap.
5. Verify the exact topology and bytes.

On failure, restore only bytes and links still owned by the
transaction. When ownership is uncertain, preserve and name
every recovery artifact.
