export type PlayerCount = 1 | 2 | 3 | 4;

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface ScoreEvent {
  id: string;
  playerId: string;
  playerName: string;
  delta: number;
  newTotal: number;
  timestamp: string; // ISO
}

export interface TieGroup {
  playerIds: string[];
  method: 'manual' | 'split';
  // for manual: ordered list of playerIds from higher to lower rank within the group
  manualOrder?: string[];
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
  tieGroups: TieGroup[];
}
