import { invoke } from "@tauri-apps/api/core";
import type { Job, ServerStatus, SetupStatus } from "../types";

export async function startServer(): Promise<void> {
  await invoke("start_server");
}

export async function stopServer(): Promise<void> {
  await invoke("stop_server");
}

export async function getServerStatus(): Promise<ServerStatus> {
  return invoke<ServerStatus>("get_server_status");
}

export async function startInference(inputText: string): Promise<Job> {
  return invoke<Job>("start_inference", { inputText });
}

export async function cancelJob(jobId: string): Promise<void> {
  await invoke("cancel_job", { jobId });
}

export async function getJobs(): Promise<Job[]> {
  return invoke<Job[]>("get_jobs");
}

export async function checkSetup(): Promise<SetupStatus> {
  return invoke<SetupStatus>("check_setup");
}

export async function runSetup(): Promise<void> {
  await invoke("run_setup");
}

export async function resetSetup(): Promise<void> {
  await invoke("reset_setup");
}
