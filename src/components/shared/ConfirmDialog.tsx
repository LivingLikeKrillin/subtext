import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();

  if (!open) return null;

  const confirmBg = variant === "danger" ? "bg-danger" : "bg-primary";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-[400px] rounded-xl border border-border bg-surface p-6 shadow-2xl">
        <h3 className="mb-2 text-lg font-semibold text-slate-50">{title}</h3>
        <p className="mb-6 text-sm text-slate-400">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            className="cursor-pointer rounded-md px-4 py-2 text-sm text-slate-400 transition-colors hover:bg-surface-hover hover:text-slate-200"
            onClick={onCancel}
          >
            {cancelLabel ?? t("shared.cancel")}
          </button>
          <button
            className={`cursor-pointer rounded-md ${confirmBg} px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85`}
            onClick={onConfirm}
          >
            {confirmLabel ?? t("shared.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
