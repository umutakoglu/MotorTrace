const { promisePool } = require('./config/database');

// Hex to color name mapping
const colorMapping = {
    '#FF0000': 'Kırmızı',
    '#0051FF': 'Mavi',
    '#00FF00': 'Yeşil',
    '#FFD700': 'Altın',
    '#DC143C': 'Crimson Kırmızı',
    '#1E90FF': 'Açık Mavi',
    '#FF4500': 'Turuncu',
    '#000000': 'Siyah',
    '#32CD32': 'Lime Yeşil',
    '#4B0082': 'Indigo'
};

const updateColors = async () => {
    try {
        console.log('🎨 Updating color codes to text names...\n');

        for (const [hex, colorName] of Object.entries(colorMapping)) {
            const [result] = await promisePool.query(
                'UPDATE motors SET color = ? WHERE color = ?',
                [colorName, hex]
            );

            if (result.affectedRows > 0) {
                console.log(`✅ Updated ${result.affectedRows} motor(s): ${hex} → ${colorName}`);
            }
        }

        console.log('\n🎉 Color update completed!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update colors:', error);
        process.exit(1);
    }
};

updateColors();
