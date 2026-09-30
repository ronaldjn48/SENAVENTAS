/* ==========================================================================
   SENA VENTAS LANDING PAGE · Ilustraciones SVG propias
   Se guardan en el proyecto como "art:nombre" y se pintan con el color de
   la marca. Funcionan sin conexión y no pesan dentro del enlace publicado.
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  const mix = (hex, amt) => {
    let h = String(hex || '#1f7a4d').replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    const t = amt < 0 ? 0 : 255; const p = Math.abs(amt);
    r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const wrap = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`;
  const sky = (c, id) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(c, 0.82)}"/><stop offset="1" stop-color="${mix(c, 0.95)}"/></linearGradient></defs><rect width="800" height="600" fill="url(#${id})"/>`;
  const tree = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="0" width="12" height="46" rx="4" fill="#7a5a3a"/><circle cx="0" cy="-10" r="34" fill="${mix(c, -0.1)}"/><circle cx="-20" cy="6" r="22" fill="${mix(c, 0.1)}"/><circle cx="20" cy="4" r="24" fill="${c}"/></g>`;
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#ffffff" opacity=".9"><ellipse cx="0" cy="0" rx="46" ry="22"/><ellipse cx="34" cy="-10" rx="32" ry="24"/><ellipse cx="-34" cy="4" rx="28" ry="16"/></g>`;

  const ART = {
    casa: (c) => wrap(800, 600, sky(c, 'g1') + `<circle cx="650" cy="110" r="46" fill="#ffd66b"/>${cloud(170, 110, 1)}${cloud(470, 70, .7)}
      <rect y="470" width="800" height="130" fill="${mix(c, 0.55)}"/><rect y="470" width="800" height="14" fill="${mix(c, 0.35)}"/>
      <polygon points="190,250 400,120 610,250" fill="${mix(c, -0.35)}"/><rect x="220" y="250" width="360" height="230" fill="#fbfaf7"/>
      <rect x="220" y="250" width="360" height="16" fill="${mix(c, -0.1)}" opacity=".35"/>
      <rect x="360" y="340" width="80" height="140" rx="6" fill="${c}"/><circle cx="425" cy="412" r="5" fill="#ffd66b"/>
      <rect x="250" y="300" width="80" height="70" rx="6" fill="${mix(c, 0.7)}" stroke="${mix(c, -0.3)}" stroke-width="6"/><line x1="290" y1="300" x2="290" y2="370" stroke="${mix(c, -0.3)}" stroke-width="5"/>
      <rect x="470" y="300" width="80" height="70" rx="6" fill="${mix(c, 0.7)}" stroke="${mix(c, -0.3)}" stroke-width="6"/><line x1="510" y1="300" x2="510" y2="370" stroke="${mix(c, -0.3)}" stroke-width="5"/>
      <rect x="520" y="150" width="34" height="70" fill="${mix(c, -0.45)}"/>
      <path d="M340 480 L460 480 L500 600 L300 600Z" fill="#e9e2d4"/>${tree(120, 420, 1.2, mix(c, 0.05))}${tree(690, 430, 1, c)}`),

    apartamento: (c) => wrap(800, 600, sky(c, 'g2') + `${cloud(620, 90, .9)}${cloud(150, 150, .6)}
      <rect x="120" y="200" width="170" height="330" fill="${mix(c, 0.35)}"/><rect x="300" y="90" width="220" height="440" fill="${mix(c, -0.2)}"/><rect x="530" y="240" width="160" height="290" fill="${mix(c, 0.15)}"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((r) => [0, 1, 2].map((k) => `<rect x="${322 + k * 66}" y="${115 + r * 50}" width="46" height="32" rx="4" fill="${(r + k) % 3 ? '#e8f4ff' : '#ffe9a8'}" opacity=".95"/>`).join('')).join('')}
      ${[0, 1, 2, 3, 4, 5].map((r) => [0, 1].map((k) => `<rect x="${140 + k * 72}" y="${225 + r * 48}" width="50" height="28" rx="4" fill="#ffffff" opacity=".8"/>`).join('')).join('')}
      ${[0, 1, 2, 3, 4].map((r) => [0, 1].map((k) => `<rect x="${550 + k * 66}" y="${265 + r * 50}" width="48" height="30" rx="4" fill="#ffffff" opacity=".85"/>`).join('')).join('')}
      <rect y="520" width="800" height="80" fill="${mix(c, 0.6)}"/>${tree(80, 480, .9, c)}${tree(740, 485, .8, mix(c, 0.1))}`),

    interior: (c) => wrap(800, 600, `<rect width="800" height="600" fill="#f6f1ea"/><rect y="440" width="800" height="160" fill="#e3d6c3"/>
      <rect x="470" y="70" width="240" height="250" rx="8" fill="${mix(c, 0.78)}" stroke="#ffffff" stroke-width="14"/><line x1="590" y1="70" x2="590" y2="320" stroke="#ffffff" stroke-width="10"/><line x1="470" y1="195" x2="710" y2="195" stroke="#ffffff" stroke-width="10"/>
      <rect x="120" y="120" width="170" height="120" rx="6" fill="${mix(c, 0.4)}"/><rect x="132" y="132" width="146" height="96" rx="4" fill="${mix(c, 0.65)}"/><circle cx="175" cy="170" r="16" fill="#ffd66b"/><path d="M140 222 L190 180 L230 210 L260 190 L276 222Z" fill="${c}"/>
      <rect x="90" y="330" width="420" height="120" rx="30" fill="${c}"/><rect x="110" y="290" width="380" height="90" rx="28" fill="${mix(c, 0.18)}"/><rect x="70" y="340" width="60" height="110" rx="24" fill="${mix(c, -0.15)}"/><rect x="470" y="340" width="60" height="110" rx="24" fill="${mix(c, -0.15)}"/>
      <rect x="120" y="450" width="14" height="40" fill="#6b4f36"/><rect x="466" y="450" width="14" height="40" fill="#6b4f36"/>
      <rect x="570" y="400" width="150" height="16" rx="6" fill="#8a6a48"/><rect x="585" y="416" width="10" height="70" fill="#8a6a48"/><rect x="695" y="416" width="10" height="70" fill="#8a6a48"/>
      <rect x="610" y="350" width="40" height="50" rx="6" fill="#ffffff"/><path d="M630 350 C600 300 590 270 612 250 C625 290 632 300 630 350Z" fill="#3f8f5a"/><path d="M630 350 C660 300 676 280 660 250 C640 290 632 310 630 350Z" fill="#4fa56b"/>
      <line x1="740" y1="120" x2="740" y2="440" stroke="#b9a58c" stroke-width="6"/><path d="M705 120 L775 120 L760 70 L720 70Z" fill="#ffd66b"/>`),

    llaves: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, 0.88)}"/><circle cx="400" cy="300" r="220" fill="${mix(c, 0.7)}"/>
      <path d="M400 110 C320 110 260 170 260 250 C260 350 400 480 400 480 C400 480 540 350 540 250 C540 170 480 110 400 110Z" fill="${c}"/><circle cx="400" cy="245" r="78" fill="#ffffff"/>
      <polygon points="345,250 400,205 455,250" fill="${mix(c, -0.3)}"/><rect x="360" y="250" width="80" height="55" fill="${mix(c, -0.1)}"/><rect x="390" y="270" width="20" height="35" fill="#ffffff"/>
      <g transform="translate(560 380) rotate(-30)"><circle cx="0" cy="0" r="38" fill="none" stroke="#e0a82e" stroke-width="16"/><rect x="34" y="-8" width="120" height="16" rx="6" fill="#e0a82e"/><rect x="120" y="8" width="12" height="22" fill="#e0a82e"/><rect x="140" y="8" width="12" height="16" fill="#e0a82e"/></g>
      <ellipse cx="400" cy="520" rx="170" ry="16" fill="${mix(c, 0.55)}"/>`),

    odontologia: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, 0.9)}"/><circle cx="400" cy="290" r="230" fill="${mix(c, 0.72)}"/>
      <path d="M300 170 C340 140 370 160 400 170 C430 160 460 140 500 170 C545 205 530 280 510 330 C495 370 490 450 470 470 C450 490 438 440 430 400 C423 370 412 350 400 350 C388 350 377 370 370 400 C362 440 350 490 330 470 C310 450 305 370 290 330 C270 280 255 205 300 170Z" fill="#ffffff" stroke="${mix(c, 0.35)}" stroke-width="6"/>
      <path d="M330 200 C345 185 365 190 378 198" stroke="${mix(c, 0.5)}" stroke-width="10" stroke-linecap="round" fill="none"/>
      <g fill="#ffd66b"><path d="M560 150 l10 26 26 10 -26 10 -10 26 -10 -26 -26 -10 26 -10Z"/><path d="M240 360 l7 18 18 7 -18 7 -7 18 -7 -18 -18 -7 18 -7Z"/><path d="M590 380 l6 14 14 6 -14 6 -6 14 -6 -14 -14 -6 14 -6Z"/></g>
      <g transform="translate(560 430) rotate(-35)"><rect x="-10" y="-120" width="20" height="170" rx="10" fill="${c}"/><rect x="-14" y="-150" width="28" height="40" rx="6" fill="#ffffff" stroke="${c}" stroke-width="4"/><g stroke="${mix(c, 0.4)}" stroke-width="4">${[0, 1, 2, 3, 4].map((i) => `<line x1="-10" y1="${-146 + i * 8}" x2="10" y2="${-146 + i * 8}"/>`).join('')}</g></g>`),

    medico: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, 0.9)}"/><rect x="150" y="90" width="330" height="430" rx="26" fill="#ffffff" stroke="${mix(c, 0.55)}" stroke-width="6"/><rect x="255" y="70" width="120" height="50" rx="14" fill="${c}"/>
      <rect x="290" y="165" width="50" height="130" rx="8" fill="${mix(c, 0.2)}"/><rect x="250" y="205" width="130" height="50" rx="8" fill="${mix(c, 0.2)}"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="200" y="${335 + i * 38}" width="${230 - i * 30}" height="14" rx="7" fill="${mix(c, 0.75)}"/>`).join('')}
      <path d="M560 130 L560 300 C560 380 660 380 660 300 L660 130" fill="none" stroke="${mix(c, -0.35)}" stroke-width="16" stroke-linecap="round"/><circle cx="560" cy="126" r="12" fill="${mix(c, -0.35)}"/><circle cx="660" cy="126" r="12" fill="${mix(c, -0.35)}"/>
      <path d="M610 360 L610 440 C610 500 540 520 520 470" fill="none" stroke="${mix(c, -0.35)}" stroke-width="16" stroke-linecap="round"/><circle cx="512" cy="455" r="42" fill="${c}"/><circle cx="512" cy="455" r="22" fill="${mix(c, 0.6)}"/>`),

    consultorio: (c) => wrap(800, 600, sky(c, 'g3') + `${cloud(160, 120, .8)}${cloud(640, 90, .7)}<rect x="170" y="200" width="460" height="320" fill="#ffffff"/><rect x="170" y="180" width="460" height="36" fill="${mix(c, -0.2)}"/>
      <rect x="350" y="120" width="100" height="100" rx="14" fill="#ffffff" stroke="${c}" stroke-width="8"/><rect x="390" y="138" width="20" height="64" rx="4" fill="${c}"/><rect x="368" y="160" width="64" height="20" rx="4" fill="${c}"/>
      ${[0, 1, 2].map((r) => [0, 1, 2, 3].map((k) => (r === 2 && (k === 1 || k === 2)) ? '' : `<rect x="${205 + k * 105}" y="${240 + r * 85}" width="75" height="55" rx="6" fill="${mix(c, 0.72)}"/>`).join('')).join('')}
      <rect x="330" y="410" width="140" height="110" rx="6" fill="${mix(c, 0.35)}"/><line x1="400" y1="410" x2="400" y2="520" stroke="#ffffff" stroke-width="6"/>
      <rect y="515" width="800" height="85" fill="${mix(c, 0.55)}"/>${tree(100, 470, 1, c)}${tree(710, 475, .9, mix(c, 0.1))}`),

    sonrisa: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, 0.86)}"/><circle cx="400" cy="300" r="200" fill="#ffd9b8"/><circle cx="330" cy="250" r="18" fill="#3a2a22"/><circle cx="470" cy="250" r="18" fill="#3a2a22"/>
      <path d="M290 330 Q400 450 510 330 Z" fill="#b8323f"/><path d="M300 334 Q400 380 500 334 L495 350 Q400 390 305 350Z" fill="#ffffff"/>
      <circle cx="285" cy="310" r="24" fill="#ffb3a7" opacity=".7"/><circle cx="515" cy="310" r="24" fill="#ffb3a7" opacity=".7"/>
      <g fill="${c}"><path d="M620 140 l12 30 30 12 -30 12 -12 30 -12 -30 -30 -12 30 -12Z"/><path d="M170 420 l8 20 20 8 -20 8 -8 20 -8 -20 -20 -8 20 -8Z"/></g>`),

    obra: (c) => wrap(800, 600, sky(c, 'g4') + `<circle cx="120" cy="110" r="40" fill="#ffd66b"/>
      <rect x="560" y="90" width="18" height="430" fill="#f2b705"/><rect x="330" y="90" width="330" height="16" fill="#f2b705"/><line x1="569" y1="60" x2="400" y2="98" stroke="#555" stroke-width="4"/><line x1="569" y1="60" x2="650" y2="98" stroke="#555" stroke-width="4"/><rect x="560" y="50" width="18" height="44" fill="#f2b705"/>
      <line x1="380" y1="106" x2="380" y2="210" stroke="#555" stroke-width="4"/><rect x="350" y="210" width="60" height="30" fill="${c}"/>
      <g stroke="${mix(c, -0.4)}" stroke-width="10" fill="none"><rect x="170" y="260" width="330" height="260"/><line x1="170" y1="347" x2="500" y2="347"/><line x1="170" y1="433" x2="500" y2="433"/><line x1="280" y1="260" x2="280" y2="520"/><line x1="390" y1="260" x2="390" y2="520"/></g>
      <rect x="180" y="440" width="90" height="80" fill="${mix(c, 0.5)}"/><rect x="290" y="440" width="90" height="80" fill="${mix(c, 0.6)}"/><rect x="180" y="355" width="90" height="75" fill="${mix(c, 0.6)}"/>
      <rect y="520" width="800" height="80" fill="#c9b79c"/><path d="M620 520 L700 440 L780 520Z" fill="#a8916f"/>
      <g transform="translate(660 470)"><path d="M-40 0 A40 40 0 0 1 40 0Z" fill="#f2b705"/><rect x="-48" y="-4" width="96" height="10" rx="4" fill="#e0a800"/></g>`),

    remodelacion: (c) => wrap(800, 600, `<rect width="800" height="600" fill="#f4efe8"/><rect x="0" y="0" width="420" height="600" fill="${mix(c, 0.78)}"/><rect y="470" width="800" height="130" fill="#d9ccb8"/>
      <rect x="80" y="110" width="260" height="110" rx="8" fill="#ffffff"/><line x1="210" y1="110" x2="210" y2="220" stroke="${mix(c, 0.6)}" stroke-width="4"/>
      <rect x="60" y="300" width="340" height="170" rx="8" fill="${c}"/><rect x="60" y="290" width="340" height="18" rx="4" fill="#e7e1d8"/><line x1="173" y1="310" x2="173" y2="470" stroke="${mix(c, -0.25)}" stroke-width="4"/><line x1="286" y1="310" x2="286" y2="470" stroke="${mix(c, -0.25)}" stroke-width="4"/>
      <rect x="140" y="370" width="20" height="6" rx="3" fill="#ffffff"/><rect x="253" y="370" width="20" height="6" rx="3" fill="#ffffff"/><rect x="366" y="370" width="20" height="6" rx="3" fill="#ffffff"/>
      <g transform="translate(560 170) rotate(20)"><rect x="-80" y="-40" width="160" height="70" rx="16" fill="${mix(c, -0.15)}"/><rect x="-70" y="-30" width="140" height="50" rx="12" fill="${mix(c, 0.1)}"/><rect x="-6" y="30" width="12" height="80" fill="#8a8a8a"/><rect x="-14" y="110" width="28" height="120" rx="12" fill="#333"/></g>
      <rect x="520" y="400" width="130" height="80" rx="10" fill="#bfbfbf"/><ellipse cx="585" cy="400" rx="65" ry="16" fill="${mix(c, 0.15)}"/><path d="M530 400 Q585 330 640 400" fill="none" stroke="#888" stroke-width="6"/>
      <path d="M420 0 L420 600" stroke="#ffffff" stroke-width="6" stroke-dasharray="18 12"/>`),

    planos: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, -0.35)}"/><g stroke="${mix(c, 0.1)}" stroke-width="1" opacity=".5">${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="600"/><line x1="0" y1="${i * 40}" x2="800" y2="${i * 40}"/>`).join('')}</g>
      <g stroke="#ffffff" stroke-width="6" fill="none"><rect x="140" y="110" width="420" height="330"/><line x1="340" y1="110" x2="340" y2="300"/><line x1="140" y1="300" x2="460" y2="300"/><line x1="460" y1="300" x2="460" y2="440"/><path d="M340 250 A50 50 0 0 1 390 300"/><path d="M200 440 A40 40 0 0 0 240 400"/></g>
      <g fill="#ffffff" font-family="Arial,sans-serif" font-size="20" opacity=".9"><text x="195" y="215">SALA</text><text x="380" y="215">COCINA</text><text x="250" y="380">ALCOBA</text><text x="480" y="380">BAÑO</text></g>
      <g transform="translate(610 360) rotate(-40)"><rect x="-12" y="-150" width="24" height="230" fill="#ffd66b"/><polygon points="-12,80 12,80 0,112" fill="#f6d3a0"/><rect x="-12" y="-170" width="24" height="24" fill="#ff8f8f"/></g>
      <g transform="translate(560 520) rotate(-8)"><rect x="-150" y="-18" width="300" height="36" fill="#f2f2f2"/>${Array.from({ length: 15 }, (_, i) => `<line x1="${-140 + i * 20}" y1="-18" x2="${-140 + i * 20}" y2="${i % 2 ? -6 : 2}" stroke="#333" stroke-width="2"/>`).join('')}</g>`),

    herramientas: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, 0.88)}"/><circle cx="400" cy="300" r="210" fill="${mix(c, 0.7)}"/>
      <g transform="translate(400 300) rotate(-40)"><rect x="-14" y="-40" width="28" height="240" rx="12" fill="#8a5a33"/><rect x="-90" y="-100" width="180" height="70" rx="12" fill="${mix(c, -0.35)}"/><rect x="60" y="-100" width="40" height="70" rx="8" fill="${mix(c, -0.5)}"/></g>
      <g transform="translate(400 300) rotate(40)"><rect x="-16" y="-40" width="32" height="230" rx="14" fill="${c}"/><circle cx="0" cy="-80" r="60" fill="${c}"/><rect x="-22" y="-160" width="44" height="80" fill="${mix(c, 0.7)}"/></g>
      <g fill="#ffd66b"><circle cx="190" cy="160" r="10"/><circle cx="620" cy="440" r="14"/><circle cx="630" cy="170" r="8"/></g>`),

    aire: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, 0.9)}"/><rect x="0" y="0" width="800" height="360" fill="${mix(c, 0.82)}"/>
      <rect x="170" y="110" width="460" height="150" rx="28" fill="#ffffff" stroke="${mix(c, 0.5)}" stroke-width="4"/><rect x="200" y="215" width="400" height="18" rx="9" fill="${mix(c, 0.7)}"/><circle cx="585" cy="150" r="8" fill="#48c774"/><rect x="200" y="140" width="110" height="26" rx="6" fill="${mix(c, 0.85)}"/>
      <g fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" opacity=".85"><path d="M250 290 Q270 330 250 370 Q230 410 250 450"/><path d="M400 290 Q420 330 400 370 Q380 410 400 450"/><path d="M550 290 Q570 330 550 370 Q530 410 550 450"/></g>
      <g transform="translate(660 460)" stroke="${mix(c, -0.3)}" stroke-width="8" stroke-linecap="round"><line x1="0" y1="-50" x2="0" y2="50"/><line x1="-43" y1="-25" x2="43" y2="25"/><line x1="-43" y1="25" x2="43" y2="-25"/><line x1="-14" y1="-40" x2="0" y2="-26"/><line x1="14" y1="-40" x2="0" y2="-26"/><line x1="-14" y1="40" x2="0" y2="26"/><line x1="14" y1="40" x2="0" y2="26"/></g>
      <rect x="90" y="470" width="150" height="90" rx="10" fill="#d3d8de"/>${Array.from({ length: 7 }, (_, i) => `<line x1="105" y1="${484 + i * 11}" x2="225" y2="${484 + i * 11}" stroke="#a5adb7" stroke-width="4"/>`).join('')}`),

    nevera: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, 0.9)}"/><rect y="500" width="800" height="100" fill="${mix(c, 0.7)}"/>
      <rect x="290" y="60" width="220" height="450" rx="22" fill="#eef2f6" stroke="#c7ced6" stroke-width="6"/><line x1="290" y1="220" x2="510" y2="220" stroke="#c7ced6" stroke-width="6"/>
      <rect x="470" y="110" width="12" height="70" rx="6" fill="#aab3bd"/><rect x="470" y="250" width="12" height="110" rx="6" fill="#aab3bd"/><rect x="315" y="90" width="60" height="24" rx="6" fill="${c}" opacity=".8"/>
      <g transform="translate(620 180)" stroke="${c}" stroke-width="8" stroke-linecap="round"><line x1="0" y1="-50" x2="0" y2="50"/><line x1="-43" y1="-25" x2="43" y2="25"/><line x1="-43" y1="25" x2="43" y2="-25"/></g>
      <g transform="translate(170 330)"><rect x="-60" y="-40" width="120" height="100" rx="12" fill="${mix(c, -0.3)}"/><rect x="-30" y="-60" width="60" height="26" rx="8" fill="none" stroke="${mix(c, -0.3)}" stroke-width="8"/><rect x="-60" y="0" width="120" height="10" fill="${mix(c, -0.1)}"/></g>`),

    tecnico: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, 0.88)}"/><circle cx="400" cy="300" r="220" fill="${mix(c, 0.72)}"/>
      <g transform="translate(300 300)"><circle cx="0" cy="0" r="90" fill="#ffffff" stroke="${mix(c, -0.3)}" stroke-width="12"/><path d="M-60 30 A70 70 0 1 1 60 30" fill="none" stroke="${mix(c, 0.5)}" stroke-width="10"/><line x1="0" y1="0" x2="40" y2="-50" stroke="#e03b3b" stroke-width="8" stroke-linecap="round"/><circle r="10" fill="${mix(c, -0.3)}"/></g>
      <g transform="translate(510 300)"><circle cx="0" cy="0" r="90" fill="#ffffff" stroke="${mix(c, -0.3)}" stroke-width="12"/><path d="M-60 30 A70 70 0 1 1 60 30" fill="none" stroke="${mix(c, 0.5)}" stroke-width="10"/><line x1="0" y1="0" x2="-45" y2="-45" stroke="${c}" stroke-width="8" stroke-linecap="round"/><circle r="10" fill="${mix(c, -0.3)}"/></g>
      <rect x="290" y="390" width="230" height="44" rx="12" fill="${mix(c, -0.3)}"/><path d="M340 434 Q330 520 250 540" fill="none" stroke="#e03b3b" stroke-width="12" stroke-linecap="round"/><path d="M470 434 Q480 520 560 540" fill="none" stroke="#2f6fdb" stroke-width="12" stroke-linecap="round"/>`),

    frio: (c) => wrap(800, 600, `<rect width="800" height="600" fill="${mix(c, -0.35)}"/><rect x="120" y="120" width="560" height="380" rx="14" fill="${mix(c, -0.15)}"/>
      ${[0, 1, 2].map((r) => `<rect x="150" y="${150 + r * 115}" width="500" height="12" rx="6" fill="${mix(c, 0.4)}"/>` + [0, 1, 2, 3, 4].map((k) => `<rect x="${165 + k * 97}" y="${172 + r * 115}" width="70" height="${60 - (k % 2) * 16}" rx="6" fill="${['#ffffff', mix(c, 0.6), '#ffd66b', mix(c, 0.8), '#ff9f7a'][(k + r) % 5]}" opacity=".9"/>`).join('')).join('')}
      <g fill="#ffffff" opacity=".6">${Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 137) % 800}" cy="${(i * 71) % 110 + 10}" r="${3 + (i % 3)}"/>`).join('')}</g>`),

    avatar: (c, n = 0) => {
      const skins = ['#f1c7a3', '#d9a07a', '#a86f4c', '#f5d6bf', '#8d5a3b', '#e8b995'];
      const hairs = ['#2f2320', '#5a3825', '#1c1c1c', '#8a5a3c', '#3b2a1e', '#6b4a2f'];
      const i = Math.abs(n) % 6;
      return wrap(200, 200, `<rect width="200" height="200" fill="${mix(c, 0.8 - (i % 3) * 0.1)}"/><path d="M30 200 C30 150 60 130 100 130 C140 130 170 150 170 200Z" fill="${[c, mix(c, -0.3), mix(c, 0.3), '#ffffff', mix(c, -0.15), '#3b4a5a'][i]}"/><rect x="88" y="110" width="24" height="26" fill="${skins[i]}"/><circle cx="100" cy="88" r="38" fill="${skins[i]}"/>${i % 2 ? `<path d="M60 92 C58 50 80 38 100 38 C124 38 144 52 140 96 C150 70 150 120 136 140 L136 90 C120 80 90 70 66 88 L64 140 C50 120 52 100 60 92Z" fill="${hairs[i]}"/>` : `<path d="M62 86 C62 56 80 44 100 44 C124 44 140 58 138 86 C124 70 90 66 62 86Z" fill="${hairs[i]}"/>`}`);
    },

    logo: (c, n = 0) => {
      const shapes = [
        `<circle cx="40" cy="40" r="22" fill="${c}"/><circle cx="40" cy="40" r="10" fill="#fff"/>`,
        `<rect x="18" y="18" width="44" height="44" rx="10" fill="${c}" transform="rotate(45 40 40)"/>`,
        `<polygon points="40,14 66,62 14,62" fill="${c}"/>`,
        `<path d="M16 60 L32 22 L44 44 L52 30 L66 60Z" fill="${c}"/>`,
        `<circle cx="30" cy="40" r="16" fill="${c}"/><circle cx="50" cy="40" r="16" fill="${mix(c, 0.4)}"/>`,
        `<rect x="16" y="24" width="48" height="32" rx="16" fill="${c}"/>`
      ];
      const names = ['Grupo Andino', 'Nexo Capital', 'Altamira', 'Cordillera', 'Unión Norte', 'Prisma'];
      const i = Math.abs(n) % 6;
      return wrap(320, 80, `${shapes[i]}<text x="80" y="50" font-family="Arial,sans-serif" font-weight="700" font-size="24" fill="#334155">${names[i]}</text>`);
    },

    abstracto: (c) => wrap(1200, 700, `<defs><linearGradient id="ga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(c, -0.4)}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="1200" height="700" fill="url(#ga)"/><circle cx="1050" cy="120" r="260" fill="#ffffff" opacity=".07"/><circle cx="140" cy="640" r="220" fill="#ffffff" opacity=".06"/><circle cx="820" cy="560" r="120" fill="#ffffff" opacity=".05"/>`)
  };

  SV.ART_LIST = [
    ['casa', 'Casa'], ['apartamento', 'Edificio'], ['interior', 'Interior'], ['llaves', 'Ubicación'],
    ['odontologia', 'Diente'], ['sonrisa', 'Sonrisa'], ['medico', 'Médico'], ['consultorio', 'Clínica'],
    ['obra', 'Obra'], ['remodelacion', 'Remodelación'], ['planos', 'Planos'], ['herramientas', 'Herramientas'],
    ['aire', 'Aire acondicionado'], ['nevera', 'Nevera'], ['tecnico', 'Manómetros'], ['frio', 'Cuarto frío'],
    ['abstracto', 'Fondo degradado']
  ];

  const cache = {};
  /* Convierte "art:casa", "art:avatar:3" o "art:logo:2" en una imagen con el color indicado. */
  SV.artSrc = (token, color) => {
    const m = /^art:([a-z]+)(?::(\d+))?$/.exec(String(token || ''));
    if (!m || !ART[m[1]]) return '';
    const key = token + '|' + color;
    if (!cache[key]) cache[key] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ART[m[1]](color || '#1f7a4d', Number(m[2] || 0)));
    return cache[key];
  };
})(window.SV);
