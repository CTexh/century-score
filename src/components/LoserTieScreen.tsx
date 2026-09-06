import type { Player } from '../types';

interface LoserTieScreenProps {
  players: Player[];
  onChoose: (loserId: string) => void;
}

/**
 * Shown only in the rare case where two or more players are tied for the lowest
 * score when the table closes the Century early. Whoever is picked here pays the
 * full bill; everyone else pays nothing.
 */
export function LoserTieScreen({ players, onChoose }: LoserTieScreenProps) {
  return (
    <div className="min-h-svh px-5 py-8 max-w-md mx-auto flex flex-col justify-center">
      <div className="fade-in-up">
        <h1 className="text-xl font-bold mb-2 text-center">Tied for Last</h1>
        <p className="text-white/50 text-sm text-center mb-8">
          {players.map((p) => p.name).join(' and ')} are tied at {players[0]?.score} pts for the lowest score.
          Whoever you pick here pays the full bill.
        </p>

        <div className="flex flex-col gap-3">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => onChoose(p.id)}
              className="btn-press glass-strong py-5 rounded-3xl text-lg font-bold"
            >
              {p.name} pays
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
