import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;
let schemaReady: Promise<void> | null = null;

function getClient(): Client {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
  }
  return client;
}

export function db(): Client {
  return getClient();
}

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = Promise.all([
      getClient().execute(`
        CREATE TABLE IF NOT EXISTS games (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          start_timestamp TEXT NOT NULL,
          end_timestamp TEXT NOT NULL,
          actual_duration_seconds INTEGER NOT NULL,
          billable_minutes INTEGER NOT NULL,
          target_score INTEGER NOT NULL,
          price_per_minute REAL NOT NULL,
          total_cost REAL NOT NULL,
          winner TEXT NOT NULL,
          players TEXT NOT NULL,
          score_events TEXT NOT NULL,
          ranking TEXT NOT NULL,
          tie_groups TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `),
      getClient().execute(`
        CREATE TABLE IF NOT EXISTS players (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        )
      `),
    ]).then(() => undefined);
  }
  return schemaReady;
}
