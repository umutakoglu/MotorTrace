// Activity Logs Viewer Component
const ActivityLogsComponent = {
    logs: [],
    stats: null,
    filters: {
        user: '',
        action: '',
        resource: '',
        startDate: '',
        endDate: ''
    },

    render: async () => {
        // Fetch logs and stats
        await ActivityLogsComponent.fetchLogs();
        await ActivityLogsComponent.fetchStats();

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between">
                        <div>
                            <h1 class="text-4xl font-bold text-gray-900 mb-2">Aktivite Logları</h1>
                            <p class="text-gray-600">Sistem aktivitelerini görüntüle ve filtrele</p>
                        </div>
                        <button onclick="App.navigate('dashboard')" class="btn-secondary">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Dashboard
                        </button>
                    </div>
                </div>

                <!-- Statistics Cards -->
                ${ActivityLogsComponent.stats ? `
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div class="glass-dark rounded-xl p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-gray-600 text-sm">Bugünkü İşlemler</p>
                                    <p class="text-3xl font-bold text-gray-900 mt-2">${ActivityLogsComponent.stats.todayActions || 0}</p>
                                </div>
                                <div class="bg-blue-500/20 rounded-lg p-3">
                                    <i class="fas fa-clock text-2xl text-blue-500"></i>
                                </div>
                            </div>
                        </div>
                        <div class="glass-dark rounded-xl p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-gray-600 text-sm">Aktif Kullanıcılar</p>
                                    <p class="text-3xl font-bold text-gray-900 mt-2">${ActivityLogsComponent.stats.activeUsers || 0}</p>
                                </div>
                                <div class="bg-green-500/20 rounded-lg p-3">
                                    <i class="fas fa-users text-2xl text-green-500"></i>
                                </div>
                            </div>
                        </div>
                        <div class="glass-dark rounded-xl p-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <p class="text-gray-600 text-sm">En Aktif Kaynak</p>
                                    <p class="text-2xl font-bold text-gray-900 mt-2">${ActivityLogsComponent.stats.mostActiveResource?. resource || 'Yok'}</p>
                                    <p class="text-sm text-gray-500">${ActivityLogsComponent.stats.mostActiveResource?.count || 0} işlem</p>
                                </div>
                                <div class="bg-purple-500/20 rounded-lg p-3">
                                    <i class="fas fa-chart-bar text-2xl text-purple-500"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Filters -->
                <div class="glass-dark rounded-xl p-6 mb-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Filtrele</h3>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-2">İşlem</label>
                            <select id="action-filter" class="input-field">
                                <option value="">Tümü</option>
                                <option value="created">Oluşturuldu</option>
                                <option value="updated">Güncellendi</option>
                                <option value="deleted">Silindi</option>
                                <option value="logged_in">Giriş Yapıldı</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-2">Kaynak</label>
                            <select id="resource-filter" class="input-field">
                                <option value="">Tümü</option>
                                <option value="motors">Motorlar</option>
                                <option value="services">Servisler</option>
                                <option value="users">Kullanıcılar</option>
                                <option value="service_types">Servis Tipleri</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-2">Başlangıç</label>
                            <input type="date" id="start-date-filter" class="input-field">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-2">Bitiş</label>
                            <input type="date" id="end-date-filter" class="input-field">
                        </div>
                        <div class="flex items-end">
                            <button onclick="ActivityLogsComponent.applyFilters()" class="btn-primary w-full">
                                <i class="fas fa-filter mr-2"></i>
                                Filtrele
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Activity Log Table -->
                <div class="glass-dark rounded-xl overflow-hidden">
                    ${ActivityLogsComponent.logs.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Tarih/Saat</th>
                                        <th>Kullanıcı</th>
                                        <th>İşlem</th>
                                        <th>Kaynak</th>
                                        <th>Detaylar</th>
                                        <th>IP</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ActivityLogsComponent.logs.map(log => `
                                        <tr>
                                            <td class="font-mono text-sm">
                                                ${new Date(log.created_at).toLocaleString('tr-TR')}
                                            </td>
                                            <td>
                                                <div class="flex items-center">
                                                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mr-3">
                                                        <span class="text-white text-sm font-bold">${log.username?.charAt(0).toUpperCase() || 'U'}</span>
                                                    </div>
                                                    <span class="font-medium">${log.username || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span class="badge badge-${ActivityLogsComponent.getActionClass(log.action)}">
                                                    ${ActivityLogsComponent.getActionText(log.action)}
                                                </span>
                                            </td>
                                            <td class="capitalize">${log.resource}</td>
                                            <td class="text-sm text-gray-500 max-w-xs truncate" title="${log.details || ''}">
                                                ${log.details || '-'}
                                            </td>
                                            <td class="font-mono text-sm">${log.ip_address || '-'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="text-center py-16">
                            <i class="fas fa-history text-6xl text-gray-400 mb-4"></i>
                            <p class="text-gray-500 text-lg">Log kaydı bulunamadı</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    fetchLogs: async () => {
        try {
            const params = new URLSearchParams(ActivityLogsComponent.filters);
            const response = await API.activityLogs.getAll(params.toString());
            ActivityLogsComponent.logs = response.data || [];
        } catch (error) {
            console.error('Logs fetch error:', error);
            ActivityLogsComponent.logs = [];
        }
    },

    fetchStats: async () => {
        try {
            const response = await API.activityLogs.getStats();
            ActivityLogsComponent.stats = response.data || null;
        } catch (error) {
            console.error('Stats fetch error:', error);
            ActivityLogsComponent.stats = null;
        }
    },

    applyFilters: () => {
        ActivityLogsComponent.filters.action = document.getElementById('action-filter').value;
        ActivityLogsComponent.filters.resource = document.getElementById('resource-filter').value;
        ActivityLogsComponent.filters.startDate = document.getElementById('start-date-filter').value;
        ActivityLogsComponent.filters.endDate = document.getElementById('end-date-filter').value;
        App.navigate('activity-logs');
    },

    getActionClass: (action) => {
        const actionMap = {
            'created': 'success',
            'updated': 'info',
            'deleted': 'danger',
            'logged_in': 'primary'
        };
        return actionMap[action] || 'secondary';
    },

    getActionText: (action) => {
        const textMap = {
            'created': 'Oluşturuldu',
            'updated': 'Güncellendi',
            'deleted': 'Silindi',
            'logged_in': 'Giriş Yapıldı'
        };
        return textMap[action] || action;
    }
};
