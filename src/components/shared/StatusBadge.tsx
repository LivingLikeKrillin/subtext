import type { RuntimeModelStatus } from "../../types";

const statusColor: Record<RuntimeModelStatus, string> = {
  UNLOADED: "bg-slate-600",
  LOADING: "bg-warning",
  READY: "bg-success",
  ERROR: "bg-danger",
};

const statusLabel: Record<RuntimeModelStatus, string> = {
  UNLOADED: "Unloaded",
  LOADING: "Loading",
  READY: "Ready",
  ERROR: "Error",
};

interface StatusBadgeProps {
  label: string;
  status: RuntimeModelStatus;
}

export function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-surface-inset px-2.5 py-1 text-xs text-slate-400">
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusColor[status]}`} />
      <span className="text-slate-300">{label}</span>
      <span>{statusLabel[status]}</span>
    </span>
  );
}
