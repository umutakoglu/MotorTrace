// Motor Detail Component - Shows comprehensive motor information
const MotorDetailComponent = {
    motor: null,
    services: [],

    render: async (id) => {
        if (!id) {
            App.navigate('motors');
            return '';
        }

        // Fetch motor data
        try {
            const motorResponse = await API.motors.getById(id);
            MotorDetailComponent.motor = motorResponse.data;

            // Fetch service history
            try {
                const servicesResponse = await API.services.getMotorServices(id);
                MotorDetailComponent.services = servicesResponse.data || [];
            } catch (error) {
                MotorDetailComponent.services = [];
            }
        } catch (error) {
            showToast('Motor bulunamadı', 'error');
            App.navigate('motors');
            return '';
        }

        const motor = MotorDetailComponent.motor;
        const user = Storage.getUser();
        const isAdmin = user && user.role === 'admin';

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h1 class="text-4xl font-bold text-gray-900 mb-2">${motor.model}</h1>
                            <p class="text-gray-600">Motor Detayları</p>
                        </div>
                        <div class="flex gap-3">
                            <button onclick="App.navigate('motors')" class="btn-secondary">
                                <i class="fas fa-arrow-left mr-2"></i>
                                Geri
                            </button>
                            ${Permissions.canEditMotor() ? `
                                <button onclick="App.navigate('motor-edit', '${motor.id}')" class="btn-primary">
                                    <i class="fas fa-edit mr-2"></i>
                                    Düzenle
                                </button>
                            ` : ''}
                            ${Permissions.canDeleteMotor() ? `
                                <button onclick="MotorDetailComponent.deleteMotor('${motor.id}')" class="btn-danger">
                                    <i class="fas fa-trash mr-2"></i>
                                    Sil
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column - Motor Info -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Motor Information Card -->
                        <div class="glass-dark rounded-xl p-6">
                            <h2 class="text-2xl font-bold text-gray-900 mb-6">Motor Bilgileri</h2>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <!-- Chassis Number -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-600 mb-2">Şase Numarası</label>
                                    <div class="flex items-center gap-2">
                                        <code class="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm text-gray-900">${motor.chassis_number}</code>
                                        <button 
                                            onclick="MotorDetailComponent.copyToClipboard('${motor.chassis_number}')"
                                            class="text-blue-500 hover:text-blue-600"
                                            title="Kopyala">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Engine Number -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-600 mb-2">Motor Numarası</label>
                                    <div class="flex items-center gap-2">
                                        <code class="flex-1 bg-gray-100 p-3 rounded-lg font-mono text-sm text-gray-900">${motor.engine_number}</code>
                                        <button 
                                            onclick="MotorDetailComponent.copyToClipboard('${motor.engine_number}')"
                                            class="text-blue-500 hover:text-blue-600"
                                            title="Kopyala">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Model -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-600 mb-2">Model</label>
                                    <p class="bg-gray-100 p-3 rounded-lg text-gray-900 font-semibold">${motor.model}</p>
                                </div>

                                <!-- Year -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-600 mb-2">Yıl</label>
                                    <p class="bg-gray-100 p-3 rounded-lg text-gray-900">${motor.year}</p>
                                </div>

                                <!-- Color -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-600 mb-2">Renk</label>
                                    <p class="bg-gray-100 p-3 rounded-lg text-gray-900">${motor.color}</p>
                                </div>

                                <!-- Manufacturer -->
                                <div>
                                    <label class="block text-sm font-medium text-gray-600 mb-2">Üretici</label>
                                    <p class="bg-gray-100 p-3 rounded-lg text-gray-900">${motor.manufacturer || 'Belirtilmemiş'}</p>
                                </div>

                                <!-- Status -->
                                <div class="md:col-span-2">
                                    <label class="block text-sm font-medium text-gray-600 mb-2">Durum</label>
                                    <div>
                                        <span class="badge badge-${MotorDetailComponent.getStatusClass(motor.status)} text-lg">
                                            ${MotorDetailComponent.getStatusText(motor.status)}
                                        </span>
                                    </div>
                                </div>

                                <!-- Notes -->
                                ${motor.notes ? `
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-600 mb-2">Notlar</label>
                                        <p class="bg-gray-100 p-3 rounded-lg text-gray-700">${motor.notes}</p>
                                    </div>
                                ` : ''}

                                <!-- Timestamps -->
                                <div class="md:col-span-2 pt-4 border-t border-gray-200">
                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="text-gray-600">Oluşturulma:</span>
                                            <span class="ml-2 text-gray-900">${new Date(motor.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-600">Güncelleme:</span>
                                            <span class="ml-2 text-gray-900">${new Date(motor.updated_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Service History -->
                        <div class="glass-dark rounded-xl p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h2 class="text-2xl font-bold text-gray-900">Servis Geçmişi</h2>
                                ${Permissions.canAddService() ? `
                                    <button class="btn-primary" onclick="AddServiceModal.open('${motor.id}')">
                                        <i class="fas fa-plus mr-2"></i>
                                        Servis Ekle
                                    </button>
                                ` : ''}
                            </div>

                            ${MotorDetailComponent.renderServices()}
                        </div>
                    </div>

                    <!-- Right Column - QR Code -->
                    <div class="lg:col-span-1">
                        <div class="glass-dark rounded-xl p-6 sticky top-8">
                            <h2 class="text-xl font-bold text-gray-900 mb-4">QR Kod</h2>
                            
                            ${motor.qrCode ? `
                                <!-- QR Code exists -->
                                <div class="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                                    <img 
                                        src="${motor.qrCode.qr_image_path}" 
                                        alt="Motor QR Code"
                                        class="w-full h-auto"
                                        onerror="this.parentElement.innerHTML='<div class=\\'p-8 text-center text-gray-400\\'>QR görsel yüklenemedi<br><small>${motor.qrCode.qr_image_path}</small></div>'"
                                    />
                                </div>

                                <a 
                                    href="/api/motors/${motor.id}/qr/download" 
                                    download="motor-qr-${motor.chassis_number}.png"
                                    target="_blank"
                                    class="btn-primary w-full block text-center">
                                    <i class="fas fa-download mr-2"></i>
                                    QR Kodu İndir
                                </a>
                            ` : `
                                <!-- No QR Code -->
                                <div class="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200 mb-4 text-center">
                                    <i class="fas fa-qrcode text-6xl text-yellow-400 mb-4"></i>
                                    <p class="text-yellow-800 font-semibold mb-2">QR Kod Yok</p>
                                    <p class="text-sm text-yellow-700">Bu motor için QR kod oluşturulmamış</p>
                                </div>
                            `}

                            <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p class="text-sm text-blue-800">
                                    <i class="fas fa-info-circle mr-2"></i>
                                    QR kodları motor oluşturulurken otomatik oluşturulur.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderServices: () => {
        if (!MotorDetailComponent.services || MotorDetailComponent.services.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="fas fa-tools text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">Henüz servis kaydı bulunmuyor</p>
                </div>
            `;
        }

        const user = Storage.getUser();
        const isAdmin = user && user.role === 'admin';

        return `
            <div class="space-y-3">
                ${MotorDetailComponent.services.map(service => `
                    <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <div class="flex items-center gap-3 mb-2">
                                    <h3 class="font-semibold text-gray-900 text-lg">${service.service_type}</h3>
                                    <span class="text-sm text-gray-500">
                                        <i class="fas fa-calendar mr-1"></i>
                                        ${new Date(service.service_date).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                
                                ${service.description ? `
                                    <p class="text-sm text-gray-600 mb-2">${service.description}</p>
                                ` : ''}
                                
                                <div class="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                                    ${service.technician ? `
                                        <span><i class="fas fa-user mr-1"></i>${service.technician}</span>
                                    ` : ''}
                                    ${service.cost ? `
                                        <span><i class="fas fa-lira-sign mr-1"></i>${service.cost} TL</span>
                                    ` : ''}
                                    ${service.next_service_date ? `
                                        <span><i class="fas fa-clock mr-1"></i>Sonraki: ${new Date(service.next_service_date).toLocaleDateString('tr-TR')}</span>
                                    ` : ''}
                                </div>

                                ${service.parts_replaced ? `
                                    <div class="mt-2 text-sm">
                                        <span class="font-medium text-gray-700">Değiştirilen Parçalar:</span>
                                        <span class="text-gray-600"> ${service.parts_replaced}</span>
                                    </div>
                                ` : ''}

                                ${service.attachments && service.attachments.length > 0 ? `
                                    <div class="mt-3 flex flex-wrap gap-2">
                                        ${service.attachments.map(att => `
                                            <a href="${att.file_path}" 
                                               target="_blank"
                                               class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100">
                                                <i class="fas fa-paperclip"></i>
                                                ${att.file_name}
                                            </a>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                ${service.notes ? `
                                    <div class="mt-2">
                                        <span class="text-sm font-medium text-gray-700">Notlar:</span>
                                        <p class="text-sm text-gray-600 mt-1">${service.notes}</p>
                                    </div>
                                ` : ''}
                            </div>

                            <div class="flex gap-2">
                                <button class="text-blue-600 hover:text-blue-700" onclick="MotorDetailComponent.printServiceReport('${service.id}')">
                                    <i class="fas fa-print"></i>
                                </button>
                                ${Permissions.canEditService() ? `
                                    <button class="text-yellow-600 hover:text-yellow-700">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                ` : ''}
                                ${Permissions.canDeleteService() ? `
                                    <button class="text-red-600 hover:text-red-700" onclick="MotorDetailComponent.deleteService('${service.id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    copyToClipboard: (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Panoya kopyalandı', 'success');
        }).catch(() => {
            showToast('Kopyalama başarısız', 'error');
        });
    },

    printQR: () => {
        const motor = MotorDetailComponent.motor;
        if (!motor) return;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>QR Kod - ${motor.chassis_number}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        background: white;
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    
                    .qr-container {
                        text-align: center;
                        padding: 20px;
                        border: 2px solid #333;
                    }
                    
                    h2 {
                        margin-bottom: 15px;
                        color: #333;
                    }
                    
                    img {
                        max-width: 300px;
                        width: 100%;
                        height: auto;
                        margin: 20px 0;
                    }
                    
                    .info {
                        margin-top: 15px;
                        font-size: 14px;
                        color: #666;
                    }
                    
                    @media print {
                        body { 
                            padding: 0;
                            margin: 0;
                        }
                        .qr-container {
                            border: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="qr-container">
                    <h2>${motor.model}</h2>
                    <img src="/api/motors/${motor.id}/qr/download" 
                         alt="QR Code" 
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><text x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22>QR Yüklenemedi</text></svg>'" />
                    <div class="info">
                        <p><strong>Şase No:</strong> ${motor.chassis_number}</p>
                        <p><strong>Motor No:</strong> ${motor.engine_number}</p>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    },

    generateQR: async (motorId) => {
        if (!confirm('Bu motor için QR kod oluşturulsun mu?\n\nNot: Eğer QR kod mevcutsa silinip yeniden oluşturulacaktır.')) {
            return;
        }

        showLoading();

        try {
            const response = await API.motors.generateQR(motorId);

            hideLoading();

            if (response.success) {
                showToast(response.message || 'QR kod başarıyla oluşturuldu!', 'success');
                // Reload the page to show the new QR code
                setTimeout(() => {
                    App.navigate('motor-detail', motorId);
                }, 1000);
            } else {
                showToast(response.message || 'QR kod oluşturulamadı', 'error');
            }
        } catch (error) {
            hideLoading();
            showToast('Hata oluştu: ' + error.message, 'error');
        }
    },

    printServiceReport: (serviceId) => {
        const reportUrl = API.services.getServiceReport(serviceId);
        window.open(reportUrl, '_blank');
    },

    deleteService: async (serviceId) => {
        if (!confirm('Bu servis kaydını silmek istediğinizden emin misiniz?')) {
            return;
        }

        showLoading();
        try {
            await API.services.delete(serviceId);
            hideLoading();
            showToast('Servis kaydı silindi', 'success');

            // Reload page
            setTimeout(() => {
                App.navigate('motor-detail', MotorDetailComponent.motor.id);
            }, 500);
        } catch (error) {
            hideLoading();
            showToast('Hata: ' + error.message, 'error');
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
