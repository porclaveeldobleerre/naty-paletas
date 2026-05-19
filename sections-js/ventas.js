/* ============================
   ESTADO
============================ */
let ventas = JSON.parse(localStorage.getItem('ventas')) || [
  { id: 1, cliente: 'Tienda La Paloma',  fecha: '2026-01-13', items: [{sabor:'Chocolate',cantidad:50,precio:13.5}], estado:'pagado',  total: 675  },
  { id: 2, cliente: 'Mercado Central',   fecha: '2026-01-14', items: [{sabor:'Vainilla',cantidad:80,precio:12.0}],  estado:'pendiente',total: 960  },
  { id: 3, cliente: 'Distribuidora Norte',fecha:'2026-01-15', items: [{sabor:'Mango',cantidad:120,precio:14.0}],    estado:'pagado',  total: 1680 },
];

let tabVentas      = 'lista';
let modalVentaOpen = false;
let editVentaId    = null;

function guardarVentas() { localStorage.setItem('ventas', JSON.stringify(ventas)); }

/* ============================
   RENDER PRINCIPAL
============================ */
window.renderVentas = function(container) {
  const p = container || document.getElementById('panel');

  const totalVentas   = ventas.reduce((a, v) => a + v.total, 0);
  const pagadas       = ventas.filter(v => v.estado === 'pagado');
  const pendientes    = ventas.filter(v => v.estado === 'pendiente');
  const ingresosReales = pagadas.reduce((a, v) => a + v.total, 0);

  p.innerHTML = `
    <div class="section-header">
      <div><h3>Ventas y Pedidos</h3><small>Registro de ventas, clientes y cobros</small></div>
      <button class="btn-primary" onclick="abrirModalVenta()">
        <i class="fas fa-plus" style="margin-right:6px;"></i>Nueva Venta
      </button>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;">
      ${kpiVenta('fas fa-receipt','Total Ventas', ventas.length, '#3b82f6')}
      ${kpiVenta('fas fa-circle-check','Pagadas', pagadas.length, '#22c55e')}
      ${kpiVenta('fas fa-clock','Pendientes', pendientes.length, '#f59e0b')}
      ${kpiVenta('fas fa-peso-sign','Ingresos', '$' + ingresosReales.toLocaleString('es-MX'), '#a855f7')}
    </div>

    <div class="tabs" style="margin-bottom:16px;">
      <button class="tab ${tabVentas==='lista'?'active':''}" onclick="cambiarTabVentas('lista')">Todas las Ventas</button>
      <button class="tab ${tabVentas==='pendientes'?'active':''}" onclick="cambiarTabVentas('pendientes')">Pendientes de Cobro</button>
    </div>

    ${renderListaVentas()}
    ${renderModalVenta()}
  `;
};

function kpiVenta(icon, label, valor, color) {
  return `<div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-left:3px solid ${color};">
    <div style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
      <i class="${icon}" style="margin-right:5px;color:${color};"></i>${label}</div>
    <div style="font-size:1.5rem;font-weight:900;color:var(--text);">${valor}</div></div>`;
}

/* ============================
   LISTA
============================ */
function renderListaVentas() {
  const lista = tabVentas === 'pendientes'
    ? ventas.filter(v => v.estado === 'pendiente')
    : ventas;

  if (!lista.length) return `<div class="empty"><i class="fas fa-receipt" style="font-size:2rem;display:block;margin-bottom:8px;"></i>Sin ventas registradas</div>`;

  return `
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${lista.map(v => {
        const estadoColor = v.estado === 'pagado' ? '#22c55e' : v.estado === 'cancelado' ? '#ef4444' : '#f59e0b';
        const estadoLabel = v.estado === 'pagado' ? 'Pagado' : v.estado === 'cancelado' ? 'Cancelado' : 'Pendiente';
        return `
          <div style="background:var(--surface);border-radius:14px;padding:18px;border:1px solid var(--border);
            display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;
            transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow=''">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#3b82f6,#a855f7);
                display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:0.85rem;flex-shrink:0;">
                #${v.id}
              </div>
              <div>
                <div style="font-weight:800;font-size:0.95rem;color:var(--text);">${v.cliente}</div>
                <div style="font-size:0.78rem;color:var(--text3);margin-top:2px;">
                  ${v.fecha} · ${v.items.map(i => `${i.cantidad} ${i.sabor}`).join(', ')}
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="text-align:right;">
                <div style="font-size:1.1rem;font-weight:900;color:var(--text);">$${v.total.toLocaleString('es-MX')}</div>
                <span style="background:${estadoColor}18;color:${estadoColor};padding:2px 9px;border-radius:999px;font-size:0.7rem;font-weight:700;">${estadoLabel}</span>
              </div>
              <div style="display:flex;gap:6px;">
                ${v.estado === 'pendiente' ? `
                  <button onclick="marcarPagada(${v.id})" title="Marcar como pagada"
                    style="background:rgba(34,197,94,0.1);color:#22c55e;border:none;border-radius:7px;padding:6px 10px;cursor:pointer;font-size:0.8rem;font-weight:700;">
                    <i class="fas fa-check"></i>
                  </button>` : ''}
                <button onclick="editarVenta(${v.id})" title="Editar"
                  style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:6px 10px;cursor:pointer;color:var(--text2);font-size:0.8rem;">
                  <i class="fas fa-pen"></i>
                </button>
                <button onclick="eliminarVenta(${v.id})" title="Eliminar"
                  style="background:var(--surface2);border:1px solid var(--border);border-radius:7px;padding:6px 10px;cursor:pointer;color:#ef4444;font-size:0.8rem;">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

/* ============================
   MODAL
============================ */
function renderModalVenta() {
  const v = editVentaId ? ventas.find(x => x.id === editVentaId) : null;
  return `
    <div id="modalVenta" class="modal ${modalVentaOpen?'':'hidden'}">
      <div class="modal-box" style="max-width:460px;">
        <div class="modal-header">
          <h3>${v ? 'Editar Venta' : 'Nueva Venta'}</h3>
          <button class="modal-close" onclick="cerrarModalVenta()"><i class="fas fa-xmark"></i></button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;">
          <div>
            <label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Cliente</label>
            <input id="vCliente" placeholder="Nombre del cliente o negocio" value="${v?.cliente||''}">
          </div>
          <div>
            <label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Fecha</label>
            <input id="vFecha" type="date" value="${v?.fecha||new Date().toISOString().split('T')[0]}">
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Sabor</label>
              <input id="vSabor" placeholder="Chocolate..." value="${v?.items[0]?.sabor||''}">
            </div>
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Cantidad</label>
              <input id="vCantidad" type="number" min="1" placeholder="0" value="${v?.items[0]?.cantidad||''}">
            </div>
            <div>
              <label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Precio/pza</label>
              <input id="vPrecio" type="number" step="0.01" placeholder="0.00" value="${v?.items[0]?.precio||''}">
            </div>
          </div>
          <div>
            <label style="font-size:0.72rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:4px;">Estado</label>
            <select id="vEstado" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);
              background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;">
              <option value="pendiente" ${v?.estado==='pendiente'?'selected':''}>Pendiente</option>
              <option value="pagado"    ${v?.estado==='pagado'?'selected':''}>Pagado</option>
              <option value="cancelado" ${v?.estado==='cancelado'?'selected':''}>Cancelado</option>
            </select>
          </div>
        </div>
        <p id="msgVenta" style="margin-top:10px;font-size:0.82rem;text-align:center;min-height:18px;"></p>
        <div class="modal-actions" style="margin-top:14px;">
          <button class="btn-outline" onclick="cerrarModalVenta()">Cancelar</button>
          <button class="btn-primary" onclick="guardarVenta()">${v ? 'Guardar cambios' : 'Registrar venta'}</button>
        </div>
      </div>
    </div>`;
}

/* ============================
   ACCIONES
============================ */
function abrirModalVenta()  { editVentaId = null; modalVentaOpen = true; window.renderVentas(document.getElementById('panel')); }
function cerrarModalVenta() { editVentaId = null; modalVentaOpen = false; window.renderVentas(document.getElementById('panel')); }
function editarVenta(id)    { editVentaId = id; modalVentaOpen = true; window.renderVentas(document.getElementById('panel')); }

function guardarVenta() {
  const cliente  = document.getElementById('vCliente').value.trim();
  const fecha    = document.getElementById('vFecha').value;
  const sabor    = document.getElementById('vSabor').value.trim();
  const cantidad = parseFloat(document.getElementById('vCantidad').value);
  const precio   = parseFloat(document.getElementById('vPrecio').value);
  const estado   = document.getElementById('vEstado').value;
  const msg      = document.getElementById('msgVenta');

  if (!cliente || !fecha || !sabor || !cantidad || !precio) {
    msg.style.color = '#ef4444'; msg.textContent = 'Completa todos los campos.'; return;
  }

  const total = cantidad * precio;
  const item  = { sabor, cantidad, precio };

  if (editVentaId) {
    const idx = ventas.findIndex(v => v.id === editVentaId);
    ventas[idx] = { ...ventas[idx], cliente, fecha, items: [item], estado, total };
    if (typeof window.toast === 'function') window.toast('Venta actualizada');
  } else {
    ventas.unshift({ id: Date.now(), cliente, fecha, items: [item], estado, total });
    if (typeof window.toast === 'function') window.toast('Venta registrada');
  }

  guardarVentas();
  cerrarModalVenta();
}

function marcarPagada(id) {
  const v = ventas.find(x => x.id === id);
  if (v) { v.estado = 'pagado'; guardarVentas(); window.renderVentas(document.getElementById('panel')); }
  if (typeof window.toast === 'function') window.toast('Venta marcada como pagada');
}

function eliminarVenta(id) {
  if (!confirm('¿Eliminar esta venta?')) return;
  ventas = ventas.filter(v => v.id !== id);
  guardarVentas();
  window.renderVentas(document.getElementById('panel'));
  if (typeof window.toast === 'function') window.toast('Venta eliminada');
}

function cambiarTabVentas(tab) { tabVentas = tab; window.renderVentas(document.getElementById('panel')); }

window.cambiarTabVentas = cambiarTabVentas;
window.abrirModalVenta  = abrirModalVenta;
window.cerrarModalVenta = cerrarModalVenta;
window.editarVenta      = editarVenta;
window.guardarVenta     = guardarVenta;
window.marcarPagada     = marcarPagada;
window.eliminarVenta    = eliminarVenta;
