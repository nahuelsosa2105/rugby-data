import { useState, useCallback, useEffect } from 'react';
import RugbyField from './RugbyField';
import ActionPanel from './ActionPanel';
import StatusBar from './StatusBar';
import Scoreboard from './Scoreboard';
import HalftimeStatsDashboard from './HalftimeStatsDashboard';
import { supabase } from '../supabase';

export default function DashboardLayout({ currentMatchId }) {
  const [view, setView] = useState('live');
  const [activeAction, setActiveAction] = useState(null);
  const [ourScore, setOurScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [currentHalf, setCurrentHalf] = useState(1);
  const [lastEventId, setLastEventId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (!currentMatchId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('our_score, rival_score, half_active')
        .eq('id', currentMatchId)
        .single();
      if (cancelled) return;
      if (error) return;
      if (data != null) {
        setOurScore(data.our_score ?? 0);
        setRivalScore(data.rival_score ?? 0);
        setCurrentHalf(data.half_active ?? 1);
      }
    })();
    return () => { cancelled = true; };
  }, [currentMatchId]);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    const t = setTimeout(() => setToastMessage(null), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleScoreUpdate = useCallback(
    async (team, points) => {
      const isUs = team === 'us';
      const prevOur = ourScore;
      const prevRival = rivalScore;
      const newOur = isUs ? prevOur + points : prevOur;
      const newRival = isUs ? prevRival : prevRival + points;

      setOurScore(newOur);
      setRivalScore(newRival);

      try {
        const { error } = await supabase
          .from('matches')
          .update({
            our_score: newOur,
            rival_score: newRival,
          })
          .eq('id', currentMatchId);

        if (error) {
          setOurScore(prevOur);
          setRivalScore(prevRival);
          showToast(`Error al actualizar: ${error.message}`);
        }
      } catch (err) {
        setOurScore(prevOur);
        setRivalScore(prevRival);
        showToast(`Error: ${err.message}`);
      }
    },
    [currentMatchId, ourScore, rivalScore, showToast]
  );

  const handleBack = useCallback(() => {
    console.log('Menú Principal (navegación simulada)');
  }, []);

  const handleViewStats = useCallback(() => setView('stats'), []);
  const handleBackToMatch = useCallback(() => setView('live'), []);

  const handleEndHalf = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ half_active: 2 })
        .eq('id', currentMatchId);
      if (error) {
        showToast(`Error: ${error.message}`);
        return;
      }
      setCurrentHalf(2);
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  }, [currentMatchId, showToast]);

  const handleEndMatch = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ is_finished: true })
        .eq('id', currentMatchId);
      if (error) {
        showToast(`Error: ${error.message}`);
        return;
      }
      setView('stats');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  }, [currentMatchId, showToast]);

  const handleUndo = useCallback(async () => {
    if (!lastEventId) return;
    try {
      const { error } = await supabase
        .from('match_events')
        .delete()
        .eq('id', lastEventId);
      if (error) {
        showToast(`Error: ${error.message}`);
        return;
      }
      setLastEventId(null);
      showToast('Acción deshecha');
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  }, [lastEventId, showToast]);

  const handleFieldClick = useCallback(
    async (coords) => {
      const zoneName = coords?.zone ?? '';
      if (!activeAction) {
        showToast('Seleccioná una acción primero');
        return;
      }
      try {
        const { data, error } = await supabase
          .from('match_events')
          .insert({
            match_id: currentMatchId,
            match_half: currentHalf,
            category: activeAction.category,
            action_name: activeAction.actionName,
            field_zone: zoneName,
          })
          .select()
          .single();
        if (error) {
          showToast(`Error: ${error.message}`);
          return;
        }
        if (data?.id) setLastEventId(data.id);
        setActiveAction(null);
      } catch (err) {
        showToast(`Error: ${err.message}`);
      }
    },
    [activeAction, currentMatchId, currentHalf, showToast]
  );

  if (view === 'stats') {
    return (
      <HalftimeStatsDashboard
        currentMatchId={currentMatchId}
        onBackToMatch={handleBackToMatch}
      />
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 text-slate-100 relative overflow-hidden">
      {toastMessage && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium shadow-lg"
          role="alert"
        >
          {toastMessage}
        </div>
      )}
      <Scoreboard
        ourScore={ourScore}
        rivalScore={rivalScore}
        onOurScoreAdd={(points) => handleScoreUpdate('us', points)}
        onRivalScoreAdd={(points) => handleScoreUpdate('rival', points)}
        onBack={handleBack}
      />
      <div className="flex-1 min-h-0 flex flex-row gap-2 p-2">
        <div className="w-[60%] min-w-0 flex flex-col">
          <RugbyField
            onFieldClick={handleFieldClick}
            disabled={!activeAction}
          />
        </div>
        <div className="w-[40%] min-w-0 flex flex-col bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden">
          <ActionPanel
            activeAction={activeAction}
            onSelectAction={setActiveAction}
            onViewStats={handleViewStats}
            currentHalf={currentHalf}
            lastEventId={lastEventId}
            onEndHalf={handleEndHalf}
            onEndMatch={handleEndMatch}
            onUndo={handleUndo}
          />
        </div>
      </div>
      <StatusBar
        selectedAction={activeAction ? activeAction.actionName : null}
      />
    </div>
  );
}
