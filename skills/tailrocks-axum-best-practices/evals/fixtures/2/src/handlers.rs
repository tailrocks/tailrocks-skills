use axum::Json;
use serde_json::{json, Value};

pub async fn create(Json(body): Json<Value>) -> Json<Value> {
    Json(json!({ "status": "ok", "input": body }))
}

pub async fn update(Json(body): Json<Value>) -> Json<Value> {
    Json(json!({ "status": "ok", "input": body }))
}
