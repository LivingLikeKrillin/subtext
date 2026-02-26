import type { SetupStatus, SetupProgress } from "../types";

interface SetupScreenProps {
  status: SetupStatus;
  progress: SetupProgress | null;
  error: string | null;
  onStart: () => void;
  onRetry: () => void;
}

export function SetupScreen({ status, progress, error, onStart, onRetry }: SetupScreenProps) {
  return (
    <div className="setup-screen">
      <div className="setup-card">
        <h1>AI Inference App</h1>
        <p className="setup-description">
          This app requires Python packages to be installed on your system.
          This is a one-time setup that will download and install the necessary dependencies.
        </p>

        {status === "CHECKING" && (
          <div className="setup-status">
            <span className="setup-spinner" />
            <span>Checking setup status...</span>
          </div>
        )}

        {status === "NEEDED" && (
          <div className="setup-action">
            <p className="setup-info">
              Required packages need to be installed (~100MB download).
            </p>
            <button className="btn btn-primary btn-large" onClick={onStart}>
              Start Setup
            </button>
          </div>
        )}

        {status === "IN_PROGRESS" && (
          <div className="setup-progress">
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(progress?.progress ?? 0) * 100}%` }}
                />
              </div>
              <span className="progress-text">
                {Math.round((progress?.progress ?? 0) * 100)}%
              </span>
            </div>
            <p className="setup-message">{progress?.message ?? "Starting setup..."}</p>
          </div>
        )}

        {status === "ERROR" && (
          <div className="setup-error">
            <p className="error-text">{error ?? "An unknown error occurred"}</p>
            <button className="btn btn-primary" onClick={onRetry}>
              Retry Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
