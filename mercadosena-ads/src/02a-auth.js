/* ============ Cuentas por estudiante ============
   Usuario y contraseña simples, sin correo ni verificación. Cada usuario tiene su propio
   espacio de datos en este navegador; una cuenta nueva siempre empieza desde cero.
   No es seguridad real: la contraseña solo separa el trabajo de cada estudiante. */
const USERS_KEY = 'mercadosena-ads-users-v1', SESSION_KEY = 'mercadosena-ads-session-v1';
const AUTH = { user: null, mode: 'crear' };
let memSession = null;
const userId = u => norm(u).replace(/\s+/g, ' ');
const passHash = (u, p) => hash(userId(u) + '|' + p).toString(36);
function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch (e) { return {}; } }
function putUsers(o) { try { localStorage.setItem(USERS_KEY, JSON.stringify(o)); return true; } catch (e) { return false; } }
function setSession(id) { memSession = id; try { id ? sessionStorage.setItem(SESSION_KEY, id) : sessionStorage.removeItem(SESSION_KEY); } catch (e) { } }
function getSession() { try { return sessionStorage.getItem(SESSION_KEY) || memSession; } catch (e) { return memSession; } }
function resetUiState() {
  if (UI.live) { clearInterval(UI.live); UI.live = null; }
  Object.assign(UI, { range: 'all', adsSort: 'clicks', adsQ: '', adsCamp: 'all', pending: {}, campQ: '', campF: 'all' });
  PD = null; RPT = null; CALC.spend = CALC.sales = CALC.margin = 0; ROASUI.id = null; render.last = null;
}
function enter(id, name, fresh) {
  AUTH.user = { id, name }; KEY = 'mercadosena-ads-v1:' + id; resetUiState(); load();
  if (fresh) { S = blank(); S.seller.name = name; save(); }
  setSession(id);
}
function restoreSession() {
  const id = getSession(); const u = id && getUsers()[id];
  if (u) enter(id, u.name, false);
}
function loginHTML() {
  const crear = AUTH.mode === 'crear';
  return `<main class="login"><div class="card login-card col gap16">
  <div class="login-logo">${$('#logo-src').innerHTML}</div>
  <div class="center"><h1 class="t-h2">${crear ? 'Crea tu cuenta' : 'Ingresa a tu cuenta'}</h1><p class="c-sec mt4">${crear ? 'Elige un usuario y una contraseña. Tu simulador empieza desde cero.' : 'Entra con tu usuario y contraseña para continuar tu trabajo.'}</p></div>
  <div class="seg" role="tablist"><button type="button" class="${crear ? 'on' : ''}" data-act="authMode" data-m="crear" role="tab" aria-selected="${crear}">Crear cuenta</button><button type="button" class="${crear ? '' : 'on'}" data-act="authMode" data-m="entrar" role="tab" aria-selected="${!crear}">Ingresar</button></div>
  <form id="authform" class="col gap12" autocomplete="on" novalidate>
    <div class="field"><label for="au-user">Usuario</label><input id="au-user" class="inp" name="username" autocomplete="username" autocapitalize="none" placeholder="Ej. maria.perez" maxlength="40"></div>
    <div class="field"><label for="au-pass">Contraseña</label><input id="au-pass" class="inp" type="password" name="password" autocomplete="${crear ? 'new-password' : 'current-password'}" placeholder="Mínimo 1 carácter" maxlength="60"></div>
    <label class="row gap8 t-sm c-var" style="cursor:pointer"><input type="checkbox" id="au-show" style="accent-color:#39a900"> Mostrar contraseña</label>
    <div id="autherr" class="err" role="alert"></div>
    <button class="btn pri blk" type="submit" style="min-height:48px">${ic(crear ? 'plusc' : 'arr', 's18')} ${crear ? 'Crear cuenta y empezar' : 'Ingresar'}</button>
  </form>
  <p class="hint center">Tu trabajo se guarda en este dispositivo, solo bajo tu usuario. Cada estudiante nuevo encuentra el simulador limpio.</p></div></main>`;
}
document.addEventListener('submit', e => { if (e.target.id === 'authform') { e.preventDefault(); ACT.authSubmit(); } });
document.addEventListener('change', e => { if (e.target.id === 'au-show') $('#au-pass').type = e.target.checked ? 'text' : 'password'; });
ACT.authMode = el => { AUTH.mode = el.dataset.m; render(); };
ACT.authSubmit = () => {
  const name = $('#au-user').value.trim().replace(/\s+/g, ' '), pass = $('#au-pass').value, id = userId(name), err = m => { $('#autherr').textContent = m; };
  if (!name) return err('Escribe un usuario.');
  if (!pass) return err('Escribe una contraseña.');
  const users = getUsers();
  if (AUTH.mode === 'crear') {
    if (users[id]) return err('Ese usuario ya existe. Elige otro nombre o ingresa con tu contraseña.');
    users[id] = { name, h: passHash(name, pass), created: Date.now() };
    if (!putUsers(users)) return err('No se pudo guardar la cuenta en este navegador.');
    enter(id, name, true); toast('Cuenta creada. Bienvenido, ' + name); location.hash = '#/inicio'; render();
  } else {
    if (!users[id]) return err('No existe ese usuario. Crea tu cuenta primero.');
    if (users[id].h !== passHash(name, pass)) return err('Contraseña incorrecta.');
    enter(id, users[id].name, false); toast('Hola de nuevo, ' + users[id].name); location.hash = '#/inicio'; render();
  }
};
ACT.logout = () => { save(); closeSheet(); if (UI.live) { clearInterval(UI.live); UI.live = null; } AUTH.user = null; AUTH.mode = 'entrar'; KEY = null; S = blank(); setSession(null); location.hash = '#/inicio'; render(); };
