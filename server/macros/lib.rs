extern crate proc_macro;

use proc_macro::TokenStream as T;

#[proc_macro_attribute]
pub fn packet(input: T, cfg: T) -> T {
    let packet_type = match parse_packet_type(input) {
        Err(e) => return e.to_compile_error().into(),
        Ok(v) => v,
    };
    let packet_data = syn::parse_macro_input!(cfg as syn::ItemStruct);
    let packet_name = syn::Ident::new(&format!("{}_{packet_type}", packet_data.ident), packet_data.ident.span());

    let packet_fields = match packet_data.fields {
        syn::Fields::Named(fields) => fields.named,
        _ => return syn::Error::new_spanned(packet_data, "Expected named fields").to_compile_error().into(),
    };

    let packet_fields = packet_fields.iter().map(|field| {
        let field_name = field.ident.as_ref().unwrap();
        let field_ty = &field.ty;
        quote::quote! {
            pub #field_name: #field_ty,
        }
    });

    let packet_fields = quote::quote! {
        #(#packet_fields)*
    };

    quote::quote! {
        #[allow(non_camel_case_types)]
        #[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
        pub struct #packet_name {
            #packet_fields
        }
    }.into()
}

enum PacketType {
    C2S,
    S2C,
    Map
}

impl ::std::fmt::Display for PacketType {
    fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
        match self {
            PacketType::C2S => write!(f, "C2S"),
            PacketType::S2C => write!(f, "S2C"),
            PacketType::Map => write!(f, "Map"),
        }
    }
}

fn parse_packet_type(input: T) -> syn::Result<PacketType> {
    let input = input.to_string().to_lowercase();
    if input.contains("map") {
        Ok(PacketType::Map)
    } else if input.contains("c2s") {
        Ok(PacketType::C2S)
    } else if input.contains("s2c") {
        Ok(PacketType::S2C)
    } else {
        Err(syn::Error::new_spanned(input, "Expected 'C2S', 'S2C', or 'map'"))
    }
}
