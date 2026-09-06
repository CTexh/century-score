import type { Player, RankedPlayer, ScoreEvent } from '../types';
import { getPercentageTable } from './payment';

/**
 * Of a set of still-active players, finds whether more than one shares the lowest
 * score — the only tie that can ever matter, since that's who the game would charge
 * the full bill to if closed right now. Returns null when there's a unique lowest
 * scorer (the common case) or fewer than 2 players.
 */
export function findLowestScoreTie(players: Player[]): Player[] | null {
  if (players.length < 2) return null;
  const minScore = Math.min(...players.map((p) => p.score));
  const tied = players.filter((p) => p.score === minScore);
  return tied.length > 1 ? tied : null;
}

/**
 * Of the still-active players, finds whichever one should be prompted next for
 * elimination: the one who reached the target score earliest, based on the score
 * event that first pushed their running total to/past it. Returns null if nobody
 * currently active has reached the target.
 */
export function findNextToFinish(
  activePlayers: Player[],
  targetScore: number,
  scoreEvents: ScoreEvent[],
  excludeId?: string | null,
): Player | null {
  const candidates = activePlayers.filter((p) => p.id !== excludeId && p.score >= targetScore);
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  const crossedAt = (playerId: string): string => {
    const hit = scoreEvents.find((e) => e.playerId === playerId && e.newTotal >= targetScore);
    return hit?.timestamp ?? '';
  };
  return [...candidates].sort((a, b) => crossedAt(a.id).localeCompare(crossedAt(b.id)))[0];
}

/**
 * Computes the final ranking + payout. Players in `finishedOrder` are locked in at
 * ranks 1..k in that exact order (they reached the target and were confirmed out) —
 * there can never be a tie among them, since elimination happens one at a time.
 * Any players not yet finished are ranked among themselves by score and appended
 * after the finished players; the lowest scorer among them is the loser (last place,
 * pays the bill). If two or more of them tie for lowest, `chosenLoserId` says which
 * one the table picked.
 */
export function computeRanking(
  players: Player[],
  totalCost: number,
  finishedOrder: string[] = [],
  chosenLoserId?: string,
): RankedPlayer[] {
  const lockedOrder = finishedOrder.filter((id) => players.some((p) => p.id === id));
  const remaining = players.filter((p) => !lockedOrder.includes(p.id));

  let remainingOrder: string[];
  if (remaining.length <= 1) {
    remainingOrder = remaining.map((p) => p.id);
  } else {
    const sorted = [...remaining].sort((a, b) => b.score - a.score);
    const loserId =
      chosenLoserId && remaining.some((p) => p.id === chosenLoserId) ? chosenLoserId : sorted[sorted.length - 1].id;
    remainingOrder = [...sorted.filter((p) => p.id !== loserId).map((p) => p.id), loserId];
  }

  const fullOrder = [...lockedOrder, ...remainingOrder];
  const percentageTable = getPercentageTable(players.length);
  const playerById = new Map(players.map((p) => [p.id, p]));
  return fullOrder.map((id, idx) => {
    const player = playerById.get(id)!;
    const percentage = percentageTable[idx] ?? 0;
    return {
      player,
      rank: idx + 1,
      percentage,
      amountOwed: Math.round((totalCost * percentage) / 100),
    };
  });
}
