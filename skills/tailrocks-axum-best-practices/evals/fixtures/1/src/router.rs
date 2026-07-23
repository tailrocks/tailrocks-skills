use axum::{routing::post, Router};
use tower::ServiceBuilder;

pub fn router() -> Router {
    Router::new()
        .route("/upload", post(|| async { "ok" }))
        .layer(ServiceBuilder::new())
}
