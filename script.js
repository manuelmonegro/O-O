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

  // Redimensionado del canvas
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars.forEach((s) => s.reset());
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

  // --- 4. FÍSICA Y MANEJO DEL BOTÓN "NO" ---
  const btnNo = document.getElementById('btn-no');
  const btnYes = document.getElementById('btn-yes');

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let dodgeCount = 0;

  // Variables para medir velocidad del mouse
  let lastMouseX = null;
  let lastMouseY = null;
  let lastMouseTime = performance.now();
  let mouseVelocity = 0; // px / ms

  const INFLUENCE_RADIUS = 140;

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
    updateMouseVelocity(e);
    if (!btnNo) return;

    const rect = btnNo.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;

    const deltaX = btnCenterX - e.clientX;
    const deltaY = btnCenterY - e.clientY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance < INFLUENCE_RADIUS) {
      dodgeCount++;
      // Si intenta varias veces, reduce la evasión para permitirle clickear si está decidido
      const dampFactor = dodgeCount > 4 ? 0.35 : 1;

      const nx = deltaX / (distance || 1);
      const ny = deltaY / (distance || 1);
      const closeness = 1 - distance / INFLUENCE_RADIUS;
      const speedMultiplier = Math.min(Math.max(mouseVelocity * 45, 6), 90);
      const pushForce = closeness * (20 + speedMultiplier) * dampFactor;

      targetX += nx * pushForce;
      targetY += ny * pushForce;

      const maxLimitX = Math.min(window.innerWidth * 0.32, 240);
      const maxLimitY = Math.min(window.innerHeight * 0.22, 160);

      if (Math.abs(targetX) > maxLimitX) {
        targetX = Math.sign(targetX) * (maxLimitX - 15);
      }
      if (Math.abs(targetY) > maxLimitY) {
        targetY = Math.sign(targetY) * (maxLimitY - 15);
      }
    }
  }

  // Acción al presionar NO: notifica por correo y redirige a no.html
  async function handleNoChoice() {
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
      handleNoChoice();
    });
    btnNo.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleNoChoice();
    }, { passive: false });
  }

  // Animación física suavizada a 60 FPS
  function physicsLoop() {
    if (btnNo) {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      btnNo.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
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
          'El visitante ha pulsado "Sí" y fue redirigido a la página si.html con la invitación para salir y comer.'
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
