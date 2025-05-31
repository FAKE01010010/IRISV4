/**
 * Archivo principal que coordina la funcionalidad de la aplicación
 */

import { saveWeight, getAllWeights } from './storage.js';
import { initializeChart, updateChart } from './chart.js';
import { updateTable } from './table.js';

// Configuración de la aplicación
const CONFIG = {
    formId: 'weightForm',
    weightInputId: 'weight',
    dateInputId: 'date',
    chartId: 'weightChart',
    tableId: 'weightTable',
    rangeButtonId: 'rangeButton',
    timeId: 'current-time'
};

// Estado global de la aplicación
const STATE = {
    currentRange: 'weekly'
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
function getTodayFormatted() {
    return new Date().toISOString().split('T')[0];
}

/**
 * Actualiza el reloj del sistema
 */
function updateSystemTime() {
    const timeElement = document.getElementById(CONFIG.timeId);
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('es-ES', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Inicializa el selector de rango
 */
function initializeRangeSelector() {
    const rangeButton = document.getElementById(CONFIG.rangeButtonId);
    const rangeOptions = document.querySelectorAll('.range-option');

    rangeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const range = option.dataset.range;
            STATE.currentRange = range;
            rangeButton.textContent = `RANGE: ${range.toUpperCase()}`;
            refreshData();
        });
    });
}

/**
 * Inicializa el formulario de entrada de datos
 */
function initializeForm() {
    const dateInput = document.getElementById(CONFIG.dateInputId);
    const today = getTodayFormatted();
    
    // Configurar el selector de fecha con Flatpickr
    flatpickr(dateInput, {
        defaultDate: today,
        maxDate: today,
        dateFormat: "Y-m-d",
        locale: {
            firstDayOfWeek: 1,
            weekdays: {
                shorthand: ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'],
                longhand: ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO']
            },
            months: {
                shorthand: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
                longhand: ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']
            }
        }
    });

    // Configurar el formulario
    document.getElementById(CONFIG.formId)
        .addEventListener('submit', handleFormSubmit);
}

/**
 * Maneja el envío del formulario
 * @param {Event} event - Evento de submit del formulario
 */
function handleFormSubmit(event) {
    event.preventDefault();

    const date = document.getElementById(CONFIG.dateInputId).value;
    const weight = parseFloat(document.getElementById(CONFIG.weightInputId).value);

    if (!date || isNaN(weight)) return;

    // Guardar el nuevo registro
    saveWeight(date, weight);
    
    // Limpiar el formulario
    document.getElementById(CONFIG.weightInputId).value = '';
    document.getElementById(CONFIG.dateInputId).value = getTodayFormatted();

    // Actualizar visualizaciones
    refreshData();
}

/**
 * Actualiza todas las visualizaciones de datos
 */
function refreshData() {
    const weights = getAllWeights();
    updateChart(weights, STATE.currentRange);
    updateTable(weights, CONFIG.tableId, refreshData);
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    initializeForm();
    initializeChart(CONFIG.chartId);
    initializeRangeSelector();
    refreshData();
    
    // Iniciar el reloj del sistema
    updateSystemTime();
    setInterval(updateSystemTime, 1000);
}); 