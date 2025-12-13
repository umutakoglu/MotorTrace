// LocalStorage helper functions

const Storage = {
    // Save data to localStorage
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },

    // Get data from localStorage
    get: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Remove item from localStorage
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all localStorage
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // Auth specific methods
    setToken: (token) => Storage.set('auth_token', token),
    getToken: () => Storage.get('auth_token'),
    removeToken: () => Storage.remove('auth_token'),
    
    setUser: (user) => Storage.set('user', user),
    getUser: () => Storage.get('user'),
    removeUser: () => Storage.remove('user'),
    
    isAuthenticated: () => !!Storage.getToken(),
    
    logout: () => {
        Storage.removeToken();
        Storage.removeUser();
    }
};
