import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ExternalApiConfig } from "../../types";

const PROVIDERS = ["openai", "anthropic", "custom"] as const;

interface ApiSettingsProps {
  config: ExternalApiConfig;
  onUpdate: (patch: { external_api: ExternalApiConfig }) => void;
}

export function ApiSettings({ config, onUpdate }: ApiSettingsProps) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");

  const handleProviderChange = (provider: string) => {
    onUpdate({
      external_api: { ...config, provider },
    });
  };

  const handleModelChange = (model: string) => {
    onUpdate({
      external_api: { ...config, model },
    });
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    // Will be implemented when external API integration is done
    setTimeout(() => {
      setTestStatus(apiKey ? "success" : "failed");
    }, 1000);
  };

  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-slate-50">
        {t("settings.api.title")}
      </h3>

      {/* Provider */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {t("settings.api.provider")}
        </label>
        <select
          value={config.provider ?? ""}
          onChange={(e) => handleProviderChange(e.target.value)}
          className="w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300"
        >
          <option value="">---</option>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* API Key */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {t("settings.api.apiKey")}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
          className="w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600"
        />
      </div>

      {/* Model */}
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          {t("settings.api.model")}
        </label>
        <input
          type="text"
          value={config.model ?? ""}
          onChange={(e) => handleModelChange(e.target.value)}
          placeholder="gpt-4o-mini"
          className="w-full rounded-md border border-border bg-surface-inset px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600"
        />
      </div>

      {/* Test connection */}
      <div className="flex items-center gap-3">
        <button
          className="cursor-pointer rounded-md bg-surface-inset px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-40"
          onClick={handleTestConnection}
          disabled={!config.provider || testStatus === "testing"}
        >
          {testStatus === "testing" ? (
            <span className="flex items-center gap-2">
              <span className="spinner" style={{ width: 14, height: 14 }} />
              {t("settings.api.testConnection")}
            </span>
          ) : (
            t("settings.api.testConnection")
          )}
        </button>
        {testStatus === "success" && (
          <span className="text-xs text-success">{t("settings.api.success")}</span>
        )}
        {testStatus === "failed" && (
          <span className="text-xs text-danger">{t("settings.api.failed")}</span>
        )}
      </div>
    </div>
  );
}
