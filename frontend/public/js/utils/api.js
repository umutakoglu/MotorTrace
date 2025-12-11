// API Client - Dynamic URL based on where frontend is accessed from
const API_BASE_URL = `http://${window.location.hostname}:5001/api`;

const API = {
    // Helper to make requests
    request: async (endpoint, options = {}) => {
        const token = Storage.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

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
        getAll: (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return API.request(`/motors${queryString ? '?' + queryString : ''}`);
        },
        
        getById: (id) => API.request(`/motors/${id}`),
        
        create: (motorData) => API.request('/motors', {
            method: 'POST',
            body: JSON.stringify(motorData)
        }),
        
        update: (id, motorData) => API.request(`/motors/${id}`, {
            method: 'PUT',
            body: JSON.stringify(motorData)
        }),
        
        delete: (id) => API.request(`/motors/${id}`, {
            method: 'DELETE'
        }),
        
        scan: (motorId) => API.request(`/motors/scan/${motorId}`),
        
        downloadQR: (id) => `${API_BASE_URL}/motors/${id}/qr/download`,
        
        generateQR: (id) => API.request(`/motors/${id}/generate-qr`, {
            method: 'POST'
        }),
        
        generateAllQRs: () => API.request(`/motors/generate-all-qr`, {
            method: 'POST'
        })
    },

    // Service endpoints
    services: {
        getMotorServices: (motorId) => API.request(`/services/motor/${motorId}`),
        
        create: (motorId, serviceData) => API.request(`/services/motor/${motorId}`, {
            method: 'POST',
            body: JSON.stringify(serviceData)
        }),
        
        update: (id, serviceData) => API.request(`/services/${id}`, {
            method: 'PUT',
            body: JSON.stringify(serviceData)
        }),
        
        delete: (id) => API.request(`/services/${id}`, {
            method: 'DELETE'
        })
    }
};
