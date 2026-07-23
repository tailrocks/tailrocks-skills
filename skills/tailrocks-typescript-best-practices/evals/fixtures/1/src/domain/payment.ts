export type Payment = {
  status: "idle" | "processing" | "paid" | "failed";
  receipt?: string;
  error?: string;
};

export async function pay(payment: Payment): Promise<void> {
  payment.status = "processing";
  const response = await fetch("/pay");
  payment.receipt = (await response.json()).receipt as string;
  payment.status = "paid";
}
