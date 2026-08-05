const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');
const verifyToken = require('../middleware/verifyToken');

// POST /api/sos/trigger — Save SOS alert to local SQLite database
router.post('/trigger', verifyToken, async (req, res) => {
    try {
        const { uid, email } = req.user;
        const { latitude, longitude, message } = req.body;

        const alertId = crypto.randomUUID();
        const triggeredAt = new Date().toISOString();
        const alertMessage = message || 'SOS! I need help!';

        const insert = db.prepare(`
            INSERT INTO sos_alerts (id, user_id, user_email, latitude, longitude, message, status, triggered_at)
            VALUES (?, ?, ?, ?, ?, ?, 'active', ?)
        `);

        insert.run(alertId, uid, email, latitude || null, longitude || null, alertMessage, triggeredAt);
        console.log(`🚨 SOS triggered by ${uid} at (${latitude}, ${longitude})`);

        const alert = {
            id: alertId,
            userId: uid,
            userEmail: email,
            location: { latitude: latitude || null, longitude: longitude || null },
            message: alertMessage,
            status: 'active',
            triggeredAt
        };

        res.status(200).json({
            message: 'SOS alert sent successfully',
            alertId,
            alert,
        });
    } catch (error) {
        console.error('SOS trigger error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/sos/history — Fetch current user's SOS history from local SQLite database
router.get('/history', verifyToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const rows = db.prepare(`
            SELECT id, user_id as userId, user_email as userEmail, latitude, longitude, message, status, triggered_at as triggeredAt, cancelled_at as cancelledAt
            FROM sos_alerts
            WHERE user_id = ?
            ORDER BY triggered_at DESC
            LIMIT 20
        `).all(uid);

        const history = rows.map(r => ({
            id: r.id,
            userId: r.userId,
            userEmail: r.userEmail,
            location: { latitude: r.latitude, longitude: r.longitude },
            message: r.message,
            status: r.status,
            triggeredAt: r.triggeredAt,
            cancelledAt: r.cancelledAt
        }));

        res.status(200).json({ userId: uid, history });
    } catch (error) {
        console.error('SOS history error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/sos/cancel — Cancel an active SOS alert in local SQLite database
router.post('/cancel', verifyToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { alertId } = req.body;

        if (!alertId) return res.status(400).json({ error: 'alertId is required' });

        const alert = db.prepare('SELECT user_id FROM sos_alerts WHERE id = ?').get(alertId);

        if (!alert) return res.status(404).json({ error: 'Alert not found' });
        if (alert.user_id !== uid) return res.status(403).json({ error: 'Forbidden' });

        const cancelledAt = new Date().toISOString();
        db.prepare('UPDATE sos_alerts SET status = ?, cancelled_at = ? WHERE id = ?').run('cancelled', cancelledAt, alertId);

        res.status(200).json({ message: `SOS alert ${alertId} cancelled` });
    } catch (error) {
        console.error('SOS cancel error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
