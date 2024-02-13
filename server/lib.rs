pub use base::*;

#[cfg(feature = "macros")]
pub use macros::*;

#[test]
#[cfg(feature = "macros")]
fn example() {

    #[packet(C2S)]
    struct Message {
        text: String
    }

    #[packet(S2C)]
    struct Message {
        text: String,
        author: String,
    }

    #[packet(map)]
    enum PacketMap {
        c2s {
            message: Message
        },
        s2c {
            message: Message
        }
    }
}