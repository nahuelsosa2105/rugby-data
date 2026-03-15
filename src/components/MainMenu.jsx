export default function MainMenu({ onNewMatch, onToast }) {
  const showSoon = (message = 'Próximamente') => {
    if (onToast) onToast(message);
    else alert(message);
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6">
      <h1 className="text-2xl sm:text-3xl font-black text-white mb-10 tracking-tight">
        Rugby Stats
      </h1>
      <nav className="flex flex-col items-center w-full max-w-xs">
        <button
          type="button"
          onClick={onNewMatch}
          className="w-72 py-4 rounded-xl font-bold text-lg mb-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white touch-manipulation transition-colors border border-emerald-500"
        >
          Nuevo Partido
        </button>
        <button
          type="button"
          onClick={() => showSoon('Próximamente')}
          className="w-72 py-4 rounded-xl font-bold text-lg mb-4 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white touch-manipulation transition-colors border border-slate-500"
        >
          Continuar Partido
        </button>
        <button
          type="button"
          onClick={() => showSoon('Próximamente')}
          className="w-72 py-4 rounded-xl font-bold text-lg mb-4 bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white touch-manipulation transition-colors border border-slate-500"
        >
          Mis Partidos
        </button>
        <button
          type="button"
          onClick={() => showSoon('Cerrar sesión (Próximamente)')}
          className="w-72 py-4 rounded-xl font-bold text-lg bg-red-900/80 hover:bg-red-800/80 active:bg-red-900 text-slate-200 touch-manipulation transition-colors border border-red-800"
        >
          Salir
        </button>
      </nav>
    </div>
  );
}
