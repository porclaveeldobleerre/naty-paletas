/* ======================
   ESTADO GLOBAL
====================== */
let insumos = JSON.parse(localStorage.getItem('insumos')) || [];
let filtroEstado = 'todos';
let textoBusqueda = '';

/* ======================
   UTILIDADES
====================== */
function guardarInsumos() {
  localStorage.setItem('insumos', JSON.stringify(insumos));
}

function obtenerEstado(stock, minimo) {
  if (stock <= minimo) {
    return { texto: 'Crítico', clase: 'critico', porcentaje: 20 };
  }
  if (stock <= minimo * 1.5) {
    return { texto: 'Atención', clase: 'alerta', porcentaje: 60 };
  }
  return { texto: 'Correcto', clase: 'ok', porcentaje: 100 };
}

/* ======================
   CONTADORES
====================== */
function contarEstados() {
  return {
    total: insumos.length,
    criticos: insumos.filter(i => obtenerEstado(i.stock, i.minimo).clase === 'critico').length,
    alerta: insumos.filter(i => obtenerEstado(i.stock, i.minimo).clase === 'alerta').length,
    ok: insumos.filter(i => obtenerEstado(i.stock, i.minimo).clase === 'ok').length
  };
}

function filtrarInsumos() {
  return insumos.filter(i => {
    const estado = obtenerEstado(i.stock, i.minimo).clase;
    const estadoOK = filtroEstado === 'todos' || estado === filtroEstado;
    const textoOK = i.nombre.toLowerCase().includes(textoBusqueda);
    return estadoOK && textoOK;
  });
}

/* ======================
   RENDER CARD
====================== */
function renderInsumoCard(i) {
  const estado = obtenerEstado(i.stock, i.minimo);

  return `
    <div class="insumo-card ${estado.clase}">
      <div class="top">
        <strong>${i.nombre}</strong>
        <span>${estado.texto}</span>
      </div>

      <div class="barra">
        <div style="width:${estado.porcentaje}%">${i.stock} ${i.unidad}</div>
      </div>

      <small>Mínimo requerido: ${i.minimo} ${i.unidad}</small>
    </div>
  `;
}

/* ======================
   RENDER PRINCIPAL
====================== */
function renderInsumos(panel) {
  const c = contarEstados();
  const lista = filtrarInsumos();

  panel.innerHTML = `
    <div class="section-header">
      <div>
        <h3>📦 Gestión de Insumos</h3>
        <small>Control de materias primas</small>
      </div>
      <button class="btn-primary" onclick="abrirModalInsumo()">➕ Agregar</button>
    </div>

    <div class="insumos-kpis">
      <div class="kpi-mini">📦 Total<br><b>${c.total}</b></div>
      <div class="kpi-mini critico">🔴 Críticos<br><b>${c.criticos}</b></div>
      <div class="kpi-mini alerta">🟡 Atención<br><b>${c.alerta}</b></div>
      <div class="kpi-mini ok">🟢 Correctos<br><b>${c.ok}</b></div>
    </div>

    <div class="filtros-bar">
      <div class="tabs-group">
        <button class="tab-btn ${filtroEstado==='todos'?'active':''}" onclick="setFiltro('todos')">Todos</button>
        <button class="tab-btn ${filtroEstado==='critico'?'active':''}" onclick="setFiltro('critico')">Críticos</button>
        <button class="tab-btn ${filtroEstado==='alerta'?'active':''}" onclick="setFiltro('alerta')">Atención</button>
        <button class="tab-btn ${filtroEstado==='ok'?'active':''}" onclick="setFiltro('ok')">Correctos</button>
      </div>

      <input
        class="buscador"
        placeholder="Buscar insumo..."
        oninput="buscarInsumo(this.value)"
      />
    </div>

    <div class="insumos-lista">
      ${lista.length ? lista.map(renderInsumoCard).join('') : '<p class="empty">No hay resultados</p>'}
    </div>

    ${renderModalInsumo()}
  `;
}

/* ======================
   FILTROS
====================== */
function setFiltro(f) {
  filtroEstado = f;
  renderInsumos(document.getElementById('panel'));
}

function buscarInsumo(txt) {
  textoBusqueda = txt.toLowerCase();
  renderInsumos(document.getElementById('panel'));
}

/* ======================
   MODAL
====================== */
function renderModalInsumo() {
  return `
    <div id="modalInsumo" class="modal hidden">
      <div class="modal-box">
        <h3>➕ Nuevo Insumo</h3>

        <input id="iNombre" placeholder="Nombre">
        <input id="iStock" type="number" placeholder="Stock">
        <input id="iMinimo" type="number" placeholder="Mínimo">
        <input id="iUnidad" placeholder="Unidad (kg, lt, pza)">

        <div class="acciones">
          <button onclick="cerrarModal()">Cancelar</button>
          <button class="btn-primary" onclick="guardarNuevoInsumo()">Guardar</button>
        </div>
      </div>
    </div>
  `;
}

function abrirModalInsumo() {
  document.getElementById('modalInsumo').classList.remove('hidden');
}

function cerrarModal() {
  document.getElementById('modalInsumo').classList.add('hidden');
}

function guardarNuevoInsumo() {
  const nombre = document.getElementById('iNombre').value;
  const stock = +document.getElementById('iStock').value;
  const minimo = +document.getElementById('iMinimo').value;
  const unidad = document.getElementById('iUnidad').value;

  if (!nombre || !unidad) return alert('Completa todos los campos');

  insumos.push({ nombre, stock, minimo, unidad });
  guardarInsumos();
  cerrarModal();
  renderInsumos(document.getElementById('panel'));
}

/* ======================
   EXPONE FUNCIÓN
====================== */
window.renderInsumos = renderInsumos;
