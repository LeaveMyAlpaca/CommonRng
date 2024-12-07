use rand::prelude::*;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::prelude::*;
#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[allow(non_camel_case_types)]
#[allow(non_snake_case)]

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_default,
            select_random,
            save_file,
            parse_save
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn get_default() -> Vec<RandomThing> {
    return vec![RandomThing {
        name: format!("Test").to_string(),
        localization_of_icon: "/Images/vite.svg".to_string(),
        color: "#00b70b".to_string(),
    }];
}

#[tauri::command]
fn select_random(vec_to_select_from: Vec<RandomThing>) -> RandomThing {
    let mut rng = rand::thread_rng();

    return vec_to_select_from[rng.gen_range(0..vec_to_select_from.len())].clone();
}

#[tauri::command]
fn save_file(settings: Vec<RandomThing>, path: String) {
    let file = File::create(path);
    file.unwrap().write(to_save(settings).as_bytes());
}

fn to_save(settings: Vec<RandomThing>) -> String {
    let mut output: String = String::new();

    for setting_index in 0..settings.len() {
        let setting: &RandomThing = &settings[setting_index];
        output += &format!(
            "{}\n{}\n{}\n",
            setting.name, setting.localization_of_icon, setting.color
        );
    }

    return output;
}

#[tauri::command]
fn parse_save(path: String) -> Vec<RandomThing> {
    let contents: String =
        fs::read_to_string(path).expect("Should have been able to read the file");
    let splitted_contents = contents.split("\n");

    let mut return_vec: Vec<RandomThing> = Vec::new();
    let mut current_index = 0;
    let mut name: &str = "";
    let mut localization_of_icon: &str = "";
    for str in splitted_contents {
        current_index += 1;

        if current_index == 1 {
            name = str;
        } else if current_index == 2 {
            localization_of_icon = str;
        } else {
            return_vec.push(RandomThing {
                name: name.to_string(),
                localization_of_icon: localization_of_icon.to_string(),
                color: str.to_string(),
            });
            current_index = 0;
        }
    }

    return return_vec;
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RandomThing {
    pub name: String,
    pub localization_of_icon: String,
    pub color: String,
}
