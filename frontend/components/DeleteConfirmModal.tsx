"use client";

import Icon from "./Icon";

interface DeleteConfirmModalProps {
  label: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  busy?: boolean;
}

export default function DeleteConfirmModal({
  label,
  onConfirm,
  onCancel,
  busy = false,
}: DeleteConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 mx-auto mb-4">
          <Icon name="delete_forever" size={24} className="text-rose-600" />
        </div>
        <h2 className="text-center text-base font-semibold text-slate-900 mb-1">
          Delete this entry?
        </h2>
        <p className="text-center text-sm text-slate-500 mb-6 leading-relaxed">
          <span className="font-medium text-slate-700">&ldquo;{label}&rdquo;</span>
          {" "}will be permanently removed and cannot be recovered.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
          >
            {busy ? (
              <>
                <Icon name="sync" size={15} className="animate-spin" />
                Deleting…
              </>
            ) : (
              <>
                <Icon name="delete" size={15} />
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
