//! Middleware implementations for the server.
//! 
//! This is useful for integrating HyperSocket with other frameworks.
//! 
//! Frameworks supported:
//! - [Rocket](https://rocket.rs)
//! - Axum (planned)

#[cfg(feature = "middleware-rocket")]
mod rocket;

#[cfg(feature = "middleware-rocket")]
use rocket as __middleware;

pub use __middleware::*;