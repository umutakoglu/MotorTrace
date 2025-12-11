// Main Application

const App = {
    currentRoute: 'login',
    currentParams: null,

    // Initialize the app
    init: () => {
        // Check authentication
        if (Storage.isAuthenticated()) {
            App.navigate('dashboard');
        } else {
            App.navigate('login');
        }

        // Initialize QR Scanner
        QRScannerComponent.init();
    },

    // Navigate to a route
    navigate: async (route, params = null) => {
        App.currentRoute = route;
        App.currentParams = params;

        // Check auth for protected routes
        const protectedRoutes = ['dashboard', 'motors', 'motor-detail', 'motor-new', 'motor-edit', 'bulk-import'];
        if (protectedRoutes.includes(route) && !Storage.isAuthenticated()) {
            App.navigate('login');
            return;
        }

        // Render the appropriate component
        let html = '';
        
        switch (route) {
            case 'login':
                html = AuthComponent.renderLogin();
                break;
            case 'register':
                html = AuthComponent.renderRegister();
                break;
            case 'dashboard':
                html = await DashboardComponent.render();
                break;
            case 'motors':
                html = await MotorListComponent.render();
                break;
            case 'motor-detail':
                html = await MotorDetailComponent.render(params);
                break;
            case 'motor-new':
                html = await MotorFormComponent.render();
                break;
            case 'motor-edit':
                html = await MotorFormComponent.render(params);
                break;
            case 'bulk-import':
                html = BulkImportComponent.render();
                break;
            default:
                html = '<div class="p-8 text-gray-900"><h1>404 - Page Not Found</h1></div>';
        }

        // Update the DOM
        document.getElementById('app').innerHTML = html;

        // Attach event listeners after rendering
        App.attachEventListeners();
    },

    // Attach event listeners to forms
    attachEventListeners: () => {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    email: loginForm.email.value,
                    password: loginForm.password.value
                };
                
                const errors = Validator.validateLoginForm(formData);
                if (errors.length > 0) {
                    document.getElementById('login-error').classList.remove('hidden');
                    document.querySelector('#login-error p').textContent = errors.join(', ');
                    return;
                }

                await AuthComponent.handleLogin(formData);
            });
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = {
                    username: registerForm.username.value,
                    email: registerForm.email.value,
                    password: registerForm.password.value,
                    confirmPassword: registerForm.confirmPassword.value
                };

                const errors = Validator.validateRegisterForm(formData);
                if (errors.length > 0) {
                    document.getElementById('register-error').classList.remove('hidden');
                    document.querySelector('#register-error p').textContent = errors.join(', ');
                    return;
                }

                // Remove confirmPassword before sending to API
                delete formData.confirmPassword;

                await AuthComponent.handleRegister(formData);
            });
        }

        // Motor form event listeners
        if (typeof MotorFormComponent !== 'undefined' && MotorFormComponent.setupEventListeners) {
            MotorFormComponent.setupEventListeners();
        }
    }
};

// Helper functions for loading and toast

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const messageEl = document.getElementById('toast-message');

    const icons = {
        success: 'fas fa-check-circle text-green-500',
        error: 'fas fa-times-circle text-red-500',
        warning: 'fas fa-exclamation-circle text-yellow-500',
        info: 'fas fa-info-circle text-blue-500'
    };

    icon.className = icons[type] || icons.info;
    messageEl.textContent = message;

    toast.classList.remove('hidden');

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
