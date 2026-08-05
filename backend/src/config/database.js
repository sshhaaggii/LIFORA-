const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../lifora.db');
const db = new Database(dbPath);

// Enable WAL mode for concurrency
db.pragma('journal_mode = WAL');

const initDatabase = () => {
    // Users table with Email and Google Sign-In support
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            uid TEXT UNIQUE,
            full_name TEXT,
            email TEXT UNIQUE,
            password_hash TEXT,
            google_id TEXT UNIQUE,
            country_code TEXT DEFAULT '+91',
            phone_number TEXT,
            role TEXT DEFAULT 'PATIENT',
            profile_image TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT,
            updated_at TEXT,
            last_login_at TEXT
        )
    `).run();

    // Auto-migrate missing columns for existing SQLite database files
    const columns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);

    if (!columns.includes('email')) {
        try { db.prepare("ALTER TABLE users ADD COLUMN email TEXT").run(); } catch(e){}
    }
    if (!columns.includes('google_id')) {
        try { db.prepare("ALTER TABLE users ADD COLUMN google_id TEXT").run(); } catch(e){}
    }
    if (!columns.includes('full_name')) {
        try { db.prepare("ALTER TABLE users ADD COLUMN full_name TEXT").run(); } catch(e){}
    }
    if (!columns.includes('password_hash')) {
        try { db.prepare("ALTER TABLE users ADD COLUMN password_hash TEXT").run(); } catch(e){}
    }
    if (!columns.includes('profile_image')) {
        try { db.prepare("ALTER TABLE users ADD COLUMN profile_image TEXT").run(); } catch(e){}
    }
    if (!columns.includes('role')) {
        try { db.prepare("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'PATIENT'").run(); } catch(e){}
    }
    if (!columns.includes('last_login_at')) {
        try { db.prepare("ALTER TABLE users ADD COLUMN last_login_at TEXT").run(); } catch(e){}
    }

    // Index for fast email lookup
    db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_users_email 
        ON users(email)
    `).run();

    // SOS Alerts table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS sos_alerts (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            user_phone TEXT,
            latitude REAL,
            longitude REAL,
            message TEXT,
            status TEXT DEFAULT 'active',
            triggered_at TEXT,
            cancelled_at TEXT
        )
    `).run();

    // User Locations table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS user_locations (
            user_id TEXT PRIMARY KEY,
            latitude REAL,
            longitude REAL,
            last_updated TEXT
        )
    `).run();

    // AI Chat History table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS ai_chat_history (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            user_message TEXT,
            ai_response TEXT,
            context TEXT,
            timestamp TEXT
        )
    `).run();

    console.log('💾 Local SQLite Database initialized successfully with Email & Google Auth schema at:', dbPath);
};

initDatabase();

module.exports = db;
