use std::cell::OnceCell;
use std::sync::Mutex;

#[cfg(feature = "__middleware")]
pub mod middleware;
mod inner;

use inner::HyperSocketInner;

pub struct HyperSocket(OnceCell<Mutex<HyperSocketInner>>);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Error {
    /// The HyperSocket is not initialized.
    NotInitialized,
    /// The HyperSocket is already initialized.
    AlreadyInitialized,
    /// The HyperSocket internal mutex is poisoned.
    MutexPoisoned,
}

impl core::fmt::Display for Error {
    fn fmt(&self, f: &mut core::fmt::Formatter) -> core::fmt::Result {
        match self {
            Self::NotInitialized => write!(f, "The HyperSocket is not initialized."),
            Self::AlreadyInitialized => write!(f, "The HyperSocket is already initialized."),
            Self::MutexPoisoned => write!(f, "The HyperSocket internal mutex is poisoned."),
        }
    }
}

impl std::error::Error for Error {}

pub type Result<T = (), E = Error> = core::result::Result<T, E>;

impl HyperSocket {
    /// Create an uninitialized HyperSocket.
    /// 
    /// # Example
    /// 
    /// ```rust
    /// const HSS: HyperSocket = HyperSocket::uninit();
    /// 
    /// fn main() {
    ///     HSS.init();
    /// }
    /// ```
    pub const fn uninit() -> Self {
        Self(OnceCell::new())
    }
    /// Initialize the HyperSocket.
    /// 
    /// If the HyperSocket is already initialized, this function does nothing.
    /// 
    /// # Example
    /// 
    /// ```rust
    /// const HSS: HyperSocket = HyperSocket::uninit();
    /// 
    /// fn main() {
    ///     HSS.init();
    /// }
    /// ```
    pub fn init(&self) {
        self.0.get_or_init(|| Mutex::new(HyperSocketInner::new()));
    }
    /// Register a handler for an event.
    /// 
    /// If the HyperSocket is not initialized, this function initializes it.
    /// This is the preferred way, however, if you do not want to this to
    /// initialize the HyperSocket, use [`on_noinit`](#method.on_noinit).
    /// 
    /// # Example
    /// 
    /// ```rust
    /// const HSS: HyperSocket = HyperSocket::uninit();
    /// 
    /// fn main() {
    ///     HSS.on("message", message_handler);
    /// }
    /// 
    /// fn message_handler(msg: JsonValue) {
    ///     println!("{}", msg);
    /// }
    /// ```
    pub fn on<F>(&self, name: &'static str, handler: F) -> Result where
        F: FnMut(json::Value) + 'static + Send + Sync,
    {
        self.init();
        let inner = match self.0.get() {
            Some(inner) => inner,
            None => unreachable!("We just initialized it!"),
        };
        inner.lock().map_err(|_| Error::MutexPoisoned)?.on(name, handler)
    }

    /// Register a handler for an event.
    /// 
    /// If the HyperSocket is not initialized, this function does nothing.
    /// 
    /// # Example
    /// 
    /// ```rust
    /// const HSS: HyperSocket = HyperSocket::uninit();
    /// 
    /// fn main() {
    ///     HSS.on_noinit("message", message_handler1);
    ///     HSS.init();
    ///     HSS.on_noinit("message", message_handler2);
    /// }
    /// 
    /// fn message_handler1(msg: JsonValue) {
    ///     println!("1: {}", msg); // This will never be called.
    /// }
    /// 
    /// fn message_handler2(msg: JsonValue) {
    ///    println!("2: {}", msg);
    /// }
    /// ```
    pub fn on_noinit<F>(&self, name: &'static str, handler: F) -> Result where
        F: FnMut(json::Value) + 'static + Send + Sync,
    {
        if let Some(inner) = self.0.get() {
            inner.lock().map_err(|_| Error::MutexPoisoned)?.on(name, handler)?;
        }
        Err(Error::NotInitialized)
    }
}
