use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum JobState {
    QUEUED,
    RUNNING,
    DONE,
    FAILED,
    CANCELED,
}

/// SSE events from the Python server, deserialized via `#[serde(tag = "type")]`.
#[derive(Debug, Deserialize)]
#[serde(tag = "type")]
pub enum SseEvent {
    #[serde(rename = "progress")]
    Progress {
        job_id: String,
        progress: u32,
        message: String,
    },
    #[serde(rename = "done")]
    Done {
        job_id: String,
        result: String,
    },
    #[serde(rename = "error")]
    Error {
        job_id: String,
        error: String,
    },
    #[serde(rename = "cancelled")]
    Cancelled {
        job_id: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Job {
    pub id: String,
    pub input_text: String,
    pub state: JobState,
    pub progress: u32,
    pub message: Option<String>,
    pub result: Option<String>,
    pub error: Option<String>,
}

impl Job {
    pub fn new(id: String, input_text: String) -> Self {
        Self {
            id,
            input_text,
            state: JobState::QUEUED,
            progress: 0,
            message: None,
            result: None,
            error: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_job_new_defaults() {
        let job = Job::new("j1".into(), "hello".into());
        assert_eq!(job.id, "j1");
        assert_eq!(job.input_text, "hello");
        assert_eq!(job.state, JobState::QUEUED);
        assert_eq!(job.progress, 0);
        assert!(job.message.is_none());
        assert!(job.result.is_none());
        assert!(job.error.is_none());
    }

    #[test]
    fn test_job_serialization_roundtrip() {
        let mut job = Job::new("j2".into(), "test input".into());
        job.state = JobState::RUNNING;
        job.progress = 42;
        job.message = Some("working".into());

        let json = serde_json::to_string(&job).unwrap();
        let restored: Job = serde_json::from_str(&json).unwrap();

        assert_eq!(restored.id, "j2");
        assert_eq!(restored.input_text, "test input");
        assert_eq!(restored.state, JobState::RUNNING);
        assert_eq!(restored.progress, 42);
        assert_eq!(restored.message.as_deref(), Some("working"));
        assert!(restored.result.is_none());
        assert!(restored.error.is_none());
    }

    #[test]
    fn test_job_state_serialization() {
        let json = serde_json::to_string(&JobState::QUEUED).unwrap();
        assert_eq!(json, r#""QUEUED""#);

        let json = serde_json::to_string(&JobState::DONE).unwrap();
        assert_eq!(json, r#""DONE""#);

        let json = serde_json::to_string(&JobState::CANCELED).unwrap();
        assert_eq!(json, r#""CANCELED""#);
    }

    #[test]
    fn test_sse_event_progress_deserialize() {
        let data = r#"{"type":"progress","job_id":"x","progress":50,"message":"m"}"#;
        let event: SseEvent = serde_json::from_str(data).unwrap();
        match event {
            SseEvent::Progress { job_id, progress, message } => {
                assert_eq!(job_id, "x");
                assert_eq!(progress, 50);
                assert_eq!(message, "m");
            }
            _ => panic!("expected Progress variant"),
        }
    }

    #[test]
    fn test_sse_event_done_deserialize() {
        let data = r#"{"type":"done","job_id":"x","result":"r"}"#;
        let event: SseEvent = serde_json::from_str(data).unwrap();
        match event {
            SseEvent::Done { job_id, result } => {
                assert_eq!(job_id, "x");
                assert_eq!(result, "r");
            }
            _ => panic!("expected Done variant"),
        }
    }

    #[test]
    fn test_sse_event_error_deserialize() {
        let data = r#"{"type":"error","job_id":"x","error":"e"}"#;
        let event: SseEvent = serde_json::from_str(data).unwrap();
        match event {
            SseEvent::Error { job_id, error } => {
                assert_eq!(job_id, "x");
                assert_eq!(error, "e");
            }
            _ => panic!("expected Error variant"),
        }
    }

    #[test]
    fn test_sse_event_cancelled_deserialize() {
        let data = r#"{"type":"cancelled","job_id":"x"}"#;
        let event: SseEvent = serde_json::from_str(data).unwrap();
        match event {
            SseEvent::Cancelled { job_id } => {
                assert_eq!(job_id, "x");
            }
            _ => panic!("expected Cancelled variant"),
        }
    }
}
