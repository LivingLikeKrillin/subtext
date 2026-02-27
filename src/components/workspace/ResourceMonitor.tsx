import { useTranslation } from "react-i18next";
import type { ResourceUsage } from "../../types";

interface ResourceMonitorProps {
  resources: ResourceUsage;
}

function UsageBar({ label, used, total }: { label: string; used: number; total: number }) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const color =
    pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-success";

  return (
    <div className="flex items-center gap-3">
      <span className="w-12 text-xs font-medium text-slate-400">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="w-24 text-right text-xs text-slate-500">
        {(used / 1024).toFixed(1)} / {(total / 1024).toFixed(1)} GB
      </span>
    </div>
  );
}

export function ResourceMonitor({ resources }: ResourceMonitorProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl bg-surface p-4">
      <div className="flex flex-col gap-2">
        <UsageBar
          label={t("workspace.resource.ram")}
          used={resources.ram_used_mb}
          total={resources.ram_total_mb}
        />
        {resources.vram_total_mb !== null && resources.vram_used_mb !== null && (
          <UsageBar
            label={t("workspace.resource.vram")}
            used={resources.vram_used_mb}
            total={resources.vram_total_mb}
          />
        )}
      </div>
    </div>
  );
}
