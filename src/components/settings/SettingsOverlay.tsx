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

interface SettingsOverlayProps {
  config: AppConfig;
  manifest: ModelManifestEntry[];
  glossaryEntries: GlossaryEntry[];
  onUpdateConfig: (partial: PartialConfig) => void;
  onSaveGlossary: (entries: GlossaryEntry[]) => void;
  onDeleteModel: (id: string) => void;
  onDownloadModel: (id: string) => void;
  onClose: () => void;
}

export function SettingsOverlay({
  config,
  manifest,
  glossaryEntries,
  onUpdateConfig,
  onSaveGlossary,
  onDeleteModel,
  onDownloadModel,
  onClose,
}: SettingsOverlayProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const handleConfigPatch = useCallback(
    (patch: PartialConfig) => {
      onUpdateConfig(patch);
    },
    [onUpdateConfig],
  );

  return (
    <div className="settings-enter fixed inset-0 z-50 flex bg-surface-inset">
      {/* Left navigation */}
      <nav className="flex w-48 flex-col border-r border-border bg-surface p-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-50">
            {t("settings.title")}
          </h2>
          <button
            className="cursor-pointer rounded p-1 text-slate-400 transition-colors hover:text-slate-200"
            onClick={onClose}
            aria-label={t("settings.close")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`cursor-pointer rounded-md px-3 py-2 text-left text-sm transition-colors ${
                activeTab === tab
                  ? "bg-primary/15 font-medium text-primary"
                  : "text-slate-400 hover:bg-surface-inset hover:text-slate-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {t(`settings.tabs.${tab}`)}
            </button>
          ))}
        </div>
      </nav>

      {/* Right content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[600px]">
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
      </main>
    </div>
  );
}
