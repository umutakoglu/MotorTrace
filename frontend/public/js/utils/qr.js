// QR Code utilities

const QRUtils = {
    // Initialize QR scanner
    scanner: null,
    
    // Start QR code scanning
    startScanning: (onScanSuccess, onScanError) => {
        const qrReader = document.getElementById('qr-reader');
        const modal = document.getElementById('qr-scanner-modal');
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        if (!QRUtils.scanner) {
            QRUtils.scanner = new Html5Qrcode("qr-reader");
        }
        
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 }
        };
        
        QRUtils.scanner.start(
            { facingMode: "environment" }, // Use back camera
            config,
            (decodedText, decodedResult) => {
                // Extract motor ID from URL
                const motorId = QRUtils.extractMotorId(decodedText);
                if (motorId) {
                    onScanSuccess(motorId);
                    QRUtils.stopScanning();
                }
            },
            (errorMessage) => {
                // Handle scan failure silently
                console.log(errorMessage);
            }
        ).catch((err) => {
            if (onScanError) {
                onScanError(err);
            }
            showToast('Kamera erişimi reddedildi', 'error');
            QRUtils.stopScanning();
        });
    },
    
    // Stop QR code scanning
    stopScanning: () => {
        if (QRUtils.scanner) {
            QRUtils.scanner.stop().then(() => {
                const modal = document.getElementById('qr-scanner-modal');
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }).catch(err => {
                console.error('Error stopping scanner:', err);
            });
        }
    },
    
    // Extract motor ID from QR code URL
    extractMotorId: (qrData) => {
        // Expected format: http://localhost:3000/scan/{motor-id}
        const urlPattern = /\/scan\/([a-f0-9-]+)/i;
        const match = qrData.match(urlPattern);
        return match ? match[1] : null;
    },
    
    // Download QR code
    downloadQR: (motorId, filename = 'qr-code.png') => {
        const downloadUrl = API.motors.downloadQR(motorId);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.click();
    }
};
