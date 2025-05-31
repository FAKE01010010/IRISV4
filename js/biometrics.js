/**
 * IRIS V4 - Módulo de Datos Biométricos
 * Maneja la importación, validación y procesamiento de datos biométricos extendidos
 */

// Configuración del módulo
const BIOMETRICS_CONFIG = {
    storageKey: 'biometrics',
    validColumns: ['date', 'weight', 'bodyFat', 'muscleMass', 'bmi'],
    dateFormat: 'YYYY-MM-DD'
};

/**
 * Estructura de datos para métricas biométricas
 * Preparada para futura integración con APIs externas
 */
class BiometricData {
    constructor(date) {
        this.date = date;
        this.metrics = new Map();
        this.source = 'manual'; // 'manual', 'csv', 'googleFit', 'bluetooth'
    }

    setMetric(name, value) {
        this.metrics.set(name, {
            value: value,
            timestamp: Date.now(),
            source: this.source
        });
    }

    getMetric(name) {
        return this.metrics.get(name)?.value;
    }
}

/**
 * Valida y procesa un archivo CSV
 * @param {File} file - Archivo CSV a procesar
 * @returns {Promise<BiometricData[]>}
 */
export async function processCSVFile(file) {
    try {
        const text = await file.text();
        const rows = text.split('\n').map(row => row.split(','));
        const headers = rows[0].map(h => h.trim().toLowerCase());

        // Validar columnas requeridas
        if (!validateHeaders(headers)) {
            throw new Error('INVALID_CSV_FORMAT');
        }

        const data = [];
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length !== headers.length) continue;

            const biometricData = new BiometricData(row[headers.indexOf('date')]);
            headers.forEach((header, index) => {
                if (header !== 'date') {
                    biometricData.setMetric(header, parseFloat(row[index]));
                }
            });
            data.push(biometricData);
        }

        return data;
    } catch (error) {
        console.error('Error processing CSV:', error);
        throw error;
    }
}

/**
 * Valida los encabezados del CSV
 * @param {string[]} headers - Lista de encabezados
 * @returns {boolean}
 */
function validateHeaders(headers) {
    return BIOMETRICS_CONFIG.validColumns.every(col => 
        headers.includes(col.toLowerCase())
    );
}

/**
 * Calcula estadísticas semanales de grasa corporal
 * @param {BiometricData[]} data - Datos biométricos
 * @returns {number}
 */
export function calculateWeeklyBodyFat(data) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyData = data.filter(d => new Date(d.date) >= weekAgo);
    if (!weeklyData.length) return 0;

    const sum = weeklyData.reduce((acc, d) => 
        acc + (d.getMetric('bodyFat') || 0), 0);
    return (sum / weeklyData.length).toFixed(1);
}

/**
 * Calcula el ratio músculo/grasa
 * @param {BiometricData[]} data - Datos biométricos
 * @returns {number}
 */
export function calculateMuscleFatRatio(data) {
    if (!data.length) return 0;
    const latest = data[data.length - 1];
    const muscle = latest.getMetric('muscleMass') || 0;
    const fat = latest.getMetric('bodyFat') || 0;
    return fat ? (muscle / fat).toFixed(2) : 0;
}

/**
 * Calcula la tendencia del IMC
 * @param {BiometricData[]} data - Datos biométricos
 * @returns {string} - Tendencia (↑, ↓, or →)
 */
export function calculateBMITrend(data) {
    if (data.length < 2) return '→';
    
    const recent = data.slice(-7);
    if (recent.length < 2) return '→';

    const firstBMI = recent[0].getMetric('bmi');
    const lastBMI = recent[recent.length - 1].getMetric('bmi');
    const diff = lastBMI - firstBMI;

    if (Math.abs(diff) < 0.1) return '→';
    return diff > 0 ? '↑' : '↓';
}

/**
 * Guarda los datos biométricos en localStorage
 * @param {BiometricData[]} data - Datos a guardar
 */
export function saveBiometricData(data) {
    const serialized = data.map(d => ({
        date: d.date,
        metrics: Object.fromEntries(d.metrics)
    }));
    localStorage.setItem(BIOMETRICS_CONFIG.storageKey, JSON.stringify(serialized));
}

/**
 * Carga los datos biométricos desde localStorage
 * @returns {BiometricData[]}
 */
export function loadBiometricData() {
    const stored = localStorage.getItem(BIOMETRICS_CONFIG.storageKey);
    if (!stored) return [];

    try {
        const parsed = JSON.parse(stored);
        return parsed.map(item => {
            const data = new BiometricData(item.date);
            Object.entries(item.metrics).forEach(([key, value]) => {
                data.setMetric(key, value);
            });
            return data;
        });
    } catch (error) {
        console.error('Error loading biometric data:', error);
        return [];
    }
}

// Event handlers para importación de archivos
document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        event.preventDefault();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.style.display = 'none';
        input.onchange = async (e) => {
            try {
                const file = e.target.files[0];
                const data = await processCSVFile(file);
                saveBiometricData(data);
                window.dispatchEvent(new CustomEvent('biometricsUpdated'));
            } catch (error) {
                console.error('Import failed:', error);
            }
        };
        document.body.appendChild(input);
        input.click();
        document.body.removeChild(input);
    }
});

// Soporte para drag & drop
document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
        try {
            const data = await processCSVFile(file);
            saveBiometricData(data);
            window.dispatchEvent(new CustomEvent('biometricsUpdated'));
        } catch (error) {
            console.error('Import failed:', error);
        }
    }
}); 