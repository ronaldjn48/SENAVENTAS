/* ==========================================================================
   SENAVENTAS · Estilos de la tienda generada (se incrustan en el sitio exportado)
   ========================================================================== */
window.SV = window.SV || {};
SV.STORE_CSS = `
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--font-body);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased;padding-bottom:44px}
img{max-width:100%;display:block}
a{color:inherit;text-decoration:none}
button,input,select,textarea{font:inherit;color:inherit}
button{cursor:pointer;border:0;background:none}
.ms{font-family:'Material Symbols Outlined';font-weight:normal;font-style:normal;font-size:20px;line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;direction:ltr;-webkit-font-feature-settings:'liga';font-feature-settings:'liga';vertical-align:middle;overflow:hidden;max-width:1.2em}
.ms.fill{font-variation-settings:'FILL' 1}
html:not(.icons-ok) .ms{color:transparent!important}
.wrap{max-width:1200px;margin:0 auto;padding:0 24px}
h1,h2,h3,h4{font-family:var(--font-head);margin:0;line-height:1.15;letter-spacing:-.01em}
.eyebrow{font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--primary2)}
.muted{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 22px;border-radius:calc(var(--radius) * .7);font-weight:700;font-size:14px;transition:.2s;white-space:nowrap}
.btn-primary{background:var(--primary);color:var(--on-primary);box-shadow:0 6px 18px -8px var(--primary)}
.btn-primary:hover{filter:brightness(1.12);transform:translateY(-1px)}
.btn-soft{background:var(--alt);color:var(--text)}
.btn-soft:hover{background:var(--alt2)}
.btn-ghost{background:rgba(255,255,255,.12);color:inherit;backdrop-filter:blur(6px)}
.btn-block{width:100%}
.btn[disabled]{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none}
.chip{display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:999px;font-size:12px;font-weight:600;background:var(--alt);color:var(--text);transition:.2s}
.chip.on{background:var(--primary);color:var(--on-primary)}
.chip:hover:not(.on){background:var(--alt2)}
.pill{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:600;background:var(--card);color:var(--primary2);box-shadow:0 1px 6px rgba(0,0,0,.06)}
.badge{position:absolute;top:12px;left:12px;padding:4px 10px;border-radius:8px;font-size:11px;font-weight:700;background:var(--primary);color:var(--on-primary);z-index:2;max-width:70%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
/* Anuncio y cabecera */
.announce{background:var(--primary);color:var(--on-primary);text-align:center;font-size:12.5px;font-weight:600;padding:8px 16px;display:flex;align-items:center;justify-content:center;gap:8px}
.hdr{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--card) 92%,transparent);backdrop-filter:blur(12px);box-shadow:0 1px 10px rgba(0,0,0,.05)}
.hdr .wrap{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:72px}
.brand{display:flex;align-items:center;gap:10px;min-width:0}
.brand-ico{width:40px;height:40px;border-radius:12px;background:var(--primary);color:var(--on-primary);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.brand-name{font-family:var(--font-head);font-weight:800;font-size:19px;color:var(--primary);line-height:1.1;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px}
.brand-tag{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:280px}
.nav{display:flex;gap:22px;font-size:13.5px;font-weight:600;color:var(--muted)}
.nav a:hover,.nav a.on{color:var(--primary)}
.hdr-actions{display:flex;align-items:center;gap:8px}
.search{position:relative}
.search input{width:220px;padding:9px 14px 9px 36px;border-radius:999px;border:0;background:var(--alt);outline:none;font-size:13px}
.search input:focus{box-shadow:0 0 0 2px var(--primary)}
.search .ms{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);font-size:18px}
.icon-btn{width:40px;height:40px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;color:var(--text);transition:.2s;position:relative}
.icon-btn:hover{background:var(--alt)}
.cart-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;background:var(--accent);color:var(--on-accent);font-weight:700;font-size:13px}
.cart-btn .count{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:var(--primary);color:var(--on-primary);font-size:11px;display:inline-flex;align-items:center;justify-content:center}
.fav-count{position:absolute;top:2px;right:2px;min-width:16px;height:16px;border-radius:999px;background:#ba1a1a;color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;padding:0 4px}
/* Hero */
.hero{position:relative;overflow:hidden}
.hero-split{background:linear-gradient(135deg,var(--alt) 0%,var(--bg) 55%,color-mix(in srgb,var(--accent) 35%,var(--bg)) 100%);padding:72px 0}
.hero-split .wrap{display:grid;grid-template-columns:7fr 5fr;gap:48px;align-items:center}
.hero h1{font-size:clamp(32px,4.6vw,52px);font-weight:800;margin:14px 0}
.hero h1 em{font-style:italic;color:var(--primary)}
.hero p.lead{font-size:16.5px;color:var(--muted);max-width:560px;margin:0 0 22px}
.hero-ctas{display:flex;flex-wrap:wrap;gap:12px}
.hero-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:30px;max-width:520px}
.hero-stats b{display:block;font-family:var(--font-head);font-size:18px;color:var(--primary)}
.hero-stats span{font-size:12px;color:var(--muted)}
.hero-media{position:relative}
.hero-media .img{aspect-ratio:1/1;border-radius:calc(var(--radius) * 1.5);overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.45);background:var(--alt2)}
.hero-media .img img{width:100%;height:100%;object-fit:cover}
.float-card{position:absolute;left:16px;right:16px;bottom:16px;background:color-mix(in srgb,var(--card) 94%,transparent);backdrop-filter:blur(10px);border-radius:var(--radius);padding:14px 16px;display:flex;align-items:center;gap:12px;box-shadow:0 10px 30px -12px rgba(0,0,0,.35)}
.float-card .ico{width:40px;height:40px;border-radius:12px;background:var(--accent);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.float-card b{display:block;font-size:14px}
.float-card small{color:var(--primary2);font-weight:600;font-size:12px}
.hero-overlay{margin:28px auto 0;max-width:1200px;border-radius:calc(var(--radius) * 1.4);background:var(--dark);color:#faf8f5;min-height:480px;display:flex;align-items:center}
.hero-overlay .bgimg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.45}
.hero-overlay:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,var(--dark) 0%,color-mix(in srgb,var(--dark) 78%,transparent) 50%,transparent 100%)}
.hero-overlay .inner{position:relative;z-index:2;padding:56px;max-width:680px}
.hero-overlay h1{color:#faf8f5;font-weight:500}
.hero-overlay h1 em{color:var(--accent);font-style:normal}
.hero-overlay p.lead{color:#e3d9c9}
.hero-overlay .pill{background:color-mix(in srgb,var(--accent) 30%,transparent);color:#ebdcb9;box-shadow:none;text-transform:uppercase;letter-spacing:.14em;font-size:11px}
.hero-overlay .btn-primary{background:var(--accent);color:var(--on-accent);text-transform:uppercase;letter-spacing:.08em}
.hero-overlay .btn-soft,.hero-compact .btn-soft{background:rgba(250,248,245,.12);color:#faf8f5;backdrop-filter:blur(6px)}
.hero-overlay .btn-soft:hover,.hero-compact .btn-soft:hover{background:rgba(250,248,245,.22)}
.hero-overlay .hero-stats b{color:#f7f3eb}
.hero-overlay .hero-stats span{color:#c3b59f}
.hero-editorial{padding:28px 0 0}
.hero-editorial .frame{position:relative;border-radius:var(--radius);overflow:hidden;height:520px;background:var(--alt2)}
.hero-editorial .frame img{width:100%;height:100%;object-fit:cover}
.hero-editorial .caption{position:absolute;left:32px;bottom:32px;max-width:560px;background:var(--card);padding:32px;border-radius:var(--radius);box-shadow:0 20px 50px -20px rgba(0,0,0,.4)}
.hero-editorial h1{font-weight:400;font-size:clamp(30px,4vw,46px)}
.hero-editorial h1 em{color:var(--primary)}
.hero-compact{background:var(--dark);color:var(--on-dark);padding:44px 0}
.hero-compact .wrap{display:grid;grid-template-columns:3fr 2fr;gap:36px;align-items:center}
.hero-compact h1{font-size:clamp(28px,3.6vw,40px);color:#fff}
.hero-compact h1 em{color:var(--accent);font-style:normal}
.hero-compact p.lead{color:color-mix(in srgb,var(--on-dark) 80%,transparent)}
.hero-compact .pill{background:rgba(255,255,255,.12);color:var(--accent);box-shadow:none}
.kpi-box{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.kpi-box div{background:rgba(255,255,255,.08);border-radius:var(--radius);padding:16px}
.kpi-box b{display:block;font-size:22px;color:#fff}
.kpi-box span{font-size:12px;color:color-mix(in srgb,var(--on-dark) 75%,transparent)}
/* Secciones */
section.block{padding:64px 0}
.sec-head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:26px}
.sec-head h2{font-size:clamp(24px,3vw,34px);font-weight:800}
.t-aura .sec-head h2,.t-boutique .sec-head h2{font-weight:500}
.filters{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.filters select{padding:7px 12px;border-radius:999px;border:0;background:var(--alt);font-size:12.5px;font-weight:600;outline:none}
.promo{background:var(--card);border-radius:calc(var(--radius) * 1.2);box-shadow:0 12px 40px -20px rgba(0,0,0,.25);padding:26px;display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between;margin-top:-34px;position:relative;z-index:5}
.promo .l{display:flex;gap:16px;align-items:center;flex:1;min-width:260px}
.promo .ico{width:56px;height:56px;border-radius:16px;background:var(--accent);color:var(--primary);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.promo h3{font-size:19px;margin:4px 0}
.promo .r{display:flex;align-items:center;gap:18px}
.price-old{text-decoration:line-through;color:var(--muted);font-size:13px}
.price{font-family:var(--font-head);font-weight:800;font-size:21px}
.price small{font-size:11px;font-weight:500;color:var(--muted);font-family:var(--font-body)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
.card{background:var(--card);border-radius:var(--radius);overflow:hidden;display:flex;flex-direction:column;box-shadow:0 2px 12px -4px rgba(0,0,0,.08);transition:.3s}
.card:hover{box-shadow:0 18px 40px -18px rgba(0,0,0,.3);transform:translateY(-2px)}
.card .media{position:relative;aspect-ratio:1/1;background:var(--alt);overflow:hidden;cursor:zoom-in}
.card .media img{width:100%;height:100%;object-fit:cover;transition:transform .6s}
.card:hover .media img{transform:scale(1.05)}
.fav{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:999px;background:rgba(255,255,255,.85);display:flex;align-items:center;justify-content:center;z-index:2;color:var(--text)}
.fav.on{color:#ba1a1a}
.stock-tag{position:absolute;bottom:10px;left:10px;background:rgba(255,255,255,.9);border-radius:6px;padding:2px 8px;font-size:11px;font-weight:600;color:var(--text)}
.card .body{padding:16px;display:flex;flex-direction:column;gap:6px;flex:1}
.card .origin{font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--primary2)}
.card h3{font-size:15.5px;font-weight:700;line-height:1.3;cursor:pointer}
.card h3:hover{color:var(--primary)}
.card .desc{font-size:12.5px;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.stars{color:#e3a008;font-size:12px;display:flex;align-items:center;gap:1px}
.stars .ms{font-size:15px}
.stars small{color:var(--muted);margin-left:4px}
.card .foot{margin-top:auto;padding-top:10px;display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.add-btn{width:42px;height:42px;border-radius:12px;background:var(--accent);color:var(--on-accent);display:inline-flex;align-items:center;justify-content:center;transition:.2s;flex-shrink:0}
.add-btn:hover{background:var(--primary);color:var(--on-primary)}
.add-btn.in{background:var(--primary);color:var(--on-primary)}
.soldout{font-size:12px;font-weight:700;color:#ba1a1a}
.t-aura .card{border-radius:18px}
.t-aura .card h3,.t-aura .price{font-family:var(--font-head)}
.t-aura .add-wide,.t-boutique .add-wide{width:100%;margin-top:10px;padding:11px;border-radius:10px;background:var(--primary);color:var(--on-primary);font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:8px;transition:.2s}
.t-aura .add-wide:hover{background:var(--primary2)}
.t-boutique .card{box-shadow:none;background:transparent}
.t-boutique .card .media{border-radius:var(--radius)}
.t-boutique .card .body{padding:14px 2px}
.t-boutique .card h3{font-family:var(--font-head);font-weight:400;font-size:19px}
.empty{padding:40px;text-align:center;color:var(--muted);background:var(--alt);border-radius:var(--radius)}
/* Tabla mayorista */
.qtable{width:100%;border-collapse:collapse;background:var(--card);border-radius:var(--radius);overflow:hidden;font-size:13.5px}
.qtable th{background:var(--alt);text-align:left;padding:12px 14px;font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}
.qtable td{padding:12px 14px;border-top:1px solid var(--alt);vertical-align:middle}
.qtable .prod{display:flex;align-items:center;gap:12px}
.qtable .prod img{width:48px;height:48px;border-radius:8px;object-fit:cover;background:var(--alt)}
.qtable input[type=number]{width:78px;padding:7px 8px;border-radius:8px;border:1px solid var(--alt2);background:var(--bg)}
.qtable .mono{font-family:ui-monospace,monospace;font-size:12px;color:var(--muted)}
.table-wrap{overflow-x:auto;border-radius:var(--radius);box-shadow:0 2px 14px -6px rgba(0,0,0,.12)}
/* Confianza y nosotros */
.trust{background:var(--alt)}
.trust-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.trust-card{background:var(--card);border-radius:var(--radius);padding:24px;display:flex;flex-direction:column;gap:10px}
.trust-card .ico{width:48px;height:48px;border-radius:14px;background:var(--accent);color:var(--primary);display:flex;align-items:center;justify-content:center}
.trust-card h4{font-size:16px}
.trust-card p{margin:0;font-size:13px;color:var(--muted)}
.center{text-align:center;max-width:680px;margin:0 auto 30px}
.center h2{font-size:clamp(22px,2.8vw,30px);margin:6px 0}
.about .wrap{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center}
.about h2{font-size:clamp(24px,3vw,34px);margin:8px 0 14px}
.metrics{background:var(--card);border-radius:var(--radius);padding:24px;box-shadow:0 2px 14px -6px rgba(0,0,0,.12)}
.metrics .row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
.metrics .row div{background:var(--alt);border-radius:12px;padding:14px}
.metrics b{display:block;font-size:22px;color:var(--primary);font-family:var(--font-head)}
.metrics span{font-size:12px;color:var(--muted)}
/* Pie */
footer.ftr{background:var(--card);padding:56px 0 24px;margin-top:0}
.t-aura footer.ftr,.t-mayorista footer.ftr{background:var(--dark);color:var(--on-dark)}
.t-aura footer.ftr .muted,.t-mayorista footer.ftr .muted{color:color-mix(in srgb,var(--on-dark) 70%,transparent)}
.ftr-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1.2fr;gap:28px;padding-bottom:28px}
.ftr h5{margin:0 0 12px;font-size:12px;text-transform:uppercase;letter-spacing:.1em}
.ftr a,.ftr p{display:block;font-size:13px;margin:0 0 8px}
.ftr a:hover{color:var(--primary2)}
.credits{background:var(--alt);border-radius:var(--radius);padding:16px;font-size:12.5px}
.t-aura .credits,.t-mayorista .credits{background:rgba(255,255,255,.07)}
.credits b{color:var(--primary2)}
.pay-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.pay-chips span{padding:4px 9px;border-radius:6px;background:var(--alt);font-size:11px;font-weight:700;color:var(--text)}
.ftr-bottom{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:12px;padding-top:16px;border-top:1px solid color-mix(in srgb,var(--muted) 20%,transparent)}
/* Panel lateral y modales */
.scrim{position:fixed;inset:0;background:rgba(11,28,48,.45);backdrop-filter:blur(2px);z-index:60;opacity:0;pointer-events:none;transition:.25s}
.scrim.on{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;right:0;height:100%;width:420px;max-width:100%;background:var(--card);z-index:70;display:flex;flex-direction:column;transform:translateX(105%);transition:transform .3s ease;box-shadow:-20px 0 50px -20px rgba(0,0,0,.35)}
.drawer.on{transform:none}
.drawer-h{padding:18px 20px;background:var(--alt);display:flex;align-items:center;justify-content:space-between}
.drawer-h h3{font-size:17px;display:flex;align-items:center;gap:8px}
.drawer-b{flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:12px}
.drawer-f{padding:18px 20px;background:var(--alt);display:flex;flex-direction:column;gap:10px}
.ship-bar{background:color-mix(in srgb,var(--accent) 45%,var(--card));padding:12px 20px;font-size:12.5px}
.ship-bar .track{height:7px;border-radius:9px;background:var(--alt2);overflow:hidden;margin-top:6px}
.ship-bar .track i{display:block;height:100%;background:var(--primary);border-radius:9px;transition:width .4s}
.line{display:flex;gap:12px;padding:10px;border-radius:14px;background:var(--alt)}
.line img{width:64px;height:64px;border-radius:10px;object-fit:cover;background:var(--alt2);flex-shrink:0}
.line .info{flex:1;min-width:0}
.line b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.line small{color:var(--muted);font-size:12px}
.qty{display:inline-flex;align-items:center;background:var(--card);border-radius:8px;overflow:hidden;margin-top:6px}
.qty button{width:28px;height:26px;font-weight:700}
.qty span{min-width:26px;text-align:center;font-size:12.5px;font-weight:700}
.sum{display:flex;justify-content:space-between;font-size:13px;color:var(--muted)}
.sum b{color:var(--text)}
.sum.total{font-size:17px;font-weight:800;color:var(--text);padding-top:6px}
.sum.total b{color:var(--primary);font-size:20px}
.coupon{display:flex;gap:8px}
.coupon input{flex:1;padding:9px 12px;border-radius:10px;border:1px solid var(--alt2);background:var(--card);text-transform:uppercase;font-family:ui-monospace,monospace;font-size:13px}
.note{font-size:11.5px;color:var(--muted);text-align:center;display:flex;align-items:center;justify-content:center;gap:6px}
.modal{position:fixed;inset:0;z-index:80;display:flex;align-items:center;justify-content:center;padding:16px;pointer-events:none;opacity:0;transition:.25s}
.modal.on{opacity:1;pointer-events:auto}
.modal .box{background:var(--card);border-radius:calc(var(--radius) * 1.1);width:100%;max-width:560px;max-height:92vh;overflow-y:auto;padding:26px;box-shadow:0 30px 80px -20px rgba(0,0,0,.5);position:relative}
.modal .box.wide{max-width:880px}
.modal .x{position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:999px;background:var(--alt);display:flex;align-items:center;justify-content:center;z-index:3}
.pd{display:grid;grid-template-columns:1fr 1fr;gap:26px}
.pd .img{aspect-ratio:1/1;border-radius:var(--radius);overflow:hidden;background:var(--alt)}
.pd .img img{width:100%;height:100%;object-fit:cover}
.pd h2{font-size:24px;margin:6px 0 10px}
.field{display:flex;flex-direction:column;gap:5px;margin-bottom:12px}
.field label{font-size:12px;font-weight:700}
.field input,.field select,.field textarea{padding:10px 12px;border-radius:10px;border:1px solid var(--alt2);background:var(--bg);outline:none;font-size:14px;width:100%}
.field input:focus,.field select:focus{border-color:var(--primary);box-shadow:0 0 0 3px color-mix(in srgb,var(--primary) 18%,transparent)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.pay-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}
.pay-opt{border:2px solid var(--alt2);border-radius:12px;padding:12px;display:flex;align-items:center;gap:10px;font-weight:700;font-size:13px;text-align:left;background:var(--card)}
.pay-opt.on{border-color:var(--primary);background:color-mix(in srgb,var(--accent) 30%,var(--card))}
.pay-opt .ms{color:var(--primary)}
.hint{background:var(--alt);border-radius:12px;padding:12px;font-size:12.5px;color:var(--muted);margin-bottom:12px}
.hint code{background:var(--card);padding:1px 6px;border-radius:5px;font-size:12px;color:var(--text)}
.err{color:#ba1a1a;font-size:12.5px;font-weight:600;margin:4px 0 10px;min-height:1em}
.steps{display:flex;gap:6px;margin-bottom:18px}
.steps i{flex:1;height:5px;border-radius:9px;background:var(--alt2)}
.steps i.on{background:var(--primary)}
.result{text-align:center}
.result .big{width:64px;height:64px;border-radius:999px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;background:var(--accent);color:var(--primary)}
.result .big .ms{font-size:34px}
.result.bad .big{background:#ffdad6;color:#ba1a1a}
.receipt{background:var(--alt);border-radius:12px;padding:14px;margin:16px 0;text-align:left;font-size:13px}
.receipt div{display:flex;justify-content:space-between;gap:10px;padding:3px 0}
.spinner{width:42px;height:42px;border-radius:999px;border:4px solid var(--alt2);border-top-color:var(--primary);animation:spin 1s linear infinite;margin:10px auto}
@keyframes spin{to{transform:rotate(360deg)}}
.wa-float{position:fixed;right:18px;bottom:60px;width:54px;height:54px;border-radius:999px;background:#25d366;color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 25px -8px rgba(0,0,0,.4);z-index:40}
.wa-float .ms{font-size:28px}
.sandbox{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#0b1c30;color:#eaf1ff;font-size:12px;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:8px;text-align:center}
.sandbox b{color:#94f8ad}
.toast{position:fixed;left:50%;bottom:60px;transform:translate(-50%,20px);background:var(--dark);color:#fff;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;z-index:90;opacity:0;transition:.3s;pointer-events:none;display:flex;align-items:center;gap:8px;max-width:90%}
.toast.on{opacity:1;transform:translate(-50%,0)}
@media print{body *{visibility:hidden}#quote-print,#quote-print *{visibility:visible}#quote-print{position:absolute;left:0;top:0;width:100%}.no-print{display:none!important}}
/* Responsivo */
@media (max-width:1024px){.grid{grid-template-columns:repeat(3,1fr)}.nav{display:none}.ftr-grid{grid-template-columns:1fr 1fr}}
@media (max-width:760px){
 .wrap{padding:0 16px}
 .grid{grid-template-columns:repeat(2,1fr);gap:12px}
 .hero-split .wrap,.hero-compact .wrap,.about .wrap,.pd{grid-template-columns:1fr}
 .hero-split{padding:40px 0}
 .hero-overlay{margin:12px;min-height:420px}
 .hero-overlay .inner{padding:28px}
 .hero-editorial .frame{height:auto;min-height:420px;display:flex;flex-direction:column;justify-content:flex-end}
 .hero-editorial .frame img{position:absolute;inset:0}
 .hero-editorial .caption{position:relative;left:auto;bottom:auto;margin:180px 12px 12px;padding:20px}
 .trust-grid{grid-template-columns:1fr}
 .hdr .wrap{flex-wrap:wrap;min-height:0;padding-top:10px;padding-bottom:10px;gap:10px}
 .search{order:3;flex:1 1 100%}
 .search input{width:100%;font-size:16px}
 .filters{flex-wrap:nowrap;overflow-x:auto;width:100%;padding-bottom:4px;-webkit-overflow-scrolling:touch}
 .filters>*{flex-shrink:0}
 .sec-head{margin-bottom:16px}
 .promo{margin-top:16px;padding:18px}
 .promo .r{width:100%;justify-content:space-between}
 .hero-ctas .btn{flex:1 1 auto}
 .field input,.field select,.coupon input{font-size:16px}
 .drawer{width:100%}
 .modal{align-items:flex-end;padding:0}
 .modal .box,.modal .box.wide{border-radius:20px 20px 0 0;max-height:92vh;padding:22px 18px}
 .qtable,.qtable tbody{display:block}
 .qtable thead{display:none}
 .qtable tr{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;padding:14px;border-top:1px solid var(--alt)}
 .qtable td{border:0;padding:3px 0;text-align:left!important;display:flex;flex-direction:column;font-size:13px}
 .qtable td[data-l]::before{content:attr(data-l);font-size:11px;color:var(--muted);font-weight:600}
 .qtable td:first-child{grid-column:1/-1}
 .qtable td.q-add{grid-column:1/-1;align-items:stretch}
 .qtable td.q-add .add-btn{width:100%}
 .qtable input[type=number]{width:100%}
 .table-wrap{overflow:visible}
 .wa-float{bottom:56px;width:48px;height:48px}
 .brand-name,.brand-tag{max-width:150px}
 .cart-btn .lbl{display:none}
 .ftr-grid{grid-template-columns:1fr}
 section.block{padding:44px 0}
 .row2,.pay-opts{grid-template-columns:1fr}
 .card .body{padding:12px}
 .card h3{font-size:14px}
 .price{font-size:17px}
}
@media (max-width:420px){.grid{grid-template-columns:1fr 1fr}.card .desc{display:none}.hero-stats{grid-template-columns:1fr 1fr 1fr}}
`;
