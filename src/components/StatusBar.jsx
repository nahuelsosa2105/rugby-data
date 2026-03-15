export default function StatusBar({ selectedAction }) {
  return (
    <div className="flex-shrink-0 h-9 px-3 flex items-center bg-slate-800 border-t border-slate-700 text-slate-200 text-xs font-medium">
      {selectedAction ? (
        <span>
          Seleccionado: <strong className="text-amber-400">{selectedAction}</strong> — tocá el campo para ubicar el evento
        </span>
      ) : (
        <span className="text-slate-500">Elegí una acción y luego tocá el campo para registrar</span>
      )}
    </div>
  );
}
