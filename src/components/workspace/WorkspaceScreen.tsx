import { useState } from "react";
import type {
  ServerStatus,
  ResourceUsage,
  PipelinePhase,
  SttSegment,
  TranslateSegment,
} from "../../types";
import { ServerControl } from "../ServerControl";
import { FileInput } from "./FileInput";
import { PipelineProgress } from "./PipelineProgress";
import { SubtitlePreview } from "./SubtitlePreview";
import { ResourceMonitor } from "./ResourceMonitor";

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
  // Pipeline state — will be driven by backend events in Sprint 4-5
  const [phase] = useState<PipelinePhase>("idle");
  const [progress] = useState(0);
  const [message] = useState<string | null>(null);
  const [elapsed] = useState(0);
  const [eta] = useState<number | null>(null);
  const [sttSegments] = useState<SttSegment[]>([]);
  const [translateSegments] = useState<TranslateSegment[]>([]);
  const [activeIndex] = useState<number | null>(null);

  const handleFileSelected = (_path: string) => {
    // Will trigger STT pipeline in Sprint 4
  };

  const handleCancel = () => {
    // Will cancel pipeline in Sprint 4
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
        disabled={serverStatus !== "RUNNING"}
      />

      <PipelineProgress
        phase={phase}
        progress={progress}
        message={message}
        elapsed={elapsed}
        eta={eta}
        onCancel={handleCancel}
      />

      <SubtitlePreview
        sttSegments={sttSegments}
        translateSegments={translateSegments}
        activeIndex={activeIndex}
      />

      <ResourceMonitor resources={resources} />
    </div>
  );
}
