// Service Type Management Component (Admin Only)
const ServiceTypeManagement = {
    serviceTypes: [],
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

        // Fetch service types and stats
        try {
            const [typesResponse, statsResponse] = await Promise.all([
                API.serviceTypes.getAll(true), // Include inactive
                API.serviceTypes.getStats()
            ]);

            ServiceTypeManagement.serviceTypes = typesResponse.data || [];
            ServiceTypeManagement.stats = statsResponse.data || {};
        } catch (error) {
            showToast('Servis tipleri yüklenemedi: ' + error.message, 'error');
            ServiceTypeManagement.serviceTypes = [];
            ServiceTypeManagement.stats = {};
        }

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h1 class="text-4xl font-bold text-gray-900 mb-2">
                                <i class="fas fa-tags mr-3"></i>
                                Servis Tipi Yönetimi
                            </h1>
                            <p class="text-gray-600">Servis tiplerini tanımlayın ve yönetin</p>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="ServiceTypeManagement.openAddModal()" class="btn-primary">
                                <i class="fas fa-plus mr-2"></i>
                                Yeni Servis Tipi
                            </button>
                            <button onclick="App.navigate('dashboard')" class="btn-secondary">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Cards -->
                ${ServiceTypeManagement.renderStats()}

                <!-- Service Types List -->
                <div class="glass-dark rounded-xl p-6">
                    <h2 class="text-2xl font-bold text-gray-900 mb-6">Servis Tipleri</h2>
                    
                    ${ServiceTypeManagement.renderList()}
                </div>
            </div>
        `;
    },

    renderStats: () => {
        const stats = ServiceTypeManagement.stats;
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <!-- Total -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Toplam</p>
                            <p class="text-3xl font-bold text-gray-900">${stats.total || 0}</p>
                        </div>
                        <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-tags text-2xl text-blue-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Active -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Aktif</p>
                            <p class="text-3xl font-bold text-gray-900">${stats.active || 0}</p>
                        </div>
                        <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-check-circle text-2xl text-green-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Inactive -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Pasif</p>
                            <p class="text-3xl font-bold text-gray-900">${stats.inactive || 0}</p>
                        </div>
                        <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-ban text-2xl text-gray-600"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderList: () => {
        if (!ServiceTypeManagement.serviceTypes || ServiceTypeManagement.serviceTypes.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="fas fa-tags text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">Henüz servis tipi tanımlanmamış</p>
                    <button onclick="ServiceTypeManagement.openAddModal()" class="btn-primary mt-4">
                        <i class="fas fa-plus mr-2"></i>
                        İlk Servis Tipini Ekle
                    </button>
                </div>
            `;
        }

        return `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-200">
                            <th class="text-left py-3 px-4 font-semibold text-gray-700">Ad</th>
                            <th class="text-left py-3 px-4 font-semibold text-gray-700">Açıklama</th>
                            <th class="text-left py-3 px-4 font-semibold text-gray-700">Durum</th>
                            <th class="text-right py-3 px-4 font-semibold text-gray-700">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ServiceTypeManagement.serviceTypes.map(type => `
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="py-4 px-4">
                                    <span class="font-medium text-gray-900">${type.name}</span>
                                </td>
                                <td class="py-4 px-4">
                                    <span class="text-gray-600">${type.description || '-'}</span>
                                </td>
                                <td class="py-4 px-4">
                                    <span class="badge badge-${type.is_active ? 'success' : 'secondary'}">
                                        ${type.is_active ? 'Aktif' : 'Pasif'}
                                    </span>
                                </td>
                                <td class="py-4 px-4">
                                    <div class="flex items-center justify-end gap-2">
                                        <button 
                                            onclick="ServiceTypeManagement.toggleStatus('${type.id}', ${!type.is_active})"
                                            class="px-3 py-1 text-sm ${type.is_active ? 'bg-gray-600' : 'bg-green-600'} text-white rounded-lg hover:opacity-80"
                                            title="${type.is_active ? 'Pasifleştir' : 'Aktifleştir'}">
                                            <i class="fas fa-${type.is_active ? 'ban' : 'check'}"></i>
                                        </button>
                                        <button 
                                            onclick="ServiceTypeManagement.openEditModal('${type.id}')"
                                            class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    openAddModal: () => {
        const modalHTML = `
            <div id="service-type-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
                        <h2 class="text-2xl font-bold text-white">Yeni Servis Tipi</h2>
                    </div>
                    <form id="service-type-form" class="p-6">
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Tip Adı <span class="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                required
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Örn: Genel Bakım"
                            />
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                            <textarea 
                                name="description" 
                                rows="3"
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Servis tipi açıklaması..."
                            ></textarea>
                        </div>

                        <div class="flex items-center justify-end gap-3 pt-4 border-t">
                            <button 
                                type="button" 
                                onclick="ServiceTypeManagement.closeModal()" 
                                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                İptal
                            </button>
                            <button 
                                type="submit" 
                                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('service-type-form').addEventListener('submit', ServiceTypeManagement.handleSubmit);
    },

    openEditModal: async (id) => {
        try {
            const response = await API.serviceTypes.getById(id);
            const type = response.data;

            const modalHTML = `
                <div id="service-type-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
                            <h2 class="text-2xl font-bold text-white">Servis Tipini Düzenle</h2>
                        </div>
                        <form id="service-type-form" class="p-6">
                            <input type="hidden" name="id" value="${type.id}" />
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Tip Adı <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value="${type.name}"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                                <textarea 
                                    name="description" 
                                    rows="3"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >${type.description || ''}</textarea>
                            </div>

                            <div class="flex items-center justify-end gap-3 pt-4 border-t">
                                <button 
                                    type="button" 
                                    onclick="ServiceTypeManagement.closeModal()" 
                                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                                    İptal
                                </button>
                                <button 
                                    type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Güncelle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.getElementById('service-type-form').addEventListener('submit', ServiceTypeManagement.handleSubmit);
        } catch (error) {
            showToast('Hata: ' + error.message, 'error');
        }
    },

    closeModal: () => {
        const modal = document.getElementById('service-type-modal');
        if (modal) {
            modal.remove();
        }
    },

    handleSubmit: async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            description: formData.get('description')
        };
        const id = formData.get('id');

        showLoading();

        try {
            if (id) {
                await API.serviceTypes.update(id, data);
                showToast('Servis tipi güncellendi', 'success');
            } else {
                await API.serviceTypes.create(data);
                showToast('Servis tipi oluşturuldu', 'success');
            }
            
            hideLoading();
            ServiceTypeManagement.closeModal();
            
            setTimeout(() => {
                App.navigate('service-type-management');
            }, 500);
        } catch (error) {
            hideLoading();
            showToast('Hata: ' + error.message, 'error');
        }
    },

    toggleStatus: async (id, isActive) => {
        showLoading();

        try {
            await API.serviceTypes.update(id, { is_active: isActive });
            hideLoading();
            showToast(isActive ? 'Servis tipi aktifleştirildi' : 'Servis tipi pasifleştirildi', 'success');
            
            setTimeout(() => {
                App.navigate('service-type-management');
            }, 500);
        } catch (error) {
            hideLoading();
            showToast('Hata: ' + error.message, 'error');
        }
    }
};
