import type { ActiveGame, CompletedGame, SavedPlayer } from '../types';

// Active game state stays in localStorage (frequent writes, single device, ephemeral).
// Completed games and the saved player roster are persisted server-side in Turso via
// /api/games and /api/players, with a local cache as a fallback if the network/API is
// unavailable.

const ACTIVE_GAME_KEY = 'century-score:active-game';
const HISTORY_CACHE_KEY = 'century-score:history-cache';
const PLAYERS_CACHE_KEY = 'century-score:players-cache';

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

function cacheHistory(history: CompletedGame[]): void {
  localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(history));
}

function loadCachedHistory(): CompletedGame[] {
  const raw = localStorage.getItem(HISTORY_CACHE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CompletedGame[];
  } catch {
    return [];
  }
}

export async function loadHistory(): Promise<CompletedGame[]> {
  try {
    const res = await fetch('/api/games');
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const history = (await res.json()) as CompletedGame[];
    cacheHistory(history);
    return history;
  } catch {
    return loadCachedHistory();
  }
}

export async function addGameToHistory(game: CompletedGame): Promise<CompletedGame[]> {
  try {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(game),
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  } catch {
    // fall through — still update the local cache so the result isn't lost
  }
  return loadHistory();
}

export async function deleteGameFromHistory(gameId: string): Promise<CompletedGame[]> {
  try {
    const res = await fetch(`/api/games/${gameId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  } catch {
    // fall through
  }
  return loadHistory();
}

function cachePlayers(players: SavedPlayer[]): void {
  localStorage.setItem(PLAYERS_CACHE_KEY, JSON.stringify(players));
}

function loadCachedPlayers(): SavedPlayer[] {
  const raw = localStorage.getItem(PLAYERS_CACHE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedPlayer[];
  } catch {
    return [];
  }
}

export async function loadPlayers(): Promise<SavedPlayer[]> {
  try {
    const res = await fetch('/api/players');
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    const players = (await res.json()) as SavedPlayer[];
    cachePlayers(players);
    return players;
  } catch {
    return loadCachedPlayers();
  }
}

/** Adds a player to the roster, or returns the existing entry if that name is already saved. */
export async function addPlayer(id: string, name: string): Promise<SavedPlayer | null> {
  try {
    const res = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as SavedPlayer;
  } catch {
    return null;
  }
}

export async function deletePlayer(id: string): Promise<SavedPlayer[]> {
  try {
    const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  } catch {
    // fall through
  }
  return loadPlayers();
}
