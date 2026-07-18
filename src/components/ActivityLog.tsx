import { useState } from 'react';
import type { ScoreEvent } from '../types';

interface ActivityLogProps {
  events: ScoreEvent[];
  onUndo: () => void;
}

export function ActivityLog({ events, onUndo }: ActivityLogProps) {
  const [open, setOpen] = useState(false);
  const recent = [...events].reverse().slice(0, 20);

  return (
    <div className="glass p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide">Score Activity</h3>
        <span className="text-white/40 text-sm">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="mt-3 fade-in-up">
          {recent.length === 0 ? (
            <p className="text-white/40 text-sm py-2">No score activity yet.</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              {recent.map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{e.playerName}</span>
                    <span className="text-white/40 text-xs">
                      {new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={e.delta >= 0 ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                      {e.delta >= 0 ? '+' : ''}
                      {e.delta}
                    </span>
                    <span className="text-white/40 text-xs ml-2">Total {e.newTotal}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {events.length > 0 && (
            <button
              onClick={onUndo}
              className="btn-press mt-3 w-full py-2.5 rounded-xl font-semibold bg-white/10 text-white/70 text-sm"
            >
              Undo Last Score
            </button>
          )}
        </div>
      )}
    </div>
  );
}
