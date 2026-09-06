export type PlayerCount = 1 | 2 | 3 | 4;

export interface Player {
  id: string;
  name: string;
  score: number;
}

// A saved roster entry — the only source of names offered when starting a new game.
export interface SavedPlayer {
  id: string;
  name: string;
}

export interface ScoreEvent {
  id: string;
  playerId: string;
  playerName: string;
  delta: number;
  newTotal: number;
  timestamp: string; // ISO
}

// Records how a tie for the lowest (losing) score at a manual mid-game close was
// resolved. Ties can only happen among players still active when the table stops the
// game early — the natural elimination-race conclusion never produces one.
export interface TieBreak {
  tiedPlayerIds: string[];
  chosenLoserId: string;
}

export interface RankedPlayer {
  player: Player;
  rank: number;
  percentage: number;
  amountOwed: number;
}

export interface ActiveGame {
  id: string;
  players: Player[];
  targetScore: number;
  pricePerMinute: number;
  startTimestamp: string; // ISO
  scoreEvents: ScoreEvent[];
  // Player ids in the order they reached the target score and were confirmed out,
  // rank 1 (winner) first. The one player never in this list is the last-place loser.
  finishedOrder: string[];
}

export interface CompletedGame {
  id: string;
  date: string; // ISO date (day)
  startTimestamp: string;
  endTimestamp: string;
  actualDurationSeconds: number;
  billableMinutes: number;
  targetScore: number;
  pricePerMinute: number;
  totalCost: number;
  players: Player[];
  scoreEvents: ScoreEvent[];
  ranking: RankedPlayer[];
  winner: string;
  lowestTieBreak: TieBreak | null;
}
