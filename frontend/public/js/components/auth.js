// Authentication component

const AuthComponent = {
    // Render login page
    renderLogin: () => {
        return `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="w-full max-w-md">
                    <!-- Logo/Title -->
                    <div class="text-center mb-8 animate-fade-in">
                        <i class="fas fa-motorcycle text-6xl text-purple-400 mb-4"></i>
                        <h1 class="text-4xl font-bold gradient-text mb-2">MotorTrace</h1>
                        <p class="text-gray-600">QR Tabanlı Motor Takip Sistemi</p>
                    </div>

                    <!-- Login Form -->
                    <div class="glass-dark rounded-2xl p-8 shadow-2xl animate-slide-up">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">Giriş Yap</h2>
                        
                        <form id="login-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Email veya Kullanıcı Adı
                                </label>
                                <input 
                                    type="text" 
                                    name="email" 
                                    class="input-field"
                                    placeholder="admin veya admin@motortrace.com"
                                    required
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Şifre
                                </label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    class="input-field"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div id="login-error" class="hidden">
                                <div class="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
                                    <p class="text-sm font-medium"></p>
                                </div>
                            </div>

                            <button type="submit" class="btn-primary w-full">
                                <i class="fas fa-sign-in-alt mr-2"></i>
                                Giriş Yap
                            </button>
                        </form>

                        <div class="mt-6 text-center">
                            <p class="text-gray-600">
                                Hesabınız yok mu? 
                                <button onclick="App.navigate('register')" class="text-purple-600 hover:text-purple-700 font-semibold">
                                    Kayıt Ol
                                </button>
                            </p>
                        </div>

                        <!-- Demo Credentials -->
                        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p class="text-sm text-gray-800 text-center font-medium">
                                <i class="fas fa-info-circle mr-1 text-blue-600"></i>
                                Demo: <strong class="text-blue-700">admin / admin</strong> veya admin@motortrace.com / admin123
                            </p>
                        </div>
                        
                        <!-- Version -->
                        <div class="mt-4 text-center">
                            <p class="text-xs text-gray-500">
                                v${APP_VERSION} • ${APP_BUILD_DATE}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Render register page
    renderRegister: () => {
        return `
            <div class="min-h-screen flex items-center justify-center p-4">
                <div class="w-full max-w-md">
                    <div class="text-center mb-8">
                        <i class="fas fa-motorcycle text-6xl text-purple-400 mb-4"></i>
                        <h1 class="text-4xl font-bold gradient-text mb-2">MotorTrace</h1>
                        <p class="text-gray-600">Yeni Hesap Oluştur</p>
                    </div>

                    <div class="glass-dark rounded-2xl p-8 shadow-2xl">
                        <h2 class="text-2xl font-bold text-white mb-6">Kayıt Ol</h2>
                        
                        <form id="register-form" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Kullanıcı Adı
                                </label>
                                <input 
                                    type="text" 
                                    name="username" 
                                    class="input-field"
                                    placeholder="Kullanıcı adınız"
                                    required
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Email
                                </label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    class="input-field"
                                    placeholder="ornek@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Şifre
                                </label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    class="input-field"
                                    placeholder="En az 6 karakter"
                                    required
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Şifre Tekrar
                                </label>
                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    class="input-field"
                                    placeholder="Şifrenizi tekrar girin"
                                    required
                                />
                            </div>

                            <div id="register-error" class="hidden">
                                <div class="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-lg">
                                    <p class="text-sm"></p>
                                </div>
                            </div>

                            <button type="submit" class="btn-primary w-full">
                                <i class="fas fa-user-plus mr-2"></i>
                                Kayıt Ol
                            </button>
                        </form>

                        <div class="mt-6 text-center">
                            <p class="text-gray-500">
                                Zaten hesabınız var mı? 
                                <button onclick="App.navigate('login')" class="text-purple-400 hover:text-purple-300 font-medium">
                                    Giriş Yap
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Handle login form submission
    handleLogin: async (formData) => {
        try {
            const response = await API.auth.login(formData);
            
            // Save token and user
            Storage.setToken(response.data.token);
            Storage.setUser(response.data.user);
            
            showToast('Giriş başarılı!', 'success');
            App.navigate('dashboard');
        } catch (error) {
            document.getElementById('login-error').classList.remove('hidden');
            document.querySelector('#login-error p').textContent = error.message;
        }
    },

    // Handle register form submission
    handleRegister: async (formData) => {
        try {
            const response = await API.auth.register(formData);
            
            // Save token and user
            Storage.setToken(response.data.token);
            Storage.setUser(response.data.user);
            
            showToast('Kayıt başarılı!', 'success');
            App.navigate('dashboard');
        } catch (error) {
            document.getElementById('register-error').classList.remove('hidden');
            document.querySelector('#register-error p').textContent = error.message;
        }
    }
};
