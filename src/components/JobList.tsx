import type { Job } from "../types";
import { JobCard } from "./JobCard";

interface Props {
  jobs: Job[];
  onCancel: (jobId: string) => void;
}

export function JobList({ jobs, onCancel }: Props) {
  if (jobs.length === 0) {
    return <div className="job-list-empty">No jobs yet. Submit an inference request above.</div>;
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onCancel={onCancel} />
      ))}
    </div>
  );
}
