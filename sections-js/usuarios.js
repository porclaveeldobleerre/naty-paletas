/* ============================
   USUARIOS - sin conflicto de nombres globales
============================ */
(function() {

let _usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
  { id:1, nombre:'Administrador', email:'admin@paleteria.com',         password:'admin123', rol:'admin',   activo:true, creado:'2026-01-01' },
  { id:2, nombre:'Operador',      email:'usuario@paleteria.com',       password:'user123',  rol:'usuario', activo:true, creado:'2026-01-05' },
  { id:3, nombre:'Hernán',        email:'vazqueshernan357@gmail.com',  password:'123456',   rol:'usuario', activo:true, creado:'2026-01-10' },
];

let _bitacora           = JSON.parse(localStorage.getItem('bitacora')) || [];
let _tabUsuarios        = 'lista';
let _modalUsuarioOpen   = false;
let _editandoId         = null;

function _guardar()   { localStorage.setItem('usuarios', JSON.stringify(_usuarios)); }
function _guardarBit(){ localStorage.setItem('bitacora', JSON.stringify(_bitacora)); }

function _registrar(accion, detalle) {
  const email = localStorage.getItem('userEmail') || 'sistema';
  _bitacora.unshift({ id:Date.now(), fecha:new Date().toLocaleString('es-MX'), usuario:email, accion, detalle });
  if (_bitacora.length > 100) _bitacora = _bitacora.slice(0,100);
  _guardarBit();
}

function _kpi(icon, label, valor, color) {
  return `<div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-left:3px solid ${color};">
    <div style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
      <i class="${icon}" style="margin-right:5px;color:${color};"></i>${label}</div>
    <div style="font-size:1.6rem;font-weight:900;color:var(--text);">${valor}</div></div>`;
}

function _renderLista() {
  return `<div style="background:var(--surface);border-radius:14px;border:1px solid var(--border);overflow:hidden;">
    <table class="tabla" style="margin:0;">
      <thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Creado</th><th>Acciones</th></tr></thead>
      <tbody>
        ${_usuarios.map(u => `<tr>
          <td><div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:8px;
              background:${u.rol==='admin'?'linear-gradient(135deg,#ec4899,#a855f7)':'linear-gradient(135deg,#3b82f6,#06b6d4)'};
              display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.8rem;flex-shrink:0;">
              ${u.nombre[0].toUpperCase()}</div>
            <span style="font-weight:700;color:var(--text);">${u.nombre}</span>
          </div></td>
          <td style="color:var(--text2);font-size:0.85rem;">${u.email}</td>
          <td><span style="background:${u.rol==='admin'?'rgba(168,85,247,0.1)':'rgba(59,130,246,0.1)'};
            color:${u.rol==='admin'?'#a855f7':'#3b82f6'};padding:3px 10px;border-radius:999px;font-size:0.72rem;font-weight:700;">
            ${u.rol==='admin'?'Admin':'Usuario'}</span></td>
          <td><span style="background:${u.activo?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)'};
            color:${u.activo?'#22c55e':'#ef4444'};padding:3px 10px;border-radius:999px;font-size:0.72rem;font-weight:700;">
            ${u.activo?'Activo':'Inactivo'}</span></td>
          <td style="color:var(--text3);font-size:0.82rem;">${u.creado}</td>
          <td><div style="display:flex;gap:6px;">
            <button onclick="editarUsuario(${u.id})" style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:5px 9px;cursor:pointer;color:var(--text2);font-size:0.8rem;"><i class="fas fa-pen"></i></button>
            <button onclick="toggleActivoUsuario(${u.id})" style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:5px 9px;cursor:pointer;color:${u.activo?'#f59e0b':'#22c55e'};font-size:0.8rem;"><i class="fas fa-${u.activo?'ban':'circle-check'}"></i></button>
            <button onclick="eliminarUsuario(${u.id})" style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:5px 9px;cursor:pointer;color:#ef4444;font-size:0.8rem;"><i class="fas fa-trash"></i></button>
          </div></td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;
}

function _renderBitacora() {
  if (!_bitacora.length) return `<div class="empty"><i class="fas fa-clock-rotate-left" style="font-size:2rem;display:block;margin-bottom:8px;"></i>Sin registros</div>`;
  return `<div style="background:var(--surface);border-radius:14px;border:1px solid var(--border);overflow:hidden;">
    <table class="tabla" style="margin:0;">
      <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead>
      <tbody>${_bitacora.slice(0,30).map(b => `<tr>
        <td style="color:var(--text3);font-size:0.78rem;white-space:nowrap;">${b.fecha}</td>
        <td style="font-weight:600;font-size:0.85rem;">${b.usuario}</td>
        <td><span style="background:rgba(168,85,247,0.1);color:#a855f7;padding:2px 9px;border-radius:999px;font-size:0.72rem;font-weight:700;">${b.accion}</span></td>
        <td style="color:var(--text2);font-size:0.83rem;">${b.detalle}</td>
      </tr>`).join('')}</tbody>
    </table></div>`;
}

function _renderModal() {
  const u = _editandoId ? _usuarios.find(x => x.id === _editandoId) : null;
  return `<div id="modalUsuario" class="modal ${_modalUsuarioOpen?'':'hidden'}">
    <div class="modal-box" style="max-width:420px;">
      <div class="modal-header">
        <h3>${u?'Editar Usuario':'Nuevo Usuario'}</h3>
        <button class="modal-close" onclick="cerrarModalUsuario()"><i class="fas fa-xmark"></i></button>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div><label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Nombre</label>
          <input id="uNombre" placeholder="Nombre completo" value="${u?.nombre||''}"></div>
        <div><label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Correo</label>
          <input id="uEmail" type="email" placeholder="correo@empresa.com" value="${u?.email||''}"></div>
        <div><label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Contraseña ${u?'(vacío = sin cambio)':''}</label>
          <input id="uPassword" type="password" placeholder="••••••••"></div>
        <div><label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Rol</label>
          <select id="uRol" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;">
            <option value="usuario" ${u?.rol==='usuario'?'selected':''}>Usuario</option>
            <option value="admin"   ${u?.rol==='admin'?'selected':''}>Administrador</option>
          </select></div>
      </div>
      <p id="msgUsuario" style="margin-top:10px;font-size:0.82rem;text-align:center;min-height:18px;"></p>
      <div class="modal-actions" style="margin-top:14px;">
        <button class="btn-outline" onclick="cerrarModalUsuario()">Cancelar</button>
        <button class="btn-primary" onclick="guardarUsuario()">${u?'Guardar cambios':'Crear usuario'}</button>
      </div>
    </div></div>`;
}

window.renderUsuarios = function(container) {
  const p = container || document.getElementById('panel');
  p.innerHTML = `
    <div class="section-header">
      <div><h3>Gestión de Usuarios</h3><small>Administra accesos, roles y permisos</small></div>
      <button class="btn-primary" onclick="abrirModalUsuario()"><i class="fas fa-plus" style="margin-right:6px;"></i>Nuevo Usuario</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
      ${_kpi('fas fa-users','Total Usuarios',_usuarios.length,'#3b82f6')}
      ${_kpi('fas fa-shield-halved','Administradores',_usuarios.filter(u=>u.rol==='admin').length,'#a855f7')}
      ${_kpi('fas fa-circle-check','Activos',_usuarios.filter(u=>u.activo).length,'#22c55e')}
      ${_kpi('fas fa-circle-xmark','Inactivos',_usuarios.filter(u=>!u.activo).length,'#ef4444')}
    </div>
    <div class="tabs" style="margin-bottom:16px;">
      <button class="tab ${_tabUsuarios==='lista'?'active':''}" onclick="cambiarTabUsuarios('lista')">Lista de Usuarios</button>
      <button class="tab ${_tabUsuarios==='bitacora'?'active':''}" onclick="cambiarTabUsuarios('bitacora')">Bitácora de Accesos</button>
    </div>
    ${_tabUsuarios==='lista' ? _renderLista() : _renderBitacora()}
    ${_renderModal()}`;
};

window.abrirModalUsuario   = function() { _editandoId=null; _modalUsuarioOpen=true; window.renderUsuarios(document.getElementById('panel')); };
window.cerrarModalUsuario  = function() { _editandoId=null; _modalUsuarioOpen=false; window.renderUsuarios(document.getElementById('panel')); };
window.editarUsuario       = function(id) { _editandoId=id; _modalUsuarioOpen=true; window.renderUsuarios(document.getElementById('panel')); };
window.cambiarTabUsuarios  = function(tab) { _tabUsuarios=tab; window.renderUsuarios(document.getElementById('panel')); };

window.guardarUsuario = function() {
  const nombre=document.getElementById('uNombre').value.trim();
  const email=document.getElementById('uEmail').value.trim();
  const password=document.getElementById('uPassword').value;
  const rol=document.getElementById('uRol').value;
  const msg=document.getElementById('msgUsuario');
  if (!nombre||!email) { msg.style.color='#ef4444'; msg.textContent='Nombre y correo son obligatorios.'; return; }
  if (_editandoId) {
    const idx=_usuarios.findIndex(u=>u.id===_editandoId);
    Object.assign(_usuarios[idx],{nombre,email,rol});
    if (password) _usuarios[idx].password=password;
    _registrar('Edición',`Usuario "${nombre}" modificado`);
    window.toast?.('Usuario actualizado');
  } else {
    if (_usuarios.find(u=>u.email===email)) { msg.style.color='#ef4444'; msg.textContent='Correo ya registrado.'; return; }
    if (!password) { msg.style.color='#ef4444'; msg.textContent='Contraseña obligatoria.'; return; }
    _usuarios.push({id:Date.now(),nombre,email,password,rol,activo:true,creado:new Date().toLocaleDateString('es-MX')});
    _registrar('Creación',`Nuevo usuario "${nombre}" (${rol})`);
    window.toast?.('Usuario creado');
  }
  _guardar(); window.cerrarModalUsuario();
};

window.toggleActivoUsuario = function(id) {
  const u=_usuarios.find(x=>x.id===id); if(!u) return;
  u.activo=!u.activo; _guardar();
  _registrar(u.activo?'Activación':'Desactivación',`Usuario "${u.nombre}"`);
  window.toast?.(`Usuario ${u.activo?'activado':'desactivado'}`);
  window.renderUsuarios(document.getElementById('panel'));
};

window.eliminarUsuario = function(id) {
  const u=_usuarios.find(x=>x.id===id); if(!u) return;
  if (!confirm(`¿Eliminar a "${u.nombre}"?`)) return;
  _usuarios=_usuarios.filter(x=>x.id!==id); _guardar();
  _registrar('Eliminación',`Usuario "${u.nombre}" eliminado`);
  window.toast?.('Usuario eliminado');
  window.renderUsuarios(document.getElementById('panel'));
};

})(); // fin IIFE
