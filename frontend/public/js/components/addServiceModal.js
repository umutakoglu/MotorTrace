// Add Service Modal Component
const AddServiceModal = {
    motorId: null,
    isOpen: false,

    open: (motorId) => {
        AddServiceModal.motorId = motorId;
        AddServiceModal.isOpen = true;
        AddServiceModal.render();
    },

    close: () => {
        AddServiceModal.isOpen = false;
        const modal = document.getElementById('add-service-modal');
        if (modal) {
            modal.remove();
        }
    },

    render: () => {
        // Remove existing modal if any
        const existingModal = document.getElementById('add-service-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="add-service-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-xl">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl font-bold text-white">
                                <i class="fas fa-tools mr-2"></i>
                                Yeni Servis Ekle
                            </h2>
                            <button onclick="AddServiceModal.close()" class="text-white hover:text-gray-200">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Form -->
                    <form id="add-service-form" class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Service Date -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Servis Tarihi <span class="text-red-500">*</span>
                                </label>
                                <input 
                                    type="date" 
                                    name="service_date" 
                                    required
                                    value="${new Date().toISOString().split('T')[0]}"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <!-- Service Type -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Servis Tipi <span class="text-red-500">*</span>
                                </label>
                                <select 
                                    name="service_type" 
                                    id="service-type-select"
                                    required
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Yükleniyor...</option>
                                </select>
                            </div>

                            <!-- Technician -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Teknisyen
                                </label>
                                <select 
                                    name="technician" 
                                    id="technician-select"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Yükleniyor...</option>
                                </select>
                            </div>

                            <!-- Cost -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Maliyet (TL)
                                </label>
                                <input 
                                    type="number" 
                                    name="cost" 
                                    step="0.01"
                                    placeholder="0.00"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <!-- Next Service Date -->
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Sonraki Servis Tarihi
                                </label>
                                <input 
                                    type="date" 
                                    name="next_service_date" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <!-- Description -->
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Açıklama
                                </label>
                                <textarea 
                                    name="description" 
                                    rows="2"
                                    placeholder="Servis detayları..."
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            <!-- Parts Replaced -->
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Değiştirilen Parçalar
                                </label>
                                <textarea 
                                    name="parts_replaced" 
                                    rows="2"
                                    placeholder="Değiştirilen parçalar listesi..."
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            <!-- Notes -->
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    Notlar
                                </label>
                                <textarea 
                                    name="notes" 
                                    rows="2"
                                    placeholder="Ek notlar..."
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>

                            <!-- File Upload -->
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    <i class="fas fa-paperclip mr-1"></i>
                                    Dosya Ekle (Opsiyonel)
                                </label>
                                <input 
                                    type="file" 
                                    id="service-attachment"
                                    accept="image/*,.pdf,.doc,.docx"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p class="text-sm text-gray-500 mt-1">
                                    Desteklenen formatlar: JPG, PNG, PDF, DOC (Maks. 10MB)
                                </p>
                            </div>
                        </div>

                        <!-- Form Actions -->
                        <div class="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                            <button 
                                type="button" 
                                onclick="AddServiceModal.close()" 
                                class="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                İptal
                            </button>
                            <button 
                                type="submit" 
                                class="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                                <i class="fas fa-save mr-2"></i>
                                Kaydet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        AddServiceModal.attachEventListeners();
    },

    attachEventListeners: () => {
        const form = document.getElementById('add-service-form');
        if (form) {
            form.addEventListener('submit', AddServiceModal.handleSubmit);
        }

        // Load service types and technicians
        AddServiceModal.loadServiceTypes();
        AddServiceModal.loadTechnicians();

        // Close on background click
        const modal = document.getElementById('add-service-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'add-service-modal') {
                    AddServiceModal.close();
                }
            });
        }
    },

    loadServiceTypes: async () => {
        try {
            const response = await API.serviceTypes.getAll();
            const select = document.getElementById('service-type-select');
            
            if (select && response.data) {
                select.innerHTML = '<option value="">Seçiniz</option>' +
                    response.data.map(type => `<option value="${type.name}">${type.name}</option>`).join('');
            }
        } catch (error) {
            console.error('Service types load error:', error);
        }
    },

    loadTechnicians: async () => {
        try {
            // Fetch all users and filter technicians client-side
            const response = await API.users.getAll();
            const select = document.getElementById('technician-select');
            
            if (select && response.data) {
                // Filter users with technician role
                const technicians = response.data.filter(user => user.role === 'technician');
                
                select.innerHTML = '<option value="">Seçiniz (Opsiyonel)</option>' +
                    technicians.map(tech => `<option value="${tech.username}">${tech.username}</option>`).join('');
            }
        } catch (error) {
            console.error('Technicians load error:', error);
        }
    },

    handleSubmit: async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        
        // Convert FormData to object
        const serviceData = {};
        formData.forEach((value, key) => {
            if (key !== 'file' && value) {
                serviceData[key] = value;
            }
        });

        showLoading();

        try {
            // Create service
            const response = await API.services.create(AddServiceModal.motorId, serviceData);
            
            if (response.success) {
                const serviceId = response.data.id;
                
                // Upload attachment if provided
                const fileInput = document. getElementById('service-attachment');
                if (fileInput && fileInput.files.length > 0) {
                    const attachmentFormData = new FormData();
                    attachmentFormData.append('file', fileInput.files[0]);
                    
                    try {
                        await API.services.uploadAttachment(serviceId, attachmentFormData);
                    } catch (error) {
                        console.error('Attachment upload failed:', error);
                        showToast('Servis kaydedildi ama dosya yüklenemedi', 'warning');
                    }
                }
                
                hideLoading();
                showToast('Servis başarıyla eklendi', 'success');
                AddServiceModal.close();
                
                // Reload motor detail page
                setTimeout(() => {
                    App.navigate('motor-detail', AddServiceModal.motorId);
                }, 500);
            } else {
                hideLoading();
                showToast(response.message || 'Servis eklenemedi', 'error');
            }
        } catch (error) {
            hideLoading();
            showToast('Hata: ' + error.message, 'error');
        }
    }
};
