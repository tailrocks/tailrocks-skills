# Approved topology repair

The approval names exact repository, HEAD, finding identity, affected paths,
preimage hashes, intended content, client basenames, and raw link targets. Any
drift invalidates it. Approval for one link does not authorize rule movement;
approval for one deletion does not authorize nearby cleanup.

Order: discover; validate preimages and parents; stage reviewed content and link
operations; compare-and-swap publish; verify exact topology and bytes. On failure,
restore only bytes and links still owned by the transaction. Preserve and name
every recovery artifact when ownership is uncertain.
