import type { RuntimeModelStatus } from "../../types";

const statusColor: Record<RuntimeModelStatus, string> = {
  UNLOADED: "bg-slate-600",
  LOADING: "bg-warning",
  READY: "bg-success",
  ERROR: "bg-danger",
};

interface StatusBadgeProps {
  label: string;
  status: RuntimeModelStatus;
}

export function StatusBadge({ label, status }: StatusBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-xs text-slate-300">
      <span className={`inline-block h-2 w-2 rounded-full ${statusColor[status]}`} />
      {label}
    </span>
  );
}
