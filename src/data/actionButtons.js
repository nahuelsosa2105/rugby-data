/**
 * Botones de acción agrupados por categoría (español argentino).
 * Cada acción: id, label, variant (positive | penalty | neutral).
 */
export const ACTION_BUTTONS = [
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
    ],
  },
  {
    category: 'MANEJO',
    actions: [
      { id: 'deliberate-knock-on', label: 'Knock-on Intencional', variant: 'penalty' },
      { id: 'forward-pass', label: 'Pase Forward', variant: 'penalty' },
    ],
  },
  {
    category: 'DEFENSA',
    actions: [
      { id: 'turnover-pesca', label: 'Turnover / Pesca', variant: 'positive' },
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
