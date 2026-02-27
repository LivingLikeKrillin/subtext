import { useTranslation } from "react-i18next";

const MODES = ["off", "local", "external"] as const;
const STYLE_PRESETS = ["literal", "natural", "casual", "formal"] as const;

interface TranslationSectionProps {
  mode: string;
  contextWindow: number;
  stylePreset: string;
  onUpdate: (patch: {
    translation_mode?: string;
    context_window?: number;
    style_preset?: string;
  }) => void;
}

export function TranslationSection({
  mode,
  contextWindow,
  stylePreset,
  onUpdate,
}: TranslationSectionProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-slate-50">
        {t("settings.translation.title")}
      </h3>

      {/* Mode */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {t("settings.translation.mode")}
        </label>
        <div className="flex gap-2">
          {MODES.map((m) => (
            <button
              key={m}
              className={`cursor-pointer rounded-md px-4 py-2 text-sm transition-colors ${
                mode === m
                  ? "bg-primary text-white"
                  : "bg-surface-inset text-slate-400 hover:text-slate-200"
              }`}
              onClick={() => onUpdate({ translation_mode: m })}
            >
              {t(`settings.translation.mode${m.charAt(0).toUpperCase() + m.slice(1)}` as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Context window */}
      {mode === "local" && (
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            {t("settings.translation.contextWindow")}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={10}
              value={contextWindow}
              onChange={(e) =>
                onUpdate({ context_window: parseInt(e.target.value) })
              }
              className="flex-1 accent-primary"
            />
            <span className="w-8 text-center text-sm text-slate-300">
              {contextWindow}
            </span>
          </div>
        </div>
      )}

      {/* Style preset */}
      {mode !== "off" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            {t("settings.translation.stylePreset")}
          </label>
          <select
            value={stylePreset}
            onChange={(e) => onUpdate({ style_preset: e.target.value })}
            className="w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300"
          >
            {STYLE_PRESETS.map((s) => (
              <option key={s} value={s}>
                {t(`settings.translation.style.${s}`)}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
