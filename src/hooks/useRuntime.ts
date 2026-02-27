import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import type { RuntimeStatus, ResourceUsage } from "../types";

export function useRuntime() {
  const [status, setStatus] = useState<RuntimeStatus>({
    whisper: "UNLOADED",
    llm: "UNLOADED",
  });
  const [resources, setResources] = useState<ResourceUsage>({
    ram_used_mb: 0,
    ram_total_mb: 0,
    vram_used_mb: null,
    vram_total_mb: null,
  });

  useEffect(() => {
    const unlistenStatus = listen<RuntimeStatus>("runtime-status", (event) => {
      setStatus(event.payload);
    });
    return () => {
      unlistenStatus.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const unlistenResources = listen<ResourceUsage>("resource-usage", (event) => {
      setResources(event.payload);
    });
    return () => {
      unlistenResources.then((fn) => fn());
    };
  }, []);

  return { status, resources };
}
