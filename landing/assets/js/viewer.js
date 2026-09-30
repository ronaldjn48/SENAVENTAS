/* ==========================================================================
   SENA VENTAS LANDING PAGE · Visor público (ver.html)
   Abre la landing desde el enlace comprimido (#...) o desde la nube (?id=).
   La página corre en un iframe aislado: las incrustaciones libres no pueden
   leer los datos del simulador guardados en este mismo dominio.
   ========================================================================== */
(function (SV) {
  const U = SV.util;
  const $ = (s) => document.querySelector(s);

  const fail = (title, text) => {
    $('#msg').innerHTML = `<div class="card"><div class="ico">!</div><h1>${U.esc(title)}</h1><p>${U.esc(text)}</p><a href="./index.html">Abrir SENA VENTAS LANDING PAGE</a></div>`;
    document.title = title;
  };

  /* Completa valores por defecto de bloques y formulario (enlaces creados con versiones anteriores). */
  const prepare = (p) => {
    if (!p || !Array.isArray(p.blocks) || !p.theme) throw new Error('El enlace no contiene una landing page válida.');
    p.blocks = p.blocks.filter((b) => b && SV.BLOCKS[b.type]).map((b) => {
      const def = SV.BLOCKS[b.type];
      return { id: b.id || U.uid('b'), type: b.type, hidden: false, props: Object.assign(U.clone(def.defaults || {}), b.props || {}), style: Object.assign({ variant: 'default', pad: 'm' }, U.clone(def.style || {}), b.style || {}) };
    });
    p.client = Object.assign({ name: 'Landing page', slogan: '', phone: '', email: '', address: '', city: '', schedule: '', icon: 'storefront' }, p.client || {});
    p.owner = p.owner || {};
    p.social = p.social || {};
    p.wa = Object.assign({ enabled: true, mode: 'number', number: '', link: '', message: '', label: '', position: 'right' }, p.wa || {});
    p.seo = p.seo || {};
    p.tracking = p.tracking || {};
    p.form = Object.assign({ fields: [], consent: { enabled: false }, destinations: {} }, p.form || {});
    p.name = p.name || p.client.name;
    return p;
  };

  const injectHead = (html) => {
    const tpl = document.createElement('div');
    tpl.innerHTML = html;
    Array.from(tpl.querySelectorAll('script')).forEach((old) => {
      const s = document.createElement('script');
      if (old.src) { s.src = old.src; s.async = true; } else s.text = old.text;
      document.head.appendChild(s);
    });
  };

  const setMeta = (p) => {
    document.title = p.seo.title || p.client.name;
    const put = (name, content, prop) => {
      let m = document.querySelector(`meta[${prop ? 'property' : 'name'}="${name}"]`);
      if (!m) { m = document.createElement('meta'); m.setAttribute(prop ? 'property' : 'name', name); document.head.appendChild(m); }
      m.setAttribute('content', content || '');
    };
    put('description', p.seo.description || p.client.slogan);
    put('theme-color', p.theme.primary);
    put('og:title', p.seo.title || p.client.name, true);
    put('og:description', p.seo.description || p.client.slogan, true);
    const l = (p.client.name || 'L').trim().charAt(0).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${p.theme.primary}"/><text x="32" y="44" font-family="Arial" font-size="34" font-weight="700" fill="${U.onColor(p.theme.primary)}" text-anchor="middle">${U.esc(l)}</text></svg>`;
    $('link[rel=icon]').href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  };

  const show = (p) => {
    prepare(p);
    setMeta(p);
    injectHead(SV.pixelHead(p.tracking));
    const frame = $('#lp');
    const shortUrl = location.href.split('#')[0] + (location.hash ? '#' + location.hash.slice(1, 13) + '…' : '');
    frame.srcdoc = SV.renderLanding(p, { mode: 'view', search: location.search, pageUrl: shortUrl });
    frame.hidden = false;
    $('#msg').remove();

    window.addEventListener('message', (e) => {
      if (e.source !== frame.contentWindow) return;
      const m = e.data || {};
      if (m.source !== 'svl-landing') return;
      if (m.type === 'track') {
        SV.pixel(m.event);
        SV.inbox.pushStat(p.id, m.event);
      } else if (m.type === 'lead' && m.payload && m.payload.lead) {
        const payload = m.payload;
        payload.lead.source = 'enlace público';
        payload.lead.url = shortUrl;
        SV.inbox.push(p.id, payload.lead);
        SV.deliver(p.form.destinations, payload, (results) => {
          frame.contentWindow.postMessage({ source: 'svl-viewer', type: 'lead-ack', id: payload.lead.id, results }, '*');
        });
      }
    });
  };

  const start = async () => {
    try {
      const hash = location.hash.replace(/^#/, '');
      const qs = new URLSearchParams(location.search);
      if (hash && /^[zj]/.test(hash)) { show(await U.unpack(hash)); return; }
      if (qs.get('id')) {
        let cloudUrl = SV.config().nubeUrl;
        if (qs.get('n')) cloudUrl = new TextDecoder().decode(U.fromB64url(qs.get('n')));
        if (!cloudUrl) { fail('Nube no configurada', 'Este enlace necesita la nube de la coordinación, pero no se indicó su dirección.'); return; }
        const r = await SV.cloud.page(cloudUrl, qs.get('id'));
        const p = r.pagina;
        p.form = p.form || {};
        show(p);
        return;
      }
      fail('Enlace incompleto', 'El enlace no incluye la landing page. Pide al autor que lo copie de nuevo desde "Publicar & Compartir".');
    } catch (e) {
      console.error(e);
      fail('No se pudo abrir la landing page', e.message || 'El enlace está dañado o incompleto.');
    }
  };
  start();
})(window.SV);
