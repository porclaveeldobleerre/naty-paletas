(function() {
// ============================
// ESTADO LOCAL
// ============================
var _tabConfig = 'empresa';
var _notifs = JSON.parse(localStorage.getItem('notificaciones')) || {
  bajoStock: true, produccionDiaria: true, mermas: true, reportesSemanal: false
};

function _guardarNotifs() {
  localStorage.setItem('notificaciones', JSON.stringify(_notifs));
}

// ============================
// RENDER PRINCIPAL
// ============================
window.renderConfiguracion = function(container) {
  const p = container || document.getElementById('panel');
  p.innerHTML = `
    <div class="config-container">
      <div class="config-header">
        <div class="config-header-content">
          <div class="config-title">
            <div class="icon-box">⚙️</div>
            <h2>Configuración</h2>
          </div>
          <p>Ajustes generales, notificaciones y seguridad del sistema</p>
        </div>
        <div class="config-badge">🔄 Sistema</div>
      </div>
      <div class="config-tabs">
        ${_tabBtn('empresa','🏢 Empresa')}
        ${_tabBtn('notificaciones','🔔 Notificaciones')}
        ${_tabBtn('sistema','🗄️ Sistema')}
        ${_tabBtn('seguridad','🔐 Seguridad')}
      </div>
      <div class="config-content">
        ${_tabConfig === 'empresa'       ? _renderEmpresa() : ''}
        ${_tabConfig === 'notificaciones'? _renderNotifs()  : ''}
        ${_tabConfig === 'sistema'       ? _renderSistema() : ''}
        ${_tabConfig === 'seguridad'     ? _renderSeguridad(): ''}
      </div>
    </div>`;
};

function _tabBtn(id, label) {
  return `<button class="tab-btn ${_tabConfig===id?'active':''}" onclick="cambiarTabConfig('${id}')">${label}</button>`;
}

window.cambiarTabConfig = function(tab) {
  _tabConfig = tab;
  window.renderConfiguracion(document.getElementById('panel'));
};

// ============================
// SECCIONES
// ============================
function _renderEmpresa() {
  return `<div class="card"><h3>🏢 Información de la Empresa</h3>
    <div class="grid-2">
      <div><label>Nombre</label><input value="Productos Alimenticios S.A."></div>
      <div><label>RFC</label><input value="PAL123456ABC"></div>
      <div><label>Dirección</label><input value="Av. Principal #123"></div>
      <div><label>Teléfono</label><input value="+52 555 123 4567"></div>
      <div><label>Email</label><input value="contacto@empresa.com"></div>
      <div><label>Sitio Web</label><input value="www.empresa.com"></div>
    </div>
    <div class="actions">
      <button class="btn-outline">Cancelar</button>
      <button class="btn-primary" onclick="window.toast&&window.toast('Configuración guardada')">Guardar Cambios</button>
    </div></div>`;
}

function _renderNotifs() {
  function sw(key, label) {
    return `<div class="switch-row"><span>${label}</span>
      <input type="checkbox" ${_notifs[key]?'checked':''} onchange="_cfgNotif('${key}',this.checked)"></div>`;
  }
  return `<div class="card"><h3>🔔 Preferencias de Notificaciones</h3>
    ${sw('bajoStock','⚠️ Bajo Stock')}
    ${sw('produccionDiaria','📊 Producción Diaria')}
    ${sw('mermas','🗑️ Mermas')}
    ${sw('reportesSemanal','📧 Reporte Semanal')}
    <div class="actions">
      <button class="btn-primary" onclick="_cfgGuardarNotifs()">Guardar Preferencias</button>
    </div></div>`;
}

window._cfgNotif = function(key, val) { _notifs[key] = val; };
window._cfgGuardarNotifs = function() { _guardarNotifs(); window.toast&&window.toast('Notificaciones guardadas'); };

function _renderSistema() {
  return `<div class="card"><h3>🗄️ Configuración del Sistema</h3>
    <div class="grid-2">
      <div><label>Inicio de Semana</label><input value="Lunes"></div>
      <div><label>Días Laborales</label><input value="Lunes - Sábado"></div>
      <div><label>% Stock Mínimo</label><input type="number" value="50"></div>
      <div><label>% Merma Aceptable</label><input type="number" value="2"></div>
    </div>
    <button class="btn-outline">🗄️ Crear Respaldo</button></div>`;
}

function _renderSeguridad() {
  return `<div class="card"><h3>🔐 Seguridad</h3>
    <div class="switch-row"><span>🔐 Doble Factor</span><input type="checkbox"></div>
    <div class="switch-row"><span>⏰ Cierre Automático</span><input type="checkbox" checked></div>
    <h4 style="margin:16px 0 10px;font-size:0.95rem;">Cambiar Contraseña</h4>
    <input type="password" placeholder="Contraseña actual">
    <input type="password" placeholder="Nueva contraseña">
    <input type="password" placeholder="Confirmar contraseña">
    <div class="actions" style="margin-top:12px;">
      <button class="btn-primary" onclick="window.toast&&window.toast('Contraseña actualizada')">Actualizar</button>
    </div></div>`;
}

})();
