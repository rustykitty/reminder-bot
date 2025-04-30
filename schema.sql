-- wrangler d1 execute DB --file schema.sql
DROP TABLE IF EXISTS reminders;
CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id VARCHAR(20) NOT NULL,
    message VARCHAR(255) NOT NULL,
    timestamp INTEGER NOT NULL
);
DROP TABLE IF EXISTS user_data;
CREATE TABLE user_data (
    id VARCHAR(20) PRIMARY KEY,
    self_intro VARCHAR(1024)
);