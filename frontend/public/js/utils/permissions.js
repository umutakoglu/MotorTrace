// Permission utility functions for role-based access control
const Permissions = {
    // Get current user from storage
    getCurrentUser: () => {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload;
        } catch (e) {
            return null;
        }
    },

    // Check if user has specific role
    hasRole: (...roles) => {
        const user = Storage.getUser();
        if (!user || !user.role) return false;
        return roles.includes(user.role);
    },

    // Motor permissions
    canViewMotors: () => {
        return Permissions.hasRole('admin', 'yonetici', 'operator', 'technician');
    },

    canAddMotor: () => {
        return Permissions.hasRole('admin', 'yonetici', 'operator');
    },

    canEditMotor: () => {
        return Permissions.hasRole('admin', 'yonetici');
    },

    canDeleteMotor: () => {
        return Permissions.hasRole('admin', 'yonetici');
    },

    // Service permissions
    canViewServices: () => {
        return Permissions.hasRole('admin', 'yonetici', 'operator', 'technician');
    },

    canAddService: () => {
        return Permissions.hasRole('admin', 'yonetici', 'technician');
    },

    canEditService: () => {
        return Permissions.hasRole('admin', 'yonetici', 'technician');
    },

    canDeleteService: () => {
        return Permissions.hasRole('admin', 'yonetici');
    },

    // Admin panel permissions
    canAccessUserManagement: () => {
        return Permissions.hasRole('admin');
    },

    canAccessServiceTypes: () => {
        return Permissions.hasRole('admin');
    },

    canAccessActivityLogs: () => {
        return Permissions.hasRole('admin');
    },

    canAccessBulkImport: () => {
        return Permissions.hasRole('admin');
    },

    // General admin check
    isAdmin: () => {
        return Permissions.hasRole('admin');
    },

    isYonetici: () => {
        return Permissions.hasRole('yonetici');
    },

    isOperator: () => {
        return Permissions.hasRole('operator');
    },

    isTechnician: () => {
        return Permissions.hasRole('technician');
    }
};
