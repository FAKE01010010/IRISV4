/**
 * Módulo para manejar la visualización de la tabla de datos
 */

import { deleteWeight } from './storage.js';

/**
 * Crea una celda de tabla con el contenido especificado
 * @param {string} content - Contenido de la celda
 * @returns {HTMLTableCellElement} Elemento TD creado
 */
function createCell(content) {
    const td = document.createElement('td');
    td.textContent = content;
    return td;
}

/**
 * Crea el botón de eliminar para cada fila
 * @returns {HTMLTableCellElement} Celda con el botón de eliminar
 */
function createDeleteCell() {
    const td = document.createElement('td');
    td.className = 'delete-cell';
    td.innerHTML = '×';  // Símbolo multiplicar Unicode (más limpio que el emoji)
    return td;
}

/**
 * Formatea una fecha para mostrar en la tabla
 * @param {string} dateStr - Fecha en formato YYYY-MM-DD
 * @returns {string} Fecha formateada
 */
function formatTableDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

/**
 * Maneja la animación y eliminación de una fila
 * @param {HTMLTableRowElement} row - Fila a eliminar
 * @param {string} date - Fecha del registro
 * @param {number} weight - Peso del registro
 * @param {Function} onDelete - Callback a ejecutar después de eliminar
 */
function handleRowDeletion(row, date, weight, onDelete) {
    // Añadir clase para iniciar la animación de fade out
    row.classList.add('row-fade-out');
    
    // Esperar a que termine la animación
    setTimeout(() => {
        if (deleteWeight(date, weight)) {
            row.remove();
            if (onDelete) onDelete();
        }
    }, 300); // Duración de la animación
}

/**
 * Actualiza la tabla con los datos proporcionados
 * @param {Array<{date: string, weight: number}>} weightData - Datos de peso
 * @param {string} tableId - ID de la tabla
 * @param {Function} onDelete - Callback opcional para ejecutar después de eliminar
 */
export function updateTable(weightData, tableId, onDelete) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;

    // Limpiar tabla
    tbody.innerHTML = '';

    // Ordenar datos por fecha descendente
    const sortedData = [...weightData].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    // Crear filas
    sortedData.forEach(record => {
        const row = document.createElement('tr');
        
        // Añadir celdas de datos
        row.appendChild(createCell(formatTableDate(record.date)));
        row.appendChild(createCell(record.weight.toFixed(2)));
        
        // Añadir celda de eliminar
        const deleteCell = createDeleteCell();
        deleteCell.addEventListener('click', () => {
            handleRowDeletion(row, record.date, record.weight, onDelete);
        });
        row.appendChild(deleteCell);

        tbody.appendChild(row);
    });
} 