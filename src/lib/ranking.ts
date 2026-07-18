import type { Player, RankedPlayer, TieGroup } from '../types';
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
 * Computes final ranking + payment distribution.
 * `tieGroups` must contain a resolution for every group returned by detectTies, otherwise
 * ties are broken arbitrarily by original array order (stable sort).
 */
export function computeRanking(
  players: Player[],
  totalCost: number,
  tieGroups: TieGroup[] = [],
): RankedPlayer[] {
  const percentageTable = getPercentageTable(players.length);

  // Establish a definitive order (array of player ids, rank 1 first).
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const order: string[] = [];
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
        order.push(...resolution.manualOrder);
      } else {
        order.push(...group.map((p) => p.id));
      }
    } else {
      order.push(group[0].id);
    }
    i = j;
  }

  // Assign percentages per rank slot, then override with equal-split for 'split' tie groups.
  const percentages = new Map<string, number>();
  order.forEach((id, idx) => percentages.set(id, percentageTable[idx] ?? 0));

  for (const group of tieGroups) {
    if (group.method === 'split') {
      const indices = group.playerIds.map((id) => order.indexOf(id));
      const sum = indices.reduce((acc, idx) => acc + (percentageTable[idx] ?? 0), 0);
      const share = sum / group.playerIds.length;
      group.playerIds.forEach((id) => percentages.set(id, share));
    }
  }

  const playerById = new Map(players.map((p) => [p.id, p]));
  return order.map((id, idx) => {
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
