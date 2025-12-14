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
        const user = Permissions.getCurrentUser();
        if (!user || !user.role) return false;
        return roles.includes(user.role);
    },

    // Motor permissions
    canViewMotors: () => {
        return Permissions.hasRole('admin', 'user', 'technician');
    },

    canAddMotor: () => {
        return Permissions.hasRole('admin', 'user');
    },

    canEditMotor: () => {
        return Permissions.hasRole('admin', 'user');
    },

    canDeleteMotor: () => {
        return Permissions.hasRole('admin');
    },

    // Service permissions
    canViewServices: () => {
        return Permissions.hasRole('admin', 'user', 'technician');
    },

    canAddService: () => {
        return Permissions.hasRole('admin', 'technician');
    },

    canEditService: () => {
        return Permissions.hasRole('admin', 'technician');
    },

    canDeleteService: () => {
        return Permissions.hasRole('admin');
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

    isUser: () => {
        return Permissions.hasRole('user');
    },

    isTechnician: () => {
        return Permissions.hasRole('technician');
    }
};
