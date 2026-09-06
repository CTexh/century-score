import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { ActiveGame, PlayerCount } from '../types';
import { BackButton } from './BackButton';

interface GameSetupProps {
  onStart: (game: ActiveGame) => void;
  onCancel: () => void;
}

const PLAYER_COUNTS: PlayerCount[] = [1, 2, 3, 4];
const TARGET_PRESETS = [100, 200];
const DEFAULT_RATE = 13;

export function GameSetup({ onStart, onCancel }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState<PlayerCount>(2);
  const [names, setNames] = useState<string[]>(['', '']);
  const [targetScore, setTargetScore] = useState<number>(100);
  const [customTarget, setCustomTarget] = useState('');
  const [useCustomTarget, setUseCustomTarget] = useState(false);
  const [pricePerMinute, setPricePerMinute] = useState<number>(DEFAULT_RATE);
  const [error, setError] = useState('');

  function handleCountChange(count: PlayerCount) {
    setPlayerCount(count);
    setNames((prev) => {
      const next = [...prev];
      while (next.length < count) next.push('');
      return next.slice(0, count);
    });
  }

  function handleNameChange(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleSubmit() {
    const trimmed = names.slice(0, playerCount).map((n) => n.trim());
    if (trimmed.some((n) => n.length === 0)) {
      setError('Please enter a name for every player.');
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
      players: trimmed.map((name) => ({ id: uuid(), name, score: 0 })),
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
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Player Names</h2>
          <div className="flex flex-col gap-3">
            {Array.from({ length: playerCount }).map((_, i) => (
              <input
                key={i}
                value={names[i] ?? ''}
                onChange={(e) => handleNameChange(i, e.target.value)}
                placeholder={`Player ${i + 1} name`}
                className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-base placeholder:text-white/30 focus:outline-none focus:border-emerald-300/60"
              />
            ))}
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
