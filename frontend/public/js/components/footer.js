// Footer Component - Version & Copyright Display
const Footer = {
    year: new Date().getFullYear(),

    render: () => {
        return `
            <footer class="app-footer">
                <div class="footer-content">
                    <div class="footer-left">
                        <span class="app-name">MotorTrace</span>
                        <span class="version-badge">v${APP_VERSION}</span>
                    </div>
                    <div class="footer-center">
                        <p class="copyright">© ${Footer.year} MotorTrace. Tüm hakları saklıdır.</p>
                    </div>
                    <div class="footer-right">
                        <a href="#" class="footer-link" onclick="Footer.showAbout(event)">
                            <i class="fas fa-info-circle"></i> Hakkında
                        </a>
                    </div>
                </div>
            </footer>
        `;
    },

    showAbout: (event) => {
        event.preventDefault();
        const modal = `
            <div class="modal-overlay" onclick="this.remove()">
                <div class="modal-content about-modal" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h2><i class="fas fa-motorcycle"></i> MotorTrace v${APP_VERSION}</h2>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Motor Takip ve Yönetim Sistemi</strong></p>
                        <p>MotorTrace, motorlu araçların takibi, servis kayıtları ve QR kod tabanlı izleme için geliştirilmiş profesyonel bir sistemdir.</p>
                        <hr>
                        <p><strong>Versiyon:</strong> ${APP_VERSION}</p>
                        <p><strong>Telif Hakkı:</strong> © ${Footer.year} MotorTrace</p>
                        <p><strong>Lisans:</strong> Tüm hakları saklıdır</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Kapat</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modal);
    },

    init: () => {
        // Find footer container and render footer
        const footerContainer = document.getElementById('footer-container');
        if (footerContainer) {
            footerContainer.innerHTML = Footer.render();
        }
    }
};

// Export for use in other modules
window.Footer = Footer;
