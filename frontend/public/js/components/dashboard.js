// Dashboard component

const DashboardComponent = {
    stats: null,
    recentMotors: [],
    recentServices: [],
    motorStats: [],
    chartInstance: null,

    render: async () => {
        const user = Storage.getUser();

        // Safety check for user
        if (!user) {
            Storage.logout();
            return '';
        }

        const isAdmin = user.role === 'admin';

        // Fetch all dashboard data
        try {
            const [motorsRes, servicesRes, statsRes] = await Promise.all([
                API.motors.getAll({ page: 1, limit: 5 }),
                API.services.getRecent(),
                API.motors.getStats({ period: 'monthly' })
            ]);

            DashboardComponent.recentMotors = motorsRes.data.motors;
            DashboardComponent.recentServices = servicesRes.data;
            DashboardComponent.motorStats = statsRes.data;

            DashboardComponent.stats = {
                total: motorsRes.data.pagination.total,
                recent: motorsRes.data.motors.length
            };
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }

        // Initialize chart after render
        setTimeout(() => {
            DashboardComponent.initChart();
        }, 100);

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 class="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
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
                        </div>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-${isAdmin ? '4' : '3'} gap-6 mb-8">
                    <!-- Total Motors -->
                    <div class="glass-dark rounded-xl p-6 relative overflow-hidden group">
                        <div class="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-purple-500/10 to-transparent"></div>
                        <div class="flex items-center justify-between mb-4 relative z-10">
                            <div class="bg-purple-500/10 rounded-lg p-3">
                                <i class="fas fa-motorcycle text-2xl text-purple-600"></i>
                            </div>
                            <span class="text-3xl font-bold text-gray-900">${DashboardComponent.stats?.total || 0}</span>
                        </div>
                        <h3 class="text-gray-600 font-medium relative z-10">Toplam Motor</h3>
                    </div>

                    <!-- Motor List Shortcut -->
                    <div class="glass-dark rounded-xl p-6 cursor-pointer hover:shadow-md transition group" onclick="App.navigate('motors')">
                        <div class="flex items-center justify-between mb-4">
                            <div class="bg-blue-500/10 rounded-lg p-3">
                                <i class="fas fa-list text-2xl text-blue-600"></i>
                            </div>
                            <i class="fas fa-arrow-right text-gray-400 group-hover:text-blue-600 transition"></i>
                        </div>
                        <h3 class="text-gray-600 font-medium">Motor Listesi</h3>
                    </div>

                    <!-- Service History Shortcut -->
                    <div class="glass-dark rounded-xl p-6 cursor-pointer hover:shadow-md transition group" onclick="App.navigate('service-history')">
                        <div class="flex items-center justify-between mb-4">
                            <div class="bg-orange-500/10 rounded-lg p-3">
                                <i class="fas fa-tools text-2xl text-orange-600"></i>
                            </div>
                            <i class="fas fa-arrow-right text-gray-400 group-hover:text-orange-600 transition"></i>
                        </div>
                        <h3 class="text-gray-600 font-medium">Tüm Servis Kayıtları</h3>
                    </div>

                    ${isAdmin ? `
                        <!--User Management Card (Admin Only) -->
                        <div class="glass-dark rounded-xl p-6 cursor-pointer hover:shadow-md transition group" onclick="App.navigate('user-management')">
                            <div class="flex items-center justify-between mb-4">
                                <div class="bg-green-500/10 rounded-lg p-3">
                                    <i class="fas fa-users text-2xl text-green-600"></i>
                                </div>
                                <i class="fas fa-arrow-right text-gray-400 group-hover:text-green-600 transition"></i>
                            </div>
                            <h3 class="text-gray-600 font-medium">Kullanıcı Yönetimi</h3>
                        </div>
                    ` : ''}
                </div>

                <!-- Main Content Grid -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    <!-- Left Column: Chart & Services -->
                    <div class="space-y-8">
                        <!-- Analytics Chart -->
                        <div class="glass-dark rounded-xl p-6 shadow-sm border border-gray-100">
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-lg font-bold text-gray-900">Motor Ekleme İstatistikleri</h2>
                                <div class="flex bg-gray-100 rounded-lg p-1">
                                    <button onclick="DashboardComponent.updateChart('daily')" class="px-3 py-1 text-xs font-medium rounded-md transition hover:bg-white hover:shadow-sm" id="btn-daily">Günlük</button>
                                    <button onclick="DashboardComponent.updateChart('weekly')" class="px-3 py-1 text-xs font-medium rounded-md transition hover:bg-white hover:shadow-sm" id="btn-weekly">Haftalık</button>
                                    <button onclick="DashboardComponent.updateChart('monthly')" class="px-3 py-1 text-xs font-medium rounded-md bg-white shadow-sm text-blue-600" id="btn-monthly">Aylık</button>
                                </div>
                            </div>
                            <div class="h-64 relative">
                                <canvas id="motorStatsChart"></canvas>
                            </div>
                        </div>

                        <!-- Recent Services -->
                        <div class="glass-dark rounded-xl p-6 shadow-sm border border-gray-100">
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-lg font-bold text-gray-900">Son Servis İşlemleri</h2>
                            </div>
                            
                            <div class="space-y-4">
                                ${DashboardComponent.recentServices.length > 0 ? DashboardComponent.recentServices.map(service => `
                                    <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition border border-transparent hover:border-gray-100">
                                        <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <i class="fas fa-wrench text-blue-500 text-sm"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex justify-between items-start">
                                                <h4 class="text-sm font-semibold text-gray-900 truncate">${service.service_type}</h4>
                                                <span class="text-xs text-gray-400 ml-2">${new Date(service.service_date).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                            <p class="text-xs text-gray-600 mt-0.5 truncate">${service.model} - ${service.chassis_number}</p>
                                            ${service.description ? `<p class="text-xs text-gray-400 mt-1 line-clamp-1">${service.description}</p>` : ''}
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="text-center py-8 text-gray-400">
                                        <p class="text-sm">Henüz servis kaydı yok</p>
                                    </div>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- Right Column: Recent Motors -->
                    <div class="glass-dark rounded-xl p-6 shadow-sm border border-gray-100 h-fit">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-lg font-bold text-gray-900">Son Eklenen Motorlar</h2>
                            <button onclick="App.navigate('motors')" class="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                Tümünü Gör
                            </button>
                        </div>

                        ${DashboardComponent.recentMotors.length > 0 ? `
                            <div class="overflow-hidden">
                                <table class="w-full">
                                    <thead>
                                        <tr class="text-left border-b border-gray-100">
                                            <th class="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Model Detay</th>
                                            <th class="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Durum</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-50">
                                        ${DashboardComponent.recentMotors.map(motor => `
                                            <tr class="group hover:bg-gray-50/50 transition cursor-pointer" onclick="App.navigate('motor-detail', '${motor.id}')">
                                                <td class="py-4">
                                                    <div class="flex items-center gap-3">
                                                        <div class="flex flex-col">
                                                            <span class="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">${motor.model}</span>
                                                            <span class="text-xs text-gray-500">${motor.year} • ${motor.manufacturer}</span>
                                                            <code class="text-[10px] text-gray-400 font-mono mt-0.5">${motor.chassis_number}</code>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="py-4 text-right">
                                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        ${motor.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                motor.status === 'sold' ? 'bg-gray-100 text-gray-800' :
                    motor.status === 'in_service' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
                                                        ${DashboardComponent.getStatusText(motor.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl bg-gray-50/50">
                                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white mb-3 shadow-sm">
                                    <i class="fas fa-motorcycle text-gray-400"></i>
                                </div>
                                <h3 class="text-sm font-medium text-gray-900">Henüz motor yok</h3>
                                ${isAdmin ? `
                                    <button onclick="App.navigate('motor-new')" class="mt-3 text-xs btn-primary py-1.5 px-3">
                                        İlk Motoru Ekle
                                    </button>
                                ` : ''}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    },

    initChart: () => {
        const ctx = document.getElementById('motorStatsChart');
        if (!ctx) return;

        if (DashboardComponent.chartInstance) {
            DashboardComponent.chartInstance.destroy();
        }

        const labels = DashboardComponent.motorStats.map(item => item.label);
        const data = DashboardComponent.motorStats.map(item => item.count);

        DashboardComponent.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Eklenen Motor Sayısı',
                    data: data,
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4f46e5',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#111827',
                        bodyColor: '#4b5563',
                        borderColor: '#e5e7eb',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f3f4f6',
                            drawBorder: false
                        },
                        ticks: {
                            stepSize: 1,
                            font: {
                                size: 11
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            maxRotation: 0
                        }
                    }
                }
            }
        });
    },

    updateChart: async (period) => {
        // Update active button state
        document.querySelectorAll('[id^="btn-"]').forEach(btn => {
            btn.classList.remove('bg-white', 'shadow-sm', 'text-blue-600');
            btn.classList.add('hover:bg-white', 'hover:shadow-sm');
        });
        const activeBtn = document.getElementById(`btn-${period}`);
        if (activeBtn) {
            activeBtn.classList.add('bg-white', 'shadow-sm', 'text-blue-600');
            activeBtn.classList.remove('hover:bg-white', 'hover:shadow-sm');
        }

        try {
            const response = await API.motors.getStats({ period });
            DashboardComponent.motorStats = response.data;
            DashboardComponent.initChart();
        } catch (error) {
            console.error('Error updating chart:', error);
            showToast('İstatistikler güncellenemedi', 'error');
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
