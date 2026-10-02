# MercadoSENA Ads — simulador de publicidad en marketplace

Variante del proyecto SENA Ventas. Simula el flujo de publicidad de un marketplace tipo MercadoLibre Ads o Rappi Ads: crear productos, armar campañas con bloques y anuncios, segmentar audiencia, asignar palabras clave, definir presupuesto, medir resultados y calcular el ACOS.

## Descarga

Archivo listo para usar: `mercadosena-ads.html`. Un solo archivo, sin internet, sin instalación. Abre en celular, tableta y computador. Los datos se guardan en el navegador (localStorage) y se pueden exportar a JSON.

También se descarga desde la pantalla Datos y descarga dentro del simulador.

## Cuentas por estudiante

Al abrir el simulador aparece el login. El estudiante crea un usuario y una contraseña (sin correo ni verificaciones) o ingresa con una cuenta existente. Cada usuario tiene su propio espacio de datos en el navegador y una cuenta nueva siempre empieza desde cero. La sesión termina al cerrar la pestaña o con Cerrar sesión en el perfil.

El archivo descargado no incluye ningún trabajo: se genera antes de cargar datos. Un estudiante nuevo siempre lo encuentra limpio. La contraseña solo separa el trabajo de cada estudiante en el mismo dispositivo; no es seguridad real. El trabajo de un estudiante viaja a otro dispositivo con Exportar proyecto e Importar proyecto.

## Flujo del aprendiz

1. Creación de productos: título y descripción.
2. Configuración comercial: precio, costo, stock e imágenes que cumplen el estándar (mínimo 500 x 500 px, JPG, PNG o WebP, máximo 5 MB, fondo claro en la foto principal).
3. Selección de pauta: elige los productos y los agrupa en bloques.
4. Segmentación de audiencia: geografía, demografía, tipo de comprador (nuevo en la plataforma, comprador antiguo de la plataforma, comprador antiguo de la tienda, miembro con membresía), intereses y dispositivo.
5. Palabras clave: coincidencia amplia, de frase o exacta, puja por término y palabras negativas.
6. Presupuesto: diario, duración y puja base, con proyección.
7. Análisis: métricas de campaña pagada, calculadora de ACOS, ejercicio para elegir la campaña de mejor rendimiento y reporte de rendimiento.

## Campaña, bloque y anuncio

- Campaña: contenedor con presupuesto, ROAS objetivo, audiencia y duración.
- Bloque: agrupación de productos dentro de una campaña.
- Anuncio: un producto promocionado, con palabras clave, puja y métricas propias.

## Pantallas

Inicio (ruta del aprendiz), Productos, Campañas (lista, asistente de 6 pasos y detalle con pestañas), Anuncios (activar y desactivar con aplicar cambios), Detalle del anuncio, Métricas, Calculadora ACOS, Reportes, Ajustes de ROAS y Datos y descarga.

## Motor de simulación

Cada día simulado calcula por palabra clave: impresiones (volumen de búsqueda, coincidencia, puja frente al mercado, audiencia y fase de aprendizaje de 3 días), clics (CTR según calidad de la publicación y relevancia), costo (CPC) y ventas (conversión según calidad, precio frente a la referencia, ticket y audiencia). El gasto se recorta al presupuesto diario. Con ROAS objetivo, la puja se limita a lo rentable. También simula ventas orgánicas para calcular la atribución directa.

- ACOS = inversión / ventas por publicidad x 100
- ROAS = ventas / inversión = 100 / ACOS
- ACOS de equilibrio = margen bruto del producto

## Desarrollo

Fuentes en `src/`. Para regenerar el HTML portable:

```
node build.mjs
```

Requiere Node 18 o superior. El build une `src/styles.css`, `src/*.js`, el logo `assets/logo-mercadosena-ads.svg` (sin modificar) y las fuentes Plus Jakarta Sans en base64.

Más contexto de diseño y decisiones: `MEMORIA-PROYECTO.md`.
