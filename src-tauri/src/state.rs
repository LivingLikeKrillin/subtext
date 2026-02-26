use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;

use crate::job::Job;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ServerStatus {
    STOPPED,
    STARTING,
    RUNNING,
    ERROR,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[allow(non_camel_case_types)]
pub enum SetupStatus {
    CHECKING,
    NEEDED,
    IN_PROGRESS,
    COMPLETE,
    ERROR,
}

pub struct AppState {
    pub server_status: ServerStatus,
    pub server_process: Option<std::process::Child>,
    pub python_port: u16,
    pub jobs: HashMap<String, Job>,
    pub setup_status: SetupStatus,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            server_status: ServerStatus::STOPPED,
            server_process: None,
            python_port: 9111,
            jobs: HashMap::new(),
            setup_status: SetupStatus::CHECKING,
        }
    }
}

pub type SharedState = Mutex<AppState>;
