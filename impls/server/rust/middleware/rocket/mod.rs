mod tungstenite {
    #[doc(inline)] pub use ws::tungstenite::*;
}

mod duplex;
mod websocket;

pub use self::websocket::{HyperSocket, Channel};
pub use self::tungstenite::Message;
pub use self::tungstenite::protocol::WebSocketConfig as Config;

pub mod frame {
    #[doc(hidden)] pub use super::Message;
    pub use super::tungstenite::protocol::frame::{CloseFrame, Frame};
    pub use super::tungstenite::protocol::frame::coding::CloseCode;
}

pub mod stream {
    pub use super::duplex::DuplexStream;
    pub use super::websocket::MessageStream;
}

pub mod result {
    pub use super::tungstenite::error::{Result, Error};
}

#[macro_export]
macro_rules! Stream {
    () => ($crate::Stream!['static]);
    ($l:lifetime) => (
        $crate::stream::MessageStream<$l, impl rocket::futures::Stream<
            Item = $crate::result::Result<$crate::Message>
        > + $l>
    );
    ($channel:ident => $($token:tt)*) => (
        let ws: $crate::WebSocket = $channel;
        ws.stream(move |$channel| rocket::async_stream::try_stream! {
            $($token)*
        })
    );
}

#[macro_export]
macro_rules! channel {
    (
        ($ws:ident, |mut $stream:ident|) => $body:block
    ) => (
        $ws.channel(move |mut $stream| Box::pin(async move $body))
    );
    (
        ($ws:ident, |$stream:ident|) => $body:block
    ) => (
        $ws.channel(move |$stream| Box::pin(async move $body))
    );
}
