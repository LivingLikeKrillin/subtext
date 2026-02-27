import { useEffect, useRef, useState } from "react";
import type { ServerStatus, ResourceUsage, RuntimeStatus, PipelinePhase, AppConfig } from "../../types";
import { getConfig } from "../../lib/tauriApi";
import { ServerControl } from "../ServerControl";
import { FileInput } from "./FileInput";
import { PipelineProgress } from "./PipelineProgress";
import { SubtitlePreview } from "./SubtitlePreview";
import { ExportBar } from "./ExportBar";
import { ResourceMonitor } from "./ResourceMonitor";
import { useStt } from "../../hooks/useStt";
import { useTranslate } from "../../hooks/useTranslate";

interface WorkspaceScreenProps {
  serverStatus: ServerStatus;
  serverError: string | null;
  onStartServer: () => void;
  onStopServer: () => void;
  resources: ResourceUsage;
  runtimeStatus?: RuntimeStatus;
  onUnloadModel?: (modelType: string) => void;
}

export function WorkspaceScreen({
  serverStatus,
  serverError,
  onStartServer,
  onStopServer,
  resources,
  runtimeStatus,
  onUnloadModel,
}: WorkspaceScreenProps) {
  const stt = useStt();
  const translate = useTranslate();
  const [sourceFileName, setSourceFileName] = useState<string>("");
  const [config, setConfig] = useState<AppConfig | null>(null);

  // Load config on mount (for ExportBar defaults)
  useEffect(() => {
    getConfig().then(setConfig).catch(() => {});
  }, []);

  // Track whether we've already triggered translation for this STT run
  const translationTriggeredRef = useRef(false);

  // Reset translation trigger when STT starts a new run
  useEffect(() => {
    if (stt.phase === "stt") {
      translationTriggeredRef.current = false;
      translate.reset();
    }
  }, [stt.phase, translate.reset]);

  // Auto-chain: STT done → start translation
  useEffect(() => {
    if (
      stt.phase === "done" &&
      stt.segments.length > 0 &&
      !translationTriggeredRef.current
    ) {
      translationTriggeredRef.current = true;
      getConfig().then((config) => {
        if (config.translation_mode !== "off") {
          translate.startTranslation(stt.segments);
        }
      });
    }
  }, [stt.phase, stt.segments, translate.startTranslation]);

  // Compute composite phase
  const compositePhase: PipelinePhase =
    stt.phase === "stt"
      ? "stt"
      : translate.phase === "translating"
        ? "translating"
        : translate.phase === "done"
          ? "done"
          : translate.phase === "error"
            ? "error"
            : translate.phase === "cancelled"
              ? "cancelled"
              : stt.phase === "error"
                ? "error"
                : stt.phase === "cancelled"
                  ? "cancelled"
                  : stt.phase === "done" && translate.phase === "idle"
                    ? "done"
                    : "idle";

  // Active progress from current stage
  const activeProgress =
    compositePhase === "stt"
      ? stt.progress / 100
      : compositePhase === "translating"
        ? translate.progress / 100
        : compositePhase === "done"
          ? 1
          : 0;

  const activeMessage =
    compositePhase === "stt"
      ? stt.message
      : compositePhase === "translating"
        ? translate.message
        : translate.message ?? stt.message;

  const activeElapsed =
    compositePhase === "stt"
      ? stt.elapsed
      : compositePhase === "translating"
        ? translate.elapsed
        : 0;

  const activeEta =
    compositePhase === "stt"
      ? stt.eta
      : compositePhase === "translating"
        ? translate.eta
        : null;

  const handleFileSelected = (path: string) => {
    // Extract file name without extension for export default
    const baseName = path.split(/[/\\]/).pop() ?? "output";
    const dotIdx = baseName.lastIndexOf(".");
    setSourceFileName(dotIdx > 0 ? baseName.substring(0, dotIdx) : baseName);
    stt.startTranscription(path);
  };

  const handleCancel = () => {
    if (compositePhase === "stt") {
      stt.cancel();
    } else if (compositePhase === "translating") {
      translate.cancel();
    }
  };

  const isBusy =
    stt.phase === "stt" || translate.phase === "translating";

  return (
    <div>
      <ServerControl
        status={serverStatus}
        error={serverError}
        onStart={onStartServer}
        onStop={onStopServer}
      />

      <FileInput
        onFileSelected={handleFileSelected}
        disabled={serverStatus !== "RUNNING" || isBusy}
      />

      <PipelineProgress
        phase={compositePhase}
        progress={activeProgress}
        message={activeMessage}
        elapsed={activeElapsed}
        eta={activeEta}
        onCancel={handleCancel}
      />

      <SubtitlePreview
        sttSegments={stt.segments}
        translateSegments={translate.segments}
        activeIndex={
          compositePhase === "translating"
            ? translate.activeIndex
            : stt.activeIndex
        }
      />

      {compositePhase === "done" && config && (
        <ExportBar
          sttSegments={stt.segments}
          translateSegments={translate.segments}
          defaultFormat={config.subtitle_format}
          defaultOutputDir={config.output_dir}
          sourceFileName={sourceFileName}
        />
      )}

      <ResourceMonitor resources={resources} runtimeStatus={runtimeStatus} onUnloadModel={onUnloadModel} />
    </div>
  );
}
