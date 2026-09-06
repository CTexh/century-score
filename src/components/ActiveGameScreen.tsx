import { useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import type { ActiveGame } from '../types';
import { elapsedSeconds, formatDuration, formatPKR } from '../lib/billing';
import { findNextToFinish } from '../lib/ranking';
import { PlayerCard } from './PlayerCard';
import { ConfirmModal } from './ConfirmModal';

interface ActiveGameScreenProps {
  game: ActiveGame;
  onUpdateGame: (game: ActiveGame) => void;
  onCloseCentury: (game: ActiveGame) => void;
  onEliminate: (playerId: string) => void;
}

export function ActiveGameScreen({ game, onUpdateGame, onCloseCentury, onEliminate }: ActiveGameScreenProps) {
  const [elapsed, setElapsed] = useState(() => elapsedSeconds(game.startTimestamp));
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

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

  const isRace = game.players.length > 1;
  const activePlayers = game.players.filter((p) => !game.finishedOrder.includes(p.id));
  const finishedPlayers = game.finishedOrder
    .map((id, idx) => ({ player: game.players.find((p) => p.id === id), rank: idx + 1 }))
    .filter((f): f is { player: NonNullable<typeof f.player>; rank: number } => !!f.player);

  const pendingPlayer = isRace
    ? findNextToFinish(activePlayers, game.targetScore, game.scoreEvents, dismissedId)
    : null;

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
    if (dismissedId === playerId) setDismissedId(null);
    onUpdateGame({ ...game, players: updatedPlayers, scoreEvents: [...game.scoreEvents, event] });
  }

  function undoLastFor(playerId: string) {
    const events = game.scoreEvents;
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].playerId === playerId) {
        const last = events[i];
        const updatedPlayers = game.players.map((p) =>
          p.id === playerId ? { ...p, score: p.score - last.delta } : p,
        );
        onUpdateGame({ ...game, players: updatedPlayers, scoreEvents: events.filter((e) => e.id !== last.id) });
        return;
      }
    }
  }

  const ranked = [...activePlayers].sort((a, b) => b.score - a.score);
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
            disabled={!!pendingPlayer}
            className="btn-press glow-rose px-5 py-2.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-rose-300 to-rose-400 text-rose-950 disabled:opacity-40"
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

      {finishedPlayers.length > 0 && (
        <div className="glass p-4 mb-5 flex flex-wrap gap-2 fade-in-up">
          {finishedPlayers.map((f) => (
            <span
              key={f.player.id}
              className="flex items-center gap-1.5 bg-white/10 rounded-full pl-1.5 pr-3 py-1.5 text-sm font-semibold"
            >
              <span className="w-6 h-6 rounded-full bg-emerald-300/90 text-emerald-950 flex items-center justify-center text-xs font-bold">
                {f.rank}
              </span>
              {f.player.name}
              <span className="text-white/40 text-xs font-normal">{f.player.score} pts</span>
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {activePlayers.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            rank={rankOf(player.id)}
            isLeader={player.score === maxScore && maxScore !== 0 && activePlayers.length > 1}
            events={game.scoreEvents.filter((e) => e.playerId === player.id)}
            onAdd={(delta) => applyDelta(player.id, delta)}
            onSubtract={(delta) => applyDelta(player.id, -delta)}
            onUndoLast={() => undoLastFor(player.id)}
          />
        ))}
      </div>

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

      {pendingPlayer && (
        <ConfirmModal
          title={`${pendingPlayer.name} reached ${game.targetScore}!`}
          message={`Confirm ${pendingPlayer.name} is out at rank ${game.finishedOrder.length + 1}? They'll be locked in and removed from the active board.`}
          confirmLabel="Confirm, they're out"
          cancelLabel="Not yet"
          onConfirm={() => onEliminate(pendingPlayer.id)}
          onCancel={() => setDismissedId(pendingPlayer.id)}
        />
      )}
    </div>
  );
}
