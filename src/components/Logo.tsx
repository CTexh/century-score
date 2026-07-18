interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

/** "Cue Century" mark — a glass snooker ball with a cue-strike arc, used as the app's brand icon. */
export function Logo({ size = 56, showWordmark = true, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ballGlow" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fef9c3" />
            <stop offset="35%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="url(#ringGrad)" strokeWidth="3" opacity="0.55" />
        <circle cx="50" cy="50" r="34" fill="url(#ballGlow)" filter="url(#softShadow)" />
        <circle cx="38" cy="38" r="8" fill="#fff" opacity="0.55" />
        <circle cx="50" cy="50" r="13" fill="#fff" />
        <text x="50" y="55" textAnchor="middle" fontSize="15" fontWeight="700" fill="#78350f" fontFamily="system-ui">
          100
        </text>
        <path
          d="M 8 82 Q 30 60 46 66"
          stroke="#e2e8f0"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
      {showWordmark && (
        <div className="text-left">
          <div className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-300 via-sky-300 to-emerald-300 bg-clip-text text-transparent">
            Century Score
          </div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/40 -mt-1">Cue Century</div>
        </div>
      )}
    </div>
  );
}
