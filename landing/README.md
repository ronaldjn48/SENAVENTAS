# SENA VENTAS LANDING PAGE · Creador de Landing Pages de captación

Simulador educativo para crear landing pages que captan clientes reales: formulario de contacto, enlace de WhatsApp Business, base de datos de interesados en Excel y un enlace público que funciona en cualquier celular. Es la alternativa de captación de referidos de SENAVENTAS y conserva su misma línea visual (verde SENA, Plus Jakarta Sans, Material Symbols, tarjetas y ruta de aprendizaje).

Funciona en la nube (GitHub Pages o Netlify), instalada en el escritorio (PWA), como archivo portable de doble clic y en el servidor del aula. No necesita instalar dependencias ni compilar.

## Qué incluye

| Módulo | Funciones |
|---|---|
| Inicio & Proyectos | Ruta de aprendizaje de 5 pasos, proyectos guardados automáticamente, duplicar, renombrar, exportar e importar (`.landing.json`), plantilla de clase, instalación en el escritorio y versión portable. |
| Plantillas | 4 modelos configurables con contenido real para Colombia: Servicios Inmobiliarios, Medicina u Odontología, Obra Civil y Remodelaciones, Mantenimiento de Refrigeración. Más la opción Desde cero. Miniaturas en vivo y demo. |
| Editor Visual | Arrastrar y soltar: 25 bloques en 5 categorías (captación, estructura, contenido, confianza, multimedia). Se arrastran a la lista o directo sobre la página. Lienzo en escritorio, tableta y celular, inspector de contenido y estilo, listas editables, ilustraciones propias, subida de imágenes, íconos, deshacer y atajos de teclado. |
| Diseño & Marca | Datos de la empresa cliente y ficha del aprendiz, 9 paletas, 8 colores editables, 30 fuentes de Google y 9 parejas tipográficas, redondeo, estilo de botones y sombras. WhatsApp por número o por enlace de WhatsApp Business (WPB), botón flotante, 8 redes sociales, SEO con puntaje y píxeles de Meta, TikTok y Google Analytics 4. |
| Formulario & Captación | 11 tipos de campo, orden con arrastrar y soltar, campos obligatorios, autorización de datos con política (Ley 1581 de 2012), mensaje de agradecimiento, redirección a WhatsApp y destinos de los datos: base de datos del simulador, Google Sheets, webhook (Make, Zapier, n8n, CRM) y correo (FormSubmit). |
| Base de Datos (Leads) | Tabla con búsqueda, filtros, paginación y acciones masivas, embudo de ventas con arrastrar y soltar entre estados, detalle con notas, historial y respuestas rápidas por WhatsApp, datos de prueba, alta manual, importación CSV, sincronización con la nube y exportación a Excel (.xlsx con hojas Leads, Resumen y Diccionario de datos) y CSV. |
| Vista en Vivo | La landing como la ve el visitante en escritorio, tableta y celular. Cada envío del formulario llega a la base de datos. Eventos de analítica en vivo y tasa de conversión. |
| Publicar & Compartir | Checklist de calidad con puntaje, enlace directo funcional, enlace corto en la nube con código QR, enlace con UTM, paquete del sitio (.zip) para Netlify, GitHub Pages o hosting propio e informe de evidencia imprimible. |
| Nube & Coordinación | Conexión con Google Sheets mediante Google Apps Script (código incluido), enlaces cortos, sincronización de leads y tablero de la coordinación con las landing, visitas y leads de cada aprendiz, exportable a Excel. |

## Cómo funciona el enlace público

La app genera dos tipos de enlace desde **Publicar & Compartir**:

1. **Enlace directo** (`ver.html#...`): la landing completa viaja comprimida dentro del enlace (entre 5 y 10 KB con las ilustraciones de la biblioteca). Abre en cualquier dispositivo sin servidor ni base de datos. Si el visitante lo abre en el mismo navegador donde está el simulador, el lead también aparece en la Base de Datos.
2. **Enlace corto en la nube** (`ver.html?id=...`): la landing se lee desde la Hoja de cálculo de la coordinación. Sirve para códigos QR y siempre muestra la última versión publicada.

Los datos que dejan los visitantes viajan a los destinos configurados en **Formulario & Captación**: Google Sheets, webhook o correo. Cada lead guarda fecha, campos del formulario, interés seleccionado, parámetros UTM (`utm_source`, `utm_medium`, `utm_campaign`) y dispositivo.

Por seguridad, `ver.html` muestra la landing dentro de un iframe aislado: el código de las incrustaciones libres no puede leer los proyectos ni los leads guardados en el navegador.

## Uso en una coordinación académica

### 1. Publicar la app

1. Crea una copia (fork) de este repositorio en la cuenta de GitHub de la coordinación.
2. En GitHub abre **Settings → Pages** y en *Source* elige **GitHub Actions**.
3. Cada cambio en `main` publica la app con el flujo `.github/workflows/pages.yml`.
4. La app queda en `https://<usuario>.github.io/<repositorio>/landing/`.

Alternativa sin GitHub: arrastra la carpeta `landing` a <https://app.netlify.com/drop>.

### 2. Instalar la nube (Google Sheets, gratis)

1. Crea una Hoja de cálculo nueva en <https://sheets.new> con la cuenta de la coordinación o del instructor.
2. Abre **Extensiones → Apps Script**, borra el ejemplo y pega el código que aparece en **Nube & Coordinación → Instalar la nube** (botón Copiar código o Descargar .gs).
3. Cambia `CLAVE_COORDINACION`. Si quieres que solo tu grupo publique, escribe un código en `CLAVE_PUBLICAR`. Con `NOTIFICAR_POR_CORREO = true` llega un correo por cada lead.
4. **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: *Yo*. Quién tiene acceso: *Cualquier usuario*.
5. Autoriza los permisos y copia la URL que termina en `/exec`.

El script crea dos hojas: **Leads** (una fila por interesado) y **Paginas** (cada landing publicada con visitas, leads y su contenido). Los valores que empiezan por `=`, `+`, `-` o `@` se guardan como texto para evitar fórmulas maliciosas.

### 3. Conectar a todo el grupo

Edita `landing/config.js`:

```js
window.SV_CONFIG = {
  institucion: 'SENA',
  coordinacion: 'Coordinación de Comercio - Centro de Comercio y Servicios',
  nubeUrl: 'https://script.google.com/macros/s/AKfy.../exec',
  basePublica: 'https://usuario.github.io/repositorio/landing/',
  clavePublicar: ''
};
```

Con `nubeUrl` configurado, cada proyecto nuevo queda conectado a la nube y los enlaces cortos quedan más cortos. `basePublica` se usa para armar los enlaces cuando la app se abre como archivo portable. Cada aprendiz puede cambiar estos valores en **Nube & Coordinación → Conexión**.

### 4. Tablero de la coordinación

En **Nube & Coordinación → Tablero del grupo**, con la clave de coordinación, el instructor ve cada landing publicada (aprendiz, ficha, empresa, visitas, leads y conversión) y descarga un Excel con las landing y todos los leads del grupo.

## Otras formas de uso

* **Escritorio:** abre la app en Chrome o Edge y pulsa **Instalar app**. Funciona sin conexión después de la primera carga.
* **Portable:** **Inicio → Descargar versión portable** o `npm run portable` genera `dist/senaventas-landing-portable.html`, un solo archivo que se abre con doble clic. Ideal para el LMS o una memoria USB.
* **Servidor del aula:** `npm start` dentro de la carpeta `landing` (Node.js 18 o superior). Los aprendices entran con la IP del equipo del instructor y el puerto 8090.

## Ruta de aprendizaje sugerida

| Paso | Actividad | Evidencia |
|---|---|---|
| 1. Brief de la empresa cliente | Definir empresa, propuesta de valor, contacto y ficha del aprendiz. | Vista previa de marca. |
| 2. Plantilla y estructura | Escoger plantilla o empezar desde cero, ordenar bloques y personalizar textos, imágenes y estilos. | Landing en el Editor Visual. |
| 3. Formulario y WhatsApp | Diseñar los campos según el servicio, la autorización de datos y el enlace de WhatsApp Business. | Formulario con política de datos. |
| 4. Prueba de captación | Registrar 3 o más interesados en la Vista en Vivo y clasificarlos en el embudo. | Base de datos con estados y notas. |
| 5. Publicación y reporte | Cumplir el checklist, publicar, compartir el enlace y descargar el Excel. | Enlace público, archivo .xlsx e informe de evidencia. |

## Estructura del proyecto

```
landing/
  index.html                 Aplicación (creador)
  ver.html                   Visor público de las landing (enlace funcional)
  config.js                  Configuración de la coordinación
  manifest.webmanifest, sw.js  Instalación como app y uso sin conexión
  assets/css/app.css         Estilos del creador (línea visual de SENAVENTAS)
  assets/js/core.js          Utilidades, Excel, enlaces comprimidos, modelo y almacenamiento
  assets/js/art.js           Ilustraciones SVG propias
  assets/js/data.js          Fuentes, paletas, redes, 25 bloques y las plantillas
  assets/js/render.js        Generador de la landing (editor, vista previa, enlace y exportación)
  assets/js/cloud.js         Código de Google Apps Script y cliente de la nube
  assets/js/viewer.js        Lógica de ver.html
  assets/js/app.js           Marco, vistas y acciones
  assets/js/editor.js        Editor visual con arrastrar y soltar
  assets/js/leads.js         Base de datos, embudo y exportación
  tools/serve.mjs            Servidor local sin dependencias
  tools/build-portable.mjs   Genera dist/senaventas-landing-portable.html
  tests/smoke.mjs            Prueba de extremo a extremo
  tests/nube.mjs             Prueba del flujo en la nube con el script real
```

Para agregar una plantilla, suma un objeto en `SV.TEMPLATES` (archivo `assets/js/data.js`). Para agregar un bloque, define sus campos en `SV.BLOCKS` y su HTML en el objeto `R` de `assets/js/render.js`.

## Pruebas

```bash
npm start                      # en una terminal
npm i -D playwright            # una sola vez
node tests/smoke.mjs           # recorre todo el flujo y guarda capturas en tests/capturas
node tests/nube.mjs            # conecta la app con el script de Apps Script sobre una hoja simulada
```

## Alcance y datos personales

* El simulador guarda los proyectos en el navegador del equipo (IndexedDB). Exporta el `.landing.json` para cambiar de equipo o entregar la evidencia.
* Los formularios piden la autorización de tratamiento de datos (Ley 1581 de 2012 y Decreto 1377 de 2013). Ajusta la política con los datos reales de la empresa antes de usar la landing con clientes.
* Las fuentes y los íconos se cargan desde Google Fonts. El mapa usa Google Maps y el código QR usa api.qrserver.com.
