# SENAVENTAS

Simuladores educativos de comercio electrónico y mercadeo digital para formación SENA, colegios, universidades y emprendimiento.

| Aplicación | Carpeta | Para qué sirve |
|---|---|---|
| **SENAVENTAS · Creador de Tiendas Virtuales** | raíz del repositorio (rama `claude/vigilant-keller-h42tsm`) | Crear, configurar, probar y publicar tiendas virtuales tipo WooCommerce y Shopify. |
| **SENA VENTAS LANDING PAGE** | [`landing/`](landing/README.md) | Crear landing pages de captación de clientes con formulario, WhatsApp Business, base de datos de leads en Excel y enlace público funcional. Incluye 4 plantillas (inmobiliaria, medicina u odontología, obra civil y remodelaciones, refrigeración) y creación desde cero con arrastrar y soltar. |

Las dos aplicaciones comparten la misma línea visual y funcionan en la nube (GitHub Pages), instaladas en el escritorio o como archivo portable.

## Publicación

El flujo `.github/workflows/pages.yml` publica la tienda en la raíz del sitio (cuando está en `main`) y la landing en `/landing/`. Activa **Settings → Pages → Source: GitHub Actions**.

Guía completa de SENA VENTAS LANDING PAGE: [landing/README.md](landing/README.md).
