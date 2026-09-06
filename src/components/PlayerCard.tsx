import { useState } from 'react';
import type { Player, ScoreEvent } from '../types';

interface PlayerCardProps {
  player: Player;
  rank: number;
  isLeader: boolean;
  events: ScoreEvent[];
  onAdd: (delta: number) => void;
  onSubtract: (delta: number) => void;
  onUndoLast: () => void;
}

// Matches real snooker ball values/colors — red is worth 1, same red used for the +10 bonus ball.
const BALLS: { value: number; bg: string; text: string }[] = [
  { value: 1, bg: '#ef4444', text: '#fff1f1' },
  { value: 2, bg: '#facc15', text: '#4a3400' },
  { value: 3, bg: '#22c55e', text: '#062b14' },
  { value: 4, bg: '#92400e', text: '#fde9d0' },
  { value: 5, bg: '#3b82f6', text: '#eff6ff' },
  { value: 6, bg: '#f472b6', text: '#4a0f2e' },
  { value: 7, bg: '#1f2937', text: '#f8fafc' },
  { value: 10, bg: '#ef4444', text: '#fff1f1' },
];

export function PlayerCard({ player, rank, isLeader, events, onAdd, onSubtract, onUndoLast }: PlayerCardProps) {
  const [pulse, setPulse] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  function bump(fn: (n: number) => void, n: number) {
    fn(n);
    setPulse(true);
    setTimeout(() => setPulse(false), 260);
  }

  const recentEvents = [...events].reverse();

  return (
    <div className={`glass p-5 relative overflow-hidden ${isLeader ? 'glow-emerald' : ''}`}>
      {isLeader && (
        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-emerald-300/90 text-emerald-950 px-2 py-1 rounded-full">
          Leading
        </span>
      )}
      <div className={`flex items-center justify-between mb-3 ${isLeader ? 'pr-16' : ''}`}>
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold text-white/70">
            {rank}
          </span>
          <h3 className="text-lg font-semibold truncate max-w-[9rem]">{player.name}</h3>
        </div>
        <div
          className={`text-3xl font-extrabold tabular-nums ${pulse ? 'score-pop' : ''} ${
            player.score < 0 ? 'text-rose-300' : 'text-white'
          }`}
        >
          {player.score}
        </div>
      </div>

      <div className="flex gap-1 mb-1.5">
        {BALLS.map((ball) => (
          <button
            key={`add-${ball.value}`}
            onClick={() => bump(onAdd, ball.value)}
            className="btn-press flex-1 min-w-0 aspect-square rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-inner border border-white/20"
            style={{
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), transparent 45%), ${ball.bg}`,
              color: ball.text,
            }}
          >
            +{ball.value}
          </button>
        ))}
      </div>
      <div className="flex gap-1 mb-3">
        {BALLS.map((ball) => (
          <button
            key={`sub-${ball.value}`}
            onClick={() => bump(onSubtract, ball.value)}
            className="btn-press flex-1 min-w-0 aspect-square rounded-full flex items-center justify-center font-bold text-[10px] sm:text-xs shadow-inner border border-white/20 opacity-80"
            style={{
              background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), transparent 45%), ${ball.bg}`,
              color: ball.text,
            }}
          >
            −{ball.value}
          </button>
        ))}
      </div>

      <button
        onClick={() => setHistoryOpen((o) => !o)}
        className="w-full flex items-center justify-between text-xs font-semibold text-white/50 uppercase tracking-wide py-1"
      >
        <span>History ({events.length})</span>
        <span>{historyOpen ? '▲' : '▼'}</span>
      </button>
      {historyOpen && (
        <div className="mt-2 fade-in-up">
          {recentEvents.length === 0 ? (
            <p className="text-white/40 text-xs py-2">No score activity yet.</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 mb-2">
              {recentEvents.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white/40">
                    {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={e.delta >= 0 ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                    {e.delta >= 0 ? '+' : ''}
                    {e.delta}
                  </span>
                  <span className="text-white/40">Total {e.newTotal}</span>
                </div>
              ))}
            </div>
          )}
          {events.length > 0 && (
            <button
              onClick={onUndoLast}
              className="btn-press w-full py-2 rounded-xl font-semibold bg-white/10 text-white/70 text-xs"
            >
              Undo Last Score
            </button>
          )}
        </div>
      )}
    </div>
  );
}
