import { useState } from 'react';
import type { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  rank: number;
  isLeader: boolean;
  onAdd: (delta: number) => void;
  onSubtract: (delta: number) => void;
}

const BALLS: { value: number; bg: string; text: string }[] = [
  { value: 2, bg: '#facc15', text: '#4a3400' },
  { value: 3, bg: '#22c55e', text: '#062b14' },
  { value: 4, bg: '#92400e', text: '#fde9d0' },
  { value: 5, bg: '#3b82f6', text: '#eff6ff' },
  { value: 6, bg: '#f472b6', text: '#4a0f2e' },
  { value: 7, bg: '#1f2937', text: '#f8fafc' },
  { value: 10, bg: '#ef4444', text: '#fff1f1' },
];

export function PlayerCard({ player, rank, isLeader, onAdd, onSubtract }: PlayerCardProps) {
  const [custom, setCustom] = useState('');
  const [pulse, setPulse] = useState(false);

  function bump(fn: (n: number) => void, n: number) {
    fn(n);
    setPulse(true);
    setTimeout(() => setPulse(false), 260);
  }

  function handleCustomAdd() {
    const n = Number(custom);
    if (!n) return;
    bump(onAdd, n);
    setCustom('');
  }

  function handleCustomSubtract() {
    const n = Number(custom);
    if (!n) return;
    bump(onSubtract, n);
    setCustom('');
  }

  return (
    <div
      className={`glass p-5 relative overflow-hidden ${
        isLeader ? 'glow-emerald' : ''
      }`}
    >
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

      <div className="flex flex-wrap gap-2 mb-3">
        {BALLS.map((ball) => (
          <button
            key={ball.value}
            onClick={() => bump(onAdd, ball.value)}
            className="btn-press w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-inner border border-white/20"
            style={{ background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), transparent 45%), ${ball.bg}`, color: ball.text }}
          >
            +{ball.value}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Custom"
          className="w-20 bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-300/60"
        />
        <button
          onClick={handleCustomAdd}
          className="btn-press flex-1 py-2.5 rounded-xl font-semibold bg-emerald-300/90 text-emerald-950"
        >
          Add
        </button>
        <button
          onClick={handleCustomSubtract}
          className="btn-press flex-1 py-2.5 rounded-xl font-semibold bg-rose-300/90 text-rose-950"
        >
          Subtract
        </button>
      </div>
    </div>
  );
}
