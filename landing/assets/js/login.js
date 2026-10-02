/* ==========================================================================
   SENA VENTAS LANDING PAGE · Pantalla de acceso: crear usuario o ingresar
   Sin correo ni verificación: separa el trabajo de cada estudiante y deja
   la app limpia para la siguiente persona que use el equipo.
   ========================================================================== */
window.SV = window.SV || {};

(function (SV) {
  const esc = SV.util.esc;
  const ic = (n, c = '') => `<span class="ms ${c}">${n}</span>`;

  SV.login = {
    /* onAuth(account, { isNew }) se llama cuando el usuario entra o se registra. */
    show(onAuth, notice) {
      let el = document.getElementById('login');
      if (el) el.remove();
      el = document.createElement('div');
      el.id = 'login';
      el.className = 'login';
      document.body.appendChild(el);
      document.body.classList.add('logged-out');
      document.title = 'Ingresar · SENA VENTAS LANDING PAGE';

      let mode = SV.auth.count() === 0 ? 'register' : 'login';

      const draw = (msg, keepUser = '') => {
        const reg = mode === 'register';
        el.innerHTML = `
        <section class="login-hero">
          <div class="logo"><div class="logo-mark">${ic('ads_click', 'fill')}</div><div><b style="color:#fff">SENA VENTAS</b><small style="color:rgba(255,255,255,.75)">Landing Page</small></div></div>
          <div class="login-hero-body">
            <h1>Crea landing pages que capten clientes reales</h1>
            <p>Cada estudiante trabaja en su propio espacio. Al crear tu usuario empiezas desde cero, sin proyectos ni leads de otras personas.</p>
            <ul>
              <li>${ic('person')}<span><b>Tu usuario, tu espacio.</b> Nadie más ve tus landing ni tu base de datos de interesados.</span></li>
              <li>${ic('cleaning_services')}<span><b>Siempre limpio.</b> Al cerrar sesión la pantalla queda lista para el siguiente estudiante.</span></li>
              <li>${ic('download')}<span><b>Llévate tu trabajo.</b> Exporta tu proyecto y tu Excel para entregarlos o seguir en otro equipo.</span></li>
            </ul>
          </div>
          <small class="login-foot">Simulador educativo SENA. Acceso sin correo ni verificación.</small>
        </section>
        <section class="login-panel">
          <form class="login-card" id="login-form" autocomplete="on" novalidate>
            <div class="login-tabs" role="tablist">
              <button type="button" role="tab" class="${reg ? '' : 'on'}" data-mode="login">Ingresar</button>
              <button type="button" role="tab" class="${reg ? 'on' : ''}" data-mode="register">Crear usuario</button>
            </div>
            <h2>${reg ? 'Crea tu usuario' : 'Bienvenido de nuevo'}</h2>
            <p class="muted small">${reg ? 'Elige un usuario y una contraseña. Entras de inmediato con una sesión nueva y limpia.' : 'Escribe tu usuario y contraseña para abrir tus landing pages.'}</p>
            ${notice ? `<div class="tip" style="padding:10px 12px"><div class="ico" style="width:30px;height:30px">${ic('info', 'sm')}</div><p class="small">${esc(notice)}</p></div>` : ''}
            <div class="field"><label for="lg-user">Usuario</label>
              <div class="input-ico">${ic('person')}<input class="input" id="lg-user" name="username" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="24" placeholder="Ej: laura.gomez" value="${esc(keepUser)}" required></div>
            </div>
            <div class="field"><label for="lg-pass">Contraseña</label>
              <div class="input-ico">${ic('lock')}<input class="input" id="lg-pass" name="password" type="password" autocomplete="${reg ? 'new-password' : 'current-password'}" placeholder="${reg ? 'Mínimo 4 caracteres' : 'Tu contraseña'}" required>
                <button type="button" class="icon-btn" id="lg-eye" aria-label="Mostrar u ocultar contraseña" style="position:absolute;right:2px;top:4px">${ic('visibility')}</button></div>
            </div>
            <label class="check small"><input type="checkbox" id="lg-keep"> Mantener mi sesión iniciada en este equipo <span class="muted">(no lo marques en equipos compartidos)</span></label>
            <div class="login-msg ${msg ? 'on' : ''}" id="lg-msg" role="alert">${msg ? ic('error', 'sm') + ' ' + esc(msg) : ''}</div>
            <button class="btn btn-primary btn-lg btn-block" type="submit" id="lg-go">${ic(reg ? 'person_add' : 'login')} ${reg ? 'Crear usuario y empezar' : 'Ingresar'}</button>
            <p class="small muted" style="text-align:center">${reg ? '¿Ya tienes usuario?' : '¿Primera vez aquí?'} <a href="#" data-mode="${reg ? 'login' : 'register'}">${reg ? 'Ingresa' : 'Crea tu usuario'}</a></p>
            <p class="tiny muted" style="text-align:center">Si olvidas la contraseña, crea un usuario nuevo e importa tu proyecto (.landing.json).</p>
          </form>
        </section>`;
        const user = el.querySelector('#lg-user');
        const pass = el.querySelector('#lg-pass');
        (keepUser ? pass : user).focus();
        el.querySelectorAll('[data-mode]').forEach((b) => b.addEventListener('click', (e) => {
          e.preventDefault();
          mode = b.dataset.mode; draw('', user.value);
        }));
        el.querySelector('#lg-eye').addEventListener('click', () => {
          const show = pass.type === 'password';
          pass.type = show ? 'text' : 'password';
          el.querySelector('#lg-eye .ms').textContent = show ? 'visibility_off' : 'visibility';
        });
        el.querySelector('#login-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const u = user.value.trim(); const p = pass.value;
          if (!u || !p) { draw(!u ? 'Escribe tu usuario.' : 'Escribe tu contraseña.', u); return; }
          const keep = el.querySelector('#lg-keep').checked;
          const r = reg ? SV.auth.register(u, p) : SV.auth.login(u, p);
          if (!r.ok) {
            if (r.code === 'no_user') mode = 'register';
            if (r.code === 'exists') mode = 'login';
            draw(r.error, u);
            return;
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
      document.title = 'SENA VENTAS LANDING PAGE · Creador de Landing Pages';
    }
  };
})(window.SV);
