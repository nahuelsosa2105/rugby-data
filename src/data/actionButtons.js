/**
 * Botones de acción agrupados por categoría (español argentino).
 * Cada acción: id, label, variant (positive | penalty | neutral).
 */
export const ACTION_BUTTONS = [
  {
    category: 'PUNTOS',
    actions: [
      { id: 'try', label: 'Try', variant: 'scoring' },
      { id: 'conversion', label: 'Conversión', variant: 'scoring' },
      { id: 'penal-goal', label: 'Penal a los palos', variant: 'scoring' },
      { id: 'drop-goal', label: 'Drop', variant: 'scoring' },
    ],
  },
  {
    category: 'FORMACIONES FIJAS',
    actions: [
      { id: 'scrum-won', label: 'Scrum Ganado', variant: 'positive' },
      { id: 'scrum-lost', label: 'Scrum Perdido', variant: 'penalty' },
      { id: 'lineout-won', label: 'Lineout Ganado', variant: 'positive' },
      { id: 'lineout-lost', label: 'Lineout Perdido', variant: 'penalty' },
      { id: 'collapse', label: 'Derrumbe', variant: 'neutral' },
    ],
  },
  {
    category: 'CONTACTO',
    actions: [
      { id: 'penalty-tackle', label: 'Penal en Tacle', variant: 'penalty' },
      { id: 'penalty-ruck-maul', label: 'Penal en Ruck/Maul', variant: 'penalty' },
    ],
  },
  {
    category: 'DISCIPLINA',
    actions: [
      { id: 'foul-play', label: 'Juego Sucio', variant: 'penalty' },
      { id: 'dangerous-tackle', label: 'Tacle Peligroso', variant: 'penalty' },
      { id: 'offside', label: 'Offside', variant: 'penalty' },
      { id: 'obstruction', label: 'Obstrucción', variant: 'penalty' },
      { id: 'discipline-knock-on-intentional', label: 'Knock-on Intencional', variant: 'penalty' },
    ],
  },
  {
    category: 'TARJETAS',
    actions: [
      { id: 'yellow-card', label: 'Tarjeta Amarilla', variant: 'warning' },
      { id: 'red-card', label: 'Tarjeta Roja', variant: 'danger' },
    ],
  },
  {
    category: 'MANEJO',
    actions: [
      { id: 'knock-on', label: 'Knock-on', variant: 'penalty' },
      { id: 'forward-pass', label: 'Pase Forward', variant: 'penalty' },
    ],
  },
  {
    category: 'DEFENSA',
    actions: [
      { id: 'turnover-pesca', label: 'Turnover / Pesca', variant: 'positive' },
      { id: 'tackle', label: 'Tackle', variant: 'neutral' },
    ],
  },
];

export function getActionLabel(actionId) {
  for (const group of ACTION_BUTTONS) {
    const action = group.actions.find((a) => a.id === actionId);
    if (action) return action.label;
  }
  return actionId;
}
