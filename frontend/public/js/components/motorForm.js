// Motor Form Component - Add/Edit Motor
const MotorFormComponent = {
    motorId: null,
    motor: null,

    render: async (id = null) => {
        MotorFormComponent.motorId = id;
        const isEditMode = !!id;

        // If edit mode, fetch motor data
        if (isEditMode) {
            try {
                const response = await API.motors.getById(id);
                MotorFormComponent.motor = response.data;
            } catch (error) {
                showToast('Motor yüklenemedi', 'error');
                App.navigate('motors');
                return '';
            }
        }

        const motor = MotorFormComponent.motor || {};

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h1 class="text-4xl font-bold text-black mb-2">
                                ${isEditMode ? 'Motor Düzenle' : 'Yeni Motor Ekle'}
                            </h1>
                            <p class="text-gray-600">
                                ${isEditMode ? 'Motor bilgilerini güncelleyin' : 'Sisteme yeni motor ekleyin'}
                            </p>
                        </div>
                        <button onclick="App.navigate('motors')" class="btn-secondary">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Geri Dön
                        </button>
                    </div>
                </div>

                <!-- Form -->
                <div class="max-w-4xl mx-auto">
                    <form id="motor-form" class="glass-dark rounded-xl p-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Chassis Number -->
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Şase Numarası <span class="text-red-400">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="chassis_number" 
                                    class="input-field"
                                    placeholder="ABC123XYZ456"
                                    value="${motor.chassis_number || ''}"
                                    required
                                />
                            </div>

                            <!-- Engine Number -->
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Motor Numarası <span class="text-red-400">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="engine_number" 
                                    class="input-field"
                                    placeholder="ENG789DEF012"
                                    value="${motor.engine_number || ''}"
                                    required
                                />
                            </div>

                            <!-- Model -->
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Model <span class="text-red-400">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="model" 
                                    class="input-field"
                                    placeholder="Honda CBR500R"
                                    value="${motor.model || ''}"
                                    required
                                />
                            </div>

                            <!-- Year -->
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Yıl <span class="text-red-400">*</span>
                                </label>
                                <input 
                                    type="number" 
                                    name="year" 
                                    class="input-field"
                                    placeholder="2024"
                                    min="1900"
                                    max="${new Date().getFullYear() + 1}"
                                    value="${motor.year || ''}"
                                    required
                                />
                            </div>

                            <!-- Color -->
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Renk <span class="text-red-400">*</span>
                                </label>
                                <select 
                                    name="color" 
                                    class="input-field"
                                    required
                                >
                                    <option value="">Renk Seçiniz</option>
                                    <option value="Beyaz" ${motor.color === 'Beyaz' ? 'selected' : ''}>Beyaz</option>
                                    <option value="Siyah" ${motor.color === 'Siyah' ? 'selected' : ''}>Siyah</option>
                                    <option value="Gri" ${motor.color === 'Gri' ? 'selected' : ''}>Gri</option>
                                    <option value="Gümüş" ${motor.color === 'Gümüş' ? 'selected' : ''}>Gümüş</option>
                                    <option value="Kırmızı" ${motor.color === 'Kırmızı' ? 'selected' : ''}>Kırmızı</option>
                                    <option value="Mavi" ${motor.color === 'Mavi' ? 'selected' : ''}>Mavi</option>
                                    <option value="Yeşil" ${motor.color === 'Yeşil' ? 'selected' : ''}>Yeşil</option>
                                    <option value="Sarı" ${motor.color === 'Sarı' ? 'selected' : ''}>Sarı</option>
                                    <option value="Turuncu" ${motor.color === 'Turuncu' ? 'selected' : ''}>Turuncu</option>
                                    <option value="Kahverengi" ${motor.color === 'Kahverengi' ? 'selected' : ''}>Kahverengi</option>
                                </select>
                            </div>

                            <!-- Manufacturer -->
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Üretici
                                </label>
                                <input 
                                    type="text" 
                                    name="manufacturer" 
                                    class="input-field"
                                    placeholder="Honda, Yamaha, Kawasaki..."
                                    value="${motor.manufacturer || ''}"
                                />
                            </div>

                            <!-- Status -->
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Durum <span class="text-red-400">*</span>
                                </label>
                                <select name="status" class="input-field" required>
                                    <option value="in_stock" ${motor.status === 'in_stock' ? 'selected' : ''}>Stokta</option>
                                    <option value="sold" ${motor.status === 'sold' ? 'selected' : ''}>Satıldı</option>
                                    <option value="in_service" ${motor.status === 'in_service' ? 'selected' : ''}>Serviste</option>
                                    <option value="scrapped" ${motor.status === 'scrapped' ? 'selected' : ''}>Hurdaya Çıktı</option>
                                </select>
                            </div>

                            <!-- Notes -->
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-600 mb-2">
                                    Notlar
                                </label>
                                <textarea 
                                    name="notes" 
                                    class="input-field min-h-[120px]"
                                    placeholder="Ek bilgiler, özel notlar..."
                                >${motor.notes || ''}</textarea>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-white/10">
                            <button type="submit" class="btn-primary flex-1">
                                <i class="fas fa-save mr-2"></i>
                                ${isEditMode ? 'Güncelle' : 'Kaydet'}
                            </button>
                            <button type="button" onclick="App.navigate('motors')" class="btn-secondary flex-1">
                                <i class="fas fa-times mr-2"></i>
                                İptal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    setupEventListeners: () => {
        const form = document.getElementById('motor-form');
        if (!form) return;

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await MotorFormComponent.handleSubmit(e.target);
        });
    },

    handleSubmit: async (form) => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Convert year to number
        data.year = parseInt(data.year);

        try {
            if (MotorFormComponent.motorId) {
                // Update existing motor
                await API.motors.update(MotorFormComponent.motorId, data);
                showToast('Motor başarıyla güncellendi', 'success');
            } else {
                // Create new motor
                await API.motors.create(data);
                showToast('Motor başarıyla eklendi', 'success');
            }

            // Redirect to motor list
            setTimeout(() => {
                App.navigate('motors');
            }, 1000);

        } catch (error) {
            showToast(error.message || 'İşlem başarısız oldu', 'error');
        }
    }
};
