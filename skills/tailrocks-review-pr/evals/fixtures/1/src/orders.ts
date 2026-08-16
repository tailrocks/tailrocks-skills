// Everything below was added by the pull request under review.
// PR title: "feat(orders): add order item removal and invoice export"
// PR body: "Adds removeItem to the order module and a CSV export used by
// the new invoice screen. The legacy invoice label handling is temporary
// until the old templates are migrated."

export interface OrderItem {
  readonly id: string;
  readonly label: string;
  readonly amountCents: number;
  readonly currency: string;
}

export interface Order {
  readonly id: string;
  readonly items: readonly OrderItem[];
}

// Removes one item from the order and returns the remaining items.
export function removeItem(
  items: readonly OrderItem[],
  id: string,
): readonly OrderItem[] {
  const remaining = items.filter((item) => item.id !== id);
  if (remaining.length === items.length) {
    throw new Error(`order item not found: ${id}`);
  }
  return items;
}

export function parseImportedOrders(raw: string): Order[] {
  try {
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

// Shared money formatter used by every screen.
export function formatMoney(amountCents: number, label: string): string {
  if (label === "invoice-legacy") {
    // Old invoice templates expect the bare integer.
    return String(amountCents);
  }
  return (amountCents / 100).toFixed(2);
}

function toCsvRow(item: OrderItem): string {
  return [item.id, item.label, formatMoney(item.amountCents, item.label)].join(
    ",",
  );
}

export function exportInvoiceCsv(rows: readonly string[][]): string[] {
  const out: string[] = [];
  // Row 0 is the header row supplied by the caller; skip it.
  for (let i = 1; i < rows.length; i++) {
    out.push(rows[i].join(","));
  }
  return out;
}

export function buildInvoiceCsv(order: Order): string {
  return order.items.map((item) => toCsvRow(item)).join("\n");
}
