use syn::parse::Parser;

use crate::*;

/// Configuration for the packet
/// 
/// Valid Inputs:
/// ```
/// #[packet(type = C2S, name = "message")]
/// struct Message {}
/// ```
/// ```
/// #[packet(type = S2C, name = "message")]
/// struct Message {}
/// ```
/// ```
/// #[packet(type = C2S)]
/// struct Message {}
/// ```
/// ```
/// #[packet(type = S2C)]
/// struct Message {}
/// ```
/// ```
/// #[packet(S2C)]
/// struct Message {}
/// ```
/// ```
/// #[packet(C2S)]
/// struct Message {}
/// ```
/// ```
/// #[packet(C2S, name = "message")]
/// struct Message {}
/// ```
/// ```
/// #[packet(S2C, name = "message")]
/// struct Message {}
/// ```
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Config {
    pub packet_type: PacketType,
    pub name: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PacketType {
    C2S,
    S2C,
}

type Args = syn::punctuated::Punctuated::<syn::Expr, syn::Token![,]>;

impl Config {
    pub fn parse(input: T) -> syn::Result<Config> {
        // 'C2S' or 'S2C'
        if let Ok(v) = syn::parse2::<syn::Ident>(input.clone()) {
            let packet_type = match v.to_string().as_str() {
                "C2S" => PacketType::C2S,
                "S2C" => PacketType::S2C,
                _ => return Err(syn::Error::new_spanned(v, "Expected 'C2S' or 'S2C'")),
            };
            return Ok(Config {
                packet_type,
                name: None,
            });
        }

        // 'type = C2S' or 'type = S2C'
        let input = Args::parse_terminated.parse2(input.clone())?;
        let mut packet_type = None;
        let mut name = None;

        for expr in input.iter() {
            let (key, value) = if let syn::Expr::Assign(syn::ExprAssign { left, right, .. }) = expr {
                let key = match &**left {
                    syn::Expr::Path(syn::ExprPath { path, .. }) => path,
                    _ => return Err(syn::Error::new_spanned(left, "Expected identifier")),
                };
                (key, right)
            } else {
                return Err(syn::Error::new_spanned(expr, "Expected key-value pair"));
            };

            let key = key.segments.last().unwrap().ident.to_string();
            match key.as_str() {
                "type" => {
                    let value = match &**value {
                        syn::Expr::Path(syn::ExprPath { path, .. }) => path,
                        _ => return Err(syn::Error::new_spanned(value, "Expected identifier")),
                    };
                    let value = value.segments.last().unwrap().ident.to_string();
                    packet_type = match value.as_str() {
                        "C2S" => Some(PacketType::C2S),
                        "S2C" => Some(PacketType::S2C),
                        _ => return Err(syn::Error::new_spanned(value, "Expected 'C2S' or 'S2C'")),
                    };
                }
                "name" => {
                    let value = match &**value {
                        syn::Expr::Lit(syn::ExprLit { lit, .. }) => lit,
                        _ => return Err(syn::Error::new_spanned(value, "Expected string literal")),
                    };
                    let value = match value {
                        syn::Lit::Str(v) => v,
                        _ => return Err(syn::Error::new_spanned(value, "Expected string literal")),
                    };
                    name = Some(value.value());
                }
                _ => return Err(syn::Error::new_spanned(key, "Unknown key")),
            }
        }

        let packet_type = match packet_type {
            None => return Err(syn::Error::new_spanned(input.clone(), "Expected 'type'")),
            Some(v) => v,
        };

        Ok(Config {
            packet_type,
            name,
        })
    }
}

impl ::core::fmt::Display for Config {
    fn fmt(&self, f: &mut ::core::fmt::Formatter) -> ::core::fmt::Result {
        match self.packet_type {
            PacketType::C2S => write!(f, "C2S"),
            PacketType::S2C => write!(f, "S2C"),
        }
    }
}
