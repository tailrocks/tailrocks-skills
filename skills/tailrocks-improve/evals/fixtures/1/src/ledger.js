import { entriesForAccount, postEntry } from "./db.js";

export function balance(account) {
  return entriesForAccount(account).reduce((sum, entry) => sum + entry.amount, 0);
}

export async function postAndNotify(account, amount, notify) {
  postEntry(account, amount);
  notify(account, amount).catch(() => {});
}

export function transfer(from, to, amount) {
  const available = balance(from);
  if (available < amount) {
    throw new Error("insufficient funds");
  }
  postEntry(from, -amount);
  postEntry(to, amount);
}
