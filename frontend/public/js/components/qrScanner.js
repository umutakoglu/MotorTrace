// QR Scanner component
const QRScannerComponent = {
    init: () => {
        const closeBtn = document.getElementById('close-qr-scanner');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                QRUtils.stopScanning();
            });
        }
    }
};
