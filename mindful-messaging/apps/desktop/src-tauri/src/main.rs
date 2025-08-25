// main.rs
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
  )]
  
  use tauri::{GlobalShortcutManager, Manager};
  
  fn main() {
    tauri::Builder::default()
      .setup(|app| {
        let handle = app.handle();
        let mut shortcut_manager = handle.global_shortcut_manager();
        // Register Ctrl+Shift+M (or Cmd+Shift+M on macOS)
        shortcut_manager.register("CmdOrCtrl+Shift+M", move || {
            // Bring the main window to the front
            if let Some(window) = handle.get_window("main") {
                window.show().unwrap();
                window.set_focus().unwrap();
            }
        })?;
        Ok(())
      })
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
  }