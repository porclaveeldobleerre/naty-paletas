window.renderInicio = function(panel) {
  panel.innerHTML = `
    <section class="dashboard">

      <!-- BANNER -->
      <div class="banner">
        <div class="banner-text">
          <h2>Dashboard de Producción</h2>
          <p>Semana 3 · 13 – 19 de Enero 2026</p>

          <div class="status">
            <span class="ok">🟢 Sistema Operativo</span>
            <span class="time">⏱ Hoy, 14:30</span>
          </div>
        </div>

        <img src="assets/ice.png" alt="Paleta">
      </div>

      <!-- KPIS -->
      <div class="kpis">
        <div class="kpi blue">
          <span>🍦</span>
          <h3>Paletas Producidas</h3>
          <strong>730</strong>
          <small>unidades</small>
        </div>

        <div class="kpi green">
          <span>💰</span>
          <h3>Costo Semanal</h3>
          <strong>$5,585</strong>
          <small>MXN</small>
        </div>

        <div class="kpi purple">
          <span>📈</span>
          <h3>Ganancia Estimada</h3>
          <strong>$9,651</strong>
          <small>MXN</small>
        </div>

        <div class="kpi red">
          <span>⚠️</span>
          <h3>Insumos Críticos</h3>
          <strong>4</strong>
          <small>alertas</small>
        </div>
      </div>

    </section>
  `;
};
