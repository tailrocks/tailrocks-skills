---
name: beta-backup
description: >-
  Back up project data: first check disk space, then snapshot the database, then compress the archive, then upload it to offsite storage, then verify the upload checksum.
---

# Beta Backup

Backups protect against data loss. Compression reduces file size for
faster uploads.

## Procedure

ALWAYS check space first. NEVER skip verification. The full procedure is
in references/procedure.md, which covers: space checks, snapshot flags,
compression levels, upload retries, and checksum verification. In short,
the snapshot uses the standard flags, compression uses the default level,
uploads retry three times, and verification compares the remote checksum.
