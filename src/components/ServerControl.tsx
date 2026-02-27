import { useTranslation } from "react-i18next";
import { Play, Square, Loader } from "lucide-react";
import type { ServerStatus } from "../types";

interface Props {
  status: ServerStatus;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

const badgeClass: Record<ServerStatus, string> = {
  STOPPED: "bg-gray-500",
  STARTING: "bg-warning",
  RUNNING: "bg-success",
  ERROR: "bg-danger",
};

export function ServerControl({ status, error, onStart, onStop }: Props) {
  const { t } = useTranslation();

  const badgeLabel: Record<ServerStatus, string> = {
    STOPPED: t("server.status.stopped"),
    STARTING: t("server.status.starting"),
    RUNNING: t("server.status.running"),
    ERROR: t("server.status.error"),
  };

  return (
    <div className="mb-5 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <span className="text-[0.95rem] font-semibold">{t("server.title")}</span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${badgeClass[status]}`}
        >
          {badgeLabel[status]}
        </span>
        {status === "STOPPED" || status === "ERROR" ? (
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-success px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85"
            onClick={onStart}
          >
            <Play size={14} />
            {t("server.startButton")}
          </button>
        ) : status === "RUNNING" ? (
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-md bg-danger px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-85"
            onClick={onStop}
          >
            <Square size={14} />
            {t("server.stopButton")}
          </button>
        ) : (
          <button
            className="flex cursor-not-allowed items-center gap-1.5 rounded-md bg-surface-inset px-4 py-2 text-sm font-medium text-slate-400 opacity-50"
            disabled
          >
            <Loader size={14} className="animate-spin" />
            {t("server.status.starting")}
          </button>
        )}
      </div>
      {error && <div className="mt-2 text-sm text-danger">{error}</div>}
    </div>
  );
}
