import { useTranslation } from "react-i18next"
import { ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Download } from "lucide-react"
import { SubTextLogo } from "@/components/subtext-logo"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useUpdater } from "@/hooks/useUpdater"

export function AboutSection() {
  const { t } = useTranslation()
  const { checking, updateAvailable, installing, error, upToDate, checkForUpdates, installUpdate } = useUpdater()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-base font-semibold">{t("settings.about.title")}</h3>
      </div>

      <div className="flex items-center gap-4 rounded-lg border p-4">
        <SubTextLogo size="md" />
        <div>
          <h4 className="text-sm font-semibold">SubText</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{t("settings.about.version")} 0.1.0</p>
          <p className="text-xs text-muted-foreground">{t("settings.about.tagline")}</p>
        </div>
      </div>

      {/* Update check section */}
      <div className="rounded-lg border p-4">
        <h4 className="text-sm font-semibold mb-3">{t("settings.about.updates.title")}</h4>
        <div className="flex items-center gap-3">
          {!checking && !updateAvailable && !upToDate && !error && (
            <Button variant="outline" size="sm" onClick={checkForUpdates}>
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              {t("settings.about.updates.check")}
            </Button>
          )}

          {checking && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              {t("settings.about.updates.checking")}
            </div>
          )}

          {updateAvailable && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{updateAvailable.version}</Badge>
              <span className="text-sm">{t("settings.about.updates.available")}</span>
              <Button size="sm" onClick={installUpdate} disabled={installing}>
                <Download className="mr-1.5 h-3.5 w-3.5" />
                {installing ? t("settings.about.updates.installing") : t("settings.about.updates.install")}
              </Button>
            </div>
          )}

          {upToDate && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              {t("settings.about.updates.upToDate")}
              <Button variant="ghost" size="sm" className="ml-2 h-7" onClick={checkForUpdates}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
              <span className="text-sm text-destructive">{t("settings.about.updates.error")}</span>
              <Button variant="outline" size="sm" className="ml-2" onClick={checkForUpdates}>
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                {t("settings.about.updates.check")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <InfoRow label={t("settings.about.runtime")} value="Tauri 2.x + React" />
        <InfoRow label={t("settings.about.sttEngine")} value="faster-whisper (CTranslate2)" />
        <InfoRow label={t("settings.about.llmEngine")} value="llama-cpp-python (GGUF)" />
        <InfoRow label={t("settings.about.license")} value="MIT" />
      </div>

      <div className="flex flex-col gap-1.5">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("settings.about.github")}
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          {t("settings.about.reportIssue")}
        </a>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md px-3 py-2 odd:bg-muted/30">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
