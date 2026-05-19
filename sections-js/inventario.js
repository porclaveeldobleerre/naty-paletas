(function() {
'use strict';
// ============================================================
//  INVENTARIO — CRUD completo + registro de usuario
// ============================================================
var _inv  = JSON.parse(localStorage.getItem('inventario')) || [
  {id:1,sabor:'Chocolate', stock:240,capacidad:500,unidad:'pzas',lote:'L-001',fecha:'2026-01-13',color:'#92400e'},
  {id:2,sabor:'Vainilla',  stock:180,capacidad:500,unidad:'pzas',lote:'L-002',fecha:'2026-01-13',color:'#a855f7'},
  {id:3,sabor:'Fresa',     stock:60, capacidad:500,unidad:'pzas',lote:'L-003',fecha:'2026-01-14',color:'#ef4444'},
  {id:4,sabor:'Mango',     stock:310,capacidad:500,unidad:'pzas',lote:'L-004',fecha:'2026-01-14',color:'#fb923c'},
  {id:5,sabor:'Limón',     stock:95, capacidad:500,unidad:'pzas',lote:'L-005',fecha:'2026-01-15',color:'#fbbf24'},
];
var _movs      = JSON.parse(localStorage.getItem('movInventario')) || [];
var _tab       = 'stock';
var _modalMov  = false;
var _modalSab  = false;
var _tipo      = 'entrada';
var _presel    = null;
var _editSabId = null;

function _save()  { localStorage.setItem('inventario',    JSON.stringify(_inv));  }
function _saveM() { localStorage.setItem('movInventario', JSON.stringify(_movs)); }
function _hoy()   { return new Date().toISOString().split('T')[0]; }
function _user()  { return localStorage.getItem('userEmail') || 'sistema'; }

var EMOJ = {chocolate:'🍫',vainilla:'🍦',fresa:'🍓',mango:'🥭','limón':'🍋',limon:'🍋',default:'🍡'};
function _emoji(s){ return EMOJ[s.toLowerCase()] || EMOJ.default; }

// ---- KPI helper ----
function _kpi(emoji, label, valor, color) {
  return '<div style="background:var(--surface);border-radius:12px;padding:16px;border:1px solid var(--border);border-left:3px solid '+color+';">'+
    '<div style="font-size:1.4rem;margin-bottom:4px;">'+emoji+'</div>'+
    '<div style="font-size:0.68rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">'+label+'</div>'+
    '<div style="font-size:1.5rem;font-weight:900;color:var(--text);">'+valor+'</div></div>';
}

// ---- RENDER STOCK ----
function _renderStock() {
  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;">';
  _inv.forEach(function(i) {
    var pct   = Math.round((i.stock/i.capacidad)*100);
    var color = i.color || '#6b7280';
    var est   = pct<30?{t:'Bajo',c:'#ef4444'}:pct<60?{t:'Medio',c:'#f59e0b'}:{t:'Óptimo',c:'#22c55e'};
    html += '<div style="background:var(--surface);border-radius:14px;padding:18px;border:1px solid var(--border);border-top:3px solid '+color+';transition:box-shadow .2s;" onmouseover="this.style.boxShadow=\'0 8px 24px rgba(0,0,0,0.1)\'" onmouseout="this.style.boxShadow=\'\'">'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px;">'+
        '<div style="display:flex;align-items:center;gap:8px;">'+
          '<span style="font-size:1.6rem;">'+_emoji(i.sabor)+'</span>'+
          '<div><div style="font-weight:800;font-size:0.95rem;color:var(--text);">'+i.sabor+'</div>'+
          '<div style="font-size:0.68rem;color:var(--text3);">Lote: '+i.lote+' · '+i.fecha+'</div></div>'+
        '</div>'+
        '<span style="background:'+est.c+'18;color:'+est.c+';padding:3px 9px;border-radius:999px;font-size:0.68rem;font-weight:700;">'+est.t+'</span>'+
      '</div>'+
      '<div style="font-size:2rem;font-weight:900;color:var(--text);margin-bottom:2px;">'+i.stock.toLocaleString()+'</div>'+
      '<div style="font-size:0.72rem;color:var(--text3);margin-bottom:10px;">de '+i.capacidad+' '+i.unidad+' · '+pct+'% ocupado</div>'+
      '<div style="background:var(--surface2);border-radius:999px;height:7px;overflow:hidden;margin-bottom:12px;">'+
        '<div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:999px;transition:width .5s;"></div></div>'+
      '<div style="display:flex;gap:6px;">'+
        '<button onclick="invAbrirMov(\'entrada\','+i.id+')" style="flex:1;background:rgba(34,197,94,0.1);color:#22c55e;border:1px solid rgba(34,197,94,0.2);border-radius:8px;padding:6px;font-size:0.72rem;font-weight:700;cursor:pointer;">🍡 Entrada</button>'+
        '<button onclick="invAbrirMov(\'salida\','+i.id+')"  style="flex:1;background:rgba(239,68,68,0.1);color:#ef4444;border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:6px;font-size:0.72rem;font-weight:700;cursor:pointer;">📤 Salida</button>'+
        '<button onclick="invEditarSabor('+i.id+')" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:6px 8px;cursor:pointer;color:var(--text2);font-size:0.75rem;">✏️</button>'+
        '<button onclick="invEliminarSabor('+i.id+')" style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:6px 8px;cursor:pointer;color:#ef4444;font-size:0.75rem;">🗑️</button>'+
      '</div></div>';
  });
  html += '</div>';
  return html;
}

// ---- RENDER MOVIMIENTOS ----
function _renderMovs() {
  if (!_movs.length) return '<div class="empty">🍡 Sin movimientos registrados aún</div>';
  return '<div style="background:var(--surface);border-radius:14px;border:1px solid var(--border);overflow:hidden;">'+
    '<table class="tabla" style="margin:0;">'+
    '<thead><tr><th>Fecha</th><th>Sabor</th><th>Tipo</th><th>Cantidad</th><th>Registrado por</th><th>Nota</th></tr></thead>'+
    '<tbody>'+
    _movs.slice(0,50).map(function(m){
      return '<tr>'+
        '<td style="color:var(--text3);font-size:0.75rem;white-space:nowrap;">'+m.fecha+'</td>'+
        '<td><span style="display:flex;align-items:center;gap:5px;font-weight:700;">'+_emoji(m.sabor)+' '+m.sabor+'</span></td>'+
        '<td><span style="background:'+(m.tipo==='entrada'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)')+';color:'+(m.tipo==='entrada'?'#22c55e':'#ef4444')+';padding:2px 9px;border-radius:999px;font-size:0.7rem;font-weight:700;">'+(m.tipo==='entrada'?'🍡 Entrada':'📤 Salida')+'</span></td>'+
        '<td style="font-weight:800;color:'+(m.tipo==='entrada'?'#22c55e':'#ef4444')+';font-size:0.95rem;">'+(m.tipo==='entrada'?'+':'-')+m.cantidad+' pzas</td>'+
        '<td style="font-size:0.75rem;color:var(--text2);">👤 '+(m.usuario||'sistema')+'</td>'+
        '<td style="color:var(--text3);font-size:0.78rem;">'+(m.nota||'—')+'</td>'+
      '</tr>';
    }).join('')+
    '</tbody></table></div>';
}

// ---- MODAL MOVIMIENTO ----
function _modalMovHTML() {
  var ops = _inv.map(function(i){ return '<option value="'+i.id+'" '+(_presel===i.id?'selected':'')+'>'+_emoji(i.sabor)+' '+i.sabor+'</option>'; }).join('');
  return '<div id="modalMovInv" class="modal '+(_modalMov?'':'hidden')+'">'+
    '<div class="modal-box" style="max-width:420px;">'+
      '<div class="modal-header">'+
        '<h3>'+((_tipo==='entrada')?'🍡 Registrar Entrada':'📤 Registrar Salida')+'</h3>'+
        '<button class="modal-close" onclick="invCerrarMov()"><i class="fas fa-xmark"></i></button>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column;gap:12px;">'+
        '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px;">Tipo de movimiento</label>'+
          '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'+
            '<button onclick="invSetTipo(\'entrada\')" class="tab-btn '+(_tipo==='entrada'?'active':'')+'">🍡 Entrada</button>'+
            '<button onclick="invSetTipo(\'salida\')"  class="tab-btn '+(_tipo==='salida'?'active':'')+'">📤 Salida</button>'+
          '</div></div>'+
        '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px;">Sabor</label>'+
          '<select id="invSaborSel" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;">'+ops+'</select></div>'+
        '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px;">Cantidad (pzas)</label>'+
          '<input id="invCantidad" type="number" min="1" placeholder="0" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;"></div>'+
        '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px;">Nota (opcional)</label>'+
          '<input id="invNota" placeholder="Ej: Producción del día, Venta a cliente..." style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;"></div>'+
        '<div style="background:var(--surface2);border-radius:10px;padding:10px 14px;font-size:0.78rem;color:var(--text2);">'+
          '👤 Registrado por: <strong>'+_user()+'</strong></div>'+
      '</div>'+
      '<p id="msgInv" style="margin-top:10px;font-size:0.82rem;text-align:center;min-height:18px;color:#ef4444;"></p>'+
      '<div class="modal-actions" style="margin-top:14px;">'+
        '<button class="btn-outline" onclick="invCerrarMov()">Cancelar</button>'+
        '<button class="btn-primary" onclick="invGuardarMov()">Registrar</button>'+
      '</div></div></div>';
}

// ---- MODAL SABOR (CRUD) ----
function _modalSaborHTML() {
  var s = _editSabId ? _inv.find(function(x){ return x.id===_editSabId; }) : null;
  var colores = ['#ef4444','#fb923c','#fbbf24','#22c55e','#3b82f6','#a855f7','#ec4899','#92400e','#06b6d4'];
  var colorBtns = colores.map(function(c){
    return '<button onclick="document.getElementById(\'invColor\').value=\''+c+'\'" '+
      'style="width:24px;height:24px;border-radius:50%;background:'+c+';border:'+(s&&s.color===c?'3px solid #fff':'2px solid transparent')+';cursor:pointer;box-shadow:0 0 0 2px '+c+'44;"></button>';
  }).join('');
  return '<div id="modalSaborInv" class="modal '+(_modalSab?'':'hidden')+'">'+
    '<div class="modal-box" style="max-width:420px;">'+
      '<div class="modal-header">'+
        '<h3>'+(s?'✏️ Editar Sabor':'🍡 Nuevo Sabor')+'</h3>'+
        '<button class="modal-close" onclick="invCerrarSabor()"><i class="fas fa-xmark"></i></button>'+
      '</div>'+
      '<div style="display:flex;flex-direction:column;gap:12px;">'+
        '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px;">Nombre del sabor</label>'+
          '<input id="invSaborNombre" placeholder="Ej: Tamarindo, Guanábana..." value="'+(s?s.sabor:'')+'" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;"></div>'+
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">'+
          '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px;">Stock inicial</label>'+
            '<input id="invSaborStock" type="number" min="0" placeholder="0" value="'+(s?s.stock:'')+'" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;"></div>'+
          '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px;">Capacidad máx.</label>'+
            '<input id="invSaborCap" type="number" min="1" placeholder="500" value="'+(s?s.capacidad:500)+'" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;"></div>'+
        '</div>'+
        '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:4px;">Número de lote</label>'+
          '<input id="invSaborLote" placeholder="Ej: L-006" value="'+(s?s.lote:'')+'" style="width:100%;padding:9px 13px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:0.875rem;font-family:inherit;outline:none;"></div>'+
        '<div><label style="font-size:0.7rem;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:6px;">Color identificador</label>'+
          '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">'+colorBtns+
          '<input id="invColor" type="color" value="'+(s?s.color:'#6b7280')+'" style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border);cursor:pointer;padding:2px;"></div></div>'+
      '</div>'+
      '<p id="msgSaborInv" style="margin-top:10px;font-size:0.82rem;text-align:center;min-height:18px;color:#ef4444;"></p>'+
      '<div class="modal-actions" style="margin-top:14px;">'+
        '<button class="btn-outline" onclick="invCerrarSabor()">Cancelar</button>'+
        '<button class="btn-primary" onclick="invGuardarSabor()">'+(s?'Guardar cambios':'Agregar sabor')+'</button>'+
      '</div></div></div>';
}

// ---- RENDER PRINCIPAL ----
window.renderInventario = function(container) {
  var p = container || document.getElementById('panel');
  var total = _inv.reduce(function(a,i){ return a+i.stock; },0);
  var cap   = _inv.reduce(function(a,i){ return a+i.capacidad; },0);
  var pct   = cap>0?Math.round((total/cap)*100):0;
  var bajo  = _inv.filter(function(i){ return (i.stock/i.capacidad)<0.3; }).length;
  var hoyE  = _movs.filter(function(m){ return m.tipo==='entrada'&&m.fecha.startsWith(_hoy()); }).length;
  var hoyS  = _movs.filter(function(m){ return m.tipo==='salida'&&m.fecha.startsWith(_hoy()); }).length;

  p.innerHTML =
    '<div class="section-header">'+
      '<div><h3>🍡 Inventario de Paletas</h3><small>Control de producto terminado en almacén</small></div>'+
      '<div style="display:flex;gap:8px;">'+
        '<button class="btn-outline" onclick="invAbrirSabor()" style="font-size:0.8rem;">🍡 Nuevo Sabor</button>'+
        '<button class="btn-primary" onclick="invAbrirMov(\'entrada\',null)">📥 Registrar Movimiento</button>'+
      '</div>'+
    '</div>'+

    // KPIs
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:18px;">'+
      _kpi('🍡','Total en Almacén',total.toLocaleString()+' pzas','#3b82f6')+
      _kpi('📦','Capacidad Usada',pct+'%','#a855f7')+
      _kpi('📥','Entradas Hoy',hoyE,'#22c55e')+
      _kpi('📤','Salidas Hoy',hoyS,'#f97316')+
      _kpi('⚠️','Bajo Stock',bajo,'#ef4444')+
    '</div>'+

    // Barra global
    '<div style="background:var(--surface);border-radius:14px;padding:16px 20px;border:1px solid var(--border);margin-bottom:18px;">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'+
        '<span style="font-weight:700;font-size:0.88rem;color:var(--text);">🏭 Capacidad total del almacén</span>'+
        '<span style="font-size:0.8rem;color:var(--text3);">'+total.toLocaleString()+' / '+cap.toLocaleString()+' pzas · '+pct+'%</span>'+
      '</div>'+
      '<div style="background:var(--surface2);border-radius:999px;height:10px;overflow:hidden;">'+
        '<div style="width:'+pct+'%;height:100%;border-radius:999px;background:'+(pct>80?'#ef4444':pct>50?'#f59e0b':'linear-gradient(90deg,#22c55e,#3b82f6)')+';transition:width .5s;"></div>'+
      '</div>'+
    '</div>'+

    // Tabs
    '<div class="tabs" style="margin-bottom:16px;">'+
      '<button class="tab '+(_tab==='stock'?'active':'')+'" onclick="invCambiarTab(\'stock\')">🍡 Stock por Sabor</button>'+
      '<button class="tab '+(_tab==='movimientos'?'active':'')+'" onclick="invCambiarTab(\'movimientos\')">📋 Historial de Movimientos</button>'+
    '</div>'+

    (_tab==='stock' ? _renderStock() : _renderMovs())+
    _modalMovHTML()+
    _modalSaborHTML();
};

// ---- ACCIONES ----
window.invCambiarTab  = function(t){ _tab=t; window.renderInventario(document.getElementById('panel')); };
window.invAbrirMov    = function(tipo,id){ _tipo=tipo||'entrada'; _presel=id||null; _modalMov=true; window.renderInventario(document.getElementById('panel')); };
window.invCerrarMov   = function(){ _modalMov=false; _presel=null; window.renderInventario(document.getElementById('panel')); };
window.invSetTipo     = function(t){ _tipo=t; window.renderInventario(document.getElementById('panel')); };
window.invAbrirSabor  = function(){ _editSabId=null; _modalSab=true; window.renderInventario(document.getElementById('panel')); };
window.invEditarSabor = function(id){ _editSabId=id; _modalSab=true; window.renderInventario(document.getElementById('panel')); };
window.invCerrarSabor = function(){ _editSabId=null; _modalSab=false; window.renderInventario(document.getElementById('panel')); };

window.invEliminarSabor = function(id) {
  var s = _inv.find(function(x){ return x.id===id; });
  if (!s) return;
  if (!confirm('¿Eliminar el sabor "'+s.sabor+'"? Se perderá su historial de stock.')) return;
  _inv = _inv.filter(function(x){ return x.id!==id; });
  _save();
  window.toast && window.toast('Sabor eliminado');
  window.renderInventario(document.getElementById('panel'));
};

window.invGuardarMov = function() {
  var saborId  = parseInt(document.getElementById('invSaborSel').value);
  var cantidad = parseInt(document.getElementById('invCantidad').value);
  var nota     = document.getElementById('invNota').value.trim();
  var msg      = document.getElementById('msgInv');
  if (!cantidad || cantidad <= 0) { msg.textContent='Ingresa una cantidad válida.'; return; }
  var item = _inv.find(function(i){ return i.id===saborId; });
  if (!item) return;
  if (_tipo==='salida' && cantidad>item.stock) { msg.textContent='Stock insuficiente. Disponible: '+item.stock+' pzas.'; return; }
  item.stock += _tipo==='entrada' ? cantidad : -cantidad;
  _movs.unshift({ id:Date.now(), fecha:new Date().toLocaleString('es-MX'), sabor:item.sabor, tipo:_tipo, cantidad:cantidad, nota:nota, usuario:_user() });
  _save(); _saveM();
  window.toast && window.toast(_tipo==='entrada'?'🍡 Entrada registrada':'📤 Salida registrada');
  window.invCerrarMov();
};

window.invGuardarSabor = function() {
  var nombre = document.getElementById('invSaborNombre').value.trim();
  var stock  = parseInt(document.getElementById('invSaborStock').value) || 0;
  var cap    = parseInt(document.getElementById('invSaborCap').value)   || 500;
  var lote   = document.getElementById('invSaborLote').value.trim();
  var color  = document.getElementById('invColor').value;
  var msg    = document.getElementById('msgSaborInv');
  if (!nombre) { msg.textContent='El nombre es obligatorio.'; return; }
  if (_editSabId) {
    var idx = _inv.findIndex(function(x){ return x.id===_editSabId; });
    Object.assign(_inv[idx], {sabor:nombre, capacidad:cap, lote:lote||_inv[idx].lote, color:color});
    window.toast && window.toast('✏️ Sabor actualizado');
  } else {
    if (_inv.find(function(x){ return x.sabor.toLowerCase()===nombre.toLowerCase(); })) { msg.textContent='Ese sabor ya existe.'; return; }
    var nextLote = lote || ('L-00'+((_inv.length+1)));
    _inv.push({ id:Date.now(), sabor:nombre, stock:stock, capacidad:cap, unidad:'pzas', lote:nextLote, fecha:_hoy(), color:color });
    window.toast && window.toast('🍡 Sabor agregado');
  }
  _save();
  window.invCerrarSabor();
};

})();
