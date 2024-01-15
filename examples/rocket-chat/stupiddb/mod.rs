pub struct StupidDB;

const DB_PATH: &str = concat!(
    env!("CARGO_MANIFEST_DIR"),
    "/stupiddb/stupid.db"
);

impl StupidDB {
    pub async fn get(&self, key: &str) -> Option<String> {
        let content = match rocket::tokio::fs::read_to_string(DB_PATH).await {
            Ok(content) => content,
            Err(_) => {
                println!("Error reading stupid.db");
                return None;
            }
        };
        for line in content.lines() {
            let split: Vec<&str> = line.split('|').collect();
            if split[0] == key {
                return Some(split[1].to_string());
            }
        }
        None
    }
}