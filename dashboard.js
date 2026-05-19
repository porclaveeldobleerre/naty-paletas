// ===== PROTECCIÓN DE RUTAS =====
(function protegerRuta() {
  var auth = localStorage.getItem('auth');
  var sid  = localStorage.getItem('sessionId');
  var rol  = localStorage.getItem('userRol');
  if (auth !== 'true' || !sid || !rol) {
    ['auth','sessionId','userRol','userEmail'].forEach(function(k){ localStorage.removeItem(k); });
    window.location.replace('index.html');
  }
})();

// ===== MULTISESIONES =====
var _dashSessionId = localStorage.getItem('sessionId');
window.addEventListener('storage', function(e) {
  if (e.key === 'sessionId' && e.newValue !== _dashSessionId) _mostrarSesionDesplazada();
  if (e.key === 'auth' && e.newValue !== 'true') window.location.href = 'index.html';
});

function _mostrarSesionDesplazada() {
  if (document.getElementById('multiSessionAlert')) return;
  var o = document.createElement('div');
  o.id = 'multiSessionAlert';
  o.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:99999;';
  o.innerHTML = '<div style="background:#fff;border-radius:20px;padding:36px 32px;max-width:380px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div style="font-size:3rem;margin-bottom:12px;">⚠️</div>' +
    '<h3 style="color:#ef4444;margin-bottom:8px;">Sesión desplazada</h3>' +
    '<p style="color:#6b7280;margin-bottom:24px;font-size:0.9rem;">Se inició sesión desde otro dispositivo.<br>Esta sesión ha sido cerrada por seguridad.</p>' +
    '<button onclick="cerrarSesionForzada()" style="background:linear-gradient(135deg,#ec4899,#a855f7);color:#fff;border:none;border-radius:12px;padding:12px 28px;font-weight:700;cursor:pointer;">Entendido</button>' +
    '</div>';
  document.body.appendChild(o);
}

window.cerrarSesionForzada = function() {
  ['auth','userRol','userEmail','sessionId'].forEach(function(k){ localStorage.removeItem(k); });
  window.location.href = 'index.html';
};

// ===== ROL Y PERMISOS =====
var ROL_ACTUAL = localStorage.getItem('userRol') || 'usuario';
var PERMISOS = {
  admin:   ['inicio','insumos','recetas','produccion','reportes','configuracion','usuarios','inventario','ventas','proveedores'],
  usuario: ['inicio','insumos','recetas','produccion','reportes']
};
function tienePermiso(s) { return (PERMISOS[ROL_ACTUAL] || PERMISOS['usuario']).indexOf(s) !== -1; }

// ===== EMAIL EN TOPBAR =====
var _email = localStorage.getItem('userEmail') || '';
var _userSpan = document.getElementById('userEmail');
if (_userSpan) _userSpan.textContent = _email ? _email.split('@')[0] : 'Admin';

var _rolLabel = document.getElementById('userRolLabel');
if (_rolLabel) _rolLabel.textContent = ROL_ACTUAL === 'admin' ? 'Administrador' : 'Usuario';

var _userAvatar = document.getElementById('userAvatar');
if (_userAvatar && _email) _userAvatar.textContent = _email[0].toUpperCase();

var _sidebarAvatar = document.getElementById('sidebarAvatar');
if (_sidebarAvatar && _email) _sidebarAvatar.textContent = _email[0].toUpperCase();

var _sidebarName = document.getElementById('sidebarName');
if (_sidebarName && _email) _sidebarName.textContent = _email.split('@')[0];

var _sidebarRole = document.getElementById('sidebarRole');
if (_sidebarRole) _sidebarRole.textContent = ROL_ACTUAL === 'admin' ? 'Administrador' : 'Usuario';

// ===== OCULTAR NAV SIN PERMISO =====
document.querySelectorAll('.nav-link').forEach(function(link) {
  if (!tienePermiso(link.dataset.section)) link.style.display = 'none';
});

// ===== REFERENCIAS =====
var panel = document.getElementById('panel');

// ===== DARK MODE =====
var _themeToggle = document.getElementById('themeToggle');
var _themeIcon   = document.getElementById('themeIcon');
var _savedTheme  = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', _savedTheme);
if (_themeIcon) _themeIcon.className = _savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
if (_themeToggle) {
  _themeToggle.addEventListener('click', function() {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if (_themeIcon) _themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  });
}

// ===== NOTIFICACIONES =====
function actualizarNotificaciones() {
  var ins  = JSON.parse(localStorage.getItem('insumos')) || [];
  var crit = ins.filter(function(i){ return i.minimo > 0 && (i.stock/i.minimo)*100 <= 80; });
  var badge = document.getElementById('notifBadge');
  var list  = document.getElementById('notifList');
  if (badge) { badge.style.display = crit.length > 0 ? 'flex' : 'none'; badge.textContent = crit.length; }
  if (list) {
    if (crit.length === 0) {
      list.innerHTML = '<div class="notif-item"><div class="notif-item-icon">✅</div><div><div class="notif-item-text">Sin alertas activas</div></div></div>';
    } else {
      list.innerHTML = crit.slice(0,5).map(function(i) {
        var pct = Math.round((i.stock/i.minimo)*100);
        return '<div class="notif-item"><div class="notif-item-icon">' + (pct<=50?'🔴':'🟡') + '</div><div>' +
          '<div class="notif-item-text">' + i.nombre + '</div>' +
          '<div class="notif-item-sub">Stock: ' + i.stock + ' ' + i.unidad + ' · ' + pct + '% del mínimo</div>' +
          '</div></div>';
      }).join('');
    }
  }
}

var _notifBtn = document.getElementById('notifBtn');
var _notifDD  = document.getElementById('notifDropdown');
if (_notifBtn && _notifDD) {
  _notifBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    _notifDD.classList.toggle('open');
    actualizarNotificaciones();
  });
}
document.addEventListener('click', function() { if (_notifDD) _notifDD.classList.remove('open'); });
actualizarNotificaciones();

// ===== TOAST =====
window.toast = function(msg) {
  var t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function(){ t.remove(); }, 3000);
};

// ===== SECTION BANNER HELPER =====
// Imágenes de paletas/helados por sección
var SECTION_IMGS = {
  insumos:       'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200&h=200&fit=crop&auto=format',
  recetas:       'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=1200&h=200&fit=crop&auto=format',
  inventario:    'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1200&h=200&fit=crop&auto=format',
  produccion:    'https://images.unsplash.com/photo-1488900128323-21503983a07e?w=1200&h=200&fit=crop&auto=format',
  ventas:        'https://images.unsplash.com/photo-1567206563114-c179706a56b4?w=1200&h=200&fit=crop&auto=format',
  reportes:      'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=1200&h=200&fit=crop&auto=format',
  proveedores:   'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=1200&h=200&fit=crop&auto=format',
  configuracion: 'https://images.unsplash.com/photo-1514190051997-0f6f39ca5cde?w=1200&h=200&fit=crop&auto=format',
  usuarios:      'https://images.unsplash.com/photo-1576506295286-5cda18df43e7?w=1200&h=200&fit=crop&auto=format',
};

var SECTION_COLORS = {
  insumos:       'rgba(59,130,246,0.82)',
  recetas:       'rgba(249,115,22,0.82)',
  inventario:    'rgba(168,85,247,0.82)',
  produccion:    'rgba(16,185,129,0.82)',
  ventas:        'rgba(236,72,153,0.82)',
  reportes:      'rgba(14,165,233,0.82)',
  proveedores:   'rgba(245,158,11,0.82)',
  configuracion: 'rgba(100,116,139,0.82)',
  usuarios:      'rgba(99,102,241,0.82)',
};

var SECTION_EMOJIS = {
  insumos:'🧂', recetas:'📋', inventario:'🍡', produccion:'🏭',
  ventas:'💰', reportes:'📊', proveedores:'🚚', configuracion:'⚙️', usuarios:'👥'
};

function sectionBanner(section, titulo, subtitulo) {
  var img   = SECTION_IMGS[section]   || SECTION_IMGS.inventario;
  var color = SECTION_COLORS[section] || 'rgba(59,130,246,0.82)';
  var emoji = SECTION_EMOJIS[section] || '🍡';
  return '<div style="position:relative;border-radius:16px;overflow:hidden;margin-bottom:20px;height:110px;box-shadow:0 4px 20px rgba(0,0,0,0.15);">'+
    '<div style="position:absolute;inset:0;background-image:url(\''+img+'\');background-size:cover;background-position:center;"></div>'+
    '<div style="position:absolute;inset:0;background:'+color+';"></div>'+
    '<div style="position:relative;z-index:1;padding:20px 28px;display:flex;align-items:center;gap:16px;height:100%;">'+
      '<span style="font-size:2.5rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">'+emoji+'</span>'+
      '<div>'+
        '<h2 style="margin:0;font-size:1.4rem;font-weight:900;color:#fff;letter-spacing:-.3px;text-shadow:0 1px 3px rgba(0,0,0,0.2);">'+titulo+'</h2>'+
        '<p style="margin:0;color:rgba(255,255,255,0.85);font-size:0.82rem;margin-top:2px;">'+subtitulo+'</p>'+
      '</div>'+
      '<div style="margin-left:auto;opacity:0.15;font-size:5rem;line-height:1;user-select:none;">🍡🍦🧊</div>'+
    '</div>'+
  '</div>';
}
function _kpiCard(icon, color, titulo, sub, valor, badge, badgeBg, badgeColor, isFloat) {
  var prefix  = isFloat ? '$' : '';
  var display = isFloat ? valor.toLocaleString('es-MX',{maximumFractionDigits:0}) : valor.toLocaleString();
  return '<div title="' + titulo + '" style="background:var(--surface);border-radius:14px;padding:18px;' +
    'border:1px solid var(--border);box-shadow:var(--shadow);transition:all .2s;cursor:default;"' +
    ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px ' + color + '30\'"' +
    ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'var(--shadow)\'">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">' +
      '<div style="width:42px;height:42px;background:' + color + ';border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">' + icon + '</div>' +
      '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">' +
        '<span style="background:' + badgeBg + ';color:' + badgeColor + ';font-size:0.65rem;font-weight:700;padding:2px 7px;border-radius:999px;">' + badge + '</span>' +
        '<span style="font-size:0.6rem;color:var(--text3);">vs semana anterior</span>' +
      '</div></div>' +
    '<div style="font-size:1.65rem;font-weight:900;color:var(--text);line-height:1;" data-count="' + valor + '" data-prefix="' + prefix + '" ' + (isFloat ? 'data-float="true"' : '') + '>' + prefix + display + '</div>' +
    '<div style="font-size:0.72rem;color:var(--text3);margin-top:4px;font-weight:600;">' + titulo + '</div>' +
    '<div style="font-size:0.65rem;color:var(--text3);margin-top:2px;">' + sub + '</div>' +
    '</div>';
}

function _kpiAlertas(count) {
  return '<div title="Insumos críticos" onclick="navegarA(\'insumos\')" style="background:var(--surface);border-radius:14px;padding:18px;' +
    'border:1px solid var(--border);box-shadow:var(--shadow);transition:all .2s;cursor:pointer;"' +
    ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(239,68,68,0.2)\'"' +
    ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'var(--shadow)\'">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:14px;">' +
      '<div style="width:42px;height:42px;background:#ef4444;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">⚠️</div>' +
      '<span style="background:#fee2e2;color:#b91c1c;font-size:0.65rem;font-weight:700;padding:2px 7px;border-radius:999px;">Revisar ›</span>' +
    '</div>' +
    '<div style="font-size:1.65rem;font-weight:900;color:var(--text);line-height:1;" data-count="' + count + '">' + count + '</div>' +
    '<div style="font-size:0.72rem;color:var(--text3);margin-top:4px;font-weight:600;">Insumos Críticos</div>' +
    '<div style="font-size:0.65rem;color:var(--text3);margin-top:2px;">Requieren atención</div>' +
    '</div>';
}

// ===== RENDER INICIO =====
function renderInicio() {
  var insumos = JSON.parse(localStorage.getItem('insumos')) || [];
  var prod    = JSON.parse(localStorage.getItem('produccion')) || { semana:{numero:3,year:2026,rango:'13 - 19 Enero'}, sabores:[] };
  var DIAS    = ['lunes','martes','miercoles','jueves','viernes','sabado'];

  var totalProd = prod.sabores.reduce(function(a,s){ return a + DIAS.reduce(function(d,dia){ return d+(s[dia]||0); },0); }, 0);
  var costo     = totalProd * 7.65;
  var ganancia  = totalProd * 13.22;
  var criticos  = insumos.filter(function(i){ return i.minimo > 0 && (i.stock/i.minimo)*100 <= 80; });
  var hayAlertas = criticos.length > 0;
  var horaStr   = new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});

  var prodPorDia = DIAS.map(function(dia){ return prod.sabores.reduce(function(a,s){ return a+(s[dia]||0); },0); });
  var diasLabel  = ['Lun','Mar','Mié','Jue','Vie','Sáb'];

  var COLS = {fresa:'#ef4444',chocolate:'#92400e','limón':'#fbbf24',limon:'#fbbf24',mango:'#fb923c',vainilla:'#a855f7'};
  var EMOJ = {fresa:'🍓',chocolate:'🍫','limón':'🍋',limon:'🍋',mango:'🥭',vainilla:'🍦'};
  var sLabels = prod.sabores.map(function(s){ return s.sabor; });
  var sData   = prod.sabores.map(function(s){ return DIAS.reduce(function(a,d){ return a+(s[d]||0); },0); });
  var sCols   = prod.sabores.map(function(s){ return COLS[s.sabor.toLowerCase()]||'#6b7280'; });

  var saboresHTML = prod.sabores.map(function(s,i) {
    var pct = totalProd > 0 ? Math.round(sData[i]/totalProd*100) : 0;
    return '<div style="display:flex;align-items:center;gap:5px;">' +
      '<span style="font-size:0.8rem;">' + (EMOJ[s.sabor.toLowerCase()]||'🍦') + '</span>' +
      '<div style="flex:1;">' +
        '<div style="display:flex;justify-content:space-between;font-size:0.68rem;font-weight:700;color:var(--text);margin-bottom:2px;">' +
          '<span>' + s.sabor + '</span><span>' + pct + '%</span></div>' +
        '<div style="background:var(--surface2);border-radius:999px;height:4px;overflow:hidden;">' +
          '<div style="width:' + pct + '%;height:100%;background:' + sCols[i] + ';border-radius:999px;"></div></div>' +
        '<div style="font-size:0.6rem;color:var(--text3);margin-top:1px;">' + sData[i].toLocaleString() + ' uds</div>' +
      '</div></div>';
  }).join('');

  var alertasHTML = criticos.length === 0
    ? '<div style="text-align:center;padding:20px;color:var(--green);font-weight:600;font-size:0.82rem;">✅ Sin alertas activas</div>'
    : criticos.slice(0,3).map(function(i) {
        var pct    = Math.round((i.stock/i.minimo)*100);
        var esCrit = pct <= 50; var isOk = pct >= 80;
        var color  = esCrit ? '#ef4444' : isOk ? '#22c55e' : '#f59e0b';
        var label  = esCrit ? 'CRÍTICO' : isOk ? 'ÓPTIMO' : 'ATENCIÓN';
        var bg     = esCrit ? '#fef2f2' : isOk ? '#f0fdf4' : '#fffbeb';
        var n      = i.nombre.toLowerCase();
        var emoji  = n.includes('leche')?'🥛':n.includes('az')?'🍬':n.includes('pulpa')||n.includes('fruta')?'🍊':'📦';
        return '<div style="background:' + bg + ';border-radius:9px;padding:9px 11px;border:1px solid ' + color + '22;">' +
          '<div style="display:flex;align-items:center;gap:7px;margin-bottom:5px;">' +
            '<span style="font-size:1rem;">' + emoji + '</span>' +
            '<div style="flex:1;">' +
              '<div style="font-weight:700;font-size:0.78rem;color:var(--text);">' + i.nombre + '</div>' +
              '<div style="font-size:0.65rem;color:var(--text3);">Actual: ' + i.stock + ' ' + i.unidad + ' · Mínimo: ' + i.minimo + ' ' + i.unidad + '</div>' +
            '</div>' +
            '<span style="background:' + color + ';color:#fff;font-size:0.6rem;font-weight:800;padding:2px 7px;border-radius:999px;white-space:nowrap;">' + label + '</span>' +
          '</div>' +
          '<div style="background:rgba(0,0,0,0.06);border-radius:999px;height:5px;overflow:hidden;">' +
            '<div style="width:' + Math.min(pct,100) + '%;height:100%;background:' + color + ';border-radius:999px;"></div>' +
          '</div></div>';
      }).join('');

  panel.innerHTML =
    // BANNER
    '<div style="background:linear-gradient(135deg,#ec4899 0%,#a855f7 45%,#3b82f6 100%);' +
      'border-radius:18px;padding:24px 28px;margin-bottom:18px;position:relative;overflow:hidden;' +
      'box-shadow:0 8px 32px rgba(168,85,247,0.3);">' +
      '<div style="position:absolute;top:-50px;right:260px;width:180px;height:180px;border-radius:50%;background:rgba(255,255,255,0.07);pointer-events:none;"></div>' +
      '<div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;">' +
        '<div>' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">' +
            '<span style="font-size:1.6rem;">�</span>' +
            '<h2 style="margin:0;font-size:1.5rem;font-weight:900;color:#fff;letter-spacing:-.5px;">Naty Paletas y Helados</h2>' +
          '</div>' +
          '<p style="margin:0 0 14px;color:rgba(255,255,255,0.8);font-size:0.82rem;">Sabores que enamoran desde el primer mordisco 🍦</p>' +
          '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:8px;">' +
              '<i class="fas fa-calendar-week" style="color:rgba(255,255,255,0.8);font-size:0.85rem;"></i>' +
              '<div><div style="color:#fff;font-weight:700;font-size:0.8rem;">Semana ' + prod.semana.numero + ' del ' + prod.semana.year + '</div>' +
              '<div style="color:rgba(255,255,255,0.7);font-size:0.68rem;">' + prod.semana.rango + '</div></div>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:8px;">' +
              '<i class="fas fa-clock" style="color:rgba(255,255,255,0.8);font-size:0.85rem;"></i>' +
              '<div><div style="color:#fff;font-weight:700;font-size:0.8rem;">Última actualización</div>' +
              '<div style="color:rgba(255,255,255,0.7);font-size:0.68rem;">Hoy, ' + horaStr + '</div></div>' +
            '</div>' +
            '<div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:8px;">' +
              '<div style="width:8px;height:8px;border-radius:50%;background:' + (hayAlertas?'#fbbf24':'#4ade80') + ';flex-shrink:0;"></div>' +
              '<div><div style="color:rgba(255,255,255,0.7);font-size:0.68rem;">Estado del sistema</div>' +
              '<div style="color:#fff;font-weight:700;font-size:0.8rem;">' + (hayAlertas?'Alertas Activas':'Sistema Operativo') + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<img src="https://images.unsplash.com/photo-1587314168485-3236d6710814?w=380&h=220&fit=crop&crop=center&auto=format"' +
          ' alt="Paletas Naty" style="width:210px;height:135px;object-fit:cover;border-radius:14px;' +
          'box-shadow:0 8px 24px rgba(0,0,0,0.3);border:2px solid rgba(255,255,255,0.25);flex-shrink:0;"' +
          ' onerror="this.src=\'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=380&h=220&fit=crop&auto=format\'">' +
      '</div></div>' +

    // KPIs
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px;margin-bottom:18px;">' +
      _kpiCard('🍦','#3b82f6','Paletas Producidas','Unidades esta semana',totalProd,'+12%','#dbeafe','#1d4ed8',false) +
      _kpiCard('💲','#22c55e','Costo Semanal','Total de producción',costo,'-5%','#dcfce7','#15803d',true) +
      _kpiCard('📊','#a855f7','Ganancia Estimada','Utilidad estimada',ganancia,'+8%','#f3e8ff','#7e22ce',true) +
      _kpiAlertas(criticos.length) +
    '</div>' +

    // GRÁFICAS FILA 1
    '<div style="display:grid;grid-template-columns:3fr 2fr;gap:12px;margin-bottom:12px;">' +
      '<div style="background:var(--surface);border-radius:14px;overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow);">' +
        '<div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:13px 18px;display:flex;justify-content:space-between;align-items:center;">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<i class="fas fa-chart-line" style="color:#fff;"></i>' +
            '<div><div style="color:#fff;font-weight:700;font-size:0.85rem;">Producción Diaria vs Objetivo</div>' +
            '<div style="color:rgba(255,255,255,0.65);font-size:0.65rem;">Producción Real — Objetivo Diario (400)</div></div>' +
          '</div>' +
          '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:0.65rem;font-weight:600;padding:3px 9px;border-radius:999px;">Esta semana</span>' +
        '</div>' +
        '<div style="padding:14px 16px;"><canvas id="chartBarras" height="155"></canvas></div>' +
      '</div>' +
      '<div style="background:var(--surface);border-radius:14px;overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow);">' +
        '<div style="background:linear-gradient(135deg,#f97316,#ea580c);padding:13px 18px;display:flex;align-items:center;gap:8px;">' +
          '<i class="fas fa-cookie-bite" style="color:#fff;"></i>' +
          '<div><div style="color:#fff;font-weight:700;font-size:0.85rem;">Producción por Sabor</div>' +
          '<div style="color:rgba(255,255,255,0.65);font-size:0.65rem;">Distribución semanal</div></div>' +
        '</div>' +
        '<div style="padding:12px 14px;display:flex;gap:10px;align-items:center;">' +
          '<div style="position:relative;flex-shrink:0;">' +
            '<canvas id="chartDona" width="120" height="120"></canvas>' +
            '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;">' +
              '<div style="font-size:0.58rem;color:var(--text3);font-weight:600;">Total</div>' +
              '<div style="font-size:0.95rem;font-weight:900;color:var(--text);">' + totalProd.toLocaleString() + '</div>' +
              '<div style="font-size:0.55rem;color:var(--text3);">unidades</div>' +
            '</div>' +
          '</div>' +
          '<div style="flex:1;display:flex;flex-direction:column;gap:5px;">' + saboresHTML + '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // GRÁFICAS FILA 2
    '<div style="display:grid;grid-template-columns:3fr 2fr;gap:12px;">' +
      '<div style="background:var(--surface);border-radius:14px;overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow);">' +
        '<div style="background:linear-gradient(135deg,#059669,#047857);padding:13px 18px;display:flex;justify-content:space-between;align-items:center;">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<i class="fas fa-arrow-trend-up" style="color:#fff;"></i>' +
            '<div style="color:#fff;font-weight:700;font-size:0.85rem;">Tendencia de Crecimiento</div>' +
          '</div>' +
          '<span style="background:rgba(255,255,255,0.15);color:#fff;font-size:0.65rem;font-weight:600;padding:3px 9px;border-radius:999px;">Últimas 3 semanas</span>' +
        '</div>' +
        '<div style="padding:14px 16px;"><canvas id="chartArea" height="135"></canvas></div>' +
      '</div>' +
      '<div style="background:var(--surface);border-radius:14px;overflow:hidden;border:1px solid var(--border);box-shadow:var(--shadow);cursor:pointer;"' +
        ' onclick="navegarA(\'insumos\')"' +
        ' onmouseover="this.style.boxShadow=\'0 8px 24px rgba(239,68,68,0.15)\'"' +
        ' onmouseout="this.style.boxShadow=\'var(--shadow)\'">' +
        '<div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:13px 18px;display:flex;justify-content:space-between;align-items:center;">' +
          '<div style="display:flex;align-items:center;gap:8px;">' +
            '<i class="fas fa-triangle-exclamation" style="color:#fff;animation:pulse 2s infinite;"></i>' +
            '<div style="color:#fff;font-weight:700;font-size:0.85rem;">Alertas Críticas</div>' +
          '</div>' +
          '<span style="background:rgba(255,255,255,0.2);color:#fff;font-size:0.65rem;font-weight:600;padding:3px 9px;border-radius:999px;">Ver todos</span>' +
        '</div>' +
        '<div style="padding:10px 12px;display:flex;flex-direction:column;gap:7px;">' + alertasHTML + '</div>' +
      '</div>' +
    '</div>';

  // Charts + contador animado
  requestAnimationFrame(function() {
    document.querySelectorAll('[data-count]').forEach(function(el) {
      var target  = parseFloat(el.dataset.count);
      var prefix  = el.dataset.prefix || '';
      var isFloat = el.dataset.float === 'true';
      var start   = 0;
      function step(ts) {
        if (!start) start = ts;
        var p   = Math.min((ts-start)/900, 1);
        var val = target * (1 - Math.pow(1-p, 3));
        el.textContent = prefix + (isFloat ? val.toLocaleString('es-MX',{maximumFractionDigits:0}) : Math.round(val).toLocaleString());
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    ['chartBarras','chartDona','chartArea'].forEach(function(id) {
      var c = Chart.getChart(id); if (c) c.destroy();
    });

    new Chart(document.getElementById('chartBarras'), {
      type: 'bar',
      data: { labels: diasLabel, datasets: [
        { label:'Producción Real', data:prodPorDia, backgroundColor:'rgba(59,130,246,0.85)', borderRadius:5, borderSkipped:false },
        { label:'Objetivo (400)', data:Array(6).fill(400), backgroundColor:'rgba(203,213,225,0.4)', borderRadius:5, borderSkipped:false }
      ]},
      options: { responsive:true,
        plugins:{ legend:{ position:'bottom', labels:{ font:{size:10}, boxWidth:10, padding:10 }}},
        scales:{ y:{ beginAtZero:true, grid:{color:'rgba(0,0,0,0.04)'}, ticks:{font:{size:10}} },
                 x:{ grid:{display:false}, ticks:{font:{size:10}} }}
      }
    });

    if (sData.some(function(v){ return v > 0; })) {
      new Chart(document.getElementById('chartDona'), {
        type: 'doughnut',
        data: { labels:sLabels, datasets:[{ data:sData, backgroundColor:sCols, borderWidth:2, borderColor:'#fff' }]},
        options: { responsive:false, cutout:'68%', plugins:{ legend:{display:false} }}
      });
    }

    new Chart(document.getElementById('chartArea'), {
      type: 'line',
      data: { labels:['Semana 1','Semana 2','Semana 3 (Actual)'],
        datasets:[{ label:'Producción',
          data:[Math.round(totalProd*.76), Math.round(totalProd*.90), totalProd],
          fill:true, backgroundColor:'rgba(16,185,129,0.12)', borderColor:'#10b981',
          borderWidth:2.5, pointBackgroundColor:'#10b981', pointRadius:5, tension:0.4
        }]},
      options: { responsive:true, plugins:{ legend:{display:false} },
        scales:{ y:{ beginAtZero:false, grid:{color:'rgba(0,0,0,0.04)'}, ticks:{font:{size:10}} },
                 x:{ grid:{display:false}, ticks:{font:{size:10}} }}
      }
    });
  });
}

// ===== NAVEGACIÓN =====
window.navegarA = function(section) {
  document.querySelectorAll('.nav-link').forEach(function(a){ a.classList.remove('active'); });
  var link = document.querySelector('.nav-link[data-section="' + section + '"]');
  if (link) link.classList.add('active');
  renderSection(section);
  var title = document.getElementById('topbarTitle');
  if (title) title.textContent = link ? link.querySelector('span').textContent : section;
};

// ===== RENDER SECCIÓN =====
function renderSection(section) {
  panel.innerHTML = '';
  if (!tienePermiso(section)) {
    panel.innerHTML = '<div class="glass-card" style="text-align:center;padding:48px 24px;">' +
      '<div style="font-size:3rem;margin-bottom:16px;">🔒</div>' +
      '<h3 style="color:#ef4444;margin-bottom:8px;">Acceso restringido</h3>' +
      '<p style="color:var(--text2);">No tienes permiso para ver esta sección.</p></div>';
    return;
  }
  try {
    var mods = {
      inicio:        function(){ renderInicio(); },
      insumos:       function(){
        panel.innerHTML = sectionBanner('insumos','Gestión de Insumos','Control de materias primas y materiales');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderInsumos && window.renderInsumos(sub);
      },
      inventario:    function(){
        panel.innerHTML = sectionBanner('inventario','Inventario de Paletas','Stock de producto terminado en almacén');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderInventario && window.renderInventario(sub);
      },
      recetas:       function(){
        panel.innerHTML = sectionBanner('recetas','Recetas','Fórmulas y costos de producción');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderRecetas && window.renderRecetas(sub);
      },
      produccion:    function(){
        panel.innerHTML = sectionBanner('produccion','Producción Semanal','Registro de paletas producidas por sabor');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderProduccion && window.renderProduccion(sub);
      },
      reportes:      function(){
        panel.innerHTML = sectionBanner('reportes','Reportes','Análisis y estadísticas de producción');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderReportes && window.renderReportes(sub);
      },
      ventas:        function(){
        panel.innerHTML = sectionBanner('ventas','Ventas y Pedidos','Registro de ventas y cobros');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderVentas && window.renderVentas(sub);
      },
      proveedores:   function(){
        panel.innerHTML = sectionBanner('proveedores','Proveedores','Catálogo de proveedores y contactos');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderProveedores && window.renderProveedores(sub);
      },
      configuracion: function(){
        panel.innerHTML = sectionBanner('configuracion','Configuración','Ajustes generales del sistema');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderConfiguracion && window.renderConfiguracion(sub);
      },
      usuarios:      function(){
        panel.innerHTML = sectionBanner('usuarios','Gestión de Usuarios','Accesos, roles y bitácora');
        var sub = document.createElement('div'); panel.appendChild(sub);
        window.renderUsuarios && window.renderUsuarios(sub);
      },
    };
    if (mods[section]) mods[section]();
    else panel.innerHTML = '<p class="empty">Sección no encontrada</p>';
  } catch(err) {
    console.error('Error sección:', section, err);
    panel.innerHTML = '<div class="glass-card"><p style="color:#ef4444">Error: ' + err.message + '</p></div>';
  }
}

// ===== SIDEBAR NAV =====
document.querySelectorAll('.nav-link').forEach(function(link) {
  link.addEventListener('click', function() {
    document.querySelectorAll('.nav-link').forEach(function(a){ a.classList.remove('active'); });
    link.classList.add('active');
    var title = document.getElementById('topbarTitle');
    if (title) title.textContent = link.querySelector('span').textContent;
    renderSection(link.dataset.section);
    _closeSidebar();
  });
});

// ===== LOGOUT =====
var _logoutBtn = document.getElementById('logout');
if (_logoutBtn) {
  _logoutBtn.addEventListener('click', function() {
    ['auth','userRol','userEmail','sessionId'].forEach(function(k){ localStorage.removeItem(k); });
    window.location.href = 'index.html';
  });
}

var _logoutTopbar = document.getElementById('logoutTopbar');
if (_logoutTopbar) {
  _logoutTopbar.addEventListener('click', function() {
    ['auth','userRol','userEmail','sessionId'].forEach(function(k){ localStorage.removeItem(k); });
    window.location.href = 'index.html';
  });
}

// ===== MENU MÓVIL =====
var _menuToggle = document.getElementById('menuToggle');
var _sidebarOverlay = document.getElementById('sidebarOverlay');

function _openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  if (_sidebarOverlay) _sidebarOverlay.classList.add('open');
}
function _closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  if (_sidebarOverlay) _sidebarOverlay.classList.remove('open');
}

if (_menuToggle) {
  _menuToggle.addEventListener('click', function() {
    var sb = document.getElementById('sidebar');
    if (sb.classList.contains('open')) { _closeSidebar(); } else { _openSidebar(); }
  });
}
if (_sidebarOverlay) {
  _sidebarOverlay.addEventListener('click', _closeSidebar);
}

// ===== INIT =====
renderInicio();

