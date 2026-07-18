import type { CompletedGame } from '../types';
import { formatDuration, formatPKR } from '../lib/billing';

interface ResultsScreenProps {
  game: CompletedGame;
  isFresh?: boolean;
  onSaveAndFinish?: () => void;
  onStartAnother?: () => void;
  onViewHistory?: () => void;
  onBack?: () => void;
}

export function ResultsScreen({
  game,
  isFresh,
  onSaveAndFinish,
  onStartAnother,
  onViewHistory,
  onBack,
}: ResultsScreenProps) {
  return (
    <div className="min-h-svh px-5 py-8 max-w-md mx-auto">
      <div className="fade-in-up">
        {onBack && (
          <button onClick={onBack} className="text-white/60 text-sm mb-4">
            ← Back
          </button>
        )}
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-widest text-emerald-300/80 mb-1">Century Completed</div>
          <h1 className="text-2xl font-bold">{game.winner} Wins</h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date(game.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <section className="glass p-5 mb-4 grid grid-cols-2 gap-3 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">Duration</div>
            <div className="font-semibold">{formatDuration(game.actualDurationSeconds)}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">Billable Minutes</div>
            <div className="font-semibold">{game.billableMinutes} min</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">Rate</div>
            <div className="font-semibold">{formatPKR(game.pricePerMinute)}/min</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wide text-white/40">Total Cost</div>
            <div className="font-semibold text-emerald-300">{formatPKR(game.totalCost)}</div>
          </div>
        </section>

        <section className="glass p-4 mb-4">
          <div className="flex justify-between text-xs text-white/40 mb-2 px-1">
            <span>Started</span>
            <span>Ended</span>
          </div>
          <div className="flex justify-between text-sm font-medium px-1">
            <span>{new Date(game.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{new Date(game.endTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </section>

        <section className="glass-strong p-5 mb-6">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Final Ranking</h2>
          <div className="flex flex-col gap-2">
            {game.ranking.map((r) => (
              <div
                key={r.player.id}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  r.rank === 1 ? 'bg-gradient-to-r from-emerald-400/20 to-sky-400/20 border border-emerald-300/30' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      r.rank === 1 ? 'bg-emerald-300 text-emerald-950' : 'bg-white/10 text-white/70'
                    }`}
                  >
                    {r.rank}
                  </span>
                  <div>
                    <div className="font-semibold">{r.player.name}</div>
                    <div className="text-xs text-white/40">Score: {r.player.score}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${r.amountOwed === 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {formatPKR(r.amountOwed)}
                  </div>
                  <div className="text-xs text-white/40">{r.percentage.toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {game.tieGroups.length > 0 && (
          <p className="text-xs text-white/40 text-center mb-6">
            Tie resolved via {game.tieGroups.map((t) => t.method).join(', ')} method.
          </p>
        )}

        {isFresh && (
          <div className="flex flex-col gap-3">
            <button
              onClick={onSaveAndFinish}
              className="btn-press w-full py-4 rounded-3xl text-base font-bold text-slate-900 bg-gradient-to-r from-emerald-300 to-sky-300"
            >
              Save and Finish
            </button>
            <button onClick={onStartAnother} className="btn-press glass w-full py-4 rounded-3xl font-semibold">
              Start Another Century
            </button>
            <button onClick={onViewHistory} className="btn-press glass w-full py-3.5 rounded-3xl text-sm text-white/70">
              View Game History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
