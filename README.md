# IRIS V4 - Seguimiento de Peso Corporal

Una aplicación web minimalista para registrar y visualizar el peso corporal diario. Diseñada con un enfoque en la simplicidad y usabilidad.

## Características

- Registro diario de peso con fecha
- Visualización de histórico en tabla (últimos 30 registros)
- Gráfico de evolución temporal
- Almacenamiento local en el navegador
- Diseño responsivo con tema oscuro y estilo neón
- Interfaz minimalista y fácil de usar

## Tecnologías Utilizadas

- HTML5
- CSS3 (Variables CSS, Flexbox)
- JavaScript (ES6+ Modules)
- Chart.js para visualización de datos
- LocalStorage para persistencia de datos

## Estructura del Proyecto

```
├── index.html          # Página principal
├── styles.css         # Estilos CSS
├── js/
│   ├── main.js       # Archivo principal de JavaScript
│   ├── storage.js    # Módulo de almacenamiento
│   ├── chart.js      # Módulo de gráficos
│   └── table.js      # Módulo de tabla
└── README.md         # Este archivo
```

## Uso

1. Abre `index.html` en tu navegador web
2. Introduce tu peso en kilogramos
3. Selecciona la fecha (por defecto es hoy)
4. Haz clic en "Guardar"
5. Los datos se mostrarán automáticamente en la tabla y el gráfico

## Almacenamiento

Los datos se almacenan localmente en el navegador usando `localStorage`. Cada registro se guarda con la clave `peso_YYYY-MM-DD` y el valor es el peso en kilogramos.

## Desarrollo Futuro

La aplicación está diseñada para ser escalable. Algunas posibles mejoras futuras incluyen:

- Añadir más métricas de seguimiento
- Implementar sistema de hábitos
- Añadir estadísticas y análisis de tendencias
- Exportación e importación de datos
- Sincronización con la nube

## Licencia

MIT 