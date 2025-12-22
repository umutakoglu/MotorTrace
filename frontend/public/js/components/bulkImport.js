// Bulk Import Component - Excel upload for motors
const BulkImportComponent = {
    render: () => {
        const user = Storage.getUser();
        const isAdmin = user && user.role === 'admin';

        if (!isAdmin) {
            return `
                <div class="min-h-screen p-8">
                    <div class="glass-dark rounded-xl p-8 text-center">
                        <i class="fas fa-lock text-6xl text-gray-300 mb-4"></i>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Yetki Gerekli</h2>
                        <p class="text-gray-600">Bu özellik sadece admin kullanıcıları için erişilebilir.</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="min-h-screen p-4 md:p-8">
                <!-- Header -->
                ${Header.render({
            title: 'Toplu Motor Ekleme',
            subtitle: 'Excel dosyası ile birden fazla motor ekleyin',
            backButton: { onclick: "App.navigate('motors')" },
            actions: ``  // Template download moved inside the upload card for better UX
        })}

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Instructions Card -->
                    <div class="glass-dark rounded-xl p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-4">
                            <i class="fas fa-info-circle text-blue-500 mr-2"></i>
                            Nasıl Kullanılır?
                        </h2>
                        
                        <div class="space-y-4">
                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                <div>
                                    <h3 class="font-semibold text-gray-900 mb-1">Excel Şablonunu İndirin</h3>
                                    <p class="text-sm text-gray-600">Önce Excel şablonunu indirin ve açın.</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                <div>
                                    <h3 class="font-semibold text-gray-900 mb-1">Motor Bilgilerini Doldurun</h3>
                                    <p class="text-sm text-gray-600">Her satıra bir motor bilgisi girin. Şablon satırı silebilirsiniz.</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                <div>
                                    <h3 class="font-semibold text-gray-900 mb-1">Dosyayı Yükleyin</h3>
                                    <p class="text-sm text-gray-600">Doldurduğunuz Excel dosyasını sisteme yükleyin.</p>
                                </div>
                            </div>

                            <div class="flex items-start gap-3">
                                <div class="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">✓</div>
                                <div>
                                    <h3 class="font-semibold text-gray-900 mb-1">Otomatik İşlem</h3>
                                    <p class="text-sm text-gray-600">Motorlar ve QR kodları otomatik oluşturulacak!</p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p class="text-sm text-yellow-800">
                                <i class="fas fa-exclamation-triangle mr-2"></i>
                                <strong>Önemli:</strong> Şase ve motor numaraları benzersiz olmalıdır.
                            </p>
                        </div>
                    </div>

                    <!-- Upload Card -->
                    <div class="glass-dark rounded-xl p-6">
                        <h2 class="text-2xl font-bold text-gray-900 mb-6">
                            <i class="fas fa-upload text-blue-500 mr-2"></i>
                            Dosya Yükle
                        </h2>

                        <!-- Download Template Button -->
                        <a 
                            href="${API_BASE_URL}/bulk-import/template" 
                            download="motor-import-template.xlsx"
                            class="btn-primary w-full mb-6 inline-block text-center">
                            <i class="fas fa-download mr-2"></i>
                            Excel Şablonunu İndir
                        </a>

                        <!-- File Upload Area -->
                        <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer" 
                             id="upload-zone"
                             onclick="document.getElementById('file-input').click()">
                            <i class="fas fa-file-excel text-6xl text-gray-300 mb-4"></i>
                            <p class="text-gray-600 mb-2">Excel dosyasını sürükleyin veya tıklayın</p>
                            <p class="text-sm text-gray-500">.xlsx veya .xls formatında</p>
                            <input 
                                type="file" 
                                id="file-input" 
                                accept=".xlsx,.xls" 
                                class="hidden"
                                onchange="BulkImportComponent.handleFileSelect(event)" />
                        </div>

                        <!-- Selected File -->
                        <div id="selected-file" class="hidden mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <i class="fas fa-file-excel text-blue-500 text-2xl"></i>
                                    <div>
                                        <p id="file-name" class="font-semibold text-gray-900"></p>
                                        <p id="file-size" class="text-sm text-gray-600"></p>
                                    </div>
                                </div>
                                <button onclick="BulkImportComponent.clearFile()" class="text-red-500 hover:text-red-600">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Upload Button -->
                        <button 
                            id="upload-button"
                            onclick="BulkImportComponent.uploadFile()"
                            class="btn-primary w-full mt-4 hidden">
                            <i class="fas fa-cloud-upload mr-2"></i>
                            Yükle ve İşle
                        </button>

                        <!-- Progress -->
                        <div id="upload-progress" class="hidden mt-4">
                            <div class="bg-gray-200 rounded-full h-2">
                                <div id="progress-bar" class="bg-blue-500 h-2 rounded-full transition-all" style="width: 0%"></div>
                            </div>
                            <p id="progress-text" class="text-sm text-gray-600 mt-2 text-center"></p>
                        </div>

                        <!-- Results -->
                        <div id="upload-results" class="hidden mt-6"></div>
                    </div>
                </div>
            </div>
        `;
    },

    selectedFile: null,

    handleFileSelect: (event) => {
        const file = event.target.files[0];
        if (!file) return;

        BulkImportComponent.selectedFile = file;

        // Show file info
        document.getElementById('file-name').textContent = file.name;
        document.getElementById('file-size').textContent = `${(file.size / 1024).toFixed(2)} KB`;
        document.getElementById('selected-file').classList.remove('hidden');
        document.getElementById('upload-button').classList.remove('hidden');
    },

    clearFile: () => {
        BulkImportComponent.selectedFile = null;
        document.getElementById('file-input').value = '';
        document.getElementById('selected-file').classList.add('hidden');
        document.getElementById('upload-button').classList.add('hidden');
        document.getElementById('upload-results').classList.add('hidden');
    },

    uploadFile: async () => {
        if (!BulkImportComponent.selectedFile) return;

        const formData = new FormData();
        formData.append('file', BulkImportComponent.selectedFile);

        // Show progress
        document.getElementById('upload-progress').classList.remove('hidden');
        document.getElementById('progress-bar').style.width = '30%';
        document.getElementById('progress-text').textContent = 'Dosya yükleniyor...';

        try {
            const token = Storage.getToken();
            const response = await fetch(`${API_BASE_URL}/bulk-import/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            document.getElementById('progress-bar').style.width = '70%';
            document.getElementById('progress-text').textContent = 'İşleniyor...';

            const data = await response.json();

            document.getElementById('progress-bar').style.width = '100%';
            document.getElementById('progress-text').textContent = 'Tamamlandı!';

            setTimeout(() => {
                document.getElementById('upload-progress').classList.add('hidden');
                document.getElementById('progress-bar').style.width = '0%';
                BulkImportComponent.showResults(data, response.ok);
            }, 1000);

        } catch (error) {
            document.getElementById('upload-progress').classList.add('hidden');
            showToast('Yükleme başarısız: ' + error.message, 'error');
        }
    },

    showResults: (data, success) => {
        const resultsDiv = document.getElementById('upload-results');

        if (success && data.summary) {
            resultsDiv.innerHTML = `
                <div class="p-6 bg-green-50 border border-green-200 rounded-lg">
                    <h3 class="text-lg font-bold text-green-900 mb-4">
                        <i class="fas fa-check-circle mr-2"></i>
                        Toplu Ekleme Başarılı!
                    </h3>
                    <div class="grid grid-cols-3 gap-4 mb-4">
                        <div class="text-center">
                            <p class="text-2xl font-bold text-green-600">${data.summary.successful}</p>
                            <p class="text-sm text-gray-600">Başarılı</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-red-600">${data.summary.failed}</p>
                            <p class="text-sm text-gray-600">Hatalı</p>
                        </div>
                        <div class="text-center">
                            <p class="text-2xl font-bold text-blue-600">${data.summary.totalProcessed}</p>
                            <p class="text-sm text-gray-600">Toplam</p>
                        </div>
                    </div>
                    ${data.summary.successful > 0 ? `
                        <button onclick="App.navigate('motors')" class="btn-primary w-full mt-4">
                            <i class="fas fa-list mr-2"></i>
                            Motor Listesine Git
                        </button>
                    ` : ''}
                </div>
            `;

            if (data.summary.successful > 0) {
                showToast(`${data.summary.successful} motor başarıyla eklendi!`, 'success');
            }

        } else {
            resultsDiv.innerHTML = `
                <div class="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h3 class="text-lg font-bold text-red-900 mb-2">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        Hata Oluştu
                    </h3>
                    <p class="text-red-700">${data.message || 'Bilinmeyen hata'}</p>
                    ${data.errors && data.errors.length > 0 ? `
                        <div class="mt-4 max-h-48 overflow-y-auto">
                            <p class="text-sm font-semibold text-red-900 mb-2">Hatalar:</p>
                            ${data.errors.map(err => `
                                <p class="text-sm text-red-700">
                                    ${err.row ? `Satır ${err.row}: ` : ''}
                                    ${err.errors ? err.errors.join(', ') : err.error}
                                </p>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
            showToast('Toplu ekleme başarısız', 'error');
        }

        resultsDiv.classList.remove('hidden');
        BulkImportComponent.clearFile();
    }
};
