export type ServerStatus = "STOPPED" | "STARTING" | "RUNNING" | "ERROR";

export type SetupStatus = "CHECKING" | "NEEDED" | "IN_PROGRESS" | "COMPLETE" | "ERROR";

export type SetupStage = "pip" | "requirements" | "complete";

export interface SetupProgress {
  stage: SetupStage;
  message: string;
  progress: number;
}

export type JobState = "QUEUED" | "RUNNING" | "DONE" | "FAILED" | "CANCELED";

export interface Job {
  id: string;
  input_text: string;
  state: JobState;
  progress: number;
  message: string | null;
  result: string | null;
  error: string | null;
}
