/* ==========================================================================
   SENA VENTAS LANDING PAGE · Catálogos: fuentes, paletas, redes, bloques
   y plantillas (Inmobiliaria, Salud, Obra civil, Refrigeración, Desde cero)
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  /* ---------- Tipografías (Google Fonts) ---------- */
  SV.FONTS = [
    ['Plus Jakarta Sans', 'sans'], ['Inter', 'sans'], ['Poppins', 'sans'], ['Montserrat', 'sans'], ['Roboto', 'sans'],
    ['Open Sans', 'sans'], ['Lato', 'sans'], ['Nunito', 'sans'], ['Raleway', 'sans'], ['Work Sans', 'sans'],
    ['DM Sans', 'sans'], ['Manrope', 'sans'], ['Outfit', 'sans'], ['Sora', 'sans'], ['Rubik', 'sans'],
    ['Quicksand', 'sans'], ['Barlow', 'sans'], ['Archivo', 'sans'], ['Space Grotesk', 'sans'], ['Source Sans 3', 'sans'],
    ['Oswald', 'display'], ['Bebas Neue', 'display'], ['Anton', 'display'], ['Righteous', 'display'],
    ['Playfair Display', 'serif'], ['Merriweather', 'serif'], ['Lora', 'serif'], ['Libre Baskerville', 'serif'],
    ['Cormorant Garamond', 'serif'], ['DM Serif Display', 'serif']
  ].map(([name, kind]) => ({ name, kind }));

  SV.FONT_PAIRS = [
    { id: 'moderna', name: 'Moderna', head: 'Poppins', body: 'Inter' },
    { id: 'confianza', name: 'Confianza', head: 'Montserrat', body: 'Open Sans' },
    { id: 'elegante', name: 'Elegante', head: 'Playfair Display', body: 'Lato' },
    { id: 'salud', name: 'Cercana', head: 'Nunito', body: 'Nunito' },
    { id: 'industrial', name: 'Industrial', head: 'Oswald', body: 'Barlow' },
    { id: 'tecnica', name: 'Técnica', head: 'Space Grotesk', body: 'DM Sans' },
    { id: 'editorial', name: 'Editorial', head: 'DM Serif Display', body: 'Work Sans' },
    { id: 'impacto', name: 'Impacto', head: 'Bebas Neue', body: 'Rubik' },
    { id: 'sena', name: 'SENA', head: 'Plus Jakarta Sans', body: 'Plus Jakarta Sans' }
  ];

  /* ---------- Paletas rápidas ---------- */
  SV.PALETTES = [
    { name: 'Verde SENA', primary: '#007a3d', secondary: '#0b3d2c', accent: '#f2b705', bg: '#ffffff', surface: '#f3f8f5', text: '#10231a', muted: '#52645a', dark: '#0b2419' },
    { name: 'Azul confianza', primary: '#1d4ed8', secondary: '#0f2a5f', accent: '#f59e0b', bg: '#ffffff', surface: '#f2f6ff', text: '#0f172a', muted: '#475569', dark: '#0b1733' },
    { name: 'Turquesa salud', primary: '#0e9f9a', secondary: '#0b4f6c', accent: '#ff7a59', bg: '#ffffff', surface: '#effaf9', text: '#0c2a33', muted: '#4f6b73', dark: '#082f3a' },
    { name: 'Terracota obra', primary: '#d9480f', secondary: '#2b2d31', accent: '#fab005', bg: '#ffffff', surface: '#fbf5f1', text: '#1f2124', muted: '#5c5f66', dark: '#1b1c1f' },
    { name: 'Hielo técnico', primary: '#0284c7', secondary: '#0c4a6e', accent: '#22c55e', bg: '#ffffff', surface: '#f0f8fd', text: '#0b1f2e', muted: '#4b6272', dark: '#072235' },
    { name: 'Dorado premium', primary: '#9a7b3f', secondary: '#1c1a17', accent: '#d8b46a', bg: '#fbfaf7', surface: '#f3efe7', text: '#1c1a17', muted: '#6b645a', dark: '#161411' },
    { name: 'Violeta creativo', primary: '#7c3aed', secondary: '#2e1065', accent: '#f472b6', bg: '#ffffff', surface: '#f6f3ff', text: '#1e1b2e', muted: '#5b5670', dark: '#1a1033' },
    { name: 'Rojo urgencia', primary: '#dc2626', secondary: '#1f2937', accent: '#fbbf24', bg: '#ffffff', surface: '#fff5f5', text: '#1f2937', muted: '#4b5563', dark: '#111827' },
    { name: 'Modo oscuro', primary: '#22c55e', secondary: '#e2e8f0', accent: '#38bdf8', bg: '#0b1120', surface: '#131c31', text: '#e2e8f0', muted: '#94a3b8', dark: '#020617' }
  ];

  /* ---------- Redes sociales (íconos SVG propios) ---------- */
  SV.SOCIALS = [
    { id: 'whatsapp', label: 'WhatsApp', color: '#25d366', svg: '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.1 14.9l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 0 1 12 4z"/><path fill="currentColor" d="M9 7.5c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .6l-.4.6c-.1.2-.2.3 0 .6.4.7 1 1.4 1.7 1.9.6.5 1.1.7 1.4.8.2.1.4 0 .5-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1 1-.3 1.7-.4.6-1.5 1.1-2 1.1-.6.1-1.2.2-3.7-.8-3-1.3-4.9-4.4-5-4.6-.2-.2-1.2-1.6-1.2-3 0-1.5.8-2.2 1.1-2.5z"/>' },
    { id: 'facebook', label: 'Facebook', color: '#1877f2', svg: '<path fill="currentColor" d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8z"/>' },
    { id: 'instagram', label: 'Instagram', color: '#e1306c', svg: '<rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.3" fill="currentColor"/>' },
    { id: 'tiktok', label: 'TikTok', color: '#111111', svg: '<path fill="currentColor" d="M14 3h3c.3 2.2 1.8 3.8 4 4v3c-1.5 0-2.9-.5-4-1.3V15a6 6 0 1 1-6-6v3.2a2.8 2.8 0 1 0 3 2.8z"/>' },
    { id: 'youtube', label: 'YouTube', color: '#ff0000', svg: '<path fill="currentColor" fill-rule="evenodd" d="M6 5h12a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4zm4 4v6l5-3z"/>' },
    { id: 'linkedin', label: 'LinkedIn', color: '#0a66c2', svg: '<path fill="currentColor" d="M4 9h3.5v11H4zM5.75 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM10 9h3.4v1.6c.5-.9 1.7-1.9 3.5-1.9 3.6 0 4.1 2.3 4.1 5.3V20h-3.5v-5.3c0-1.3 0-2.9-1.8-2.9s-2.1 1.4-2.1 2.8V20H10z"/>' },
    { id: 'x', label: 'X', color: '#111111', svg: '<path fill="currentColor" d="M4 3h4.5l4.2 5.8L17.6 3H20l-6.2 7.3L21 21h-4.5l-4.6-6.3L6.4 21H4l6.8-7.9z"/>' },
    { id: 'telegram', label: 'Telegram', color: '#229ed9', svg: '<path fill="currentColor" d="M21.5 3.5 2.8 10.7c-1 .4-1 1.6 0 1.9l4.6 1.5 1.8 5.6c.2.7 1.1.9 1.6.4l2.6-2.4 4.6 3.4c.6.4 1.4.1 1.6-.6l3.2-15.2c.2-.9-.6-1.6-1.3-1.3zM9.6 14.3l8.7-7.6-6.9 8.9-.4 3z"/>' },
    { id: 'web', label: 'Sitio web', color: '#334155', svg: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" fill="none" stroke="currentColor" stroke-width="2"/>' }
  ];

  SV.ICONS = ['home', 'apartment', 'villa', 'house', 'cottage', 'key', 'real_estate_agent', 'handshake', 'request_quote', 'account_balance', 'gavel', 'location_on', 'map',
    'dentistry', 'medical_services', 'stethoscope', 'health_and_safety', 'vaccines', 'monitor_heart', 'child_care', 'emergency', 'local_hospital', 'favorite', 'spa', 'visibility', 'psychology',
    'construction', 'handyman', 'format_paint', 'plumbing', 'roofing', 'foundation', 'carpenter', 'engineering', 'architecture', 'bathtub', 'countertops', 'water_damage', 'imagesearch_roller',
    'ac_unit', 'kitchen', 'mode_fan', 'thermostat', 'build', 'bolt', 'water_drop', 'heat_pump', 'air', 'mode_cool', 'electrical_services',
    'local_shipping', 'schedule', 'verified', 'star', 'support_agent', 'payments', 'calendar_month', 'call', 'chat', 'mail', 'shield', 'workspace_premium', 'thumb_up',
    'groups', 'savings', 'eco', 'speed', 'check_circle', 'emoji_events', 'lightbulb', 'sell', 'percent', 'receipt_long', 'storefront', 'school', 'rocket_launch', 'diamond', 'pets', 'restaurant'];

  SV.LEAD_STATUSES = [
    { id: 'nuevo', label: 'Nuevo', chip: 'blue', icon: 'fiber_new' },
    { id: 'contactado', label: 'Contactado', chip: 'amber', icon: 'call' },
    { id: 'agendado', label: 'Cita / visita agendada', chip: 'green', icon: 'event_available' },
    { id: 'cliente', label: 'Cliente cerrado', chip: 'solid', icon: 'handshake' },
    { id: 'descartado', label: 'Descartado', chip: 'red', icon: 'block' }
  ];

  SV.FIELD_TYPES = [
    ['text', 'Texto corto', 'short_text'], ['tel', 'Teléfono / celular', 'call'], ['email', 'Correo', 'mail'], ['number', 'Número', 'pin'],
    ['select', 'Lista desplegable', 'arrow_drop_down_circle'], ['radio', 'Opción única', 'radio_button_checked'], ['checkbox', 'Casillas (varias)', 'check_box'],
    ['date', 'Fecha', 'calendar_month'], ['time', 'Hora', 'schedule'], ['textarea', 'Texto largo', 'notes'], ['hidden', 'Campo oculto', 'visibility_off']
  ];

  /* Campos estándar: se ubican en columnas propias de la base de datos. */
  SV.STD_KEYS = ['nombre', 'telefono', 'correo', 'servicio', 'mensaje'];

  const consent = {
    enabled: true,
    text: 'Autorizo el tratamiento de mis datos personales para ser contactado, según la Ley 1581 de 2012.',
    policy: 'En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, la empresa informa que los datos que registras en este formulario se usan para responder tu solicitud, agendar citas o visitas y enviarte información comercial relacionada con nuestros servicios. Puedes conocer, actualizar, rectificar o suprimir tus datos escribiendo al correo de contacto de esta página. No compartimos tu información con terceros sin tu autorización.'
  };
  const baseFields = (serviceLabel, services) => [
    { key: 'nombre', label: 'Nombre completo', type: 'text', required: true, placeholder: 'Ej: Laura Gómez', width: 'full', options: [] },
    { key: 'telefono', label: 'Celular / WhatsApp', type: 'tel', required: true, placeholder: '300 123 4567', width: 'half', options: [] },
    { key: 'correo', label: 'Correo electrónico', type: 'email', required: false, placeholder: 'tucorreo@gmail.com', width: 'half', options: [] },
    { key: 'servicio', label: serviceLabel, type: 'select', required: true, placeholder: 'Selecciona una opción', width: 'full', options: services }
  ];
  SV.baseFields = baseFields;

  /* ======================================================================
     BLOQUES: definición, valores por defecto y campos del inspector
     t: text | textarea | image | icon | select | toggle | number | color | link | list | code | datetime
     ====================================================================== */
  const F = (k, t, l, extra) => Object.assign({ k, t, l }, extra || {});
  const HEAD = [F('eyebrow', 'text', 'Antetítulo'), F('title', 'text', 'Título'), F('text', 'textarea', 'Texto de apoyo')];
  const COLS = F('columns', 'select', 'Columnas en escritorio', { o: [['2', '2 columnas'], ['3', '3 columnas'], ['4', '4 columnas']] });
  const BTN = (p, label) => [F(p + 'Text', 'text', label + ' · texto'), F(p + 'Href', 'link', label + ' · acción')];

  SV.BLOCK_CATS = [
    ['captacion', 'Captación de leads', 'ads_click'],
    ['estructura', 'Estructura', 'view_quilt'],
    ['contenido', 'Contenido', 'article'],
    ['confianza', 'Confianza', 'verified'],
    ['multimedia', 'Multimedia e incrustaciones', 'perm_media']
  ];

  SV.BLOCKS = {
    header: {
      label: 'Encabezado y menú', icon: 'web_asset', cat: 'estructura', desc: 'Logo, menú de secciones y botón de contacto.',
      defaults: { logoText: '', logoImage: '', logoIcon: 'storefront', links: [{ text: 'Servicios', href: '#servicios' }, { text: 'Contacto', href: 'form' }], ctaText: 'Escríbenos', ctaHref: 'wa', sticky: true, showPhone: true },
      fields: [F('logoText', 'text', 'Nombre en el logo', { h: 'Vacío: usa el nombre de la empresa.' }), F('logoImage', 'image', 'Logo (imagen)', { small: true }), F('logoIcon', 'icon', 'Ícono del logo (si no hay imagen)'),
        F('links', 'list', 'Enlaces del menú', { lbl: 'text', add: { text: 'Nuevo enlace', href: '#' }, item: [F('text', 'text', 'Texto'), F('href', 'link', 'Destino')] }),
        ...BTN('cta', 'Botón'), F('showPhone', 'toggle', 'Mostrar teléfono'), F('sticky', 'toggle', 'Menú fijo al desplazar')]
    },
    hero: {
      label: 'Portada (hero)', icon: 'featured_video', cat: 'captacion', desc: 'Primera pantalla: promesa de valor, imagen y llamadas a la acción. Puede incluir el formulario.',
      defaults: { layout: 'form', eyebrow: '', title: 'Tu título con la promesa de valor', highlight: '', text: 'Explica en una frase el beneficio principal para tu cliente ideal.', image: 'art:abstracto', bullets: [], cta1Text: 'Quiero información', cta1Href: 'form', cta2Text: 'WhatsApp', cta2Href: 'wa', formTitle: 'Déjanos tus datos', formText: 'Te contactamos en menos de 24 horas.', badge: '' },
      style: { variant: 'soft', pad: 'l' },
      fields: [F('layout', 'select', 'Distribución', { o: [['form', 'Texto + formulario'], ['image', 'Texto + imagen'], ['center', 'Centrado'], ['cover', 'Imagen de fondo completa']] }),
        F('eyebrow', 'text', 'Antetítulo'), F('title', 'textarea', 'Título principal'), F('highlight', 'text', 'Palabra resaltada', { h: 'Se muestra con el color de acento al final del título.' }), F('text', 'textarea', 'Subtítulo'),
        F('image', 'image', 'Imagen'), F('badge', 'text', 'Sello de confianza', { h: 'Ej: ★ 4.9 · 300 clientes felices' }),
        F('bullets', 'list', 'Beneficios en viñetas', { lbl: 'text', add: { text: 'Nuevo beneficio' }, item: [F('text', 'text', 'Beneficio')] }),
        ...BTN('cta1', 'Botón principal'), ...BTN('cta2', 'Botón secundario'),
        F('formTitle', 'text', 'Título del formulario'), F('formText', 'text', 'Texto del formulario')]
    },
    form: {
      label: 'Formulario de contacto', icon: 'contact_mail', cat: 'captacion', desc: 'Sección para capturar los datos del interesado. Los campos se configuran en Formulario & Captación.',
      defaults: { layout: 'split', eyebrow: 'Contáctanos', title: 'Recibe asesoría sin costo', text: 'Completa el formulario y un asesor te contacta hoy mismo.', bullets: [{ icon: 'schedule', text: 'Respuesta en menos de 2 horas hábiles' }, { icon: 'verified', text: 'Asesoría sin compromiso' }, { icon: 'lock', text: 'Tus datos están protegidos' }], image: '', showContact: true, formTitle: '', button: '' },
      style: { anchor: 'contacto', variant: 'soft' },
      fields: [F('layout', 'select', 'Distribución', { o: [['split', 'Texto + formulario'], ['center', 'Formulario centrado'], ['image', 'Imagen + formulario']] }), ...HEAD,
        F('bullets', 'list', 'Razones para escribir', { lbl: 'text', add: { icon: 'check_circle', text: 'Nueva razón' }, item: [F('icon', 'icon', 'Ícono'), F('text', 'text', 'Texto')] }),
        F('image', 'image', 'Imagen (distribución con imagen)'), F('showContact', 'toggle', 'Mostrar teléfono, correo y dirección'), F('formTitle', 'text', 'Título dentro de la tarjeta')]
    },
    features: {
      label: 'Servicios / beneficios', icon: 'grid_view', cat: 'contenido', desc: 'Tarjetas con ícono, título, texto y precio opcional.',
      defaults: { eyebrow: 'Servicios', title: 'Lo que hacemos por ti', text: '', columns: '3', look: 'cards', items: [{ icon: 'verified', title: 'Servicio 1', text: 'Describe el beneficio.', price: '', linkText: '', link: 'form' }] },
      style: { anchor: 'servicios' },
      fields: [...HEAD, COLS, F('look', 'select', 'Estilo', { o: [['cards', 'Tarjetas'], ['icons', 'Íconos grandes centrados'], ['list', 'Lista con ícono a la izquierda']] }),
        F('items', 'list', 'Servicios', { lbl: 'title', add: { icon: 'star', title: 'Nuevo servicio', text: 'Descripción breve del servicio.', price: '', linkText: '', link: 'form' }, item: [F('icon', 'icon', 'Ícono'), F('title', 'text', 'Título'), F('text', 'textarea', 'Descripción'), F('price', 'text', 'Precio o dato (opcional)'), F('linkText', 'text', 'Texto del enlace (opcional)'), F('link', 'link', 'Acción del enlace')] })]
    },
    cards: {
      label: 'Tarjetas con imagen', icon: 'view_module', cat: 'contenido', desc: 'Inmuebles, proyectos, tratamientos o equipos con foto, precio y botón "Me interesa".',
      defaults: { eyebrow: 'Portafolio', title: 'Opciones destacadas', text: '', columns: '3', filters: true, items: [] },
      style: { anchor: 'portafolio' },
      fields: [...HEAD, COLS, F('filters', 'toggle', 'Filtros por etiqueta'),
        F('items', 'list', 'Tarjetas', { lbl: 'title', add: { image: 'art:casa', badge: 'Nuevo', title: 'Nueva tarjeta', subtitle: 'Ubicación o detalle', price: '', specs: '', btnText: 'Me interesa', btnAction: 'wa', btnUrl: '' },
          item: [F('image', 'image', 'Imagen'), F('badge', 'text', 'Etiqueta (sirve de filtro)'), F('title', 'text', 'Título'), F('subtitle', 'text', 'Subtítulo'), F('price', 'text', 'Precio'), F('specs', 'text', 'Características (sepáralas con ·)'), F('btnText', 'text', 'Texto del botón'),
            F('btnAction', 'select', 'Acción del botón', { o: [['wa', 'WhatsApp con el nombre de la tarjeta'], ['form', 'Ir al formulario (preselecciona el interés)'], ['url', 'Abrir enlace']] }), F('btnUrl', 'text', 'Enlace (si la acción es abrir enlace)')] })]
    },
    about: {
      label: 'Nosotros (imagen + texto)', icon: 'vertical_split', cat: 'contenido', desc: 'Historia, experiencia y diferenciales de la empresa.',
      defaults: { eyebrow: 'Nosotros', title: 'Experiencia que genera confianza', text: 'Cuenta quién es la empresa, a quién atiende y por qué es la mejor opción.', image: 'art:abstracto', side: 'left', bullets: [], ctaText: '', ctaHref: 'form', badgeValue: '', badgeLabel: '' },
      style: { anchor: 'nosotros' },
      fields: [...HEAD, F('image', 'image', 'Imagen'), F('side', 'select', 'Posición de la imagen', { o: [['left', 'Izquierda'], ['right', 'Derecha']] }),
        F('bullets', 'list', 'Diferenciales', { lbl: 'text', add: { text: 'Nuevo diferencial' }, item: [F('text', 'text', 'Texto')] }),
        F('badgeValue', 'text', 'Dato destacado (ej: 15+)'), F('badgeLabel', 'text', 'Etiqueta del dato'), ...BTN('cta', 'Botón')]
    },
    stats: {
      label: 'Cifras y logros', icon: 'monitoring', cat: 'confianza', desc: 'Números que generan confianza.',
      defaults: { title: '', items: [{ value: '10+', label: 'Años de experiencia', icon: 'workspace_premium' }, { value: '500+', label: 'Clientes atendidos', icon: 'groups' }, { value: '98%', label: 'Satisfacción', icon: 'thumb_up' }] },
      style: { variant: 'primary', pad: 's' },
      fields: [F('title', 'text', 'Título (opcional)'), F('items', 'list', 'Cifras', { lbl: 'label', add: { value: '100', label: 'Nuevo dato', icon: 'star' }, item: [F('icon', 'icon', 'Ícono'), F('value', 'text', 'Cifra'), F('label', 'text', 'Descripción')] })]
    },
    steps: {
      label: 'Proceso paso a paso', icon: 'timeline', cat: 'contenido', desc: 'Explica cómo trabajas en pasos numerados.',
      defaults: { eyebrow: 'Cómo funciona', title: 'Así de fácil', text: '', items: [{ title: 'Déjanos tus datos', text: 'Completa el formulario.' }, { title: 'Te llamamos', text: 'Un asesor te contacta.' }, { title: 'Solucionamos', text: 'Recibes el servicio.' }] },
      fields: [...HEAD, F('items', 'list', 'Pasos', { lbl: 'title', add: { title: 'Nuevo paso', text: 'Descripción del paso.' }, item: [F('title', 'text', 'Título'), F('text', 'textarea', 'Descripción')] })]
    },
    testimonials: {
      label: 'Testimonios', icon: 'reviews', cat: 'confianza', desc: 'Opiniones de clientes con calificación.',
      defaults: { eyebrow: 'Testimonios', title: 'Lo que dicen nuestros clientes', items: [{ name: 'Cliente satisfecho', role: 'Bogotá', text: 'Excelente servicio.', rating: '5', photo: 'art:avatar:0' }] },
      style: { variant: 'soft' },
      fields: [F('eyebrow', 'text', 'Antetítulo'), F('title', 'text', 'Título'),
        F('items', 'list', 'Testimonios', { lbl: 'name', add: { name: 'Nombre del cliente', role: 'Ciudad o cargo', text: 'Opinión del cliente.', rating: '5', photo: 'art:avatar:1' }, item: [F('photo', 'image', 'Foto', { small: true }), F('name', 'text', 'Nombre'), F('role', 'text', 'Ciudad o cargo'), F('text', 'textarea', 'Testimonio'), F('rating', 'select', 'Calificación', { o: [['5', '★★★★★'], ['4', '★★★★'], ['3', '★★★'], ['0', 'Sin estrellas']] })] })]
    },
    team: {
      label: 'Equipo / profesionales', icon: 'badge', cat: 'confianza', desc: 'Médicos, asesores o técnicos con foto y cargo.',
      defaults: { eyebrow: 'Equipo', title: 'Profesionales a tu servicio', text: '', items: [{ photo: 'art:avatar:0', name: 'Nombre', role: 'Cargo', text: '' }] },
      fields: [...HEAD, F('items', 'list', 'Personas', { lbl: 'name', add: { photo: 'art:avatar:2', name: 'Nombre', role: 'Cargo', text: '' }, item: [F('photo', 'image', 'Foto', { small: true }), F('name', 'text', 'Nombre'), F('role', 'text', 'Cargo o especialidad'), F('text', 'textarea', 'Descripción corta')] })]
    },
    gallery: {
      label: 'Galería de fotos', icon: 'photo_library', cat: 'multimedia', desc: 'Fotos de trabajos, instalaciones o inmuebles con vista ampliada.',
      defaults: { eyebrow: 'Galería', title: 'Nuestros trabajos', columns: '3', items: [{ image: 'art:abstracto', caption: '' }] },
      fields: [F('eyebrow', 'text', 'Antetítulo'), F('title', 'text', 'Título'), COLS, F('items', 'list', 'Fotos', { lbl: 'caption', add: { image: 'art:abstracto', caption: 'Descripción' }, item: [F('image', 'image', 'Imagen'), F('caption', 'text', 'Descripción')] })]
    },
    pricing: {
      label: 'Planes y precios', icon: 'sell', cat: 'contenido', desc: 'Paquetes o tarifas con el plan recomendado resaltado.',
      defaults: { eyebrow: 'Planes', title: 'Elige tu plan', text: '', items: [{ name: 'Básico', price: '$100.000', period: 'por servicio', features: 'Beneficio 1\nBeneficio 2', highlight: false, btnText: 'Lo quiero', btnHref: 'form' }] },
      style: { anchor: 'planes' },
      fields: [...HEAD, F('items', 'list', 'Planes', { lbl: 'name', add: { name: 'Nuevo plan', price: '$0', period: 'por servicio', features: 'Beneficio 1\nBeneficio 2', highlight: false, btnText: 'Lo quiero', btnHref: 'form' }, item: [F('name', 'text', 'Nombre del plan'), F('price', 'text', 'Precio'), F('period', 'text', 'Periodo o condición'), F('features', 'textarea', 'Beneficios (uno por línea)'), F('highlight', 'toggle', 'Plan recomendado'), F('btnText', 'text', 'Texto del botón'), F('btnHref', 'link', 'Acción del botón')] })]
    },
    faq: {
      label: 'Preguntas frecuentes', icon: 'quiz', cat: 'contenido', desc: 'Resuelve objeciones antes de que el cliente escriba.',
      defaults: { eyebrow: 'Preguntas frecuentes', title: 'Resolvemos tus dudas', items: [{ q: '¿Pregunta?', a: 'Respuesta.' }] },
      style: { anchor: 'preguntas' },
      fields: [F('eyebrow', 'text', 'Antetítulo'), F('title', 'text', 'Título'), F('items', 'list', 'Preguntas', { lbl: 'q', add: { q: 'Nueva pregunta', a: 'Respuesta.' }, item: [F('q', 'text', 'Pregunta'), F('a', 'textarea', 'Respuesta')] })]
    },
    cta: {
      label: 'Banner de llamada a la acción', icon: 'campaign', cat: 'captacion', desc: 'Franja de alto contraste con botones a formulario y WhatsApp.',
      defaults: { title: '¿Listo para empezar?', text: 'Escríbenos hoy y recibe atención personalizada.', btn1Text: 'Quiero que me llamen', btn1Href: 'form', btn2Text: 'WhatsApp', btn2Href: 'wa' },
      style: { variant: 'primary' },
      fields: [F('title', 'text', 'Título'), F('text', 'textarea', 'Texto'), ...BTN('btn1', 'Botón 1'), ...BTN('btn2', 'Botón 2')]
    },
    countdown: {
      label: 'Oferta con cuenta regresiva', icon: 'timer', cat: 'captacion', desc: 'Promoción con fecha límite para generar urgencia.',
      defaults: { eyebrow: 'Oferta por tiempo limitado', title: '20% de descuento este mes', text: 'Aplica para solicitudes registradas antes de la fecha límite.', until: '', ctaText: 'Aprovechar oferta', ctaHref: 'form', expired: 'La promoción terminó. Escríbenos para conocer las ofertas vigentes.' },
      style: { variant: 'dark' },
      fields: [F('eyebrow', 'text', 'Antetítulo'), F('title', 'text', 'Título'), F('text', 'textarea', 'Texto'), F('until', 'datetime', 'Fecha y hora límite', { h: 'Vacío: 7 días desde hoy.' }), ...BTN('cta', 'Botón'), F('expired', 'text', 'Mensaje cuando termina')]
    },
    buttons: {
      label: 'Botonera libre', icon: 'smart_button', cat: 'captacion', desc: 'Grupo de botones con cualquier acción: WhatsApp, llamada, formulario o enlace.',
      defaults: { title: '', text: '', items: [{ text: 'Escríbenos por WhatsApp', href: 'wa', look: 'wa', icon: '' }, { text: 'Llámanos', href: 'tel', look: 'outline', icon: 'call' }] },
      style: { align: 'center', pad: 's' },
      fields: [F('title', 'text', 'Título (opcional)'), F('text', 'textarea', 'Texto (opcional)'), F('items', 'list', 'Botones', { lbl: 'text', add: { text: 'Nuevo botón', href: 'form', look: 'primary', icon: '' }, item: [F('text', 'text', 'Texto'), F('href', 'link', 'Acción'), F('look', 'select', 'Estilo', { o: [['primary', 'Color de marca'], ['accent', 'Color de acento'], ['outline', 'Contorno'], ['dark', 'Oscuro'], ['wa', 'WhatsApp verde']] }), F('icon', 'icon', 'Ícono (opcional)')] })]
    },
    text: {
      label: 'Texto libre', icon: 'notes', cat: 'contenido', desc: 'Párrafos libres. Usa **negrita** y líneas en blanco para separar párrafos.',
      defaults: { eyebrow: '', title: 'Título de la sección', body: 'Escribe aquí el contenido. Usa **negrita** para resaltar.\n\nDeja una línea en blanco para un nuevo párrafo.', narrow: true },
      fields: [F('eyebrow', 'text', 'Antetítulo'), F('title', 'text', 'Título'), F('body', 'textarea', 'Contenido', { rows: 8 }), F('narrow', 'toggle', 'Columna angosta (lectura cómoda)')]
    },
    image: {
      label: 'Imagen o banner', icon: 'image', cat: 'multimedia', desc: 'Imagen suelta, banner publicitario o infografía.',
      defaults: { src: 'art:abstracto', alt: 'Imagen', caption: '', link: '', width: 'container' },
      style: { pad: 's' },
      fields: [F('src', 'image', 'Imagen'), F('alt', 'text', 'Texto alternativo (accesibilidad y SEO)'), F('caption', 'text', 'Pie de foto'), F('link', 'link', 'Enlace al hacer clic', { allowEmpty: true }), F('width', 'select', 'Ancho', { o: [['narrow', 'Angosto'], ['container', 'Normal'], ['full', 'Toda la pantalla']] })]
    },
    video: {
      label: 'Video', icon: 'smart_display', cat: 'multimedia', desc: 'YouTube, Vimeo o archivo .mp4 por URL.',
      defaults: { eyebrow: '', title: 'Conoce cómo trabajamos', text: '', url: '' },
      fields: [...HEAD, F('url', 'text', 'URL del video', { h: 'Pega el enlace de YouTube (youtube.com/watch?v=... o youtu.be/...), Vimeo o un archivo .mp4.' })]
    },
    map: {
      label: 'Mapa y ubicación', icon: 'location_on', cat: 'multimedia', desc: 'Mapa de Google con dirección, horario y datos de contacto.',
      defaults: { eyebrow: 'Ubicación', title: 'Visítanos', address: '', schedule: '', showContact: true, embed: '' },
      style: { anchor: 'ubicacion' },
      fields: [F('eyebrow', 'text', 'Antetítulo'), F('title', 'text', 'Título'), F('address', 'text', 'Dirección para el mapa', { h: 'Vacío: usa la dirección y ciudad de la empresa.' }), F('schedule', 'textarea', 'Horario de atención'), F('showContact', 'toggle', 'Mostrar datos de contacto'), F('embed', 'text', 'URL de inserción personalizada (opcional)', { h: 'En Google Maps: Compartir → Incorporar un mapa → copia el src del iframe.' })]
    },
    embed: {
      label: 'Incrustación libre (HTML)', icon: 'code', cat: 'multimedia', desc: 'Pega código de terceros: calendarios de citas, chat, formularios, widgets de reseñas, publicaciones de redes o iframes.',
      defaults: { title: '', code: '<div style="padding:24px;border:2px dashed #94a3b8;border-radius:12px;text-align:center;font-family:sans-serif">Pega aquí el código HTML o &lt;iframe&gt; de tu herramienta</div>', height: '' },
      fields: [F('title', 'text', 'Título (opcional)'), F('code', 'code', 'Código HTML / iframe', { h: 'Acepta iframes (Calendly, Google Forms, YouTube, TikTok, Instagram) y scripts de widgets. Revisa que el código venga de una fuente confiable.' }), F('height', 'number', 'Alto mínimo en píxeles (opcional)')]
    },
    logos: {
      label: 'Clientes y aliados', icon: 'workspaces', cat: 'confianza', desc: 'Logos de empresas, aseguradoras, bancos o marcas.',
      defaults: { title: 'Empresas que confían en nosotros', items: [{ image: 'art:logo:0', name: 'Aliado' }] },
      style: { pad: 's' },
      fields: [F('title', 'text', 'Título'), F('items', 'list', 'Logos', { lbl: 'name', add: { image: 'art:logo:1', name: 'Aliado' }, item: [F('image', 'image', 'Logo', { small: true }), F('name', 'text', 'Nombre')] })]
    },
    social: {
      label: 'Redes sociales', icon: 'share', cat: 'multimedia', desc: 'Botones hacia las redes de la empresa (se configuran en Diseño & Marca).',
      defaults: { title: 'Síguenos en redes', text: 'Conoce nuestros trabajos, promociones y consejos.', look: 'buttons' },
      style: { align: 'center', pad: 's' },
      fields: [F('title', 'text', 'Título'), F('text', 'textarea', 'Texto'), F('look', 'select', 'Estilo', { o: [['buttons', 'Botones con nombre'], ['icons', 'Solo íconos'], ['brand', 'Botones con color de cada red']] })]
    },
    divider: {
      label: 'Espacio / separador', icon: 'horizontal_rule', cat: 'estructura', desc: 'Espacio vertical con línea opcional.',
      defaults: { height: '40', line: true },
      style: { pad: 'none' },
      fields: [F('height', 'number', 'Alto en píxeles'), F('line', 'toggle', 'Mostrar línea')]
    },
    footer: {
      label: 'Pie de página', icon: 'call_to_action', cat: 'estructura', desc: 'Datos de contacto, redes, política de datos y créditos.',
      defaults: { text: '', showContact: true, showSocial: true, legal: 'Política de tratamiento de datos', credits: true, links: [] },
      style: { variant: 'dark', pad: 's' },
      fields: [F('text', 'textarea', 'Texto descriptivo'), F('showContact', 'toggle', 'Mostrar contacto'), F('showSocial', 'toggle', 'Mostrar redes sociales'), F('legal', 'text', 'Texto del enlace de política de datos'), F('credits', 'toggle', 'Créditos del aprendiz SENA'),
        F('links', 'list', 'Enlaces adicionales', { lbl: 'text', add: { text: 'Enlace', href: '#' }, item: [F('text', 'text', 'Texto'), F('href', 'link', 'Destino')] })]
    }
  };

  /* Campos de estilo comunes a todos los bloques */
  SV.STYLE_FIELDS = [
    F('variant', 'select', 'Fondo de la sección', { o: [['default', 'Blanco / fondo base'], ['soft', 'Suave (tono de marca)'], ['primary', 'Color de marca'], ['dark', 'Oscuro'], ['accent', 'Color de acento'], ['custom', 'Color personalizado'], ['image', 'Imagen de fondo']] }),
    F('bg', 'color', 'Color personalizado'), F('bgImage', 'image', 'Imagen de fondo'), F('overlay', 'select', 'Oscurecer imagen', { o: [['0', 'Nada'], ['35', 'Poco'], ['55', 'Medio'], ['75', 'Mucho']] }),
    F('pad', 'select', 'Espaciado vertical', { o: [['none', 'Sin espacio'], ['s', 'Pequeño'], ['m', 'Mediano'], ['l', 'Grande'], ['xl', 'Muy grande']] }),
    F('align', 'select', 'Alineación del texto', { o: [['', 'Automática'], ['left', 'Izquierda'], ['center', 'Centrada']] }),
    F('anchor', 'text', 'ID de la sección (para enlaces del menú)', { h: 'Solo letras, números y guiones. Ej: servicios' }),
    F('hideMobile', 'toggle', 'Ocultar en celular'), F('hideDesktop', 'toggle', 'Ocultar en computador')
  ];

  /* ======================================================================
     PLANTILLAS
     ====================================================================== */
  const theme = (pal, pair, extra) => Object.assign({}, SV.PALETTES.find((p) => p.name === pal), { fontHead: pair[0], fontBody: pair[1], radius: 14, btn: 'solid', shadow: 'soft', width: 1180 }, extra || {});
  const cleanTheme = (t) => { const o = Object.assign({}, t); delete o.name; return o; };
  const dateIn = (days) => { const d = new Date(Date.now() + days * 864e5); d.setHours(23, 59, 0, 0); return d.toISOString().slice(0, 16); };

  SV.TEMPLATES = [
    {
      id: 'inmobiliaria', name: 'Servicios Inmobiliarios', icon: 'real_estate_agent', color: '#1d4ed8', tag: 'Compra, venta, arriendo y avalúos',
      description: 'Captación de compradores, arrendatarios y propietarios que quieren vender. Incluye vitrina de inmuebles con filtros y botón "Me interesa" por WhatsApp.',
      features: ['Vitrina de inmuebles con filtros Venta / Arriendo', 'Formulario con tipo de operación y presupuesto', 'WhatsApp con el inmueble preseleccionado'],
      build: () => ({
        client: { name: 'Raíces Inmobiliaria', sector: 'Inmobiliario', slogan: 'Te acompañamos a comprar, vender o arrendar con seguridad jurídica.', phone: '601 745 2200', email: 'asesoria@raicesinmobiliaria.co', address: 'Calle 93 # 14-20, oficina 402', city: 'Bogotá D.C.', schedule: 'Lunes a viernes 8:00 a.m. a 6:00 p.m. · Sábados 9:00 a.m. a 1:00 p.m.', icon: 'real_estate_agent', logo: '' },
        social: { facebook: 'https://facebook.com/', instagram: 'https://instagram.com/', tiktok: '', youtube: '', linkedin: '' },
        theme: cleanTheme(theme('Azul confianza', ['Montserrat', 'Open Sans'])),
        wa: { number: '573001234567', message: 'Hola Raíces Inmobiliaria, quiero información sobre un inmueble.', label: 'Asesor inmobiliario en línea' },
        seo: { title: 'Raíces Inmobiliaria | Casas y apartamentos en Bogotá', description: 'Compra, vende o arrienda tu inmueble en Bogotá con asesoría jurídica, avalúo comercial y acompañamiento en crédito hipotecario.', keywords: 'inmobiliaria bogotá, apartamentos en venta, arriendo bogotá, avalúo comercial, vender casa' },
        form: {
          title: 'Agenda una asesoría gratuita', button: 'Quiero que me asesoren',
          fields: baseFields('¿Qué necesitas?', ['Comprar vivienda', 'Arrendar', 'Vender mi inmueble', 'Poner en arriendo mi inmueble', 'Avalúo comercial']).concat([
            { key: 'presupuesto', label: 'Presupuesto aproximado', type: 'select', required: false, placeholder: 'Selecciona un rango', width: 'half', options: ['Menos de $200 millones', '$200 a $400 millones', '$400 a $700 millones', 'Más de $700 millones', 'Arriendo menor a $2 millones', 'Arriendo mayor a $2 millones'] },
            { key: 'zona', label: 'Zona o barrio de interés', type: 'text', required: false, placeholder: 'Ej: Cedritos, Chapinero', width: 'half', options: [] },
            { key: 'mensaje', label: 'Cuéntanos más', type: 'textarea', required: false, placeholder: 'Número de habitaciones, parqueadero, fecha de mudanza...', width: 'full', options: [] }
          ]),
          consent, successTitle: '¡Gracias! Recibimos tus datos', successText: 'Un asesor inmobiliario te contactará en las próximas 2 horas hábiles.', redirectWa: false
        },
        blocks: [
          { type: 'header', props: { logoIcon: 'real_estate_agent', links: [{ text: 'Inmuebles', href: '#portafolio' }, { text: 'Servicios', href: '#servicios' }, { text: 'Preguntas', href: '#preguntas' }, { text: 'Contacto', href: 'form' }], ctaText: 'Hablar con un asesor', ctaHref: 'wa' } },
          { type: 'hero', props: { layout: 'form', eyebrow: 'Inmobiliaria con respaldo jurídico en Bogotá', title: 'Encuentra el hogar que buscas sin perder', highlight: 'tiempo ni dinero', text: 'Te mostramos solo inmuebles verificados, negociamos por ti y te acompañamos hasta la firma de escrituras.', image: 'art:casa', badge: '★ 4.9 en Google · 350 familias con vivienda', bullets: [{ text: 'Inmuebles con estudio de títulos' }, { text: 'Avalúo comercial en 48 horas' }, { text: 'Acompañamiento en crédito hipotecario y leasing' }], cta1Text: 'Ver inmuebles', cta1Href: '#portafolio', cta2Text: 'WhatsApp', cta2Href: 'wa', formTitle: 'Agenda una asesoría gratuita', formText: 'Te llamamos hoy mismo, sin compromiso.' }, style: { variant: 'soft', pad: 'l' } },
          { type: 'stats', props: { items: [{ value: '350+', label: 'Familias con vivienda', icon: 'home' }, { value: '12', label: 'Años en el mercado', icon: 'workspace_premium' }, { value: '48 h', label: 'Entrega de avalúo', icon: 'schedule' }, { value: '100%', label: 'Inmuebles verificados', icon: 'verified' }] }, style: { variant: 'primary', pad: 's' } },
          { type: 'cards', props: { eyebrow: 'Inmuebles destacados', title: 'Oportunidades disponibles esta semana', text: 'Precios de referencia. Solicita la ficha completa y agenda tu visita.', columns: '3', filters: true, items: [
            { image: 'art:apartamento', badge: 'Venta', title: 'Apartamento en Cedritos', subtitle: 'Usaquén, Bogotá', price: '$385.000.000', specs: '3 hab · 2 baños · 78 m² · parqueadero', btnText: 'Me interesa', btnAction: 'wa', btnUrl: '' },
            { image: 'art:casa', badge: 'Venta', title: 'Casa campestre en Chía', subtitle: 'Vereda Fonquetá, Chía', price: '$920.000.000', specs: '4 hab · 3 baños · 240 m² · jardín', btnText: 'Me interesa', btnAction: 'wa', btnUrl: '' },
            { image: 'art:interior', badge: 'Arriendo', title: 'Apartaestudio amoblado', subtitle: 'Chapinero Alto, Bogotá', price: '$2.100.000 / mes', specs: '1 hab · 1 baño · 42 m² · amoblado', btnText: 'Agendar visita', btnAction: 'form', btnUrl: '' },
            { image: 'art:apartamento', badge: 'Arriendo', title: 'Apartamento familiar', subtitle: 'Modelia, Bogotá', price: '$2.800.000 / mes', specs: '3 hab · 2 baños · 85 m² · conjunto', btnText: 'Agendar visita', btnAction: 'form', btnUrl: '' },
            { image: 'art:llaves', badge: 'Proyecto sobre planos', title: 'Torres del Parque VIS', subtitle: 'Soacha, Cundinamarca', price: 'Desde $168.000.000', specs: 'Aplica subsidio Mi Casa Ya · entrega 2027', btnText: 'Solicitar información', btnAction: 'form', btnUrl: '' },
            { image: 'art:interior', badge: 'Venta', title: 'Penthouse con terraza', subtitle: 'Santa Bárbara, Bogotá', price: '$1.250.000.000', specs: '3 hab · 4 baños · 190 m² · 2 parqueaderos', btnText: 'Me interesa', btnAction: 'wa', btnUrl: '' }] } },
          { type: 'features', props: { eyebrow: 'Servicios', title: 'Todo el proceso inmobiliario en un solo lugar', columns: '3', look: 'cards', items: [
            { icon: 'key', title: 'Compra de vivienda', text: 'Buscamos, filtramos y negociamos el inmueble que se ajusta a tu presupuesto.', price: '', linkText: '', link: 'form' },
            { icon: 'sell', title: 'Venta de tu inmueble', text: 'Fotografía profesional, publicación en portales y filtro de compradores con capacidad de pago.', price: 'Comisión desde 3%', linkText: 'Quiero vender', link: 'form' },
            { icon: 'apartment', title: 'Arriendo y administración', text: 'Estudio de arrendatarios, contrato, póliza de arrendamiento y recaudo mensual.', price: '', linkText: '', link: 'form' },
            { icon: 'request_quote', title: 'Avalúo comercial', text: 'Informe firmado por perito avaluador inscrito en el RAA, en 48 horas.', price: 'Desde $450.000', linkText: 'Solicitar avalúo', link: 'form' },
            { icon: 'account_balance', title: 'Crédito hipotecario', text: 'Comparamos tasas de bancos y te ayudamos con leasing, subsidios y cesantías.', price: '', linkText: '', link: 'form' },
            { icon: 'gavel', title: 'Estudio de títulos', text: 'Revisión jurídica del inmueble, promesa de compraventa y trámite de escrituras.', price: '', linkText: '', link: 'form' }] } },
          { type: 'steps', props: { eyebrow: 'Cómo trabajamos', title: 'De la primera llamada a la entrega de llaves', items: [{ title: 'Diagnóstico', text: 'Entendemos qué buscas, tu presupuesto y tu capacidad de crédito.' }, { title: 'Selección', text: 'Te enviamos inmuebles verificados y agendamos las visitas.' }, { title: 'Negociación', text: 'Negociamos el precio y revisamos la parte jurídica.' }, { title: 'Firma y entrega', text: 'Te acompañamos en la notaría y en la entrega del inmueble.' }] } },
          { type: 'testimonials', props: { title: 'Familias que ya encontraron su hogar', items: [
            { name: 'Carolina Rincón', role: 'Compró en Cedritos', text: 'Nos ayudaron con el crédito y en tres semanas teníamos la promesa firmada. Muy claros con cada paso.', rating: '5', photo: 'art:avatar:1' },
            { name: 'Andrés Velandia', role: 'Vendió su casa en Suba', text: 'Vendieron mi casa en 40 días y con el precio que esperaba. Filtraron compradores serios.', rating: '5', photo: 'art:avatar:0' },
            { name: 'Luz Marina Pardo', role: 'Propietaria en arriendo', text: 'Llevo dos años con la administración y el pago del arriendo siempre llega a tiempo.', rating: '5', photo: 'art:avatar:3' }] } },
          { type: 'faq', props: { items: [
            { q: '¿Cuánto cobran por vender mi inmueble?', a: 'La comisión es del 3% sobre el valor de venta y solo se paga cuando el negocio se cierra en notaría.' },
            { q: '¿Me ayudan si necesito crédito hipotecario?', a: 'Sí. Comparamos las tasas de varios bancos y te guiamos con leasing habitacional, subsidios y uso de cesantías.' },
            { q: '¿Qué documentos necesito para arrendar?', a: 'Cédula, certificado laboral o extractos bancarios y un codeudor o póliza de arrendamiento aprobada.' },
            { q: '¿Las visitas tienen costo?', a: 'No. Las visitas y la primera asesoría son gratuitas y sin compromiso.' }] } },
          { type: 'cta', props: { title: '¿Quieres vender o arrendar tu inmueble?', text: 'Recibe una valoración gratuita del precio de mercado en 24 horas.', btn1Text: 'Solicitar valoración', btn1Href: 'form', btn2Text: 'Escribir por WhatsApp', btn2Href: 'wa' }, style: { variant: 'dark' } },
          { type: 'map', props: { title: 'Visita nuestra oficina', schedule: 'Lunes a viernes 8:00 a.m. a 6:00 p.m.\nSábados 9:00 a.m. a 1:00 p.m.' } },
          { type: 'footer', props: { text: 'Inmobiliaria afiliada a la Lonja de Propiedad Raíz. Asesoría en compra, venta, arriendo y avalúos.' } }
        ]
      })
    },
    {
      id: 'salud', name: 'Medicina u Odontología', icon: 'dentistry', color: '#0e9f9a', tag: 'Consultorios, clínicas y especialistas',
      description: 'Agendamiento de citas para consultorios médicos y odontológicos. Incluye especialidades, equipo profesional, paquetes de precios y formulario con fecha preferida.',
      features: ['Formulario de cita con especialidad, fecha y jornada', 'Equipo de profesionales y paquetes de tratamientos', 'Ubicación, horario y preguntas sobre EPS y prepagada'],
      build: () => ({
        client: { name: 'Vitalis Centro Médico y Odontológico', sector: 'Salud', slogan: 'Tu salud y tu sonrisa en manos de especialistas.', phone: '604 322 1188', email: 'citas@vitalis.com.co', address: 'Carrera 43A # 1 Sur-100, consultorio 305', city: 'Medellín, Antioquia', schedule: 'Lunes a viernes 7:00 a.m. a 7:00 p.m. · Sábados 8:00 a.m. a 2:00 p.m.', icon: 'dentistry', logo: '' },
        social: { facebook: 'https://facebook.com/', instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/', youtube: '', linkedin: '' },
        theme: cleanTheme(theme('Turquesa salud', ['Nunito', 'Nunito'], { radius: 18, btn: 'pill' })),
        wa: { number: '573001234567', message: 'Hola Vitalis, quiero agendar una cita.', label: 'Agenda tu cita por WhatsApp' },
        seo: { title: 'Vitalis | Odontología y medicina en Medellín', description: 'Agenda tu cita de odontología general, ortodoncia, diseño de sonrisa, implantes o medicina general en El Poblado, Medellín. Valoración inicial sin costo.', keywords: 'odontólogo medellín, diseño de sonrisa, ortodoncia, implantes dentales, medicina general' },
        form: {
          title: 'Agenda tu cita', button: 'Solicitar mi cita',
          fields: baseFields('Especialidad', ['Valoración odontológica', 'Ortodoncia', 'Diseño de sonrisa', 'Implantes dentales', 'Blanqueamiento', 'Medicina general', 'Pediatría']).concat([
            { key: 'tipo_paciente', label: 'Tipo de atención', type: 'radio', required: true, placeholder: '', width: 'full', options: ['Particular', 'Medicina prepagada', 'Póliza de salud'] },
            { key: 'fecha', label: 'Fecha preferida', type: 'date', required: false, placeholder: '', width: 'half', options: [] },
            { key: 'jornada', label: 'Jornada', type: 'select', required: false, placeholder: 'Selecciona', width: 'half', options: ['Mañana', 'Tarde', 'Sábado'] },
            { key: 'mensaje', label: 'Motivo de consulta', type: 'textarea', required: false, placeholder: 'Cuéntanos brevemente qué necesitas', width: 'full', options: [] }
          ]),
          consent, successTitle: '¡Tu solicitud de cita quedó registrada!', successText: 'Te confirmamos fecha y hora por WhatsApp en menos de 2 horas hábiles.', redirectWa: true
        },
        blocks: [
          { type: 'header', props: { logoIcon: 'dentistry', links: [{ text: 'Especialidades', href: '#servicios' }, { text: 'Equipo', href: '#equipo' }, { text: 'Precios', href: '#planes' }, { text: 'Ubicación', href: '#ubicacion' }], ctaText: 'Agendar cita', ctaHref: 'form' } },
          { type: 'hero', props: { layout: 'image', eyebrow: 'Odontología y medicina en El Poblado', title: 'Recupera la confianza en tu', highlight: 'sonrisa', text: 'Especialistas certificados, tecnología digital y planes de pago a tu medida. La valoración inicial no tiene costo.', image: 'art:sonrisa', badge: '★ 4.8 · Más de 2.000 pacientes atendidos', bullets: [{ text: 'Valoración y radiografía panorámica sin costo' }, { text: 'Financiación hasta 24 meses' }, { text: 'Atención para toda la familia' }], cta1Text: 'Agendar valoración gratis', cta1Href: 'form', cta2Text: 'WhatsApp', cta2Href: 'wa' }, style: { variant: 'soft', pad: 'l' } },
          { type: 'features', props: { eyebrow: 'Especialidades', title: 'Atención integral en un solo lugar', columns: '3', look: 'icons', items: [
            { icon: 'dentistry', title: 'Odontología general', text: 'Limpieza, resinas, calzas y control preventivo para toda la familia.', price: '', linkText: 'Agendar', link: 'form' },
            { icon: 'sentiment_very_satisfied', title: 'Diseño de sonrisa', text: 'Carillas en resina o porcelana con simulación digital antes del tratamiento.', price: '', linkText: 'Agendar', link: 'form' },
            { icon: 'medical_services', title: 'Ortodoncia', text: 'Brackets metálicos, estéticos y alineadores invisibles.', price: '', linkText: 'Agendar', link: 'form' },
            { icon: 'health_and_safety', title: 'Implantes dentales', text: 'Rehabilitación oral con implantes de titanio y garantía escrita.', price: '', linkText: 'Agendar', link: 'form' },
            { icon: 'stethoscope', title: 'Medicina general', text: 'Consulta, certificados médicos, control de hipertensión y diabetes.', price: '', linkText: 'Agendar', link: 'form' },
            { icon: 'child_care', title: 'Pediatría', text: 'Control de crecimiento y desarrollo, vacunación y consulta prioritaria.', price: '', linkText: 'Agendar', link: 'form' }] } },
          { type: 'about', props: { eyebrow: 'Sobre Vitalis', title: 'Tecnología digital y trato humano', text: 'Somos un centro médico y odontológico habilitado por la Secretaría de Salud. Trabajamos con escáner intraoral, radiografía digital y protocolos de bioseguridad certificados.', image: 'art:consultorio', side: 'left', bullets: [{ text: 'Consultorios habilitados y protocolos de bioseguridad' }, { text: 'Historia clínica digital' }, { text: 'Recordatorios de cita por WhatsApp' }], badgeValue: '15+', badgeLabel: 'años cuidando familias', ctaText: 'Agenda tu cita', ctaHref: 'form' } },
          { type: 'team', props: { eyebrow: 'Equipo', title: 'Especialistas que te escuchan', items: [
            { photo: 'art:avatar:1', name: 'Dra. Natalia Restrepo', role: 'Ortodoncista', text: 'Universidad CES. 12 años de experiencia.' },
            { photo: 'art:avatar:0', name: 'Dr. Julián Ospina', role: 'Rehabilitador oral e implantes', text: 'Universidad de Antioquia.' },
            { photo: 'art:avatar:3', name: 'Dra. Paula Cárdenas', role: 'Odontopediatra', text: 'Atención amable para niños.' },
            { photo: 'art:avatar:4', name: 'Dr. Mauricio Gil', role: 'Médico general', text: 'Consulta externa y chequeos.' }] }, style: { anchor: 'equipo' } },
          { type: 'pricing', props: { eyebrow: 'Precios de referencia', title: 'Paquetes pensados para ti', text: 'Precios en pesos colombianos. El valor final se confirma en la valoración.', items: [
            { name: 'Valoración inicial', price: '$0', period: 'primera cita', features: 'Examen clínico completo\nRadiografía panorámica\nPlan de tratamiento por escrito', highlight: false, btnText: 'Agendar gratis', btnHref: 'form' },
            { name: 'Sonrisa sana', price: '$180.000', period: 'por sesión', features: 'Limpieza profunda y profilaxis\nAplicación de flúor\nBlanqueamiento con descuento del 20%', highlight: true, btnText: 'Lo quiero', btnHref: 'form' },
            { name: 'Diseño de sonrisa', price: 'Desde $3.500.000', period: 'financiable a 24 meses', features: 'Simulación digital 3D\nCarillas en resina o porcelana\nGarantía escrita', highlight: false, btnText: 'Solicitar valoración', btnHref: 'form' }] } },
          { type: 'testimonials', props: { title: 'Pacientes que recomiendan Vitalis', items: [
            { name: 'Daniela Mejía', role: 'Diseño de sonrisa', text: 'Me mostraron cómo iba a quedar antes de empezar. El resultado superó lo que esperaba.', rating: '5', photo: 'art:avatar:5' },
            { name: 'Jorge Arango', role: 'Implantes', text: 'Puntuales, amables y con un plan de pagos que se ajustó a mi presupuesto.', rating: '5', photo: 'art:avatar:2' },
            { name: 'Marcela Toro', role: 'Mamá de paciente', text: 'Mi hijo le tenía miedo al odontólogo y ahora pide volver. Excelente la doctora Paula.', rating: '5', photo: 'art:avatar:1' }] } },
          { type: 'form', props: { layout: 'split', eyebrow: 'Agenda en línea', title: 'Reserva tu cita en menos de un minuto', text: 'Déjanos tus datos y te confirmamos la cita por WhatsApp.', bullets: [{ icon: 'schedule', text: 'Confirmación en menos de 2 horas hábiles' }, { icon: 'payments', text: 'Pagos con tarjeta, PSE, Nequi y financiación' }, { icon: 'lock', text: 'Tus datos protegidos según la Ley 1581' }] } },
          { type: 'faq', props: { items: [
            { q: '¿Atienden por EPS?', a: 'Atendemos pacientes particulares, de medicina prepagada y pólizas de salud. Consulta si tu prepagada tiene convenio con nosotros.' },
            { q: '¿La valoración tiene costo?', a: 'La primera valoración odontológica con radiografía panorámica no tiene costo.' },
            { q: '¿Tienen financiación?', a: 'Sí, financiamos tratamientos hasta 24 meses con aliados financieros, sujeto a estudio de crédito.' },
            { q: '¿Atienden urgencias?', a: 'Atendemos urgencias odontológicas de lunes a sábado. Escríbenos por WhatsApp para asignarte el primer turno disponible.' }] } },
          { type: 'map', props: { title: 'Encuéntranos en El Poblado', schedule: 'Lunes a viernes 7:00 a.m. a 7:00 p.m.\nSábados 8:00 a.m. a 2:00 p.m.' } },
          { type: 'footer', props: { text: 'Prestador de servicios de salud habilitado. La información de esta página no reemplaza la valoración de un profesional.' } }
        ]
      })
    },
    {
      id: 'obra', name: 'Obra Civil y Remodelaciones', icon: 'construction', color: '#d9480f', tag: 'Construcción, remodelación y acabados',
      description: 'Cotizaciones de remodelación de cocinas, baños, pintura, obra gris e impermeabilización. Incluye galería de trabajos, proceso con garantía y formulario con área y presupuesto.',
      features: ['Portada con imagen de fondo y dos llamadas a la acción', 'Galería de proyectos terminados', 'Formulario con tipo de obra, metros y presupuesto'],
      build: () => ({
        client: { name: 'Bases Firmes Construcciones', sector: 'Construcción', slogan: 'Remodelamos tu casa con cronograma, presupuesto claro y garantía escrita.', phone: '602 488 9031', email: 'cotizaciones@basesfirmes.co', address: 'Avenida 6 Norte # 28N-15', city: 'Cali, Valle del Cauca', schedule: 'Lunes a sábado 7:00 a.m. a 5:00 p.m.', icon: 'construction', logo: '' },
        social: { facebook: 'https://facebook.com/', instagram: 'https://instagram.com/', tiktok: 'https://tiktok.com/', youtube: 'https://youtube.com/', linkedin: '' },
        theme: cleanTheme(theme('Terracota obra', ['Oswald', 'Barlow'], { radius: 6, btn: 'sharp' })),
        wa: { number: '573001234567', message: 'Hola Bases Firmes, quiero cotizar una obra.', label: 'Cotiza por WhatsApp' },
        seo: { title: 'Bases Firmes | Remodelaciones y obra civil en Cali', description: 'Remodelación de cocinas y baños, pintura, drywall, obra gris e impermeabilización en Cali. Visita técnica sin costo y garantía escrita.', keywords: 'remodelaciones cali, remodelar cocina, remodelar baño, obra civil, impermeabilización, maestro de obra' },
        form: {
          title: 'Solicita tu visita técnica gratis', button: 'Quiero mi cotización',
          fields: baseFields('Tipo de obra', ['Remodelación de cocina', 'Remodelación de baño', 'Pintura y acabados', 'Drywall y cielos rasos', 'Pisos y enchapes', 'Impermeabilización de techos', 'Obra gris / ampliación', 'Remodelación completa']).concat([
            { key: 'ciudad', label: 'Ciudad y barrio', type: 'text', required: true, placeholder: 'Ej: Cali, barrio Granada', width: 'half', options: [] },
            { key: 'area', label: 'Área aproximada (m²)', type: 'number', required: false, placeholder: 'Ej: 25', width: 'half', options: [] },
            { key: 'presupuesto', label: 'Presupuesto estimado', type: 'select', required: false, placeholder: 'Selecciona un rango', width: 'half', options: ['Menos de $5 millones', '$5 a $15 millones', '$15 a $40 millones', 'Más de $40 millones', 'Aún no lo sé'] },
            { key: 'inicio', label: '¿Cuándo quieres iniciar?', type: 'select', required: false, placeholder: 'Selecciona', width: 'half', options: ['Lo antes posible', 'En 1 mes', 'En 3 meses', 'Solo estoy cotizando'] },
            { key: 'mensaje', label: 'Describe tu proyecto', type: 'textarea', required: false, placeholder: 'Qué quieres cambiar, materiales que te gustan, fotos que puedas enviar por WhatsApp...', width: 'full', options: [] }
          ]),
          consent, successTitle: '¡Recibimos tu solicitud!', successText: 'Un maestro de obra te llamará para agendar la visita técnica sin costo.', redirectWa: false
        },
        blocks: [
          { type: 'header', props: { logoIcon: 'construction', links: [{ text: 'Servicios', href: '#servicios' }, { text: 'Proyectos', href: '#proyectos' }, { text: 'Proceso', href: '#proceso' }, { text: 'Cotizar', href: 'form' }], ctaText: 'Cotizar gratis', ctaHref: 'form' } },
          { type: 'hero', props: { layout: 'cover', eyebrow: 'Remodelaciones y obra civil en Cali', title: 'Remodela tu casa sin sorpresas en el', highlight: 'presupuesto', text: 'Cotización detallada por ítem, cronograma semanal y garantía escrita de un año. Visita técnica sin costo.', image: 'art:obra', badge: '+420 obras entregadas', bullets: [], cta1Text: 'Solicitar visita técnica', cta1Href: 'form', cta2Text: 'Enviar fotos por WhatsApp', cta2Href: 'wa' }, style: { variant: 'image', bgImage: 'art:obra', overlay: '55', pad: 'xl' } },
          { type: 'buttons', props: { title: '', items: [{ text: 'Cotizar cocina', href: 'form', look: 'outline', icon: 'countertops' }, { text: 'Cotizar baño', href: 'form', look: 'outline', icon: 'bathtub' }, { text: 'Cotizar pintura', href: 'form', look: 'outline', icon: 'format_paint' }, { text: 'Impermeabilizar', href: 'form', look: 'outline', icon: 'roofing' }] }, style: { align: 'center', pad: 's', variant: 'soft' } },
          { type: 'features', props: { eyebrow: 'Servicios', title: 'Hacemos la obra completa', text: 'Un solo equipo coordina diseño, materiales, mano de obra y limpieza final.', columns: '3', look: 'list', items: [
            { icon: 'countertops', title: 'Cocinas integrales', text: 'Diseño, muebles, mesones en cuarzo o granito, enchapes e instalaciones.', price: '', linkText: '', link: 'form' },
            { icon: 'bathtub', title: 'Baños', text: 'Cambio de sanitarios, duchas, divisiones en vidrio y enchapes.', price: '', linkText: '', link: 'form' },
            { icon: 'format_paint', title: 'Pintura y acabados', text: 'Estuco, pintura interior y exterior, drywall y cielos rasos.', price: '', linkText: '', link: 'form' },
            { icon: 'roofing', title: 'Impermeabilización', text: 'Techos, terrazas y fachadas con manto o sistemas líquidos.', price: '', linkText: '', link: 'form' },
            { icon: 'foundation', title: 'Obra gris y ampliaciones', text: 'Segundos pisos, muros, placas y reforzamiento estructural con ingeniero.', price: '', linkText: '', link: 'form' },
            { icon: 'plumbing', title: 'Redes hidráulicas y eléctricas', text: 'Cambio de tubería, puntos eléctricos e iluminación según RETIE.', price: '', linkText: '', link: 'form' }] } },
          { type: 'gallery', props: { eyebrow: 'Proyectos', title: 'Obras terminadas recientemente', columns: '3', items: [{ image: 'art:remodelacion', caption: 'Cocina integral · Ciudad Jardín' }, { image: 'art:planos', caption: 'Diseño de apartamento · Granada' }, { image: 'art:interior', caption: 'Sala remodelada · El Peñón' }, { image: 'art:obra', caption: 'Ampliación segundo piso · Jamundí' }, { image: 'art:herramientas', caption: 'Mantenimiento de fachada · San Fernando' }, { image: 'art:casa', caption: 'Casa entregada · Pance' }] }, style: { anchor: 'proyectos' } },
          { type: 'steps', props: { eyebrow: 'Proceso', title: 'Así trabajamos tu obra', items: [{ title: 'Visita técnica', text: 'Medimos, tomamos fotos y escuchamos lo que quieres. Sin costo.' }, { title: 'Cotización por ítem', text: 'Recibes el presupuesto detallado en 48 horas.' }, { title: 'Ejecución', text: 'Cronograma semanal con reporte de avance por WhatsApp.' }, { title: 'Entrega y garantía', text: 'Entrega con acta, limpieza final y garantía escrita de 1 año.' }] }, style: { anchor: 'proceso', variant: 'soft' } },
          { type: 'stats', props: { items: [{ value: '420+', label: 'Obras entregadas', icon: 'home' }, { value: '1 año', label: 'Garantía escrita', icon: 'verified' }, { value: '48 h', label: 'Para tu cotización', icon: 'schedule' }] }, style: { variant: 'dark', pad: 's' } },
          { type: 'testimonials', props: { title: 'Clientes que remodelaron con nosotros', items: [
            { name: 'Patricia Lozano', role: 'Cocina y baño · Ciudad Jardín', text: 'Cumplieron el cronograma y el presupuesto. Cada viernes me enviaban fotos del avance.', rating: '5', photo: 'art:avatar:3' },
            { name: 'Hernán Caicedo', role: 'Segundo piso · Jamundí', text: 'Trabajaron con ingeniero y licencia. Muy ordenados con los escombros y la limpieza.', rating: '5', photo: 'art:avatar:2' }] } },
          { type: 'form', props: { layout: 'image', eyebrow: 'Cotización sin costo', title: 'Agenda tu visita técnica', text: 'Cuéntanos qué quieres remodelar y te llamamos para agendar la visita.', image: 'art:planos', bullets: [{ icon: 'engineering', text: 'Maestros de obra con experiencia certificada' }, { icon: 'receipt_long', text: 'Cotización detallada por ítem' }, { icon: 'verified', text: 'Garantía escrita de 1 año' }] } },
          { type: 'faq', props: { items: [
            { q: '¿La visita técnica tiene costo?', a: 'No. La visita y la cotización son gratuitas dentro del área urbana de Cali y Jamundí.' },
            { q: '¿Ustedes compran los materiales?', a: 'Podemos incluir los materiales en la cotización o trabajar solo con mano de obra si ya los tienes.' },
            { q: '¿Cómo son los pagos?', a: 'Un anticipo del 30%, pagos por avance de obra y un saldo del 10% contra entrega.' },
            { q: '¿Tramitan licencias de construcción?', a: 'Sí. Para ampliaciones y cambios estructurales tramitamos la licencia con la curaduría urbana.' }] } },
          { type: 'footer', props: { text: 'Empresa constructora con afiliación a riesgos laborales de todo el personal y pólizas de responsabilidad civil.' } }
        ]
      })
    },
    {
      id: 'refrigeracion', name: 'Mantenimiento de Refrigeración', icon: 'ac_unit', color: '#0284c7', tag: 'Aires, neveras y cuartos fríos',
      description: 'Solicitudes de mantenimiento, reparación e instalación de aires acondicionados, neveras y cuartos fríos. Incluye planes, promoción con cuenta regresiva y clientes empresariales.',
      features: ['Formulario con tipo de equipo, servicio y urgencia', 'Planes de mantenimiento y oferta con cuenta regresiva', 'Botón de emergencia por WhatsApp'],
      build: () => ({
        client: { name: 'FríoTec Servicios Técnicos', sector: 'Refrigeración', slogan: 'Técnicos certificados en refrigeración y aire acondicionado, a domicilio.', phone: '605 360 4477', email: 'servicio@friotec.co', address: 'Carrera 53 # 76-120, local 3', city: 'Barranquilla, Atlántico', schedule: 'Lunes a sábado 7:00 a.m. a 7:00 p.m. · Emergencias 24/7', icon: 'ac_unit', logo: '' },
        social: { facebook: 'https://facebook.com/', instagram: 'https://instagram.com/', tiktok: '', youtube: '', linkedin: 'https://linkedin.com/' },
        theme: cleanTheme(theme('Hielo técnico', ['Space Grotesk', 'DM Sans'], { radius: 12 })),
        wa: { number: '573001234567', message: 'Hola FríoTec, necesito un servicio técnico.', label: 'Técnico disponible hoy' },
        seo: { title: 'FríoTec | Mantenimiento de aires y neveras en Barranquilla', description: 'Mantenimiento preventivo y reparación de aires acondicionados, neveras y cuartos fríos en Barranquilla. Técnicos certificados y garantía de 90 días.', keywords: 'mantenimiento aire acondicionado barranquilla, reparación neveras, instalación minisplit, cuartos fríos, técnico refrigeración' },
        form: {
          title: 'Solicita tu servicio técnico', button: 'Solicitar técnico',
          fields: baseFields('Tipo de equipo', ['Aire acondicionado minisplit', 'Aire acondicionado central', 'Nevera o nevecón', 'Congelador o vitrina', 'Cuarto frío', 'Equipo industrial']).concat([
            { key: 'tipo_servicio', label: 'Servicio que necesitas', type: 'radio', required: true, placeholder: '', width: 'full', options: ['Mantenimiento preventivo', 'Reparación', 'Instalación', 'Contrato empresarial'] },
            { key: 'marca', label: 'Marca del equipo', type: 'text', required: false, placeholder: 'Ej: LG, Samsung, Carrier', width: 'half', options: [] },
            { key: 'urgencia', label: 'Urgencia', type: 'select', required: true, placeholder: 'Selecciona', width: 'half', options: ['Hoy mismo', 'Esta semana', 'Solo quiero cotizar'] },
            { key: 'direccion', label: 'Barrio o dirección', type: 'text', required: false, placeholder: 'Ej: Alto Prado', width: 'full', options: [] },
            { key: 'mensaje', label: '¿Qué le pasa al equipo?', type: 'textarea', required: false, placeholder: 'No enfría, gotea agua, hace ruido...', width: 'full', options: [] }
          ]),
          consent, successTitle: '¡Solicitud recibida!', successText: 'Un técnico te llamará para confirmar la visita. Si es urgente, escríbenos por WhatsApp.', redirectWa: false
        },
        blocks: [
          { type: 'header', props: { logoIcon: 'ac_unit', links: [{ text: 'Servicios', href: '#servicios' }, { text: 'Planes', href: '#planes' }, { text: 'Empresas', href: '#empresas' }, { text: 'Contacto', href: 'form' }], ctaText: 'Emergencia 24/7', ctaHref: 'wa' } },
          { type: 'hero', props: { layout: 'form', eyebrow: 'Servicio técnico a domicilio en Barranquilla', title: '¿Tu aire no enfría? Lo dejamos como', highlight: 'nuevo hoy mismo', text: 'Mantenimiento, reparación e instalación de aires acondicionados, neveras y cuartos fríos con técnicos certificados.', image: 'art:aire', badge: 'Garantía de 90 días en cada servicio', bullets: [{ text: 'Técnicos con certificación en refrigeración' }, { text: 'Llegamos en menos de 3 horas' }, { text: 'Repuestos originales y factura electrónica' }], cta1Text: 'Solicitar técnico', cta1Href: 'form', cta2Text: 'WhatsApp', cta2Href: 'wa', formTitle: 'Solicita tu servicio técnico', formText: 'Respuesta en menos de 30 minutos.' }, style: { variant: 'soft', pad: 'l' } },
          { type: 'features', props: { eyebrow: 'Servicios', title: 'Soluciones de frío para hogares y negocios', columns: '3', look: 'cards', items: [
            { icon: 'ac_unit', title: 'Mantenimiento de aires', text: 'Limpieza profunda de evaporador y condensador, revisión de gas y drenaje.', price: 'Desde $120.000', linkText: 'Agendar', link: 'form' },
            { icon: 'kitchen', title: 'Reparación de neveras', text: 'Diagnóstico de compresor, tarjetas, termostatos y fugas de gas.', price: 'Diagnóstico $50.000', linkText: 'Solicitar', link: 'form' },
            { icon: 'mode_fan', title: 'Instalación de minisplit', text: 'Instalación con tubería de cobre, vacío y pruebas de funcionamiento.', price: 'Desde $380.000', linkText: 'Cotizar', link: 'form' },
            { icon: 'thermostat', title: 'Cuartos fríos', text: 'Diseño, montaje y mantenimiento para restaurantes, carnicerías y droguerías.', price: '', linkText: 'Cotizar', link: 'form' },
            { icon: 'water_drop', title: 'Carga de gas refrigerante', text: 'R410A, R32 y R22 con detección de fugas y soldadura.', price: '', linkText: 'Solicitar', link: 'form' },
            { icon: 'build', title: 'Contratos empresariales', text: 'Planes de mantenimiento preventivo con cronograma e informe técnico.', price: '', linkText: 'Conocer planes', link: '#planes' }] } },
          { type: 'countdown', props: { eyebrow: 'Temporada de calor', title: '20% de descuento en mantenimiento preventivo', text: 'Agenda antes de la fecha límite y asegura el precio promocional para cada equipo de tu casa u oficina.', until: dateIn(10), ctaText: 'Quiero el descuento', ctaHref: 'form' }, style: { variant: 'dark' } },
          { type: 'pricing', props: { eyebrow: 'Planes', title: 'Planes de mantenimiento', text: 'Precios por equipo minisplit hasta 24.000 BTU en Barranquilla y Soledad.', items: [
            { name: 'Preventivo', price: '$120.000', period: 'por equipo', features: 'Limpieza de filtros y serpentines\nRevisión de presión de gas\nLimpieza de bandeja y drenaje', highlight: false, btnText: 'Agendar', btnHref: 'form' },
            { name: 'Hogar tranquilo', price: '$390.000', period: '3 equipos al año', features: '2 mantenimientos por equipo\nPrioridad en emergencias\n10% en repuestos', highlight: true, btnText: 'Lo quiero', btnHref: 'form' },
            { name: 'Empresarial', price: 'A la medida', period: 'contrato anual', features: 'Cronograma e informes técnicos\nTiempo de respuesta en 2 horas\nFactura electrónica mensual', highlight: false, btnText: 'Solicitar propuesta', btnHref: 'form' }] } },
          { type: 'steps', props: { eyebrow: 'Proceso', title: 'Tu equipo funcionando en 4 pasos', items: [{ title: 'Solicitud', text: 'Llenas el formulario o nos escribes por WhatsApp.' }, { title: 'Diagnóstico', text: 'El técnico revisa el equipo y te explica la falla.' }, { title: 'Aprobación', text: 'Apruebas el valor antes de iniciar.' }, { title: 'Garantía', text: 'Recibes factura y 90 días de garantía.' }] } },
          { type: 'logos', props: { title: 'Empresas que confían su cadena de frío en FríoTec', items: [{ image: 'art:logo:0', name: 'Grupo Andino' }, { image: 'art:logo:1', name: 'Nexo Capital' }, { image: 'art:logo:2', name: 'Altamira' }, { image: 'art:logo:3', name: 'Cordillera' }, { image: 'art:logo:4', name: 'Unión Norte' }] }, style: { anchor: 'empresas', pad: 's', variant: 'soft' } },
          { type: 'testimonials', props: { title: 'Opiniones de clientes', items: [
            { name: 'Ricardo Fontalvo', role: 'Restaurante en el Prado', text: 'Nos salvaron el cuarto frío un sábado en la noche. Llegaron en dos horas.', rating: '5', photo: 'art:avatar:4' },
            { name: 'Yuleidis Barrios', role: 'Hogar en Villa Country', text: 'Muy cumplidos. Explicaron qué tenía el aire y dejaron todo limpio.', rating: '5', photo: 'art:avatar:5' }] } },
          { type: 'form', props: { layout: 'split', eyebrow: 'Servicio técnico', title: 'Agenda tu visita', text: 'Cuéntanos qué equipo tienes y qué le pasa.', bullets: [{ icon: 'bolt', text: 'Atención de emergencias 24/7' }, { icon: 'verified', text: '90 días de garantía' }, { icon: 'receipt_long', text: 'Factura electrónica' }] } },
          { type: 'faq', props: { items: [
            { q: '¿Cada cuánto debo hacer mantenimiento al aire?', a: 'En clima cálido como Barranquilla recomendamos mantenimiento preventivo cada 4 a 6 meses.' },
            { q: '¿Cobran la visita?', a: 'El diagnóstico tiene un valor de $50.000 que se descuenta si apruebas la reparación.' },
            { q: '¿Qué garantía tienen?', a: 'Todos los servicios tienen 90 días de garantía sobre la mano de obra y los repuestos instalados.' },
            { q: '¿Atienden fuera de Barranquilla?', a: 'Atendemos Barranquilla, Soledad, Puerto Colombia y Malambo.' }] } },
          { type: 'map', props: { title: 'Nuestra sede', schedule: 'Lunes a sábado 7:00 a.m. a 7:00 p.m.\nEmergencias 24/7 por WhatsApp' } },
          { type: 'footer', props: { text: 'Técnicos certificados en buenas prácticas de refrigeración. Manejo responsable de gases refrigerantes.' } }
        ]
      })
    },
    {
      id: 'blank', name: 'Desde cero', icon: 'draw', color: '#475569', tag: 'Lienzo en blanco',
      description: 'Estructura mínima para construir tu landing page bloque a bloque con arrastrar y soltar, escoger fuentes, colores e incrustaciones libres.',
      features: ['Encabezado, portada, formulario y pie de página', '25 bloques disponibles para arrastrar', 'Paletas, tipografías e incrustaciones libres'],
      build: () => ({
        client: { name: 'Mi Empresa', sector: 'Servicios', slogan: 'Describe tu propuesta de valor en una frase.', phone: '', email: '', address: '', city: '', schedule: '', icon: 'storefront', logo: '' },
        social: {},
        theme: cleanTheme(theme('Verde SENA', ['Plus Jakarta Sans', 'Plus Jakarta Sans'])),
        wa: { number: '', message: 'Hola, quiero más información.', label: 'Escríbenos' },
        seo: { title: 'Mi Empresa | Landing page', description: 'Describe en 70 a 160 caracteres qué ofreces, para quién y en qué ciudad.', keywords: '' },
        form: {
          title: 'Déjanos tus datos', button: 'Enviar',
          fields: baseFields('Servicio de interés', ['Opción 1', 'Opción 2', 'Opción 3']).concat([{ key: 'mensaje', label: 'Mensaje', type: 'textarea', required: false, placeholder: 'Escribe tu mensaje', width: 'full', options: [] }]),
          consent, successTitle: '¡Gracias por escribirnos!', successText: 'Te contactaremos pronto.', redirectWa: false
        },
        blocks: [
          { type: 'header', props: { links: [{ text: 'Contacto', href: 'form' }], ctaText: 'Escríbenos', ctaHref: 'wa' } },
          { type: 'hero', props: { layout: 'center', eyebrow: 'Tu antetítulo', title: 'Escribe aquí tu promesa de valor', highlight: '', text: 'Explica el beneficio principal y a quién va dirigido.', image: 'art:abstracto', cta1Text: 'Quiero información', cta1Href: 'form', cta2Text: 'WhatsApp', cta2Href: 'wa' }, style: { variant: 'soft', pad: 'xl' } },
          { type: 'form', props: { layout: 'center', eyebrow: 'Contacto', title: 'Déjanos tus datos', text: 'Te contactamos en menos de 24 horas.', bullets: [] } },
          { type: 'footer', props: {} }
        ]
      })
    }
  ];
})(window.SV);
