/* ============ Arranque ============ */
load();
window.addEventListener('hashchange', () => { if (UI.live) { clearInterval(UI.live); UI.live = null; } render(); });
if (!location.hash) location.hash = '#/inicio'; else render();
