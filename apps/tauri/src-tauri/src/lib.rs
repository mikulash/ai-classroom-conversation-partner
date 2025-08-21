// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use log::{info};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};
use tauri::{generate_handler};
use tauri_plugin_log::{Target, TargetKind};

#[derive(Debug, Serialize, Deserialize)]
pub struct EphemeralTokenResponse {
    pub client_secret: ClientSecret,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ClientSecret {
    pub value: String,
    pub expires_at: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct TokenRequest {
    model: String,
    voice: String,
}

#[tauri::command]
async fn get_ephemeral_token(
    model: String,
    voice: String,
    key: String,
) -> Result<EphemeralTokenResponse, String> {
    info!("BE: get ephemeral token");

    info!("Retrieved API key from store: {}", key);

    // Create headers with API key
    let mut headers = HeaderMap::new();
    headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", key))
            .map_err(|e| format!("Failed to create Authorization header: {}", e))?,
    );
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));

    // Create request body
    let request_body = TokenRequest { model, voice };

    // Make request to OpenAI API to get ephemeral token
    let client = reqwest::Client::new();
    let response = client
        .post("https://api.openai.com/v1/realtime/sessions")
        .headers(headers)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Failed to send request: {}", e))?;

    // Parse response
    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API request failed: {}", error_text));
    }

    let token_response = response
        .json::<EphemeralTokenResponse>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    Ok(token_response)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .target(Target::new(TargetKind::LogDir {
                    file_name: Some("logs".to_string()),
                }))
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .setup(|_| {
            eprintln!("setup");
            Ok(())
        })
        .invoke_handler(generate_handler![get_ephemeral_token])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
