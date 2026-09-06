import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { CompletedGame, SavedPlayer } from '../types';
import { computePlayerStats } from '../lib/stats';
import { formatPKR } from '../lib/billing';
import { BackButton } from './BackButton';
import { ConfirmModal } from './ConfirmModal';

interface PlayersScreenProps {
  players: SavedPlayer[];
  history: CompletedGame[];
  onAdd: (id: string, name: string) => Promise<SavedPlayer | null>;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function PlayersScreen({ players, history, onAdd, onDelete, onBack }: PlayersScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<SavedPlayer | null>(null);
  const [saving, setSaving] = useState(false);

  const statsByName = useMemo(() => {
    const map = new Map<string, ReturnType<typeof computePlayerStats>[number]>();
    for (const s of computePlayerStats(history)) map.set(s.name.toLowerCase(), s);
    return map;
  }, [history]);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Enter a name first.');
      return;
    }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('That player is already saved.');
      return;
    }
    setError('');
    setSaving(true);
    const result = await onAdd(uuid(), trimmed);
    setSaving(false);
    if (result) {
      setName('');
    } else {
      setError('Could not save that player — check your connection and try again.');
    }
  }

  return (
    <div className="min-h-svh px-5 py-8 max-w-md mx-auto">
      <div className="fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <BackButton onClick={onBack} />
          <h1 className="text-xl font-bold">Players</h1>
          <div className="w-16" />
        </div>

        <section className="glass p-5 mb-6">
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add a player name"
              className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-base placeholder:text-white/30 focus:outline-none focus:border-emerald-300/60"
            />
            <button
              onClick={handleAdd}
              disabled={saving}
              className="btn-press px-6 rounded-xl font-bold text-slate-900 bg-gradient-to-r from-emerald-300 to-sky-300 disabled:opacity-50"
            >
              Add
            </button>
          </div>
          {error && <p className="text-rose-300 text-sm mt-3">{error}</p>}
        </section>

        {players.length === 0 ? (
          <p className="text-white/40 text-center py-16">No players saved yet. Add your first one above.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {players.map((p) => {
              const stats = statsByName.get(p.name.toLowerCase());
              return (
                <div key={p.id} className="glass p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-base">{p.name}</span>
                    <button
                      onClick={() => setPendingDelete(p)}
                      className="btn-press text-xs font-semibold text-rose-300 bg-rose-400/10 px-3 py-1.5 rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                  {stats ? (
                    <div className="flex items-center gap-4 text-xs text-white/60">
                      <span>
                        <span className="text-white font-semibold">{stats.gamesPlayed}</span> games
                      </span>
                      <span>
                        <span className="text-emerald-300 font-semibold">{stats.wins}</span> wins
                      </span>
                      <span>
                        <span className="text-white font-semibold">{stats.winPercentage}%</span> rate
                      </span>
                      <span className="ml-auto">
                        <span className="text-rose-300 font-semibold">{formatPKR(stats.totalPaid)}</span> paid
                      </span>
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs">No games played yet</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmModal
          title="Remove this player?"
          message={`${pendingDelete.name} will no longer appear when starting a new Century. Past games are not affected.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => {
            onDelete(pendingDelete.id);
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
