import { useTranslation } from "react-i18next";
import type { PipelinePhase } from "../../types";
import { Progress } from "../Progress";

interface PipelineProgressProps {
  phase: PipelinePhase;
  progress: number;
  message: string | null;
  elapsed: number;
  eta: number | null;
  onCancel: () => void;
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const phaseColor: Record<PipelinePhase, string> = {
  idle: "text-slate-500",
  stt: "text-primary",
  translating: "text-violet-400",
  done: "text-success",
  error: "text-danger",
  cancelled: "text-warning",
};

export function PipelineProgress({
  phase,
  progress,
  message,
  elapsed,
  eta,
  onCancel,
}: PipelineProgressProps) {
  const { t } = useTranslation();

  if (phase === "idle") return null;

  const label =
    phase === "stt"
      ? t("workspace.pipeline.transcribing")
      : phase === "translating"
        ? t("workspace.pipeline.translating")
        : phase === "done"
          ? t("workspace.pipeline.done")
          : phase === "cancelled"
            ? t("workspace.pipeline.cancelled")
            : "";

  return (
    <div className="mb-4 rounded-xl bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-sm font-medium ${phaseColor[phase]}`}>
          {label}
        </span>
        {(phase === "stt" || phase === "translating") && (
          <button
            className="cursor-pointer rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-surface-inset hover:text-slate-300"
            onClick={onCancel}
          >
            {t("jobs.cancelButton")}
          </button>
        )}
      </div>

      {(phase === "stt" || phase === "translating") && (
        <>
          <Progress value={progress * 100} />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>
              {t("workspace.pipeline.elapsed")} {formatTime(elapsed)}
            </span>
            {eta !== null && (
              <span>
                {t("workspace.pipeline.eta")} {formatTime(eta)}
              </span>
            )}
          </div>
        </>
      )}

      {message && (
        <p className="mt-2 truncate text-xs text-slate-400">{message}</p>
      )}
    </div>
  );
}
