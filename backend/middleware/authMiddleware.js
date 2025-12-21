const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        console.log('[Auth Debug] Decoded JWT:', JSON.stringify(decoded, null, 2));

        // Store user info in request - ensure userId is properly extracted
        req.user = {
            id: decoded.userId || decoded.id, // Support both field names for compatibility
            userId: decoded.userId || decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role || 'user'
        };

        console.log('[Auth Debug] Set req.user:', JSON.stringify(req.user, null, 2));
        next();
    });
};

module.exports = { authenticateToken };
