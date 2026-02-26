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
