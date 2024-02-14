pub enum Error {

}

use ::core::result::Result as R;
pub type Result<T = (), E = Error> = R<T, E>;

pub mod prelude;
