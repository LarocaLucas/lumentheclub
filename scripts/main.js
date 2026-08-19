/**
 * LUMEN THE CLUB — main.js
 *
 * Logica da pagina home:
 * - Navegacao (scroll, hamburger mobile, smooth scroll)
 * - Canvas de particulas bokeh douradas (hero)
 * - GSAP: efeito "texto eco", scroll reveals, glow pulsante
 * - Renderizacao dinamica dos cards de programacao
 *
 * Dependencias: GSAP + ScrollTrigger (via npm)
 */

'use strict';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


/* ═══════════════════════════════════════════════════════════
   PROGRAMACAO DA SEMANA
   
   Edite este array para atualizar a grade de eventos.
   O site renderiza automaticamente a partir destes dados.
   ═══════════════════════════════════════════════════════════ */

// Substituir pelo link publico temporario do R2 (ex: https://pub-1234.r2.dev)
const R2_BASE = 'https://pub-a310d53da94b402fbe5eefd9ab47216b.r2.dev';

const PROGRAMACAO = [
  {
    dia: 'Sexta',
    data: '21/08',
    nome: 'Lumen Sessions',
    destaque: false,
    media: '21-08.mp4',
  },
  {
    dia: 'Sábado',
    data: '22/08',
    nome: 'The Glow Night',
    destaque: true,
  },
];

/** Link oficial de reservas via WhatsApp */
const WHATSAPP_RESERVAS = 'https://api.whatsapp.com/send/?phone=5542999103037&text=Gostaria+de+fazer+uma+reserva.&type=phone_number&app_absent=0';


/* ═══════════════════════════════════════════════════════════
   NAVEGACAO
   ═══════════════════════════════════════════════════════════ */

/**
 * Inicializa a navegacao: navbar solido no scroll,
 * hamburger mobile, overlay, smooth scroll nos links internos.
 */
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');
  const links = navLinks.querySelectorAll('.nav__link');

  /* Navbar solido quando o usuario rola a pagina */
  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('nav--scrolled');
    } else {
      navbar.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Estado inicial

  /* Hamburger mobile: abre/fecha o menu lateral */
  function toggleMenu() {
    const isOpen = hamburger.classList.toggle('nav__hamburger--open');
    navLinks.classList.toggle('nav__links--open', isOpen);
    overlay.classList.toggle('nav__overlay--visible', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  /* Fechar menu ao clicar em um link */
  links.forEach(function (link) {
    link.addEventListener('click', function () {
      if (navLinks.classList.contains('nav__links--open')) {
        toggleMenu();
      }
    });
  });

  /* Smooth scroll para links com hash (ex: #programacao) */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   PARTICULAS BOKEH (HERO)
   
   Canvas leve com circulos dourados em movimento suave.
   Simula luzes desfocadas (bokeh) da casa noturna.
   Sem WebGL, sem impacto em mobile.
   ═══════════════════════════════════════════════════════════ */

function initBokehParticles() {
  const canvas = document.getElementById('heroParticles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let particles = [];

  /* Quantidade de particulas baseada no tamanho da tela */
  function getParticleCount() {
    const area = window.innerWidth * window.innerHeight;
    return Math.min(Math.floor(area / 18000), 50);
  }

  /** Redimensiona o canvas para cobrir o hero inteiro */
  function resizeCanvas() {
    const hero = canvas.parentElement;
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  /** Cria uma particula com propriedades aleatorias */
  function createParticle() {
    const goldHues = [
      'rgba(201, 162, 76,',   // Dourado
      'rgba(232, 201, 122,',  // Champagne
      'rgba(168, 92, 50,',    // Cobre
    ];

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      color: goldHues[Math.floor(Math.random() * goldHues.length)],
      opacity: Math.random() * 0.4 + 0.05,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.2,
      pulseSpeed: Math.random() * 0.01 + 0.005,
      pulseOffset: Math.random() * Math.PI * 2,
    };
  }

  /** Inicializa o array de particulas */
  function initParticles() {
    particles = [];
    const count = getParticleCount();
    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  /** Loop de animacao: move e desenha cada particula */
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const time = Date.now() * 0.001;

    particles.forEach(function (p) {
      /* Movimento suave */
      p.x += p.speedX;
      p.y += p.speedY;

      /* Wrap around nas bordas */
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;

      /* Pulsacao de opacidade */
      const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset);
      const currentOpacity = p.opacity + pulse * 0.15;

      /* Desenha a particula com blur radial (efeito bokeh) */
      const gradient = ctx.createRadialGradient(
        p.x, p.y, 0,
        p.x, p.y, p.radius * 4
      );
      gradient.addColorStop(0, p.color + Math.max(0.05, currentOpacity) + ')');
      gradient.addColorStop(0.5, p.color + Math.max(0.02, currentOpacity * 0.4) + ')');
      gradient.addColorStop(1, p.color + '0)');

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    animationId = requestAnimationFrame(animate);
  }

  /* Inicializacao */
  resizeCanvas();
  initParticles();
  animate();

  /* Resize: recalcula canvas e particulas */
  let resizeTimeout;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      resizeCanvas();
      initParticles();
    }, 200);
  });

  /* Pausa animacao quando o hero nao esta visivel (performance) */
  const heroObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        if (!animationId) animate();
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    });
  }, { threshold: 0.1 });

  heroObserver.observe(canvas.parentElement);
}


/* ═══════════════════════════════════════════════════════════
   GSAP ANIMACOES
   ═══════════════════════════════════════════════════════════ */

/**
 * Efeito "texto eco": outline empilhado atras do texto solido.
 * O texto em outline "ecoa" e se assenta quando entra na viewport.
 * Usado nos titulos de secao (Hero, Programacao).
 */
function initEchoTextEffect() {
  const echoTexts = document.querySelectorAll('.echo-text');

  echoTexts.forEach(function (container) {
    const layers = container.querySelectorAll('.echo-text__layer');
    
    layers.forEach(function (layer, index) {
      /* Posiciona cada camada de eco com offset */
      const offset = (index + 1) * 6;
      const scaleOffset = 1 + (index + 1) * 0.02;

      gsap.set(layer, {
        y: -offset * 2,
        x: offset * 0.5,
        scale: scaleOffset,
        opacity: 0,
      });

      /* Anima a entrada quando o texto aparece na viewport */
      gsap.to(layer, {
        y: -offset,
        x: offset * 0.3,
        scale: scaleOffset,
        opacity: 0.3 - index * 0.1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    });
  });
}

/**
 * Scroll reveals: elementos com classe .reveal aparecem
 * suavemente ao entrar na viewport.
 */
function initScrollReveals() {
  /* Reveal de baixo para cima */
  gsap.utils.toArray('.reveal').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  /* Reveal da esquerda */
  gsap.utils.toArray('.reveal--left').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  /* Reveal da direita */
  gsap.utils.toArray('.reveal--right').forEach(function (el) {
    gsap.to(el, {
      opacity: 1,
      x: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });
  });
}

/**
 * Animacao de entrada do hero: logo, tagline e CTAs
 * aparecem em sequencia ao carregar a pagina.
 */
function initHeroAnimation() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  tl.from('.hero__logo', {
    opacity: 0,
    scale: 0.8,
    duration: 1.2,
  })
  .from('.hero__tagline', {
    opacity: 0,
    y: 20,
    duration: 0.8,
  }, '-=0.5')
  .from('.hero__subtitle', {
    opacity: 0,
    y: 15,
    duration: 0.6,
  }, '-=0.4')
  .from('.hero__ctas', {
    opacity: 0,
    y: 20,
    duration: 0.6,
  }, '-=0.3')
  .from('.hero__scroll', {
    opacity: 0,
    duration: 0.6,
  }, '-=0.2');
}


/* ═══════════════════════════════════════════════════════════
   PROGRAMACAO — RENDERIZACAO
   ═══════════════════════════════════════════════════════════ */

/**
 * Renderiza os cards de programacao da semana a partir do
 * array PROGRAMACAO definido no topo deste arquivo.
 *
 * Quando o array esta vazio, exibe mensagem informativa
 * com link para o WhatsApp/Instagram.
 */
function renderProgramacao() {
  const grid = document.getElementById('programacaoGrid');
  if (!grid) return;

  /* Se nao ha eventos definidos, exibe mensagem */
  if (PROGRAMACAO.length === 0) {
    grid.innerHTML = `
      <div class="programacao__empty">
        <p class="programacao__empty-text">
          A programacao desta semana sera divulgada em breve.<br>
          Fique de olho no nosso Instagram para novidades.
        </p>
        <a href="https://instagram.com/lumentheclub_" target="_blank" rel="noopener" class="btn btn--secondary">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Seguir @lumentheclub_
        </a>
      </div>
    `;
    return;
  }

  /* Renderiza um card para cada evento */
  grid.innerHTML = PROGRAMACAO.map(function (evento) {
    return `
      <article class="programacao__card reveal" ${evento.destaque ? 'style="border-color: var(--color-gold-20);"' : ''}>
        <span class="programacao__card-day">${evento.dia}</span>
        <span class="programacao__card-date">${evento.data}</span>
        <h3 class="programacao__card-name">${evento.nome}</h3>
        ${evento.media 
          ? `<div class="programacao__card-media">
               <video src="${R2_BASE}/agenda/${evento.media}" autoplay loop muted playsinline></video>
             </div>`
          : `<div class="programacao__card-image-placeholder">Arte / Vídeo<br>(4:5)</div>`
        }
        <div class="programacao__card-cta">
          <a href="${WHATSAPP_RESERVAS}" target="_blank" rel="noopener" class="btn btn--ghost">
            Reservar
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>
      </article>
    `;
  }).join('');
}


/* ═══════════════════════════════════════════════════════════
   INICIALIZACAO
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  initBokehParticles();
  renderProgramacao();

  /* GSAP: aguardar fontes carregarem para posicionamento correto */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      initHeroAnimation();
      initEchoTextEffect();
      initScrollReveals();
    });
  } else {
    /* Fallback para navegadores sem API de fontes */
    setTimeout(function () {
      initHeroAnimation();
      initEchoTextEffect();
      initScrollReveals();
    }, 300);
  }
});
