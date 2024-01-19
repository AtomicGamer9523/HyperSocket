#[cfg(feature = "impl-rocket")]
#[path = "middleware/rocket/mod.rs"]
mod __impl;

#[cfg(feature = "impl-axum")]
#[path = "middleware/axum/mod.rs"]
mod __impl;

// pub struct HyperSocket(__impl::HyperSocketImpl);
// 
// impl HyperSocket {
//     pub fn new() -> Self {
//         Self(__impl::HyperSocketImpl::new())
//     }
// }
