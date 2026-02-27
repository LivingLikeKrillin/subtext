import { useState, useEffect, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { getModelCatalog } from "../lib/tauriApi";
import type {
  ModelCatalog,
  ModelManifestEntry,
  DownloadProgress,
} from "../types";

export function useModels() {
  const [catalog, setCatalog] = useState<ModelCatalog | null>(null);
  const [manifest, setManifest] = useState<ModelManifestEntry[]>([]);
  const [downloads, setDownloads] = useState<Map<string, DownloadProgress>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cat = await getModelCatalog();
      setCatalog(cat);
    } catch (e) {
      console.error("Failed to load model catalog:", e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unlistenProgress = listen<DownloadProgress>(
      "download-progress",
      (event) => {
        setDownloads((prev) => {
          const next = new Map(prev);
          next.set(event.payload.model_id, event.payload);
          return next;
        });
      },
    );

    const unlistenManifest = listen<ModelManifestEntry[]>(
      "model-manifest",
      (event) => {
        setManifest(event.payload);
      },
    );

    return () => {
      unlistenProgress.then((fn) => fn());
      unlistenManifest.then((fn) => fn());
    };
  }, []);

  return { catalog, manifest, downloads, loading, error, loadCatalog };
}
