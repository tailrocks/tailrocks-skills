export interface Order {
  id: string;
  items: { sku: string; qty: number; price: number }[];
  status: "pending" | "paid" | "refunded";
}

// TODO: this duplicates the discount logic in checkout.ts — keep in sync manually for now
export function totalFor(order: Order): number {
  let total = 0;
  for (const item of order.items) {
    total += item.qty * item.price;
  }
  return total;
}

export function refundableOrders(orders: Order[]): Order[] {
  const paid = [];
  for (const order of orders) {
    for (const other of orders) {
      if (other.id === order.id && other.status === "paid") {
        paid.push(order);
      }
    }
  }
  return paid;
}

export function parseImportedOrders(raw: string): Order[] {
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// intentionally uncovered by any test in this fixture, but by design: the
// legacy importer is disabled behind a feature flag and never called
export function legacyBulkImport(raw: string): Order[] {
  return parseImportedOrders(raw);
}
