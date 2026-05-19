// ==============================
// EMAILJS - RECUPERACIÓN DE CONTRASEÑA
// ==============================
const EMAILJS_PUBLIC_KEY  = '-V0imozPJsCe0-U7e';
const EMAILJS_SERVICE_ID  = 'service_rpcmhg9';
const EMAILJS_TEMPLATE_ID = 'template_xip9b9b';
const TWILIO_FUNCTION_URL = 'https://sms-reset-4890.twil.io/send-sms';

// seleccionarMetodo está definido en index.html

document.addEventListener('DOMContentLoaded', () => {

  // Inicializar EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // ===== PROTECCIÓN DE RUTA - LOGIN =====
  // Si ya hay sesión válida, no dejar entrar al login
  if (document.getElementById('loginForm')) {
    const auth      = localStorage.getItem('auth');
    const sessionId = localStorage.getItem('sessionId');
    const rol       = localStorage.getItem('userRol');
    if (auth === 'true' && sessionId && rol) {
      window.location.replace('dashboard.html');
      return;
    }
  }

  // 1. SERVICE WORKER (Esto funciona en todas las páginas)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }

  // ==============================
  // RECUPERACIÓN DE CONTRASEÑA
  // ==============================
  const btnForgot = document.getElementById('btnForgot');
  const modalRecuperar = document.getElementById('modalRecuperar');
  const modalNuevaPass = document.getElementById('modalNuevaPass');
  const btnCerrarModal = document.getElementById('btnCerrarModal');
  const btnEnviarRecuperar = document.getElementById('btnEnviarRecuperar');
  const btnGuardarPass = document.getElementById('btnGuardarPass');

  // Abrir modal
  if (btnForgot) {
    btnForgot.addEventListener('click', (e) => {
      e.preventDefault();
      modalRecuperar.style.display = 'flex';
    });
  }

  // Cerrar modal
  if (btnCerrarModal) {
    btnCerrarModal.addEventListener('click', (e) => {
      e.preventDefault();
      modalRecuperar.style.display = 'none';
      document.getElementById('recoverEmail').value = '';
      document.getElementById('msgRecuperar').textContent = '';
    });
  }

  // Enviar enlace de recuperación (correo o SMS)
  if (btnEnviarRecuperar) {
    btnEnviarRecuperar.addEventListener('click', async () => {
      const msg        = document.getElementById('msgRecuperar');
      const token      = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const expira     = Date.now() + 15 * 60 * 1000;

      localStorage.setItem('resetToken',    token);
      localStorage.setItem('resetTokenExp', expira);

      const resetLink = `${window.location.origin}/paleteria/reset.html?reset=${token}&exp=${expira}`;

      btnEnviarRecuperar.disabled = true;
      msg.style.color   = '#6b7280';
      msg.textContent   = 'Enviando...';

      try {
        if (window.metodoRecuperar === 'sms') {
          // SMS vía Twilio Function
          let telefono = document.getElementById('recoverPhone').value.trim();
          if (!telefono) { msg.style.color='#e11d48'; msg.textContent='Ingresa tu número.'; btnEnviarRecuperar.disabled=false; return; }
          if (!telefono.startsWith('+')) telefono = '+52' + telefono.replace(/\D/g,'').slice(-10);
          localStorage.setItem('resetEmail', telefono);
          const linkSMS = resetLink + `&email=${encodeURIComponent(telefono)}`;

          await fetch(TWILIO_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `to=${encodeURIComponent(telefono)}&message=${encodeURIComponent('Naty Paletas: Restablece tu contraseña: ' + linkSMS)}`
          });

          // Con no-cors no podemos leer la respuesta, asumimos éxito si no hay excepción
          msg.style.color = '#16a34a';
          msg.textContent = '✅ SMS enviado a ' + telefono;

        } else if (window.metodoRecuperar === 'llamada') {
          let telefono = document.getElementById('recoverPhoneLlamada').value.trim();
          if (!telefono) { msg.style.color='#e11d48'; msg.textContent='Ingresa tu número.'; btnEnviarRecuperar.disabled=false; return; }
          if (!telefono.startsWith('+')) telefono = '+52' + telefono.replace(/\D/g,'').slice(-10);
          localStorage.setItem('resetEmail', telefono);
          const linkLlamada = resetLink + `&email=${encodeURIComponent(telefono)}`;
          const codigo = Math.floor(100000 + Math.random() * 900000);
          localStorage.setItem('codigoLlamada', codigo);

          await fetch(TWILIO_FUNCTION_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `to=${encodeURIComponent(telefono)}&message=${encodeURIComponent('Naty Paletas: Tu código de verificación es ' + codigo + '. Úsalo para restablecer tu contraseña.')}`
          });

          msg.style.color = '#16a34a';
          msg.textContent = '📞 SMS con código enviado a ' + telefono;

        } else if (window.metodoRecuperar === 'palabra') {
          const correo    = document.getElementById('recoverEmailPalabra').value.trim();
          const respuesta = document.getElementById('respuestaSecreta').value.trim().toLowerCase();

          if (!correo)    { msg.style.color='#e11d48'; msg.textContent='Ingresa tu correo.'; btnEnviarRecuperar.disabled=false; return; }
          if (!respuesta) { msg.style.color='#e11d48'; msg.textContent='Ingresa la respuesta secreta.'; btnEnviarRecuperar.disabled=false; return; }

          if (respuesta !== 'coco') {
            msg.style.color = '#e11d48';
            msg.textContent = '❌ Respuesta incorrecta.';
            btnEnviarRecuperar.disabled = false;
            return;
          }

          // Respuesta correcta → entrar directo al sistema
          localStorage.setItem('auth', 'true');
          localStorage.setItem('resetEmail', correo);
          msg.style.color = '#16a34a';
          msg.textContent = '✅ Correcto. Entrando...';
          setTimeout(() => { window.location.href = 'dashboard.html'; }, 1200);
          return;

        } else {
          // Email vía EmailJS
          const correo = document.getElementById('recoverEmail').value.trim();
          if (!correo) { msg.style.color='#e11d48'; msg.textContent='Ingresa tu correo.'; btnEnviarRecuperar.disabled=false; return; }
          localStorage.setItem('resetEmail', correo);
          const linkEmail = resetLink + `&email=${encodeURIComponent(correo)}`;

          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            email:   correo,
            link:    linkEmail,
            to_name: correo.split('@')[0],
          });
          msg.style.color = '#16a34a';
          msg.textContent = '✅ Correo enviado. Revisa tu bandeja.';
        }

        const recoverEmailEl = document.getElementById('recoverEmail');
        const recoverPhoneEl = document.getElementById('recoverPhone');
        if (recoverEmailEl) recoverEmailEl.value = '';
        if (recoverPhoneEl) recoverPhoneEl.value = '';

      } catch (err) {
        console.error('Error recuperación:', err);
        msg.style.color = '#e11d48';
        msg.textContent = 'Error al enviar. Intenta de nuevo.';
      } finally {
        btnEnviarRecuperar.disabled = false;
      }
    });
  }

  // Verificar si hay token de reset en la URL
  const params = new URLSearchParams(window.location.search);
  const tokenURL = params.get('reset');
  if (tokenURL) {
    const tokenGuardado = localStorage.getItem('resetToken');
    const expira = parseInt(localStorage.getItem('resetTokenExp') || '0');

    if (tokenURL === tokenGuardado && Date.now() < expira) {
      // Token válido → mostrar modal nueva contraseña
      modalNuevaPass.style.display = 'flex';
    } else {
      alert('El enlace de recuperación ha expirado o no es válido.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  // Guardar nueva contraseña
  if (btnGuardarPass) {
    btnGuardarPass.addEventListener('click', () => {
      const nueva = document.getElementById('nuevaPass').value;
      const confirmar = document.getElementById('confirmarPass').value;
      const msg = document.getElementById('msgNuevaPass');

      if (!nueva || !confirmar) {
        msg.style.color = '#e11d48';
        msg.textContent = 'Completa ambos campos.';
        return;
      }
      if (nueva !== confirmar) {
        msg.style.color = '#e11d48';
        msg.textContent = 'Las contraseñas no coinciden.';
        return;
      }
      if (nueva.length < 6) {
        msg.style.color = '#e11d48';
        msg.textContent = 'Mínimo 6 caracteres.';
        return;
      }

      const emailReset = localStorage.getItem('resetEmail');
      // Guardar nueva contraseña (en producción esto iría al backend)
      localStorage.setItem(`pass_${emailReset}`, nueva);
      localStorage.removeItem('resetToken');
      localStorage.removeItem('resetTokenExp');
      localStorage.removeItem('resetEmail');

      msg.style.color = '#16a34a';
      msg.textContent = '✅ Contraseña actualizada. Redirigiendo...';

      setTimeout(() => {
        modalNuevaPass.style.display = 'none';
        window.history.replaceState({}, '', window.location.pathname);
      }, 2000);
    });
  }

  // ==============================
  // USUARIOS REGISTRADOS
  // ==============================
  const usuarios = [
    { email: 'admin@paleteria.com', password: 'admin123', rol: 'admin' },
    { email: 'usuario@paleteria.com', password: 'user123', rol: 'usuario' },
    { email: 'vazqueshernan357@gmail.com', password: '123456', rol: 'usuario' },
  ];

  // 2. LÓGICA DE LOGIN
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailVal = document.getElementById('email').value.trim();
      const passVal = document.getElementById('password').value;

      // Verificar si hay contraseña reseteada para este correo
      const passReseteada = localStorage.getItem(`pass_${emailVal}`);
      const passValida = passReseteada || usuarios.find(u => u.email === emailVal)?.password;
      const usuarioValido = usuarios.find(u => u.email === emailVal);

      if (!usuarioValido) {
        alert('Correo no registrado.');
        return;
      }

      if (passVal !== passValida) {
        alert('Contraseña incorrecta.');
        return;
      }

      const sessionId = Date.now().toString(36) + Math.random().toString(36).substring(2);
      localStorage.setItem('auth', 'true');
      localStorage.setItem('userRol', usuarioValido.rol);
      localStorage.setItem('userEmail', emailVal);
      localStorage.setItem('sessionId', sessionId);
      window.location.href = 'dashboard.html';
    });
  }


  // 3. LÓGICA DEL BOTÓN SALIR
  const btnLogout = document.getElementById('logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('auth');
      window.location.href = 'index.html';
    });
  }

});
// ==============================
// EVENTOS DEL MOUSE
// ==============================

// Cuando el mouse pasa sobre un botón
document.addEventListener("mouseover", function(event){

  if(event.target.tagName === "BUTTON"){
    
    event.target.style.transform = "scale(1.05)";
    event.target.style.transition = "0.3s";
    event.target.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";

  }

});

// Cuando el mouse sale del botón
document.addEventListener("mouseout", function(event){

  if(event.target.tagName === "BUTTON"){

    event.target.style.transform = "scale(1)";
    event.target.style.boxShadow = "none";

  }
   if(event.target.tagName === "BUTTON"){

    const aviso = document.createElement("div");

    aviso.textContent = "Evento de mouse detectado 🖱️";
    
    aviso.style.position = "fixed";
    aviso.style.bottom = "20px";
    aviso.style.right = "20px";
    aviso.style.background = "#ec4899";
    aviso.style.color = "white";
    aviso.style.padding = "10px 20px";
    aviso.style.borderRadius = "10px";
    aviso.style.fontSize = "14px";
    aviso.style.zIndex = "9999";

    document.body.appendChild(aviso);

    setTimeout(()=>{
      aviso.remove();
    },2000);

  }
});


