// Service History Component - Shows all services across all motors
const ServiceHistoryComponent = {
    services: [],
    motors: [],
    filters: {
        motor: '',
        serviceType: '',
        startDate: '',
        endDate: ''
    },

    render: async () => {
        // Fetch all motors and their services
        try {
            const motorsResponse = await API.motors.getAll();
            ServiceHistoryComponent.motors = motorsResponse.data.motors || [];

            // Fetch services for all motors
            const servicePromises = ServiceHistoryComponent.motors.map(motor =>
                API.services.getMotorServices(motor.id).catch(() => ({ data: [] }))
            );
            
            const servicesResponses = await Promise.all(servicePromises);
            
            // Combine all services with motor info
            ServiceHistoryComponent.services = [];
            servicesResponses.forEach((response, index) => {
                const motor = ServiceHistoryComponent.motors[index];
                const motorServices = response.data || [];
                
                motorServices.forEach(service => {
                    ServiceHistoryComponent.services.push({
                        ...service,
                        motor_data: {
                            id: motor.id,
                            model: motor.model,
                            chassis_number: motor.chassis_number,
                            engine_number: motor.engine_number
                        }
                    });
                });
            });

        } catch (error) {
            showToast('Servisler yüklenemedi: ' + error.message, 'error');
            ServiceHistoryComponent.services = [];
            ServiceHistoryComponent.motors = [];
        }

        const user = Storage.getUser();
        const isAdmin = user && user.role === 'admin';

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h1 class="text-4xl font-bold text-gray-900 mb-2">
                                <i class="fas fa-history mr-3"></i>
                                Servis Geçmişi
                            </h1>
                            <p class="text-gray-600">Tüm motorların servis geçmişi</p>
                        </div>
                        <button onclick="App.navigate('dashboard')" class="btn-secondary">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Dashboard
                        </button>
                    </div>
                </div>

                <!-- Statistics Cards -->
                ${ServiceHistoryComponent.renderStats()}

                <!-- Filters -->
                ${ServiceHistoryComponent.renderFilters()}

                <!-- Services List -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Servis Kayıtları</h2>
                        <span class="text-gray-600">${ServiceHistoryComponent.getFilteredServices().length} kayıt</span>
                    </div>
                    
                    ${ServiceHistoryComponent.renderServicesList()}
                </div>
            </div>
        `;
    },

    renderStats: () => {
        const services = ServiceHistoryComponent.services;
        const totalCost = services.reduce((sum, s) => sum + (parseFloat(s.cost) || 0), 0);
        const thisMonthServices = services.filter(s => {
            const serviceDate = new Date(s.service_date);
            const now = new Date();
            return serviceDate.getMonth() === now.getMonth() && 
                   serviceDate.getFullYear() === now.getFullYear();
        }).length;

        const upcomingServices = services.filter(s => {
            if (!s.next_service_date) return false;
            const nextDate = new Date(s.next_service_date);
            const now = new Date();
            return nextDate > now;
        }).length;

        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <!-- Total Services -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Toplam Servis</p>
                            <p class="text-3xl font-bold text-gray-900">${services.length}</p>
                        </div>
                        <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-tools text-2xl text-blue-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Total Cost -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Toplam Maliyet</p>
                            <p class="text-3xl font-bold text-gray-900">${totalCost.toLocaleString('tr-TR')} ₺</p>
                        </div>
                        <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-lira-sign text-2xl text-green-600"></i>
                        </div>
                    </div>
                </div>

                <!-- This Month -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Bu Ay</p>
                            <p class="text-3xl font-bold text-gray-900">${thisMonthServices}</p>
                        </div>
                        <div class="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-calendar text-2xl text-purple-600"></i>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Services -->
                <div class="glass-dark rounded-xl p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm mb-1">Planlanan Servis</p>
                            <p class="text-3xl font-bold text-gray-900">${upcomingServices}</p>
                        </div>
                        <div class="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                            <i class="fas fa-clock text-2xl text-yellow-600"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderFilters: () => {
        const motors = ServiceHistoryComponent.motors || [];
        
        return `
            <div class="glass-dark rounded-xl p-6 mb-6">
                <h3 class="font-semibold text-gray-900 mb-4">
                    <i class="fas fa-filter mr-2"></i>
                    Filtreler
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Motor Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Motor</label>
                        <select 
                            id="filter-motor"
                            onchange="ServiceHistoryComponent.applyFilter('motor', this.value)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tüm Motorlar</option>
                            ${motors.map(motor => `
                                <option value="${motor.id}">${motor.model} - ${motor.chassis_number}</option>
                            `).join('')}
                        </select>
                    </div>

                    <!-- Service Type Filter -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Servis Tipi</label>
                        <select 
                            id="filter-service-type"
                            onchange="ServiceHistoryComponent.applyFilter('serviceType', this.value)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Tüm Tipler</option>
                            <option value="Bakım">Rutin Bakım</option>
                            <option value="Onarım">Onarım</option>
                            <option value="Yağ Değişimi">Yağ Değişimi</option>
                            <option value="Fren Bakımı">Fren Bakımı</option>
                            <option value="Elektrik">Elektrik İşlemi</option>
                            <option value="Kaporta">Kaporta/Boya</option>
                            <option value="Diğer">Diğer</option>
                        </select>
                    </div>

                    <!-- Date Range -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                        <input 
                            type="date"
                            id="filter-start-date"
                            onchange="ServiceHistoryComponent.applyFilter('startDate', this.value)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                        <input 
                            type="date"
                            id="filter-end-date"
                            onchange="ServiceHistoryComponent.applyFilter('endDate', this.value)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div class="mt-4">
                    <button 
                        onclick="ServiceHistoryComponent.clearFilters()"
                        class="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                        <i class="fas fa-times mr-2"></i>
                        Filtreleri Temizle
                    </button>
                </div>
            </div>
        `;
    },

    renderServicesList: () => {
        const services = ServiceHistoryComponent.getFilteredServices();

        if (services.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="fas fa-tools text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">Servis kaydı bulunamadı</p>
                </div>
            `;
        }

        const user = Storage.getUser();
        const isAdmin = user && user.role === 'admin';

        return `
            <div class="space-y-4">
                ${services.map(service => `
                    <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <!-- Motor Info -->
                                <div class="flex items-center gap-3 mb-3">
                                    <button 
                                        onclick="App.navigate('motor-detail', '${service.motor_data.id}')"
                                        class="text-blue-600 hover:text-blue-700 font-semibold">
                                        ${service.motor_data.model}
                                    </button>
                                    <span class="text-sm text-gray-500">${service.motor_data.chassis_number}</span>
                                </div>

                                <!-- Service Info -->
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="badge badge-info">${service.service_type}</span>
                                    <span class="text-sm text-gray-600">
                                        <i class="fas fa-calendar mr-1"></i>
                                        ${new Date(service.service_date).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>

                                ${service.description ? `
                                    <p class="text-sm text-gray-600 mb-2">${service.description}</p>
                                ` : ''}

                                <div class="flex flex-wrap gap-3 text-sm text-gray-500">
                                    ${service.technician ? `
                                        <span><i class="fas fa-user mr-1"></i>${service.technician}</span>
                                    ` : ''}
                                    ${service.cost ? `
                                        <span><i class="fas fa-lira-sign mr-1"></i>${service.cost} TL</span>
                                    ` : ''}
                                    ${service.next_service_date ? `
                                        <span class="text-yellow-600"><i class="fas fa-clock mr-1"></i>Sonraki: ${new Date(service.next_service_date).toLocaleDateString('tr-TR')}</span>
                                    ` : ''}
                                </div>
                            </div>

                            <div class="flex flex-col gap-2 ml-4">
                                <button 
                                    onclick="MotorDetailComponent.printServiceReport('${service.id}')"
                                    class="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">
                                    <i class="fas fa-print mr-1"></i>
                                    Yazdır
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    getFilteredServices: () => {
        let filtered = [...ServiceHistoryComponent.services];

        // Apply motor filter
        if (ServiceHistoryComponent.filters.motor) {
            filtered = filtered.filter(s => s.motor_data.id === ServiceHistoryComponent.filters.motor);
        }

        // Apply service type filter
        if (ServiceHistoryComponent.filters.serviceType) {
            filtered = filtered.filter(s => s.service_type === ServiceHistoryComponent.filters.serviceType);
        }

        // Apply date filters
        if (ServiceHistoryComponent.filters.startDate) {
            const startDate = new Date(ServiceHistoryComponent.filters.startDate);
            filtered = filtered.filter(s => new Date(s.service_date) >= startDate);
        }

        if (ServiceHistoryComponent.filters.endDate) {
            const endDate = new Date(ServiceHistoryComponent.filters.endDate);
            filtered = filtered.filter(s => new Date(s.service_date) <= endDate);
        }

        // Sort by date descending
        filtered.sort((a, b) => new Date(b.service_date) - new Date(a.service_date));

        return filtered;
    },

    applyFilter: (filterName, value) => {
        ServiceHistoryComponent.filters[filterName] = value;
        App.navigate('service-history');
    },

    clearFilters: () => {
        ServiceHistoryComponent.filters = {
            motor: '',
            serviceType: '',
            startDate: '',
            endDate: ''
        };
        App.navigate('service-history');
    }
};
