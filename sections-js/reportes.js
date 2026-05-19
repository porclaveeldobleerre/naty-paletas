// ============================
// ESTADO REPORTES
// ============================
let reportes = JSON.parse(localStorage.getItem('reportes')) || [
  {
    id: 1,
    semana: 'Semana 1',
    produccionTotal: 1200,
    costoTotal: 8200,
    ingresoTotal: 13500,
    sabores: [
      { nombre: 'Fresa',     produccion: 400, costo: 2600 },
      { nombre: 'Chocolate', produccion: 300, costo: 2100 },
      { nombre: 'Vainilla',  produccion: 500, costo: 3500 }
    ]
  }
];

let tabActiva = 'resumen';

function guardarReportes() {
  localStorage.setItem('reportes', JSON.stringify(reportes));
}

// ============================
// UTILIDADES
// ============================
function calcularMargen(ingreso, costo) {
  if (!ingreso) return 0;
  return Math.round(((ingreso - costo) / ingreso) * 100);
}

function badgeMargen(margen) {
  if (margen < 30) return '<span class="badge critico">🔴 Riesgo</span>';
  if (margen < 45) return '<span class="badge alerta">🟡 Normal</span>';
  return '<span class="badge ok">🟢 Excelente</span>';
}

// ============================
// RENDER PRINCIPAL
// ============================
function renderReportes(container) {
  const p = container || document.getElementById('panel');
  const r = reportes[0];
  const margen = calcularMargen(r.ingresoTotal, r.costoTotal);

  p.innerHTML =
    '<div class="section-header">' +
      '<div><h3>📊 Reportes Semanales</h3><small>Análisis de producción y costos</small></div>' +
      '<button class="btn-primary" onclick="exportarReporte()">📤 Exportar</button>' +
    '</div>' +
    renderFiltros() +
    '<div class="kpis">' +
      renderKPI('Producción Total', r.produccionTotal + ' pzas', '📦', 'produccion') +
      renderKPI('Costo Total', '$' + r.costoTotal, '💸', 'costos') +
      renderKPI('Ingresos', '$' + r.ingresoTotal, '💰', 'ingresos') +
      renderKPI('Margen', margen + '%', '📈', 'comparativo') +
    '</div>' +
    '<div class="tabs">' +
      renderTab('resumen', 'Resumen') +
      renderTab('produccion', 'Producción') +
      renderTab('costos', 'Costos') +
      renderTab('comparativo', 'Comparativo') +
    '</div>' +
    '<div class="tab-content">' +
      renderTabContenido(r) +
    '</div>';
}

// ============================
// FILTROS
// ============================
function renderFiltros() {
  return '<div class="filtros">' +
    '<input placeholder="Semana">' +
    '<input type="date">' +
    '<input type="date">' +
    '<button class="btn-secondary">Aplicar</button>' +
  '</div>';
}

// ============================
// KPIs
// ============================
function renderKPI(titulo, valor, icono, tab) {
  return '<div class="kpi-card" onclick="cambiarTab(\'' + tab + '\')">' +
    '<span>' + icono + '</span>' +
    '<h4>' + valor + '</h4>' +
    '<small>' + titulo + '</small>' +
  '</div>';
}

// ============================
// TABS
// ============================
function renderTab(id, label) {
  var cls = tabActiva === id ? 'tab active' : 'tab';
  return '<button class="' + cls + '" onclick="cambiarTab(\'' + id + '\')">' + label + '</button>';
}

function cambiarTab(tab) {
  tabActiva = tab;
  renderReportes(document.getElementById('panel'));
}
window.cambiarTab = cambiarTab;

// ============================
// CONTENIDO TABS
// ============================
function renderTabContenido(r) {
  if (tabActiva === 'resumen')    return renderResumen(r);
  if (tabActiva === 'produccion') return renderTabProduccion(r);
  if (tabActiva === 'costos')     return renderCostos(r);
  return renderComparativo(r);
}

// ============================
// RESUMEN
// ============================
function renderResumen(r) {
  var margen = calcularMargen(r.ingresoTotal, r.costoTotal);
  var alerta = margen < 30
    ? '<div class="alerta-box">⚠️ Margen bajo, revisa costos de insumos.</div>'
    : '';
  return '<div class="card">' +
    '<h4>📌 Resumen Ejecutivo</h4>' +
    '<p>Producción total: <b>' + r.produccionTotal + '</b> pzas</p>' +
    '<p>Costo total: <b>$' + r.costoTotal + '</b></p>' +
    '<p>Ingreso total: <b>$' + r.ingresoTotal + '</b></p>' +
    '<p>Margen: <b>' + margen + '%</b> ' + badgeMargen(margen) + '</p>' +
    alerta +
  '</div>';
}

// ============================
// PRODUCCIÓN TAB
// ============================
function renderTabProduccion(r) {
  var filas = r.sabores.map(function(s) {
    return '<tr><td>' + s.nombre + '</td><td>' + s.produccion + '</td><td>' + renderMenuAcciones() + '</td></tr>';
  }).join('');
  return '<div class="card"><h4>🍦 Producción por Sabor</h4>' +
    '<table class="tabla"><thead><tr><th>Sabor</th><th>Producción</th><th>Acciones</th></tr></thead>' +
    '<tbody>' + filas + '</tbody></table></div>';
}

// ============================
// COSTOS
// ============================
function renderCostos(r) {
  var filas = r.sabores.map(function(s) {
    return '<tr><td>' + s.nombre + '</td><td>$' + s.costo + '</td><td>' + renderMenuAcciones() + '</td></tr>';
  }).join('');
  return '<div class="card"><h4>💸 Costos por Sabor</h4>' +
    '<table class="tabla"><thead><tr><th>Sabor</th><th>Costo</th><th>Acciones</th></tr></thead>' +
    '<tbody>' + filas + '</tbody></table></div>';
}

// ============================
// COMPARATIVO
// ============================
function renderComparativo(r) {
  var filas = r.sabores.map(function(s) {
    var margen = calcularMargen(s.produccion * 15, s.costo);
    return '<div class="comparativo-row"><b>' + s.nombre + '</b><span>' + margen + '%</span>' + badgeMargen(margen) + '</div>';
  }).join('');
  return '<div class="card"><h4>📈 Comparativo Producción vs Costos</h4>' + filas + '</div>';
}

// ============================
// MENÚ ACCIONES
// ============================
function renderMenuAcciones() {
  return '<div class="acciones">' +
    '<button title="Editar">✏️</button>' +
    '<button title="Exportar">📄</button>' +
    '<button title="Eliminar">🗑️</button>' +
  '</div>';
}

// ============================
// EXPORTAR
// ============================
function exportarReporte() {
  if (typeof toast === 'function') toast('Exportación próximamente 🚀');
  else alert('Exportación próximamente 🚀');
}
window.exportarReporte = exportarReporte;

window.renderReportes = renderReportes;
