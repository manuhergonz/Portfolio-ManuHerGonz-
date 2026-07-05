// Preferencia de accesibilidad: el usuario pide menos movimiento
const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ==================== NAVBAR ====================

// Clase al hacer scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('navbar--scrolled', window.scrollY > 50);
}, { passive: true });

// Resaltar link activo según la sección visible
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.navbar__links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach((section) => navObserver.observe(section));

// Scroll suave para los links del navbar
navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ==================== REVEAL AL HACER SCROLL ====================

// A los hijos de un grupo [data-reveal-stagger] se les asigna
// un retardo escalonado para que entren uno tras otro
document.querySelectorAll('[data-reveal-stagger]').forEach((grupo) => {
  Array.from(grupo.children).forEach((hijo, indice) => {
    if (!hijo.hasAttribute('data-reveal')) {
      hijo.setAttribute('data-reveal', '');
    }
    hijo.style.setProperty('--reveal-delay', `${(indice * 0.09).toFixed(2)}s`);
  });
});

const elementosReveal = document.querySelectorAll('[data-reveal], [data-animate]');

if (prefiereMenosMovimiento) {
  elementosReveal.forEach((el) => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      el.classList.add('is-visible');
      revealObserver.unobserve(el);

      // Al terminar la transición se limpia el estado reveal para
      // que los efectos hover de las tarjetas recuperen la prioridad
      if (el.hasAttribute('data-reveal')) {
        const limpiar = (evento) => {
          if (evento.target !== el) return;
          el.removeAttribute('data-reveal');
          el.classList.remove('is-visible');
          el.style.removeProperty('--reveal-delay');
          el.removeEventListener('transitionend', limpiar);
        };
        el.addEventListener('transitionend', limpiar);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  elementosReveal.forEach((el) => revealObserver.observe(el));
}

// ==================== PARALLAX ====================

// Cada capa [data-parallax] se desplaza a su propia velocidad;
// se actualiza con requestAnimationFrame para no saturar el scroll
const capasParallax = document.querySelectorAll('[data-parallax]');

if (!prefiereMenosMovimiento && capasParallax.length > 0) {
  let pendiente = false;

  const actualizarParallax = () => {
    capasParallax.forEach((capa) => {
      const velocidad = parseFloat(capa.dataset.parallax) || 0;
      capa.style.transform = `translate3d(0, ${window.scrollY * velocidad}px, 0)`;
    });
    pendiente = false;
  };

  window.addEventListener('scroll', () => {
    if (!pendiente) {
      window.requestAnimationFrame(actualizarParallax);
      pendiente = true;
    }
  }, { passive: true });

  actualizarParallax();
}

// ==================== FOOTER ====================

// Año actual automático
const footerYear = document.getElementById('footerYear');
if (footerYear) {
  footerYear.textContent = new Date().getFullYear();
}
