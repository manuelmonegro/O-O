/**
 * ============================================================================
 * O - O | Experiencia Interactiva, Emotiva y Celestial
 * ============================================================================
 */

(function () {
  'use strict';

  // --- CONFIGURACIÓN DE NOTIFICACIONES ---
  // Endpoint de FormSubmit seguro para GitHub Pages sin exponer credenciales
  const _DEST = atob('bWFudWVsbW9uZWdyb3ZAZ21haWwuY29t'); // manuelmonegrov@gmail.com
  const ENDPOINT_URL = `https://formsubmit.co/ajax/${_DEST}`;

  // Control de eventos únicos en la sesión para no repetir correos innecesarios
  const sentEvents = {
    visit: Boolean(sessionStorage.getItem('oo_visit_sent')),
    reachedButtons: Boolean(sessionStorage.getItem('oo_buttons_sent')),
    triedNo: Boolean(sessionStorage.getItem('oo_no_sent')),
    clickedYes: Boolean(sessionStorage.getItem('oo_yes_sent'))
  };

  /**
   * Enviar notificación silenciosa por correo mediante FormSubmit
   * @param {string} subject - Asunto del correo
   * @param {string} description - Detalle del evento
   */
  async function notifyEvent(subject, description) {
    try {
      const payload = {
        _subject: `[O-O] ${subject}`,
        Evento: subject,
        Detalle: description,
        Fecha: new Date().toLocaleString('es-ES', { timeZoneName: 'short' }),
        Dispositivo: navigator.userAgent,
        Pantalla: `${window.innerWidth}x${window.innerHeight}`,
        _template: 'table',
        _captcha: 'false'
      };

      await fetch(ENDPOINT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      // Falla silenciosa para no interrumpir la experiencia visual
      console.debug('Telemetry error:', err);
    }
  }

  // 1. Notificación de visita inicial (espera 2.5 segundos para asegurar lectura)
  window.addEventListener('load', () => {
    if (!sentEvents.visit) {
      setTimeout(() => {
        notifyEvent(
          'Alguien ha entrado a la página',
          'El visitante abrió el enlace y está observando el atardecer y las estrellas.'
        );
        sentEvents.visit = true;
        sessionStorage.setItem('oo_visit_sent', '1');
      }, 2500);
    }
  });

  // --- 1. CANVAS: CIELO ESTRELLADO Y ESTRELLAS FUGACES ---
  const canvas = document.getElementById('sky-canvas');
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // Clase Estrella Titilante
  class Star {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.4;
      this.baseAlpha = Math.random() * 0.6 + 0.25;
      this.twinkleSpeed = Math.random() * 0.025 + 0.008;
      this.phase = Math.random() * Math.PI * 2;
      // Matices celestiales (blanco puro, azul suave, dorado tenue)
      const hues = [
        '255, 255, 255',
        '220, 235, 255',
        '255, 245, 220',
        '210, 220, 255'
      ];
      this.color = hues[Math.floor(Math.random() * hues.length)];
    }

    draw(time) {
      const alpha = this.baseAlpha + Math.sin(time * this.twinkleSpeed + this.phase) * 0.25;
      const clampedAlpha = Math.max(0.1, Math.min(1, alpha));

      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${clampedAlpha})`;
      ctx.shadowBlur = this.size * 3;
      ctx.shadowColor = `rgba(${this.color}, ${clampedAlpha * 0.8})`;
      ctx.fill();
      ctx.restore();
    }
  }

  // Clase Estrella Fugaz
  class ShootingStar {
    constructor() {
      this.reset();
    }

    reset() {
      this.active = false;
      this.x = 0;
      this.y = 0;
      this.length = 0;
      this.speed = 0;
      this.angle = 0;
      this.dx = 0;
      this.dy = 0;
      this.opacity = 0;
      this.life = 0;
      this.maxLife = 0;
    }

    spawn() {
      this.active = true;
      this.x = Math.random() * (width * 0.75);
      this.y = Math.random() * (height * 0.4);
      this.length = Math.random() * 140 + 80;
      this.speed = Math.random() * 14 + 12;
      this.angle = (Math.PI / 180) * (Math.random() * 20 + 35); // 35° a 55°
      this.dx = Math.cos(this.angle) * this.speed;
      this.dy = Math.sin(this.angle) * this.speed;
      this.opacity = 1;
      this.life = 0;
      this.maxLife = Math.random() * 45 + 35;
    }

    update() {
      if (!this.active) return;
      this.x += this.dx;
      this.y += this.dy;
      this.life++;

      // Desvanecimiento suave en la cola
      this.opacity = 1 - this.life / this.maxLife;

      if (this.life >= this.maxLife || this.x > width || this.y > height) {
        this.active = false;
      }
    }

    draw() {
      if (!this.active || this.opacity <= 0) return;

      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      ctx.save();
      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
      grad.addColorStop(0.2, `rgba(255, 230, 180, ${this.opacity * 0.8})`);
      grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(255, 240, 200, ${this.opacity})`;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Inicialización de estrellas
  const STAR_COUNT = Math.floor(Math.min(width, 1920) / 7);
  const stars = Array.from({ length: STAR_COUNT }, () => new Star());
  const shootingStars = Array.from({ length: 3 }, () => new ShootingStar());

  // Programador de estrellas fugaces periódicas
  function scheduleShootingStar() {
    const inactive = shootingStars.find((s) => !s.active);
    if (inactive) {
      inactive.spawn();
    }
    const nextInterval = Math.random() * 4000 + 2500; // Cada 2.5 a 6.5 segundos
    setTimeout(scheduleShootingStar, nextInterval);
  }
  setTimeout(scheduleShootingStar, 1500);

  // Bucle de animación del cielo
  let animTime = 0;
  function animateSky() {
    ctx.clearRect(0, 0, width, height);

    // Renderizar estrellas
    for (let i = 0; i < stars.length; i++) {
      stars[i].draw(animTime);
    }

    // Renderizar estrellas fugaces
    for (let i = 0; i < shootingStars.length; i++) {
      shootingStars[i].update();
      shootingStars[i].draw();
    }

    animTime += 1;
    requestAnimationFrame(animateSky);
  }
  requestAnimationFrame(animateSky);

  // Redimensionado del canvas y reajuste de posiciones
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars.forEach((s) => s.reset());
    if (isScared && btnNo && btnYes) {
      const hidePos = getHideOffsetBehindYes(slapCount);
      btnNo.style.setProperty('--scared-x', `${hidePos.x.toFixed(2)}px`);
      btnNo.style.setProperty('--scared-y', `${hidePos.y.toFixed(2)}px`);
    }
  });

  // --- 2. EFECTO DE SCROLL: TRANSICIÓN DE ATARDECER Y COLINA A NOCHE OSCURA ---
  const scrollPrompt = document.getElementById('scroll-prompt');
  const letterSection = document.getElementById('letter-section');

  function handleScroll() {
    const scrollY = window.scrollY || window.pageYOffset;
    const triggerHeight = window.innerHeight * 0.75;
    const ratio = Math.min(Math.max(scrollY / triggerHeight, 0), 1);

    document.documentElement.style.setProperty('--scroll-ratio', ratio.toFixed(3));
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Scroll suave al hacer clic en el botón de bajar la colina
  if (scrollPrompt) {
    scrollPrompt.addEventListener('click', () => {
      letterSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- 3. OBSERVER PARA DETECTAR SI LEYÓ EL MENSAJE O LLEGÓ A VERLO ---
  const buttonsSection = document.getElementById('question-container');
  if (buttonsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !sentEvents.reachedButtons) {
            notifyEvent(
              'Leyó tu mensaje 📜',
              'El visitante bajó la colina, leyó la carta y llegó a ver la pregunta "¿Podemos resolverlo?".'
            );
            sentEvents.reachedButtons = true;
            sessionStorage.setItem('oo_buttons_sent', '1');
          }
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(buttonsSection);
  }

  // --- 4. FÍSICA Y MANEJO DEL BOTÓN "NO" CON GOLPE DE MANO ---
  const btnNo = document.getElementById('btn-no');
  const btnYes = document.getElementById('btn-yes');
  const virtualCursor = document.getElementById('virtual-cursor');
  const slapHand = document.getElementById('slap-hand');
  const slapSign = document.getElementById('slap-sign');

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let dodgeCount = 0;

  // Control del golpe de la mano (máximo 2 veces) y congelamiento
  let slapCount = 0;
  const MAX_SLAPS = 2;
  let isFrozen = false;
  let isScared = false;

  // Cálculo exacto de coordenadas para esconderse detrás del botón "Sí"
  function getHideOffsetBehindYes(step) {
    if (!btnNo || !btnYes) return { x: 0, y: 0 };
    // Distancia natural entre los dos botones en el contenedor
    const deltaX = btnYes.offsetLeft - btnNo.offsetLeft;
    const deltaY = btnYes.offsetTop - btnNo.offsetTop;
    const centerDiffX = (btnYes.offsetWidth - btnNo.offsetWidth) / 2;
    const centerDiffY = (btnYes.offsetHeight - btnNo.offsetHeight) / 2;

    // En el 1er golpe se esconde asomándose tímidamente por la derecha (+26px)
    // En el 2do golpe se esconde asomándose por la izquierda (-26px)
    const peekX = step === 1 ? 26 : -26;
    const peekY = 4;

    return {
      x: deltaX + centerDiffX + peekX,
      y: deltaY + centerDiffY + peekY
    };
  }

  function triggerSlapAndFreeze(cursorX, cursorY) {
    if (isFrozen || slapCount >= MAX_SLAPS) return;
    slapCount++;
    isFrozen = true;

    // Posicionar cursor virtual exactamente donde estaba el mouse
    if (virtualCursor) {
      virtualCursor.style.setProperty('--cx', `${cursorX}px`);
      virtualCursor.style.setProperty('--cy', `${cursorY}px`);
      virtualCursor.className = 'virtual-cursor visible slapped';
    }

    // Posicionar mano y disparar animación de bofetada
    if (slapHand) {
      slapHand.style.setProperty('--hx', `${cursorX - 45}px`);
      slapHand.style.setProperty('--hy', `${cursorY - 85}px`);
      slapHand.className = 'slap-hand striking';
    }

    // Momento del impacto (~220ms): Aparece el signo cómico '!' y el botón huye detrás de Sí
    setTimeout(() => {
      if (slapSign) {
        slapSign.style.setProperty('--sx', `${cursorX - 22}px`);
        slapSign.style.setProperty('--sy', `${cursorY - 20}px`);
        slapSign.className = 'slap-sign pop';
      }

      // El botón NO huye aterrorizado y se esconde detrás del botón SÍ temblando
      if (btnNo && btnYes) {
        const hidePos = getHideOffsetBehindYes(slapCount);
        isScared = true;
        btnNo.classList.remove('scared');
        btnNo.classList.add('fleeing');
        btnNo.style.transform = `translate3d(${hidePos.x.toFixed(2)}px, ${hidePos.y.toFixed(2)}px, 0) scale(0.92)`;

        targetX = hidePos.x;
        targetY = hidePos.y;
        currentX = hidePos.x;
        currentY = hidePos.y;

        // Al llegar detrás de Sí, activar el temblor de miedo continuo
        setTimeout(() => {
          btnNo.classList.remove('fleeing');
          btnNo.style.transition = 'none';
          btnNo.style.setProperty('--scared-x', `${hidePos.x.toFixed(2)}px`);
          btnNo.style.setProperty('--scared-y', `${hidePos.y.toFixed(2)}px`);
          btnNo.classList.add('scared');
        }, 280);
      }
    }, 220);

    // Ocultar cursor nativo para simular el congelamiento
    document.body.classList.add('cursor-frozen');

    // Mantener quieto por exactamente 1 segundo (1000ms)
    setTimeout(() => {
      document.body.classList.remove('cursor-frozen');
      if (virtualCursor) {
        virtualCursor.className = 'virtual-cursor';
        virtualCursor.style.transform = 'translate(-999px, -999px)';
      }
      if (slapHand) {
        slapHand.className = 'slap-hand';
        slapHand.style.transform = 'translate(-999px, -999px)';
      }
      if (slapSign) {
        slapSign.className = 'slap-sign';
        slapSign.style.transform = 'translate(-999px, -999px)';
      }
      isFrozen = false;
    }, 1000);
  }

  // Variables para medir velocidad del mouse
  let lastMouseX = null;
  let lastMouseY = null;
  let lastMouseTime = performance.now();
  let mouseVelocity = 0; // px / ms

  const INFLUENCE_RADIUS = 210;

  function updateMouseVelocity(e) {
    const now = performance.now();
    const dt = Math.max(now - lastMouseTime, 10);

    if (lastMouseX !== null && lastMouseY !== null) {
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      const dist = Math.hypot(dx, dy);
      mouseVelocity = dist / dt;
    }

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    lastMouseTime = now;
  }

  function handleMouseMove(e) {
    if (isFrozen) return; // Si el cursor está congelado por la mano, no se mueve

    updateMouseVelocity(e);
    if (!btnNo) return;

    const rect = btnNo.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const deltaX = btnCenterX - e.clientX;
    const deltaY = btnCenterY - e.clientY;
    const distance = Math.hypot(deltaX, deltaY);

    // Si se acerca mucho y está por hacerle clic, golpea la mano (máximo 2 veces)
    if (distance < 88 && slapCount < MAX_SLAPS) {
      triggerSlapAndFreeze(e.clientX, e.clientY);
      return;
    }

    // Evasión ultrarrápida antes de que sea golpeado y se esconda detrás de Sí
    if (distance < INFLUENCE_RADIUS && !isScared) {
      dodgeCount++;

      const nx = deltaX / (distance || 1);
      const ny = deltaY / (distance || 1);
      // Rampa de aceleración inmediata a media distancia
      const closeness = Math.pow(1 - distance / INFLUENCE_RADIUS, 0.7);
      const speedMultiplier = Math.min(Math.max(mouseVelocity * 65, 25), 180);
      const pushForce = closeness * (52 + speedMultiplier);

      targetX += nx * pushForce;
      targetY += ny * pushForce;

      const maxLimitX = Math.min(window.innerWidth * 0.38, 300);
      const maxLimitY = Math.min(window.innerHeight * 0.26, 190);

      // Esquiva lateral si intentan acorralarlo contra las paredes
      if (Math.abs(targetX) > maxLimitX * 0.78) {
        targetY += (targetY >= 0 ? -1 : 1) * 75;
      }
      if (Math.abs(targetY) > maxLimitY * 0.78) {
        targetX += (targetX >= 0 ? -1 : 1) * 75;
      }

      if (Math.abs(targetX) > maxLimitX) {
        targetX = Math.sign(targetX) * (maxLimitX - 10);
      }
      if (Math.abs(targetY) > maxLimitY) {
        targetY = Math.sign(targetY) * (maxLimitY - 10);
      }
    }
  }

  // Acción al presionar NO: si aún quedan golpes disponibles, golpea; si ya pasaron los 2 golpes, redirige a no.html
  async function handleNoChoice(e) {
    if (slapCount < MAX_SLAPS) {
      const clickX = e && e.clientX ? e.clientX : window.innerWidth / 2;
      const clickY = e && e.clientY ? e.clientY : window.innerHeight / 2;
      triggerSlapAndFreeze(clickX, clickY);
      return;
    }

    if (!sentEvents.triedNo) {
      sentEvents.triedNo = true;
      sessionStorage.setItem('oo_no_sent', '1');
      await notifyEvent(
        'Eligió "No" 💔',
        'El visitante presionó "No". Se le redirigió a la página con el mensaje: "Okay, entiendo que estes molesto y entiendo porque asi que ya no te molestare, pido disculpas si te envio algun mensaje o otra cosa".'
      );
    }
    window.location.href = 'no.html';
  }

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
  if (btnNo) {
    btnNo.addEventListener('click', (e) => {
      e.preventDefault();
      handleNoChoice(e);
    });
    btnNo.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleNoChoice(touch || e);
    }, { passive: false });
  }

  // Animación física suavizada ultrarrápida a 60 FPS
  function physicsLoop() {
    if (btnNo) {
      if (!isScared && !btnNo.classList.contains('fleeing') && !btnNo.classList.contains('scared')) {
        // Interpolación acelerada (0.38 en lugar de 0.16) para reacción como un rayo
        currentX += (targetX - currentX) * 0.38;
        currentY += (targetY - currentY) * 0.38;
        btnNo.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }
    }
    requestAnimationFrame(physicsLoop);
  }
  requestAnimationFrame(physicsLoop);

  // --- 5. ACCIÓN AL PULSAR "SÍ": ACTUALIZA LA PÁGINA Y NOTIFICA POR CORREO ---
  if (btnYes) {
    btnYes.addEventListener('click', async () => {
      // Enviar notificación prioritaria
      if (!sentEvents.clickedYes) {
        sentEvents.clickedYes = true;
        sessionStorage.setItem('oo_yes_sent', '1');
        await notifyEvent(
          '¡ELIGIERON SÍ! 🎉',
          'El visitante ha pulsado "Sí" y fue redirigido a la página si.html con la invitación para salir a comer o jugar Marvel Rivals / Party Machine (sin bullying).'
        );
      }
      window.location.href = 'si.html';
    });
  }

  /**
   * Generar destellos de luz al confirmar con SÍ
   */
  function createSparkleExplosion(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (let i = 0; i < 28; i++) {
      const spark = document.createElement('div');
      spark.style.position = 'fixed';
      spark.style.left = `${centerX}px`;
      spark.style.top = `${centerY}px`;
      spark.style.width = `${Math.random() * 8 + 4}px`;
      spark.style.height = spark.style.width;
      spark.style.borderRadius = '50%';
      spark.style.backgroundColor = ['#10b981', '#34d399', '#fef08a', '#ffffff'][
        Math.floor(Math.random() * 4)
      ];
      spark.style.boxShadow = `0 0 12px ${spark.style.backgroundColor}`;
      spark.style.pointerEvents = 'none';
      spark.style.zIndex = '9999';
      spark.style.transition = 'transform 1s cubic-bezier(0.1, 1, 0.1, 1), opacity 1s ease-out';

      document.body.appendChild(spark);

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 180 + 60;
      const destX = Math.cos(angle) * speed;
      const destY = Math.sin(angle) * speed;

      requestAnimationFrame(() => {
        spark.style.transform = `translate(${destX}px, ${destY}px) scale(0)`;
        spark.style.opacity = '0';
      });

      setTimeout(() => {
        spark.remove();
      }, 1000);
    }
  }
})();
