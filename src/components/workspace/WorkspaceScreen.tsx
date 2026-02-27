import { useState } from "react";
import type {
  ServerStatus,
  ResourceUsage,
  TranslateSegment,
} from "../../types";
import { ServerControl } from "../ServerControl";
import { FileInput } from "./FileInput";
import { PipelineProgress } from "./PipelineProgress";
import { SubtitlePreview } from "./SubtitlePreview";
import { ResourceMonitor } from "./ResourceMonitor";
import { useStt } from "../../hooks/useStt";

interface WorkspaceScreenProps {
  serverStatus: ServerStatus;
  serverError: string | null;
  onStartServer: () => void;
  onStopServer: () => void;
  resources: ResourceUsage;
}

export function WorkspaceScreen({
  serverStatus,
  serverError,
  onStartServer,
  onStopServer,
  resources,
}: WorkspaceScreenProps) {
  const stt = useStt();

  // Translation segments — will be driven by Sprint 5
  const [translateSegments] = useState<TranslateSegment[]>([]);

  const handleFileSelected = (path: string) => {
    stt.startTranscription(path);
  };

  const handleCancel = () => {
    stt.cancel();
  };

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
        disabled={serverStatus !== "RUNNING" || stt.phase === "stt"}
      />

      <PipelineProgress
        phase={stt.phase}
        progress={stt.progress / 100}
        message={stt.message}
        elapsed={stt.elapsed}
        eta={stt.eta}
        onCancel={handleCancel}
      />

      <SubtitlePreview
        sttSegments={stt.segments}
        translateSegments={translateSegments}
        activeIndex={stt.activeIndex}
      />

      <ResourceMonitor resources={resources} />
    </div>
  );
}
