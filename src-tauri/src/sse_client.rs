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

// ── STT stream handling ───────────────────────────────────────────

#[derive(Debug, Clone, serde::Serialize)]
pub struct SttSegmentEvent {
    pub job_id: String,
    pub index: u32,
    pub start: f64,
    pub end: f64,
    pub text: String,
}

pub async fn subscribe_to_stt_stream(app: AppHandle, job_id: String, port: u16) {
    let url = format!("http://127.0.0.1:{}/stt/stream/{}", port, job_id);
    let mut es = EventSource::get(&url);

    while let Some(event) = es.next().await {
        match event {
            Ok(Event::Open) => {
                log::info!("STT SSE connection opened for job {}", job_id);
            }
            Ok(Event::Message(msg)) => {
                let parsed: Result<serde_json::Value, _> = serde_json::from_str(&msg.data);
                match parsed {
                    Ok(value) => {
                        let event_type = value.get("type").and_then(|v| v.as_str()).unwrap_or("");
                        let should_close =
                            handle_stt_event(&app, &job_id, event_type, &value);
                        if should_close {
                            es.close();
                            return;
                        }
                    }
                    Err(e) => {
                        log::error!("Failed to parse STT SSE event: {}", e);
                    }
                }
            }
            Err(err) => {
                log::error!("STT SSE error for job {}: {}", job_id, err);
                update_stt_error(&app, &job_id, &format!("SSE connection error: {}", err));
                es.close();
                return;
            }
        }
    }
}

fn handle_stt_event(
    app: &AppHandle,
    job_id: &str,
    event_type: &str,
    value: &serde_json::Value,
) -> bool {
    match event_type {
        "stt_progress" => {
            let progress = value.get("progress").and_then(|v| v.as_u64()).unwrap_or(0) as u32;
            let message = value
                .get("message")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            update_stt_progress(app, job_id, progress, &message);
            false
        }
        "stt_segment" => {
            let seg = SttSegmentEvent {
                job_id: job_id.to_string(),
                index: value.get("index").and_then(|v| v.as_u64()).unwrap_or(0) as u32,
                start: value.get("start").and_then(|v| v.as_f64()).unwrap_or(0.0),
                end: value.get("end").and_then(|v| v.as_f64()).unwrap_or(0.0),
                text: value
                    .get("text")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
            };
            let _ = app.emit("stt-segment", &seg);
            false
        }
        "done" => {
            let result = value
                .get("result")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            update_stt_done(app, job_id, &result);
            true
        }
        "error" => {
            let error = value
                .get("error")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown error")
                .to_string();
            update_stt_error(app, job_id, &error);
            true
        }
        "cancelled" => {
            update_stt_cancelled(app, job_id);
            true
        }
        _ => {
            log::warn!("Unknown STT event type: {}", event_type);
            false
        }
    }
}

fn update_stt_progress(app: &AppHandle, job_id: &str, progress: u32, message: &str) {
    let state = app.state::<SharedState>();
    let mut guard = match state.lock() {
        Ok(g) => g,
        Err(_) => return,
    };
    if let Some(job) = guard.jobs.get_mut(job_id) {
        job.state = JobState::RUNNING;
        job.progress = progress;
        job.message = Some(message.to_string());
        let _ = app.emit("job-updated", job.clone());
    }
}

fn update_stt_done(app: &AppHandle, job_id: &str, result: &str) {
    let state = app.state::<SharedState>();
    let mut guard = match state.lock() {
        Ok(g) => g,
        Err(_) => return,
    };
    if let Some(job) = guard.jobs.get_mut(job_id) {
        job.state = JobState::DONE;
        job.progress = 100;
        job.result = Some(result.to_string());
        job.message = Some("Transcription complete".to_string());
        let _ = app.emit("job-updated", job.clone());
    }
}

fn update_stt_error(app: &AppHandle, job_id: &str, error: &str) {
    let state = app.state::<SharedState>();
    let mut guard = match state.lock() {
        Ok(g) => g,
        Err(_) => return,
    };
    if let Some(job) = guard.jobs.get_mut(job_id) {
        job.state = JobState::FAILED;
        job.error = Some(error.to_string());
        let _ = app.emit("job-updated", job.clone());
    }
}

fn update_stt_cancelled(app: &AppHandle, job_id: &str) {
    let state = app.state::<SharedState>();
    let mut guard = match state.lock() {
        Ok(g) => g,
        Err(_) => return,
    };
    if let Some(job) = guard.jobs.get_mut(job_id) {
        job.state = JobState::CANCELED;
        job.message = Some("Transcription cancelled".to_string());
        let _ = app.emit("job-updated", job.clone());
    }
}
