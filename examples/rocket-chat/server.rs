#[macro_use] extern crate rocket;

use rocket::fs::{FileServer, relative};
use hypersocket::*;

mod sessions;
mod stupiddb;

const HSS: HyperSocket = HyperSocket::uninit();

#[launch]
async fn rocket() -> _ {
    HSS.init();

    HSS.on("message", message_handler).unwrap();

    rocket::build()
        .mount("/", sessions::routes())
        .mount("/", FileServer::from(relative!("static")))
}

fn message_handler(msg: JsonValue) {
    println!("{}", msg);
}
