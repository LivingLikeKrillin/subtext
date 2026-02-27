import { useTranslation } from "react-i18next";
import { pickDirectory } from "../../lib/tauriApi";

const FORMATS = ["srt", "vtt", "ass", "txt"];
const LANGUAGES = [
  "en", "ko", "ja", "zh", "es", "fr", "de", "pt", "ru", "ar",
];

interface OutputSectionProps {
  outputDir: string;
  subtitleFormat: string;
  sourceLanguage: string;
  targetLanguage: string;
  onUpdate: (patch: {
    output_dir?: string;
    subtitle_format?: string;
    source_language?: string;
    target_language?: string;
  }) => void;
}

export function OutputSection({
  outputDir,
  subtitleFormat,
  sourceLanguage,
  targetLanguage,
  onUpdate,
}: OutputSectionProps) {
  const { t } = useTranslation();

  const handleBrowse = async () => {
    const selected = await pickDirectory();
    if (selected) {
      onUpdate({ output_dir: selected });
    }
  };

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-slate-50">
        {t("settings.output.title")}
      </h3>

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {t("wizard.output.folderLabel")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={outputDir}
            className="flex-1 rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300"
          />
          <button
            className="cursor-pointer rounded-md bg-surface-inset px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
            onClick={handleBrowse}
          >
            {t("wizard.output.browse")}
          </button>
        </div>
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {t("wizard.output.formatLabel")}
        </label>
        <select
          value={subtitleFormat}
          onChange={(e) => onUpdate({ subtitle_format: e.target.value })}
          className="w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300"
        >
          {FORMATS.map((f) => (
            <option key={f} value={f}>.{f}</option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {t("wizard.output.sourceLanguage")}
        </label>
        <select
          value={sourceLanguage}
          onChange={(e) => onUpdate({ source_language: e.target.value })}
          className="w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {t("wizard.output.targetLanguage")}
        </label>
        <select
          value={targetLanguage}
          onChange={(e) => onUpdate({ target_language: e.target.value })}
          className="w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300"
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l.toUpperCase()}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
