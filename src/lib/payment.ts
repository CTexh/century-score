// Payout rule: whoever finishes last pays the entire table bill; everyone else pays
// nothing. Kept as its own function (rather than inlined into ranking) so the rule can
// be swapped out later without touching ranking/elimination logic.
export function getPercentageTable(playerCount: number): number[] {
  if (playerCount <= 1) return [0];
  return Array(playerCount - 1).fill(0).concat(100);
}
