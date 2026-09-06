import { useEffect, useState } from 'react';
import type { ActiveGame, CompletedGame, TieGroup } from './types';
import { detectTies, computeRanking, type DetectedTie } from './lib/ranking';
import { billableMinutes, elapsedSeconds, totalCost } from './lib/billing';
import {
  addGameToHistory,
  clearActiveGame,
  deleteGameFromHistory,
  loadActiveGame,
  loadHistory,
  saveActiveGame,
} from './lib/storage';
import { StartScreen } from './components/StartScreen';
import { GameSetup } from './components/GameSetup';
import { ActiveGameScreen } from './components/ActiveGameScreen';
import { TieResolutionScreen } from './components/TieResolutionScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { StatsScreen } from './components/StatsScreen';

type View = 'start' | 'setup' | 'active' | 'tie' | 'results' | 'history' | 'stats';

export default function App() {
  const [view, setView] = useState<View>('start');
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [history, setHistory] = useState<CompletedGame[]>([]);
  const [pendingGame, setPendingGame] = useState<ActiveGame | null>(null);
  const [pendingTies, setPendingTies] = useState<DetectedTie[]>([]);
  const [freshResult, setFreshResult] = useState<CompletedGame | null>(null);

  useEffect(() => {
    setActiveGame(loadActiveGame());
    loadHistory().then(setHistory);
  }, []);

  function handleUpdateGame(game: ActiveGame) {
    setActiveGame(game);
    saveActiveGame(game);
  }

  function handleStartGame(game: ActiveGame) {
    setActiveGame(game);
    saveActiveGame(game);
    setView('active');
  }

  async function finalizeGame(game: ActiveGame, tieGroups: TieGroup[]) {
    const endTimestamp = new Date().toISOString();
    const actualDurationSeconds = elapsedSeconds(game.startTimestamp);
    const cost = totalCost(actualDurationSeconds, game.pricePerMinute);
    const ranking = computeRanking(game.players, cost, game.finishedOrder, tieGroups);
    const winner = ranking.find((r) => r.rank === 1)?.player.name ?? '';

    const completed: CompletedGame = {
      id: game.id,
      date: endTimestamp,
      startTimestamp: game.startTimestamp,
      endTimestamp,
      actualDurationSeconds,
      billableMinutes: billableMinutes(actualDurationSeconds),
      targetScore: game.targetScore,
      pricePerMinute: game.pricePerMinute,
      totalCost: cost,
      players: game.players,
      scoreEvents: game.scoreEvents,
      ranking,
      winner,
      tieGroups,
    };

    clearActiveGame();
    setActiveGame(null);
    setPendingGame(null);
    setPendingTies([]);
    setFreshResult(completed);
    setView('results');
    setHistory(await addGameToHistory(completed));
  }

  function handleCloseCentury(game: ActiveGame) {
    const remaining = game.players.filter((p) => !game.finishedOrder.includes(p.id));
    const ties = detectTies(remaining);
    if (ties.length === 0) {
      finalizeGame(game, []);
    } else {
      setPendingGame(game);
      setPendingTies(ties);
      setView('tie');
    }
  }

  function handleEliminate(playerId: string) {
    if (!activeGame) return;
    const updated: ActiveGame = { ...activeGame, finishedOrder: [...activeGame.finishedOrder, playerId] };
    // Once only one player is left un-finished, the race is over — they're the loser.
    if (updated.finishedOrder.length === updated.players.length - 1 && updated.players.length > 1) {
      finalizeGame(updated, []);
    } else {
      handleUpdateGame(updated);
    }
  }

  async function handleDeleteHistory(gameId: string) {
    setHistory(await deleteGameFromHistory(gameId));
  }

  return (
    <>
      {view === 'start' && (
        <StartScreen
          hasActiveGame={!!activeGame}
          onResumeGame={() => setView('active')}
          onStartNew={() => setView('setup')}
          onHistory={() => setView('history')}
          onStats={() => setView('stats')}
        />
      )}

      {view === 'setup' && <GameSetup onStart={handleStartGame} onCancel={() => setView('start')} />}

      {view === 'active' && activeGame && (
        <ActiveGameScreen
          game={activeGame}
          onUpdateGame={handleUpdateGame}
          onCloseCentury={handleCloseCentury}
          onEliminate={handleEliminate}
        />
      )}

      {view === 'tie' && pendingGame && (
        <TieResolutionScreen
          ties={pendingTies}
          players={pendingGame.players}
          onResolve={(tieGroups) => finalizeGame(pendingGame, tieGroups)}
        />
      )}

      {view === 'results' && freshResult && (
        <ResultsScreen
          game={freshResult}
          onSaveAndFinish={() => setView('start')}
          onStartAnother={() => setView('setup')}
          onViewHistory={() => setView('history')}
        />
      )}

      {view === 'history' && (
        <HistoryScreen history={history} onBack={() => setView('start')} onDelete={handleDeleteHistory} />
      )}

      {view === 'stats' && <StatsScreen history={history} onBack={() => setView('start')} />}
    </>
  );
}
