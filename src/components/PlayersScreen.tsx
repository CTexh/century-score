import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { SavedPlayer } from '../types';
import { BackButton } from './BackButton';
import { ConfirmModal } from './ConfirmModal';

interface PlayersScreenProps {
  players: SavedPlayer[];
  onAdd: (id: string, name: string) => Promise<SavedPlayer | null>;
  onDelete: (id: string) => void;
  onBack: () => void;
}

export function PlayersScreen({ players, onAdd, onDelete, onBack }: PlayersScreenProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<SavedPlayer | null>(null);
  const [saving, setSaving] = useState(false);

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
          <h1 className="text-xl font-bold">Manage Players</h1>
          <div className="w-16" />
        </div>

        <p className="text-white/50 text-sm text-center mb-6">
          Save your regulars here. When starting a Century, you pick names from this list instead of typing them.
        </p>

        <section className="glass p-5 mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Add Player</h2>
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Player name"
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
          <div className="flex flex-col gap-2">
            {players.map((p) => (
              <div key={p.id} className="glass flex items-center justify-between px-4 py-3">
                <span className="font-medium">{p.name}</span>
                <button
                  onClick={() => setPendingDelete(p)}
                  className="btn-press text-xs font-semibold text-rose-300 bg-rose-400/10 px-3 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
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
