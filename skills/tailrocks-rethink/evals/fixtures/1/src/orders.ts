export interface Order {
  readonly id: string;
  readonly customerId: string;
  readonly totalCents: number;
}

const orders = new Map<string, Order>();

export function createOrder(id: string, customerId: string, totalCents: number): Order {
  if (id.trim() === "") throw new Error("empty order id");
  const order = { id, customerId, totalCents };
  orders.set(id, order);
  return order;
}

export function findOrder(id: string): Order | undefined {
  if (id.trim() === "") throw new Error("empty order id");
  return orders.get(id);
}

export function refundOrder(id: string, amountCents: number): Order {
  const order = orders.get(id);
  if (order === undefined) throw new Error("unknown order");
  return { ...order, totalCents: order.totalCents - amountCents };
}

export function cancelOrder(id: string): void {
  orders.delete(id.trim());
}
