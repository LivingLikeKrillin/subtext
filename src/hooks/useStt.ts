import { useCallback, useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import type { Job, PipelinePhase, SttSegment } from "../types";
import { startStt as apiStartStt, cancelStt as apiCancelStt } from "../lib/tauriApi";

interface SttSegmentEvent {
  job_id: string;
  index: number;
  start: number;
  end: number;
  text: string;
}

export function useStt() {
  const [phase, setPhase] = useState<PipelinePhase>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [segments, setSegments] = useState<SttSegment[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [eta, setEta] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const jobIdRef = useRef<string | null>(null);

  // Keep jobIdRef in sync
  useEffect(() => {
    jobIdRef.current = jobId;
  }, [jobId]);

  // Elapsed timer
  useEffect(() => {
    if (phase === "stt") {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  // ETA calculation
  useEffect(() => {
    if (phase === "stt" && progress > 0 && elapsed > 0) {
      const remaining = ((elapsed / progress) * (100 - progress));
      setEta(Math.round(remaining));
    } else {
      setEta(null);
    }
  }, [phase, progress, elapsed]);

  // Listen for job-updated events (phase/progress/error transitions)
  useEffect(() => {
    const unlisten = listen<Job>("job-updated", (event) => {
      const job = event.payload;
      if (jobIdRef.current && job.id !== jobIdRef.current) return;

      if (job.state === "RUNNING") {
        setPhase("stt");
        setProgress(job.progress);
        if (job.message) setMessage(job.message);
      } else if (job.state === "DONE") {
        setPhase("done");
        setProgress(100);
        setMessage(job.message ?? "Transcription complete");
      } else if (job.state === "FAILED") {
        setPhase("error");
        setError(job.error ?? "Unknown error");
        setMessage(job.error ?? "Transcription failed");
      } else if (job.state === "CANCELED") {
        setPhase("cancelled");
        setMessage("Transcription cancelled");
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Listen for stt-segment events
  useEffect(() => {
    const unlisten = listen<SttSegmentEvent>("stt-segment", (event) => {
      const seg = event.payload;
      if (jobIdRef.current && seg.job_id !== jobIdRef.current) return;

      const sttSeg: SttSegment = {
        index: seg.index,
        start: seg.start,
        end: seg.end,
        text: seg.text,
      };

      setSegments((prev) => [...prev, sttSeg]);
      setActiveIndex(seg.index);
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  const startTranscription = useCallback(
    async (filePath: string, language?: string) => {
      // Reset state
      setPhase("stt");
      setProgress(0);
      setMessage("Starting transcription...");
      setSegments([]);
      setActiveIndex(null);
      setError(null);
      setElapsed(0);
      setEta(null);

      try {
        const job = await apiStartStt(filePath, language);
        setJobId(job.id);
      } catch (e) {
        setPhase("error");
        setError(e instanceof Error ? e.message : String(e));
        setMessage("Failed to start transcription");
      }
    },
    [],
  );

  const cancel = useCallback(async () => {
    if (jobId) {
      try {
        await apiCancelStt(jobId);
      } catch (e) {
        console.error("Failed to cancel STT:", e);
      }
    }
  }, [jobId]);

  const reset = useCallback(() => {
    setPhase("idle");
    setProgress(0);
    setMessage(null);
    setSegments([]);
    setActiveIndex(null);
    setJobId(null);
    setError(null);
    setElapsed(0);
    setEta(null);
  }, []);

  return {
    phase,
    progress,
    message,
    segments,
    activeIndex,
    jobId,
    error,
    elapsed,
    eta,
    startTranscription,
    cancel,
    reset,
  };
}
