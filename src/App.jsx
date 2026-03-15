import { useState, useCallback } from 'react';
import { supabase } from './supabase';
import DashboardLayout from './components/DashboardLayout';
import MainMenu from './components/MainMenu';

const VIEWS = { menu: 'menu', newMatch: 'newMatch', dashboard: 'dashboard' };

function App() {
  const [currentView, setCurrentView] = useState(VIEWS.menu);
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [opponent, setOpponent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuToast, setMenuToast] = useState(null);

  const showToast = useCallback((message) => {
    setMenuToast(message);
    const t = setTimeout(() => setMenuToast(null), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleStartMatch = useCallback(async () => {
    const name = opponent.trim();
    if (!name) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('matches')
        .insert({ opponent: name })
        .select('id')
        .single();
      if (insertError) {
        setError(insertError.message);
        return;
      }
      if (data?.id) {
        setCurrentMatchId(data.id);
        setCurrentView(VIEWS.dashboard);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [opponent]);

  const handleGoToMenu = useCallback(() => {
    setCurrentView(VIEWS.menu);
  }, []);

  if (currentView === VIEWS.dashboard && currentMatchId) {
    return (
      <>
        {menuToast && (
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium shadow-lg"
            role="alert"
          >
            {menuToast}
          </div>
        )}
        <DashboardLayout
          currentMatchId={currentMatchId}
          onGoToMenu={handleGoToMenu}
        />
      </>
    );
  }

  if (currentView === VIEWS.newMatch) {
    return (
      <div className="h-full w-full min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4">
        {menuToast && (
          <div
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium shadow-lg"
            role="alert"
          >
            {menuToast}
          </div>
        )}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <h1 className="text-xl font-bold text-slate-100 text-center">
            Nuevo Partido
          </h1>
          <input
            type="text"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartMatch()}
            placeholder="Nombre del rival"
            className="w-full h-12 px-4 rounded-lg bg-slate-800 border border-slate-600 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            disabled={loading}
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
          <button
            type="button"
            onClick={handleStartMatch}
            disabled={loading || !opponent.trim()}
            className="w-full h-12 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 disabled:pointer-events-none text-white font-semibold touch-manipulation transition-colors"
          >
            {loading ? 'Iniciando…' : 'Iniciar Partido'}
          </button>
          <button
            type="button"
            onClick={() => setCurrentView(VIEWS.menu)}
            className="w-full h-12 rounded-lg bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-slate-100 font-semibold touch-manipulation transition-colors border border-slate-500"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {menuToast && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium shadow-lg"
          role="alert"
        >
          {menuToast}
        </div>
      )}
      <MainMenu
        onNewMatch={() => setCurrentView(VIEWS.newMatch)}
        onToast={showToast}
      />
    </>
  );
}

export default App;
