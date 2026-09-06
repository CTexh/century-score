import { useMemo, useState } from 'react';
import type { CompletedGame } from '../types';
import { formatDuration, formatPKR, localDateFromKey, toLocalDateKey } from '../lib/billing';
import { aggregateDaily, groupByDay } from '../lib/stats';
import { ConfirmModal } from './ConfirmModal';
import { GameSummary } from './GameSummary';
import { BackButton } from './BackButton';

interface HistoryScreenProps {
  history: CompletedGame[];
  onDelete: (gameId: string) => void;
  onBack: () => void;
}

export function HistoryScreen({ history, onDelete, onBack }: HistoryScreenProps) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return history.filter((g) => {
      const matchesSearch =
        search.trim() === '' || g.players.some((p) => p.name.toLowerCase().includes(search.trim().toLowerCase()));
      const matchesDate = dateFilter === '' || toLocalDateKey(g.date) === dateFilter;
      return matchesSearch && matchesDate;
    });
  }, [history, search, dateFilter]);

  // Only days that actually have a game produce a group — no empty "no games" entries.
  const dayGroups = useMemo(() => groupByDay(filtered), [filtered]);

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
          <BackButton onClick={onBack} />
          <h1 className="text-xl font-bold">Game History</h1>
          <div className="w-16" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

        {dayGroups.length === 0 ? (
          <p className="text-white/40 text-center py-16">No games found.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {dayGroups.map(({ date, games }) => {
              const summary = aggregateDaily(games);
              return (
                <div key={date}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-base font-bold">
                      {localDateFromKey(date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </h2>
                    <span className="text-xs text-white/40">
                      {summary.gamesCount} game{summary.gamesCount === 1 ? '' : 's'} · {summary.totalMinutes} min ·{' '}
                      {formatPKR(summary.totalCost)}
                    </span>
                  </div>

                  <section className="glass-strong p-5 mb-4 fade-in-up">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Day Summary</h3>
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="bg-white/5 rounded-xl py-2.5">
                        <div className="text-[10px] uppercase tracking-wide text-white/40">Games</div>
                        <div className="font-semibold">{summary.gamesCount}</div>
                      </div>
                      <div className="bg-white/5 rounded-xl py-2.5">
                        <div className="text-[10px] uppercase tracking-wide text-white/40">Total Minutes</div>
                        <div className="font-semibold text-emerald-300">{summary.totalMinutes} min</div>
                      </div>
                      <div className="bg-white/5 rounded-xl py-2.5">
                        <div className="text-[10px] uppercase tracking-wide text-white/40">Total Cost</div>
                        <div className="font-semibold">{formatPKR(summary.totalCost)}</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {summary.playerTotals.map((p) => (
                        <div key={p.name} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5">
                          <span className="font-medium text-sm">{p.name}</span>
                          <span
                            className={`font-bold text-sm ${p.amountPaid > 0 ? 'text-rose-300' : 'text-emerald-300'}`}
                          >
                            {formatPKR(p.amountPaid)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <div className="flex flex-col gap-3">
                    {games.map((game) => {
                      const loser = game.ranking[game.ranking.length - 1];
                      const isOpen = expandedId === game.id;
                      return (
                        <div key={game.id} className="glass p-4">
                          <button className="w-full text-left" onClick={() => setExpandedId(isOpen ? null : game.id)}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-white/40">
                                {new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="text-sm font-bold text-emerald-300">{formatPKR(game.totalCost)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold">🏆 {game.winner}</div>
                                {loser && loser.amountOwed > 0 && (
                                  <div className="text-xs text-rose-300">
                                    {loser.player.name} pays {formatPKR(loser.amountOwed)}
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-sm text-white/50 flex items-center gap-2">
                                {formatDuration(game.actualDurationSeconds)}
                                <span className="text-white/30">{isOpen ? '▲' : '▼'}</span>
                              </div>
                            </div>
                          </button>

                          {isOpen && (
                            <div className="mt-4 fade-in-up">
                              <GameSummary game={game} />
                            </div>
                          )}

                          <div className="flex gap-2 mt-3">
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
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
