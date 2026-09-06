import type { CompletedGame } from '../types';
import { toLocalDateKey } from './billing';

export interface PlayerStats {
  name: string;
  gamesPlayed: number;
  wins: number;
  winPercentage: number;
  totalScore: number;
  totalPaid: number;
  averagePaid: number;
}

export interface DailyAggregate {
  gamesCount: number;
  totalMinutes: number;
  totalCost: number;
  playerTotals: { name: string; amountPaid: number }[];
}

/** Aggregates billable minutes, table cost, and per-player amounts paid across a set of games. */
export function aggregateDaily(games: CompletedGame[]): DailyAggregate {
  const totalMinutes = games.reduce((sum, g) => sum + g.billableMinutes, 0);
  const totalCost = games.reduce((sum, g) => sum + g.totalCost, 0);

  const byPlayer = new Map<string, number>();
  for (const game of games) {
    for (const ranked of game.ranking) {
      byPlayer.set(ranked.player.name, (byPlayer.get(ranked.player.name) ?? 0) + ranked.amountOwed);
    }
  }
  const playerTotals = [...byPlayer.entries()]
    .map(([name, amountPaid]) => ({ name, amountPaid }))
    .sort((a, b) => b.amountPaid - a.amountPaid);

  return { gamesCount: games.length, totalMinutes, totalCost, playerTotals };
}

/** Groups games by local calendar day (most recent first) — days with no games are simply absent. */
export function groupByDay(games: CompletedGame[]): { date: string; games: CompletedGame[] }[] {
  const byDay = new Map<string, CompletedGame[]>();
  for (const game of games) {
    const key = toLocalDateKey(game.date);
    const bucket = byDay.get(key);
    if (bucket) bucket.push(game);
    else byDay.set(key, [game]);
  }
  return [...byDay.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, dayGames]) => ({ date, games: dayGames }));
}

export function computePlayerStats(history: CompletedGame[]): PlayerStats[] {
  const byName = new Map<string, PlayerStats>();

  for (const game of history) {
    for (const ranked of game.ranking) {
      const name = ranked.player.name;
      const existing = byName.get(name) ?? {
        name,
        gamesPlayed: 0,
        wins: 0,
        winPercentage: 0,
        totalScore: 0,
        totalPaid: 0,
        averagePaid: 0,
      };
      existing.gamesPlayed += 1;
      if (ranked.rank === 1) existing.wins += 1;
      existing.totalScore += ranked.player.score;
      existing.totalPaid += ranked.amountOwed;
      byName.set(name, existing);
    }
  }

  return [...byName.values()]
    .map((s) => ({
      ...s,
      winPercentage: s.gamesPlayed ? Math.round((s.wins / s.gamesPlayed) * 100) : 0,
      averagePaid: s.gamesPlayed ? Math.round(s.totalPaid / s.gamesPlayed) : 0,
    }))
    .sort((a, b) => b.wins - a.wins || b.gamesPlayed - a.gamesPlayed);
}
