import type { Player, RankedPlayer, ScoreEvent, TieGroup } from '../types';
import { getPercentageTable } from './payment';

export interface DetectedTie {
  score: number;
  playerIds: string[];
  // rank range this tie occupies, 1-indexed, inclusive
  startRank: number;
  endRank: number;
}

/** Sorts players by score descending and detects groups of players sharing the same score. */
export function detectTies(players: Player[]): DetectedTie[] {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const ties: DetectedTie[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].score === sorted[i].score) j++;
    if (j - i > 1) {
      ties.push({
        score: sorted[i].score,
        playerIds: sorted.slice(i, j).map((p) => p.id),
        startRank: i + 1,
        endRank: j,
      });
    }
    i = j;
  }
  return ties;
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
 * ranks 1..k in that exact order (they reached the target and were confirmed out).
 * Any players not yet finished are ranked among themselves by score (using `tieGroups`
 * to resolve ties) and appended after the finished players.
 */
export function computeRanking(
  players: Player[],
  totalCost: number,
  finishedOrder: string[] = [],
  tieGroups: TieGroup[] = [],
): RankedPlayer[] {
  const lockedOrder = finishedOrder.filter((id) => players.some((p) => p.id === id));
  const remaining = players.filter((p) => !lockedOrder.includes(p.id));

  const remainingOrder: string[] = [];
  const sorted = [...remaining].sort((a, b) => b.score - a.score);
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].score === sorted[i].score) j++;
    const group = sorted.slice(i, j);
    if (group.length > 1) {
      const resolution = tieGroups.find(
        (t) => t.playerIds.length === group.length && t.playerIds.every((id) => group.some((p) => p.id === id)),
      );
      if (resolution?.method === 'manual' && resolution.manualOrder) {
        remainingOrder.push(...resolution.manualOrder);
      } else {
        remainingOrder.push(...group.map((p) => p.id));
      }
    } else {
      remainingOrder.push(group[0].id);
    }
    i = j;
  }

  const fullOrder = [...lockedOrder, ...remainingOrder];
  const percentageTable = getPercentageTable(players.length);
  const percentages = new Map<string, number>();
  fullOrder.forEach((id, idx) => percentages.set(id, percentageTable[idx] ?? 0));

  for (const group of tieGroups) {
    if (group.method === 'split') {
      const indices = group.playerIds.map((id) => fullOrder.indexOf(id));
      const sum = indices.reduce((acc, idx) => acc + (percentageTable[idx] ?? 0), 0);
      const share = sum / group.playerIds.length;
      group.playerIds.forEach((id) => percentages.set(id, share));
    }
  }

  const playerById = new Map(players.map((p) => [p.id, p]));
  return fullOrder.map((id, idx) => {
    const player = playerById.get(id)!;
    const percentage = percentages.get(id) ?? 0;
    return {
      player,
      rank: idx + 1,
      percentage,
      amountOwed: Math.round((totalCost * percentage) / 100),
    };
  });
}
