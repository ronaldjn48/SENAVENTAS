# Memoria del proyecto: MercadoSENA Ads

Documento de contexto para retomar el trabajo en sesiones futuras (o para cargarlo en claude-mem).

## Quién y para qué

- Autor: Ronald Ramiro Jiménez Núñez. Instructor SENA (Centro de Comercio y Servicios, Atlántico) y docente universitario.
- Uso: material educativo para formación en marketing digital y comercio electrónico. Aprendices SENA y estudiantes de Administración.
- Variante del proyecto SENA Ventas. Entregable: HTML portable y responsive.

## Reglas de diseño acordadas

- Idioma: español de Colombia. Voz activa, oraciones cortas, sin lenguaje promocional.
- Logo MERCADOSENA ADS: se usa tal cual (`assets/logo-mercadosena-ads.svg`), nunca se redibuja.
- Las pantallas de referencia replican MercadoLibre Ads para productos: anuncios (interruptores, ordenar por clics, impresiones, ventas y ACOS, aplicar cambios), campañas (tarjetas con presupuesto, ROAS objetivo, ventas y ACOS), métricas (atribución directa, KPIs, ventas con publicidad vs orgánico) y ajustes de ROAS (2x, 3x recomendado, 10x, personalizado).
- Tokens: Plus Jakarta Sans; verde SENA #39A900 (primary-container), #226D00 (primary), superficie #F8F9FF, texto #0B1C30, error #BA1A1A, tertiary #0053DB, ámbar para alertas.
- Mobile first: barra inferior en móvil, menú lateral desde 900 px. Áreas táctiles de 44 px. Sin dependencias externas: fuentes en base64, iconos SVG propios.
- Portabilidad: un solo `.html`. Estado en localStorage. Exportar e importar JSON.

## Decisiones de dominio

- Campaña (presupuesto, ROAS, audiencia, duración) contiene bloques; cada bloque agrupa anuncios; un anuncio es un producto con palabras clave y métricas propias.
- Segmentación: geografía (nacional o ciudades), demografía (edad, género, ingresos), tipo de comprador (nuevo en la plataforma, comprador antiguo de la plataforma, comprador antiguo de la tienda, miembro con membresía), intereses, dispositivo.
- Palabras clave: amplia, frase, exacta, puja por término, negativas a nivel de campaña.
- Mejor campaña = menor ACOS con al menos 5 ventas. La utilidad neta (ventas x margen - inversión) se muestra como segundo criterio.
- Un anuncio es rentable si ACOS < margen bruto del producto.
- Calidad de la publicación (0 a 100): título 30-70 caracteres, sin símbolos promocionales, descripción de 150 o más caracteres, precio competitivo, 3 o más imágenes, resolución mínima, foto principal con fondo claro.

## Parámetros del motor (src/01-core.js)

- Conversión base 1,2 %; CTR base 1,2 %; fase de aprendizaje de 3 días; presupuesto mínimo $ 5.000 y puja mínima $ 50.
- Calidad: factor 0,45 + puntaje/100. Precio frente a referencia: 1,15 a 0,55. Ticket alto convierte menos.
- Alcance de audiencia: efecto sobre impresiones con exponente 0,6.
- Caso práctico: 6 productos, 3 campañas, 30 días. Deja a la panela con ACOS sobre su margen y a la campaña Agro como la de menor ACOS.

## Pendiente o por validar

- Los otros dos proyectos previos (principios de diseño y simuladores anteriores) no estaban en el repositorio ni en el contexto de la sesión. Si existen, conviene contrastar este simulador con ellos.
- claude-mem no estaba disponible en el entorno de la sesión. Este archivo contiene la memoria lista para importar.
