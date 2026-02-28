import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ModelManifestEntry } from "../../types";
import { ConfirmDialog } from "../shared/ConfirmDialog";

interface ModelManagerProps {
  manifest: ModelManifestEntry[];
  activeWhisperModel: string | null;
  activeLlmModel: string | null;
  onSelectActive: (type: "whisper" | "llm", id: string) => void;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
}

const statusColor: Record<string, string> = {
  ready: "text-success",
  downloading: "text-primary",
  verifying: "text-warning",
  missing: "text-slate-500",
  corrupt: "text-danger",
};

export function ModelManager({
  manifest,
  activeWhisperModel,
  activeLlmModel,
  onSelectActive,
  onDelete,
  onDownload,
}: ModelManagerProps) {
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const whisperModels = useMemo(
    () => manifest.filter((m) => m.model_type === "whisper"),
    [manifest],
  );
  const llmModels = useMemo(
    () => manifest.filter((m) => m.model_type === "llm"),
    [manifest],
  );

  function renderModelRow(m: ModelManifestEntry, activeId: string | null) {
    const isActive = m.id === activeId;
    const canActivate = m.status === "ready";
    const modelType = m.model_type as "whisper" | "llm";

    return (
      <div
        key={m.id}
        className="flex items-center gap-3 rounded-lg border border-border p-3"
      >
        {/* Active selection radio */}
        {canActivate && (
          <input
            type="radio"
            name={`active-${modelType}`}
            checked={isActive}
            onChange={() => onSelectActive(modelType, m.id)}
            className="accent-primary"
            title={t("settings.models.setActive")}
          />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-200">
              {m.name}
            </span>
            {isActive && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                {t("settings.models.active")}
              </span>
            )}
          </div>
          <div className="mt-1 flex gap-3 text-xs text-slate-500">
            <span>{formatSize(m.size_bytes)}</span>
            <span className={statusColor[m.status] ?? "text-slate-500"}>
              {t(`settings.models.status.${m.status}`)}
            </span>
          </div>
        </div>

        {m.status === "ready" && (
          <button
            className="cursor-pointer rounded px-3 py-1 text-xs text-danger transition-colors hover:bg-danger/10"
            onClick={() => setDeleteTarget(m.id)}
          >
            {t("settings.models.delete")}
          </button>
        )}
        {(m.status === "missing" || m.status === "corrupt") && (
          <button
            className="cursor-pointer rounded bg-primary px-3 py-1 text-xs text-white transition-opacity hover:opacity-85"
            onClick={() => onDownload(m.id)}
          >
            {t("settings.models.download")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-slate-50">
        {t("settings.models.title")}
      </h3>

      {manifest.length === 0 ? (
        <p className="text-sm text-slate-500">{t("settings.models.empty")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Whisper section */}
          {whisperModels.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-300">
                {t("settings.models.whisperSection")}
              </h4>
              <div className="flex flex-col gap-2">
                {whisperModels.map((m) => renderModelRow(m, activeWhisperModel))}
              </div>
            </div>
          )}

          {/* LLM section */}
          {llmModels.length > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-medium text-slate-300">
                {t("settings.models.llmSection")}
              </h4>
              <div className="flex flex-col gap-2">
                {llmModels.map((m) => renderModelRow(m, activeLlmModel))}
              </div>
            </div>
          )}
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
