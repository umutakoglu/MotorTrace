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
                            ${Permissions.canAccessBulkImport() ? `
                                <button onclick="App.navigate('bulk-import')" class="btn-secondary">
                                    <i class="fas fa-file-excel mr-2"></i>
                                    Toplu İçe Aktar
                                </button>
                            ` : ''}
                            ${Permissions.canAddMotor() ? `
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
                        <!-- Desktop Table View (hidden on mobile) -->
                        <div class="overflow-x-auto hidden md:block">
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
                                                ${motor.color}
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
                                                <button 
                                                    onclick="MotorListComponent.printQR('${motor.id}', '${motor.model.replace(/'/g, "\\'")}', '${motor.chassis_number}', '${motor.engine_number}', '${motor.year}')"
                                                    class="text-green-400 hover:text-green-300 mr-3"
                                                    title="QR Yazdır">
                                                    <i class="fas fa-print"></i>
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

                        <!-- Mobile Card View (hidden on desktop) -->
                        <div class="block md:hidden p-4 space-y-4">
                            ${MotorListComponent.motors.map(motor => `
                                <div class="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                                    <!-- Header -->
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex-1">
                                            <h3 class="font-bold text-lg text-gray-900">${motor.model}</h3>
                                            <p class="text-sm text-gray-600">${motor.year} • ${motor.color}</p>
                                        </div>
                                        <span class="badge badge-${MotorListComponent.getStatusClass(motor.status)}">
                                            ${MotorListComponent.getStatusText(motor.status)}
                                        </span>
                                    </div>
                                    
                                    <!-- Details -->
                                    <div class="space-y-2 mb-4">
                                        <div class="flex items-center text-sm">
                                            <span class="text-gray-600 w-24">Şase No:</span>
                                            <code class="text-xs bg-gray-100 px-2 py-1 rounded">${motor.chassis_number}</code>
                                        </div>
                                        <div class="flex items-center text-sm">
                                            <span class="text-gray-600 w-24">Motor No:</span>
                                            <code class="text-xs bg-gray-100 px-2 py-1 rounded">${motor.engine_number}</code>
                                        </div>
                                    </div>
                                    
                                    <!-- Actions -->
                                    <div class="flex gap-2 pt-3 border-t border-gray-200">
                                        <button 
                                            onclick="App.navigate('motor-detail', '${motor.id}')"
                                            class="flex-1 btn-secondary text-sm py-2">
                                            <i class="fas fa-eye mr-1"></i>
                                            Detay
                                        </button>
                                        <button 
                                            onclick="MotorListComponent.printQR('${motor.id}', '${motor.model.replace(/'/g, "\\\'")}', '${motor.chassis_number}', '${motor.engine_number}', '${motor.year}')"
                                            class="flex-1 btn-secondary text-sm py-2">
                                            <i class="fas fa-print mr-1"></i>
                                            QR
                                        </button>
                                        ${isAdmin ? `
                                            <button 
                                                onclick="App.navigate('motor-edit', '${motor.id}')"
                                                class="btn-secondary text-sm py-2 px-3">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                onclick="MotorListComponent.deleteMotor('${motor.id}')"
                                                class="btn-secondary text-sm py-2 px-3 text-red-600 border-red-600">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
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

    printQR: (motorId, model, chassisNumber, engineNumber, year) => {
        if (!motorId) return;

        // Create a hidden iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Kod</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background: white;
                    }
                    img {
                        max-width: 400px;
                        width: 100%;
                        height: auto;
                    }
                    @media print {
                        body { padding: 0; margin: 0; }
                    }
                </style>
            </head>
            <body>
                <img src="/api/motors/${motorId}/qr/download" alt="QR Code" />
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                            // Clean up after printing
                            setTimeout(function() {
                                window.parent.document.body.removeChild(window.frameElement);
                            }, 100);
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        iframeDoc.close();
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
