import { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { supabase } from '../supabase';

const PERIODS = ['1er Tiempo', '2do Tiempo', 'Total'];

const ZONE_LABELS = {
  '22m (our)': '22 Propia',
  'Our half': 'Mitad Propia',
  'Midfield': 'Mitad Propia',
  'Their half': 'Mitad Rival',
  '22m (their)': '22 Rival',
};

const TERRITORIO_ORDER = ['22 Propia', 'Mitad Propia', 'Mitad Rival', '22 Rival'];

function DonutWithLabel({ data, title, emptyLabel = 'Sin datos' }) {
  const hasData = data && data.length > 0 && data.some((d) => d.value > 0);
  const main = hasData ? data.find((d) => d.value > 0) : null;

  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 min-h-[250px]">
      <div className="relative w-full h-full min-h-[250px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {hasData ? (
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="42%"
                outerRadius="68%"
                paddingAngle={0}
                dataKey="value"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
            ) : (
              <Pie
                data={[{ name: emptyLabel, value: 1, color: '#475569' }]}
                cx="50%"
                cy="50%"
                innerRadius="42%"
                outerRadius="68%"
                paddingAngle={0}
                dataKey="value"
              >
                <Cell fill="#334155" stroke="transparent" />
              </Pie>
            )}
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold text-white tabular-nums">
            {hasData ? `${main?.value}%` : '—'}
          </span>
          <span className="text-xs text-slate-400 uppercase mt-0.5">{title}</span>
        </div>
      </div>
      <span className="text-sm text-slate-400 font-medium mt-1">{title}</span>
    </div>
  );
}

function processEvents(events) {
  const formacionesFijas = events.filter((e) => e.category === 'FORMACIONES FIJAS');
  const scrumWon = formacionesFijas.filter((e) => e.action_name === 'Scrum Ganado').length;
  const scrumLost = formacionesFijas.filter((e) => e.action_name === 'Scrum Perdido').length;
  const lineoutWon = formacionesFijas.filter((e) => e.action_name === 'Lineout Ganado').length;
  const lineoutLost = formacionesFijas.filter((e) => e.action_name === 'Lineout Perdido').length;

  const totalScrum = scrumWon + scrumLost;
  const scrumData =
    totalScrum > 0
      ? [
          { name: 'Ganado', value: Math.round((scrumWon / totalScrum) * 100), color: '#10b981' },
          { name: 'Perdido', value: Math.round((scrumLost / totalScrum) * 100), color: '#f97316' },
        ]
      : [];

  const totalLineout = lineoutWon + lineoutLost;
  const lineoutData =
    totalLineout > 0
      ? [
          { name: 'Ganado', value: Math.round((lineoutWon / totalLineout) * 100), color: '#10b981' },
          { name: 'Perdido', value: Math.round((lineoutLost / totalLineout) * 100), color: '#f97316' },
        ]
      : [];

  const disciplinaContacto = events.filter(
    (e) => e.category === 'DISCIPLINA' || e.category === 'CONTACTO'
  );
  const countByName = {};
  disciplinaContacto.forEach((e) => {
    const name = e.action_name || 'Otro';
    countByName[name] = (countByName[name] || 0) + 1;
  });
  const infractionsData = Object.entries(countByName)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  const knockOnCount = events.filter(
    (e) => e.action_name === 'Knock-on' || e.action_name === 'Knock-on Intencional'
  ).length;
  const paseForwardCount = events.filter((e) => e.action_name === 'Pase Forward').length;
  const turnoversCount = events.filter((e) => e.action_name === 'Turnover / Pesca').length;
  const playerEvents = events.filter((e) => e.player_number !== null && e.player_number !== undefined);

  const topInfractoresMap = {};
  playerEvents
    .filter(
      (e) =>
        e.category === 'DISCIPLINA' ||
        e.category === 'CONTACTO' ||
        e.category === 'MANEJO' ||
        e.category === 'TARJETAS'
    )
    .forEach((e) => {
      const player = Number(e.player_number);
      if (!Number.isFinite(player)) return;
      if (!topInfractoresMap[player]) {
        topInfractoresMap[player] = { total: 0, details: {} };
      }
      topInfractoresMap[player].total += 1;
      topInfractoresMap[player].details[e.action_name] =
        (topInfractoresMap[player].details[e.action_name] || 0) + 1;
    });
  const topInfractores = Object.entries(topInfractoresMap)
    .map(([player, data]) => ({ player: Number(player), total: data.total, details: data.details }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const topDefensoresMap = {};
  playerEvents
    .filter((e) => e.category === 'DEFENSA')
    .forEach((e) => {
      const player = Number(e.player_number);
      if (!Number.isFinite(player)) return;
      if (!topDefensoresMap[player]) {
        topDefensoresMap[player] = { total: 0, details: {} };
      }
      topDefensoresMap[player].total += 1;
      topDefensoresMap[player].details[e.action_name] =
        (topDefensoresMap[player].details[e.action_name] || 0) + 1;
    });
  const topDefensores = Object.entries(topDefensoresMap)
    .map(([player, data]) => ({ player: Number(player), total: data.total, details: data.details }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const actionPoints = {
    Try: 5,
    'Conversión': 2,
    'Penal a los palos': 3,
    Drop: 3,
  };
  const topGoleadoresMap = {};
  playerEvents
    .filter((e) => e.category === 'PUNTOS')
    .forEach((e) => {
      const player = Number(e.player_number);
      if (!Number.isFinite(player)) return;
      if (!topGoleadoresMap[player]) {
        topGoleadoresMap[player] = { total: 0, details: {} };
      }
      const points = actionPoints[e.action_name] ?? 0;
      topGoleadoresMap[player].total += points;
      topGoleadoresMap[player].details[e.action_name] =
        (topGoleadoresMap[player].details[e.action_name] || 0) + 1;
    });
  const topGoleadores = Object.entries(topGoleadoresMap)
    .map(([player, data]) => ({ player: Number(player), total: data.total, details: data.details }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  const totalEvents = events.length;
  const zoneCounts = {};
  TERRITORIO_ORDER.forEach((z) => (zoneCounts[z] = 0));
  events.forEach((e) => {
    const zone = e.field_zone;
    const label = ZONE_LABELS[zone];
    if (label) zoneCounts[label] = (zoneCounts[label] || 0) + 1;
  });
  const territorioZones = TERRITORIO_ORDER.map((label) => {
    const count = zoneCounts[label] || 0;
    const pct = totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;
    const alpha = totalEvents > 0 ? count / totalEvents : 0;
    return { label, pct, alpha };
  });

  return {
    scrumData,
    lineoutData,
    infractionsData,
    knockOnCount,
    paseForwardCount,
    turnoversCount,
    territorioZones,
    topInfractores,
    topDefensores,
    topGoleadores,
  };
}

function formatDetails(details) {
  return Object.entries(details)
    .sort((a, b) => b[1] - a[1])
    .map(([action, count]) => `${count}x ${action}`)
    .join(', ');
}

export default function HalftimeStatsDashboard({ currentMatchId, onBackToMatch }) {
  const [period, setPeriod] = useState('1er Tiempo');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [ourScore, setOurScore] = useState(0);
  const [rivalScore, setRivalScore] = useState(0);
  const [opponentName, setOpponentName] = useState('');

  useEffect(() => {
    if (!currentMatchId) {
      setLoading(false);
      setEvents([]);
      setIsMatchFinished(false);
      setOurScore(0);
      setRivalScore(0);
      setOpponentName('');
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [matchRes, eventsRes] = await Promise.all([
        supabase
          .from('matches')
          .select('is_finished, our_score, rival_score, opponent')
          .eq('id', currentMatchId)
          .single(),
        supabase
          .from('match_events')
          .select('match_id, match_half, category, action_name, field_zone, player_number')
          .eq('match_id', currentMatchId),
      ]);
      if (cancelled) return;
      if (matchRes.data) {
        setIsMatchFinished(!!matchRes.data.is_finished);
        setOurScore(matchRes.data.our_score ?? 0);
        setRivalScore(matchRes.data.rival_score ?? 0);
        setOpponentName(matchRes.data.opponent ?? '');
        if (matchRes.data.is_finished) setPeriod('Total');
      }
      if (eventsRes.error) {
        setEvents([]);
      } else {
        setEvents(eventsRes.data ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [currentMatchId]);

  const eventsToAggregate = useMemo(() => {
    if (period === 'Total' || isMatchFinished) return events;
    const half = period === '1er Tiempo' ? 1 : 2;
    return events.filter((e) => e.match_half === half);
  }, [events, period, isMatchFinished]);

  const {
    scrumData,
    lineoutData,
    infractionsData,
    knockOnCount,
    paseForwardCount,
    turnoversCount,
    territorioZones,
    topInfractores,
    topDefensores,
    topGoleadores,
  } = useMemo(() => processEvents(eventsToAggregate), [eventsToAggregate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col bg-slate-900 text-slate-100 overflow-y-auto">
        <header className="flex-shrink-0 h-12 px-4 flex items-center gap-4 bg-slate-800 border-b border-slate-700">
          <button
            type="button"
            onClick={onBackToMatch}
            className="flex-shrink-0 h-8 px-3 rounded text-slate-300 hover:text-slate-100 hover:bg-slate-700 text-sm font-medium touch-manipulation"
          >
            ⬅️ Volver al Partido
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Cargando estadísticas…</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-900 text-slate-100 overflow-y-auto pb-12">
      <header className="flex-shrink-0 h-12 px-4 flex items-center justify-between gap-4 bg-slate-800 border-b border-slate-700">
        <button
          type="button"
          onClick={onBackToMatch}
          className="flex-shrink-0 h-8 px-3 rounded text-slate-300 hover:text-slate-100 hover:bg-slate-700 text-sm font-medium touch-manipulation flex items-center gap-1"
        >
          ⬅️ Volver al Partido
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-white truncate">
          Estadísticas del Partido
        </h1>
        {!isMatchFinished && (
          <div className="flex-shrink-0 flex rounded-lg overflow-hidden border border-slate-600 bg-slate-800 p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium touch-manipulation transition-colors ${
                  period === p
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </header>

      <section className="flex-shrink-0 w-full flex justify-center items-center py-4 px-2 bg-slate-800/50 border-b border-slate-700">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <span className="text-slate-300 text-xl sm:text-2xl font-black uppercase tracking-wide">
            Nosotros
          </span>
          <span
            className={`tabular-nums font-black text-5xl sm:text-6xl ${
              ourScore > rivalScore
                ? 'text-emerald-400'
                : ourScore < rivalScore
                  ? 'text-red-400'
                  : 'text-white'
            }`}
          >
            [ {ourScore} ]
          </span>
          <span className="text-slate-400 font-black text-3xl sm:text-4xl">—</span>
          <span
            className={`tabular-nums font-black text-5xl sm:text-6xl ${
              rivalScore > ourScore
                ? 'text-emerald-400'
                : rivalScore < ourScore
                  ? 'text-red-400'
                  : 'text-white'
            }`}
          >
            [ {rivalScore} ]
          </span>
          <span className="text-slate-300 text-xl sm:text-2xl font-black uppercase tracking-wide truncate max-w-[12rem]">
            {(opponentName || 'RIVAL').toUpperCase()}
          </span>
        </div>
      </section>

      <main className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        {/* Top-Left: Obtención (Set Pieces) */}
        <section className="min-h-[380px] rounded-xl border border-slate-800 bg-slate-800/50 p-3 flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2 flex-shrink-0">
            Obtención (Formaciones Fijas)
          </h2>
          <div className="flex-1 min-h-[250px] flex gap-4">
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
              <DonutWithLabel data={scrumData} title="Scrum" emptyLabel="Sin datos" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center">
              <DonutWithLabel data={lineoutData} title="Lineout" emptyLabel="Sin datos" />
            </div>
          </div>
        </section>

        {/* Top-Right: Disciplina */}
        <section className="min-h-[380px] rounded-xl border border-slate-800 bg-slate-800/50 p-3 flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Disciplina — Top 3 Infracciones
          </h2>
          <div className="flex-1 min-h-[250px]">
            {infractionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={infractionsData}
                  margin={{ top: 4, right: 8, left: 4, bottom: 4 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: '#94a3b8', fontSize: 15 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value) => [value, 'Cantidad']}
                  />
                  <Bar
                    dataKey="count"
                    fill="#f97316"
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Sin datos
              </div>
            )}
          </div>
        </section>

        {/* Bottom-Left: Termómetro de Manejo */}
        <section className="min-h-[380px] rounded-xl border border-slate-800 bg-slate-800/50 p-3 flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2 flex-shrink-0">
            Termómetro de Manejo
          </h2>
          <div className="flex-1 min-h-[250px] grid grid-cols-3 gap-4 items-center">
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 py-4 px-2 min-h-[220px]">
              <span className="text-7xl font-bold text-red-500 tabular-nums leading-none">
                {knockOnCount}
              </span>
              <span className="text-xl text-slate-300 text-center mt-2">Knock-ons</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 py-4 px-2 min-h-[220px]">
              <span className="text-7xl font-bold text-red-500 tabular-nums leading-none">
                {paseForwardCount}
              </span>
              <span className="text-xl text-slate-300 text-center mt-2">Pases Forward</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 py-4 px-2 min-h-[220px]">
              <span className="text-7xl font-bold text-emerald-500 tabular-nums leading-none">
                {turnoversCount}
              </span>
              <span className="text-xl text-slate-300 text-center mt-2">Turnovers Ganados</span>
            </div>
          </div>
        </section>

        {/* Bottom-Right: Mapa de Territorio */}
        <section className="min-h-[380px] rounded-xl border border-slate-800 bg-slate-800/50 p-3 flex flex-col">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Mapa de Territorio
          </h2>
          <div className="flex-1 min-h-[250px] flex flex-col rounded-lg overflow-hidden border border-slate-700 bg-slate-800">
            {territorioZones.map((zone) => (
              <div
                key={zone.label}
                className="flex-1 min-h-[22%] flex items-center justify-center relative"
                style={{
                  backgroundColor: `rgba(239, 68, 68, ${zone.alpha})`,
                }}
              >
                <span className="font-bold text-white text-sm drop-shadow-md z-10">
                  {zone.label}: {zone.pct}%
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <section className="px-4 mt-8 pb-8">
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-200 mb-3">
          Rendimiento Individual
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h3 className="text-base sm:text-lg font-bold text-red-400 mb-3">
              ⚠️ Alarmas (Infracciones y Errores)
            </h3>
            {topInfractores.length === 0 ? (
              <p className="text-slate-400 text-base">Sin datos individuales</p>
            ) : (
              <div className="space-y-3">
                {topInfractores.map((item) => (
                  <div key={`alarm-${item.player}`} className="flex items-start gap-3">
                    <span className="bg-red-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg">
                      {item.player}
                    </span>
                    <div className="min-w-0">
                      <p className="text-slate-100 text-lg font-semibold">{item.total} Infracciones</p>
                      <p className="text-sm text-slate-400 break-words">{formatDetails(item.details)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h3 className="text-base sm:text-lg font-bold text-blue-400 mb-3">
              ⭐ Goleadores
            </h3>
            {topGoleadores.length === 0 ? (
              <p className="text-slate-400 text-base">Sin datos individuales</p>
            ) : (
              <div className="space-y-3">
                {topGoleadores.map((item) => (
                  <div key={`goal-${item.player}`} className="flex items-start gap-3">
                    <span className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg">
                      {item.player}
                    </span>
                    <div className="min-w-0">
                      <p className="text-slate-100 text-lg font-semibold">{item.total} Puntos</p>
                      <p className="text-sm text-slate-400 break-words">{formatDetails(item.details)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="rounded-xl border border-slate-700 bg-slate-800 p-4">
            <h3 className="text-base sm:text-lg font-bold text-emerald-400 mb-3">
              🟢 Destacados (Defensa)
            </h3>
            {topDefensores.length === 0 ? (
              <p className="text-slate-400 text-base">Sin datos individuales</p>
            ) : (
              <div className="space-y-3">
                {topDefensores.map((item) => (
                  <div key={`top-${item.player}`} className="flex items-start gap-3">
                    <span className="bg-emerald-500 text-white rounded-full h-10 w-10 flex items-center justify-center font-bold text-lg">
                      {item.player}
                    </span>
                    <div className="min-w-0">
                      <p className="text-slate-100 text-lg font-semibold">{item.total} Acciones defensivas</p>
                      <p className="text-sm text-slate-400 break-words">{formatDetails(item.details)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
