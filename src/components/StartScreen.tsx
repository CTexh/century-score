import { Logo } from './Logo';

interface StartScreenProps {
  onStartNew: () => void;
  onHistory: () => void;
  onPlayers: () => void;
  hasActiveGame: boolean;
  onResumeGame: () => void;
}

export function StartScreen({ onStartNew, onHistory, onPlayers, hasActiveGame, onResumeGame }: StartScreenProps) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center px-6 py-12">
      <div className="fade-in-up flex flex-col items-center gap-10 w-full max-w-sm">
        <Logo size={92} />

        <p className="text-center text-white/50 text-sm -mt-4">
          Score tracking &amp; bill splitting for your snooker Century games.
        </p>

        {hasActiveGame && (
          <button
            onClick={onResumeGame}
            className="btn-press glow-emerald w-full glass-strong py-4 rounded-3xl text-emerald-200 font-semibold text-lg"
          >
            Resume Active Century
          </button>
        )}

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={onStartNew}
            className="btn-press w-full py-5 rounded-3xl text-lg font-bold text-slate-900 bg-gradient-to-r from-emerald-300 to-sky-300 shadow-[0_8px_30px_rgba(52,211,153,0.35)]"
          >
            Start New Century
          </button>
          <button
            onClick={onHistory}
            className="btn-press glass w-full py-5 rounded-3xl text-lg font-semibold text-white/90"
          >
            Game History
          </button>
          <button
            onClick={onPlayers}
            className="btn-press glass w-full py-4 rounded-3xl text-base font-medium text-white/70"
          >
            Players
          </button>
        </div>
      </div>
    </div>
  );
}
