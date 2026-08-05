const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');
const verifyToken = require('../middleware/verifyToken');

// Helper to hash passwords using SHA-256
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// 1. POST /api/auth/register (Email + Password Registration)
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Full name, email, and password are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
        }

        const uid = crypto.randomUUID();
        const pwdHash = hashPassword(password);
        const now = new Date().toISOString();

        db.prepare(`
            INSERT INTO users (uid, full_name, email, password_hash, role, created_at, last_login_at)
            VALUES (?, ?, ?, ?, 'PATIENT', ?, ?)
        `).run(uid, fullName.trim(), normalizedEmail, pwdHash, now, now);

        const newUser = db.prepare('SELECT * FROM users WHERE uid = ?').get(uid);

        res.status(201).json({
            message: 'Account registered successfully!',
            token: newUser.uid,
            user: {
                uid: newUser.uid,
                fullName: newUser.full_name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: error.message || 'Registration failed.' });
    }
});

// 2. POST /api/auth/login (Email + Password Login)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const pwdHash = hashPassword(password);

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (user.password_hash !== pwdHash) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const now = new Date().toISOString();
        db.prepare('UPDATE users SET last_login_at = ? WHERE uid = ?').run(now, user.uid);

        res.status(200).json({
            message: 'Logged in successfully!',
            token: user.uid,
            user: {
                uid: user.uid,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: error.message || 'Login failed.' });
    }
});

// 3. POST /api/auth/google (Google Sign-In)
router.post('/google', async (req, res) => {
    try {
        const { email, googleId, fullName, profileImage } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required for Google Sign-In.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        let user = db.prepare('SELECT * FROM users WHERE email = ? OR google_id = ?').get(normalizedEmail, googleId || '');
        const now = new Date().toISOString();

        if (!user) {
            const uid = crypto.randomUUID();
            const nameToSave = fullName ? fullName.trim() : normalizedEmail.split('@')[0];
            db.prepare(`
                INSERT INTO users (uid, full_name, email, google_id, profile_image, role, created_at, last_login_at)
                VALUES (?, ?, ?, ?, ?, 'PATIENT', ?, ?)
            `).run(uid, nameToSave, normalizedEmail, googleId || uid, profileImage || '', now, now);
            user = db.prepare('SELECT * FROM users WHERE uid = ?').get(uid);
        } else {
            db.prepare(`
                UPDATE users SET last_login_at = ?, google_id = COALESCE(?, google_id), profile_image = COALESCE(?, profile_image) 
                WHERE uid = ?
            `).run(now, googleId, profileImage, user.uid);
        }

        res.status(200).json({
            message: 'Google Sign-In successful!',
            token: user.uid,
            user: {
                uid: user.uid,
                fullName: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        res.status(500).json({ error: error.message || 'Google Sign-In failed.' });
    }
});

// 4. GET /api/auth/me — Get user profile
router.get('/me', verifyToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const user = db.prepare(`
            SELECT uid, full_name as fullName, email, role, created_at as createdAt 
            FROM users WHERE uid = ?
        `).get(uid);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
