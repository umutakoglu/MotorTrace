// Header Component
const Header = {
    render: ({ title, subtitle, backButton = null, actions = '' }) => {
        return `
            <div class="mb-8">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-3">
                            ${backButton ? `
                                <button onclick="${backButton.onclick}" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                                    <i class="fas fa-arrow-left text-xl"></i>
                                </button>
                            ` : ''}
                            <h1 class="text-2xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">${title}</h1>
                        </div>
                        ${subtitle ? `<p class="text-gray-600 dark:text-gray-400 mt-1">${subtitle}</p>` : ''}
                    </div>
                    
                    <div class="flex flex-wrap items-center gap-3">
                        ${actions}
                        
                        <div class="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden md:block"></div>
                        
                        <button onclick="Theme.toggle()" class="btn-secondary" title="Tema Değiştir">
                            <i class="fas fa-moon dark:hidden"></i>
                            <i class="fas fa-sun hidden dark:inline"></i>
                        </button>
                        
                        <button onclick="DashboardComponent.logout()" class="btn-secondary text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/50">
                            <i class="fas fa-sign-out-alt md:mr-2"></i>
                            <span class="hidden md:inline">Çıkış</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};
