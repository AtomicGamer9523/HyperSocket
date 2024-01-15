use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::task;
use crate::*;

type Handler = Box<dyn FnMut(JsonValue) + 'static + Send + Sync>;
type ID = &'static str;

pub(crate) struct HyperSocketInner {
    thread: task::JoinHandle<()>,
    handlers: Arc<Mutex<HashMap<ID, Vec<Handler>>>>,
}

impl HyperSocketInner {
    pub(crate) fn new() -> Self {
        let thread = tokio::spawn(async {
            loop {
                tokio::time::sleep(std::time::Duration::from_secs(1)).await;
            }
        });
        Self {
            thread,
            handlers: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    pub(crate) fn on<F>(&mut self, name: &'static str, f: F) -> Result where
        F: FnMut(JsonValue) + 'static + Send + Sync,
    {
        Ok(())
        // self.handlers.entry(name).or_default().push(Box::new(f));
    }
}