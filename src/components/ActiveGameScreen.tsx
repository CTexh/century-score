import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { ActiveGame } from '../types';
import { elapsedSeconds, formatDuration, formatPKR } from '../lib/billing';
import { PlayerCard } from './PlayerCard';
import { ActivityLog } from './ActivityLog';
import { ConfirmModal } from './ConfirmModal';

interface ActiveGameScreenProps {
  game: ActiveGame;
  onUpdateGame: (game: ActiveGame) => void;
  onCloseCentury: (game: ActiveGame) => void;
}

export function ActiveGameScreen({ game, onUpdateGame, onCloseCentury }: ActiveGameScreenProps) {
  const [elapsed, setElapsed] = useState(() => elapsedSeconds(game.startTimestamp));
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(elapsedSeconds(game.startTimestamp)), 1000);
    return () => clearInterval(interval);
  }, [game.startTimestamp]);

  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  function applyDelta(playerId: string, delta: number) {
    if (!delta) return;
    const player = game.players.find((p) => p.id === playerId);
    if (!player) return;
    const newTotal = player.score + delta;
    const updatedPlayers = game.players.map((p) => (p.id === playerId ? { ...p, score: newTotal } : p));
    const event = {
      id: uuid(),
      playerId,
      playerName: player.name,
      delta,
      newTotal,
      timestamp: new Date().toISOString(),
    };
    onUpdateGame({ ...game, players: updatedPlayers, scoreEvents: [...game.scoreEvents, event] });
  }

  function undoLast() {
    if (game.scoreEvents.length === 0) return;
    const last = game.scoreEvents[game.scoreEvents.length - 1];
    const updatedPlayers = game.players.map((p) =>
      p.id === last.playerId ? { ...p, score: p.score - last.delta } : p,
    );
    onUpdateGame({ ...game, players: updatedPlayers, scoreEvents: game.scoreEvents.slice(0, -1) });
  }

  const ranked = [...game.players].sort((a, b) => b.score - a.score);
  const maxScore = ranked[0]?.score ?? 0;
  const rankOf = (playerId: string) => ranked.findIndex((p) => p.id === playerId) + 1;
  const currentCost = Math.ceil(elapsed / 60) * game.pricePerMinute;

  return (
    <div className="min-h-svh px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="glass-strong p-5 mb-5 fade-in-up">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase tracking-widest text-white/40">Live Century</span>
          <button
            onClick={() => setShowCloseConfirm(true)}
            className="btn-press glow-rose px-5 py-2.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-300 to-rose-400 text-rose-950"
          >
            Close Century
          </button>
        </div>
        <div className="text-center mb-4">
          <div className="text-5xl sm:text-6xl font-extrabold tabular-nums tracking-tight shimmer">
            {formatDuration(elapsed)}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/5 rounded-xl py-2.5">
            <div className="text-[10px] uppercase tracking-wide text-white/40">Started</div>
            <div className="text-sm font-semibold">
              {new Date(game.startTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div className="bg-white/5 rounded-xl py-2.5">
            <div className="text-[10px] uppercase tracking-wide text-white/40">Target</div>
            <div className="text-sm font-semibold">{game.targetScore}</div>
          </div>
          <div className="bg-white/5 rounded-xl py-2.5">
            <div className="text-[10px] uppercase tracking-wide text-white/40">Rate</div>
            <div className="text-sm font-semibold">{formatPKR(game.pricePerMinute)}/min</div>
          </div>
        </div>
        <div className="text-center text-xs text-white/40 mt-3">Running cost: {formatPKR(currentCost)}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {game.players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            rank={rankOf(player.id)}
            isLeader={player.score === maxScore && maxScore !== 0}
            onAdd={(delta) => applyDelta(player.id, delta)}
            onSubtract={(delta) => applyDelta(player.id, -delta)}
          />
        ))}
      </div>

      <ActivityLog events={game.scoreEvents} onUndo={undoLast} />

      {showCloseConfirm && (
        <ConfirmModal
          title="Close this Century?"
          message="Are you sure you want to close this Century? This will stop the timer and calculate the final bill."
          confirmLabel="Close Century"
          danger
          onConfirm={() => {
            setShowCloseConfirm(false);
            onCloseCentury(game);
          }}
          onCancel={() => setShowCloseConfirm(false)}
        />
      )}
    </div>
  );
}
