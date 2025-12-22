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

        // Prepare Header Configuration
        const headerActions = `
            ${Permissions.canEditMotor() ? `
                <button onclick="App.navigate('motor-edit', '${motor.id}')" class="btn-primary">
                    <i class="fas fa-edit md:mr-2"></i>
                    <span class="hidden md:inline">Düzenle</span>
                </button>
            ` : ''}
            ${Permissions.canDeleteMotor() ? `
                <button onclick="MotorDetailComponent.deleteMotor('${motor.id}')" class="btn-danger">
                    <i class="fas fa-trash md:mr-2"></i>
                    <span class="hidden md:inline">Sil</span>
                </button>
            ` : ''}
        `;

        const headerHtml = Header.render({
            title: motor.model,
            subtitle: 'Motor Detayları',
            backButton: { onclick: "App.navigate('motors')" },
            actions: headerActions
        });

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                ${headerHtml}

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Left Column - Motor Info -->
                    <div class="lg:col-span-1 space-y-6">
                        <!-- Main Info Card -->
                        <div class="glass-dark rounded-xl p-6">
                            <div class="flex justify-between items-start mb-6">
                                <div>
                                    <span class="status-badge status-${motor.status} mb-2 inline-block">
                                        ${MotorListComponent.getStatusText(motor.status)}
                                    </span>
                                    <h2 class="text-2xl font-bold text-gray-900">${motor.model}</h2>
                                    <p class="text-gray-600">${motor.manufacturer}</p>
                                </div>
                                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                    <i class="fas fa-motorcycle text-3xl text-gray-400"></i>
                                </div>
                            </div>

                            <div class="space-y-4">
                                <div class="p-3 bg-gray-50/50 rounded-lg">
                                    <p class="text-xs text-gray-500 mb-1">Şase Numarası</p>
                                    <p class="font-mono font-medium text-gray-900 break-all select-all">${motor.chassis_number}</p>
                                </div>
                                <div class="p-3 bg-gray-50/50 rounded-lg">
                                    <p class="text-xs text-gray-500 mb-1">Motor Numarası</p>
                                    <p class="font-mono font-medium text-gray-900 break-all select-all">${motor.engine_number}</p>
                                </div>
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="p-3 bg-gray-50/50 rounded-lg">
                                        <p class="text-xs text-gray-500 mb-1">Yıl</p>
                                        <p class="font-medium text-gray-900">${motor.year}</p>
                                    </div>
                                    <div class="p-3 bg-gray-50/50 rounded-lg">
                                        <p class="text-xs text-gray-500 mb-1">Renk</p>
                                        <p class="font-medium text-gray-900 flex items-center gap-2">
                                            <span class="w-3 h-3 rounded-full border border-gray-200" style="background-color: ${MotorDetailComponent.getColorCode(motor.color)}"></span>
                                            ${motor.color}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- QR Code Card -->
                        <div class="glass-dark rounded-xl p-6">
                            <h3 class="font-bold text-gray-900 mb-4">QR Kod</h3>
                            <div class="flex flex-col items-center">
                                <div class="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-4">
                                    <img 
                                        src="${API_BASE_URL}/motors/${motor.id}/qr/download" 
                                        alt="QR Code" 
                                        class="w-48 h-48 object-contain"
                                        id="qr-image-${motor.id}"
                                        onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNmI3MjgwIj5RUiBZdWtsZW5peW9yPC90ZXh0Pjwvc3ZnPg=='; API.motors.downloadQR('${motor.id}').then(res => res.blob()).then(blob => { this.src = URL.createObjectURL(blob); })"
                                    >
                                </div>
                                <div class="flex gap-2 w-full">
                                    <button onclick="MotorListComponent.printQR('${motor.id}', '${motor.model}', '${motor.chassis_number}', '${motor.engine_number}', '${motor.year}')" class="btn-primary flex-1 text-sm">
                                        <i class="fas fa-print mr-2"></i>
                                        Yazdır
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Notes Card -->
                        ${motor.notes ? `
                            <div class="glass-dark rounded-xl p-6">
                                <h3 class="font-bold text-gray-900 mb-3">Notlar</h3>
                                <p class="text-gray-600 text-sm whitespace-pre-wrap">${motor.notes}</p>
                            </div>
                        ` : ''}
                        
                         <!-- Metadata Card -->
                        <div class="glass-dark rounded-xl p-6">
                            <h3 class="font-bold text-gray-900 mb-3">Kayıt Bilgileri</h3>
                            <div class="space-y-3 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Oluşturan</span>
                                    <span class="text-gray-900 font-medium">${motor.username || 'Sistem'}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Oluşturulma</span>
                                    <span class="text-gray-900">${new Date(motor.created_at).toLocaleDateString('tr-TR')}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-500">Son Güncelleme</span>
                                    <span class="text-gray-900">${new Date(motor.updated_at).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Right Column - Service History -->
                    <div class="lg:col-span-2">
                         <div class="glass-dark rounded-xl p-6">
                            <div class="flex items-center justify-between mb-6">
                                <h3 class="font-bold text-gray-900 text-lg">Servis Geçmişi</h3>
                                ${Permissions.canAddService() ? `
                                    <button onclick="AddServiceModal.open('${motor.id}')" class="btn-secondary text-sm">
                                        <i class="fas fa-plus mr-2"></i>
                                        Servis Ekle
                                    </button>
                                ` : ''}
                            </div>

                            ${MotorDetailComponent.services.length > 0 ? `
                                <div class="space-y-4">
                                    ${MotorDetailComponent.services.map(service => `
                                        <div class="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
                                            <div class="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 class="font-bold text-gray-900">${service.service_type_name}</h4>
                                                    <p class="text-sm text-gray-500">
                                                        ${new Date(service.service_date).toLocaleDateString('tr-TR')} • 
                                                        ${service.technician_name || 'Teknisyen Atanmamış'}
                                                    </p>
                                                </div>
                                                <span class="px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                    ${service.current_km} KM
                                                </span>
                                            </div>
                                            
                                            ${service.description ? `
                                                <p class="text-gray-600 text-sm mb-3">${service.description}</p>
                                            ` : ''}

                                            ${service.parts_changed ? `
                                                <div class="text-xs bg-gray-50 p-2 rounded">
                                                    <span class="font-medium text-gray-700">Değişen Parçalar:</span>
                                                    <span class="text-gray-600">${service.parts_changed}</span>
                                                </div>
                                            ` : ''}
                                            
                                            ${service.cost > 0 ? `
                                                <div class="mt-2 text-right">
                                                    <span class="text-sm font-bold text-gray-900">${service.cost} ₺</span>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : `
                                <div class="text-center py-8">
                                    <div class="bg-gray-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                                        <i class="fas fa-tools text-gray-400"></i>
                                    </div>
                                    <p class="text-gray-500 text-sm">Henüz servis kaydı bulunmuyor.</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add Service Modal Placeholder -->
            <div id="add-service-modal-container"></div>
        `;
    },

    deleteMotor: async (id) => {
        if (!confirm('Bu motoru silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) return;

        try {
            await API.motors.delete(id);
            showToast('Motor başarıyla silindi', 'success');
            App.navigate('motors');
        } catch (error) {
            showToast('Silme işlemi başarısız', 'error');
        }
    },

    getColorCode: (colorName) => {
        const colors = {
            'Beyaz': '#ffffff',
            'Siyah': '#000000',
            'Gri': '#808080',
            'Gümüş': '#c0c0c0',
            'Kırmızı': '#ff0000',
            'Mavi': '#0000ff',
            'Yeşil': '#008000',
            'Sarı': '#ffff00',
            'Turuncu': '#ffa500',
            'Kahverengi': '#a52a2a'
        };
        return colors[colorName] || '#cccccc';
    }
};
