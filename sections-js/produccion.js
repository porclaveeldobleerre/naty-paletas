/* ============================
   ESTADO PRODUCCIÓN
============================ */
let produccion = JSON.parse(localStorage.getItem('produccion')) || {
  semana: {
    numero: 3,
    year: 2026,
    rango: '13 - 19 Enero'
  },
  sabores: [
    {
      id: 1,
      sabor: 'Chocolate',
      lunes: 150, martes: 180, miercoles: 120,
      jueves: 200, viernes: 180, sabado: 150,
      merma: 12
    },
    {
      id: 2,
      sabor: 'Vainilla',
      lunes: 120, martes: 140, miercoles: 100,
      jueves: 150, viernes: 130, sabado: 120,
      merma: 8
    }
  ],
  mermas: [],
  historial: []
};

function guardarProduccion() {
  localStorage.setItem('produccion', JSON.stringify(produccion));
}

/* ============================
   UTILIDADES
============================ */
function totalProduccion() {
  return produccion.sabores.reduce(
    (acc, s) =>
      acc +
      s.lunes +
      s.martes +
      s.miercoles +
      s.jueves +
      s.viernes +
      s.sabado,
    0
  );
}

function totalMerma() {
  return produccion.sabores.reduce((acc, s) => acc + s.merma, 0);
}

/* ============================
   RENDER PRINCIPAL (EXPORTADO)
============================ */
window.renderProduccion = function (container) {
  container.innerHTML = `
    <div class="prod-header">
      <div>
        <h3>🏭 Producción Semanal</h3>
        <p>Semana ${produccion.semana.numero} · ${produccion.semana.rango}</p>
      </div>
      <button class="btn-primary">➕ Registrar</button>
    </div>

    <div class="prod-resumen">
      <div class="resumen-card">
        <span>🍪 Total producido</span>
        <b>${totalProduccion()}</b>
      </div>

      <div class="resumen-card alerta">
        <span>⚠️ Merma</span>
        <b>${totalMerma()}</b>
      </div>
    </div>

    ${renderTablaProduccion()}
  `;
};

/* ============================
   TABLA PRODUCCIÓN
============================ */
function renderTablaProduccion() {
  return `
    <table class="tabla">
      <thead>
        <tr>
          <th>Sabor</th>
          <th>L</th><th>M</th><th>X</th>
          <th>J</th><th>V</th><th>S</th>
          <th>Total</th>
          <th>Merma</th>
        </tr>
      </thead>
      <tbody>
        ${produccion.sabores
          .map(s => {
            const total =
              s.lunes +
              s.martes +
              s.miercoles +
              s.jueves +
              s.viernes +
              s.sabado;

            return `
              <tr>
                <td><b>${s.sabor}</b></td>
                <td>${s.lunes}</td>
                <td>${s.martes}</td>
                <td>${s.miercoles}</td>
                <td>${s.jueves}</td>
                <td>${s.viernes}</td>
                <td>${s.sabado}</td>
                <td class="ok">${total}</td>
                <td class="alerta">${s.merma}</td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}
