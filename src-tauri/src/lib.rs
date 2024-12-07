use std::thread::Thread;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use rand::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::prelude::*;
use tauri::window::Color;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[allow(non_camel_case_types)]
#[allow(non_snake_case)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            GetRandomThings,
            SelectRandom,
            Test,
            SaveFile,
            ParseSave
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn GetRandomThings() -> Vec<RandomThing> {
    println!("GetRandomThings");
    let mut x = 1;
    return vec![
        RandomThing {
            name: format!("Test 0 {x}").to_string(),
            localization_of_icon: "/Images/vite.svg".to_string(),
            color: "#00b70b".to_string(),
        },
        RandomThing {
            name: "rand".to_string(),
            localization_of_icon: "/Images/Test/vite.svg".to_string(),
            color: "#2f4230".to_string(),
        },
        RandomThing {
            name: "Test 1".to_string(),
            localization_of_icon: "/Images/dice.svg".to_string(),
            color: "#e42038".to_string(),
        },
        RandomThing {
            name: "Hello".to_string(),
            localization_of_icon: "/Images/add.svg".to_string(),
            color: "#ffffff".to_string(),
        },
    ];
}

#[tauri::command]
fn SelectRandom(vecToSelectFrom: Vec<RandomThing>) -> RandomThing {
    let mut rng = rand::thread_rng();

    return vecToSelectFrom[rng.gen_range(0..vecToSelectFrom.len())].clone();
}

#[tauri::command]
fn SaveFile(settings: Vec<RandomThing>, path: String) {
    println!("SaveFile {path}");
    let mut file = File::create(path);
    file.unwrap().write(to_save(settings).as_bytes());
}

#[tauri::command]
fn Test() {
    println!("Test.RS");
}

const SETTING_SAVE_SIZE: u8 = 3;
fn to_save(settings: Vec<RandomThing>) -> String {
    let mut output: String = String::new();

    for settingIndex in 0..settings.len() {
        let setting: &RandomThing = &settings[settingIndex];
        output += &format!(
            "${}\n{}\n{}\n",
            setting.name, setting.localization_of_icon, setting.color
        );
    }

    return output;
}
#[tauri::command]
fn ParseSave(path: String) -> Vec<RandomThing> {
    return Vec::new();
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RandomThing {
    pub name: String,
    pub localization_of_icon: String,
    pub color: String,
}
