import type { CompletedGame } from '../types';
import { GameSummary } from './GameSummary';

interface ResultsScreenProps {
  game: CompletedGame;
  onSaveAndFinish: () => void;
  onStartAnother: () => void;
  onViewHistory: () => void;
}

export function ResultsScreen({ game, onSaveAndFinish, onStartAnother, onViewHistory }: ResultsScreenProps) {
  return (
    <div className="min-h-svh px-5 py-8 max-w-md mx-auto">
      <div className="fade-in-up">
        <div className="text-center mb-6">
          <div className="text-xs uppercase tracking-widest text-emerald-300/80 mb-1">Century Completed</div>
          <h1 className="text-2xl font-bold">{game.winner} Wins</h1>
          <p className="text-white/40 text-sm mt-1">
            {new Date(game.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <GameSummary game={game} />

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={onSaveAndFinish}
            className="btn-press w-full py-4 rounded-3xl text-base font-bold text-slate-900 bg-gradient-to-r from-emerald-300 to-sky-300"
          >
            Save and Finish
          </button>
          <button onClick={onStartAnother} className="btn-press glass w-full py-4 rounded-3xl font-semibold">
            Start Another Century
          </button>
          <button onClick={onViewHistory} className="btn-press glass w-full py-3.5 rounded-3xl text-sm text-white/70">
            View Game History
          </button>
        </div>
      </div>
    </div>
  );
}
