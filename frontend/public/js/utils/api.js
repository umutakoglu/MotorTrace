// API Client - Dynamic URL based on where frontend is accessed from
const API_BASE_URL = '/api';

const API = {
    // Helper to make requests
    request: async (endpoint, options = {}) => {
        const token = Storage.getToken();

        const headers = {
            ...options.headers
        };

        // Only set Content-Type if not FormData (browser sets it automatically for FormData)
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            showLoading();

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                mode: 'cors',
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        } finally {
            hideLoading();
        }
    },

    // Auth endpoints
    auth: {
        register: (userData) => API.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),

        login: (credentials) => API.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        }),

        getCurrentUser: () => API.request('/auth/me')
    },

    // Motor endpoints
    motors: {
        getAll: (params) => API.request('/motors', { params }),
        getById: (id) => API.request(`/motors/${id}`),
        create: (data) => API.request('/motors', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => API.request(`/motors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => API.request(`/motors/${id}`, { method: 'DELETE' }),
        getStats: (params) => API.request('/motors/stats', { params }),
        generateQR: (id) => API.request(`/motors/${id}/generate-qr`, { method: 'POST' }),
        getQRDownloadUrl: (id) => `${API_BASE_URL}/motors/${id}/qr/download`,
        downloadQR: (id) => fetch(`${API_BASE_URL}/motors/${id}/qr/download`, {
            method: 'GET',
            headers: (() => {
                const headers = {};
                const token = Storage.getToken();
                if (token) headers['Authorization'] = `Bearer ${token}`;
                return headers;
            })()
        }),
        generateAllQRs: () => API.request('/motors/generate-all-qr', { method: 'POST' })
    },

    services: {
        getMotorServices: (motorId) => API.request(`/services/motor/${motorId}`),
        getRecent: () => API.request('/services/recent'),
        create: (motorId, data) => API.request(`/services/motor/${motorId}`, { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => API.request(`/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => API.request(`/services/${id}`, { method: 'DELETE' }),
        uploadAttachment: (id, formData) => fetch(`${API_BASE_URL}/services/${id}/attachments`, {
            method: 'POST',
            headers: (() => {
                const headers = {};
                const token = Storage.getToken();
                if (token) headers['Authorization'] = `Bearer ${token}`;
                return headers;
            })(),
            body: formData
        }).then(res => res.json()),
        deleteAttachment: (attachmentId) => API.request(`/services/attachments/${attachmentId}`, { method: 'DELETE' }),
        getServiceReport: (id) => `${API_BASE_URL}/services/${id}/report`
    },

    // User management endpoints (admin only)
    users: {
        getAll: () => API.request('/users'),

        getById: (id) => API.request(`/users/${id}`),

        create: (userData) => API.request('/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        }),

        updateRole: (id, role) => API.request(`/users/${id}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        }),

        updatePassword: (id, newPassword) => API.request(`/users/${id}/password`, {
            method: 'PUT',
            body: JSON.stringify({ newPassword })
        }),

        delete: (id) => API.request(`/users/${id}`, {
            method: 'DELETE'
        }),

        getStats: () => API.request('/users/stats')
    },

    // Activity logs (admin only)
    activityLogs: {
        getAll: (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return API.request(`/activity-logs${queryString ? '?' + queryString : ''}`);
        },

        getStats: () => API.request('/activity-logs/stats')
    },

    // Service types
    serviceTypes: {
        getAll: (includeInactive = false) => {
            const params = includeInactive ? '?includeInactive=true' : '';
            return API.request(`/service-types${params}`);
        },

        getById: (id) => API.request(`/service-types/${id}`),

        create: (data) => API.request('/service-types', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        update: (id, data) => API.request(`/service-types/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

        delete: (id) => API.request(`/service-types/${id}`, {
            method: 'DELETE'
        }),

        getStats: () => API.request('/service-types/stats')
    },

    // Technicians
    technicians: {
        getAll: (includeInactive = false) => {
            const params = includeInactive ? '?includeInactive=true' : '';
            return API.request(`/technicians${params}`);
        },

        getById: (id) => API.request(`/technicians/${id}`),

        create: (data) => API.request('/technicians', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        update: (id, data) => API.request(`/technicians/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

        delete: (id) => API.request(`/technicians/${id}`, {
            method: 'DELETE'
        }),

        getStats: () => API.request('/technicians/stats')
    },

    // Roles (admin only)
    roles: {
        getAll: () => API.request('/roles'),

        getById: (id) => API.request(`/roles/${id}`),

        getPermissions: (id) => API.request(`/roles/${id}/permissions`),

        create: (data) => API.request('/roles', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        update: (id, data) => API.request(`/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

        delete: (id) => API.request(`/roles/${id}`, {
            method: 'DELETE'
        })
    }
};
