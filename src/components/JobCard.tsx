import { useState } from "react";
import type { Job } from "../types";

interface Props {
  job: Job;
  onCancel: (jobId: string) => void;
}

const stateConfig: Record<string, { label: string; color: string }> = {
  QUEUED: { label: "Queued", color: "#888" },
  RUNNING: { label: "Running", color: "#3b82f6" },
  DONE: { label: "Done", color: "#22c55e" },
  FAILED: { label: "Failed", color: "#ef4444" },
  CANCELED: { label: "Canceled", color: "#f59e0b" },
};

export function JobCard({ job, onCancel }: Props) {
  const [copied, setCopied] = useState(false);
  const config = stateConfig[job.state] ?? { label: job.state, color: "#888" };

  const handleCopy = async () => {
    if (job.result) {
      await navigator.clipboard.writeText(job.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <span className="job-id" title={job.id}>
          {job.id.slice(0, 8)}...
        </span>
        <span className="job-state-badge" style={{ backgroundColor: config.color }}>
          {config.label}
        </span>
      </div>

      <div className="job-input">
        <strong>Input:</strong> {job.input_text}
      </div>

      {(job.state === "RUNNING" || job.state === "QUEUED") && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <span className="progress-text">{job.progress}%</span>
        </div>
      )}

      {job.message && job.state === "RUNNING" && (
        <div className="job-message">{job.message}</div>
      )}

      {job.state === "DONE" && job.result && (
        <div className="job-result">
          <strong>Result:</strong>
          <pre>{job.result}</pre>
          <button className="btn btn-small" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy Result"}
          </button>
        </div>
      )}

      {job.state === "FAILED" && job.error && (
        <div className="job-error">
          <strong>Error:</strong> {job.error}
        </div>
      )}

      {(job.state === "RUNNING" || job.state === "QUEUED") && (
        <button className="btn btn-cancel" onClick={() => onCancel(job.id)}>
          Cancel
        </button>
      )}
    </div>
  );
}
