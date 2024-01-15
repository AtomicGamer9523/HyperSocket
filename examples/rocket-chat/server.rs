#[macro_use] extern crate rocket;

use rocket::fs::{FileServer, relative};
use hypersocket::*;

mod sessions;
mod stupiddb;

const HSS: HyperSocketServer = HyperSocketServer::new();

#[get("/hypersocket.lib.js")]
async fn hypersocket_js() -> sessions::Res {
    (
        rocket::http::Status::Ok, (
        rocket::http::ContentType::JavaScript,
        rocket::tokio::fs::read_to_string("../../impls/client/js/lib.js")
        .await.unwrap_or("".to_string())
    ))
}

#[get("/?<name>")]
fn wsroot<'a>(ws: HyperSocket, name: &str) -> Channel<'a> {
    HSS.assign(name, ws)
}

#[launch]
async fn rocket() -> _ {
    rocket::build()
        .mount("/", routes![wsroot, hypersocket_js])
        .mount("/", sessions::routes())
        .mount("/", FileServer::from(relative!("static")))
}
