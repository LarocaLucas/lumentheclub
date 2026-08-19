/**
 * LUMEN THE CLUB — galeria.js
 *
 * Gerencia a exibicao de fotos por album/evento.
 * Fotos servidas do Cloudflare R2 (bucket lumen-the-club).
 *
 * ─────────────────────────────────────────────────────
 * COMO ADICIONAR UM NOVO ALBUM:
 *   1. Suba as fotos para o bucket R2 na pasta correspondente
 *      (ex: "RODAGEM LUMEN/01.jpg", "RODAGEM LUMEN/02.jpg", ...)
 *   2. Adicione uma entrada no array ALBUNS abaixo:
 *      { folder: 'NOME DA PASTA', label: 'Nome Exibido', total: N }
 *   3. Commit e deploy. O site renderiza automaticamente.
 * ─────────────────────────────────────────────────────
 */

'use strict';


/* ═══════════════════════════════════════════════════════════
   CONFIGURACAO
   ═══════════════════════════════════════════════════════════ */

/**
 * URL base do bucket R2 com dominio customizado.
 * Exemplo: https://fotos.lumentheclub.com.br
 * 
 * PLACEHOLDER: atualizar quando o subdominio for configurado
 * no Cloudflare (R2 > Custom Domain).
 */
const R2_BASE = 'https://pub-a310d53da94b402fbe5eefd9ab47216b.r2.dev';

/**
 * Registro de albuns disponiveis na galeria.
 * Cada album corresponde a uma pasta no bucket R2.
 *
 * @type {Array<{folder: string, label: string, total: number}>}
 * 
 * - folder: nome exato da pasta no R2 (case-sensitive)
 * - label: nome exibido no site (para o usuario)
 * - total: quantidade de fotos no album (numeradas de 01 ate N)
 */
const ALBUNS = [
  { folder: 'RODAGEM LUMEN', label: 'Rodagem Lumen', total: 200 },
  { folder: 'INAUGURACAO', label: 'Inauguração', total: 50 },
];

/**
 * Quantidade de fotos carregadas por vez (lazy loading em lotes).
 * Alterado para 200 para carregar todas as miniaturas de uma vez (já que o proxy wsrv as deixou leves).
 */
const BATCH_SIZE = 200;


/* ═══════════════════════════════════════════════════════════
   ESTADO
   ═══════════════════════════════════════════════════════════ */

let activeAlbumIndex = 0;
let loadedCount = 0;
let isLoading = false;
let lightboxCurrentIndex = 0;
let lightboxPhotos = [];


/* ═══════════════════════════════════════════════════════════
   NAVEGACAO (compartilhada com home)
   ═══════════════════════════════════════════════════════════ */

function initNavigation() {
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('navOverlay');

  if (!hamburger || !navLinks) return;

  function toggleMenu() {
    const isOpen = hamburger.classList.toggle('nav__hamburger--open');
    navLinks.classList.toggle('nav__links--open', isOpen);
    if (overlay) overlay.classList.toggle('nav__overlay--visible', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', toggleMenu);

  navLinks.querySelectorAll('.nav__link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (navLinks.classList.contains('nav__links--open')) {
        toggleMenu();
      }
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   FILTRO DE ALBUNS
   ═══════════════════════════════════════════════════════════ */

/**
 * Renderiza os botoes de filtro de album.
 * Se so existe um album, o filtro e omitido.
 */
function renderFiltro() {
  const filtroContainer = document.getElementById('galeriaFiltro');
  if (!filtroContainer) return;

  /* Se so ha um album, nao precisa de filtro */
  if (ALBUNS.length <= 1) {
    filtroContainer.style.display = 'none';
    return;
  }

  filtroContainer.innerHTML = ALBUNS.map(function (album, index) {
    const activeClass = index === activeAlbumIndex ? 'galeria-filtro__btn--active' : '';
    return `<button class="galeria-filtro__btn ${activeClass}" 
                    data-index="${index}"
                    aria-label="Filtrar por ${album.label}">
              ${album.label}
            </button>`;
  }).join('');

  /* Listeners nos botoes */
  filtroContainer.querySelectorAll('.galeria-filtro__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const index = parseInt(this.dataset.index);
      if (index === activeAlbumIndex) return;

      activeAlbumIndex = index;
      loadedCount = 0;

      /* Atualiza estado visual dos botoes */
      filtroContainer.querySelectorAll('.galeria-filtro__btn').forEach(function (b) {
        b.classList.remove('galeria-filtro__btn--active');
      });
      this.classList.add('galeria-filtro__btn--active');

      renderGrid();
      loadNextBatch();
    });
  });
}


/* ═══════════════════════════════════════════════════════════
   GRID DE FOTOS
   ═══════════════════════════════════════════════════════════ */

/**
 * Gera a URL de uma foto no R2.
 * Fotos sao numeradas com zero-pad de 2 digitos (01, 02, ..., 200).
 *
 * @param {string} folder - Nome da pasta no R2
 * @param {number} num - Numero da foto
 * @returns {string} URL completa da foto
 */
function getPhotoUrl(folder, num) {
  const padded = String(num).padStart(2, '0');
  return `${R2_BASE}/${encodeURIComponent(folder)}/${padded}.jpg`;
}

/**
 * Limpa o grid e prepara para novo carregamento.
 */
function renderGrid() {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  if (window.galeriaObserver) {
    window.galeriaObserver.disconnect();
  }
  
  // Remove empty state se existir
  const emptyState = document.getElementById('galeriaEmptyState');
  if (emptyState) emptyState.remove();
}

/**
 * Carrega o proximo lote de fotos (lazy loading em batches).
 * Adiciona BATCH_SIZE fotos ao grid a cada chamada.
 */
function loadNextBatch() {
  if (isLoading) return;

  const album = ALBUNS[activeAlbumIndex];
  if (!album || loadedCount >= album.total) return;

  isLoading = true;
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;

  const end = Math.min(loadedCount + BATCH_SIZE, album.total);
  const fragment = document.createDocumentFragment();

  for (let i = loadedCount + 1; i <= end; i++) {
    const url = getPhotoUrl(album.folder, i);
    const item = createPhotoItem(url, i, album.total);
    fragment.appendChild(item);
  }

  grid.appendChild(fragment);
  loadedCount = end;
  isLoading = false;

  /* Atualiza a lista de fotos para o lightbox */
  updateLightboxPhotos();
  
  /* Reconecta o observer no novo ultimo elemento */
  reconnectObserver();
}

/**
 * Reconecta o Intersection Observer ao ultimo item da galeria
 * para garantir que o scroll infinito continue funcionando.
 */
function reconnectObserver() {
  if (!window.galeriaObserver) return;
  
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;
  
  const items = grid.querySelectorAll('.galeria-grid__item');
  if (items.length === 0) return;
  
  // Desconecta do anterior e observa o ultimo
  window.galeriaObserver.disconnect();
  const lastItem = items[items.length - 1];
  window.galeriaObserver.observe(lastItem);
}

/**
 * Cria um elemento DOM para uma foto do grid.
 *
 * @param {string} url - URL da foto
 * @param {number} num - Numero da foto
 * @param {number} total - Total de fotos no album
 * @returns {HTMLElement} Elemento da foto
 */
function createPhotoItem(url, num, total) {
  const item = document.createElement('div');
  item.className = 'galeria-grid__item';
  item.dataset.index = num - 1;
  item.dataset.url = url;

  /* Skeleton loader enquanto a imagem carrega */
  item.classList.add('galeria-grid__skeleton');

  /* Imagem com lazy loading nativo e async decoding para performance */
  /* Utilizamos um proxy publico (wsrv.nl) temporariamente para gerar miniaturas fluidas */
  const cleanUrl = url.replace('https://', '');
  const thumbUrl = `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&w=400&output=webp&q=70`;
  
  const img = document.createElement('img');
  img.loading = 'lazy';
  img.decoding = 'async';
  img.alt = `Foto ${num} de ${total}`;
  // Usamos a miniatura no grid, mas guardamos a original no dataset
  img.src = thumbUrl;
  img.dataset.full = url;

  img.addEventListener('load', function () {
    item.classList.remove('galeria-grid__skeleton');
  });

  img.addEventListener('error', function () {
    item.style.display = 'none';
    
    // Se a primeira foto falhar, assumimos que o album esta vazio/indisponivel
    if (num === 1) {
      showEmptyState();
    }
  });

  /* Numero da foto (aparece no hover) */
  const numberSpan = document.createElement('span');
  numberSpan.className = 'galeria-grid__number';
  numberSpan.textContent = `${num} / ${total}`;

  /* Botao de download */
  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'galeria-grid__download';
  downloadBtn.setAttribute('aria-label', `Baixar foto ${num}`);
  downloadBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </svg>
  `;

  downloadBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    downloadPhoto(url, `lumen-foto-${String(num).padStart(3, '0')}.jpg`);
  });

  /* Click abre o lightbox */
  item.addEventListener('click', function () {
    openLightbox(num - 1);
  });

  item.appendChild(img);
  item.appendChild(numberSpan);
  item.appendChild(downloadBtn);

  return item;
}

/**
 * Exibe o estado vazio quando o album nao possui fotos.
 */
function showEmptyState() {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;
  
  // Evita duplicatas
  if (document.getElementById('galeriaEmptyState')) return;

  const album = ALBUNS[activeAlbumIndex];
  const empty = document.createElement('div');
  empty.id = 'galeriaEmptyState';
  empty.className = 'galeria-empty';
  empty.innerHTML = `
    <div class="galeria-empty__content">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <h3>Álbum em breve</h3>
      <p>As fotos do evento <strong>${album.label}</strong> ainda não estão disponíveis.<br>Acompanhe nosso Instagram para atualizações.</p>
      <a href="https://instagram.com/lumentheclub_" target="_blank" rel="noopener" class="btn btn--secondary">Seguir Instagram</a>
    </div>
  `;
  
  // Insere logo apos o grid
  grid.parentElement.insertBefore(empty, grid.nextSibling);
}

/**
 * Atualiza a lista de fotos carregadas para navegacao no lightbox.
 */
function updateLightboxPhotos() {
  const grid = document.getElementById('galeriaGrid');
  if (!grid) return;

  lightboxPhotos = Array.from(grid.querySelectorAll('.galeria-grid__item')).map(function (item) {
    return {
      url: item.dataset.url,
      index: parseInt(item.dataset.index),
    };
  });
}


/* ═══════════════════════════════════════════════════════════
   INFINITE SCROLL
   ═══════════════════════════════════════════════════════════ */

/**
 * Observa quando o usuario se aproxima do final do grid
 * e carrega o proximo lote automaticamente.
 */
function initInfiniteScroll() {
  window.galeriaObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !isLoading) {
        loadNextBatch();
      }
    });
  }, {
    rootMargin: '400px',
  });
}


/* ═══════════════════════════════════════════════════════════
   LIGHTBOX
   ═══════════════════════════════════════════════════════════ */

/**
 * Abre o lightbox na foto especificada.
 *
 * @param {number} index - Indice da foto na lista carregada
 */
function openLightbox(index) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  /* Se a foto esta alem do carregado, carrega mais */
  const album = ALBUNS[activeAlbumIndex];
  while (index >= lightboxPhotos.length && loadedCount < album.total) {
    loadNextBatch();
  }

  if (index >= lightboxPhotos.length) return;

  lightboxCurrentIndex = index;
  updateLightboxImage();

  lightbox.classList.add('lightbox--open');
  document.body.style.overflow = 'hidden';
}

/** Fecha o lightbox */
function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('lightbox--open');
  document.body.style.overflow = '';
}

/** Atualiza a imagem exibida no lightbox */
function updateLightboxImage() {
  const img = document.getElementById('lightboxImage');
  const counter = document.getElementById('lightboxCounter');
  if (!img) return;

  const photo = lightboxPhotos[lightboxCurrentIndex];
  if (!photo) return;

  img.src = photo.url;
  img.alt = `Foto ${photo.index + 1}`;

  if (counter) {
    const album = ALBUNS[activeAlbumIndex];
    counter.textContent = `${photo.index + 1} / ${album.total}`;
  }
}

/** Navega para a foto anterior */
function lightboxPrev() {
  if (lightboxCurrentIndex > 0) {
    lightboxCurrentIndex--;
    updateLightboxImage();
  }
}

/** Navega para a proxima foto */
function lightboxNext() {
  const album = ALBUNS[activeAlbumIndex];

  /* Se esta no final do carregado mas ha mais fotos, carrega */
  if (lightboxCurrentIndex >= lightboxPhotos.length - 1 && loadedCount < album.total) {
    loadNextBatch();
  }

  if (lightboxCurrentIndex < lightboxPhotos.length - 1) {
    lightboxCurrentIndex++;
    updateLightboxImage();
  }
}

/**
 * Inicializa os listeners do lightbox:
 * - Fechar (botao X, click fora, ESC)
 * - Navegacao (botoes, setas do teclado)
 * - Download
 */
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  const downloadBtn = document.getElementById('lightboxDownload');
  const lightboxImg = document.getElementById('lightboxImage');

  if (!lightbox) return;

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', lightboxPrev);
  nextBtn.addEventListener('click', lightboxNext);

  /* Click fora da imagem fecha */
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  /* Download da foto atual */
  downloadBtn.addEventListener('click', function () {
    const photo = lightboxPhotos[lightboxCurrentIndex];
    if (photo) {
      const num = photo.index + 1;
      downloadPhoto(photo.url, `lumen-foto-${String(num).padStart(3, '0')}.jpg`);
    }
  });

  /* Teclado: ESC fecha, setas navegam */
  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('lightbox--open')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        lightboxPrev();
        break;
      case 'ArrowRight':
        lightboxNext();
        break;
    }
  });

  /* Swipe em mobile */
  let touchStartX = 0;
  let touchEndX = 0;

  lightboxImg.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightboxImg.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        lightboxNext();
      } else {
        lightboxPrev();
      }
    }
  }, { passive: true });
}


/* ═══════════════════════════════════════════════════════════
   DOWNLOAD
   ═══════════════════════════════════════════════════════════ */

/**
 * Faz o download da foto, tentando bypassar o bloqueio de CORS do R2
 * para que o download seja automatico em vez de abrir nova aba.
 *
 * @param {string} url - URL da foto
 * @param {string} filename - Nome do arquivo para salvar
 */
async function downloadPhoto(url, filename) {
  try {
    // Usamos um proxy de CORS temporario para forçar o download direto.
    // O ideal definitivo eh configurar o CORS diretamente no bucket R2.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Falha ao baixar via proxy');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    /* Limpeza */
    setTimeout(function () {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    /* Fallback: abre em nova aba se o CORS proxy falhar */
    window.open(url, '_blank');
  }
}


/* ═══════════════════════════════════════════════════════════
   INICIALIZACAO
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {
  initNavigation();
  renderFiltro();
  renderGrid();
  loadNextBatch();
  initInfiniteScroll();
  initLightbox();
});
