// Role-based access control middleware
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role;

        console.log('[RBAC Debug] User Role:', userRole);
        console.log('[RBAC Debug] Allowed Roles:', allowedRoles);
        console.log('[RBAC Debug] Role Check:', allowedRoles.includes(userRole));

        if (!userRole) {
            return res.status(401).json({
                success: false,
                message: 'Kimlik doğrulaması gerekli'
            });
        }

        if (!allowedRoles.includes(userRole)) {
            console.log('[RBAC Debug] Access DENIED for role:', userRole);
            return res.status(403).json({
                success: false,
                message: 'Bu işlem için yetkiniz yok'
            });
        }

        console.log('[RBAC Debug] Access GRANTED for role:', userRole);
        next();
    };
};

module.exports = { requireRole };
