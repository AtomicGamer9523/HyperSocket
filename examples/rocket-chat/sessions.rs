use rocket::outcome::IntoOutcome;
use rocket::request::{self, FromRequest, Request};
use rocket::http::{CookieJar, Status};
use rocket::serde::json::Json;
use rocket::serde::{Serialize, Deserialize};

type Res<T = String> = (rocket::http::Status, (rocket::http::ContentType, T));

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Login<'r> {
    username: &'r str,
    password: &'r str
}

#[derive(Debug)]
pub struct User(String);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for User {
    type Error = std::convert::Infallible;

    async fn from_request(request: &'r Request<'_>) -> request::Outcome<User, Self::Error> {
        request.cookies()
            .get_private("name")
            .and_then(|cookie| cookie.value().parse().ok())
            .map(User)
            .or_forward(Status::Unauthorized)
    }
}

#[post("/login", format = "json", data = "<login>")]
pub async fn login(jar: &CookieJar<'_>, login: Json<Login<'_>>) -> Res {
    let login = login.into_inner();
    let username = login.username;
    let password = login.password;

    let pswd = crate::stupiddb::StupidDB.get(username).await;

    if pswd.unwrap_or("".to_string()) != password {
        return (
            Status::Unauthorized, (
            rocket::http::ContentType::Text,
            "Invalid password!".to_string()
        ));
    }

    jar.add_private(rocket::http::Cookie::new("name", username.to_string()));

    (Status::Ok, (rocket::http::ContentType::Text, "Login OK!".to_string()))
}

#[post("/logout")]
pub async fn logout(jar: &CookieJar<'_>) -> Res<&'static str> {
    jar.remove_private("name");
    (Status::Ok, (rocket::http::ContentType::Text, "Logout OK!"))
}

#[get("/loggincheck")]
pub async fn am_i_logged_in(user: Option<User>) -> Res<&'static str> {
    (Status::Ok, (rocket::http::ContentType::Text, match user {
        Some(_) => "true",
        None => "false"
    }))
}

pub fn routes() -> Vec<rocket::Route> {
    routes![login, logout, am_i_logged_in]
}
