import { useMemo, useState } from 'react';
import type { CompletedGame } from '../types';
import { formatDuration, formatPKR } from '../lib/billing';
import { ConfirmModal } from './ConfirmModal';

interface HistoryScreenProps {
  history: CompletedGame[];
  onSelect: (game: CompletedGame) => void;
  onDelete: (gameId: string) => void;
  onBack: () => void;
}

export function HistoryScreen({ history, onSelect, onDelete, onBack }: HistoryScreenProps) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return history.filter((g) => {
      const matchesSearch =
        search.trim() === '' || g.players.some((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));
      const matchesDate = dateFilter === '' || g.date.slice(0, 10) === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [history, search, dateFilter]);

  function share(game: CompletedGame) {
    const lines = [
      `Century Score — ${new Date(game.date).toLocaleDateString()}`,
      `Winner: ${game.winner}`,
      `Duration: ${formatDuration(game.actualDurationSeconds)} | Cost: ${formatPKR(game.totalCost)}`,
      ...game.ranking.map((r) => `${r.rank}. ${r.player.name} — ${r.player.score} pts — ${formatPKR(r.amountOwed)}`),
    ].join('\n');
    if (navigator.share) {
      navigator.share({ title: 'Century Score Result', text: lines }).catch(() => {});
    } else {
      navigator.clipboard.writeText(lines).catch(() => {});
    }
  }

  return (
    <div className="min-h-svh px-5 py-8 max-w-2xl mx-auto">
      <div className="fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-white/60 text-sm px-2 py-1">
            ← Back
          </button>
          <h1 className="text-xl font-bold">Game History</h1>
          <div className="w-12" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by player name"
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-emerald-300/60"
          />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-300/60"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-white/40 text-center py-16">No games found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((game) => (
              <div key={game.id} className="glass p-4 cursor-pointer" onClick={() => onSelect(game)}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/40">
                    {new Date(game.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-sm font-bold text-emerald-300">{formatPKR(game.totalCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">🏆 {game.winner}</div>
                    <div className="text-xs text-white/40">{game.players.map((p) => p.name).join(', ')}</div>
                  </div>
                  <div className="text-right text-sm text-white/50">{formatDuration(game.actualDurationSeconds)}</div>
                </div>
                <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => share(game)}
                    className="btn-press flex-1 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white/70"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => setPendingDelete(game.id)}
                    className="btn-press flex-1 py-2 rounded-xl text-xs font-semibold bg-rose-400/10 text-rose-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingDelete && (
        <ConfirmModal
          title="Delete this game?"
          message="This will permanently remove the game record from history."
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            onDelete(pendingDelete);
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
