/* ==========================================================================
   SENA VENTAS LANDING PAGE · Generador de la landing page
   Un mismo documento sirve para: editor visual (edit), vista en vivo
   (preview), enlace público ver.html (view) y sitio descargable (export).
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  const U = SV.util;
  const esc = U.esc;
  const ms = (n, c = '') => (n ? `<span class="ms ${c}" aria-hidden="true">${esc(n)}</span>` : '');

  /* ---------- Resolución de imágenes, enlaces y WhatsApp ---------- */
  const imgUrl = (src, p) => (/^art:/.test(src || '') ? SV.artSrc(src, p.theme.primary) : String(src || ''));
  const safeUrl = (u) => (/^\s*(javascript|vbscript|data:text)/i.test(u || '') ? '#' : u);
  const img = (src, alt, p, cls = '', extra = '') => {
    const url = imgUrl(src, p);
    if (!url) return '';
    return `<img class="${cls}" src="${esc(safeUrl(url))}" alt="${esc(alt || '')}" loading="lazy" data-ph="${esc(alt || p.client.name)}" ${extra}>`;
  };

  SV.waHref = (p, extra) => {
    const wa = p.wa || {};
    const msg = [wa.message || '', extra || ''].filter(Boolean).join(' ');
    if (wa.mode === 'link' && wa.link) {
      let link = String(wa.link).trim();
      if (!/^https?:\/\//i.test(link)) link = 'https://' + link;
      if (extra && /(wa\.me\/\d+|api\.whatsapp\.com\/send)/i.test(link) && !/[?&]text=/.test(link)) link += (link.includes('?') ? '&' : '?') + 'text=' + encodeURIComponent(msg);
      return link;
    }
    const n = U.digits(wa.number || p.client.whatsapp || '');
    if (!n) return '';
    return 'https://wa.me/' + n + (msg ? '?text=' + encodeURIComponent(msg) : '');
  };

  /* Traduce la acción guardada (form, wa, tel, mail, #ancla o URL) a atributos del enlace. */
  const act = (v, p, extra = {}) => {
    const val = String(v == null ? '' : v).trim();
    if (!val || val === 'form') return `href="#contacto" data-go="form" data-track="cta"${extra.interest ? ` data-interest="${esc(extra.interest)}"` : ''}`;
    if (val === 'wa') { const h = SV.waHref(p, extra.waText); return h ? `href="${esc(h)}" target="_blank" rel="noopener" data-track="whatsapp"` : 'href="#contacto" data-go="form" data-track="cta"'; }
    if (val === 'tel') return `href="tel:${esc(U.digits(p.client.phone) ? '+57' + U.digits(p.client.phone).replace(/^57(?=\d{10}$)/, '') : '')}" data-track="call"`;
    if (val === 'mail') return `href="mailto:${esc(p.client.email)}" data-track="cta"`;
    if (val.charAt(0) === '#') return `href="${esc(val)}"`;
    const url = /^(https?:|mailto:|tel:)/i.test(val) ? val : 'https://' + val;
    return `href="${esc(safeUrl(url))}" target="_blank" rel="noopener" data-track="cta"`;
  };

  const btn = (text, href, p, cls = 'btn-p', icon = '', extra = {}) => (text ? `<a class="btn ${cls}" ${act(href, p, extra)}>${href === 'wa' && !icon ? socialSvg('whatsapp') : ms(icon)}<span>${esc(text)}</span></a>` : '');

  const socialSvg = (id) => { const s = SV.SOCIALS.find((x) => x.id === id); return s ? `<svg class="si" viewBox="0 0 24 24" aria-hidden="true">${s.svg}</svg>` : ''; };

  const rich = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').split(/\n{2,}/).map((para) => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');
  const lines = (t) => String(t || '').split('\n').map((x) => x.trim()).filter(Boolean);

  const head = (pr, align) => (pr.eyebrow || pr.title || pr.text ? `<div class="sec-head ${align === 'left' ? 'left' : ''}">${pr.eyebrow ? `<span class="eyebrow">${esc(pr.eyebrow)}</span>` : ''}${pr.title ? `<h2>${esc(pr.title)}</h2>` : ''}${pr.text ? `<p class="lead">${esc(pr.text)}</p>` : ''}</div>` : '');

  /* ---------- Formulario ---------- */
  let formSeq = 0;
  SV.formHTML = (p, opts = {}) => {
    const f = p.form;
    const id = 'f' + (++formSeq);
    const fields = (f.fields || []).map((fd, i) => {
      const nm = esc(fd.key || 'campo_' + i);
      const fid = id + '_' + nm;
      const req = fd.required ? 'required' : '';
      const star = fd.required ? ' <b class="req">*</b>' : '';
      const cls = 'ff ' + (fd.width === 'half' ? 'half' : 'full');
      const ph = esc(fd.placeholder || '');
      const opts2 = (fd.options || []).filter((o) => String(o).trim());
      if (fd.type === 'hidden') return `<input type="hidden" name="${nm}" value="${ph}">`;
      if (fd.type === 'select') return `<div class="${cls}"><label for="${fid}">${esc(fd.label)}${star}</label><select id="${fid}" name="${nm}" ${req}><option value="">${ph || 'Selecciona una opción'}</option>${opts2.map((o) => `<option>${esc(o)}</option>`).join('')}</select></div>`;
      if (fd.type === 'radio' || fd.type === 'checkbox') return `<fieldset class="${cls} choice" ${req ? 'data-required="1"' : ''} data-name="${nm}"><legend>${esc(fd.label)}${star}</legend><div class="opts">${opts2.map((o, k) => `<label class="opt"><input type="${fd.type}" name="${nm}" value="${esc(o)}" id="${fid}_${k}"><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
      if (fd.type === 'textarea') return `<div class="${cls}"><label for="${fid}">${esc(fd.label)}${star}</label><textarea id="${fid}" name="${nm}" rows="3" placeholder="${ph}" ${req}></textarea></div>`;
      const type = ['text', 'tel', 'email', 'number', 'date', 'time'].includes(fd.type) ? fd.type : 'text';
      const extra = type === 'tel' ? 'inputmode="tel" autocomplete="tel"' : type === 'email' ? 'autocomplete="email"' : nm === 'nombre' ? 'autocomplete="name"' : '';
      return `<div class="${cls}"><label for="${fid}">${esc(fd.label)}${star}</label><input id="${fid}" type="${type}" name="${nm}" placeholder="${ph}" ${req} ${extra}></div>`;
    }).join('');
    const c = f.consent || {};
    return `<form class="lp-form card" data-form="${id}" novalidate>
      ${opts.title ? `<h3 class="form-title">${esc(opts.title)}</h3>` : ''}${opts.text ? `<p class="form-text">${esc(opts.text)}</p>` : ''}
      <div class="ff-grid">${fields}</div>
      <input type="hidden" name="interes" value="">
      <div class="hp" aria-hidden="true"><label>No llenar<input type="text" name="_web" tabindex="-1" autocomplete="off"></label></div>
      ${c.enabled ? `<label class="consent"><input type="checkbox" name="_consent" value="si"><span>${esc(c.text)} <a href="#" data-act="policy">Ver política</a></span></label>` : ''}
      <button class="btn btn-p btn-block" type="submit">${ms('send')}<span>${esc(f.button || 'Enviar')}</span></button>
      <p class="ff-msg" role="alert"></p>
    </form>`;
  };

  /* ---------- Bloques ---------- */
  const R = {};

  R.header = (b, p) => {
    const pr = b.props;
    const name = pr.logoText || p.client.name;
    const logo = pr.logoImage ? img(pr.logoImage, name, p, 'logo-img') : `<span class="logo-ico">${ms(pr.logoIcon || p.client.icon || 'storefront')}</span>`;
    const phone = pr.showPhone && p.client.phone ? `<a class="h-phone" ${act('tel', p)}>${ms('call')}<span>${esc(p.client.phone)}</span></a>` : '';
    return `<div class="wrap h-row"><a class="logo" href="#top">${logo}<b>${esc(name)}</b></a>
      <nav class="h-nav">${(pr.links || []).map((l) => `<a ${act(l.href, p)}>${esc(l.text)}</a>`).join('')}</nav>
      <div class="h-actions">${phone}${btn(pr.ctaText, pr.ctaHref, p, 'btn-p btn-sm')}<button class="h-burger" type="button" data-act="menu" aria-label="Abrir menú">${ms('menu')}</button></div></div>`;
  };

  const heroText = (pr, p, h1 = true) => {
    const title = `${esc(pr.title)}${pr.highlight ? ` <em>${esc(pr.highlight)}</em>` : ''}`;
    return `${pr.eyebrow ? `<span class="eyebrow">${esc(pr.eyebrow)}</span>` : ''}
      ${h1 ? `<h1>${title}</h1>` : `<h2>${title}</h2>`}
      ${pr.text ? `<p class="lead">${esc(pr.text)}</p>` : ''}
      ${(pr.bullets || []).length ? `<ul class="checks">${pr.bullets.map((x) => `<li>${ms('check_circle')}<span>${esc(x.text)}</span></li>`).join('')}</ul>` : ''}
      <div class="ctas">${btn(pr.cta1Text, pr.cta1Href, p, 'btn-p btn-lg')}${btn(pr.cta2Text, pr.cta2Href, p, pr.cta2Href === 'wa' ? 'btn-wa btn-lg' : 'btn-o btn-lg')}</div>
      ${pr.badge ? `<div class="badge-line">${ms('verified')}<span>${esc(pr.badge)}</span></div>` : ''}`;
  };

  R.hero = (b, p) => {
    const pr = b.props;
    const lay = pr.layout || 'form';
    if (lay === 'form') return `<div class="wrap grid2 hero-grid"><div class="hero-copy rv">${heroText(pr, p)}</div><div class="hero-form rv">${SV.formHTML(p, { title: pr.formTitle, text: pr.formText })}</div></div>`;
    if (lay === 'image') return `<div class="wrap grid2 hero-grid"><div class="hero-copy rv">${heroText(pr, p)}</div><div class="hero-img rv">${img(pr.image, pr.title, p)}</div></div>`;
    if (lay === 'cover') return `<div class="wrap"><div class="hero-copy cover rv">${heroText(pr, p)}</div></div>`;
    const showImg = pr.image && pr.image !== 'art:abstracto';
    return `<div class="wrap center hero-center rv">${heroText(pr, p)}${showImg ? `<div class="hero-img wide">${img(pr.image, pr.title, p)}</div>` : ''}</div>`;
  };

  R.form = (b, p) => {
    const pr = b.props;
    const contact = pr.showContact ? contactList(p) : '';
    const aside = `${pr.eyebrow ? `<span class="eyebrow">${esc(pr.eyebrow)}</span>` : ''}${pr.title ? `<h2>${esc(pr.title)}</h2>` : ''}${pr.text ? `<p class="lead">${esc(pr.text)}</p>` : ''}
      ${(pr.bullets || []).length ? `<ul class="reasons">${pr.bullets.map((x) => `<li><span class="r-ico">${ms(x.icon || 'check_circle')}</span><span>${esc(x.text)}</span></li>`).join('')}</ul>` : ''}${contact}`;
    const form = SV.formHTML(p, { title: pr.formTitle || '' });
    if (pr.layout === 'center') return `<div class="wrap narrow center">${head(pr)}<div class="rv">${form}</div>${contact ? `<div class="center-contact">${contact}</div>` : ''}</div>`;
    if (pr.layout === 'image') return `<div class="wrap grid2 form-grid"><div class="rv">${img(pr.image || 'art:abstracto', pr.title, p, 'form-img')}<div class="form-aside">${aside}</div></div><div class="rv">${form}</div></div>`;
    return `<div class="wrap grid2 form-grid"><div class="form-aside rv">${aside}</div><div class="rv">${form}</div></div>`;
  };

  const contactList = (p) => {
    const c = p.client;
    const rows = [
      c.phone ? `<a ${act('tel', p)}>${ms('call')}<span>${esc(c.phone)}</span></a>` : '',
      SV.waHref(p) ? `<a ${act('wa', p)}>${socialSvg('whatsapp')}<span>WhatsApp</span></a>` : '',
      c.email ? `<a ${act('mail', p)}>${ms('mail')}<span>${esc(c.email)}</span></a>` : '',
      c.address || c.city ? `<span>${ms('location_on')}<span>${esc([c.address, c.city].filter(Boolean).join(', '))}</span></span>` : '',
      c.schedule ? `<span>${ms('schedule')}<span>${esc(c.schedule)}</span></span>` : ''
    ].filter(Boolean);
    return rows.length ? `<div class="contact-list">${rows.join('')}</div>` : '';
  };

  R.features = (b, p) => {
    const pr = b.props;
    const look = pr.look || 'cards';
    return `<div class="wrap">${head(pr, b.style.align)}<div class="cols c${esc(pr.columns || 3)} feat-${look}">${(pr.items || []).map((it) => `<div class="feat ${look === 'cards' ? 'card' : ''} rv"><span class="f-ico">${ms(it.icon || 'star')}</span><div><h3>${esc(it.title)}</h3>${it.text ? `<p>${esc(it.text)}</p>` : ''}${it.price ? `<div class="price">${esc(it.price)}</div>` : ''}${it.linkText ? `<a class="more" ${act(it.link, p, { interest: it.title })}>${esc(it.linkText)} ${ms('arrow_forward')}</a>` : ''}</div></div>`).join('')}</div></div>`;
  };

  R.cards = (b, p) => {
    const pr = b.props;
    const items = pr.items || [];
    const tags = Array.from(new Set(items.map((i) => (i.badge || '').trim()).filter(Boolean)));
    const filters = pr.filters && tags.length > 1 ? `<div class="filters"><button type="button" class="chip on" data-filter="">Todos</button>${tags.map((t) => `<button type="button" class="chip" data-filter="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : '';
    return `<div class="wrap">${head(pr, b.style.align)}${filters}<div class="cols c${esc(pr.columns || 3)}">${items.map((it) => {
      const action = it.btnAction === 'url' ? (it.btnUrl || '#') : it.btnAction || 'wa';
      const waText = 'Me interesa: ' + [it.title, it.subtitle, it.price].filter(Boolean).join(' · ');
      return `<article class="pcard card rv" data-tag="${esc((it.badge || '').trim())}"><div class="pc-img">${img(it.image, it.title, p)}${it.badge ? `<span class="pc-badge">${esc(it.badge)}</span>` : ''}</div><div class="pc-body"><h3>${esc(it.title)}</h3>${it.subtitle ? `<p class="pc-sub">${ms('location_on')}${esc(it.subtitle)}</p>` : ''}${it.specs ? `<div class="specs">${String(it.specs).split('·').map((s) => s.trim()).filter(Boolean).map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}<div class="pc-foot">${it.price ? `<b class="price">${esc(it.price)}</b>` : '<span></span>'}${it.btnText ? `<a class="btn ${action === 'wa' ? 'btn-wa' : 'btn-p'} btn-sm" ${act(action, p, { interest: it.title, waText })}>${action === 'wa' ? socialSvg('whatsapp') : ''}<span>${esc(it.btnText)}</span></a>` : ''}</div></div></article>`;
    }).join('')}</div></div>`;
  };

  R.about = (b, p) => {
    const pr = b.props;
    const pic = `<div class="about-img rv">${img(pr.image, pr.title, p)}${pr.badgeValue ? `<div class="about-badge"><b>${esc(pr.badgeValue)}</b><span>${esc(pr.badgeLabel)}</span></div>` : ''}</div>`;
    const txt = `<div class="rv">${pr.eyebrow ? `<span class="eyebrow">${esc(pr.eyebrow)}</span>` : ''}${pr.title ? `<h2>${esc(pr.title)}</h2>` : ''}${pr.text ? rich(pr.text) : ''}${(pr.bullets || []).length ? `<ul class="checks">${pr.bullets.map((x) => `<li>${ms('check_circle')}<span>${esc(x.text)}</span></li>`).join('')}</ul>` : ''}<div class="ctas">${btn(pr.ctaText, pr.ctaHref, p, 'btn-p')}</div></div>`;
    return `<div class="wrap grid2 about-grid ${pr.side === 'right' ? 'flip' : ''}">${pic}${txt}</div>`;
  };

  R.stats = (b, p) => `<div class="wrap">${b.props.title ? `<h2 class="center stats-title">${esc(b.props.title)}</h2>` : ''}<div class="stats">${(b.props.items || []).map((it) => `<div class="stat rv">${ms(it.icon)}<b>${esc(it.value)}</b><span>${esc(it.label)}</span></div>`).join('')}</div></div>`;

  R.steps = (b, p) => `<div class="wrap">${head(b.props, b.style.align)}<ol class="steps">${(b.props.items || []).map((it, i) => `<li class="rv"><span class="n">${i + 1}</span><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></li>`).join('')}</ol></div>`;

  R.testimonials = (b, p) => `<div class="wrap">${head(b.props, b.style.align)}<div class="cols c3">${(b.props.items || []).map((it) => `<figure class="testi card rv">${Number(it.rating) ? `<div class="stars" aria-label="${esc(it.rating)} estrellas">${'★'.repeat(Number(it.rating))}</div>` : ''}<blockquote>“${esc(it.text)}”</blockquote><figcaption>${img(it.photo, it.name, p, 'avatar')}<span><b>${esc(it.name)}</b><small>${esc(it.role)}</small></span></figcaption></figure>`).join('')}</div></div>`;

  R.team = (b, p) => `<div class="wrap">${head(b.props, b.style.align)}<div class="cols c4 team">${(b.props.items || []).map((it) => `<div class="member card rv">${img(it.photo, it.name, p, 'm-photo')}<h3>${esc(it.name)}</h3><span class="role">${esc(it.role)}</span>${it.text ? `<p>${esc(it.text)}</p>` : ''}</div>`).join('')}</div></div>`;

  R.gallery = (b, p) => `<div class="wrap">${head(b.props, b.style.align)}<div class="cols c${esc(b.props.columns || 3)} gallery">${(b.props.items || []).map((it) => `<figure class="g-item rv" data-lightbox="${esc(imgUrl(it.image, p))}" data-caption="${esc(it.caption)}">${img(it.image, it.caption || 'Foto', p)}${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ''}</figure>`).join('')}</div></div>`;

  R.pricing = (b, p) => `<div class="wrap">${head(b.props, b.style.align)}<div class="cols c${Math.min(4, Math.max(2, (b.props.items || []).length))} pricing">${(b.props.items || []).map((it) => `<div class="plan card rv ${it.highlight ? 'hl' : ''}">${it.highlight ? '<span class="plan-tag">Recomendado</span>' : ''}<h3>${esc(it.name)}</h3><div class="plan-price">${esc(it.price)}</div><small>${esc(it.period)}</small><ul>${lines(it.features).map((l) => `<li>${ms('check')}<span>${esc(l)}</span></li>`).join('')}</ul>${btn(it.btnText, it.btnHref, p, it.highlight ? 'btn-p btn-block' : 'btn-o btn-block', '', { interest: it.name })}</div>`).join('')}</div></div>`;

  R.faq = (b, p) => `<div class="wrap narrow">${head(b.props)}<div class="faq">${(b.props.items || []).map((it) => `<details class="rv"><summary><span>${esc(it.q)}</span>${ms('expand_more')}</summary><div>${rich(it.a)}</div></details>`).join('')}</div></div>`;

  R.cta = (b, p) => `<div class="wrap center cta rv">${b.props.title ? `<h2>${esc(b.props.title)}</h2>` : ''}${b.props.text ? `<p class="lead">${esc(b.props.text)}</p>` : ''}<div class="ctas">${btn(b.props.btn1Text, b.props.btn1Href, p, 'btn-a btn-lg')}${btn(b.props.btn2Text, b.props.btn2Href, p, b.props.btn2Href === 'wa' ? 'btn-wa btn-lg' : 'btn-o btn-lg')}</div></div>`;

  R.countdown = (b, p) => `<div class="wrap grid2 cd-grid"><div class="rv">${b.props.eyebrow ? `<span class="eyebrow">${esc(b.props.eyebrow)}</span>` : ''}<h2>${esc(b.props.title)}</h2>${b.props.text ? `<p class="lead">${esc(b.props.text)}</p>` : ''}</div><div class="rv center"><div class="timer" data-until="${esc(b.props.until || '')}" data-cd="${esc(b.id)}" data-expired="${esc(b.props.expired || '')}">${['Días', 'Horas', 'Min', 'Seg'].map((l) => `<div><b>00</b><span>${l}</span></div>`).join('')}</div><div class="ctas center">${btn(b.props.ctaText, b.props.ctaHref, p, 'btn-a btn-lg')}</div></div></div>`;

  R.buttons = (b, p) => `<div class="wrap">${b.props.title ? `<h2>${esc(b.props.title)}</h2>` : ''}${b.props.text ? `<p class="lead">${esc(b.props.text)}</p>` : ''}<div class="ctas btn-row">${(b.props.items || []).map((it) => btn(it.text, it.href, p, { primary: 'btn-p', accent: 'btn-a', outline: 'btn-o', dark: 'btn-d', wa: 'btn-wa' }[it.look] || 'btn-p', it.icon)).join('')}</div></div>`;

  R.text = (b, p) => `<div class="wrap ${b.props.narrow ? 'narrow' : ''} rv">${b.props.eyebrow ? `<span class="eyebrow">${esc(b.props.eyebrow)}</span>` : ''}${b.props.title ? `<h2>${esc(b.props.title)}</h2>` : ''}<div class="rich">${rich(b.props.body)}</div></div>`;

  R.image = (b, p) => {
    const pr = b.props;
    const pic = img(pr.src, pr.alt, p, 'single');
    const inner = pr.link ? `<a ${act(pr.link, p)}>${pic}</a>` : pic;
    return `<figure class="${pr.width === 'full' ? 'full-img' : 'wrap ' + (pr.width === 'narrow' ? 'narrow' : '')} rv">${inner}${pr.caption ? `<figcaption>${esc(pr.caption)}</figcaption>` : ''}</figure>`;
  };

  const videoEmbed = (url) => {
    const u = String(url || '').trim();
    let m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i);
    if (m) return `<iframe src="https://www.youtube-nocookie.com/embed/${esc(m[1])}" title="Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    m = u.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (m) return `<iframe src="https://player.vimeo.com/video/${esc(m[1])}" title="Video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    if (/^https?:\/\/.+\.(mp4|webm|ogg)(\?.*)?$/i.test(u)) return `<video src="${esc(u)}" controls playsinline preload="metadata"></video>`;
    return `<div class="video-ph">${ms('smart_display')}<span>Pega la URL de YouTube, Vimeo o un archivo .mp4 en el panel del bloque.</span></div>`;
  };
  R.video = (b, p) => `<div class="wrap">${head(b.props, b.style.align)}<div class="video rv">${videoEmbed(b.props.url)}</div></div>`;

  R.map = (b, p) => {
    const pr = b.props; const c = p.client;
    const q = pr.address || [c.address, c.city].filter(Boolean).join(', ') || c.city || 'Colombia';
    const src = /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(pr.embed || '') ? pr.embed : 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=15&output=embed';
    const sched = pr.schedule || c.schedule;
    return `<div class="wrap">${head(pr, b.style.align)}<div class="grid2 map-grid"><div class="card map-info rv"><h3>${esc(c.name)}</h3><p>${ms('location_on')}<span>${esc(q)}</span></p>${sched ? `<p>${ms('schedule')}<span>${esc(sched).replace(/\n/g, '<br>')}</span></p>` : ''}${pr.showContact ? contactList(Object.assign({}, p, { client: Object.assign({}, c, { address: '', city: '', schedule: '' }) })) : ''}<div class="ctas">${btn('Cómo llegar', 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q), p, 'btn-p btn-sm', 'directions')}</div></div><div class="map rv"><iframe src="${esc(src)}" title="Mapa de ubicación" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe></div></div></div>`;
  };

  R.embed = (b, p) => `<div class="wrap">${b.props.title ? `<h2 class="center">${esc(b.props.title)}</h2>` : ''}<div class="embed-box" style="${Number(b.props.height) ? 'min-height:' + Number(b.props.height) + 'px' : ''}">${b.props.code || ''}</div></div>`;

  R.logos = (b, p) => `<div class="wrap">${b.props.title ? `<p class="logos-title">${esc(b.props.title)}</p>` : ''}<div class="logos">${(b.props.items || []).map((it) => `<div class="logo-item rv">${img(it.image, it.name, p)}</div>`).join('')}</div></div>`;

  const socialLinks = (p, look = 'buttons') => {
    const list = SV.SOCIALS.filter((s) => s.id !== 'whatsapp' && p.social && p.social[s.id]).map((s) => ({ s, href: /^https?:/i.test(p.social[s.id]) ? p.social[s.id] : 'https://' + p.social[s.id] }));
    const wa = SV.waHref(p);
    if (wa) list.unshift({ s: SV.SOCIALS[0], href: wa, wa: true });
    return list.map(({ s, href, wa: isWa }) => `<a class="soc soc-${look}" href="${esc(safeUrl(href))}" target="_blank" rel="noopener" ${isWa ? 'data-track="whatsapp"' : 'data-track="social"'} aria-label="${esc(s.label)}" style="--brand:${s.color}">${`<svg class="si" viewBox="0 0 24 24" aria-hidden="true">${s.svg}</svg>`}${look === 'icons' ? '' : `<span>${esc(s.label)}</span>`}</a>`).join('');
  };
  R.social = (b, p) => `<div class="wrap">${b.props.title ? `<h2>${esc(b.props.title)}</h2>` : ''}${b.props.text ? `<p class="lead">${esc(b.props.text)}</p>` : ''}<div class="socials">${socialLinks(p, b.props.look) || '<p class="lead">Agrega los enlaces de tus redes en Diseño & Marca → WhatsApp y redes.</p>'}</div></div>`;

  R.divider = (b) => `<div class="wrap"><div class="divider" style="height:${Math.max(0, Number(b.props.height) || 0)}px">${b.props.line ? '<hr>' : ''}</div></div>`;

  R.footer = (b, p) => {
    const pr = b.props; const c = p.client; const o = p.owner || {};
    return `<div class="wrap"><div class="f-grid"><div><a class="logo" href="#top"><span class="logo-ico">${ms(c.icon || 'storefront')}</span><b>${esc(c.name)}</b></a>${c.slogan ? `<p>${esc(c.slogan)}</p>` : ''}${pr.text ? `<p class="f-note">${esc(pr.text)}</p>` : ''}</div>
      ${pr.showContact ? `<div><h4>Contacto</h4>${contactList(p)}</div>` : ''}
      ${pr.showSocial ? `<div><h4>Síguenos</h4><div class="socials left">${socialLinks(p, 'icons')}</div></div>` : ''}</div>
      <div class="f-bottom"><span>© ${new Date().getFullYear()} ${esc(c.name)}</span>${pr.legal ? `<a href="#" data-act="policy">${esc(pr.legal)}</a>` : ''}${(pr.links || []).map((l) => `<a ${act(l.href, p)}>${esc(l.text)}</a>`).join('')}${pr.credits ? `<span class="credits">Landing creada con SENA VENTAS LANDING PAGE por ${esc(o.name || 'Aprendiz SENA')}${o.ficha ? ' · Ficha ' + esc(o.ficha) : ''}</span>` : ''}</div></div>`;
  };

  /* ---------- Envoltura de sección ---------- */
  const sectionBg = (b, p) => {
    const t = p.theme; const st = b.style || {};
    const map = { default: t.bg, soft: t.surface, primary: t.primary, dark: t.dark, accent: t.accent, custom: st.bg || t.bg, image: '#000000' };
    return map[st.variant] || t.bg;
  };
  SV.anchorOf = (b) => {
    const a = U.slug((b.style && b.style.anchor) || '', '');
    return a || b.type + '-' + String(b.id).slice(-4);
  };

  const renderBlock = (b, p, ctx) => {
    const fn = R[b.type];
    if (!fn) return '';
    if (b.hidden && ctx.mode !== 'edit') return '';
    const st = b.style || {};
    const variant = st.variant || 'default';
    const bg = sectionBg(b, p);
    const dark = variant === 'image' ? true : U.isDark(bg);
    const cls = ['blk', 'blk-' + b.type, 'v-' + variant, 'pad-' + (st.pad || 'm'), dark ? 'dk' : 'lt', st.align ? 'al-' + st.align : '', st.hideMobile ? 'hide-m' : '', st.hideDesktop ? 'hide-d' : '', b.hidden ? 'is-hidden' : '', b.type === 'header' && b.props.sticky ? 'sticky' : ''].filter(Boolean).join(' ');
    let style = '';
    if (variant === 'custom' && st.bg) style += `--sbg:${st.bg};`;
    if (variant === 'image') {
      const bgi = imgUrl(st.bgImage || (b.type === 'hero' ? b.props.image : ''), p);
      if (bgi) style += `background-image:url('${String(safeUrl(bgi)).replace(/'/g, '%27')}');`;
      style += `--ov:${(Number(st.overlay) || 0) / 100};`;
    }
    const tag = b.type === 'header' ? 'header' : b.type === 'footer' ? 'footer' : 'section';
    const label = (SV.BLOCKS[b.type] || {}).label || b.type;
    return `<${tag} id="${esc(SV.anchorOf(b))}" class="${cls}" data-bid="${esc(b.id)}" data-label="${esc(label)}${b.hidden ? ' (oculto)' : ''}"${style ? ` style="${esc(style)}"` : ''}>${fn(b, p, ctx)}</${tag}>`;
  };

  /* ---------- CSS de la landing ---------- */
  const FONT_W = { Lato: '400;700;900', Merriweather: '400;700;900', 'Libre Baskerville': '400;700', 'Bebas Neue': '400', Anton: '400', Righteous: '400', 'DM Serif Display': '400' };
  const fam = (f) => { const k = (SV.FONTS.find((x) => x.name === f) || {}).kind; return `'${f}', ${k === 'serif' ? 'Georgia, serif' : 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}`; };

  SV.fontsHref = (p, icons) => {
    const t = p.theme;
    const fams = Array.from(new Set([t.fontHead, t.fontBody].filter(Boolean)));
    const q = fams.map((f) => 'family=' + encodeURIComponent(f).replace(/%20/g, '+') + ':wght@' + (FONT_W[f] || '400;500;600;700;800')).join('&');
    const ic = icons && icons.length ? '&icon_names=' + icons.sort().join(',') : '';
    return { text: 'https://fonts.googleapis.com/css2?' + q + '&display=swap', icons: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..600,0..1,0' + ic + '&display=block' };
  };

  SV.landingCSS = (p) => {
    const t = p.theme;
    const r = Math.max(0, Math.min(40, Number(t.radius) || 0));
    const br = t.btn === 'pill' ? '999px' : t.btn === 'sharp' ? '2px' : Math.min(r, 14) + 'px';
    const sh = t.shadow === 'none' ? 'none' : t.shadow === 'strong' ? '0 22px 48px -18px rgba(15,23,42,.38)' : '0 12px 32px -14px rgba(15,23,42,.18)';
    const border = t.shadow === 'none' ? '1px solid color-mix(in srgb, var(--tx) 12%, transparent)' : '1px solid color-mix(in srgb, var(--tx) 6%, transparent)';
    const onP = U.onColor(t.primary); const onA = U.onColor(t.accent); const onD = U.onColor(t.dark);
    return `:root{--p:${t.primary};--p2:${t.secondary};--a:${t.accent};--bg:${t.bg};--sf:${t.surface};--tx:${t.text};--mu:${t.muted};--dk:${t.dark};--on-p:${onP};--on-a:${onA};--on-dk:${onD};--r:${r}px;--br:${br};--sh:${sh};--bd:${border};--fh:${fam(t.fontHead)};--fb:${fam(t.fontBody)};--w:${Number(t.width) || 1180}px}
*{box-sizing:border-box}html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}body{margin:0;background:var(--bg);color:var(--tx);font-family:var(--fb);font-size:16.5px;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:hidden}
img{max-width:100%;display:block}a{color:inherit}p{margin:0 0 1em}h1,h2,h3,h4{font-family:var(--fh);line-height:1.15;margin:0 0 .45em;letter-spacing:-.01em;font-weight:800}h2{font-size:clamp(26px,3.4vw,40px)}h3{font-size:19px;font-weight:700}
.ms{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;font-size:1.25em;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;direction:ltr;font-feature-settings:'liga';-webkit-font-feature-settings:'liga';vertical-align:-.2em;overflow:hidden;max-width:1.1em;flex-shrink:0}
html:not(.icons-ok) .ms{color:transparent!important}
.si{width:1.15em;height:1.15em;flex-shrink:0;vertical-align:-.2em}
.wrap{width:100%;max-width:var(--w);margin:0 auto;padding:0 22px}.narrow{max-width:820px}.center{text-align:center}.center .ctas,.center.ctas{justify-content:center}
.blk{position:relative;color:var(--tx)}.pad-none{padding:0}.pad-s{padding:40px 0}.pad-m{padding:80px 0}.pad-l{padding:104px 0}.pad-xl{padding:136px 0}
.v-default{background:var(--bg)}.v-soft{background:var(--sf)}.v-primary{background:var(--p);color:var(--on-p)}.v-dark{background:var(--dk);color:var(--on-dk)}.v-accent{background:var(--a);color:var(--on-a)}.v-custom{background:var(--sbg)}
.v-image{background-color:#111;background-size:cover;background-position:center;color:#fff}.v-image:before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,calc(var(--ov) + .15)),rgba(0,0,0,var(--ov)))}.v-image>*{position:relative}
.dk{--mu2:rgba(255,255,255,.78)}.lt{--mu2:var(--mu)}.v-custom.dk,.v-default.dk,.v-soft.dk{color:#fff}.v-custom.lt{color:var(--tx)}
.al-center .sec-head,.al-center{text-align:center}.al-center .ctas{justify-content:center}.al-left .sec-head{text-align:left;margin-left:0}
.eyebrow{display:inline-block;font-size:13px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--p);margin-bottom:12px}.dk .eyebrow{color:var(--a)}.v-accent .eyebrow{color:var(--on-a)}
.lead{font-size:18px;color:var(--mu2)}.sec-head{max-width:760px;margin:0 auto 44px;text-align:center}.sec-head.left{text-align:left;margin-left:0}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 22px;border-radius:var(--br);font-weight:700;font-size:15.5px;text-decoration:none;border:2px solid transparent;cursor:pointer;transition:transform .15s,box-shadow .15s,background .15s;line-height:1.2;font-family:var(--fb);white-space:nowrap}.btn:hover{transform:translateY(-2px);box-shadow:0 10px 22px -12px rgba(0,0,0,.45)}
.btn-p{background:var(--p);color:var(--on-p)}.btn-a{background:var(--a);color:var(--on-a)}.btn-d{background:var(--dk);color:var(--on-dk)}.btn-wa{background:#25d366;color:#fff}.btn-o{border-color:currentColor;background:transparent;color:inherit}.lt .btn-o{color:var(--p)}
${t.btn === 'outline' ? '.btn-p{background:transparent;color:var(--p);border-color:var(--p)}.dk .btn-p{color:#fff;border-color:#fff}' : ''}
.v-primary .btn-p{background:var(--a);color:var(--on-a)}.btn-sm{padding:9px 15px;font-size:14px}.btn-lg{padding:16px 28px;font-size:16.5px}.btn-block{width:100%}
.ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:26px}.btn-row{justify-content:inherit}.blk-buttons .ctas{margin-top:8px}.al-center.blk-buttons .ctas,.blk-buttons.al-center .ctas{justify-content:center}
.card{background:var(--sf);color:var(--tx);border-radius:var(--r);padding:26px;box-shadow:var(--sh);border:var(--bd)}.v-soft .card{background:var(--bg)}
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:56px;align-items:center}
.cols{display:grid;gap:24px}.c2{grid-template-columns:repeat(2,minmax(0,1fr))}.c3{grid-template-columns:repeat(3,minmax(0,1fr))}.c4{grid-template-columns:repeat(4,minmax(0,1fr))}
.checks{list-style:none;padding:0;margin:18px 0 0;display:grid;gap:10px}.checks li{display:flex;gap:10px;align-items:flex-start;font-weight:600}.checks .ms{color:var(--p);font-variation-settings:'FILL' 1}.dk .checks .ms{color:var(--a)}
/* Encabezado */
.blk.blk-header{padding:0}.blk-header{background:var(--bg);box-shadow:0 1px 0 color-mix(in srgb,var(--tx) 8%,transparent);z-index:40}.blk-header.sticky{position:sticky;top:0;backdrop-filter:blur(10px);background:color-mix(in srgb,var(--bg) 92%,transparent)}.blk-header.v-dark,.blk-header.v-primary{background:var(--dk)}.blk-header.v-primary{background:var(--p)}
.h-row{display:flex;align-items:center;gap:22px;min-height:72px}.logo{display:flex;align-items:center;gap:10px;text-decoration:none;font-family:var(--fh);font-size:19px;min-width:0}.logo b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.logo-ico{width:40px;height:40px;border-radius:calc(var(--r) * .7);background:var(--p);color:var(--on-p);display:flex;align-items:center;justify-content:center;flex-shrink:0}.logo-img{height:44px;width:auto;max-width:170px;object-fit:contain}
.h-nav{display:flex;gap:24px;margin-left:auto}.h-nav a{text-decoration:none;font-weight:600;font-size:15px;opacity:.85}.h-nav a:hover{opacity:1;color:var(--p)}.dk .h-nav a:hover{color:var(--a)}
.h-actions{display:flex;align-items:center;gap:14px}.h-phone{display:flex;align-items:center;gap:6px;text-decoration:none;font-weight:700;font-size:14.5px;white-space:nowrap}.h-burger{display:none;background:none;border:0;color:inherit;font-size:22px;cursor:pointer;padding:6px}
/* Portada */
.blk-hero h1{font-size:clamp(34px,5vw,58px);line-height:1.08}.blk-hero h1 em{font-style:normal;color:var(--p)}.dk.blk-hero h1 em,.blk-hero.v-primary h1 em{color:var(--a)}
.hero-grid{grid-template-columns:minmax(0,1.08fr) minmax(0,.92fr)}.hero-img img{width:100%;border-radius:calc(var(--r) * 1.5);box-shadow:var(--sh);aspect-ratio:4/3;object-fit:cover}.hero-img.wide{max-width:960px;margin:44px auto 0}
.hero-copy.cover{max-width:720px}.hero-center{max-width:900px}.hero-center .checks{justify-items:center}
.badge-line{display:inline-flex;align-items:center;gap:8px;margin-top:24px;font-weight:700;font-size:14.5px;padding:8px 14px;border-radius:999px;background:color-mix(in srgb,var(--p) 12%,transparent)}.dk .badge-line{background:rgba(255,255,255,.14)}.badge-line .ms{color:var(--p)}.dk .badge-line .ms{color:var(--a)}
/* Formulario */
.lp-form{display:flex;flex-direction:column;gap:14px;text-align:left}.lp-form .form-title{font-size:22px;margin:0}.lp-form .form-text{margin:-6px 0 0;color:var(--mu)}
.ff-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 14px}.ff.full{grid-column:1/-1}.ff label,.choice legend{display:block;font-size:13.5px;font-weight:700;margin-bottom:5px}.req{color:#d6333f}
.ff input,.ff select,.ff textarea{width:100%;font:inherit;font-size:15.5px;padding:12px 14px;border-radius:min(var(--r),12px);border:1.5px solid color-mix(in srgb,var(--tx) 16%,transparent);background:var(--bg);color:var(--tx);outline:none;transition:.15s}.ff textarea{resize:vertical;min-height:84px}
.ff input:focus,.ff select:focus,.ff textarea:focus{border-color:var(--p);box-shadow:0 0 0 4px color-mix(in srgb,var(--p) 18%,transparent)}.ff .bad,.choice.bad .opts{border-color:#d6333f!important;box-shadow:0 0 0 3px rgba(214,51,63,.14)}
.choice{border:0;padding:0;margin:0;min-width:0}.opts{display:flex;flex-wrap:wrap;gap:8px;border-radius:10px}.opt{display:flex;align-items:center;gap:7px;padding:8px 12px;border-radius:999px;border:1.5px solid color-mix(in srgb,var(--tx) 14%,transparent);font-size:14px;cursor:pointer;background:var(--bg)}.opt input{accent-color:var(--p);margin:0}
.consent{display:flex;gap:10px;align-items:flex-start;font-size:13px;color:var(--mu);cursor:pointer}.consent input{margin-top:3px;accent-color:var(--p);width:17px;height:17px;flex-shrink:0}.consent a{color:var(--p);font-weight:700}.consent.bad{color:#d6333f}
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}.ff-msg{margin:0;font-size:13.5px;font-weight:600;color:#d6333f;min-height:0}.ff-msg:empty{display:none}
.lp-ok{text-align:center;padding:18px 6px}.lp-ok .ok-ico{width:70px;height:70px;border-radius:99px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p) 14%,transparent);color:var(--p);font-size:40px}.lp-ok h3{font-size:23px}.lp-ok p{color:var(--mu)}
.form-grid{align-items:start}.form-aside h2{margin-bottom:12px}.reasons{list-style:none;padding:0;margin:22px 0;display:grid;gap:14px}.reasons li{display:flex;gap:12px;align-items:center;font-weight:600}.r-ico{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p) 14%,transparent);color:var(--p);flex-shrink:0}.dk .r-ico{background:rgba(255,255,255,.12);color:var(--a)}
.form-img{width:100%;border-radius:var(--r);aspect-ratio:16/10;object-fit:cover;margin-bottom:22px}.center-contact{margin-top:26px;display:flex;justify-content:center}
.contact-list{display:grid;gap:10px;margin-top:18px}.contact-list a,.contact-list>span{display:flex;gap:10px;align-items:flex-start;text-decoration:none;font-weight:600;font-size:15px}.contact-list .ms,.contact-list .si{color:var(--p);margin-top:2px}.dk .contact-list .ms,.dk .contact-list .si{color:var(--a)}
/* Servicios */
.feat h3{margin-bottom:6px}.feat p{color:var(--mu);margin:0}.f-ico{width:52px;height:52px;border-radius:calc(var(--r) * .8);display:inline-flex;align-items:center;justify-content:center;background:color-mix(in srgb,var(--p) 13%,transparent);color:var(--p);font-size:24px;margin-bottom:16px}
.feat .price{margin-top:12px;font-weight:800;color:var(--p);font-family:var(--fh)}.more{display:inline-flex;align-items:center;gap:4px;margin-top:12px;font-weight:700;color:var(--p);text-decoration:none}
.feat-icons .feat{text-align:center;padding:10px}.feat-icons .f-ico{width:72px;height:72px;border-radius:99px;font-size:32px}.dk .feat-icons .feat p,.dk .feat-list .feat p{color:var(--mu2)}
.feat-list .feat{display:flex;gap:16px;align-items:flex-start}.feat-list .f-ico{margin:0}
/* Tarjetas con imagen */
.filters{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:-18px 0 30px}.chip{border:1.5px solid color-mix(in srgb,currentColor 25%,transparent);background:transparent;color:inherit;padding:8px 16px;border-radius:999px;font:inherit;font-weight:700;font-size:14px;cursor:pointer}.chip.on{background:var(--p);color:var(--on-p);border-color:var(--p)}
.pcard{padding:0;overflow:hidden;display:flex;flex-direction:column}.pc-img{position:relative}.pc-img img{width:100%;aspect-ratio:4/3;object-fit:cover}.pc-badge{position:absolute;top:14px;left:14px;background:var(--p);color:var(--on-p);font-size:12.5px;font-weight:800;padding:5px 12px;border-radius:999px}
.pc-body{padding:20px;display:flex;flex-direction:column;gap:8px;flex:1}.pc-body h3{margin:0}.pc-sub{display:flex;gap:4px;align-items:center;color:var(--mu);margin:0;font-size:14.5px}.specs{display:flex;flex-wrap:wrap;gap:6px}.specs span{font-size:12.5px;font-weight:600;padding:4px 10px;border-radius:8px;background:color-mix(in srgb,var(--tx) 6%,transparent)}
.pc-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:10px}.price{font-family:var(--fh);font-size:19px;color:var(--p)}.pcard.off{display:none}
/* Nosotros */
.about-img{position:relative}.about-img img{width:100%;border-radius:calc(var(--r) * 1.4);aspect-ratio:5/4;object-fit:cover;box-shadow:var(--sh)}.about-badge{position:absolute;right:-12px;bottom:-18px;background:var(--p);color:var(--on-p);padding:16px 20px;border-radius:var(--r);box-shadow:var(--sh);max-width:200px}.about-badge b{display:block;font-size:34px;font-family:var(--fh);line-height:1}.about-badge span{font-size:13.5px;font-weight:600}
.about-grid.flip .about-img{order:2}.rich p,.about-grid p{color:var(--mu2)}
/* Cifras, pasos */
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:22px;text-align:center}.stat .ms{font-size:30px;opacity:.85}.stat b{display:block;font-family:var(--fh);font-size:clamp(30px,4vw,44px);line-height:1.1;margin:6px 0 4px}.stat span{font-weight:600;opacity:.85}.stats-title{margin-bottom:30px}
.steps{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:26px;counter-reset:s}.steps li{position:relative;padding-top:6px}.steps .n{width:52px;height:52px;border-radius:99px;background:var(--p);color:var(--on-p);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;font-family:var(--fh);margin-bottom:16px;box-shadow:0 0 0 8px color-mix(in srgb,var(--p) 14%,transparent)}.steps p{color:var(--mu2);margin:0}
/* Testimonios, equipo */
.testi{margin:0;display:flex;flex-direction:column;gap:14px}.stars{color:#f5a524;letter-spacing:2px;font-size:18px}.testi blockquote{margin:0;font-size:16px}.testi figcaption{display:flex;gap:12px;align-items:center;margin-top:auto}.avatar{width:48px;height:48px;border-radius:99px;object-fit:cover}.testi small{display:block;color:var(--mu);font-size:13px}
.member{text-align:center}.m-photo{width:120px;height:120px;border-radius:99px;object-fit:cover;margin:0 auto 14px}.member h3{margin:0}.role{display:block;color:var(--p);font-weight:700;font-size:14px;margin:4px 0 8px}.member p{color:var(--mu);font-size:14.5px;margin:0}
/* Galería */
.g-item{margin:0;position:relative;border-radius:var(--r);overflow:hidden;cursor:zoom-in}.g-item img{width:100%;aspect-ratio:4/3;object-fit:cover;transition:transform .4s}.g-item:hover img{transform:scale(1.05)}.g-item figcaption{position:absolute;left:0;right:0;bottom:0;padding:24px 14px 12px;color:#fff;font-weight:600;font-size:14px;background:linear-gradient(transparent,rgba(0,0,0,.7))}
/* Planes */
.pricing{align-items:stretch}.plan{display:flex;flex-direction:column;gap:6px;position:relative}.plan.hl{box-shadow:0 0 0 3px var(--p),var(--sh);transform:translateY(-6px)}.plan-tag{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:var(--p);color:var(--on-p);font-size:12px;font-weight:800;padding:4px 14px;border-radius:999px;white-space:nowrap}
.plan-price{font-family:var(--fh);font-size:34px;font-weight:800;color:var(--p);line-height:1.1}.plan small{color:var(--mu)}.plan ul{list-style:none;padding:0;margin:14px 0 20px;display:grid;gap:9px;flex:1}.plan li{display:flex;gap:8px;align-items:flex-start;font-size:15px}.plan li .ms{color:var(--p)}
/* FAQ */
.faq{display:grid;gap:12px}.faq details{background:var(--sf);color:var(--tx);border-radius:var(--r);border:var(--bd);overflow:hidden}.v-soft .faq details{background:var(--bg)}.faq summary{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 20px;cursor:pointer;font-weight:700;font-size:16.5px;list-style:none}.faq summary::-webkit-details-marker{display:none}.faq summary .ms{transition:.2s;color:var(--p)}.faq details[open] summary .ms{transform:rotate(180deg)}.faq details>div{padding:0 20px 8px;color:var(--mu)}
/* CTA, cuenta regresiva */
.cta h2{font-size:clamp(28px,4vw,44px)}.cta .lead{max-width:640px;margin:0 auto}
.timer{display:inline-grid;grid-template-columns:repeat(4,minmax(64px,1fr));gap:10px}.timer div{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);border-radius:var(--r);padding:14px 8px}.lt .timer div{background:var(--sf);border-color:color-mix(in srgb,var(--tx) 10%,transparent)}.timer b{display:block;font-family:var(--fh);font-size:clamp(28px,4vw,42px);line-height:1}.timer span{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;opacity:.8}.timer-end{font-weight:700}
/* Imagen, video, mapa, incrustaciones */
.single{width:100%;border-radius:var(--r)}.full-img{margin:0}.full-img .single{border-radius:0}figure{margin:0}figcaption{text-align:center;font-size:14px;color:var(--mu2);margin-top:10px}
.video{position:relative;aspect-ratio:16/9;border-radius:var(--r);overflow:hidden;box-shadow:var(--sh);background:#000;max-width:980px;margin:0 auto}.video iframe,.video video{position:absolute;inset:0;width:100%;height:100%;border:0}.video-ph{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:#cbd5e1;text-align:center;padding:20px}.video-ph .ms{font-size:52px;max-width:none}
.map-grid{align-items:stretch}.map-info p{display:flex;gap:10px;align-items:flex-start;color:var(--mu)}.map-info p .ms{color:var(--p)}.map{border-radius:var(--r);overflow:hidden;min-height:340px;box-shadow:var(--sh)}.map iframe{width:100%;height:100%;min-height:340px;border:0;display:block}
.embed-box{max-width:100%;overflow:auto}.embed-box iframe{max-width:100%}
.logos-title{text-align:center;font-weight:700;color:var(--mu2);margin-bottom:22px}.logos{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:28px 44px}.logo-item img{height:46px;width:auto;max-width:200px;object-fit:contain;filter:grayscale(1);opacity:.75;transition:.2s}.logo-item img:hover{filter:none;opacity:1}
.socials{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:18px}.socials.left{justify-content:flex-start}.soc{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-weight:700;border-radius:var(--br);transition:.15s}.soc:hover{transform:translateY(-2px)}
.soc-buttons{padding:11px 18px;border:2px solid color-mix(in srgb,currentColor 25%,transparent)}.soc-brand{padding:11px 18px;background:var(--brand);color:#fff}.soc-icons{width:44px;height:44px;justify-content:center;border-radius:99px;background:color-mix(in srgb,currentColor 12%,transparent)}.soc-icons:hover{background:var(--brand);color:#fff}
.divider{display:flex;align-items:center}.divider hr{width:100%;border:0;border-top:1px solid color-mix(in srgb,currentColor 15%,transparent)}
/* Pie */
.f-grid{display:grid;grid-template-columns:1.4fr 1fr 1fr;gap:40px;padding:26px 0}.f-grid p{opacity:.8;margin-top:14px;font-size:15px}.f-note{font-size:13.5px!important}.f-grid h4{font-size:15px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;opacity:.9}
.f-bottom{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;border-top:1px solid color-mix(in srgb,currentColor 14%,transparent);padding:20px 0 6px;font-size:13.5px;opacity:.85}.f-bottom a{text-decoration:underline}.credits{margin-left:auto;font-size:12.5px;opacity:.8}
/* WhatsApp flotante */
.wa-float{position:fixed;bottom:22px;z-index:60;display:flex;align-items:center;gap:10px;text-decoration:none}.wa-float.right{right:22px}.wa-float.left{left:22px;flex-direction:row-reverse}.wa-float .wa-ico{width:60px;height:60px;border-radius:99px;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px -6px rgba(37,211,102,.7);animation:wap 2.2s infinite}.wa-float .wa-ico .si{width:32px;height:32px}.wa-float .wa-lbl{background:#fff;color:#111;font-weight:700;font-size:14px;padding:9px 14px;border-radius:12px;box-shadow:0 8px 24px -10px rgba(0,0,0,.35)}
@keyframes wap{0%{box-shadow:0 0 0 0 rgba(37,211,102,.55)}70%{box-shadow:0 0 0 16px rgba(37,211,102,0)}100%{box-shadow:0 0 0 0 rgba(37,211,102,0)}}
/* Ventanas */
.lp-modal{position:fixed;inset:0;z-index:100;background:rgba(10,15,25,.6);display:flex;align-items:center;justify-content:center;padding:18px;animation:fd .2s}.lp-modal .box{background:#fff;color:#1f2937;border-radius:16px;max-width:640px;width:100%;max-height:86vh;overflow:auto;padding:26px;position:relative}.lp-modal .box h3{margin-right:40px}.lp-modal .x{position:absolute;top:14px;right:14px;border:0;background:#eef2f7;border-radius:99px;width:36px;height:36px;cursor:pointer;font-size:18px}.lp-modal img{max-height:78vh;width:auto;margin:0 auto;border-radius:12px}.lp-modal.img .box{background:transparent;padding:0;max-width:1100px;text-align:center}.lp-modal.img .cap{color:#fff;margin-top:10px}
@keyframes fd{from{opacity:0}}
.rv{transition:opacity .6s ease,transform .6s ease}.js-rv .rv:not(.in){opacity:0;transform:translateY(22px)}
.hide-m{} .is-hidden{opacity:.35}
@media (max-width:980px){.grid2,.hero-grid{grid-template-columns:minmax(0,1fr);gap:36px}.c3,.c4{grid-template-columns:repeat(2,minmax(0,1fr))}.f-grid{grid-template-columns:1fr 1fr}.about-grid.flip .about-img{order:0}
 .h-nav{position:absolute;top:100%;left:0;right:0;flex-direction:column;gap:0;background:var(--bg);color:var(--tx);box-shadow:0 14px 30px -14px rgba(0,0,0,.35);display:none;padding:8px 22px 16px}.h-nav a{padding:12px 0;border-bottom:1px solid color-mix(in srgb,var(--tx) 8%,transparent)}.blk-header.open .h-nav{display:flex}.h-burger{display:inline-flex}.h-phone span{display:none}}
@media (max-width:640px){body{font-size:16px}.pad-m{padding:56px 0}.pad-l{padding:68px 0}.pad-xl{padding:88px 0}.c2,.c3,.c4,.f-grid{grid-template-columns:minmax(0,1fr)}.ff-grid{grid-template-columns:1fr}.ff.half{grid-column:1/-1}.wrap{padding:0 18px}
 .ctas .btn{flex:1 1 100%}.h-actions .btn{display:none}.card{padding:20px}.lead{font-size:16.5px}.wa-float .wa-lbl{display:none}.wa-float{bottom:16px}.wa-float.right{right:16px}.about-badge{right:10px}.credits{margin-left:0}.timer{grid-template-columns:repeat(4,minmax(0,1fr))}.sec-head{margin-bottom:30px}}
@media (max-width:640px){.hide-m{display:none!important}}@media (min-width:641px){.hide-d{display:none!important}}
/* Editor visual */
.mode-edit .blk{cursor:pointer}.mode-edit .blk:hover{outline:2px dashed #22c55e;outline-offset:-2px}.mode-edit .blk.sel{outline:3px solid #16a34a;outline-offset:-3px}
.mode-edit .blk:hover:after,.mode-edit .blk.sel:after{content:attr(data-label);position:absolute;top:6px;left:6px;z-index:70;background:#16a34a;color:#fff;font:700 11.5px/1 system-ui,sans-serif;padding:5px 9px;border-radius:6px;pointer-events:none}
.mode-edit .embed-box{pointer-events:none}.lp-drop{position:absolute;left:0;right:0;height:6px;background:#16a34a;z-index:90;pointer-events:none;box-shadow:0 0 0 4px rgba(22,163,74,.25)}.lp-drop:before{content:'Soltar aquí';position:absolute;left:50%;top:-11px;transform:translateX(-50%);background:#16a34a;color:#fff;font:700 11px/1 system-ui,sans-serif;padding:6px 10px;border-radius:99px}.mode-edit .wa-float{pointer-events:none}`;
  };

  /* ---------- Datos que viajan dentro de la página ---------- */
  SV.publicProject = (p) => ({
    v: 1, id: p.id, name: p.name, templateId: p.templateId,
    owner: { name: p.owner.name, ficha: p.owner.ficha, programa: p.owner.programa, centro: p.owner.centro, regional: p.owner.regional },
    client: p.client, social: p.social, theme: p.theme,
    blocks: p.blocks.filter((b) => !b.hidden),
    form: { title: p.form.title, button: p.form.button, fields: p.form.fields, consent: p.form.consent, successTitle: p.form.successTitle, successText: p.form.successText, redirectWa: p.form.redirectWa, destinations: p.form.destinations },
    wa: p.wa, seo: p.seo, tracking: p.tracking,
    version: p.published ? p.published.version : 0, at: Date.now()
  });

  SV.runtimeData = (p, mode) => ({
    mode, pid: p.id, name: p.client.name,
    owner: { name: p.owner.name, ficha: p.owner.ficha },
    version: p.published ? p.published.version : (p.version || 0),
    form: { fields: (p.form.fields || []).map((f) => ({ key: f.key, label: f.label, type: f.type, required: !!f.required })), consent: p.form.consent, successTitle: p.form.successTitle, successText: p.form.successText, redirectWa: !!p.form.redirectWa },
    wa: { href: SV.waHref(p), number: U.digits(p.wa.number), link: p.wa.mode === 'link' ? p.wa.link : '' },
    dest: mode === 'export' ? p.form.destinations : null,
    page: { id: p.id, nombre: p.name, empresa: p.client.name, aprendiz: p.owner.name, ficha: p.owner.ficha }
  });

  /* ---------- Envío de leads a los destinos (usado por el sitio exportado y por ver.html) ---------- */
  function LP_DELIVER(dest, payload, done) {
    var jobs = [], out = [];
    var flat = payload.flat || {};
    var toForm = function (o) { var s = []; for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) s.push(encodeURIComponent(k) + '=' + encodeURIComponent(o[k] == null ? '' : o[k])); return s.join('&'); };
    var guard = function (name, pr) { jobs.push(pr.then(function (r) { out.push({ dest: name, ok: r !== false, msg: typeof r === 'string' ? r : '' }); }, function (e) { out.push({ dest: name, ok: false, msg: String(e && e.message || e) }); })); };
    dest = dest || {};
    if (dest.sheets && dest.sheets.enabled && /^https:\/\//.test(dest.sheets.url || '')) {
      var body = JSON.stringify({ accion: 'lead', pagina: payload.pagina, lead: payload.lead });
      guard('Google Sheets', fetch(dest.sheets.url, { method: 'POST', body: body }).then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error(j.error || 'La hoja rechazó el registro'); return 'guardado en la hoja'; })
        .catch(function (e) { if (/rechaz/.test(String(e.message))) throw e; return fetch(dest.sheets.url, { method: 'POST', mode: 'no-cors', body: body }).then(function () { return 'enviado (sin confirmación)'; }); }));
    }
    if (dest.webhook && dest.webhook.enabled && /^https:\/\//.test(dest.webhook.url || '')) {
      var isJson = dest.webhook.format === 'json';
      guard('Webhook', fetch(dest.webhook.url, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': isJson ? 'text/plain;charset=UTF-8' : 'application/x-www-form-urlencoded' }, body: isJson ? JSON.stringify({ evento: 'lead.creado', pagina: payload.pagina, lead: payload.lead, datos: flat }) : toForm(flat) }).then(function () { return 'enviado'; }));
    }
    if (dest.email && dest.email.enabled && /@/.test(dest.email.to || '')) {
      var mail = {}; for (var k in flat) mail[k] = flat[k];
      mail._subject = 'Nuevo interesado desde la landing ' + (payload.pagina && payload.pagina.empresa || ''); mail._template = 'table'; mail._captcha = 'false';
      guard('Correo', fetch('https://formsubmit.co/ajax/' + encodeURIComponent(dest.email.to), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(mail) }).then(function (r) { return r.json(); }).then(function (j) { if (String(j.success) === 'false') throw new Error(j.message || 'Correo no enviado'); return 'enviado'; }));
    }
    var fin = false; var end = function () { if (!fin) { fin = true; done && done(out); } };
    if (!jobs.length) { end(); return; }
    Promise.all(jobs).then(end, end);
    setTimeout(end, 9000);
  }
  SV.deliver = LP_DELIVER;

  /* ---------- Píxeles de pauta (Meta, TikTok, Google) ---------- */
  function LP_PIXEL(ev, extra) {
    var w = window;
    try {
      if (ev === 'lead') { if (w.fbq) w.fbq('track', 'Lead'); if (w.ttq) w.ttq.track('SubmitForm'); if (w.gtag) w.gtag('event', 'generate_lead', extra || {}); }
      else if (ev === 'whatsapp' || ev === 'call') { if (w.fbq) w.fbq('track', 'Contact'); if (w.ttq) w.ttq.track('Contact'); if (w.gtag) w.gtag('event', 'contact', { method: ev }); }
      else if (ev === 'form_start') { if (w.fbq) w.fbq('trackCustom', 'FormStart'); if (w.gtag) w.gtag('event', 'form_start'); }
      else if (ev === 'cta') { if (w.gtag) w.gtag('event', 'select_content', { content_type: 'cta' }); }
    } catch (e) { /* píxel no disponible */ }
  }
  SV.pixel = LP_PIXEL;

  SV.pixelHead = (tr) => {
    tr = tr || {};
    const meta = String(tr.metaPixel || '').replace(/\D/g, '');
    const tt = String(tr.tiktokPixel || '').replace(/[^A-Za-z0-9]/g, '');
    const ga = String(tr.ga4 || '').replace(/[^A-Za-z0-9-]/g, '');
    let h = '';
    if (meta) h += `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');<\/script>`;
    if (tt) h += `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tt}');ttq.page();}(window,document,'ttq');<\/script>`;
    if (ga) h += `<script async src="https://www.googletagmanager.com/gtag/js?id=${ga}"><\/script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');<\/script>`;
    return h;
  };

  /* ---------- Script que corre dentro de la landing ---------- */
  function LP_RUNTIME(D, DELIVER, PIXEL) {
    var doc = document, W = window;
    var inFrame = W.parent !== W;
    var q = function (s, r) { return (r || doc).querySelector(s); };
    var qa = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
    var send = function (msg) { if (!inFrame) return; msg.source = 'svl-landing'; msg.pid = D.pid; try { W.parent.postMessage(msg, '*'); } catch (e) { /* sin padre */ } };
    var store = {
      get: function (k, d) { try { var v = W.localStorage.getItem('svl-' + D.pid + '-' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
      set: function (k, v) { try { W.localStorage.setItem('svl-' + D.pid + '-' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
    };
    var params = (function () {
      var out = {}; var s = (D.search || W.location.search || '').replace(/^\?/, '');
      s.split('&').forEach(function (kv) { if (!kv) return; var i = kv.indexOf('='); var k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i)); var v = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); if (/^(utm_[a-z]+|fbclid|gclid|ttclid|ref)$/.test(k)) out[k] = v; });
      return out;
    })();
    var device = function () { var w = W.innerWidth; return w < 700 ? 'Celular' : w < 1100 ? 'Tableta' : 'Computador'; };
    var once = {};
    var track = function (ev, detail) {
      if (D.mode === 'edit') return;
      if (ev === 'form_start' || ev === 'view') { if (once[ev]) return; once[ev] = 1; }
      send({ type: 'track', event: ev, detail: detail || '' });
      if (D.mode === 'export') { if (PIXEL) PIXEL(ev); var st = store.get('stats', {}); st[ev] = (st[ev] || 0) + 1; store.set('stats', st); }
    };

    /* Interés seleccionado desde una tarjeta, plan o servicio */
    var interest = '';
    var applyInterest = function () {
      if (!interest) return;
      qa('form[data-form]').forEach(function (f) {
        if (f.interes) f.interes.value = interest;
        var sel = f.querySelector('select[name="servicio"]');
        if (sel) { var low = interest.toLowerCase(); for (var i = 0; i < sel.options.length; i++) { var o = sel.options[i].text.toLowerCase(); if (o && (o.indexOf(low) >= 0 || low.indexOf(o) >= 0)) { sel.selectedIndex = i; break; } } }
      });
    };

    var scrollToEl = function (el) { if (!el) return; var hdr = q('.blk-header.sticky'); var off = hdr ? hdr.offsetHeight + 12 : 12; var top = el.getBoundingClientRect().top + W.pageYOffset - off; W.scrollTo({ top: top, behavior: 'smooth' }); };
    var nearestForm = function (from) {
      var forms = qa('form[data-form]'); if (!forms.length) return null;
      var y = from ? from.getBoundingClientRect().top : 0; var best = forms[0]; var bd = 1e9;
      forms.forEach(function (f) { var d = Math.abs(f.getBoundingClientRect().top - y); if (d < bd) { bd = d; best = f; } });
      return best;
    };

    var modal = function (html, cls) {
      var m = doc.createElement('div'); m.className = 'lp-modal ' + (cls || '');
      m.innerHTML = '<div class="box" role="dialog" aria-modal="true"><button class="x" type="button" aria-label="Cerrar">✕</button>' + html + '</div>';
      m.addEventListener('click', function (e) { if (e.target === m || e.target.classList.contains('x')) m.remove(); });
      doc.body.appendChild(m);
    };
    var escH = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

    doc.addEventListener('click', function (e) {
      var t = e.target;
      if (D.mode === 'edit') {
        var blk = t.closest ? t.closest('.blk') : null;
        e.preventDefault(); e.stopPropagation();
        if (blk) send({ type: 'select', id: blk.getAttribute('data-bid') });
        return;
      }
      var a = t.closest ? t.closest('a,button,[data-lightbox]') : null;
      if (!a) return;
      if (a.hasAttribute('data-interest')) { interest = a.getAttribute('data-interest'); applyInterest(); }
      if (a.getAttribute('data-act') === 'menu') { var h = a.closest('.blk-header'); if (h) h.classList.toggle('open'); return; }
      if (a.getAttribute('data-act') === 'policy') { e.preventDefault(); modal('<h3>Política de tratamiento de datos</h3><p>' + escH((D.form.consent || {}).policy || '').replace(/\n/g, '<br>') + '</p>'); return; }
      if (a.hasAttribute('data-lightbox')) { modal('<img src="' + escH(a.getAttribute('data-lightbox')) + '" alt=""><p class="cap">' + escH(a.getAttribute('data-caption') || '') + '</p>', 'img'); return; }
      if (a.hasAttribute('data-filter')) {
        var tag = a.getAttribute('data-filter'); var wrap = a.closest('.blk');
        qa('[data-filter]', wrap).forEach(function (c) { c.classList.toggle('on', c === a); });
        qa('.pcard', wrap).forEach(function (c) { c.classList.toggle('off', !!tag && c.getAttribute('data-tag') !== tag); });
        return;
      }
      var tr = a.getAttribute('data-track');
      var href = a.getAttribute('href') || '';
      if (/wa\.me|whatsapp\.com|wa\.link/.test(href)) tr = 'whatsapp';
      if (tr) track(tr, (a.textContent || '').trim().slice(0, 60));
      if (a.getAttribute('data-go') === 'form') {
        e.preventDefault(); var f = nearestForm(a); scrollToEl(f);
        var hh = a.closest('.blk-header'); if (hh) hh.classList.remove('open');
        if (f) setTimeout(function () { var i = f.querySelector('input:not([type=hidden]),select,textarea'); if (i) try { i.focus({ preventScroll: true }); } catch (x) { i.focus(); } }, 650);
        return;
      }
      if (href.charAt(0) === '#' && href.length > 1) {
        var target = doc.getElementById(href.slice(1)); if (target) { e.preventDefault(); scrollToEl(target); }
        var h2 = a.closest('.blk-header'); if (h2) h2.classList.remove('open');
      } else if (href === '#top') { e.preventDefault(); W.scrollTo({ top: 0, behavior: 'smooth' }); }
    }, true);

    doc.addEventListener('focusin', function (e) { if (e.target.closest && e.target.closest('form[data-form]')) track('form_start'); });

    var validTel = function (v) { var d = String(v).replace(/\D/g, ''); return d.length >= 7 && d.length <= 15; };
    var validMail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); };

    doc.addEventListener('submit', function (e) {
      var form = e.target; if (!form.hasAttribute || !form.hasAttribute('data-form')) return;
      e.preventDefault();
      if (D.mode === 'edit') return;
      var msg = form.querySelector('.ff-msg'); var bad = [];
      qa('.bad', form).forEach(function (x) { x.classList.remove('bad'); });
      var data = {};
      (D.form.fields || []).forEach(function (fd) {
        var key = fd.key; var val = '';
        if (fd.type === 'checkbox') { val = qa('input[name="' + key + '"]:checked', form).map(function (i) { return i.value; }).join(', '); }
        else if (fd.type === 'radio') { var r = form.querySelector('input[name="' + key + '"]:checked'); val = r ? r.value : ''; }
        else { var el = form.elements[key]; val = el ? String(el.value || '').trim() : ''; }
        data[key] = val;
        var fail = (fd.required && !val) || (val && fd.type === 'tel' && !validTel(val)) || (val && fd.type === 'email' && !validMail(val));
        if (fail) {
          bad.push(fd.label);
          var node = form.querySelector('[name="' + key + '"]'); if (node) { var fs = node.closest('.choice'); (fs || node).classList.add('bad'); }
        }
      });
      var consent = form.querySelector('input[name="_consent"]');
      if (consent && !consent.checked) { bad.push('autorización de datos'); consent.closest('.consent').classList.add('bad'); }
      if (bad.length) { msg.textContent = 'Revisa: ' + bad.join(', ') + '.'; var first = form.querySelector('.bad input, .bad, .bad select'); if (first && first.focus) try { first.focus(); } catch (x) { /* sin foco */ } return; }
      msg.textContent = '';
      if (form.elements._web && form.elements._web.value) { showOk(form, data); return; }
      var lead = { id: 'ld_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: Date.now(), data: data, interes: (form.interes && form.interes.value) || '', utm: params, device: device(), url: D.mode === 'export' ? W.location.href.split('#')[0] : (D.pageUrl || ''), version: D.version, consent: consent ? 'si' : 'no aplica' };
      var labels = {}; (D.form.fields || []).forEach(function (fd) { labels[fd.key] = fd.label; });
      var flat = { Fecha: new Date(lead.at).toLocaleString('es-CO'), Landing: D.name };
      Object.keys(data).forEach(function (k) { flat[labels[k] || k] = data[k]; });
      if (lead.interes) flat['Interés seleccionado'] = lead.interes;
      Object.keys(params).forEach(function (k) { flat[k] = params[k]; });
      flat.Dispositivo = lead.device;
      var payload = { pagina: D.page, lead: lead, flat: flat };
      var btn = form.querySelector('button[type=submit]'); var old = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span>Enviando...</span>';
      var finish = function (res) { btn.disabled = false; btn.innerHTML = old; track('lead', data.servicio || ''); showOk(form, data, res); };
      if (D.mode === 'export') {
        var saved = store.get('leads', []); saved.push(lead); store.set('leads', saved.slice(-50));
        if (DELIVER) DELIVER(D.dest, payload, finish); else finish([]);
      } else if (D.mode === 'view') {
        var done = false; var id = lead.id;
        var onAck = function (ev) { var m = ev.data || {}; if (m.source === 'svl-viewer' && m.type === 'lead-ack' && m.id === id && !done) { done = true; W.removeEventListener('message', onAck); finish(m.results || []); } };
        W.addEventListener('message', onAck);
        send({ type: 'lead', payload: payload });
        setTimeout(function () { if (!done) { done = true; finish([]); } }, 10000);
      } else { send({ type: 'lead', payload: payload }); setTimeout(function () { finish([{ dest: 'Base de datos del simulador', ok: true }]); }, 350); }
    }, true);

    var waFor = function (data) {
      if (!D.wa.href) return '';
      var txt = 'Hola, soy ' + (data.nombre || '') + '. Acabo de dejar mis datos en su página' + (data.servicio ? ' y me interesa: ' + data.servicio : '') + '.';
      if (D.wa.number && !D.wa.link) return 'https://wa.me/' + D.wa.number + '?text=' + encodeURIComponent(txt);
      return D.wa.href;
    };
    var showOk = function (form, data, res) {
      var wa = waFor(data);
      var fails = (res || []).filter(function (r) { return !r.ok; });
      form.innerHTML = '<div class="lp-ok"><div class="ok-ico"><span class="ms">check_circle</span></div><h3>' + escH(D.form.successTitle || '¡Gracias!') + '</h3><p>' + escH(D.form.successText || 'Te contactaremos pronto.') + '</p>' +
        (wa ? '<a class="btn btn-wa btn-block" href="' + escH(wa) + '" target="_blank" rel="noopener" data-track="whatsapp">Continuar por WhatsApp</a>' : '') +
        (D.mode === 'preview' ? '<p style="font-size:13px;margin-top:14px">Modo simulador: el lead quedó en la Base de datos del proyecto.</p>' : '') +
        (fails.length && D.mode !== 'preview' ? '<p style="font-size:12.5px;margin-top:12px;opacity:.7">Aviso técnico: ' + escH(fails.map(function (f) { return f.dest + ' (' + f.msg + ')'; }).join(', ')) + '</p>' : '') + '</div>';
      if (D.form.redirectWa && wa && D.mode !== 'preview' && D.mode !== 'edit') setTimeout(function () { try { W.open(wa, '_blank'); } catch (e) { /* bloqueado */ } }, 1200);
    };

    /* Cuenta regresiva */
    var timers = [];
    var startTimers = function () {
      timers.forEach(clearInterval); timers = [];
      qa('[data-until]').forEach(function (el) {
        var until = Date.parse(el.getAttribute('data-until'));
        if (!until) { var k = 'cd-' + el.getAttribute('data-cd'); until = store.get(k, 0); if (!until || until < Date.now()) { until = Date.now() + 7 * 864e5; store.set(k, until); } }
        var cells = qa('b', el);
        var tick = function () {
          var d = Math.max(0, until - Date.now());
          if (d <= 0 && el.getAttribute('data-expired')) { el.innerHTML = '<p class="timer-end">' + escH(el.getAttribute('data-expired')) + '</p>'; return; }
          var v = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60, Math.floor(d / 1e3) % 60];
          cells.forEach(function (c, i) { c.textContent = (v[i] < 10 ? '0' : '') + v[i]; });
        };
        tick(); timers.push(setInterval(tick, 1000));
      });
    };

    /* Aparición suave de secciones */
    var reveal = function () {
      if (D.mode === 'edit' || !('IntersectionObserver' in W)) return;
      doc.documentElement.classList.add('js-rv');
      var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
      qa('.rv').forEach(function (el) { io.observe(el); });
      setTimeout(function () { qa('.rv').forEach(function (el) { el.classList.add('in'); }); }, 2500);
    };

    var runEmbeds = function () {
      qa('.embed-box script').forEach(function (old) {
        var s = doc.createElement('script');
        for (var i = 0; i < old.attributes.length; i++) s.setAttribute(old.attributes[i].name, old.attributes[i].value);
        s.text = old.text; old.parentNode.replaceChild(s, old);
      });
    };

    doc.addEventListener('error', function (e) {
      var t = e.target;
      if (t && t.tagName === 'IMG' && !t.__ph) { t.__ph = 1; var n = (t.getAttribute('data-ph') || '?').charAt(0).toUpperCase(); t.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="55%" font-family="Arial" font-size="110" font-weight="700" fill="#64748b" text-anchor="middle" dominant-baseline="middle">' + n + '</text></svg>'); }
    }, true);

    var iconsReady = function () {
      var root = doc.documentElement; var n = 0;
      if (!doc.fonts || !doc.fonts.load) { root.classList.add('icons-ok'); return; }
      var tryLoad = function () {
        doc.fonts.load('20px "Material Symbols Outlined"', 'home').then(function (l) { if (l && l.length) root.classList.add('icons-ok'); else if (++n < 30) setTimeout(tryLoad, 400); }, function () { if (++n < 30) setTimeout(tryLoad, 400); });
      };
      tryLoad();
    };
    var init = function () { startTimers(); reveal(); applyInterest(); };
    iconsReady();

    if (D.mode === 'edit') {
      var line = null, before = null;
      var clearLine = function () { if (line) { line.remove(); line = null; } };
      doc.addEventListener('dragover', function (e) {
        e.preventDefault();
        var blocks = qa('.blk'); before = null;
        for (var i = 0; i < blocks.length; i++) { var r = blocks[i].getBoundingClientRect(); if (e.clientY < r.top + r.height / 2) { before = blocks[i]; break; } }
        if (!line) { line = doc.createElement('div'); line.className = 'lp-drop'; doc.body.appendChild(line); }
        var ref = before || blocks[blocks.length - 1];
        var y = ref ? (before ? ref.getBoundingClientRect().top : ref.getBoundingClientRect().bottom) + W.pageYOffset : 0;
        line.style.top = Math.max(0, y - 3) + 'px';
      });
      doc.addEventListener('dragenter', function (e) { e.preventDefault(); });
      doc.addEventListener('dragleave', function (e) { if (!e.relatedTarget) clearLine(); });
      doc.addEventListener('drop', function (e) {
        e.preventDefault(); clearLine();
        var data = ''; try { data = e.dataTransfer.getData('text/plain'); } catch (x) { /* sin datos */ }
        send({ type: 'drop', data: data, before: before ? before.getAttribute('data-bid') : null });
      });
      W.addEventListener('message', function (ev) {
        var m = ev.data || {}; if (m.source !== 'svl-app') return;
        if (m.type === 'patch') {
          if (m.css != null) q('#lp-style').textContent = m.css;
          if (m.fonts) { var l1 = q('#lp-fonts'); if (l1 && l1.getAttribute('href') !== m.fonts) l1.setAttribute('href', m.fonts); }
          if (m.html != null) { var y = W.pageYOffset; q('#lp-root').innerHTML = m.html; W.scrollTo(0, y); }
          if (m.data) { D = m.data; }
          init();
          if (m.sel) mark(m.sel, false);
        } else if (m.type === 'select') mark(m.id, true);
      });
    }
    var mark = function (id, scroll) {
      qa('.blk.sel').forEach(function (x) { x.classList.remove('sel'); });
      var el = id ? q('[data-bid="' + id + '"]') : null;
      if (el) { el.classList.add('sel'); if (scroll) { var r = el.getBoundingClientRect(); if (r.top < 0 || r.top > W.innerHeight * 0.6) scrollToEl(el); } }
    };

    runEmbeds();
    init();
    track('view');
    send({ type: 'ready' });
    W.landingAPI = { datos: function () { return D; }, leads: function () { return store.get('leads', []); }, estadisticas: function () { return store.get('stats', {}); } };
  }

  /* ---------- Documento completo ---------- */
  const iconsUsed = (html) => {
    const set = new Set(['check_circle', 'send', 'menu', 'expand_more', 'call', 'mail', 'location_on', 'schedule', 'arrow_forward', 'verified', 'directions', 'check']);
    html.replace(/class="ms[^"]*"[^>]*>([a-z0-9_]+)</g, (m, n) => { set.add(n); return m; });
    return Array.from(set);
  };

  const favicon = (p) => {
    const c = p.theme.primary;
    const l = U.esc((p.client.name || 'L').trim().charAt(0).toUpperCase());
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${c}"/><text x="32" y="44" font-family="Arial" font-size="34" font-weight="700" fill="${U.onColor(c)}" text-anchor="middle">${l}</text></svg>`);
  };

  SV.bodyHTML = (p, mode) => {
    formSeq = 0;
    const ctx = { mode };
    let html = p.blocks.map((b) => renderBlock(b, p, ctx)).join('\n');
    const wa = p.wa || {};
    const waLink = SV.waHref(p);
    if (wa.enabled && waLink) html += `<a class="wa-float ${wa.position === 'left' ? 'left' : 'right'}" href="${esc(waLink)}" target="_blank" rel="noopener" data-track="whatsapp" aria-label="WhatsApp">${wa.label ? `<span class="wa-lbl">${esc(wa.label)}</span>` : ''}<span class="wa-ico">${socialSvg('whatsapp')}</span></a>`;
    return html;
  };

  const jsonScript = (o) => JSON.stringify(o).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

  /* opts: { mode: 'edit'|'preview'|'view'|'export', search, pageUrl } */
  SV.renderLanding = (p, opts = {}) => {
    const mode = opts.mode || 'preview';
    const body = SV.bodyHTML(p, mode);
    const css = SV.landingCSS(p);
    const subset = mode === 'export' || mode === 'view';
    const fonts = SV.fontsHref(p, subset ? iconsUsed(body) : null);
    const D = Object.assign(SV.runtimeData(p, mode), { search: opts.search || '', pageUrl: opts.pageUrl || '' });
    const seo = p.seo || {};
    const c = p.client;
    const og = /^https?:/.test(seo.ogImage || '') ? `<meta property="og:image" content="${esc(seo.ogImage)}">` : '';
    const ld = mode === 'export' || mode === 'view' ? `<script type="application/ld+json">${jsonScript({ '@context': 'https://schema.org', '@type': 'LocalBusiness', name: c.name, description: seo.description || c.slogan, telephone: c.phone, email: c.email, address: { '@type': 'PostalAddress', streetAddress: c.address, addressLocality: c.city, addressCountry: 'CO' }, openingHours: c.schedule })}</script>` : '';
    const runtime = `<script>(${LP_RUNTIME.toString()})(${jsonScript(D)}, ${mode === 'export' ? LP_DELIVER.toString() : 'null'}, ${mode === 'export' ? LP_PIXEL.toString() : 'null'});</script>`;
    return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(seo.title || c.name)}</title>
<meta name="description" content="${esc(seo.description || c.slogan || '')}">${seo.keywords ? `<meta name="keywords" content="${esc(seo.keywords)}">` : ''}
<meta property="og:type" content="website"><meta property="og:title" content="${esc(seo.title || c.name)}"><meta property="og:description" content="${esc(seo.description || c.slogan || '')}">${og}
<meta name="theme-color" content="${esc(p.theme.primary)}"><meta name="generator" content="SENA VENTAS LANDING PAGE">
<link rel="icon" href="${favicon(p)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link id="lp-fonts" rel="stylesheet" href="${esc(fonts.text)}"><link id="lp-icons" rel="stylesheet" href="${esc(fonts.icons)}">
<style id="lp-style">${css}</style>${mode === 'export' ? SV.pixelHead(p.tracking) : ''}${ld}
</head><body class="mode-${mode}"><div id="lp-root">${body}</div>${runtime}</body></html>`;
  };

  /* Partes para actualizar el editor sin recargar el iframe */
  SV.landingParts = (p, mode = 'edit') => ({ css: SV.landingCSS(p), html: SV.bodyHTML(p, mode), fonts: SV.fontsHref(p).text, data: SV.runtimeData(p, mode) });
})(window.SV);
