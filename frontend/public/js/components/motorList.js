// Motor List component

const MotorListComponent = {
    motors: [],
    pagination: null,
    currentPage: 1,
    filters: {
        search: '',
        status: '',
        year: ''
    },

    render: async () => {
        const user = Storage.getUser();
        const isAdmin = user && user.role === 'admin';

        // Fetch motors
        await MotorListComponent.fetchMotors();

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 class="text-4xl font-bold text-black mb-2">Motor Listesi</h1>
                            <p class="text-gray-600">Tüm motorları görüntüle ve yönet</p>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="App.navigate('dashboard')" class="btn-secondary">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Dashboard
                            </button>
                            ${isAdmin ? `
                                <button onclick="App.navigate('bulk-import')" class="btn-secondary">
                                    <i class="fas fa-file-excel mr-2"></i>
                                    Toplu İçe Aktar
                                </button>
                                <button onclick="App.navigate('motor-new')" class="btn-primary">
                                    <i class="fas fa-plus mr-2"></i>
                                    Yeni Motor
                                </button>
                            ` : ''}
                            <button onclick="DashboardComponent.logout()" class="btn-secondary">
                                <i class="fas fa-sign-out-alt mr-2"></i>
                                Çıkış
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Filters -->
                <div class="glass-dark rounded-xl p-6 mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-600 mb-2">Ara</label>
                            <input 
                                type="text" 
                                id="search-input"
                                class="input-field"
                                placeholder="Şase, motor numarası, model..."
                                value="${MotorListComponent.filters.search}"
                            />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-2">Durum</label>
                            <select id="status-filter" class="input-field">
                                <option value="">Tümü</option>
                                <option value="in_stock" ${MotorListComponent.filters.status === 'in_stock' ? 'selected' : ''}>Stokta</option>
                                <option value="sold" ${MotorListComponent.filters.status === 'sold' ? 'selected' : ''}>Satıldı</option>
                                <option value="in_service" ${MotorListComponent.filters.status === 'in_service' ? 'selected' : ''}>Serviste</option>
                                <option value="scrapped" ${MotorListComponent.filters.status === 'scrapped' ? 'selected' : ''}>Hurdaya Çıktı</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-2">Yıl</label>
                            <input 
                                type="number" 
                                id="year-filter"
                                class="input-field"
                                placeholder="2024"
                                value="${MotorListComponent.filters.year}"
                            />
                        </div>
                    </div>
                    <button onclick="MotorListComponent.applyFilters()" class="btn-primary mt-4">
                        <i class="fas fa-filter mr-2"></i>
                        Filtrele
                    </button>
                </div>

                <!-- Motors Table -->
                <div class="glass-dark rounded-xl overflow-hidden">
                    ${MotorListComponent.motors.length > 0 ? `
                        <div class="overflow-x-auto">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Yıl</th>
                                        <th>Şase No</th>
                                        <th>Motor No</th>
                                        <th>Renk</th>
                                        <th>Durum</th>
                                        <th class="text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${MotorListComponent.motors.map(motor => `
                                        <tr>
                                            <td class="font-semibold">${motor.model}</td>
                                            <td>${motor.year}</td>
                                            <td><code class="text-xs">${motor.chassis_number}</code></td>
                                            <td><code class="text-xs">${motor.engine_number}</code></td>
                                            <td>
                                                <span class="inline-flex items-center gap-2">
                                                    <span class="w-4 h-4 rounded-full border border-white/20" style="background-color: ${motor.color}"></span>
                                                    ${motor.color}
                                                </span>
                                            </td>
                                            <td>
                                                <span class="badge badge-${MotorListComponent.getStatusClass(motor.status)}">
                                                    ${MotorListComponent.getStatusText(motor.status)}
                                                </span>
                                            </td>
                                            <td class="text-right">
                                                <button 
                                                    onclick="App.navigate('motor-detail', '${motor.id}')"
                                                    class="text-purple-400 hover:text-purple-300 mr-3"
                                                    title="Detaylar">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                ${isAdmin ? `
                                                    <button 
                                                        onclick="App.navigate('motor-edit', '${motor.id}')"
                                                        class="text-blue-400 hover:text-blue-300 mr-3"
                                                        title="Düzenle">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        onclick="MotorListComponent.deleteMotor('${motor.id}')"
                                                        class="text-red-400 hover:text-red-300"
                                                        title="Sil">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                ` : ''}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <!-- Pagination -->
                        ${MotorListComponent.renderPagination()}
                    ` : `
                        <div class="text-center py-16">
                            <i class="fas fa-search text-6xl text-slate-600 mb-4"></i>
                            <p class="text-gray-500 text-lg">Motor bulunamadı</p>
                            ${isAdmin ? `
                                <button onclick="App.navigate('motor-new')" class="btn-primary mt-6">
                                    <i class="fas fa-plus mr-2"></i>
                                    Yeni Motor Ekle
                                </button>
                            ` : ''}
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    renderPagination: () => {
        if (!MotorListComponent.pagination || MotorListComponent.pagination.pages <= 1) {
            return '';
        }

        const { page, pages } = MotorListComponent.pagination;
        
        return `
            <div class="flex items-center justify-between p-6 border-t border-white/10">
                <p class="text-gray-500">
                    Sayfa ${page} / ${pages}
                </p>
                <div class="flex gap-2">
                    <button 
                        onclick="MotorListComponent.changePage(${page - 1})"
                        class="btn-secondary"
                        ${page === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button 
                        onclick="MotorListComponent.changePage(${page + 1})"
                        class="btn-secondary"
                        ${page === pages ? 'disabled' : ''}>
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    },

    fetchMotors: async () => {
        try {
            const params = {
                page: MotorListComponent.currentPage,
                limit: 10,
                ...MotorListComponent.filters
            };

            const response = await API.motors.getAll(params);
            MotorListComponent.motors = response.data.motors;
            MotorListComponent.pagination = response.data.pagination;
        } catch (error) {
            showToast('Motorlar yüklenemedi', 'error');
        }
    },

    applyFilters: () => {
        MotorListComponent.filters.search = document.getElementById('search-input').value;
        MotorListComponent.filters.status = document.getElementById('status-filter').value;
        MotorListComponent.filters.year = document.getElementById('year-filter').value;
        MotorListComponent.currentPage = 1;
        App.navigate('motors');
    },

    changePage: async (page) => {
        MotorListComponent.currentPage = page;
        App.navigate('motors');
    },

    deleteMotor: async (id, chassisNumber) => {
        if (!confirm(`${chassisNumber} şase numaralı motoru silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            await API.motors.delete(id);
            showToast('Motor başarıyla silindi', 'success');
            MotorListComponent.loadMotors();
        } catch (error) {
            showToast('Motor sile' + error.message, 'error');
        }
    },

    generateAllQRs: async () => {
        if (!confirm('QR kodu olmayan tüm motorlar için QR kod oluşturulsun mu? Bu işlem biraz zaman alabilir.')) {
            return;
        }

        showLoading();

        try {
            const response = await API.motors.generateAllQRs();
            
            hideLoading();

            if (response.success) {
                const { generated, total, errors } = response.data;
                
                if (generated > 0) {
                    showToast(`${generated} motor için QR kod oluşturuldu!`, 'success');
                } else {
                    showToast('Tüm motorların zaten QR kodu var', 'info');
                }

                if (errors && errors.length > 0) {
                    console.error('QR generation errors:', errors);
                    showToast(`${errors.length} motor için hata oluştu`, 'error');
                }
            } else {
                showToast(response.message || 'QR kodları oluşturulamadı', 'error');
            }
        } catch (error) {
            hideLoading();
            showToast('Hata oluştu: ' + error.message, 'error');
        }
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
    }
};
