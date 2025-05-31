/**
 * Módulo para manejar el almacenamiento local de los datos de peso
 */

// Constantes para el almacenamiento
const STORAGE_PREFIX = 'peso_';
const DEFAULT_LIMIT = 30;
const STORAGE_KEY = 'iris_v4_weights';

/**
 * Guarda un registro de peso en localStorage
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {number} weight - Peso en kg
 */
export function saveWeight(date, weight) {
    const key = `${STORAGE_PREFIX}${date}`;
    localStorage.setItem(key, weight.toString());
}

/**
 * Obtiene todos los registros de peso ordenados por fecha
 * @param {number} limit - Número máximo de registros a devolver
 * @returns {Array<{date: string, weight: number}>} Array de registros ordenados por fecha
 */
export function getAllWeights(limit = DEFAULT_LIMIT) {
    // Usar Object.entries para una iteración más eficiente
    return Object.entries(localStorage)
        .filter(([key]) => key.startsWith(STORAGE_PREFIX))
        .map(([key, value]) => ({
            date: key.substring(STORAGE_PREFIX.length),
            weight: parseFloat(value)
        }))
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);
}

/**
 * Elimina un registro de peso específico
 * @param {string} date - Fecha del registro a eliminar
 * @param {number} weight - Peso del registro a eliminar
 * @returns {boolean} True si se eliminó correctamente
 */
export function deleteWeight(date, weight) {
    const weights = getAllWeights();
    const index = weights.findIndex(w => 
        w.date === date && Math.abs(w.weight - weight) < 0.001
    );
    
    if (index === -1) return false;
    
    weights.splice(index, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weights));
    return true;
} 