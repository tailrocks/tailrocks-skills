import express from "express";
import axios from "axios";

const app = express();

export function h(a: string, b: Record<string, unknown>) {
  return { ...b, k: a };
}

export function proc(rows: unknown[]) {
  return rows.map((r) => h(String(r), {}));
}

app.get("/report", async (_req, res) => {
  const upstream = await axios.get("https://billing.internal/summary");
  res.json(proc(upstream.data));
});

export default app;
