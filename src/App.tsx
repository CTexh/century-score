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

type View = 'start' | 'setup' | 'active' | 'tie' | 'results' | 'history' | 'historyDetail' | 'stats';

export default function App() {
  const [view, setView] = useState<View>('start');
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [history, setHistory] = useState<CompletedGame[]>([]);
  const [pendingGame, setPendingGame] = useState<ActiveGame | null>(null);
  const [pendingTies, setPendingTies] = useState<DetectedTie[]>([]);
  const [freshResult, setFreshResult] = useState<CompletedGame | null>(null);
  const [selectedHistoryGame, setSelectedHistoryGame] = useState<CompletedGame | null>(null);

  useEffect(() => {
    setActiveGame(loadActiveGame());
    setHistory(loadHistory());
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

  function finalizeGame(game: ActiveGame, tieGroups: TieGroup[]) {
    const endTimestamp = new Date().toISOString();
    const actualDurationSeconds = elapsedSeconds(game.startTimestamp);
    const cost = totalCost(actualDurationSeconds, game.pricePerMinute);
    const ranking = computeRanking(game.players, cost, tieGroups);
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

    setHistory(addGameToHistory(completed));
    clearActiveGame();
    setActiveGame(null);
    setPendingGame(null);
    setPendingTies([]);
    setFreshResult(completed);
    setView('results');
  }

  function handleCloseCentury(game: ActiveGame) {
    const ties = detectTies(game.players);
    if (ties.length === 0) {
      finalizeGame(game, []);
    } else {
      setPendingGame(game);
      setPendingTies(ties);
      setView('tie');
    }
  }

  function handleDeleteHistory(gameId: string) {
    setHistory(deleteGameFromHistory(gameId));
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
        <ActiveGameScreen game={activeGame} onUpdateGame={handleUpdateGame} onCloseCentury={handleCloseCentury} />
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
          isFresh
          onSaveAndFinish={() => setView('start')}
          onStartAnother={() => setView('setup')}
          onViewHistory={() => setView('history')}
        />
      )}

      {view === 'history' && (
        <HistoryScreen
          history={history}
          onBack={() => setView('start')}
          onDelete={handleDeleteHistory}
          onSelect={(game) => {
            setSelectedHistoryGame(game);
            setView('historyDetail');
          }}
        />
      )}

      {view === 'historyDetail' && selectedHistoryGame && (
        <ResultsScreen game={selectedHistoryGame} onBack={() => setView('history')} />
      )}

      {view === 'stats' && <StatsScreen history={history} onBack={() => setView('start')} />}
    </>
  );
}
