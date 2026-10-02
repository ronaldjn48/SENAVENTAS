# SENAVENTAS · Creador de Tiendas Virtuales

Simulador educativo para crear, configurar, probar y publicar tiendas virtuales al estilo de WooCommerce y Shopify. Está pensado para formación en comercio electrónico, mercadeo y logística (SENA, colegios, universidades y emprendimiento). **No procesa pagos reales ni mueve dinero.**

La interfaz conserva la línea visual de los diseños de referencia (carpeta `referencias/`): paleta verde SENA, tipografía Plus Jakarta Sans, íconos Material Symbols, tarjetas con esquinas redondeadas y los presets Minimal Clean, Boutique Moderna, Catálogo Mayorista, Aura Gold (joyería) y Botánica Pura (cosmética).

## Acceso por usuario

Al abrir la app aparece una pantalla para **crear usuario** o **ingresar**. No pide correo ni verificación: solo un usuario (3 a 24 caracteres) y una contraseña (mínimo 4).

* Cada usuario tiene su propio espacio. Ninguna persona ve las tiendas, pedidos o llaves de otra.
* Un usuario nuevo empieza **desde cero**: tienda en blanco, sin productos, pedidos ni textos de ejemplo. Al crear una tienda nueva puede elegir "Desde cero" o "Con ejemplos del tema".
* La sesión se cierra al cerrar la pestaña. En equipos de uso personal puede marcar "Mantener mi sesión iniciada".
* **Cerrar sesión** guarda el trabajo y limpia la pantalla, así el siguiente estudiante recibe una versión limpia. El archivo portable y el paquete de instalación nunca llevan datos de nadie.
* Para continuar en otro equipo: descargar el respaldo (`.senaventas.json`) al cerrar sesión, crear el mismo usuario allí e importarlo desde **Inicio → Importar**. El archivo no incluye el usuario ni la contraseña.
* **Eliminar mi usuario y mis datos** (en Inicio) borra la cuenta y sus tiendas de ese equipo. Útil al final de la clase en equipos compartidos.

Importante: es un acceso didáctico. Los usuarios y los datos viven en el navegador de cada equipo y la contraseña no se cifra de forma segura, por lo que no sirve para proteger información sensible.

## Qué incluye

| Módulo | Funciones |
|---|---|
| Inicio & Sesiones | Sesiones guardadas automáticamente, crear, abrir, duplicar, renombrar, exportar e importar (`.senaventas.json`), plantilla de clase para replicar con el grupo, instalación en el escritorio y versión portable. |
| Configuración & Temas | 5 plantillas con demo en vivo, 8 plugins que cambian el comportamiento real de la tienda, identidad de marca con color e ícono, contacto, envíos por zona, ficha del aprendiz, contenido de cada sección, SEO con puntaje, categorías y cupones. |
| Productos & Inventario | Tabla con búsqueda, filtros, paginación y acciones masivas, alta y edición con foto (subida o URL, optimizada a 900 px), margen bruto en vivo y precio sugerido, ajuste rápido de stock, alertas de stock bajo, Kardex en CSV e importación CSV. |
| Pedidos | Pedidos de la tienda, la API y el sitio publicado, flujo pendiente → pagado → despachado → entregado, cancelación con devolución de inventario, utilidad bruta, comprobante imprimible, mensaje de WhatsApp y exportación CSV. |
| Mi Tienda en Vivo | Vista de comprador en escritorio, tableta y móvil, carrito, kit promocional, cupones, envío por departamento, barra de envío gratis, checkout simulado (Nequi, Daviplata, PSE, tarjeta de prueba, contraentrega) y eventos del píxel en vivo. |
| Integraciones & API | 11 aplicativos simulados (Wompi, Mercado Pago, Siigo, Alegra, Google Sheets, Meta, TikTok, WhatsApp Cloud API, Servientrega, Mailchimp, GA4), llaves de API con permisos, consola REST con código en cURL, JavaScript y Python, webhooks firmados con registro de entregas y documentación. |
| Publicar Tienda | Checklist de calidad con puntaje, publicación con versiones, descarga del sitio (`index.html` o `.zip`) listo para Netlify, GitHub Pages o cualquier hosting, e informe de evidencia imprimible. |

## Cómo usarlo

### Opción 1. Desde la web (recomendada)

Publica este repositorio en GitHub Pages y comparte la dirección con el grupo:

1. En GitHub abre **Settings → Pages** y en *Source* elige **GitHub Actions**.
2. Cada cambio en la rama `main` publica la app con el flujo `.github/workflows/pages.yml`.
3. La app queda en `https://<usuario>.github.io/<repositorio>/`.

También sirve Netlify Drop: arrastra la carpeta del proyecto a <https://app.netlify.com/drop>.

### Opción 2. Instalada en el escritorio

Abre la dirección web en Chrome o Edge y pulsa **Instalar SENAVENTAS** (botón de la barra superior o ícono de instalación en la barra de direcciones). Queda un acceso directo en el escritorio y funciona sin conexión después de la primera carga.

### Opción 3. Versión portable (un solo archivo)

Desde **Inicio → Descargar versión portable** o con `npm run portable` se genera `senaventas-portable.html`. Se abre con doble clic, sin instalar nada. Ideal para el LMS, una memoria USB o equipos sin permisos de administrador.

### Opción 4. Servidor local para el aula

```bash
npm start            # http://localhost:8080
```

Los aprendices entran con la IP del equipo del instructor y el puerto 8080. Requiere Node.js 18 o superior y no instala dependencias.

## Dónde se guarda la información

Cada sesión se guarda en el navegador del equipo (IndexedDB, con respaldo en localStorage) y queda asociada a tu usuario, cada vez que haces un cambio. Para cambiar de equipo o entregar una evidencia, exporta la sesión desde **Inicio** y vuelve a importarla. El sitio publicado guarda los pedidos de cada visitante en su propio navegador.

## Ruta de aprendizaje sugerida

| Paso | Actividad | Evidencia |
|---|---|---|
| 1. Identidad de marca | Definir nombre, lema, color, canales de contacto y política de envíos. | Captura de la previsualización de marca. |
| 2. Tema visual | Comparar las 5 plantillas y justificar la elección según el modelo de negocio (B2C, D2C, B2B, lujo). | Tema activo y texto de justificación. |
| 3. Catálogo virtual | Cargar mínimo 3 productos con foto, costo y precio. Analizar margen bruto y stock mínimo. | Planilla Kardex (CSV). |
| 4. Prueba de compra | Comprar como cliente, probar la tarjeta que rechaza y la que aprueba, aplicar un cupón y gestionar el pedido hasta "entregado". | Comprobante del pedido. |
| 5. Integración y publicación | Conectar un aplicativo, usar la API y un webhook, alcanzar 80% en el checklist y publicar. | Informe de evidencia y archivo `.senaventas.json`. |

Datos de prueba del checkout:

* Tarjeta que aprueba: `4242 4242 4242 4242`, cualquier fecha futura y CVV de 3 dígitos.
* Tarjeta que rechaza: `4000 0000 0000 0002`.
* Nequi y Daviplata: cualquier celular de 10 dígitos que inicie en 3.
* Cupones de ejemplo: `SENA2025`, `EDITORIAL15`, `MAYORISTA5`, `AURA10`, `BOTANICA15` según el preset.

## API REST simulada

Base: `https://api.senaventas.edu.co/api/v1` (se ejecuta dentro del navegador). Autenticación con `Authorization: Bearer sk_test_...` generada en **Integraciones & API → Llaves de API**.

| Método | Ruta | Uso |
|---|---|---|
| GET | `/store` | Datos de la tienda |
| GET | `/products?category=&status=&q=&limit=&page=` | Listar productos |
| GET, PUT, DELETE | `/products/{id o sku}` | Consultar, editar o eliminar |
| POST | `/products` | Crear producto |
| PATCH | `/products/{id o sku}/stock` | Ajustar inventario con `delta` o `stock` |
| GET | `/categories`, `/coupons`, `/reports/sales` | Catálogos y reporte de ventas |
| GET, POST | `/orders` | Listar o crear pedidos |
| GET, PATCH | `/orders/{id}` | Consultar o cambiar estado |
| GET | `/webhooks` | Webhooks registrados |
| POST | `/webhooks/test` | Disparar un evento de prueba |

Respuestas didácticas: 200, 201, 202, 204, 400, 401, 403, 404, 409, 422 y 429 (límite de 60 solicitudes por minuto). Eventos de webhook: `order.created`, `order.updated`, `product.created`, `product.updated`, `product.deleted`, `stock.low`, `store.published`. Con la opción "Enviar de verdad", el webhook hace un POST real a la URL indicada (por ejemplo, una URL de <https://webhook.site>).

En el sitio publicado, la consola del navegador ofrece `tiendaAPI.productos()`, `tiendaAPI.carrito()`, `tiendaAPI.totales()` y `tiendaAPI.pedidos()` para practicar.

## Estructura del proyecto

```
index.html                 Aplicación (se abre en cualquier navegador)
manifest.webmanifest, sw.js  Instalación como app y uso sin conexión
assets/css/app.css         Estilos del creador
assets/js/images.js        Imágenes de los anexos de diseño
assets/js/data.js          Temas, presets, plugins e integraciones
assets/js/core.js          Utilidades, modelo de sesión y almacenamiento
assets/js/store-css.js     Estilos de la tienda generada
assets/js/store-render.js  Generador de la tienda (vista previa y sitio publicado)
assets/js/api-sim.js       API REST, webhooks e integraciones simuladas
assets/js/login.js         Pantalla de acceso (crear usuario e ingresar)
assets/js/app.js           Vistas y lógica del creador
tools/serve.mjs            Servidor local sin dependencias
tools/build-portable.mjs   Genera dist/senaventas-portable.html
tests/smoke.mjs            Prueba de extremo a extremo con Playwright
referencias/               Diseños y capturas de referencia
```

No hay paso de compilación: todo es HTML, CSS y JavaScript estándar. Para agregar un tema, suma un objeto en `SV.THEMES` y su contenido en `SV.PRESETS` dentro de `assets/js/data.js`.

## Pruebas

```bash
npm start                      # en una terminal
npm i -D playwright            # una sola vez
node tests/smoke.mjs           # recorre todo el flujo y guarda capturas en tests/capturas
```

## Alcance

* Uso exclusivamente educativo. Las pasarelas, facturas, guías y mensajes son simulados.
* Las fotografías de ejemplo se cargan desde los enlaces de los diseños de referencia. Si un enlace deja de estar disponible, la tienda muestra una imagen de reemplazo con la inicial del producto. Para un catálogo propio, sube tus fotos desde el formulario de producto.
* Las fuentes y los íconos se cargan desde Google Fonts. Sin conexión, la app instalada usa la copia guardada en caché.
