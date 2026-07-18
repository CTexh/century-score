// Default payout percentage tables by player count, ordered from rank 1 (winner) to last place.
// Reusable/configurable: swap this table to change payout rules without touching calculation logic.
export const DEFAULT_PERCENTAGE_TABLES: Record<number, number[]> = {
  1: [0],
  2: [0, 100],
  3: [0, 30, 70],
  4: [0, 10, 30, 60],
};

export function getPercentageTable(playerCount: number): number[] {
  const table = DEFAULT_PERCENTAGE_TABLES[playerCount];
  if (!table) throw new Error(`No percentage table configured for ${playerCount} players`);
  return table;
}
