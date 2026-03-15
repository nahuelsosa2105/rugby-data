export default function Scoreboard({
  ourScore,
  rivalScore,
  onOurScoreAdd,
  onRivalScoreAdd,
  onBack,
}) {
  return (
    <header className="flex-shrink-0 w-full h-12 px-2 flex items-center justify-between gap-2 bg-slate-800 border-b border-slate-700">
      <button
        type="button"
        onClick={onBack}
        className="flex-shrink-0 h-8 px-2 rounded text-slate-300 hover:text-slate-100 hover:bg-slate-700 text-xs font-medium touch-manipulation flex items-center gap-1"
      >
        ⬅️ Menú Principal
      </button>

      <div className="flex-1 min-w-0 flex items-center justify-center gap-2 flex-wrap">
        <span className="text-slate-200 font-semibold text-xs whitespace-nowrap">NOSOTROS</span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onOurScoreAdd(5)}
            className="h-6 min-w-[2rem] px-1 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[10px] font-bold touch-manipulation"
            title="Try (+5)"
          >
            +5
          </button>
          <button
            type="button"
            onClick={() => onOurScoreAdd(2)}
            className="h-6 min-w-[2rem] px-1 rounded bg-slate-500 hover:bg-slate-400 active:bg-slate-600 text-white text-[10px] font-bold touch-manipulation"
            title="Conv (+2)"
          >
            +2
          </button>
          <button
            type="button"
            onClick={() => onOurScoreAdd(3)}
            className="h-6 min-w-[2rem] px-1 rounded bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-[10px] font-bold touch-manipulation"
            title="Pen/Drop (+3)"
          >
            +3
          </button>
        </div>
        <span className="text-slate-100 font-bold text-base tabular-nums">
          [ {ourScore} ] - [ {rivalScore} ]
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => onRivalScoreAdd(3)}
            className="h-6 min-w-[2rem] px-1 rounded bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white text-[10px] font-bold touch-manipulation"
            title="Pen/Drop (+3)"
          >
            +3
          </button>
          <button
            type="button"
            onClick={() => onRivalScoreAdd(2)}
            className="h-6 min-w-[2rem] px-1 rounded bg-slate-500 hover:bg-slate-400 active:bg-slate-600 text-white text-[10px] font-bold touch-manipulation"
            title="Conv (+2)"
          >
            +2
          </button>
          <button
            type="button"
            onClick={() => onRivalScoreAdd(5)}
            className="h-6 min-w-[2rem] px-1 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-[10px] font-bold touch-manipulation"
            title="Try (+5)"
          >
            +5
          </button>
        </div>
        <span className="text-slate-200 font-semibold text-xs whitespace-nowrap">RIVAL</span>
      </div>
    </header>
  );
}
