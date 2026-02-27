import { useTranslation } from "react-i18next";
import { HardDrive, Download, Trash2 } from "lucide-react";
import type { ModelManifestEntry } from "../../types";
import { ConfirmDialog } from "../shared/ConfirmDialog";
import { useState } from "react";

interface ModelsPageProps {
  manifest: ModelManifestEntry[];
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

const statusColor: Record<string, string> = {
  ready: "bg-success",
  downloading: "bg-primary",
  verifying: "bg-warning",
  missing: "bg-slate-600",
  corrupt: "bg-danger",
};

export function ModelsPage({ manifest, onDelete, onDownload }: ModelsPageProps) {
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <HardDrive size={22} className="text-primary" strokeWidth={1.8} />
        <h1 className="text-xl font-bold text-slate-50">{t("nav.models")}</h1>
      </div>

      {manifest.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-slate-500">
          <HardDrive size={40} strokeWidth={1.2} />
          <p className="text-sm">{t("settings.models.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {manifest.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-subtle"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-surface-hover">
                <HardDrive size={18} className="text-slate-400" strokeWidth={1.8} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">{m.name}</span>
                  <span className="rounded bg-surface-inset px-1.5 py-0.5 text-[11px] uppercase tracking-wide text-slate-500">
                    {m.model_type}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span>{formatSize(m.size_bytes)}</span>
                  <span className="flex items-center gap-1.5">
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusColor[m.status] ?? "bg-slate-600"}`} />
                    {t(`settings.models.status.${m.status}`)}
                  </span>
                </div>
              </div>

              {m.status === "ready" && (
                <button
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger/10"
                  onClick={() => setDeleteTarget(m.id)}
                >
                  <Trash2 size={14} />
                  {t("settings.models.delete")}
                </button>
              )}
              {(m.status === "missing" || m.status === "corrupt") && (
                <button
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-85"
                  onClick={() => onDownload(m.id)}
                >
                  <Download size={14} />
                  {t("settings.models.download")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t("settings.models.confirmDelete")}
        message={t("settings.models.confirmDeleteMsg")}
        variant="danger"
        onConfirm={() => {
          if (deleteTarget) onDelete(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
