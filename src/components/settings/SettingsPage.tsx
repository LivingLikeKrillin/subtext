import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type {
  AppConfig,
  PartialConfig,
  SettingsTab,
  GlossaryEntry,
  ModelManifestEntry,
} from "../../types";
import { ProfileSection } from "./ProfileSection";
import { OutputSection } from "./OutputSection";
import { TranslationSection } from "./TranslationSection";
import { ModelManager } from "./ModelManager";
import { GlossaryEditor } from "./GlossaryEditor";
import { ApiSettings } from "./ApiSettings";
import { LanguageSection } from "./LanguageSection";

const TABS: SettingsTab[] = [
  "profile",
  "output",
  "translation",
  "models",
  "glossary",
  "api",
  "language",
];

interface SettingsPageProps {
  config: AppConfig;
  manifest: ModelManifestEntry[];
  glossaryEntries: GlossaryEntry[];
  onUpdateConfig: (partial: PartialConfig) => void;
  onSaveGlossary: (entries: GlossaryEntry[]) => void;
  onDeleteModel: (id: string) => void;
  onDownloadModel: (id: string) => void;
}

export function SettingsPage({
  config,
  manifest,
  glossaryEntries,
  onUpdateConfig,
  onSaveGlossary,
  onDeleteModel,
  onDownloadModel,
}: SettingsPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const handleConfigPatch = useCallback(
    (patch: PartialConfig) => {
      onUpdateConfig(patch);
    },
    [onUpdateConfig],
  );

  return (
    <div className="flex gap-8">
      {/* Left sub-navigation */}
      <nav className="flex w-44 flex-shrink-0 flex-col gap-1">
        <h2 className="mb-4 text-lg font-bold text-slate-50">
          {t("settings.title")}
        </h2>
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${
              activeTab === tab
                ? "bg-primary/15 font-medium text-primary"
                : "text-slate-400 hover:bg-surface-hover hover:text-slate-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {t(`settings.tabs.${tab}`)}
          </button>
        ))}
      </nav>

      {/* Right content */}
      <div className="max-w-[600px] flex-1">
        {activeTab === "profile" && (
          <ProfileSection
            profile={config.profile}
            onChange={(p) => handleConfigPatch({ profile: p })}
          />
        )}
        {activeTab === "output" && (
          <OutputSection
            outputDir={config.output_dir}
            subtitleFormat={config.subtitle_format}
            sourceLanguage={config.source_language}
            targetLanguage={config.target_language}
            onUpdate={handleConfigPatch}
          />
        )}
        {activeTab === "translation" && (
          <TranslationSection
            mode={config.translation_mode}
            contextWindow={config.context_window}
            stylePreset={config.style_preset}
            onUpdate={handleConfigPatch}
          />
        )}
        {activeTab === "models" && (
          <ModelManager
            manifest={manifest}
            activeWhisperModel={config.active_whisper_model}
            activeLlmModel={config.active_llm_model}
            onSelectActive={(type, id) => {
              if (type === "whisper") {
                handleConfigPatch({ active_whisper_model: id });
              } else {
                handleConfigPatch({ active_llm_model: id });
              }
            }}
            onDelete={onDeleteModel}
            onDownload={onDownloadModel}
          />
        )}
        {activeTab === "glossary" && (
          <GlossaryEditor
            entries={glossaryEntries}
            onSave={onSaveGlossary}
          />
        )}
        {activeTab === "api" && (
          <ApiSettings
            config={config.external_api}
            onUpdate={handleConfigPatch}
          />
        )}
        {activeTab === "language" && (
          <LanguageSection
            currentLanguage={config.ui_language ?? "en"}
            onChange={(lang) => handleConfigPatch({ ui_language: lang })}
          />
        )}
      </div>
    </div>
  );
}
