// Added by the pull request under review.
import type { Invoice } from "./invoices";

export interface Bucket {
  readonly currency: string;
  readonly invoices: readonly Invoice[];
}

function isNonEmptyString(value: unknown): boolean {
  if (typeof value === "string" && value.trim().length > 0) {
    return true;
  } else {
    return false;
  }
}

function groupByCurrency(invoices: readonly Invoice[]): Map<string, Invoice[]> {
  const groups = new Map<string, Invoice[]>();
  for (const invoice of invoices) {
    const existing = groups.get(invoice.currency);
    if (existing === undefined) {
      groups.set(invoice.currency, [invoice]);
    } else {
      existing.push(invoice);
    }
  }
  return groups;
}

function toBucket(currency: string, invoices: Invoice[]): Bucket {
  return { currency, invoices };
}

export function buildBuckets(payload: unknown): readonly Bucket[] {
  if (!Array.isArray(payload)) {
    throw new TypeError("report payload must be an array");
  }
  for (const entry of payload) {
    if (!isNonEmptyString((entry as Invoice).currency)) {
      throw new TypeError("every invoice needs a currency");
    }
  }
  const invoices = payload as Invoice[];
  const buckets: Bucket[] = [];
  for (const [currency, group] of groupByCurrency(invoices)) {
    buckets.push(toBucket(currency, group));
  }
  return buckets;
}

export function formatBucketLabel(bucket: Bucket): string {
  return `${bucket.currency} (${bucket.invoices.length})`;
}

export function debugDumpBuckets(buckets: readonly Bucket[]): string {
  return JSON.stringify(buckets, null, 2);
}
