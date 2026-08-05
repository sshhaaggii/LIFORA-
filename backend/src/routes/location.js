const express = require('express');
const router = express.Router();
const db = require('../config/database');
const verifyToken = require('../middleware/verifyToken');

// POST /api/location/update — Save/update user's real-time location in local SQLite database
router.post('/update', verifyToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { latitude, longitude } = req.body;

        if (latitude == null || longitude == null) {
            return res.status(400).json({ error: 'latitude and longitude are required' });
        }

        const lastUpdated = new Date().toISOString();

        const upsert = db.prepare(`
            INSERT INTO user_locations (user_id, latitude, longitude, last_updated)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                latitude = excluded.latitude,
                longitude = excluded.longitude,
                last_updated = excluded.last_updated
        `);

        upsert.run(uid, latitude, longitude, lastUpdated);

        const locationData = {
            userId: uid,
            latitude,
            longitude,
            lastUpdated,
        };

        res.status(200).json({ message: 'Location updated', ...locationData });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/location/live/:userId — Fetch last known location of a user from local SQLite database
router.get('/live/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;
        const location = db.prepare(`
            SELECT user_id as userId, latitude, longitude, last_updated as lastUpdated
            FROM user_locations
            WHERE user_id = ?
        `).get(userId);

        if (!location) {
            return res.status(404).json({ error: 'No location found for this user' });
        }

        res.status(200).json(location);
    } catch (error) {
        console.error('Location fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/location/me — Fetch current user's last known location from local SQLite database
router.get('/me', verifyToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const location = db.prepare(`
            SELECT user_id as userId, latitude, longitude, last_updated as lastUpdated
            FROM user_locations
            WHERE user_id = ?
        `).get(uid);

        if (!location) {
            return res.status(404).json({ error: 'No location data found' });
        }

        res.status(200).json(location);
    } catch (error) {
        console.error('Get my location error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
