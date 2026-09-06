import { useEffect, useState } from 'react';
import type { ActiveGame, CompletedGame, SavedPlayer, TieGroup } from './types';
import { detectTies, computeRanking, type DetectedTie } from './lib/ranking';
import { billableMinutes, elapsedSeconds, totalCost } from './lib/billing';
import {
  addGameToHistory,
  addPlayer,
  clearActiveGame,
  deleteGameFromHistory,
  deletePlayer,
  loadActiveGame,
  loadHistory,
  loadPlayers,
  saveActiveGame,
} from './lib/storage';
import { StartScreen } from './components/StartScreen';
import { GameSetup } from './components/GameSetup';
import { ActiveGameScreen } from './components/ActiveGameScreen';
import { TieResolutionScreen } from './components/TieResolutionScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { StatsScreen } from './components/StatsScreen';
import { PlayersScreen } from './components/PlayersScreen';

type View = 'start' | 'setup' | 'active' | 'tie' | 'results' | 'history' | 'stats' | 'players';

export default function App() {
  const [view, setView] = useState<View>('start');
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [history, setHistory] = useState<CompletedGame[]>([]);
  const [players, setPlayers] = useState<SavedPlayer[]>([]);
  const [pendingGame, setPendingGame] = useState<ActiveGame | null>(null);
  const [pendingTies, setPendingTies] = useState<DetectedTie[]>([]);
  const [freshResult, setFreshResult] = useState<CompletedGame | null>(null);
  // Bumped whenever a back-swipe/back-button is blocked mid-game, so the active
  // screen can react by surfacing its own close confirmation instead.
  const [closeRequestSignal, setCloseRequestSignal] = useState(0);

  useEffect(() => {
    setActiveGame(loadActiveGame());
    loadHistory().then(setHistory);
    loadPlayers().then(setPlayers);
  }, []);

  // Give every screen a real entry in browser history so a swipe-back gesture (or the
  // hardware/browser back button) moves between in-app screens instead of leaving the
  // site. `navigate` is the only thing that should ever change `view` going forward.
  useEffect(() => {
    window.history.replaceState({ view: 'start' }, '');
  }, []);

  useEffect(() => {
    function onPopState(e: PopStateEvent) {
      const nextView = (e.state?.view as View) ?? 'start';
      // Block leaving mid-game or mid-tie-resolution: re-assert the current history
      // entry instead of following the browser back navigation.
      if (view === 'active' && nextView !== 'active') {
        window.history.pushState({ view: 'active' }, '');
        setCloseRequestSignal((n) => n + 1);
        return;
      }
      if (view === 'tie' && nextView !== 'tie') {
        window.history.pushState({ view: 'tie' }, '');
        return;
      }
      setView(nextView);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [view]);

  function navigate(next: View) {
    window.history.pushState({ view: next }, '');
    setView(next);
  }

  function handleUpdateGame(game: ActiveGame) {
    setActiveGame(game);
    saveActiveGame(game);
  }

  function handleStartGame(game: ActiveGame) {
    setActiveGame(game);
    saveActiveGame(game);
    navigate('active');
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
    navigate('results');
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
      navigate('tie');
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

  async function handleAddPlayer(id: string, name: string): Promise<SavedPlayer | null> {
    const created = await addPlayer(id, name);
    if (created) setPlayers(await loadPlayers());
    return created;
  }

  async function handleDeletePlayer(id: string) {
    setPlayers(await deletePlayer(id));
  }

  return (
    <>
      {view === 'start' && (
        <StartScreen
          hasActiveGame={!!activeGame}
          onResumeGame={() => navigate('active')}
          onStartNew={() => navigate('setup')}
          onHistory={() => navigate('history')}
          onStats={() => navigate('stats')}
          onManagePlayers={() => navigate('players')}
        />
      )}

      {view === 'setup' && (
        <GameSetup
          players={players}
          onAddPlayer={handleAddPlayer}
          onStart={handleStartGame}
          onCancel={() => navigate('start')}
        />
      )}

      {view === 'active' && activeGame && (
        <ActiveGameScreen
          game={activeGame}
          onUpdateGame={handleUpdateGame}
          onCloseCentury={handleCloseCentury}
          onEliminate={handleEliminate}
          closeRequestSignal={closeRequestSignal}
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
          onSaveAndFinish={() => navigate('start')}
          onStartAnother={() => navigate('setup')}
          onViewHistory={() => navigate('history')}
        />
      )}

      {view === 'history' && (
        <HistoryScreen history={history} onBack={() => navigate('start')} onDelete={handleDeleteHistory} />
      )}

      {view === 'stats' && <StatsScreen history={history} onBack={() => navigate('start')} />}

      {view === 'players' && (
        <PlayersScreen
          players={players}
          onAdd={handleAddPlayer}
          onDelete={handleDeletePlayer}
          onBack={() => navigate('start')}
        />
      )}
    </>
  );
}
