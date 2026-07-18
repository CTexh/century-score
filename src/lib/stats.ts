import type { CompletedGame } from '../types';

export interface PlayerStats {
  name: string;
  gamesPlayed: number;
  wins: number;
  winPercentage: number;
  totalScore: number;
  totalPaid: number;
  averagePaid: number;
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
