import { useState, useEffect, useCallback } from "react";
import { getPresets, addPreset, updatePreset, removePreset } from "../lib/tauriApi";
import { toastError } from "../lib/toast";
import i18n from "../i18n";
import type { Preset } from "../types";

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await getPresets();
      setPresets(data);
    } catch (e) {
      console.error("Failed to load presets:", e);
      toastError(i18n.t("toast.presetLoadFailed"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(async (preset: Preset) => {
    try {
      const updated = await addPreset(preset);
      setPresets(updated);
      return updated;
    } catch (e) {
      console.error("Failed to add preset:", e);
      toastError(i18n.t("toast.presetSaveFailed"));
      throw e;
    }
  }, []);

  const update = useCallback(async (preset: Preset) => {
    try {
      const updated = await updatePreset(preset);
      setPresets(updated);
      return updated;
    } catch (e) {
      console.error("Failed to update preset:", e);
      toastError(i18n.t("toast.presetSaveFailed"));
      throw e;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const updated = await removePreset(id);
      setPresets(updated);
      return updated;
    } catch (e) {
      console.error("Failed to remove preset:", e);
      toastError(i18n.t("toast.presetDeleteFailed"));
      throw e;
    }
  }, []);

  return { presets, loading, reload: load, add, update, remove };
}
