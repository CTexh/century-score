import type { ActiveGame, CompletedGame } from '../types';

// Centralized persistence layer. Swap these functions to move from localStorage to a
// backend (Supabase/Firebase/Turso/Postgres) without touching calling code.

const ACTIVE_GAME_KEY = 'century-score:active-game';
const HISTORY_KEY = 'century-score:history';

export function saveActiveGame(game: ActiveGame): void {
  localStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(game));
}

export function loadActiveGame(): ActiveGame | null {
  const raw = localStorage.getItem(ACTIVE_GAME_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ActiveGame;
  } catch {
    return null;
  }
}

export function clearActiveGame(): void {
  localStorage.removeItem(ACTIVE_GAME_KEY);
}

export function loadHistory(): CompletedGame[] {
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CompletedGame[];
  } catch {
    return [];
  }
}

export function saveHistory(history: CompletedGame[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function addGameToHistory(game: CompletedGame): CompletedGame[] {
  const history = loadHistory();
  const updated = [game, ...history];
  saveHistory(updated);
  return updated;
}

export function deleteGameFromHistory(gameId: string): CompletedGame[] {
  const updated = loadHistory().filter((g) => g.id !== gameId);
  saveHistory(updated);
  return updated;
}
