import { ACTION_BUTTONS } from '../data/actionButtons';

const variantStyles = {
  positive:
    'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-900 border-emerald-400',
  penalty:
    'bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-slate-900 border-orange-400',
  neutral:
    'bg-slate-500 hover:bg-slate-400 active:bg-slate-600 text-white border-slate-400',
  scoring:
    'bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white border-cyan-500',
  warning:
    'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-600 text-slate-900 border-yellow-400',
  danger:
    'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white border-red-500',
};

const activeStyles = {
  positive: 'ring-2 ring-emerald-300 ring-offset-1 ring-offset-slate-800',
  penalty: 'ring-2 ring-orange-300 ring-offset-1 ring-offset-slate-800',
  neutral: 'ring-2 ring-slate-300 ring-offset-1 ring-offset-slate-800',
  scoring: 'ring-2 ring-cyan-300 ring-offset-1 ring-offset-slate-800',
  warning: 'ring-2 ring-yellow-200 ring-offset-1 ring-offset-slate-800',
  danger: 'ring-2 ring-red-300 ring-offset-1 ring-offset-slate-800',
};

export default function ActionPanel({
  activeAction,
  onSelectAction,
  onViewStats,
  currentHalf,
  lastEventId,
  onEndHalf,
  onEndMatch,
  onUndo,
}) {
  const isSecondHalf = currentHalf === 2;

  return (
    <div className="h-full min-h-0 flex flex-col gap-1 overflow-y-auto p-1.5 sm:p-2 pr-1">
      {ACTION_BUTTONS.map(({ category, actions }) => (
        <div key={category} className="flex-shrink-0 space-y-0.5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-0.5 leading-tight">
            {category}
          </h3>
          <div className="grid grid-cols-2 gap-1">
            {actions.map(({ id, label, variant }) => {
              const isActive = activeAction?.category === category && activeAction?.actionName === label;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectAction(isActive ? null : { category, actionName: label })}
                  className={`
                    h-10 min-h-0 px-2 rounded-lg border border-current
                    text-xs font-semibold leading-tight
                    transition-all duration-150 select-none touch-manipulation
                    ${variantStyles[variant]}
                    ${isActive ? activeStyles[variant] : ''}
                  `}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex-shrink-0 space-y-0.5">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-0.5 leading-tight">
          CONTROL DE PARTIDO
        </h3>
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={onEndHalf}
            disabled={isSecondHalf}
            className={`h-10 px-2 rounded-lg border text-white text-xs font-semibold leading-tight touch-manipulation ${
              isSecondHalf
                ? 'border-slate-600 bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'border-slate-500 bg-slate-600 hover:bg-slate-500 active:bg-slate-700'
            }`}
          >
            Fin 1er Tiempo
          </button>
          <button
            type="button"
            onClick={onEndMatch}
            className="h-10 px-2 rounded-lg border border-slate-500 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white text-xs font-semibold leading-tight touch-manipulation"
          >
            Fin Partido
          </button>
          <button
            type="button"
            onClick={onUndo}
            disabled={!lastEventId}
            className={`h-10 px-2 rounded-lg border text-white text-xs font-semibold leading-tight touch-manipulation ${
              lastEventId
                ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 border-red-500'
                : 'border-slate-600 bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            Deshacer Última
          </button>
          <button
            type="button"
            onClick={onViewStats}
            className="h-10 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold leading-tight touch-manipulation border border-blue-500"
          >
            Ver Estadísticas
          </button>
        </div>
      </div>
    </div>
  );
}
