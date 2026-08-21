import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("ledger.db");

db.exec(
  "CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, account TEXT, amount INTEGER)",
);

export function entriesForAccount(account) {
  return db
    .prepare("SELECT id, account, amount FROM entries WHERE account = '" + account + "'")
    .all();
}

export function postEntry(account, amount) {
  db.prepare("INSERT INTO entries (account, amount) VALUES (?, ?)").run(account, amount);
}
