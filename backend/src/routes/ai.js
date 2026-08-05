const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../config/database');
const verifyToken = require('../middleware/verifyToken');

// POST /api/ai/chat — Save message + AI response to local SQLite database
router.post('/chat', verifyToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const { message, context } = req.body;

        if (!message) return res.status(400).json({ error: 'message is required' });

        const chatId = crypto.randomUUID();
        const aiResponse = `LIFORA AI received: "${message}". AI integration powered locally.`;
        const timestamp = new Date().toISOString();

        const insert = db.prepare(`
            INSERT INTO ai_chat_history (id, user_id, user_message, ai_response, context, timestamp)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        insert.run(chatId, uid, message, aiResponse, context || null, timestamp);

        const chatEntry = {
            id: chatId,
            userId: uid,
            userMessage: message,
            aiResponse,
            context: context || null,
            timestamp,
        };

        res.status(200).json(chatEntry);
    } catch (error) {
        console.error('AI chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/ai/history — Fetch current user's AI chat history from local SQLite database
router.get('/history', verifyToken, async (req, res) => {
    try {
        const { uid } = req.user;
        const history = db.prepare(`
            SELECT id, user_id as userId, user_message as userMessage, ai_response as aiResponse, context, timestamp
            FROM ai_chat_history
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT 50
        `).all(uid);

        res.status(200).json({ userId: uid, history });
    } catch (error) {
        console.error('AI history error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
