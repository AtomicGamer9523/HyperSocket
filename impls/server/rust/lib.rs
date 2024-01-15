#[cfg(feature = "impl-rocket")]
#[path = "middleware/rocket/mod.rs"]
mod __impl;

#[cfg(feature = "impl-rocket")]
mod __wrapper {
    use crate::__impl::*;

    pub struct HyperSocketServerInner {

    }

    impl HyperSocketServerInner {
        pub const fn new() -> Self {
            Self {

            }
        }
        pub fn assign<'a>(&self, name: String, ws: HyperSocket) -> Channel<'a> {
            use rocket::futures::*;

            ws.channel(move |mut stream| Box::pin(async move {
                while let Some(msg) = stream.next().await {
                    println!("{}: {:?}", name, msg);
                }
                println!("{}: disconnected", name);
                Ok(())
            }))
        }
    }
}

pub type HyperSocket = __impl::HyperSocket;
pub type Channel<'a> = __impl::Channel<'a>;

pub struct HyperSocketServer(__wrapper::HyperSocketServerInner);

impl HyperSocketServer {
    pub const fn new() -> Self {
        Self(__wrapper::HyperSocketServerInner::new())
    }
    pub fn assign<'a, T: ToString>(&self, name: T, ws: HyperSocket) -> Channel<'a> {
        self.0.assign(name.to_string(), ws)
    }
}
