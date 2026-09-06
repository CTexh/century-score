import type { CompletedGame } from '../types';
import { computePlayerStats } from '../lib/stats';
import { formatPKR } from '../lib/billing';
import { BackButton } from './BackButton';

interface StatsScreenProps {
  history: CompletedGame[];
  onBack: () => void;
}

export function StatsScreen({ history, onBack }: StatsScreenProps) {
  const stats = computePlayerStats(history);

  return (
    <div className="min-h-svh px-5 py-8 max-w-2xl mx-auto">
      <div className="fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <BackButton onClick={onBack} />
          <h1 className="text-xl font-bold">Player Statistics</h1>
          <div className="w-16" />
        </div>

        {stats.length === 0 ? (
          <p className="text-white/40 text-center py-16">No completed games yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.map((s) => (
              <div key={s.name} className="glass p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">{s.name}</h2>
                  <span className="text-xs bg-white/10 px-3 py-1 rounded-full text-white/60">
                    {s.gamesPlayed} games
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-xl py-2.5">
                    <div className="text-[10px] uppercase tracking-wide text-white/40">Wins</div>
                    <div className="font-semibold text-emerald-300">{s.wins}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl py-2.5">
                    <div className="text-[10px] uppercase tracking-wide text-white/40">Win %</div>
                    <div className="font-semibold">{s.winPercentage}%</div>
                  </div>
                  <div className="bg-white/5 rounded-xl py-2.5">
                    <div className="text-[10px] uppercase tracking-wide text-white/40">Total Score</div>
                    <div className="font-semibold">{s.totalScore}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl py-2.5 col-span-1">
                    <div className="text-[10px] uppercase tracking-wide text-white/40">Total Paid</div>
                    <div className="font-semibold text-rose-300">{formatPKR(s.totalPaid)}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl py-2.5 col-span-2">
                    <div className="text-[10px] uppercase tracking-wide text-white/40">Avg Paid / Game</div>
                    <div className="font-semibold">{formatPKR(s.averagePaid)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
