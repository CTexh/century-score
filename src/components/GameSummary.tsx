import type { CompletedGame } from '../types';
import { formatDuration, formatPKR } from '../lib/billing';

interface GameSummaryProps {
  game: CompletedGame;
}

/** Duration/billing breakdown + final ranking — shared by the fresh results screen and history detail. */
export function GameSummary({ game }: GameSummaryProps) {
  return (
    <>
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

      <section className="glass-strong p-5">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Final Ranking</h2>
        <div className="flex flex-col gap-2">
          {game.ranking.map((r) => (
            <div
              key={r.player.id}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                r.rank === 1
                  ? 'bg-gradient-to-r from-emerald-400/20 to-sky-400/20 border border-emerald-300/30'
                  : 'bg-white/5'
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
                <div className="text-xs text-white/40">{r.amountOwed > 0 ? 'Pays the bill' : '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {game.lowestTieBreak && (
        <p className="text-xs text-white/40 text-center mt-4">
          {game.lowestTieBreak.tiedPlayerIds.length} players tied for the lowest score — resolved manually.
        </p>
      )}
    </>
  );
}
