import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { GlossaryEntry } from "../../types";

interface GlossaryEditorProps {
  entries: GlossaryEntry[];
  onSave: (entries: GlossaryEntry[]) => void;
}

export function GlossaryEditor({ entries: initial, onSave }: GlossaryEditorProps) {
  const { t } = useTranslation();
  const [entries, setEntries] = useState<GlossaryEntry[]>(initial);
  const [dirty, setDirty] = useState(false);

  const addEntry = useCallback(() => {
    setEntries((prev) => [...prev, { source: "", target: "" }]);
    setDirty(true);
  }, []);

  const updateEntry = useCallback(
    (index: number, field: "source" | "target", value: string) => {
      setEntries((prev) =>
        prev.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
      );
      setDirty(true);
    },
    [],
  );

  const deleteEntry = useCallback((index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    const filtered = entries.filter((e) => e.source.trim() && e.target.trim());
    onSave(filtered);
    setDirty(false);
  }, [entries, onSave]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-50">
          {t("settings.glossary.title")}
        </h3>
        <div className="flex gap-2">
          <button
            className="cursor-pointer rounded-md bg-surface-inset px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
            onClick={addEntry}
          >
            {t("settings.glossary.addPair")}
          </button>
          {dirty && (
            <button
              className="cursor-pointer rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-85"
              onClick={handleSave}
            >
              {t("settings.glossary.save")}
            </button>
          )}
        </div>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-slate-500">{t("settings.glossary.empty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t("settings.glossary.source")}
                value={entry.source}
                onChange={(e) => updateEntry(i, "source", e.target.value)}
                className="flex-1 rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600"
              />
              <span className="text-slate-600">&rarr;</span>
              <input
                type="text"
                placeholder={t("settings.glossary.target")}
                value={entry.target}
                onChange={(e) => updateEntry(i, "target", e.target.value)}
                className="flex-1 rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600"
              />
              <button
                className="cursor-pointer rounded p-1 text-slate-500 transition-colors hover:text-danger"
                onClick={() => deleteEntry(i)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
