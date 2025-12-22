// Theme Management Utility
const Theme = {
    STORAGE_KEY: 'motortrace_theme',

    // Initialize theme on page load
    init: () => {
        const savedTheme = localStorage.getItem(Theme.STORAGE_KEY);
        const theme = savedTheme || Theme.getSystemPreference();
        Theme.apply(theme);
    },

    // Toggle between light and dark
    toggle: () => {
        const current = Theme.get();
        const next = current === 'dark' ? 'light' : 'dark';
        Theme.apply(next);
    },

    // Apply theme
    apply: (theme) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(Theme.STORAGE_KEY, theme);

        // Dispatch event for components to react
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    },

    // Get current theme
    get: () => {
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    },

    // Get system preference
    getSystemPreference: () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
};

// Export for use in other modules
window.Theme = Theme;
