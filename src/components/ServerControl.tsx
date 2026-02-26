import type { ServerStatus } from "../types";

interface Props {
  status: ServerStatus;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

const statusConfig: Record<ServerStatus, { label: string; color: string }> = {
  STOPPED: { label: "Stopped", color: "#888" },
  STARTING: { label: "Starting...", color: "#f0a500" },
  RUNNING: { label: "Running", color: "#22c55e" },
  ERROR: { label: "Error", color: "#ef4444" },
};

export function ServerControl({ status, error, onStart, onStop }: Props) {
  const config = statusConfig[status];

  return (
    <div className="server-control">
      <div className="server-status-row">
        <span className="label">Python Server</span>
        <span className="status-badge" style={{ backgroundColor: config.color }}>
          {config.label}
        </span>
        {status === "STOPPED" || status === "ERROR" ? (
          <button className="btn btn-start" onClick={onStart}>
            Start Server
          </button>
        ) : status === "RUNNING" ? (
          <button className="btn btn-stop" onClick={onStop}>
            Stop Server
          </button>
        ) : (
          <button className="btn" disabled>
            Starting...
          </button>
        )}
      </div>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}
