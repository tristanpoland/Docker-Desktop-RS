use tauri::{Manager, Runtime};
use std::process::Command;
use serde::{Deserialize, Serialize};
use tauri::Emitter; // Import this to fix the emit method errors

#[derive(Debug, Serialize, Deserialize)]
struct DockerInfo {
    running: bool,
    version: Option<String>,
    error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct CommandOutput {
    success: bool,
    stdout: String,
    stderr: String,
    code: Option<i32>,
}

// Check if Docker is running and get version
#[tauri::command]
fn check_docker() -> DockerInfo {
    let output = Command::new("docker")
        .arg("info")
        .output();
    
    match output {
        Ok(output) => {
            if output.status.success() {
                // Get Docker version
                let version_output = Command::new("docker")
                    .args(["version", "--format", "{{.Server.Version}}"])
                    .output();
                
                match version_output {
                    Ok(version_output) => {
                        let version = String::from_utf8_lossy(&version_output.stdout).trim().to_string();
                        DockerInfo {
                            running: true,
                            version: Some(version),
                            error: None,
                        }
                    },
                    Err(_) => DockerInfo {
                        running: true,
                        version: None,
                        error: Some("Failed to get Docker version".to_string()),
                    }
                }
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                DockerInfo {
                    running: false,
                    version: None,
                    error: Some(stderr),
                }
            }
        },
        Err(e) => DockerInfo {
            running: false,
            version: None,
            error: Some(e.to_string()),
        }
    }
}

// Execute a generic Docker command
#[tauri::command]
fn run_docker_command(args: Vec<String>) -> CommandOutput {
    let output = Command::new("docker")
        .args(&args)
        .output();
    
    match output {
        Ok(output) => {
            let stdout = String::from_utf8_lossy(&output.stdout).to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).to_string();
            
            CommandOutput {
                success: output.status.success(),
                stdout,
                stderr,
                code: output.status.code(),
            }
        },
        Err(e) => CommandOutput {
            success: false,
            stdout: String::new(),
            stderr: e.to_string(),
            code: None,
        }
    }
}

// Get list of containers
#[tauri::command]
fn get_containers() -> CommandOutput {
    run_docker_command(vec![
        "ps".to_string(),
        "-a".to_string(),
        "--format".to_string(),
        "{{json .}}".to_string(),
    ])
}

// Get list of images
#[tauri::command]
fn get_images() -> CommandOutput {
    run_docker_command(vec![
        "images".to_string(),
        "--format".to_string(),
        "{{json .}}".to_string(),
    ])
}

// Start container
#[tauri::command]
fn start_container(container_id: String) -> CommandOutput {
    run_docker_command(vec!["start".to_string(), container_id])
}

// Stop container
#[tauri::command]
fn stop_container(container_id: String) -> CommandOutput {
    run_docker_command(vec!["stop".to_string(), container_id])
}

// Remove container
#[tauri::command]
fn remove_container(container_id: String) -> CommandOutput {
    run_docker_command(vec!["rm".to_string(), container_id])
}

// Remove image
#[tauri::command]
fn remove_image(image_id: String) -> CommandOutput {
    run_docker_command(vec!["rmi".to_string(), image_id])
}

// Main app entry point for Tauri v2
pub fn run() {
    tauri::Builder::default()
        // Setup app on launch
        .setup(|app| {
            // Set up menu event handling
            let main_window = app.get_webview_window("main").unwrap();
            
            // Register menu event handler
            main_window.on_menu_event(move |window, event| {
                // Get the menu id as a string
                let menu_id = format!("{:?}", event.id());
                
                match menu_id.as_str() {
                    "quit" => {
                        std::process::exit(0);
                    }
                    "refresh" => {
                        let _ = window.emit("app://refresh", ());
                    }
                    "toggleSidebar" => {
                        let _ = window.emit("app://toggleSidebar", ());
                    }
                    "containers" => {
                        let _ = window.emit("app://setTab", "containers");
                    }
                    "images" => {
                        let _ = window.emit("app://setTab", "images");
                    }
                    _ => {}
                }
            });
            
            Ok(())
        })
        // Register all the commands
        .invoke_handler(tauri::generate_handler![
            check_docker,
            run_docker_command,
            get_containers,
            get_images,
            start_container,
            stop_container,
            remove_container,
            remove_image,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}