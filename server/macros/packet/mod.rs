use crate::*;

mod config;

/// Transforms this:
/// ```rust
/// #[packet(type = C2S, name = "message")]
/// struct Message {
///     text: String
/// }
/// ```
/// into this:
/// ```rust
/// #[derive(Debug, __Deserialize)]
/// struct Message_C2S {
///     text: String
/// }
/// impl<'a> prelude::C2SPacket<'a> for Message_C2S {}
/// impl HyperSocketServer {
///     #[inline(always)]
///     fn on_message<'a, H>(&self, f: H) where
///         H: prelude::HyperSocketC2SEventHandler<'a, Message_C2S>
///     { self.__on("message",f); }
/// }
/// ```
pub(crate) fn packet(cfg: T, input: T) -> T {
    let config = match config::Config::parse(cfg) {
        Err(err) => return err.to_compile_error().into(),
        Ok(v) => v,
    };

    let packet = match syn::parse2::<syn::ItemStruct>(input) {
        Err(err) => return err.to_compile_error().into(),
        Ok(v) => v,
    };

    let packet_struct_name = syn::Ident::new(
        &format!("{}{}", packet.ident, match config.packet_type {
            config::PacketType::C2S => "_C2S",
            config::PacketType::S2C => "_S2C",
        }),
        proc_macro2::Span::call_site(),
    );

    let packet_name = packet.ident.to_string();
    let packet_name = config.name.unwrap_or(packet_name);

    let packet_struct_derive = if config.packet_type == config::PacketType::C2S {
        quote::quote!(#[derive(hypersocket::__Deserialize)])
    } else {
        quote::quote!(#[derive(hypersocket::__Serialize)])
    };

    let packet_struct_impl = if config.packet_type == config::PacketType::C2S {
        quote::quote!(
            impl<'a> ::hypersocket::prelude::C2SPacket<'a> for #packet_struct_name {}
        )
    } else {
        quote::quote!(
            impl ::hypersocket::prelude::S2CPacket for #packet_struct_name {}
        )
    };

    let hypersocketserver_struct_impl = if config.packet_type == config::PacketType::C2S {
        let method_name = syn::Ident::new(
            &format!("on_{}", packet_name.to_lowercase()),
            proc_macro2::Span::call_site(),
        );

        quote::quote!(
            #[doc = "Registers a handler for the `"]
            #[doc = #packet_name]
            #[doc = "` packet."]
            ///
            /// This was automatically generated by `hypersocket`'s `#[packet]` macro.
            #[inline(always)]
            pub fn #method_name<'a, H>(&self, handler: H) where
                H: ::hypersocket::prelude::HyperSocketC2SEventHandler<'a, #packet_struct_name>
            { self.__on::<H, #packet_struct_name>(#packet_name, handler); }
        )
    } else {
        let method_name = syn::Ident::new(
            &format!("emit_{}", packet_name.to_lowercase()),
            proc_macro2::Span::call_site(),
        );

        quote::quote!(
            #[doc = "Emits the `"]
            #[doc = #packet_name]
            #[doc = "` packet."]
            ///
            /// This was automatically generated by `hypersocket`'s `#[packet]` macro.
            #[inline(always)]
            pub fn #method_name(&self, packet: #packet_struct_name) {
                self.__emit(#packet_name, packet);
            }
        )
    };

    quote::quote!(
        #packet_struct_derive
        struct #packet_struct_name {
            #packet.fields
        }
        #packet_struct_impl
        impl HyperSocketServer {
            #hypersocketserver_struct_impl
        }
    )
}
