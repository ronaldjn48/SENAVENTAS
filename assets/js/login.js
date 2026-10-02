/* ==========================================================================
   SENAVENTAS · Pantalla de acceso: crear usuario o ingresar
   Sin correo ni verificación: solo separa el trabajo de cada estudiante.
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  const esc = SV.util.esc;
  const ic = (n, c = '') => `<span class="ms ${c}">${n}</span>`;

  SV.login = {
    /* onAuth(account) se llama cuando el usuario entra o se registra. */
    show(onAuth, notice) {
      let el = document.getElementById('login');
      if (el) el.remove();
      el = document.createElement('div');
      el.id = 'login';
      el.className = 'login';
      document.body.appendChild(el);
      document.body.classList.add('logged-out');
      document.title = 'Ingresar · SENAVENTAS';

      const firstTime = SV.auth.count() === 0;
      let mode = firstTime ? 'register' : 'login';

      const draw = (msg) => {
        const reg = mode === 'register';
        el.innerHTML = `
        <section class="login-hero">
          <div class="logo"><div class="logo-mark">${ic('storefront', 'fill')}</div><div><b style="color:#fff">SENAVENTAS</b><small style="color:rgba(255,255,255,.75)">Aula virtual</small></div></div>
          <div class="login-hero-body">
            <h1>Crea tu tienda virtual desde cero</h1>
            <p>Cada estudiante trabaja en su propio espacio. Al crear tu usuario empiezas con una tienda limpia, sin datos de otras personas.</p>
            <ul>
              <li>${ic('person')}<span><b>Tu usuario, tu espacio.</b> Nadie más ve tus tiendas ni tus pedidos.</span></li>
              <li>${ic('refresh')}<span><b>Siempre limpio.</b> Cada usuario nuevo parte de cero.</span></li>
              <li>${ic('download')}<span><b>Llévate tu trabajo.</b> Descarga tu archivo y súbelo en otro equipo.</span></li>
            </ul>
          </div>
          <small class="login-foot">Uso exclusivamente educativo. No se procesa dinero real.</small>
        </section>
        <section class="login-panel">
          <form class="login-card" id="login-form" autocomplete="on" novalidate>
            <div class="login-tabs" role="tablist">
              <button type="button" role="tab" class="${reg ? '' : 'on'}" data-mode="login">Ingresar</button>
              <button type="button" role="tab" class="${reg ? 'on' : ''}" data-mode="register">Crear usuario</button>
            </div>
            <h2>${reg ? 'Crea tu usuario' : 'Bienvenido de nuevo'}</h2>
            <p class="muted small">${reg ? 'Elige un usuario y una contraseña. Entras de inmediato, sin verificar correo.' : 'Escribe tu usuario y contraseña para abrir tu trabajo.'}</p>
            ${notice ? `<div class="tip" style="padding:10px 12px"><div class="ico" style="width:30px;height:30px">${ic('info', 'sm')}</div><p class="small">${esc(notice)}</p></div>` : ''}
            <div class="field"><label for="lg-user">Usuario</label>
              <div class="input-ico">${ic('person')}<input class="input" id="lg-user" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="24" placeholder="Ej: carlos.mendoza" required></div>
            </div>
            <div class="field"><label for="lg-pass">Contraseña</label>
              <div class="input-ico">${ic('lock')}<input class="input" id="lg-pass" name="password" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" placeholder="${reg ? 'Mínimo 4 caracteres' : 'Tu contraseña'}" required>
                <button type="button" class="icon-btn" id="lg-eye" aria-label="Mostrar u ocultar contraseña" style="position:absolute;right:2px;top:2px">${ic('visibility')}</button></div>
            </div>
            <label class="check small"><input type="checkbox" id="lg-keep"> Mantener mi sesión iniciada en este equipo <span class="muted">(no lo marques en equipos compartidos)</span></label>
            <div class="login-msg ${msg ? 'on' : ''}" id="lg-msg" role="alert">${msg ? ic('error', 'sm') + ' ' + esc(msg) : ''}</div>
            <button class="btn btn-primary btn-lg btn-block" type="submit">${ic(reg ? 'person_add' : 'login')} ${reg ? 'Crear usuario y empezar' : 'Ingresar'}</button>
            <p class="small muted" style="text-align:center">${reg ? '¿Ya tienes usuario?' : '¿Primera vez aquí?'} <a href="#" data-mode="${reg ? 'login' : 'register'}">${reg ? 'Ingresa' : 'Crea tu usuario'}</a></p>
          </form>
        </section>`;
        const user = el.querySelector('#lg-user');
        const pass = el.querySelector('#lg-pass');
        user.focus();
        el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', (e) => {
          e.preventDefault();
          const u = user.value; mode = b.dataset.mode; draw(); el.querySelector('#lg-user').value = u;
        }));
        el.querySelector('#lg-eye').addEventListener('click', () => {
          const show = pass.type === 'password';
          pass.type = show ? 'text' : 'password';
          el.querySelector('#lg-eye .ms').textContent = show ? 'visibility_off' : 'visibility';
        });
        el.querySelector('#login-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const u = user.value.trim(); const p = pass.value;
          if (!u || !p) { draw(!u ? 'Escribe tu usuario.' : 'Escribe tu contraseña.'); el.querySelector(!u ? '#lg-user' : '#lg-pass').focus(); el.querySelector('#lg-user').value = u; return; }
          const keep = el.querySelector('#lg-keep').checked;
          let r = reg ? SV.auth.register(u, p) : SV.auth.login(u, p);
          if (!r.ok) {
            if (r.code === 'no_user') { mode = 'register'; draw(r.error); el.querySelector('#lg-user').value = u; return; }
            if (r.code === 'exists') { mode = 'login'; draw(r.error); el.querySelector('#lg-user').value = u; return; }
            draw(r.error); el.querySelector('#lg-user').value = u; el.querySelector('#lg-pass').focus(); return;
          }
          SV.auth.setCurrent(r.account, keep);
          SV.login.hide();
          onAuth(r.account, { isNew: reg });
        });
      };
      draw();
    },
    hide() {
      const el = document.getElementById('login');
      if (el) el.remove();
      document.body.classList.remove('logged-out');
      document.title = 'SENAVENTAS · Creador de Tiendas Virtuales';
    }
  };
})(window.SV);
