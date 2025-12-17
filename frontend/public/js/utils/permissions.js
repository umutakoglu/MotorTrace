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
        return Permissions.hasRole('admin', 'amir', 'operator', 'technician');
    },

    canAddMotor: () => {
        return Permissions.hasRole('admin', 'amir', 'operator');
    },

    canEditMotor: () => {
        return Permissions.hasRole('admin', 'amir', 'operator');
    },

    canDeleteMotor: () => {
        return Permissions.hasRole('admin', 'amir');
    },

    // Service permissions
    canViewServices: () => {
        return Permissions.hasRole('admin', 'amir', 'operator', 'technician');
    },

    canAddService: () => {
        return Permissions.hasRole('admin', 'amir', 'technician');
    },

    canEditService: () => {
        return Permissions.hasRole('admin', 'amir', 'technician');
    },

    canDeleteService: () => {
        return Permissions.hasRole('admin', 'amir', 'technician');
    },

    // Admin panel permissions
    canAccessUserManagement: () => {
        return Permissions.hasRole('admin');
    },

    canAccessServiceTypes: () => {
        return Permissions.hasRole('admin');
    },

    canAccessActivityLogs: () => {
        return Permissions.hasRole('admin', 'amir');
    },

    canAccessBulkImport: () => {
        return Permissions.hasRole('admin');
    },

    // General admin check
    isAdmin: () => {
        return Permissions.hasRole('admin');
    },

    isAmir: () => {
        return Permissions.hasRole('amir');
    },

    isOperator: () => {
        return Permissions.hasRole('operator');
    },

    isTechnician: () => {
        return Permissions.hasRole('technician');
    }
};
