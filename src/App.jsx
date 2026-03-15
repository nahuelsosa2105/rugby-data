import { useState, useCallback } from 'react';
import { supabase } from './supabase';
import DashboardLayout from './components/DashboardLayout';

function App() {
  const [currentMatchId, setCurrentMatchId] = useState(null);
  const [opponent, setOpponent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      if (data?.id) setCurrentMatchId(data.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [opponent]);

  if (currentMatchId) {
    return <DashboardLayout currentMatchId={currentMatchId} />;
  }

  return (
    <div className="h-full w-full min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4">
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
      </div>
    </div>
  );
}

export default App;
