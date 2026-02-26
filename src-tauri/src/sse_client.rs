use futures::StreamExt;
use reqwest_eventsource::{Event, EventSource};
use tauri::{AppHandle, Emitter, Manager};

use crate::job::{JobState, SseEvent};
use crate::state::SharedState;

pub async fn subscribe_to_job_stream(app: AppHandle, job_id: String, port: u16) {
    let url = format!("http://127.0.0.1:{}/inference/stream/{}", port, job_id);
    let mut es = EventSource::get(&url);

    while let Some(event) = es.next().await {
        match event {
            Ok(Event::Open) => {
                log::info!("SSE connection opened for job {}", job_id);
            }
            Ok(Event::Message(msg)) => {
                let parsed: Result<SseEvent, _> = serde_json::from_str(&msg.data);
                match parsed {
                    Ok(sse_event) => {
                        let should_close = update_job_from_event(&app, &sse_event);
                        if should_close {
                            es.close();
                            return;
                        }
                    }
                    Err(e) => {
                        log::error!("Failed to parse SSE event: {}", e);
                    }
                }
            }
            Err(err) => {
                log::error!("SSE error for job {}: {}", job_id, err);
                // Update job to FAILED state
                let state = app.state::<SharedState>();
                if let Ok(mut state) = state.lock() {
                    if let Some(job) = state.jobs.get_mut(&job_id) {
                        job.state = JobState::FAILED;
                        job.error = Some(format!("SSE connection error: {}", err));
                        let _ = app.emit("job-updated", job.clone());
                    }
                }
                es.close();
                return;
            }
        }
    }
}

fn update_job_from_event(app: &AppHandle, event: &SseEvent) -> bool {
    let state = app.state::<SharedState>();
    let mut state = state.lock().expect("Failed to lock state");

    match event {
        SseEvent::Progress {
            job_id,
            progress,
            message,
        } => {
            if let Some(job) = state.jobs.get_mut(job_id) {
                job.state = JobState::RUNNING;
                job.progress = *progress;
                job.message = Some(message.clone());
                let _ = app.emit("job-updated", job.clone());
            }
            false
        }
        SseEvent::Done { job_id, result } => {
            if let Some(job) = state.jobs.get_mut(job_id) {
                job.state = JobState::DONE;
                job.progress = 100;
                job.result = Some(result.clone());
                job.message = Some("Inference complete".to_string());
                let _ = app.emit("job-updated", job.clone());
            }
            true
        }
        SseEvent::Error { job_id, error } => {
            if let Some(job) = state.jobs.get_mut(job_id) {
                job.state = JobState::FAILED;
                job.error = Some(error.clone());
                let _ = app.emit("job-updated", job.clone());
            }
            true
        }
        SseEvent::Cancelled { job_id } => {
            if let Some(job) = state.jobs.get_mut(job_id) {
                job.state = JobState::CANCELED;
                job.message = Some("Job cancelled".to_string());
                let _ = app.emit("job-updated", job.clone());
            }
            true
        }
    }
}
