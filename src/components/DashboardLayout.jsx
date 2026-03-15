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
  const [opponentName, setOpponentName] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    actionType: null,
    message: '',
  });

  useEffect(() => {
    if (!currentMatchId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('our_score, rival_score, half_active, opponent')
        .eq('id', currentMatchId)
        .single();
      if (cancelled) return;
      if (error) return;
      if (data != null) {
        setOurScore(data.our_score ?? 0);
        setRivalScore(data.rival_score ?? 0);
        setCurrentHalf(data.half_active ?? 1);
        setOpponentName(data.opponent ?? '');
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

  const openConfirmEndHalf = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      actionType: 'endHalf',
      message: '¿Estás seguro que querés finalizar el 1er Tiempo?',
    });
  }, []);

  const openConfirmEndMatch = useCallback(() => {
    setConfirmModal({
      isOpen: true,
      actionType: 'endMatch',
      message: '¿Estás seguro que querés finalizar el partido?',
    });
  }, []);

  const handleConfirmModalConfirm = useCallback(async () => {
    const actionType = confirmModal.actionType;
    setConfirmModal({ isOpen: false, actionType: null, message: '' });
    if (actionType === 'endHalf') await handleEndHalf();
    if (actionType === 'endMatch') await handleEndMatch();
  }, [confirmModal, handleEndHalf, handleEndMatch]);

  const handleConfirmModalCancel = useCallback(() => {
    setConfirmModal({ isOpen: false, actionType: null, message: '' });
  }, []);

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
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
        >
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl max-w-sm w-full">
            <p id="confirm-modal-title" className="text-slate-200 text-center text-lg font-medium mb-6">
              {confirmModal.message}
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleConfirmModalCancel}
                className="flex-1 h-14 rounded-xl bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white font-semibold text-base touch-manipulation"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmModalConfirm}
                className="flex-1 h-14 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-semibold text-base touch-manipulation"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
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
        opponentName={opponentName || 'RIVAL'}
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
            onEndHalf={openConfirmEndHalf}
            onEndMatch={openConfirmEndMatch}
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
