import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { ActiveGame, PlayerCount, SavedPlayer } from '../types';
import { BackButton } from './BackButton';

interface GameSetupProps {
  players: SavedPlayer[];
  onAddPlayer: (id: string, name: string) => Promise<SavedPlayer | null>;
  onStart: (game: ActiveGame) => void;
  onCancel: () => void;
}

const PLAYER_COUNTS: PlayerCount[] = [1, 2, 3, 4];
const TARGET_PRESETS = [100, 200];
const DEFAULT_RATE = 13;

export function GameSetup({ players, onAddPlayer, onStart, onCancel }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [selectedIds, setSelectedIds] = useState<(string | null)[]>([null, null]);
  const [targetScore, setTargetScore] = useState<number>(100);
  const [customTarget, setCustomTarget] = useState('');
  const [useCustomTarget, setUseCustomTarget] = useState(false);
  const [pricePerMinute, setPricePerMinute] = useState<number>(DEFAULT_RATE);
  const [error, setError] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [savingNewPlayer, setSavingNewPlayer] = useState(false);

  function handleCountChange(count: PlayerCount) {
    setPlayerCount(count);
    setSelectedIds((prev) => {
      const next = [...prev];
      while (next.length < count) next.push(null);
      return next.slice(0, count);
    });
  }

  function handleSlotChange(index: number, value: string) {
    setSelectedIds((prev) => {
      const next = [...prev];
      next[index] = value || null;
      return next;
    });
  }

  async function handleAddNewPlayer() {
    const trimmed = newPlayerName.trim();
    if (!trimmed) {
      setError('Enter a name first.');
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('That player is already saved — pick them from the dropdown.');
      return;
    }
    setError('');
    setSavingNewPlayer(true);
    const created = await onAddPlayer(uuid(), trimmed);
    setSavingNewPlayer(false);
    if (!created) {
      setError('Could not save that player — check your connection and try again.');
      return;
    }
    setNewPlayerName('');
    setAddingNew(false);
    // Drop the new player straight into the first empty slot, if any.
    setSelectedIds((prev) => {
      const next = [...prev];
      const emptyIndex = next.slice(0, playerCount).findIndex((id) => !id);
      if (emptyIndex !== -1) next[emptyIndex] = created.id;
      return next;
    });
  }

  function handleSubmit() {
    const chosen = selectedIds.slice(0, playerCount);
    if (chosen.some((id) => !id)) {
      setError('Please select a player for every slot.');
      return;
    }
    const finalTarget = useCustomTarget ? Number(customTarget) : targetScore;
    if (!finalTarget || finalTarget <= 0) {
      setError('Please select or enter a valid target score.');
      return;
    }
    if (!pricePerMinute || pricePerMinute <= 0) {
      setError('Please enter a valid price per minute.');
      return;
    }

    const game: ActiveGame = {
      id: uuid(),
      players: chosen.map((id) => {
        const name = players.find((p) => p.id === id)?.name ?? 'Player';
        return { id: uuid(), name, score: 0 };
      }),
      targetScore: finalTarget,
      pricePerMinute,
      startTimestamp: new Date().toISOString(),
      scoreEvents: [],
      finishedOrder: [],
    };
    onStart(game);
  }

  return (
    <div className="min-h-svh px-5 py-8 flex flex-col items-center">
      <div className="w-full max-w-md fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <BackButton onClick={onCancel} />
          <h1 className="text-xl font-bold">New Century</h1>
          <div className="w-16" />
        </div>

        <section className="glass p-5 mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Number of Players</h2>
          <div className="grid grid-cols-4 gap-2">
            {PLAYER_COUNTS.map((count) => (
              <button
                key={count}
                onClick={() => handleCountChange(count)}
                className={`btn-press py-3 rounded-2xl font-bold text-lg ${
                  playerCount === count
                    ? 'bg-gradient-to-r from-emerald-300 to-sky-300 text-slate-900'
                    : 'bg-white/5 text-white/70 border border-white/10'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </section>

        <section className="glass p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Player Names</h2>
            <button
              onClick={() => setAddingNew((v) => !v)}
              className="text-xs font-semibold text-emerald-300"
            >
              {addingNew ? 'Cancel' : '+ New Player'}
            </button>
          </div>

          {players.length === 0 && !addingNew && (
            <p className="text-white/40 text-sm mb-3">No players saved yet — add one to get started.</p>
          )}

          {addingNew && (
            <div className="flex gap-2 mb-3">
              <input
                autoFocus
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNewPlayer()}
                placeholder="New player name"
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-base placeholder:text-white/30 focus:outline-none focus:border-emerald-300/60"
              />
              <button
                onClick={handleAddNewPlayer}
                disabled={savingNewPlayer}
                className="btn-press px-5 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-emerald-300 to-sky-300 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {Array.from({ length: playerCount }).map((_, i) => {
              const usedElsewhere = new Set(
                selectedIds.filter((id, idx) => idx !== i && id).map((id) => id as string),
              );
              const options = players.filter((p) => !usedElsewhere.has(p.id));
              return (
                <select
                  key={i}
                  value={selectedIds[i] ?? ''}
                  onChange={(e) => handleSlotChange(i, e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-300/60 disabled:opacity-40"
                >
                  <option value="" disabled>
                    Select Player {i + 1}
                  </option>
                  {options.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name}
                    </option>
                  ))}
                </select>
              );
            })}
          </div>
        </section>

        <section className="glass p-5 mb-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Century Closing Score</h2>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {TARGET_PRESETS.map((score) => (
              <button
                key={score}
                onClick={() => {
                  setTargetScore(score);
                  setUseCustomTarget(false);
                }}
                className={`btn-press py-3 rounded-2xl font-semibold ${
                  !useCustomTarget && targetScore === score
                    ? 'bg-gradient-to-r from-emerald-300 to-sky-300 text-slate-900'
                    : 'bg-white/5 text-white/70 border border-white/10'
                }`}
              >
                {score}
              </button>
            ))}
            <button
              onClick={() => setUseCustomTarget(true)}
              className={`btn-press py-3 rounded-2xl font-semibold ${
                useCustomTarget
                  ? 'bg-gradient-to-r from-emerald-300 to-sky-300 text-slate-900'
                  : 'bg-white/5 text-white/70 border border-white/10'
              }`}
            >
              Custom
            </button>
          </div>
          {useCustomTarget && (
            <input
              type="number"
              inputMode="numeric"
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              placeholder="Enter target score"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-base placeholder:text-white/30 focus:outline-none focus:border-emerald-300/60"
            />
          )}
        </section>

        <section className="glass p-5 mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Price Per Minute (PKR)</h2>
          <input
            type="number"
            inputMode="decimal"
            value={pricePerMinute}
            onChange={(e) => setPricePerMinute(Number(e.target.value))}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-emerald-300/60"
          />
        </section>

        {error && <p className="text-rose-300 text-sm mb-4 text-center">{error}</p>}

        <button
          onClick={handleSubmit}
          className="btn-press w-full py-5 rounded-3xl text-lg font-bold text-slate-900 bg-gradient-to-r from-emerald-300 to-sky-300 shadow-[0_8px_30px_rgba(52,211,153,0.35)]"
        >
          Start Century
        </button>
      </div>
    </div>
  );
}
