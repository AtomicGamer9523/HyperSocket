extern crate proc_macro;

use proc_macro2::TokenStream as T;
use proc_macro::TokenStream;

use syn::Result;

mod packet;

#[inline(always)]
#[proc_macro_attribute]
pub fn packet(input: TokenStream, cfg: TokenStream) -> TokenStream {
    packet::packet(input.into(), cfg.into()).into()
}
