pub enum Error {

}

use ::core::result::Result as R;
pub type Result<T = (), E = Error> = R<T, E>;

pub trait PacketMap {
    type C2S: C2SPackets;
    type S2C: S2CPackets;
}

pub trait C2SPackets {

}

pub trait C2SPacket<'a>: serde::Deserialize<'a> + serde::Serialize {
    const NAME: &'static str;
}

pub trait S2CPackets {

}

pub trait S2CPacket<'a>: serde::Deserialize<'a> + serde::Serialize {
    const NAME: &'static str;
}
