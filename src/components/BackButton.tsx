interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

/** A large, easy-to-tap back control — shared so every screen's back button behaves the same. */
export function BackButton({ onClick, label = 'Back' }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className="btn-press flex items-center gap-1.5 -ml-3 pl-3 pr-5 py-3 rounded-2xl text-white/80 font-semibold active:bg-white/10"
    >
      <span className="text-xl leading-none">←</span>
      {label}
    </button>
  );
}
