#!/usr/bin/env python3
"""Regenerate the golden frames from the layout tables below.

Faster than wiring up the Rust gallery: pads each row to 80 columns and
draws the panel box directly.
"""

ROWS = [
    ("docs", "002/003", "active", "3s ago"),
    ("parser", "004/004", "done", "2h ago"),
]

def frame():
    lines = ["┌ Runs (%d) " % len(ROWS) + "─" * 66 + "┐"]
    for name, sl, state, age in ROWS:
        body = " ▸ ● %-10s  %-7s  %-8s  %s" % (name, sl, state, age)
        lines.append("│" + body.ljust(78) + "│")
    while len(lines) < 23:
        lines.append("│" + " " * 78 + "│")
    lines.append("└" + "─" * 78 + "┘")
    return "\n".join(lines) + "\n"

if __name__ == "__main__":
    with open("../golden/status-board--default--80x24.txt", "w") as fh:
        fh.write(frame())
