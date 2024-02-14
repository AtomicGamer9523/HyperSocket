use crate::*;

pub trait C2SPacket<'a>: serde::Deserialize<'a> { }

pub trait S2CPacket: serde::Serialize { }

pub trait C2SEventHandler<'a, P> where
    Self: Send + Sync + 'a
{   
    fn handle(&self, packet: P);
}

impl<'a, F, P> C2SEventHandler<'a, P> for F where
    F: Fn(P) + Send + Sync + 'a,
{
    #[inline(always)]
    fn handle(&self, packet: P) {
        self(packet);
    }
}
