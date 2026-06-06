const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'quotes.db');
const fs = require('fs');
const dir = path.dirname(dbPath);

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('SQLite open error:', err);
    process.exit(1);
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

function saveQuote(text, author) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare('INSERT INTO quotes (text, author) VALUES (?, ?)');
    stmt.run(text, author, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
    stmt.finalize();
  });
}

function getHistory() {
  return new Promise((resolve, reject) => {
    db.all('SELECT id, text, author, created_at FROM quotes ORDER BY id DESC', (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function clearHistory() {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM quotes', function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

module.exports = {
  saveQuote,
  getHistory,
  clearHistory
};
