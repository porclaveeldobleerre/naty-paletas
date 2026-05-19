/* ============================
   ESTADO
============================ */
let proveedores = JSON.parse(localStorage.getItem('proveedores')) || [
  { id: 1, nombre: 'Lácteos del Norte',   contacto: 'Juan Pérez',    telefono: '555-100-2000', email: 'ventas@lacteosn.com',  categoria: 'Lácteos',    activo: true },
  { id: 2, nombre: 'Frutas Selectas SA',  contacto: 'María López',   telefono: '555-200-3000', email: 'pedidos@frutass.com',  categoria: 'Frutas',     activo: true },
  { id: 3, nombre: 'Azúcar y Más',        contacto: 'Carlos Ruiz',   telefono: '555-300-4000', email: 'info@azucarymas.com',  categoria: 'Endulzantes',activo: true },
  { id: 4, nombre: 'Empaques Modernos',   contacto: 'Ana Torres',    telefono: '555-400-5000', email: 'ventas@empaques.com',  categoria: 'Empaques',   activo: false },
];

let modalProvOpen = false;
let editProvId    = null;
let busqProv      = '';

function guardarProveedores() { localStorage.setItem('proveedores', JSON.stringify(proveedores)); }

const CATEGORIAS = ['Lácteos','Frutas','Endulzantes','Empaques','Colorantes','Otros'];
const CAT_COLORS = { Lácteos:'#3b82f6', Frutas:'#f97316', Endulzantes:'#f59e0b', Empaques:'#6b7280', Colorantes:'#a855f7', Otros:'#22c55e' };

/* ============================
   RENDER PRINCIPAL
============================ */
window.renderProveedores = function(container) {
  const p = container || document.getElementById('panel');
  const activos   = proveedores.filter(x => x.activo).length;
  const lista     = proveedores.filter(x => x.nombre.toLowerCase().includes(busqProv) || x.categoria.toLowerCase().includes(busqProv));

  p.innerHTML = `
    <div class="section-header">
      <div><h3>Proveedores</h3><small>Catálogo de proveedores y contactos</small></div>
      <button class="btn-primary" onclick="abrirModalProv()">
        <i class="fas fa-plus" style="margin-right:6px;"></i>Nuevo Proveedor
      </button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px;">
      ${kpiProv('fas fa-truck','Total', proveedores.length, '#3b82f6')}
      ${kpiProv('fas fa-circle-check','Activos', activos, '#22c55e')}
      ${kpiProv('fas fa-circle-xmark','Inactivos', proveedores.length - activos, '#ef4444')}
      ${kpiProv('fas fa-tags','Categorías', CATEGORIAS.length, '#a855f7')}
    </div>

    <!-- Buscador -->
    <div style="margin-bottom:16px;">
      <input class="buscador" placeholder="Buscar proveedor o categoría..."
        oninput="busqProv=this.value.toLowerCase();window.renderProveedores(document.getElementById('panel'))"
        value="${busqProv}" style="max-width:320px;">
    </div>

    <!-- Grid proveedores -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
      ${lista.length ? lista.map(renderCardProv).join('') : '<div class="empty">Sin resultados</div>'}
    </div>

    ${renderModalProv()}
  `;
};

function kpiProv(icon, label, valor, color) {
  return `<div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-left:3px solid ${color};">
    <div style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
      <i class="${icon}" style="margin-right:5px;color:${color};"></i>${label}</div>
    <div style="font-size:1.5rem;font-weight:900;color:var(--text);">${valor}</div></div>`;
}

function renderCardProv(p) {
  const color = CAT_COLORS[p.categoria] || '#6b7280';
  return `
    <div style="background:var(--surface);border-radius:14px;padding:18px;border:1px solid var(--border);
      border-top:3px solid ${color};transition:box-shadow 0.2s;opacity:${p.activo?1:0.6};"
      onmouseover="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow=''">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:38px;height:38px;border-radius:10px;background:${color}18;
            display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">
            ${p.categoria==='Lácteos'?'🥛':p.categoria==='Frutas'?'🍓':p.categoria==='Endulzantes'?'🍬':p.categoria==='Empaques'?'📦':'🏷️'}
          </div>
          <div>
            <div style="font-weight:800;font-size:0.92rem;color:var(--text);">${p.nombre}</div>
            <span style="background:${color}18;color:${color};padding:2px 8px;border-radius:999px;font-size:0.68rem;font-weight:700;">${p.categoria}</span>
          </div>
        </div>
        <span style="background:${p.activo?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)'};
          color:${p.activo?'#22c55e':'#ef4444'};padding:2px 8px;border-radius:999px;font-size:0.68rem;font-weight:700;">
          ${p.activo?'Activo':'Inactivo'}
        </span>
      </div>
      <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:14px;">
        <div style="font-size:0.8rem;color:var(--text2);display:flex;align-items:center;gap:6px;">
          <i class="fas fa-user" style="width:14px;color:var(--text3);"></i>${p.contacto}
        </div>
        <div style="font-size:0.8rem;color:var(--text2);display:flex;align-items:center;gap:6px;">
          <i class="fas fa-phone" style="width:14px;color:var(--text3);"></i>${p.telefono}
        </div>
        <div style="font-size:0.8rem;color:var(--text2);display:flex;align-items:center;gap:6px;">
          <i class="fas fa-envelope" style="width:14px;color:var(--text3);"></i>${p.email}
        </div>
      </div>
      <div style="display:flex;gap:6px;justify-content:flex-end;">
        <button onclick="editarProv(${p.id})"
          style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:5px 10px;cursor:pointer;color:var(--text2);font-size:0.8rem;transition:all 0.15s;"
          onmouseover="this.style.borderColor='#a855f7';this.style.color='#a855f7'"
          onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text2)'">
          <i class="fas fa-pen"></i> Editar
        </button>
        <button onclick="toggleActivoProv(${p.id})"
          style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:5px 10px;cursor:pointer;
            color:${p.activo?'#f59e0b':'#22c55e'};font-size:0.8rem;">
          <i class="fas fa-${p.activo?'ban':'circle-check'}"></i>
        </button>
        <button onclick="eliminarProv(${p.id})"
          style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:5px 10px;cursor:pointer;color:#ef4444;font-size:0.8rem;">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>`;
}

/* ============================
   MODAL
============================ */
function renderModalProv() {
  const pv = editProvId ? proveedores.find(x => x.id === editProvId) : null;
  const opsCat = CATEGORIAS.map(c => `<option value="${c}" ${pv?.categoria===c?'selected':''}>${c}</option>`).join('');
  return `
    <div id="modalProv" class="modal ${modalProvOpen?'':'hidden'}">
      <div class="modal-box" style="max-width:440px;">
        <div class="modal-header">
          <h3>${pv ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
          <button class="modal-close" onclick="cerrarModalProv()"><i class="fas fa-xmark"></i></button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${campo('pNombre','Empresa / Nombre',pv?.nombre||'','text','Nombre del proveedor')}
          ${campo('pContacto','Contacto',pv?.contacto||'','text','Nombre del contacto')}
          ${campo('pTelefono','Teléfono',pv?.telefono||'','tel','555-000-0000')}
          ${campo('pEmail','Correo',pv?.email||'','email','correo@proveedor.com')}
          <div>
            <label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Categoría</label>
            <select id="pCategoria" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);
              background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;">${opsCat}</select>
          </div>
        </div>
        <p id="msgProv" style="margin-top:10px;font-size:0.82rem;text-align:center;min-height:18px;"></p>
        <div class="modal-actions" style="margin-top:14px;">
          <button class="btn-outline" onclick="cerrarModalProv()">Cancelar</button>
          <button class="btn-primary" onclick="guardarProv()">${pv ? 'Guardar cambios' : 'Agregar proveedor'}</button>
        </div>
      </div>
    </div>`;
}

function campo(id, label, val, type, ph) {
  return `<div>
    <label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">${label}</label>
    <input id="${id}" type="${type}" placeholder="${ph}" value="${val}">
  </div>`;
}

/* ============================
   ACCIONES
============================ */
function abrirModalProv()  { editProvId = null; modalProvOpen = true; window.renderProveedores(document.getElementById('panel')); }
function cerrarModalProv() { editProvId = null; modalProvOpen = false; window.renderProveedores(document.getElementById('panel')); }
function editarProv(id)    { editProvId = id; modalProvOpen = true; window.renderProveedores(document.getElementById('panel')); }

function guardarProv() {
  const nombre    = document.getElementById('pNombre').value.trim();
  const contacto  = document.getElementById('pContacto').value.trim();
  const telefono  = document.getElementById('pTelefono').value.trim();
  const email     = document.getElementById('pEmail').value.trim();
  const categoria = document.getElementById('pCategoria').value;
  const msg       = document.getElementById('msgProv');

  if (!nombre || !contacto) { msg.style.color='#ef4444'; msg.textContent='Nombre y contacto son obligatorios.'; return; }

  if (editProvId) {
    const idx = proveedores.findIndex(p => p.id === editProvId);
    proveedores[idx] = { ...proveedores[idx], nombre, contacto, telefono, email, categoria };
    if (typeof window.toast === 'function') window.toast('Proveedor actualizado');
  } else {
    proveedores.push({ id: Date.now(), nombre, contacto, telefono, email, categoria, activo: true });
    if (typeof window.toast === 'function') window.toast('Proveedor agregado');
  }

  guardarProveedores();
  cerrarModalProv();
}

function toggleActivoProv(id) {
  const p = proveedores.find(x => x.id === id);
  if (!p) return;
  p.activo = !p.activo;
  guardarProveedores();
  window.renderProveedores(document.getElementById('panel'));
  if (typeof window.toast === 'function') window.toast(`Proveedor ${p.activo ? 'activado' : 'desactivado'}`);
}

function eliminarProv(id) {
  if (!confirm('¿Eliminar este proveedor?')) return;
  proveedores = proveedores.filter(p => p.id !== id);
  guardarProveedores();
  window.renderProveedores(document.getElementById('panel'));
  if (typeof window.toast === 'function') window.toast('Proveedor eliminado');
}

window.abrirModalProv    = abrirModalProv;
window.cerrarModalProv   = cerrarModalProv;
window.editarProv        = editarProv;
window.guardarProv       = guardarProv;
window.toggleActivoProv  = toggleActivoProv;
window.eliminarProv      = eliminarProv;
