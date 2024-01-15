use std::io;
use std::pin::Pin;

use rocket::data::{IoHandler, IoStream};
use rocket::futures::{self, StreamExt, SinkExt, future::BoxFuture, stream::SplitStream};
use rocket::response::{self, Responder, Response};
use rocket::request::{FromRequest, Request, Outcome};
use rocket::http::Status;

use super::{Config, Message};
use super::stream::DuplexStream;
use super::result::{Result, Error};

pub struct HyperSocket {
    config: Config,
    key: String,
}

impl HyperSocket {
    fn new(key: String) -> Self {
        Self { config: Config::default(), key }
    }
    pub fn config(mut self, config: Config) -> Self {
        self.config = config;
        self
    }
    pub fn channel<'r, F: Send + 'r>(self, handler: F) -> Channel<'r>
        where F: FnOnce(DuplexStream) -> BoxFuture<'r, Result<()>> + 'r
    {
        Channel { ws: self, handler: Box::new(handler), }
    }
    pub fn stream<'r, F, S>(self, stream: F) -> MessageStream<'r, S>
        where F: FnOnce(SplitStream<DuplexStream>) -> S + Send + 'r,
              S: futures::Stream<Item = Result<Message>> + Send + 'r
    {
        MessageStream { ws: self, handler: Box::new(stream), }
    }
}

pub struct Channel<'r> {
    ws: HyperSocket,
    handler: Box<dyn FnOnce(DuplexStream) -> BoxFuture<'r, Result<()>> + Send + 'r>,
}

pub struct MessageStream<'r, S> {
    ws: HyperSocket,
    handler: Box<dyn FnOnce(SplitStream<DuplexStream>) -> S + Send + 'r>
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for HyperSocket {
    type Error = std::convert::Infallible;

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        use super::tungstenite::handshake::derive_accept_key;
        use rocket::http::uncased::eq;

        let headers = req.headers();
        let is_upgrade = headers.get("Connection")
            .any(|h| h.split(',').any(|v| eq(v.trim(), "upgrade")));

        let is_ws = headers.get("Upgrade")
            .any(|h| h.split(',').any(|v| eq(v.trim(), "websocket")));

        let is_13 = headers.get_one("Sec-WebSocket-Version").map_or(false, |v| v == "13");
        let key = headers.get_one("Sec-WebSocket-Key").map(|k| derive_accept_key(k.as_bytes()));
        match key {
            Some(key) if is_upgrade && is_ws && is_13 => Outcome::Success(HyperSocket::new(key)),
            Some(_) | None => Outcome::Forward(Status::BadRequest)
        }
    }
}

impl<'r, 'o: 'r> Responder<'r, 'o> for Channel<'o> {
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'o> {
        Response::build()
            .raw_header("Sec-Websocket-Version", "13")
            .raw_header("Sec-WebSocket-Accept", self.ws.key.clone())
            .upgrade("websocket", self)
            .ok()
    }
}

impl<'r, 'o: 'r, S> Responder<'r, 'o> for MessageStream<'o, S>
    where S: futures::Stream<Item = Result<Message>> + Send + 'o
{
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'o> {
        Response::build()
            .raw_header("Sec-Websocket-Version", "13")
            .raw_header("Sec-WebSocket-Accept", self.ws.key.clone())
            .upgrade("websocket", self)
            .ok()
    }
}

#[rocket::async_trait]
impl IoHandler for Channel<'_> {
    async fn io(self: Pin<Box<Self>>, io: IoStream) -> io::Result<()> {
        let channel = Pin::into_inner(self);
        let result = (channel.handler)(DuplexStream::new(io, channel.ws.config).await).await;
        handle_result(result).map(|_| ())
    }
}

#[rocket::async_trait]
impl<'r, S> IoHandler for MessageStream<'r, S>
    where S: futures::Stream<Item = Result<Message>> + Send + 'r
{
    async fn io(self: Pin<Box<Self>>, io: IoStream) -> io::Result<()> {
        let (mut sink, source) = DuplexStream::new(io, self.ws.config).await.split();
        let handler = Pin::into_inner(self).handler;
        let mut stream = std::pin::pin!((handler)(source));
        while let Some(msg) = stream.next().await {
            let result = match msg {
                Ok(msg) => sink.send(msg).await,
                Err(e) => Err(e)
            };

            if !handle_result(result)? {
                return Ok(());
            }
        }

        Ok(())
    }
}

/// Returns `Ok(true)` if processing should continue, `Ok(false)` if processing
/// has terminated without error, and `Err(e)` if an error has occurred.
fn handle_result(result: Result<()>) -> io::Result<bool> {
    match result {
        Ok(_) => Ok(true),
        Err(Error::ConnectionClosed) => Ok(false),
        Err(Error::Io(e)) => Err(e),
        Err(e) => Err(io::Error::new(io::ErrorKind::Other, e))
    }
}
