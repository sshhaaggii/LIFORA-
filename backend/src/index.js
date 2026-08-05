require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize local SQLite database first
require('./config/database');

const authRoutes = require('./routes/auth');
const sosRoutes = require('./routes/sos');
const locationRoutes = require('./routes/location');
const translationRoutes = require('./routes/translation');
const translateRoutes = require('./routes/translate');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Web Frontend Static Files from src/public
app.use(express.static(path.join(__dirname, 'public')));

// Root Route: Serve Web Frontend UI
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Health check API
app.get('/api/health', (req, res) => {
    res.json({
        status: 'LIFORA Backend & Web Frontend running 🚀',
        version: '1.0.0',
        database: 'Local SQLite (better-sqlite3) 💾',
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/translation', translationRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/ai', aiRoutes);

// Fallback to Web Frontend index.html for SPA navigation
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`✅ LIFORA Web Application & Backend running at: http://localhost:${PORT}`);
});

module.exports = app;
