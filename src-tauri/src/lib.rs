mod commands;
mod error;
mod job;
mod python_manager;
mod setup_manager;
mod sse_client;
mod state;

use tauri::Manager;

use state::{AppState, SharedState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(SharedState::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            commands::check_setup,
            commands::run_setup,
            commands::reset_setup,
            commands::start_server,
            commands::stop_server,
            commands::get_server_status,
            commands::start_inference,
            commands::cancel_job,
            commands::get_jobs,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                let state = app.state::<SharedState>();
                let mut s = state.lock().expect("Failed to lock state");
                if let Some(ref mut child) = s.server_process {
                    log::info!("Cleaning up Python server process on exit");
                    let _ = python_manager::kill_server(child);
                }
                s.server_process = None;
            }
        });
}
