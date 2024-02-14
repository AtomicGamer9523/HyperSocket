pub use base::*;

#[cfg(feature = "macros")]
pub use macros::*;

#[doc(hidden)]
pub use serde::Deserialize as __Deserialize;
#[doc(hidden)]
pub use serde::Serialize as __Serialize;

struct HyperSocketServer {}
impl HyperSocketServer {
    fn init() -> Self {
        Self {}
    }
    #[doc(hidden)]
    fn __on<'a, H, P>(&self, name: &str, handler: H) where
        H: prelude::C2SEventHandler<'a, P>,
        P: prelude::C2SPacket<'a>
    {
        todo!()
    }
    #[doc(hidden)]
    fn __emit<P>(&self, name: &str, packet: P) where
        P: prelude::S2CPacket
    {
        todo!()
    }
}

#[test]
#[cfg(feature = "macros")]
fn example() {

    #[packet(C2S)]
    struct Message {
        text: String
    }
    // #[packet(type = C2S, name = "join")]
    // struct Join {
    //     username: String
    // }
    // #[packet(type = C2S, name = "leave")]
    // struct Leave {
    //     username: String
    // }
    // #[packet(type = S2C, name = "message")]
    // struct Message {
    //     text: String,
    //     author: String,
    // }

    #[derive(Debug, serde::Deserialize, serde::Serialize)]
    struct Join_C2S {
        username: String
    }
    impl<'a> prelude::C2SPacket<'a> for Join_C2S {}
    impl HyperSocketServer {
        #[inline(always)]
        fn on_join<'a, H>(&self, handler: H) where
            H: prelude::C2SEventHandler<'a, Join_C2S>
        { self.__on::<H, Join_C2S>("join", handler); }
    }

    #[derive(Debug, serde::Deserialize, serde::Serialize)]
    struct Message_C2S {
        text: String
    }
    impl<'a> prelude::C2SPacket<'a> for Message_C2S {}
    impl HyperSocketServer {
        #[inline(always)]
        fn on_message<'a>(&self, handler: impl prelude::C2SEventHandler<'a, Message_C2S>)
        { self.__on("message", handler); }
    }

    #[derive(Debug, serde::Deserialize, serde::Serialize)]
    struct Leave_C2S {
        username: String
    }
    impl<'a> prelude::C2SPacket<'a> for Leave_C2S {}
    impl HyperSocketServer {
        #[inline(always)]
        fn on_leave<'a, H>(&self, handler: H) where
            H: prelude::C2SEventHandler<'a, Leave_C2S>
        { self.__on::<H, Leave_C2S>("leave", handler); }
    }

    #[derive(Debug, serde::Deserialize, serde::Serialize)]
    struct Message_S2C {
        text: String
    }
    impl prelude::S2CPacket for Message_S2C {}
    impl HyperSocketServer {
        #[inline(always)]
        fn emit_message(&self, message: Message_S2C) {
            self.__emit("message", message);
        }
    }

    let hss = HyperSocketServer::init();

    fn on_message(event: Message_C2S) {
        println!("Received message: {}", event.text);
    }
    
    fn on_join(event: Join_C2S) {
        println!("Received join: {}", event.username);
    }

    fn on_leave(event: Leave_C2S) {
        println!("Received leave: {}", event.username);
    }

    hss.on_message(on_message);
    hss.on_join(on_join);
    hss.on_leave(on_leave);

    hss.emit_message(Message_S2C {
        text: "Hello, world!".to_string()
    });
}