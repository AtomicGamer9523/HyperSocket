use std::pin::Pin;
use std::task::{Context, Poll};

use rocket::data::IoStream;
use rocket::futures::{StreamExt, SinkExt, Sink};
use rocket::futures::stream::{Stream, FusedStream};

use super::frame::{Message, CloseFrame};
use super::result::{Result, Error};

pub struct DuplexStream(ws::WebSocketStream<IoStream>);

impl DuplexStream {
    pub(crate) async fn new(stream: IoStream, config: super::Config) -> Self {
        use ws::WebSocketStream;
        use super::tungstenite::protocol::Role;

        let inner = WebSocketStream::from_raw_socket(stream, Role::Server, Some(config));
        DuplexStream(inner.await)
    }

    pub async fn close(&mut self, msg: Option<CloseFrame<'_>>) -> Result<()> {
        self.0.close(msg).await
    }
}

impl Stream for DuplexStream {
    type Item = Result<Message>;

    fn poll_next(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Option<Self::Item>> {
        self.get_mut().0.poll_next_unpin(cx)
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        self.0.size_hint()
    }
}

impl FusedStream for DuplexStream {
    fn is_terminated(&self) -> bool {
        self.0.is_terminated()
    }
}

impl Sink<Message> for DuplexStream {
    type Error = Error;

    fn poll_ready(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.get_mut().0.poll_ready_unpin(cx)
    }

    fn start_send(self: Pin<&mut Self>, item: Message) -> Result<(), Self::Error> {
        self.get_mut().0.start_send_unpin(item)
    }

    fn poll_flush(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.get_mut().0.poll_flush_unpin(cx)
    }

    fn poll_close(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.get_mut().0.poll_close_unpin(cx)
    }
}
