pub struct StupidDB(&'static str);

impl StupidDB {
    pub const fn new(path: &'static str) -> Self {
        Self(path)
    }

    /// Get a value from the database.
    /// 
    /// If the key is not found, `None` is returned.
    pub async fn get(&self, key: &str) -> Option<String> {
        let content = rocket::tokio::fs::read_to_string(&self.0).await.ok()?;
        for line in content.lines() {
            let split: Vec<&str> = line.split('|').collect();
            if split[0] == key {
                return Some(split[1].to_string());
            }
        }
        None
    }
    /// Set a key-value pair in the database.
    /// 
    /// If the value already exists, it is overwritten.
    /// If the value does not exist, it will be created.
    pub async fn set(&self, key: &str, value: &str) -> Option<()> {
        let content = rocket::tokio::fs::read_to_string(&self.0).await.ok()?;
        let mut new_content = String::new();
        let mut found = false;
        for line in content.lines() {
            let split: Vec<&str> = line.split('|').collect();
            if split[0] == key {
                found = true;
                new_content.push_str(&format!("{}|{}\n", key, value));
            } else {
                new_content.push_str(&format!("{}\n", line));
            }
        }
        if !found {
            new_content.push_str(&format!("{}|{}\n", key, value));
        }
        rocket::tokio::fs::write(&self.0, new_content).await.ok()
    }

    /// Adds a value to a list in the database.
    /// 
    /// CAN CREATE DUPLICATES!
    pub async fn push(&self, key: &str, value: &str) -> Option<()> {
        let mut content = rocket::tokio::fs::read_to_string(&self.0).await.ok()?;
        content.push_str(key);
        content.push('|');
        content.push_str(value);
        content.push('\n');
        rocket::tokio::fs::write(&self.0, content).await.ok()
    }

    /// Returns all key-value pairs in the database.
    pub async fn all_kvs(&self) -> Option<Vec<(String, String)>> {
        let content = rocket::tokio::fs::read_to_string(&self.0).await.ok()?;
        let mut kvs = Vec::new();
        for line in content.lines() {
            let split: Vec<&str> = line.split('|').collect();
            kvs.push((split[0].to_string(), split[1].to_string()));
        }
        Some(kvs)
    }
}