interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-6 sm:pb-0">
      <div className="glass-strong w-full max-w-sm p-6 fade-in-up">
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-white/60 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="btn-press flex-1 py-3.5 rounded-2xl font-semibold bg-white/10 text-white/80"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`btn-press flex-1 py-3.5 rounded-2xl font-semibold text-slate-900 ${
              danger ? 'bg-gradient-to-r from-rose-300 to-rose-400' : 'bg-gradient-to-r from-emerald-300 to-sky-300'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
