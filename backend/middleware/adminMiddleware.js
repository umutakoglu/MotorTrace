const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Kimlik doğrulama gerekli'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için admin yetkisi gerekli'
        });
    }

    next();
};

// Flexible role checking middleware
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Kimlik doğrulama gerekli'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Bu işlem için ${allowedRoles.join(' veya ')} yetkisi gerekli`
            });
        }

        next();
    };
};

module.exports = { requireAdmin, requireRole };
