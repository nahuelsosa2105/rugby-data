import { useCallback, useRef } from 'react';

/**
 * Divides the field into horizontal zones (0-1 from try line to try line).
 * Returns zone label and normalized coordinates.
 */
function getZoneFromY(normalizedY) {
  if (normalizedY <= 0.11) return '22m (our)';
  if (normalizedY <= 0.22) return 'Our half';
  if (normalizedY <= 0.5) return 'Midfield';
  if (normalizedY <= 0.78) return 'Their half';
  return '22m (their)';
}

export default function RugbyField({ onFieldClick, disabled }) {
  const containerRef = useRef(null);

  const handleClick = useCallback(
    (e) => {
      if (disabled || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const zone = getZoneFromY(y);
      onFieldClick({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        zone,
        pixelX: Math.round(e.clientX - rect.left),
        pixelY: Math.round(e.clientY - rect.top),
      });
    },
    [onFieldClick, disabled]
  );

  return (
    <div className="relative w-full h-full min-h-0 rounded-xl overflow-hidden">
      {/* Clickable field surface */}
      <div
        ref={containerRef}
        role="img"
        aria-label="Rugby field - tap to set event location"
        className={`
          absolute inset-0 flex items-center justify-center
          bg-slate-800 rounded-xl
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-crosshair'}
        `}
        onClick={handleClick}
      >
        {/* Top-down simplified rugby field (pitch is ~100m x 70m, try line to try line) */}
        <svg
          viewBox="0 0 100 70"
          className="w-full h-full max-h-full object-contain touch-none pointer-events-none"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grass */}
          <rect x="0" y="0" width="100" height="70" fill="#166534" />
          {/* White lines */}
          <rect x="0" y="0" width="100" height="70" fill="none" stroke="#e2e8f0" strokeWidth="0.6" />
          {/* Halfway */}
          <line x1="50" y1="0" x2="50" y2="70" stroke="#e2e8f0" strokeWidth="0.5" />
          {/* 22m lines */}
          <line x1="22" y1="0" x2="22" y2="70" stroke="#94a3b8" strokeWidth="0.35" strokeDasharray="1.5,1" />
          <line x1="78" y1="0" x2="78" y2="70" stroke="#94a3b8" strokeWidth="0.35" strokeDasharray="1.5,1" />
          {/* 10m lines */}
          <line x1="10" y1="0" x2="10" y2="70" stroke="#64748b" strokeWidth="0.25" strokeDasharray="1,1" />
          <line x1="90" y1="0" x2="90" y2="70" stroke="#64748b" strokeWidth="0.25" strokeDasharray="1,1" />
          {/* Try lines (left/right) */}
          <line x1="0" y1="0" x2="0" y2="70" stroke="#f1f5f9" strokeWidth="0.8" />
          <line x1="100" y1="0" x2="100" y2="70" stroke="#f1f5f9" strokeWidth="0.8" />
          {/* Goal areas / in-goal hint */}
          <rect x="0" y="0" width="100" height="70" fill="rgba(0,0,0,0.03)" />
        </svg>
      </div>

      {/* Endzone labels + center indicator: purely visual, do not capture clicks */}
      <div
        className="absolute top-2 left-0 right-0 flex justify-center pointer-events-none"
        aria-hidden
      >
        <span className="text-sm font-bold tracking-wide text-red-400/70">INGOAL RIVAL</span>
      </div>
      <div
        className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none"
        aria-hidden
      >
        <span className="text-sm font-bold tracking-wide text-green-400/70">NUESTRO INGOAL</span>
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
      >
        <span className="text-slate-500 text-xs font-medium tracking-wide flex flex-col items-center gap-0.5">
          <span className="opacity-30">⬆</span>
          <span className="text-white/30">ATAQUE</span>
        </span>
      </div>
    </div>
  );
}
