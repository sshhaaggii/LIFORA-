const db = require('../config/database');

/**
 * Middleware: Verify Phone User Token / UID
 * Attaches user profile object to req.user
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split('Bearer ')[1].trim();

    try {
        const user = db.prepare(`
            SELECT uid, full_name, country_code, phone_number, phone_number_normalized, role 
            FROM users WHERE uid = ? OR phone_number_normalized = ?
        `).get(token, token);

        if (!user) {
            req.user = {
                uid: token,
                name: 'User',
                phone: token,
                role: 'PATIENT'
            };
        } else {
            req.user = {
                uid: user.uid,
                name: user.full_name,
                countryCode: user.country_code,
                phoneNumber: user.phone_number,
                phoneNumberNormalized: user.phone_number_normalized,
                role: user.role
            };
        }

        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

module.exports = verifyToken;
