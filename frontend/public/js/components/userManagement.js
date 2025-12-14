// User Management Component (Admin Only)
const UserManagementComponent = {
    users: [],
    stats: null,

    render: async () => {
        const user = Storage.getUser();
        
        // Check if user is admin
        if (!user || user.role !== 'admin') {
            return `
                <div class="min-h-screen p-8 flex items-center justify-center">
                    <div class="text-center">
                        <i class="fas fa-lock text-6xl text-gray-300 mb-4"></i>
                        <h1 class="text-2xl font-bold text-gray-900 mb-2">Yetkisiz Erişim</h1>
                        <p class="text-gray-600 mb-4">Bu sayfaya erişim yetkiniz yok</p>
                        <button onclick="App.navigate('dashboard')" class="btn-primary">
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            `;
        }

        // Fetch users and stats
        try {
            const [usersResponse, statsResponse] = await Promise.all([
                API.users.getAll(),
                API.users.getStats()
            ]);

            UserManagementComponent.users = usersResponse.data || [];
            UserManagementComponent.stats = statsResponse.data || {};
        } catch (error) {
            showToast('Kullanıcılar yüklenemedi: ' + error.message, 'error');
            UserManagementComponent.users = [];
            UserManagementComponent.stats = {};
        }

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h1 class="text-4xl font-bold text-gray-900 mb-2">
                                <i class="fas fa-users mr-3"></i>
                                Kullanıcı Yönetimi
                            </h1>
                            <p class="text-gray-600">Kullanıcı rolleri ve yetkilendirme yönetimi</p>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="UserManagementComponent.openAddUserModal()" class="btn-primary">
                                <i class="fas fa-user-plus mr-2"></i>
                                Yeni Kullanıcı
                            </button>
                            <button onclick="App.navigate('dashboard')" class="btn-secondary">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards -->
                ${UserManagementComponent.renderStats()}

                <!-- Users Table -->
                <div class="glass-dark rounded-xl p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Kullanıcılar</h2>
                    
                    ${UserManagementComponent.renderUsers()}
                </div>
            </div>
        `;
    },

    renderStats: () => {
        const stats = UserManagementComponent.stats;
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <!-- Total Users -->
               <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Toplam Kullanıcı</p>
                            <p class="text-3xl font-bold text-gray-900">${stats.total_users || 0}</p>
                        </div>
                        <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-users text-2xl text-blue-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Admin Count -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Admin Kullanıcılar</p>
                            <p class="text-3xl font-bold text-gray-900">${stats.admin_count || 0}</p>
                        </div>
                        <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-user-shield text-2xl text-purple-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Regular Users -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Normal Kullanıcılar</p>
                            <p class="text-3xl font-bold text-gray-900">${stats.user_count || 0}</p>
                        </div>
                        <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-user text-2xl text-green-600"></i>
                        </div>
                    </div>
                </div>

                <!-- New This Week -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Bu Hafta Yeni</p>
                            <p class="text-3xl font-bold text-gray-900">${stats.new_this_week || 0}</p>
                        </div>
                        <div class="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-user-plus text-2xl text-yellow-600"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderUsers: () => {
        if (!UserManagementComponent.users || UserManagementComponent.users.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">Kullanıcı bulunamadı</p>
                </div>
            `;
        }

        const currentUser = Storage.getUser();

        return `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200">
                            <th class="text-left py-3 px-4 font-semibold text-gray-700">Kullanıcı</th>
                            <th class="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                            <th class="text-left py-3 px-4 font-semibold text-gray-700">Rol</th>
                            <th class="text-left py-3 px-4 font-semibold text-gray-700">Kayıt Tarihi</th>
                            <th class="text-right py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${UserManagementComponent.users.map(user => `
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="py-4 px-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                            ${user.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p class="font-medium text-gray-900">${user.username}</p>
                                            ${user.id === currentUser.id ? '<span class="text-xs text-blue-600">(Siz)</span>' : ''}
                                        </div>
                                    </div>
                                </td>
                                <td class="py-4 px-4 text-gray-600">${user.email}</td>
                                <td class="py-4 px-4">
                                    <span class="badge badge-${
                                        user.role === 'admin' ? 'primary' : 
                                        user.role === 'technician' ? 'warning' : 
                                        'success'
                                    }">
                                        <i class="fas fa-${
                                            user.role === 'admin' ? 'user-shield' : 
                                            user.role === 'technician' ? 'user-cog' : 
                                            'user'
                                        } mr-1"></i>
                                        ${
                                            user.role === 'admin' ? 'Admin' : 
                                            user.role === 'technician' ? 'Teknisyen' : 
                                            'Kullanıcı'
                                        }
                                    </span>
                                </td>
                                <td class="py-4 px-4 text-gray-600">
                                    ${new Date(user.created_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td class="py-4 px-4">
                                    <div class="flex items-center justify-end gap-2">
                                        ${user.id !== currentUser.id ? `
                                            <select 
                                                onchange="UserManagementComponent.changeUserRole('${user.id}', this.value)"
                                                class="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="" selected disabled>Rol Değiştir</option>
                                                <option value="user" ${user.role === 'user' ? 'disabled' : ''}>Kullanıcı Yap</option>
                                                <option value="technician" ${user.role === 'technician' ? 'disabled' : ''}>Teknisyen Yap</option>
                                                <option value="admin" ${user.role === 'admin' ? 'disabled' : ''}>Admin Yap</option>
                                            </select>
                                            <button 
                                                onclick="UserManagementComponent.deleteUser('${user.id}', '${user.username}')"
                                                class="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                                title="Kullanıcıyı Sil">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : `
                                            <span class="text-sm text-gray-500 italic">Kendi hesabınız</span>
                                        `}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    changeUserRole: async (userId, newRole) => {
        const roleNames = {
            'admin': 'Admin',
            'technician': 'Teknisyen',
            'user': 'Kullanıcı'
        };
        
        if (!confirm(`Bu kullanıcının rolünü ${roleNames[newRole] || newRole} olarak değiştirmek istediğinizden emin misiniz?`)) {
            return;
        }

        showLoading();
        try {
            await API.users.updateRole(userId, newRole);
            hideLoading();
            showToast('Kullanıcı rolü güncellendi', 'success');
            
            // Reload page
            setTimeout(() => {
                App.navigate('user-management');
            }, 500);
        } catch (error) {
            hideLoading();
            showToast('Hata: ' + error.message, 'error');
        }
    },

    deleteUser: async (userId, username) => {
        if (!confirm(`"${username}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`)) {
            return;
        }

        showLoading();
        try {
            await API.users.delete(userId);
            hideLoading();
            showToast('Kullanıcı silindi', 'success');
            
            // Reload page
            setTimeout(() => {
                App.navigate('user-management');
            }, 500);
        } catch (error) {
            hideLoading();
            showToast('Hata: ' + error.message, 'error');
        }
    },

    openAddUserModal: () => {
        const modalHTML = `
            <div id="add-user-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
                        <h2 class="text-2xl font-bold text-white">Yeni Kullanıcı</h2>
                    </div>
                    <form id="add-user-form" class="p-6">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Kullanıcı Adı <span class="text-red-500">*</span>
                            </label>
                            <input type="text" name="username" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="kullaniciadi" />
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Email <span class="text-red-500">*</span>
                            </label>
                            <input type="email" name="email" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="kullanici@example.com" />
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Şifre <span class="text-red-500">*</span>
                            </label>
                            <input type="password" name="password" required minlength="6"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="En az 6 karakter" />
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Rol <span class="text-red-500">*</span>
                            </label>
                            <select name="role" required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="">Seçiniz</option>
                                <option value="user">Kullanıcı</option>
                                <option value="technician">Teknisyen</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="flex items-center justify-end gap-3 pt-4 border-t">
                            <button type="button" onclick="UserManagementComponent.closeModal()" 
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">İptal</button>
                            <button type="submit" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Oluştur</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('add-user-form').addEventListener('submit', UserManagementComponent.handleUserCreate);
    },

    closeModal: () => {
        const modal = document.getElementById('add-user-modal');
        if (modal) modal.remove();
    },

    handleUserCreate: async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role')
        };

        showLoading();

        try {
            await API.users.create(userData);
            hideLoading();
            showToast('Kullanıcı oluşturuldu', 'success');
            UserManagementComponent.closeModal();
            setTimeout(() => App.navigate('user-management'), 500);
        } catch (error) {
            hideLoading();
            showToast('Hata: ' + error.message, 'error');
        }
    }
};
