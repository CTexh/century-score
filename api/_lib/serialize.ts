import type { Row } from '@libsql/client';

export interface GameRow {
  id: string;
  date: string;
  startTimestamp: string;
  endTimestamp: string;
  actualDurationSeconds: number;
  billableMinutes: number;
  targetScore: number;
  pricePerMinute: number;
  totalCost: number;
  winner: string;
  players: unknown[];
  scoreEvents: unknown[];
  ranking: unknown[];
  lowestTieBreak: unknown;
}

export function rowToGame(row: Row): GameRow {
  // Older records stored an array here (a since-removed multi-tie-group format).
  // Only the new { tiedPlayerIds, chosenLoserId } shape (or null) is valid now.
  const parsedTieBreak = JSON.parse(String(row.tie_groups));
  const lowestTieBreak =
    parsedTieBreak && !Array.isArray(parsedTieBreak) && typeof parsedTieBreak === 'object' ? parsedTieBreak : null;

  return {
    id: String(row.id),
    date: String(row.date),
    startTimestamp: String(row.start_timestamp),
    endTimestamp: String(row.end_timestamp),
    actualDurationSeconds: Number(row.actual_duration_seconds),
    billableMinutes: Number(row.billable_minutes),
    targetScore: Number(row.target_score),
    pricePerMinute: Number(row.price_per_minute),
    totalCost: Number(row.total_cost),
    winner: String(row.winner),
    players: JSON.parse(String(row.players)),
    scoreEvents: JSON.parse(String(row.score_events)),
    ranking: JSON.parse(String(row.ranking)),
    lowestTieBreak,
  };
}
