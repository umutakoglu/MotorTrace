// Dashboard component

const DashboardComponent = {
    stats: null,
    recentMotors: [],

    render: async () => {
        const user = Storage.getUser();
        const isAdmin = user && user.role === 'admin';

        // Fetch stats and recent motors
        try {
            const motorsResponse = await API.motors.getAll({ page: 1, limit: 5 });
            DashboardComponent.recentMotors = motorsResponse.data.motors;
            DashboardComponent.stats = {
                total: motorsResponse.data.pagination.total,
                recent: motorsResponse.data.motors.length
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 class="text-4xl font-bold text-black mb-2">Dashboard</h1>
                            <p class="text-gray-600">Hoş geldiniz, ${user.username}!</p>
                        </div>
                        <div class="flex gap-3">
                            ${isAdmin ? `
                                <button onclick="App.navigate('motor-new')" class="btn-primary">
                                    <i class="fas fa-plus mr-2"></i>
                                    Yeni Motor
                                </button>
                            ` : ''}
                            <button onclick="DashboardComponent.startQRScan()" class="btn-secondary">
                                <i class="fas fa-qrcode mr-2"></i>
                                QR Oku
                            </button>
                            <button onclick="DashboardComponent.logout()" class="btn-secondary">
                                <i class="fas fa-sign-out-alt mr-2"></i>
                                Çıkış
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <!-- Total Motors -->
                    <div class="glass-dark rounded-xl p-6 card-hover">
                        <div class="flex items-center justify-between mb-4">
                            <div class="bg-purple-500/20 rounded-lg p-3">
                                <i class="fas fa-motorcycle text-2xl text-purple-400"></i>
                            </div>
                            <span class="text-3xl font-bold text-gray-900">${DashboardComponent.stats?.total || 0}</span>
                        </div>
                        <h3 class="text-gray-600 font-medium">Toplam Motor</h3>
                    </div>

                    <!-- Quick Access --></strong>
                    <div class="glass-dark rounded-xl p-6 card-hover cursor-pointer" onclick="App.navigate('motors')">
                        <div class="flex items-center justify-between mb-4">
                            <div class="bg-blue-500/20 rounded-lg p-3">
                                <i class="fas fa-list text-2xl text-blue-400"></i>
                            </div>
                            <i class="fas fa-arrow-right text-2xl text-blue-400"></i>
                        </div>
                        <h3 class="text-gray-600 font-medium">Motor Listesi</h3>
                    </div>

                    <!-- QR Scanner -->
                    <div class="glass-dark rounded-xl p-6 card-hover cursor-pointer" onclick="DashboardComponent.startQRScan()">
                        <div class="flex items-center justify-between mb-4">
                            <div class="bg-emerald-500/20 rounded-lg p-3">
                                <i class="fas fa-qrcode text-2xl text-emerald-400"></i>
                            </div>
                            <i class="fas fa-camera text-2xl text-emerald-400"></i>
                        </div>
                        <h3 class="text-gray-600 font-medium">QR Kod Okut</h3>
                    </div>
                </div>

                <!-- Additional Features -->
                <div class="grid grid-cols-1 md:grid-cols-${isAdmin ? '4' : '2'} gap-6 mb-8">
                    <!-- Service History -->
                    <div class="glass-dark rounded-xl p-6 card-hover cursor-pointer" onclick="App.navigate('service-history')">
                        <div class="flex items-center justify-between mb-4">
                            <div class="bg-orange-500/20 rounded-lg p-3">
                                <i class="fas fa-history text-2xl text-orange-400"></i>
                            </div>
                            <i class="fas fa-arrow-right text-2xl text-orange-400"></i>
                        </div>
                        <h3 class="text-gray-600 font-medium">Servis Geçmişi</h3>
                        <p class="text-sm text-gray-500 mt-2">Tüm servisleri görüntüle</p>
                    </div>

                    <!-- Admin-Only Cards -->
                    <div class="grid grid-cols-1 md:grid-cols-${Permissions.isAdmin() ? '4' : '3'} gap-6">
                        <!-- Bulk Import -->
                        ${Permissions.canAccessBulkImport() ? `
                            <div class="glass-dark rounded-xl p-6 card-hover cursor-pointer" onclick="App.navigate('bulk-import')">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="bg-indigo-500/20 rounded-lg p-3">
                                        <i class="fas fa-file-import text-2xl text-indigo-400"></i>
                                    </div>
                                    <i class="fas fa-arrow-right text-2xl text-indigo-400"></i>
                                </div>
                                <h3 class="text-gray-600 font-medium">Toplu İçe Aktarma</h3>
                                <p class="text-sm text-gray-500 mt-2">CSV ile çoklu motor ekle</p>
                            </div>
                        ` : ''}

                        <!-- User Management -->
                        ${Permissions.canAccessUserManagement() ? `
                            <div class="glass-dark rounded-xl p-6 card-hover cursor-pointer" onclick="App.navigate('user-management')">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="bg-pink-500/20 rounded-lg p-3">
                                        <i class="fas fa-users text-2xl text-pink-400"></i>
                                    </div>
                                    <i class="fas fa-arrow-right text-2xl text-pink-400"></i>
                                </div>
                                <h3 class="text-gray-600 font-medium">Kullanıcı Yönetimi</h3>
                                <p class="text-sm text-gray-500 mt-2">Kullanıcı rolleri ve yetkiler</p>
                            </div>
                        ` : ''}

                        <!-- Service Type Management -->
                        ${Permissions.canAccessServiceTypes() ? `
                            <div class="glass-dark rounded-xl p-6 card-hover cursor-pointer" onclick="App.navigate('service-type-management')">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="bg-teal-500/20 rounded-lg p-3">
                                        <i class="fas fa-tags text-2xl text-teal-400"></i>
                                    </div>
                                    <i class="fas fa-arrow-right text-2xl text-teal-400"></i>
                                </div>
                                <h3 class="text-gray-600 font-medium">Servis Tipleri</h3>
                                <p class="text-sm text-gray-500 mt-2">Servis tipi yönetimi</p>
                            </div>
                        ` : ''}

                        <!-- Activity Logs -->
                        ${Permissions.canAccessActivityLogs() ? `
                            <div class="glass-dark rounded-xl p-6 card-hover cursor-pointer" onclick="App.navigate('activity-logs')">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="bg-orange-500/20 rounded-lg p-3">
                                        <i class="fas fa-history text-2xl text-orange-400"></i>
                                    </div>
                                    <i class="fas fa-arrow-right text-2xl text-orange-400"></i>
                                </div>
                                <h3 class="text-gray-600 font-medium">Aktivite Logları</h3>
                                <p class="text-sm text-gray-500 mt-2">Sistem aktivite geçmişi</p>
                            </div>
                        ` : ''}
                    </div>

                <!-- Recent Motors -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Son Eklenen Motorlar</h2>
                        <button onclick="App.navigate('motors')" class="text-purple-400 hover:text-purple-300 font-medium">
                            Tümünü Gör <i class="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>

                    ${DashboardComponent.recentMotors.length > 0 ? `
                        <div class="space-y-3">
                            ${DashboardComponent.recentMotors.map(motor => `
                                <div class="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition cursor-pointer" 
                                     onclick="App.navigate('motor-detail', '${motor.id}')">
                                    <div class="flex items-center justify-between">
                                        <div class="flex-1">
                                            <h3 class="text-white font-semibold mb-1">${motor.model} - ${motor.year}</h3>
                                            <p class="text-gray-500 text-sm">
                                                <i class="fas fa-hashtag mr-1"></i>
                                                Şase: ${motor.chassis_number}
                                            </p>
                                        </div>
                                        <div class="flex items-center gap-3">
                                            <span class="badge badge-${DashboardComponent.getStatusClass(motor.status)}">
                                                ${DashboardComponent.getStatusText(motor.status)}
                                            </span>
                                            <i class="fas fa-chevron-right text-gray-500"></i>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="text-center py-12">
                            <i class="fas fa-motorcycle text-6xl text-slate-600 mb-4"></i>
                            <p class="text-gray-500">Henüz motor eklenmemiş</p>
                            ${isAdmin ? `
                                <button onclick="App.navigate('motor-new')" class="btn-primary mt-4">
                                    <i class="fas fa-plus mr-2"></i>
                                    İlk Motoru Ekle
                                </button>
                            ` : ''}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    getStatusClass: (status) => {
        const statusMap = {
            'in_stock': 'success',
            'sold': 'info',
            'in_service': 'warning',
            'scrapped': 'danger'
        };
        return statusMap[status] || 'info';
    },

    getStatusText: (status) => {
        const textMap = {
            'in_stock': 'Stokta',
            'sold': 'Satıldı',
            'in_service': 'Serviste',
            'scrapped': 'Hurdaya Çıktı'
        };
        return textMap[status] || status;
    },

    startQRScan: () => {
        QRUtils.startScanning(
            async (motorId) => {
                showToast('QR Kod okundu!', 'success');
                App.navigate('motor-detail', motorId);
            },
            (error) => {
                showToast('QR Kod okuma hatası', 'error');
            }
        );
    },

    logout: () => {
        Storage.logout();
        showToast('Çıkış yapıldı', 'success');
        App.navigate('login');
    }
};
