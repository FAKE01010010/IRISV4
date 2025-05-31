/**
 * Módulo para manejar la visualización del gráfico de evolución del peso
 */

let weightChart = null;

// Configuración del gráfico
const CHART_CONFIG = {
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 150,
            easing: 'linear'
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#000000',
                titleFont: {
                    family: "'IBM Plex Mono', monospace",
                    size: 12
                },
                bodyFont: {
                    family: "'IBM Plex Mono', monospace",
                    size: 12
                },
                padding: 8,
                borderWidth: 1,
                borderColor: '#ffffff',
                displayColors: false,
                callbacks: {
                    label: function(context) {
                        return `${context.parsed.y.toFixed(2)} kg`;
                    }
                }
            }
        },
        scales: {
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1
                },
                ticks: {
                    color: '#ffffff',
                    font: {
                        family: "'IBM Plex Mono', monospace",
                        size: 10
                    },
                    callback: function(value) {
                        return value.toFixed(1);
                    }
                },
                border: {
                    display: false
                }
            },
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    lineWidth: 1
                },
                ticks: {
                    color: '#ffffff',
                    font: {
                        family: "'IBM Plex Mono', monospace",
                        size: 10
                    }
                },
                border: {
                    display: false
                }
            }
        }
    }
};

// Configuración del dataset
const DATASET_CONFIG = {
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    pointBackgroundColor: '#ffffff',
    pointBorderColor: '#000000',
    pointBorderWidth: 1,
    pointRadius: 3,
    pointHoverRadius: 5,
    tension: 0,
    fill: false
};

/**
 * Inicializa el gráfico de peso
 * @param {string} canvasId - ID del elemento canvas donde se dibujará el gráfico
 */
export function initializeChart(canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    weightChart = new Chart(ctx, {
        ...CHART_CONFIG,
        data: {
            labels: [],
            datasets: [{
                ...DATASET_CONFIG,
                data: []
            }]
        }
    });
}

/**
 * Filtra los datos según el rango seleccionado
 * @param {Array} data - Datos completos
 * @param {string} range - Rango seleccionado (weekly, monthly, yearly, all)
 * @returns {Array} Datos filtrados
 */
function filterDataByRange(data, range) {
    const now = new Date();
    const filtered = data.filter(record => {
        const recordDate = new Date(record.date);
        const diffTime = Math.abs(now - recordDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch(range) {
            case 'weekly':
                return diffDays <= 7;
            case 'monthly':
                return diffDays <= 30;
            case 'yearly':
                return diffDays <= 365;
            default:
                return true;
        }
    });

    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Calcula estadísticas de los datos
 * @param {Array} data - Datos completos
 * @param {string} range - Rango actual seleccionado
 * @returns {Object} Estadísticas calculadas
 */
function calculateStats(data, range = 'weekly') {
    if (!data.length) return { weekAvg: 0, monthAvg: 0, totalChange: 0 };

    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const weekData = data.filter(r => new Date(r.date) >= sevenDaysAgo);
    const monthData = data.filter(r => new Date(r.date) >= thirtyDaysAgo);
    
    const weekAvg = weekData.length ? 
        weekData.reduce((sum, r) => sum + r.weight, 0) / weekData.length : 0;
    
    const monthAvg = monthData.length ?
        monthData.reduce((sum, r) => sum + r.weight, 0) / monthData.length : 0;

    // Filtrar datos según el rango actual para calcular el cambio total
    const filteredData = filterDataByRange(data, range);
    const firstWeight = filteredData[0]?.weight || 0;
    const lastWeight = filteredData[filteredData.length - 1]?.weight || 0;
    const totalChange = lastWeight - firstWeight;

    return {
        weekAvg: weekAvg.toFixed(2),
        monthAvg: monthAvg.toFixed(2),
        totalChange: totalChange.toFixed(2)
    };
}

/**
 * Actualiza los datos del gráfico y estadísticas
 * @param {Array} weightData - Array de registros de peso
 * @param {string} range - Rango de datos a mostrar
 */
export function updateChart(weightData, range = 'weekly') {
    if (!weightChart) return;

    const filteredData = filterDataByRange(weightData, range);
    const stats = calculateStats(weightData, range);

    // Actualizar gráfico
    weightChart.data.labels = filteredData.map(record => {
        const date = new Date(record.date);
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit',
            month: '2-digit'
        });
    });
    weightChart.data.datasets[0].data = filteredData.map(record => record.weight);
    weightChart.update();

    // Actualizar estadísticas
    document.getElementById('weekAvg').textContent = stats.weekAvg;
    document.getElementById('monthAvg').textContent = stats.monthAvg;
    document.getElementById('totalChange').textContent = 
        `${stats.totalChange >= 0 ? '+' : ''}${stats.totalChange}`;
    document.getElementById('recordCount').textContent = weightData.length;
} 