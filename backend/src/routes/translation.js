const express = require('express');
const router = express.Router();

// POST /api/translation/translate
router.post('/translate', async (req, res) => {
    try {
        const { text, sourceLang, targetLang } = req.body;
        // TODO: Integrate Google Translate API or LibreTranslate
        res.status(200).json({
            originalText: text,
            translatedText: `[Translated: ${text}]`,
            sourceLang,
            targetLang
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/translation/languages
router.get('/languages', (req, res) => {
    res.status(200).json({
        languages: [
            { code: 'en', name: 'English' },
            { code: 'ta', name: 'Tamil' },
            { code: 'hi', name: 'Hindi' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
        ]
    });
});

module.exports = router;
