/* ==========================================================================
   SENAVENTAS · Datos base: temas, presets, plugins, integraciones
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  const I = SV.IMG;

  /* ---------- Temas (plantillas) ---------- */
  SV.THEMES = [
    {
      id: 'minimal',
      name: 'Minimal Clean',
      tag: 'Recomendado',
      description: 'Estructura diáfana pensada para productos de moda, calzado o artesanías donde el protagonismo visual es primordial.',
      features: ['Carga ultra rápida (< 0.8s)', 'Checkout en una sola página', 'Banner de promociones rotativo'],
      schematic: 'minimal',
      layout: { hero: 'split', catalog: 'grid', header: 'light', card: 'soft' },
      vars: {
        primary: '#005f2e', primary2: '#007a3d', onPrimary: '#ffffff', accent: '#adedd3', onAccent: '#306d58',
        bg: '#ffffff', alt: '#eff4ff', alt2: '#e5eeff', card: '#ffffff', text: '#0b1c30', muted: '#3f493f',
        radius: '16px', fontHead: "'Plus Jakarta Sans', sans-serif", fontBody: "'Plus Jakarta Sans', sans-serif",
        dark: '#0b1c30', onDark: '#eaf1ff'
      },
      didactic: {
        title: 'Ficha didáctica: Tienda de productos de origen',
        text: 'Modelo B2C con catálogo corto, fotografías de producto y carrito lateral. Revisa cómo el margen bruto y el stock mínimo impactan el flujo de caja.',
        kpis: [['Conversión sim.', '3.8%'], ['Ticket promedio', '$77.250']]
      }
    },
    {
      id: 'boutique',
      name: 'Boutique Moderna',
      tag: 'Editorial',
      description: 'Enfoque visual inmersivo con galerías grandes, ideal para marcas gourmet, cosmética o diseñadores locales.',
      features: ['Lookbook con fotografía protagonista', 'Modo historia de marca integrado', 'Filtros avanzados por atributos'],
      schematic: 'boutique',
      layout: { hero: 'editorial', catalog: 'grid', header: 'light', card: 'editorial' },
      vars: {
        primary: '#2b6954', primary2: '#306d58', onPrimary: '#ffffff', accent: '#e9dccb', onAccent: '#5b4632',
        bg: '#fbfaf7', alt: '#f3efe8', alt2: '#e9e3d8', card: '#ffffff', text: '#1f1d1a', muted: '#5f5a52',
        radius: '6px', fontHead: "'DM Serif Display', Georgia, serif", fontBody: "'Plus Jakarta Sans', sans-serif",
        dark: '#1f1d1a', onDark: '#f3efe8'
      },
      didactic: {
        title: 'Ficha didáctica: Branding editorial',
        text: 'La narrativa de marca y la fotografía grande elevan el valor percibido. Compara el precio de referencia contra el precio con descuento en cada ficha.',
        kpis: [['Conversión sim.', '2.9%'], ['Ticket promedio', '$96.400']]
      }
    },
    {
      id: 'mayorista',
      name: 'Catálogo Mayorista',
      tag: 'B2B / Agrosena',
      description: 'Diseñado para pedidos por volumen, listas masivas de SKUs y cotizaciones agroindustriales o ferretería.',
      features: ['Tabla de pedido rápido con matriz de precios', 'Mínimos de compra configurables (MOQ)', 'Cotización imprimible en 1 clic'],
      schematic: 'mayorista',
      layout: { hero: 'compact', catalog: 'table', header: 'light', card: 'row' },
      vars: {
        primary: '#005e3f', primary2: '#007952', onPrimary: '#ffffff', accent: '#b0f0d6', onAccent: '#0b513d',
        bg: '#f8f9ff', alt: '#eef3fb', alt2: '#dce9ff', card: '#ffffff', text: '#0b1c30', muted: '#3f493f',
        radius: '8px', fontHead: "'Plus Jakarta Sans', sans-serif", fontBody: "'Plus Jakarta Sans', sans-serif",
        dark: '#213145', onDark: '#eaf1ff'
      },
      didactic: {
        title: 'Ficha didáctica: Comercio B2B por volumen',
        text: 'El pedido mínimo (MOQ) protege el margen del distribuidor. Practica cotizaciones con cantidades por lote y descuentos por volumen.',
        kpis: [['Conversión sim.', '6.1%'], ['Ticket promedio', '$1.240.000']]
      }
    },
    {
      id: 'aura',
      name: 'Joyería & Platería de Lujo',
      tag: 'Alta Gama / Lujo',
      description: "Preset 'Aura Gold': estética refinada y minimalista enfocada en piezas de alto valor, brillo y exclusividad artesanal.",
      features: ['Certificados de autenticidad', 'Zoom de alta resolución', 'Cálculo de seguro de envío'],
      schematic: 'aura',
      layout: { hero: 'overlay', catalog: 'grid', header: 'light', card: 'luxury' },
      vars: {
        primary: '#1c1814', primary2: '#9a7b38', onPrimary: '#faf8f5', accent: '#c5a059', onAccent: '#14110e',
        bg: '#faf8f5', alt: '#f4efe6', alt2: '#efe9df', card: '#ffffff', text: '#1c1814', muted: '#5e5343',
        radius: '14px', fontHead: "'Playfair Display', Georgia, serif", fontBody: "'Plus Jakarta Sans', sans-serif",
        dark: '#14110e', onDark: '#e7decd'
      },
      didactic: {
        title: 'Ficha didáctica: Comercio de alto valor percibido',
        text: 'El segmento de joyería fina requiere un margen objetivo del 65% al 78%, trazabilidad de metales (Ley 950 / Oro 18K) y pólizas de envío asegurado.',
        kpis: [['Conversión sim.', '3.4% (Alto)'], ['Ticket promedio', '$835.000']]
      }
    },
    {
      id: 'botanica',
      name: 'Cosmética & Cuidado Facial',
      tag: 'Belleza / Clean Skincare',
      description: "Preset 'Botánica Pura': diseño orgánico y suave enfocado en rutinas dermocosméticas, sellos limpios y combos de cuidado diario.",
      features: ['Rutinas y bundles con descuento', 'Barra de progreso de envío gratis', 'Sellos ecológicos y veganos'],
      schematic: 'botanica',
      layout: { hero: 'split', catalog: 'grid', header: 'light', card: 'soft' },
      vars: {
        primary: '#005f2e', primary2: '#007a3d', onPrimary: '#ffffff', accent: '#adedd3', onAccent: '#306d58',
        bg: '#f8f9ff', alt: '#eff4ff', alt2: '#e5eeff', card: '#ffffff', text: '#0b1c30', muted: '#3f493f',
        radius: '20px', fontHead: "'Plus Jakarta Sans', sans-serif", fontBody: "'Plus Jakarta Sans', sans-serif",
        dark: '#0b1c30', onDark: '#eaf1ff'
      },
      didactic: {
        title: 'Ficha didáctica D2C: Estrategia Skincare',
        text: 'Modelo Direct-to-Consumer: cesta media optimizada con rutinas guiadas, barra de progreso para envío gratis y muestreo educativo sin fricción.',
        kpis: [['Conversión sim.', '4.2%'], ['Ticket promedio', '$97.500']]
      }
    }
  ];

  SV.BRAND_COLORS = [
    { id: '', name: 'Color del tema', hex: '' },
    { id: 'green', name: 'Verde SENA', hex: '#007a3d' },
    { id: 'teal', name: 'Esmeralda', hex: '#007952' },
    { id: 'indigo', name: 'Azul Noche', hex: '#213145' },
    { id: 'gold', name: 'Oro Viejo', hex: '#9a7b38' },
    { id: 'terracota', name: 'Terracota', hex: '#b5532f' }
  ];

  /* ---------- Plugins didácticos ---------- */
  SV.PLUGINS = [
    { id: 'payments', name: 'Simulador Pasarela de Pagos (Nequi / Daviplata / PSE / Tarjeta)', tag: 'Pedagógico', icon: 'account_balance_wallet',
      text: 'Permite probar transacciones ficticias. Incluye tarjetas de prueba: 4242 4242 4242 4242 aprueba y 4000 0000 0000 0002 rechaza.',
      chips: [['credit_card', 'Sandbox PSE'], ['qr_code_2', 'Nequi QR'], ['receipt_long', 'Comprobante de prueba']] },
    { id: 'shipping', name: 'Cálculo de Envíos Nacionales', tag: 'Logística Colombia', icon: 'local_shipping',
      text: 'Calcula el flete por departamento (Bogotá, principales, resto del país y zonas remotas) y aplica envío gratis desde un umbral.',
      chips: [['pin_drop', 'Cobertura 32 Dptos'], ['calculate', 'Tarifa por zona']] },
    { id: 'seo', name: 'Optimizador SEO & Metadatos', tag: 'Marketing Digital', icon: 'travel_explore',
      text: 'Agrega título, descripción, etiquetas OpenGraph y sitemap.xml al sitio publicado. Muestra un puntaje SEO didáctico.',
      chips: [['analytics', 'Score SEO'], ['public', 'Sitemap XML']] },
    { id: 'whatsapp', name: 'Notificaciones por WhatsApp', tag: 'Comercio Conversacional', icon: 'chat',
      text: 'Botón flotante de chat y mensaje de confirmación de pedido formateado, listo para enviar por wa.me.',
      chips: [['send', 'Mensaje de pedido'], ['handshake', 'Cierre directo']] },
    { id: 'coupons', name: 'Cupones de Descuento', tag: 'Promoción', icon: 'confirmation_number',
      text: 'Habilita el campo de cupón en el carrito. Configura códigos porcentuales o de valor fijo.',
      chips: [['percent', 'Porcentaje'], ['payments', 'Valor fijo']] },
    { id: 'freeShippingBar', name: 'Barra de Progreso de Envío Gratis', tag: 'Ticket promedio', icon: 'moving',
      text: 'Muestra cuánto le falta al comprador para obtener envío gratis. Técnica de gamificación para subir la cesta media.',
      chips: [['trending_up', 'Upselling'], ['local_shipping', 'Umbral configurable']] },
    { id: 'reviews', name: 'Reseñas y Calificaciones', tag: 'Prueba social', icon: 'star',
      text: 'Muestra estrellas y número de reseñas en cada producto para trabajar la confianza del comprador.',
      chips: [['star_half', 'Estrellas'], ['forum', 'Conteo de reseñas']] },
    { id: 'wishlist', name: 'Lista de Deseos', tag: 'Retención', icon: 'favorite',
      text: 'Permite marcar productos favoritos en la tienda. Útil para explicar remarketing y audiencias personalizadas.',
      chips: [['favorite', 'Favoritos'], ['campaign', 'Remarketing']] }
  ];

  /* ---------- Integraciones simuladas (API externas) ---------- */
  SV.INTEGRATIONS = [
    { id: 'wompi', name: 'Wompi Sandbox', cat: 'Pagos', icon: 'account_balance', color: '#2c2a8c',
      desc: 'Pasarela de pagos de Bancolombia en modo pruebas. Recibe eventos transaction.updated.',
      fields: [{ key: 'publicKey', label: 'Llave pública', placeholder: 'pub_test_XXXXXXXX', pattern: '^pub_test_[A-Za-z0-9]{8,}$' },
               { key: 'eventsSecret', label: 'Secreto de eventos', placeholder: 'test_events_XXXX', pattern: '^test_events_[A-Za-z0-9]{4,}$' }],
      actions: [{ id: 'test_payment', label: 'Crear transacción de prueba' }, { id: 'list_transactions', label: 'Listar transacciones' }] },
    { id: 'mercadopago', name: 'Mercado Pago (Test)', cat: 'Pagos', icon: 'handshake', color: '#009ee3',
      desc: 'Credenciales de prueba para checkout Pro. Simula preferencias de pago.',
      fields: [{ key: 'accessToken', label: 'Access Token de prueba', placeholder: 'TEST-0000000000000000-000000-xxxx', pattern: '^TEST-[0-9A-Za-z\\-]{12,}$' }],
      actions: [{ id: 'create_preference', label: 'Crear preferencia de pago' }] },
    { id: 'siigo', name: 'Siigo Nube · Facturación DIAN', cat: 'Contabilidad', icon: 'receipt_long', color: '#0071ce',
      desc: 'Genera facturas electrónicas simuladas a partir de los pedidos de la tienda.',
      fields: [{ key: 'username', label: 'Usuario API', placeholder: 'correo@empresa.co', pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
               { key: 'accessKey', label: 'Access Key', placeholder: 'mínimo 16 caracteres', pattern: '^.{16,}$' }],
      actions: [{ id: 'invoice_last', label: 'Facturar último pedido' }, { id: 'sync_products', label: 'Sincronizar productos' }] },
    { id: 'alegra', name: 'Alegra Contabilidad', cat: 'Contabilidad', icon: 'calculate', color: '#00b19d',
      desc: 'Exporta ventas e inventario para conciliación contable del emprendimiento.',
      fields: [{ key: 'email', label: 'Correo', placeholder: 'correo@empresa.co', pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$' },
               { key: 'token', label: 'Token', placeholder: 'mínimo 12 caracteres', pattern: '^.{12,}$' }],
      actions: [{ id: 'export_sales', label: 'Exportar ventas del mes' }] },
    { id: 'sheets', name: 'Google Sheets · Inventario', cat: 'Productividad', icon: 'table_chart', color: '#188038',
      desc: 'Sincroniza el Kardex de inventario con una hoja de cálculo compartida del equipo.',
      fields: [{ key: 'sheetId', label: 'ID de la hoja', placeholder: '1AbC... (25+ caracteres)', pattern: '^[A-Za-z0-9_\\-]{25,}$' }],
      actions: [{ id: 'push_inventory', label: 'Enviar inventario a la hoja' }, { id: 'pull_stock', label: 'Traer stock desde la hoja' }] },
    { id: 'meta', name: 'Meta Commerce · Catálogo y Píxel', cat: 'Marketing', icon: 'campaign', color: '#0866ff',
      desc: 'Envía el catálogo a Facebook e Instagram Shops y registra eventos del píxel (ViewContent, AddToCart, Purchase).',
      fields: [{ key: 'pixelId', label: 'ID del Píxel', placeholder: '15 a 16 dígitos', pattern: '^[0-9]{15,16}$' },
               { key: 'catalogId', label: 'ID del Catálogo', placeholder: '15 a 16 dígitos', pattern: '^[0-9]{15,16}$' }],
      actions: [{ id: 'sync_catalog', label: 'Sincronizar catálogo' }, { id: 'pixel_report', label: 'Reporte de eventos del píxel' }] },
    { id: 'tiktok', name: 'TikTok Ads · Píxel y Shop', cat: 'Marketing', icon: 'music_note', color: '#111111',
      desc: 'Registra eventos de conversión y prepara el feed de productos para campañas en TikTok.',
      fields: [{ key: 'pixelCode', label: 'Código del Píxel', placeholder: 'C + 19 caracteres', pattern: '^C[A-Z0-9]{19}$' }],
      actions: [{ id: 'sync_feed', label: 'Generar feed de productos' }] },
    { id: 'whatsappapi', name: 'WhatsApp Business Cloud API', cat: 'Comunicación', icon: 'forum', color: '#25d366',
      desc: 'Envía plantillas de confirmación de pedido al comprador. Modo simulado sin costo por conversación.',
      fields: [{ key: 'phoneId', label: 'Phone Number ID', placeholder: '15 dígitos', pattern: '^[0-9]{15}$' },
               { key: 'token', label: 'Token temporal', placeholder: 'EAAG...', pattern: '^EAA[A-Za-z0-9]{10,}$' }],
      actions: [{ id: 'send_template', label: 'Enviar plantilla del último pedido' }] },
    { id: 'servientrega', name: 'Servientrega · Guías', cat: 'Logística', icon: 'local_shipping', color: '#00843d',
      desc: 'Cotiza fletes y genera guías de envío simuladas para los pedidos pendientes.',
      fields: [{ key: 'client', label: 'Código de cliente', placeholder: '6 a 10 dígitos', pattern: '^[0-9]{6,10}$' },
               { key: 'apiKey', label: 'API Key', placeholder: 'SRV-XXXX-XXXX', pattern: '^SRV-[A-Z0-9]{4}-[A-Z0-9]{4}$' }],
      actions: [{ id: 'quote', label: 'Cotizar envío a Medellín (2 kg)' }, { id: 'guides', label: 'Generar guías de pedidos pendientes' }] },
    { id: 'mailchimp', name: 'Mailchimp · Email Marketing', cat: 'Marketing', icon: 'mail', color: '#ffe01b',
      desc: 'Agrega los compradores a una audiencia para campañas de recompra.',
      fields: [{ key: 'apiKey', label: 'API Key', placeholder: 'xxxxxxxx-us21', pattern: '^[a-f0-9]{8,}-us[0-9]{1,2}$' }],
      actions: [{ id: 'sync_customers', label: 'Sincronizar compradores' }] },
    { id: 'ga4', name: 'Google Analytics 4', cat: 'Analítica', icon: 'monitoring', color: '#e37400',
      desc: 'Mide visitas y el embudo de comercio electrónico (view_item, add_to_cart, purchase).',
      fields: [{ key: 'measurementId', label: 'ID de medición', placeholder: 'G-XXXXXXXXXX', pattern: '^G-[A-Z0-9]{6,12}$' }],
      actions: [{ id: 'funnel', label: 'Ver embudo simulado' }] }
  ];

  SV.WEBHOOK_EVENTS = ['order.created', 'order.updated', 'product.created', 'product.updated', 'product.deleted', 'stock.low', 'store.published'];

  SV.DEPARTAMENTOS = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'];
  SV.SHIPPING_ZONES = {
    local: { label: 'Bogotá D.C.', deps: ['Bogotá D.C.'], price: 8500, days: '1 a 2 días' },
    principal: { label: 'Ciudades principales', deps: ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Santander', 'Risaralda', 'Caldas', 'Quindío', 'Bolívar', 'Boyacá', 'Tolima', 'Huila', 'Meta'], price: 12000, days: '2 a 4 días' },
    remota: { label: 'Zonas de difícil acceso', deps: ['Amazonas', 'San Andrés y Providencia', 'Vaupés', 'Guainía', 'Vichada', 'Guaviare', 'Putumayo', 'Chocó'], price: 28000, days: '5 a 9 días' },
    nacional: { label: 'Resto del país', deps: [], price: 15000, days: '3 a 6 días' }
  };

  /* ---------- Presets de contenido por tema ---------- */
  const P = (o) => Object.assign({ compareAt: 0, minStock: 5, status: 'publicado', rating: 4.8, reviews: 12, sold: 0, moq: 1, badge: '', origin: '' }, o);

  SV.PRESETS = {
    minimal: {
      store: {
        name: 'Artesanías & Café del Quindío', slogan: 'Tradición artesanal y granos seleccionados directo del productor.',
        icon: 'storefront', announcement: 'Envíos gratis a toda Colombia por compras mayores a $100.000 COP',
        heroBadge: '100% Colombiano • Comercio Sostenible y Auténtico', heroTitle: 'Sabores y Tradiciones de', heroHighlight: 'Nuestra Tierra',
        heroText: 'Tienda modelo desarrollada por aprendices SENA en el programa de Gestión de Mercados y Comercio Electrónico. Descubre café de origen, artesanías y tesoros de nuestro campo.',
        heroImage: I.heroCafe, heroCardTitle: 'Artesanos de los Andes & Caribe', heroCardText: 'Colección destacada',
        ctaPrimary: 'Explorar Catálogo', ctaSecondary: 'Ver Mi Carrito',
        promo: { enabled: true, badge: 'Kit Regalo', title: 'Kit Cafetero: 2 cafés de origen + miel de cordillera', text: 'Café Especial Huila 500g + Café de Altura Suave 500g + Miel de Cordillera 250ml. Ideal para regalo empresarial.', price: 76900, compareAt: 90500, productIds: ['p1', 'p6', 'p3'] },
        trustTitle: 'Nuestros Valores de Origen', trustText: 'En este ejercicio práctico el aprendiz documenta la procedencia y el valor agregado del producto local.',
        trust: [{ icon: 'agriculture', title: 'Comercio justo', text: 'Compra directa a asociaciones campesinas del Huila, Quindío y La Guajira.' },
                { icon: 'verified', title: 'Calidad de origen', text: 'Productos con trazabilidad desde la finca o el taller artesanal.' },
                { icon: 'recycling', title: 'Empaque sostenible', text: 'Bolsas kraft compostables y cajas de cartón reciclado.' }],
        aboutTitle: 'Impulsando el Comercio Electrónico Regional',
        aboutText: 'Esta tienda virtual es el resultado del proyecto integrador desarrollado en el Centro de Comercio y Servicios SENA. A través de este prototipo se valida la arquitectura de información, la gestión de inventarios y el embudo de conversión para marcas colombianas.',
        freeShippingThreshold: 100000, shippingFlat: 12000
      },
      categories: ['Cafés & Bebidas', 'Artesanías', 'Alimentos', 'Moda & Textil'],
      products: [
        P({ id: 'p1', sku: 'CAF-001', name: 'Café Especial Origen Huila 500g', category: 'Cafés & Bebidas', price: 32000, cost: 18500, stock: 45, image: I.cafeKraft, origin: 'Origen Huila • 500g', badge: 'Más vendido', sold: 128, rating: 4.9, reviews: 48, description: 'Café de altura con notas a panela y frutos rojos. Tostión media, molienda a elección.' }),
        P({ id: 'p2', sku: 'ART-104', name: 'Mochila Wayúu Artesanal Tejida', category: 'Artesanías', price: 120000, cost: 75000, stock: 4, image: I.mochilaEstudio, origin: 'La Guajira • Hecho a mano', sold: 41, rating: 5, reviews: 29, description: 'Tejida a mano en una sola hebra por artesanas wayúu. Diseño geométrico Kanaas.' }),
        P({ id: 'p3', sku: 'ALM-018', name: 'Miel de Abejas Pura de Cordillera 250ml', category: 'Alimentos', price: 24000, cost: 13000, stock: 28, image: I.mielFrasco, origin: 'Cordillera Central • 250ml', sold: 63, rating: 4.7, reviews: 16, description: 'Miel cruda multifloral sin pasteurizar, cosechada por apicultores de la cordillera.' }),
        P({ id: 'p4', sku: 'ALM-045', name: 'Chocolatinas Artesanales Cacao 70%', category: 'Alimentos', price: 16500, cost: 9800, stock: 0, status: 'borrador', image: I.chocolate, origin: 'Tumaco • 70% cacao', sold: 22, rating: 4.6, reviews: 9, description: 'Chocolate de origen con cacao fino de aroma. Endulzado con panela orgánica.' }),
        P({ id: 'p5', sku: 'ART-201', name: 'Sombrero Vueltiao Tradicional 19 Vueltas', category: 'Artesanías', price: 185000, compareAt: 210000, cost: 110000, stock: 8, image: I.sombreroEstudio, origin: 'Córdoba • 19 vueltas', badge: 'Símbolo nacional', sold: 17, rating: 5, reviews: 52, description: 'Tejido en caña flecha por artesanos zenúes de Tuchín, Córdoba.' }),
        P({ id: 'p6', sku: 'CAF-002', name: 'Café Especial de Altura Suave', category: 'Cafés & Bebidas', price: 34500, compareAt: 42000, cost: 19000, stock: 30, image: I.cafeBolsa, origin: 'Finca El Mirador • 500g', badge: 'Oferta', sold: 55, rating: 4.8, reviews: 31, description: 'Bolsa 500g, molienda media. Perfil suave con notas a chocolate y caramelo.' }),
        P({ id: 'p7', sku: 'ALM-019', name: 'Miel de Abejas Cruda Multiflora 750ml', category: 'Alimentos', price: 28000, cost: 15500, stock: 14, image: I.mielGoteo, origin: 'Sierra Nevada • 750ml', badge: 'Novedad', sold: 12, rating: 4.5, reviews: 16, description: 'Presentación familiar de miel cruda recolectada en la Sierra Nevada de Santa Marta.' }),
        P({ id: 'p8', sku: 'MOD-011', name: 'Mochila Wayúu Tradicional Kanaas', category: 'Moda & Textil', price: 135000, cost: 82000, stock: 6, image: I.mochilaExterior, origin: 'Uribia • Pieza única', sold: 9, rating: 4.9, reviews: 11, description: 'Pieza única con colores vivos, correa tejida y borlas tradicionales.' })
      ],
      coupons: [{ code: 'SENA2025', type: 'percent', value: 10, active: true }, { code: 'ENVIO5000', type: 'fixed', value: 5000, active: true }]
    },

    boutique: {
      store: {
        name: 'Casa Origen Gourmet', slogan: 'Despensa editorial de productores colombianos.', icon: 'restaurant',
        announcement: 'Nueva colección de temporada: microlotes y cacao fino de aroma',
        heroBadge: 'Colección Otoño • Edición limitada', heroTitle: 'El sabor de un territorio,', heroHighlight: 'contado en cada empaque.',
        heroText: 'Seleccionamos microlotes de café, cacao de Tumaco y mieles de altura para mesas que valoran la historia detrás del producto.',
        heroImage: I.heroArtesanias, heroCardTitle: 'Productores aliados', heroCardText: '12 familias en 5 departamentos',
        ctaPrimary: 'Ver la colección', ctaSecondary: 'Nuestra historia',
        promo: { enabled: true, badge: 'Caja Degustación', title: 'Caja Editorial: 3 cafés de microlote', text: 'Tres orígenes, tres perfiles de taza y una guía de catación impresa.', price: 89000, compareAt: 105000, productIds: ['b1', 'b4'] },
        trustTitle: 'Historia de Marca', trustText: 'La narrativa convierte un producto básico en una experiencia de compra.',
        trust: [{ icon: 'auto_stories', title: 'Relato de origen', text: 'Cada ficha cuenta quién, dónde y cómo se produjo.' },
                { icon: 'photo_camera', title: 'Fotografía editorial', text: 'Imágenes grandes con luz natural y estilismo de mesa.' },
                { icon: 'workspace_premium', title: 'Selección curada', text: 'Menos referencias, más valor percibido por referencia.' }],
        aboutTitle: 'Una despensa con sentido', aboutText: 'Casa Origen es un proyecto formativo que aplica branding editorial al comercio electrónico de alimentos gourmet colombianos.',
        freeShippingThreshold: 150000, shippingFlat: 14000
      },
      categories: ['Café de Microlote', 'Cacao & Chocolate', 'Mieles', 'Kits de Regalo'],
      products: [
        P({ id: 'b1', sku: 'GUR-CF1', name: 'Café Geisha Microlote 250g', category: 'Café de Microlote', price: 58000, compareAt: 64000, cost: 31000, stock: 18, image: I.cafeBolsa, origin: 'Nariño • 2.100 msnm', badge: 'Edición limitada', description: 'Notas florales a jazmín y bergamota. Proceso lavado, secado en marquesina.' }),
        P({ id: 'b2', sku: 'GUR-CH1', name: 'Tableta Cacao Fino 70% Tumaco', category: 'Cacao & Chocolate', price: 21000, cost: 11000, stock: 40, image: I.chocolate, origin: 'Tumaco • Cacao fino de aroma', description: 'Tableta de 80g con cacao de comunidades afro del Pacífico nariñense.' }),
        P({ id: 'b3', sku: 'GUR-MI1', name: 'Miel de Azahar Sierra Nevada', category: 'Mieles', price: 34000, cost: 18000, stock: 22, image: I.mielGoteo, origin: 'Sierra Nevada • 350g', description: 'Miel monofloral de azahar con cristalización natural y aroma cítrico.' }),
        P({ id: 'b4', sku: 'GUR-KT1', name: 'Kit Barista Origen Huila', category: 'Kits de Regalo', price: 76000, cost: 42000, stock: 10, image: I.cafeKraft, origin: 'Huila • 2 x 250g', badge: 'Regalo', description: 'Dos cafés del Huila con guía de métodos de preparación V60 y prensa francesa.' }),
        P({ id: 'b5', sku: 'GUR-MI2', name: 'Miel Cruda de Páramo', category: 'Mieles', price: 29000, cost: 15000, stock: 3, image: I.mielFrasco, origin: 'Boyacá • 250g', description: 'Recolectada en frailejonales del páramo con prácticas de apicultura responsable.' })
      ],
      coupons: [{ code: 'EDITORIAL15', type: 'percent', value: 15, active: true }]
    },

    mayorista: {
      store: {
        name: 'Agrosena Distribuciones', slogan: 'Abastecimiento por volumen para tiendas, cafés y hoteles.', icon: 'agriculture',
        announcement: 'Pedido mínimo por referencia • Precios por lote con IVA incluido • Despachos martes y jueves',
        heroBadge: 'Canal B2B • Clientes empresariales', heroTitle: 'Pedidos por volumen', heroHighlight: 'en un solo formulario.',
        heroText: 'Agrega cantidades por lote directamente en la tabla, revisa el pedido mínimo (MOQ) y genera tu cotización al instante.',
        heroImage: I.heroArtesanias, heroCardTitle: 'Despachos nacionales', heroCardText: 'Carga consolidada',
        ctaPrimary: 'Ir a la tabla de pedido', ctaSecondary: 'Ver cotización',
        promo: { enabled: true, badge: 'Volumen', title: 'Descuento por volumen: 5% en pedidos superiores a $2.000.000', text: 'Usa el cupón MAYORISTA5 en el carrito al superar el monto.', price: 0, compareAt: 0, productIds: [] },
        trustTitle: 'Condiciones Comerciales', trustText: 'Reglas claras reducen la fricción en la venta empresarial.',
        trust: [{ icon: 'inventory', title: 'MOQ por referencia', text: 'Cada producto indica la cantidad mínima por pedido.' },
                { icon: 'request_quote', title: 'Cotización inmediata', text: 'Descarga o imprime la cotización antes de confirmar.' },
                { icon: 'local_shipping', title: 'Carga consolidada', text: 'Tarifa de flete por zona para todo el pedido.' }],
        aboutTitle: 'Distribución agroindustrial formativa', aboutText: 'Agrosena Distribuciones es un caso práctico para aprender comercio B2B, listas de precios y logística de despacho por volumen.',
        freeShippingThreshold: 1500000, shippingFlat: 45000
      },
      categories: ['Café', 'Apícola', 'Cacao', 'Artesanías por lote'],
      products: [
        P({ id: 'm1', sku: 'B2B-CAF-12', name: 'Café Pergamino Seco x Arroba (12,5 kg)', category: 'Café', price: 480000, cost: 395000, stock: 60, moq: 2, image: I.cafeKraft, origin: 'Huila • Factor 90', description: 'Café pergamino seco tipo exportación para tostadores.' }),
        P({ id: 'm2', sku: 'B2B-CAF-05', name: 'Café Tostado Molido x 5 kg', category: 'Café', price: 210000, cost: 150000, stock: 35, moq: 3, image: I.cafeBolsa, origin: 'Quindío • Tostión media', description: 'Presentación institucional para cafeterías y hoteles.' }),
        P({ id: 'm3', sku: 'B2B-MIE-4L', name: 'Miel Pura x Galón (4 L)', category: 'Apícola', price: 150000, cost: 105000, stock: 24, moq: 2, image: I.mielFrasco, origin: 'Santander • Galón', description: 'Miel pura multifloral en galón de grado alimenticio.' }),
        P({ id: 'm4', sku: 'B2B-CAC-10', name: 'Cacao en Grano Fermentado x 10 kg', category: 'Cacao', price: 190000, cost: 140000, stock: 18, moq: 1, image: I.chocolate, origin: 'Tumaco • Fermentado 6 días', description: 'Cacao fino de aroma seco y fermentado para chocolatería.' }),
        P({ id: 'm5', sku: 'B2B-ART-SV', name: 'Sombrero Vueltiao x Docena', category: 'Artesanías por lote', price: 1380000, cost: 1080000, stock: 5, moq: 1, image: I.sombreroFino, origin: 'Tuchín • 15 vueltas', description: 'Docena de sombreros para tiendas de souvenirs y hoteles.' }),
        P({ id: 'm6', sku: 'B2B-ART-MW', name: 'Mochilas Wayúu Lote x 6', category: 'Artesanías por lote', price: 540000, cost: 420000, stock: 7, moq: 1, image: I.mochilaExterior, origin: 'La Guajira • Surtido', description: 'Lote surtido de seis mochilas de colores variados.' })
      ],
      coupons: [{ code: 'MAYORISTA5', type: 'percent', value: 5, active: true }]
    },

    aura: {
      store: {
        name: 'AURA Joyas & Platería Ancestral', slogan: 'Alta joyería y platería colombiana con trazabilidad.', icon: 'diamond',
        announcement: 'Cortesía SENA: 3 cuotas sin interés en orfebrería certificada • Envío asegurado a toda Colombia',
        heroBadge: 'Orfebrería Sostenible & Trazable', heroTitle: 'Brillo y Legado', heroHighlight: 'Ancestral Colombiano.',
        heroText: 'Piezas forjadas a mano por maestros orfebres en Mompox y Bogotá. Engaste de esmeraldas de Muzo certificadas y metales nobles reciclados con sello ético.',
        heroImage: I.heroAura, heroCardTitle: 'Certificado gemológico', heroCardText: 'Incluido en cada pieza',
        ctaPrimary: 'Ver Colección Exclusiva', ctaSecondary: 'Certificación de Autenticidad',
        promo: { enabled: false, badge: 'Edición limitada', title: 'Colección Esmeraldas Muzo', text: 'Piezas únicas con certificado CDTEC.', price: 0, compareAt: 0, productIds: [] },
        trustTitle: 'Trazabilidad Transparente para E-Commerce de Lujo', trustText: 'Sellos de origen y garantías simuladas para maximizar la conversión en clientes de alta renta.',
        trust: [{ icon: 'diamond', title: '100% Esmeraldas Muzo éticas', text: 'Gemas con certificado gemológico y origen documentado.' },
                { icon: 'workspace_premium', title: 'Ley 950', text: 'Plata fina certificada en piezas de filigrana momposina.' },
                { icon: 'verified_user', title: 'Garantía vitalicia', text: 'Mantenimiento anual gratuito de la orfebrería.' }],
        aboutTitle: 'Tienda modelo de alta joyería', aboutText: 'Configurada por aprendices del Centro de Comercio y Servicios SENA. Inspirada en la orfebrería precolombina y contemporánea.',
        freeShippingThreshold: 300000, shippingFlat: 25000
      },
      categories: ['Anillos', 'Collares', 'Aretes', 'Pulseras'],
      products: [
        P({ id: 'a1', sku: 'AUR-AN-01', name: 'Anillo Solitario Esmeralda Muzo & Oro 18K', category: 'Anillos', price: 1850000, compareAt: 2100000, cost: 520000, stock: 2, minStock: 1, image: I.anilloEsmeralda, origin: 'Alta Joyería Andina', badge: 'Edición limitada', description: 'Gema de 1.2 quilates con certificación gemológica CDTEC. Montura artesanal pulida a espejo.' }),
        P({ id: 'a2', sku: 'AUR-CO-01', name: 'Gargantilla Filigrana Momposina en Plata 950', category: 'Collares', price: 420000, cost: 120000, stock: 6, minStock: 2, image: I.gargantillaFiligrana, origin: 'Platería Mompox', badge: 'Artesanal certificado', description: 'Tejido en hilos de plata pura por maestros del Río Magdalena. Cierre de seguridad.' }),
        P({ id: 'a3', sku: 'AUR-AR-01', name: 'Aretes Cascada Gotas de Oro y Perla Cultivada', category: 'Aretes', price: 380000, cost: 105000, stock: 9, minStock: 2, image: I.aretesPerla, origin: 'Perlas & Oro', badge: 'Más vendido', description: 'Diseño contemporáneo ligero de 4.8 gramos. Poste hipoalergénico con broche reforzado.' }),
        P({ id: 'a4', sku: 'AUR-PU-01', name: 'Pulsera Eslabón Veneciano con Broche Seguro', category: 'Pulseras', price: 690000, cost: 190000, stock: 5, minStock: 2, image: I.pulseraVeneciana, origin: 'Esenciales Clásicos', description: 'Eslabones macizos entrelazados. Longitud adaptable de 17 a 19 cm. Plata Ley 925 baño oro.' })
      ],
      coupons: [{ code: 'AURA10', type: 'percent', value: 10, active: true }]
    },

    botanica: {
      store: {
        name: 'BOTÁNICA Cosmética & Bio-Skincare Andino', slogan: 'Cosmética limpia con biodiversidad colombiana.', icon: 'local_florist',
        announcement: 'Cuidado facial limpio: envíos gratis a toda Colombia por compras mayores a $120.000 COP',
        heroBadge: 'Biotecnología Botánica & Comercio Justo Colombiano', heroTitle: 'Nutre tu piel con la botánica viva de nuestros', heroHighlight: 'Andes y selvas.',
        heroText: 'Cosmética limpia, formulada con aceites prensados en frío de Cacay, caléndula regenerativa y ácido hialurónico vegetal. Respaldada por la ciencia dermatológica.',
        heroImage: I.heroBotanica, heroCardTitle: 'Extracto de Cacay Puro', heroCardText: '+300% más retinol natural que la rosa mosqueta',
        ctaPrimary: 'Descubrir Rutina Ideal', ctaSecondary: 'Conocer Ingredientes',
        promo: { enabled: true, badge: 'Bundle Inteligente', title: 'Rutina Botánica 3 Pasos: Purificar, Regenerar & Proteger', text: 'Tónico de Caléndula (120ml) + Sérum Cacay & Vitamina C (30ml) + Filtro Mineral FPS 50+ (60ml).', price: 181050, compareAt: 213000, productIds: ['c3', 'c1', 'c4'] },
        trustTitle: 'Ingredientes Limpios de Origen Colombiano', trustText: 'El aprendiz documenta la procedencia sostenible y el valor agregado de la biodiversidad local.',
        trust: [{ icon: 'forest', title: 'Nuez de Cacay (Orinoquía)', text: 'Comercio justo con comunidades recolectoras. Cero deforestación.' },
                { icon: 'energy_savings_leaf', title: 'Caléndula Andina (Cundinamarca)', text: 'Cultivada orgánicamente a 2.400 metros con alta potencia desinflamatoria.' },
                { icon: 'water', title: 'Hidrolato de Rosas (Silvania)', text: 'Destilado al vapor en pequeños lotes. Libre de alcohol y parabenos.' }],
        aboutTitle: 'Bio-negocios digitales', aboutText: 'Tienda modelo implementada para la formación en gestión de comercio electrónico y bio-negocios digitales en el SENA.',
        freeShippingThreshold: 120000, shippingFlat: 8500
      },
      categories: ['Sérums Concentrados', 'Hidratación Diaria', 'Solares & Escudos', 'Tónicos'],
      products: [
        P({ id: 'c1', sku: 'BOT-SER-30', name: 'Sérum Renovador de Cacay & Vitamina C 30ml', category: 'Sérums Concentrados', price: 89000, cost: 31000, stock: 24, image: I.serumCacay, origin: 'Cacay del Meta & Vitamina C', badge: 'Bestseller Piel Radiante', description: 'Tratamiento intensivo con retinol natural, omega 6 y ácido ferúlico botánico.' }),
        P({ id: 'c2', sku: 'BOT-CRE-50', name: 'Crema Hidratante Facial con Ácido Hialurónico 50g', category: 'Hidratación Diaria', price: 65000, cost: 22000, stock: 18, image: I.cremaHialuronico, origin: 'Ácido Hialurónico Vegetal', badge: 'Textura Gel-Crema', description: 'Emulsión ligera no comedogénica con centella asiática y ceramidas vegetales.' }),
        P({ id: 'c3', sku: 'BOT-TON-120', name: 'Tónico Calmante de Caléndula y Rosas 120ml', category: 'Tónicos', price: 48000, cost: 15000, stock: 35, image: I.tonicoCalendula, origin: 'Caléndula & Rosas de Silvania', badge: 'Piel Sensible', description: 'Bruma tónica balanceadora de pH. Alivia rojeces y prepara los poros.' }),
        P({ id: 'c4', sku: 'BOT-SPF-60', name: 'Protector Solar Mineral Fluido Invisible 60ml', category: 'Solares & Escudos', price: 76000, cost: 27000, stock: 40, image: I.protectorSolar, origin: 'Óxido de Zinc • FPS 50+', badge: 'Filtro Mineral', description: 'Acabado mate sin rastro blanco. Protección UVA/UVB y contra luz azul.' }),
        P({ id: 'c5', sku: 'BOT-BAL-10', name: 'Bálsamo Labial de Cacay 10g', category: 'Hidratación Diaria', price: 22000, cost: 7000, stock: 50, status: 'borrador', image: '', origin: 'Cacay & Cera de Abejas', description: 'Bálsamo reparador. Pendiente: cargar fotografía del producto para publicarlo.' })
      ],
      coupons: [{ code: 'BOTANICA15', type: 'percent', value: 15, active: true }]
    }
  };
})(window.SV);
