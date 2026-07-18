import { useState } from 'react';
import type { DetectedTie } from '../lib/ranking';
import type { Player, TieGroup } from '../types';

interface TieResolutionScreenProps {
  ties: DetectedTie[];
  players: Player[];
  onResolve: (tieGroups: TieGroup[]) => void;
}

export function TieResolutionScreen({ ties, players, onResolve }: TieResolutionScreenProps) {
  const [choices, setChoices] = useState<Record<number, 'manual' | 'split'>>({});
  const [manualOrders, setManualOrders] = useState<Record<number, string[]>>(
    Object.fromEntries(ties.map((t, i) => [i, [...t.playerIds]])),
  );

  const playerName = (id: string) => players.find((p) => p.id === id)?.name ?? '';

  function moveUp(tieIndex: number, playerIndex: number) {
    setManualOrders((prev) => {
      const order = [...prev[tieIndex]];
      if (playerIndex === 0) return prev;
      [order[playerIndex - 1], order[playerIndex]] = [order[playerIndex], order[playerIndex - 1]];
      return { ...prev, [tieIndex]: order };
    });
  }

  function moveDown(tieIndex: number, playerIndex: number) {
    setManualOrders((prev) => {
      const order = [...prev[tieIndex]];
      if (playerIndex === order.length - 1) return prev;
      [order[playerIndex], order[playerIndex + 1]] = [order[playerIndex + 1], order[playerIndex]];
      return { ...prev, [tieIndex]: order };
    });
  }

  function handleSubmit() {
    const groups: TieGroup[] = ties.map((t, i) => {
      const method = choices[i] ?? 'split';
      return {
        playerIds: t.playerIds,
        method,
        manualOrder: method === 'manual' ? manualOrders[i] : undefined,
      };
    });
    onResolve(groups);
  }

  const allChosen = ties.every((_, i) => choices[i]);

  return (
    <div className="min-h-svh px-5 py-8 max-w-md mx-auto">
      <div className="fade-in-up">
        <h1 className="text-xl font-bold mb-1 text-center">Scores Tied</h1>
        <p className="text-white/50 text-sm text-center mb-6">
          Two or more players finished with the same score. Choose how to resolve each tie.
        </p>

        {ties.map((tie, i) => (
          <section key={i} className="glass p-5 mb-4">
            <h2 className="font-semibold mb-1">
              Tied at {tie.score} pts — rank {tie.startRank}
              {tie.endRank !== tie.startRank ? `–${tie.endRank}` : ''}
            </h2>
            <p className="text-white/50 text-xs mb-3">{tie.playerIds.map(playerName).join(', ')}</p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setChoices((c) => ({ ...c, [i]: 'split' }))}
                className={`btn-press py-3 rounded-2xl text-sm font-semibold ${
                  choices[i] === 'split'
                    ? 'bg-gradient-to-r from-emerald-300 to-sky-300 text-slate-900'
                    : 'bg-white/5 text-white/70 border border-white/10'
                }`}
              >
                Split Equally
              </button>
              <button
                onClick={() => setChoices((c) => ({ ...c, [i]: 'manual' }))}
                className={`btn-press py-3 rounded-2xl text-sm font-semibold ${
                  choices[i] === 'manual'
                    ? 'bg-gradient-to-r from-emerald-300 to-sky-300 text-slate-900'
                    : 'bg-white/5 text-white/70 border border-white/10'
                }`}
              >
                Choose Order
              </button>
            </div>

            {choices[i] === 'manual' && (
              <div className="flex flex-col gap-2">
                {manualOrders[i].map((id, idx) => (
                  <div key={id} className="flex items-center justify-between bg-white/5 rounded-xl px-3 py-2">
                    <span className="text-sm font-medium">
                      {tie.startRank + idx}. {playerName(id)}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveUp(i, idx)}
                        disabled={idx === 0}
                        className="w-8 h-8 rounded-lg bg-white/10 disabled:opacity-30 text-sm"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(i, idx)}
                        disabled={idx === manualOrders[i].length - 1}
                        className="w-8 h-8 rounded-lg bg-white/10 disabled:opacity-30 text-sm"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}

        <button
          onClick={handleSubmit}
          disabled={!allChosen}
          className="btn-press w-full py-5 rounded-3xl text-lg font-bold text-slate-900 bg-gradient-to-r from-emerald-300 to-sky-300 disabled:opacity-40 shadow-[0_8px_30px_rgba(52,211,153,0.35)]"
        >
          Confirm Ranking
        </button>
      </div>
    </div>
  );
}
