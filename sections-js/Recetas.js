// ============================
// ESTADO RECETAS (LocalStorage)
// ============================
let recetas = JSON.parse(localStorage.getItem('recetas')) || [
  {
    id: 1,
    nombre: 'Paleta de Fresa',
    sabor: 'Fresa',
    emoji: '🍓',
    costoLote: 850,
    unidades: 50,
    precioVenta: 25,
    ingredientes: [
      { nombre: 'Fresa', cantidad: '2 kg', costo: 130, emoji: '🍓' },
      { nombre: 'Azúcar', cantidad: '1.5 kg', costo: 27, emoji: '🍬' }
    ]
  }
];

function guardarRecetas() {
  localStorage.setItem('recetas', JSON.stringify(recetas));
}

// ============================
// UTILIDADES
// ============================
function calcularCostoUnitario(r) {
  return +(r.costoLote / r.unidades).toFixed(2);
}

function calcularRentabilidad(r) {
  return Math.round(((r.precioVenta - calcularCostoUnitario(r)) / r.precioVenta) * 100);
}

function obtenerEstado(rent) {
  if (rent >= 50) return { icon: '🟢', clase: 'ok', texto: 'Rentable' };
  if (rent >= 30) return { icon: '🟡', clase: 'alerta', texto: 'Ajustado' };
  return { icon: '🔴', clase: 'critico', texto: 'Caro' };
}

// ============================
// RENDER PRINCIPAL
// ============================
function renderRecetas(container) {
  const p = container || document.getElementById('panel');
  p.innerHTML = `
    <div class="section-header">
      <div>
        <h3>🍦 Recetas y Costeo</h3>
        <small>Gestión de recetas y análisis de rentabilidad</small>
      </div>
      <button class="btn-primary" onclick="abrirModalReceta()">➕ Nueva Receta</button>
    </div>

    <div class="recetas-lista">
      ${recetas.map(renderRecetaCard).join('')}
    </div>

    ${renderModalReceta()}
  `;
}

// ============================
// CARD RECETA
// ============================
function renderRecetaCard(r) {
  const costoUnit = calcularCostoUnitario(r);
  const rent = calcularRentabilidad(r);
  const estado = obtenerEstado(rent);

  return `
    <div class="receta-card ${estado.clase}">
      <div class="receta-top">
        <div>
          <h4>${r.emoji} ${r.nombre} <span>${estado.icon}</span></h4>
          <small>Sabor: ${r.sabor}</small>
        </div>
        <div class="acciones">
          <button onclick="verDetalleReceta(${r.id})">👁️</button>
          <button onclick="editarReceta(${r.id})">✏️</button>
          <button onclick="eliminarReceta(${r.id})">🗑️</button>
        </div>
      </div>

      <div class="receta-body">
        <p>Costo unitario: <b>$${costoUnit}</b></p>
        <p>Precio venta: <b>$${r.precioVenta}</b></p>

        <div class="barra">
          <div style="width:${rent}%">${rent}%</div>
        </div>

        <span class="badge ${estado.clase}">
          ${estado.icon} ${estado.texto}
        </span>
      </div>
    </div>
  `;
}

// ============================
// MODAL
// ============================
let editandoRecetaId = null;

function renderModalReceta() {
  return `
  <div id="modalReceta" class="modal hidden">
    <div class="modal-box">
      <div class="modal-header">
        <h3>${editandoRecetaId ? 'Editar' : 'Nueva'} Receta</h3>
        <button class="modal-close" onclick="cerrarModalReceta()">×</button>
      </div>

      <div class="modal-grid">
        <div class="field">
          <label>Nombre *</label>
          <input id="rNombre">
        </div>

        <div class="field">
          <label>Emoji</label>
          <input id="rEmoji" placeholder="🍦">
        </div>

        <div class="field">
          <label>Sabor</label>
          <input id="rSabor">
        </div>

        <div class="field">
          <label>Costo del Lote *</label>
          <input id="rCosto" type="number">
        </div>

        <div class="field">
          <label>Unidades *</label>
          <input id="rUnidades" type="number">
        </div>

        <div class="field">
          <label>Precio Venta *</label>
          <input id="rPrecio" type="number">
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-primary" onclick="guardarReceta()">Guardar</button>
        <button class="btn-secondary" onclick="cerrarModalReceta()">Cancelar</button>
      </div>
    </div>
  </div>
  `;
}

function abrirModalReceta() {
  editandoRecetaId = null;
  document.getElementById('modalReceta').classList.remove('hidden');
}

function cerrarModalReceta() {
  document.getElementById('modalReceta').classList.add('hidden');
}

// ============================
// CRUD
// ============================
function guardarReceta() {
  const nombre   = document.getElementById('rNombre').value;
  const sabor    = document.getElementById('rSabor').value;
  const emoji    = document.getElementById('rEmoji').value || '🍦';
  const costoLote  = +document.getElementById('rCosto').value;
  const unidades = +document.getElementById('rUnidades').value;
  const precioVenta = +document.getElementById('rPrecio').value;

  if (!nombre || !costoLote || !unidades || !precioVenta) {
    alert('Completa los campos obligatorios');
    return;
  }

  const data = { nombre, sabor, emoji, costoLote, unidades, precioVenta, ingredientes: [] };

  if (editandoRecetaId) {
    Object.assign(recetas.find(r => r.id === editandoRecetaId), data);
  } else {
    recetas.push({ id: Date.now(), ...data });
  }

  guardarRecetas();
  cerrarModalReceta();
  renderRecetas(document.getElementById('panel'));
}

function editarReceta(id) {
  editandoRecetaId = id;
  const r = recetas.find(x => x.id === id);
  abrirModalReceta();
  document.getElementById('rNombre').value   = r.nombre;
  document.getElementById('rSabor').value    = r.sabor;
  document.getElementById('rEmoji').value    = r.emoji;
  document.getElementById('rCosto').value    = r.costoLote;
  document.getElementById('rUnidades').value = r.unidades;
  document.getElementById('rPrecio').value   = r.precioVenta;
}

function eliminarReceta(id) {
  if (confirm('¿Eliminar receta?')) {
    recetas = recetas.filter(r => r.id !== id);
    guardarRecetas();
    renderRecetas(document.getElementById('panel'));
  }
}

window.renderRecetas = renderRecetas;
