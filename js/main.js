/**
 * Patek Philippe Nautilus Haute Joaillerie 5990/1423G-001
 * High-End Swiss Horology Editorial Experience
 * Apple-Grade Motion Physics & Framer-Style Scroll Orchestration
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeroScrollSequence();
  initScrollProgressBar();
  initStickyHeader();
  initMobileNav();
  initFramerScrollObserver();
  initCardSpotlightHover();
  initOdometerNumbers();
  initDialHotspots();
  initMovementInteractivity();
  initGalleryLightbox();
  initSmoothScroll();
});

/* --------------------------------------------------------------------------
   0. HERO 240-FRAME SCROLL SEQUENCE ENGINE
   Apple-grade canvas rendering with predictive preloading, lerp scroll
   physics, and scroll-synchronized narrative stages.
   -------------------------------------------------------------------------- */
function initHeroScrollSequence() {
  const heroSection = document.getElementById('hero');
  const canvas = document.getElementById('hero-canvas');
  if (!heroSection || !canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) return;

  const preloader = document.getElementById('hero-preloader');
  const preloaderBar = document.getElementById('hero-preloader-bar');
  const preloaderPercent = document.getElementById('hero-preloader-percent');
  const frameNumEl = document.getElementById('hero-frame-num');
  const hudProgressFill = document.getElementById('hero-hud-progress-fill');
  const chapterBtns = document.querySelectorAll('.hero-chapter-btn');
  const stageEls = {
    1: document.querySelector('.hero-stage-1'),
    2: document.querySelector('.hero-stage-2'),
    3: document.querySelector('.hero-stage-3'),
    4: document.querySelector('.hero-stage-4'),
  };

  const TOTAL_FRAMES = 240;
  const images = new Array(TOTAL_FRAMES + 1);
  const loadingStatus = new Uint8Array(TOTAL_FRAMES + 1); // 0=unloaded, 1=loading, 2=loaded
  let loadedCount = 0;
  let preloaderDismissed = false;

  const getFramePath = (i) => {
    return `public/image/herosection/ezgif-frame-${String(i).padStart(3, '0')}.png`;
  };

  // Helper to load single frame
  function loadSingleFrame(idx, onLoaded) {
    if (idx < 1 || idx > TOTAL_FRAMES) return;
    if (loadingStatus[idx] > 0) return; // already loading or loaded

    loadingStatus[idx] = 1;
    const img = new Image();
    img.src = getFramePath(idx);
    img.onload = () => {
      images[idx] = img;
      loadingStatus[idx] = 2;
      loadedCount++;
      updatePreloader();
      if (idx === currentFrame) {
        drawCurrentFrame();
      }
      if (onLoaded) onLoaded();
    };
    img.onerror = () => {
      loadingStatus[idx] = 0; // allow retry
    };
  }

  // 1. Intelligent Wave Preloading Strategy for 2560x1440 UHD Frames
  // Wave 1: Frame 1 immediately
  loadSingleFrame(1, () => {
    drawCurrentFrame();
  });

  // Wave 2: Skeleton Keyframes (every 6 frames: 1, 7, 13, 19... 240)
  const keyframeIndices = [];
  for (let i = 1; i <= TOTAL_FRAMES; i += 6) {
    if (i !== 1) keyframeIndices.push(i);
  }
  if (!keyframeIndices.includes(TOTAL_FRAMES)) keyframeIndices.push(TOTAL_FRAMES);

  // Wave 3: Secondary intermediate frames
  const remainingIndices = [];
  for (let i = 2; i <= TOTAL_FRAMES; i++) {
    if (!keyframeIndices.includes(i)) {
      remainingIndices.push(i);
    }
  }

  function updatePreloader() {
    const keyframesCount = keyframeIndices.length + 1; // ~42 frames
    const pct = Math.min(100, Math.round((loadedCount / keyframesCount) * 100));
    if (preloaderBar) preloaderBar.style.width = `${pct}%`;
    if (preloaderPercent) preloaderPercent.textContent = `${pct}%`;
    
    // Dismiss preloader once critical skeleton keyframes are available (flicker-free interactive)
    if (loadedCount >= Math.min(keyframesCount, 24) && !preloaderDismissed && preloader) {
      preloader.classList.add('loaded');
      preloaderDismissed = true;
    }
  }

  function loadBatch(indices, concurrency = 6, onComplete) {
    let index = 0;
    let running = 0;

    function next() {
      if (index >= indices.length && running === 0) {
        if (onComplete) onComplete();
        return;
      }
      while (running < concurrency && index < indices.length) {
        const frameIdx = indices[index++];
        if (loadingStatus[frameIdx] === 0) {
          running++;
          loadSingleFrame(frameIdx, () => {
            running--;
            next();
          });
        }
      }
    }
    next();
  }

  // Launch preloader waves
  loadBatch(keyframeIndices, 6, () => {
    // Once keyframes are downloaded, gracefully stream remaining frames in background
    loadBatch(remainingIndices, 4);
  });

  // Smart Proximity Preloader: Loads ±8 frames around current scroll position
  function preloadAroundFrame(centerIdx) {
    const range = 8;
    for (let offset = 1; offset <= range; offset++) {
      const forward = centerIdx + offset;
      const backward = centerIdx - offset;
      if (forward <= TOTAL_FRAMES && loadingStatus[forward] === 0) {
        loadSingleFrame(forward);
      }
      if (backward >= 1 && loadingStatus[backward] === 0) {
        loadSingleFrame(backward);
      }
    }
  }

  // Nearest frame fallback finder (prevents blank/stutter frames)
  function getBestFrame(targetIdx) {
    if (images[targetIdx] && images[targetIdx].complete && images[targetIdx].naturalWidth) {
      return images[targetIdx];
    }
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const lower = targetIdx - offset;
      if (lower >= 1 && images[lower] && images[lower].complete && images[lower].naturalWidth) {
        return images[lower];
      }
      const upper = targetIdx + offset;
      if (upper <= TOTAL_FRAMES && images[upper] && images[upper].complete && images[upper].naturalWidth) {
        return images[upper];
      }
    }
    return images[1] || null;
  }

  // 2. High-DPI 2560x1440 Crisp Canvas Rendering
  let canvasCssW = 0;
  let canvasCssH = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasCssW = rect.width || window.innerWidth;
    canvasCssH = rect.height || window.innerHeight;

    // Allocate physical pixels for high-DPI displays up to native 2560x1440
    canvas.width = Math.min(2560, Math.round(canvasCssW * dpr));
    canvas.height = Math.min(1440, Math.round(canvasCssH * dpr));

    drawCurrentFrame();
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  function drawCurrentFrame() {
    const img = getBestFrame(currentFrame);
    if (!img) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Deep luxury obsidian background matching render base
    ctx.fillStyle = '#060709';
    ctx.fillRect(0, 0, cw, ch);

    const imgW = img.naturalWidth || 2560;
    const imgH = img.naturalHeight || 1440;

    // Aspect-ratio contain logic
    let scale;
    if (cw < 900) {
      // Mobile portrait view: slightly scale up for glorious centered focus
      scale = Math.max(cw / imgW, (ch * 0.75) / imgH);
    } else {
      // Desktop / Tablet: fit within viewport with majestic framing
      scale = Math.min(cw / imgW, ch / imgH) * 1.02;
    }

    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  // 3. Scroll & Smooth Lerp Physics
  let targetProgress = 0;
  let currentProgress = 0;
  let currentFrame = 1;
  let isTicking = false;

  function getScrollProgress() {
    const heroTop = heroSection.getBoundingClientRect().top;
    const scrollableDistance = heroSection.offsetHeight - window.innerHeight;
    if (scrollableDistance <= 0) return 0;
    return Math.min(1, Math.max(0, -heroTop / scrollableDistance));
  }

  function onScroll() {
    targetProgress = getScrollProgress();
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(tick);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  function tick() {
    const diff = targetProgress - currentProgress;
    currentProgress += diff * 0.16; // Silky responsive dampening
    if (Math.abs(diff) < 0.0004) {
      currentProgress = targetProgress;
    }

    const targetFrame = Math.min(TOTAL_FRAMES, Math.max(1, Math.round(1 + currentProgress * (TOTAL_FRAMES - 1))));
    if (targetFrame !== currentFrame) {
      currentFrame = targetFrame;
      preloadAroundFrame(currentFrame);
      drawCurrentFrame();
    }

    updateStages(currentProgress);
    updateHUD(currentProgress, currentFrame);

    if (Math.abs(targetProgress - currentProgress) > 0.0004) {
      requestAnimationFrame(tick);
    } else {
      isTicking = false;
    }
  }

  // 4. Stage Smooth Cosine Crossfading & Translation Logic
  function calcStage(p, inStart, inEnd, outStart, outEnd) {
    if (p < inStart || p > outEnd) {
      return { opacity: 0, translateY: p < inStart ? 24 : -24, active: false };
    }
    let opacity = 1;
    let translateY = 0;
    if (p < inEnd) {
      const rawRatio = (p - inStart) / (inEnd - inStart);
      const ease = 0.5 - 0.5 * Math.cos(rawRatio * Math.PI); // Smooth S-curve
      opacity = ease;
      translateY = 24 * (1 - ease);
    } else if (p > outStart) {
      const rawRatio = (p - outStart) / (outEnd - outStart);
      const ease = 0.5 - 0.5 * Math.cos(rawRatio * Math.PI);
      opacity = 1 - ease;
      translateY = -24 * ease;
    }
    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      translateY,
      active: opacity > 0.05
    };
  }

  function updateStages(p) {
    // Stage 1: The Assembled Icon [0.00 -> 0.22]
    const s1 = calcStage(p, -0.1, 0.0, 0.16, 0.22);
    applyStage(stageEls[1], s1);

    // Stage 2: Aerial Levitating Architecture [0.22 -> 0.48]
    const s2 = calcStage(p, 0.22, 0.27, 0.43, 0.48);
    applyStage(stageEls[2], s2);

    // Stage 3: Caliber Engine Macro [0.48 -> 0.74]
    const s3 = calcStage(p, 0.48, 0.53, 0.69, 0.74);
    applyStage(stageEls[3], s3);

    // Stage 4: Exploded Suspended Horological Anatomy [0.74 -> 1.05]
    const s4 = calcStage(p, 0.74, 0.79, 1.0, 1.05);
    applyStage(stageEls[4], s4);
  }

  function applyStage(el, state) {
    if (!el) return;
    el.style.opacity = state.opacity.toFixed(3);
    el.style.pointerEvents = state.active ? 'auto' : 'none';
    const card = el.querySelector('.hero-stage-content') || el;
    card.style.transform = `translateY(${state.translateY.toFixed(1)}px)`;
    if (state.active) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  }

  // 5. Interactive HUD Status & Chapter Buttons
  function updateHUD(p, frame) {
    if (frameNumEl) {
      frameNumEl.textContent = String(frame).padStart(3, '0');
    }
    if (hudProgressFill) {
      hudProgressFill.style.width = `${(p * 100).toFixed(1)}%`;
    }

    let activeChapter = 0;
    if (p < 0.22) activeChapter = 0;
    else if (p < 0.48) activeChapter = 1;
    else if (p < 0.74) activeChapter = 2;
    else activeChapter = 3;

    chapterBtns.forEach((btn, idx) => {
      if (idx === activeChapter) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Chapter buttons click navigation
  chapterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetP = parseFloat(btn.getAttribute('data-target-progress') || '0');
      const heroRect = heroSection.getBoundingClientRect();
      const heroTop = window.scrollY + heroRect.top;
      const scrollDist = heroSection.offsetHeight - window.innerHeight;
      const targetScroll = heroTop + (targetP * scrollDist);
      window.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    });
  });

  // Initial sizing and trigger
  resizeCanvas();
  onScroll();
}

/* --------------------------------------------------------------------------
   1. SCROLL PROGRESS BAR (Apple subtle top progress line)
   -------------------------------------------------------------------------- */
function initScrollProgressBar() {
  const bar = document.querySelector('.scroll-progress-bar');
  if (!bar) return;

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${percent}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/* --------------------------------------------------------------------------
   2. STICKY HEADER GLASS TRANSITION
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   3. MOBILE LUXURY NAVIGATION DRAWER
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const links = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !overlay) return;

  const toggleNav = () => {
    const isOpen = overlay.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    toggleBtn.setAttribute('aria-expanded', isOpen);
  };

  toggleBtn.addEventListener('click', toggleNav);

  links.forEach(link => {
    link.addEventListener('click', () => {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      toggleNav();
    }
  });
}

/* --------------------------------------------------------------------------
   4. APPLE-GRADE FRAMER-MOTION SCROLL OBSERVER
   Hero elements remain completely static. All subsequent elements animate.
   -------------------------------------------------------------------------- */
function initFramerScrollObserver() {
  const elements = document.querySelectorAll('[data-framer]');
  if (!elements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -70px 0px',
    threshold: 0.12
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   5. SPOTLIGHT CARDS (Cursor Ambient Glow)
   -------------------------------------------------------------------------- */
function initCardSpotlightHover() {
  const cards = document.querySelectorAll('.spotlight-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* --------------------------------------------------------------------------
   6. SMOOTH ODOMETER COUNTER (Price & Carat Figures)
   -------------------------------------------------------------------------- */
function initOdometerNumbers() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const counterObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        const finalValue = parseFloat(target.getAttribute('data-count'));
        const prefix = target.getAttribute('data-prefix') || '';
        const suffix = target.getAttribute('data-suffix') || '';
        const isDecimal = finalValue % 1 !== 0;

        let startValue = 0;
        const duration = 2200; // ms
        const startTime = performance.now();

        const updateCount = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Apple easeOutExpo: 1 - 2^(-10 * progress)
          const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const currentNumber = startValue + (finalValue - startValue) * easeProgress;

          if (isDecimal) {
            target.textContent = `${prefix}${currentNumber.toFixed(2)}${suffix}`;
          } else {
            target.textContent = `${prefix}${Math.round(currentNumber).toLocaleString()}${suffix}`;
          }

          if (progress < 1) {
            requestAnimationFrame(updateCount);
          } else {
            if (isDecimal) {
              target.textContent = `${prefix}${finalValue.toFixed(2)}${suffix}`;
            } else {
              target.textContent = `${prefix}${finalValue.toLocaleString()}${suffix}`;
            }
          }
        };

        requestAnimationFrame(updateCount);
        obs.unobserve(target);
      }
    });
  }, { threshold: 0.25 });

  counters.forEach(c => counterObserver.observe(c));
}

/* --------------------------------------------------------------------------
   7. SECTION 04 — DIAL INTERACTIVE HOTSPOTS
   -------------------------------------------------------------------------- */
function initDialHotspots() {
  const hotspots = document.querySelectorAll('.hotspot-pin');
  const cards = document.querySelectorAll('.hotspot-card');

  if (!hotspots.length) return;

  hotspots.forEach(pin => {
    const targetId = pin.getAttribute('data-target');
    const targetCard = document.getElementById(targetId);

    const activate = () => {
      hotspots.forEach(p => p.classList.remove('active'));
      cards.forEach(c => c.classList.remove('visible'));

      pin.classList.add('active');
      if (targetCard) {
        targetCard.classList.add('visible');
        positionTooltip(pin, targetCard);
      }
    };

    pin.addEventListener('mouseenter', activate);
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      activate();
    });
  });

  function positionTooltip(pin, card) {
    const stage = document.querySelector('.dial-interactive-stage');
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();

    const pinRelativeLeft = pinRect.left - stageRect.left;
    const pinRelativeTop = pinRect.top - stageRect.top;

    let left = pinRelativeLeft + 25;
    let top = pinRelativeTop - 20;

    if (left + card.offsetWidth > stageRect.width - 20) {
      left = pinRelativeLeft - card.offsetWidth - 25;
    }
    if (top + card.offsetHeight > stageRect.height - 20) {
      top = stageRect.height - card.offsetHeight - 20;
    }
    if (top < 20) {
      top = 20;
    }

    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
  }

  document.addEventListener('click', () => {
    hotspots.forEach(p => p.classList.remove('active'));
    cards.forEach(c => c.classList.remove('visible'));
  });
}

/* --------------------------------------------------------------------------
   8. SECTION 06 — MOVEMENT INTERACTIVE STAGE
   -------------------------------------------------------------------------- */
function initMovementInteractivity() {
  const toggleBtns = document.querySelectorAll('.view-toggle-btn');
  const rectoImg = document.getElementById('movement-recto');
  const versoImg = document.getElementById('movement-verso');
  const specCards = document.querySelectorAll('.spec-interactive-card');
  const highlightRing = document.getElementById('movement-highlight');

  if (!rectoImg || !versoImg) return;

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.getAttribute('data-view');
      if (view === 'recto') {
        versoImg.classList.add('hidden-view');
        rectoImg.classList.remove('hidden-view');
      } else {
        rectoImg.classList.add('hidden-view');
        versoImg.classList.remove('hidden-view');
      }

      if (highlightRing) highlightRing.classList.remove('active');
      specCards.forEach(c => c.classList.remove('active'));
    });
  });

  specCards.forEach(card => {
    const focusArea = card.getAttribute('data-focus');
    if (!focusArea || !highlightRing) return;

    card.addEventListener('mouseenter', () => {
      specCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const coords = {
        'rotor': { top: '35%', left: '50%', width: '180px', height: '180px' },
        'balance': { top: '65%', left: '38%', width: '110px', height: '110px' },
        'chronograph': { top: '48%', left: '52%', width: '130px', height: '130px' },
        'traveltime': { top: '45%', left: '42%', width: '140px', height: '140px' },
        'jewels': { top: '50%', left: '50%', width: '220px', height: '220px' },
        'power': { top: '38%', left: '60%', width: '120px', height: '120px' }
      };

      if (coords[focusArea]) {
        const c = coords[focusArea];
        highlightRing.style.top = c.top;
        highlightRing.style.left = c.left;
        highlightRing.style.width = c.width;
        highlightRing.style.height = c.height;
        highlightRing.style.transform = 'translate(-50%, -50%)';
        highlightRing.classList.add('active');
      }
    });

    card.addEventListener('mouseleave', () => {
      card.classList.remove('active');
      highlightRing.classList.remove('active');
    });
  });
}

/* --------------------------------------------------------------------------
   9. SECTION 10 — GALLERY LIGHTBOX MODAL
   -------------------------------------------------------------------------- */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('gallery-lightbox');
  const modalImg = document.getElementById('lightbox-img');
  const modalCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close-btn');

  if (!modal || !modalImg) return;

  const openLightbox = (item) => {
    const img = item.querySelector('img');
    const title = item.querySelector('.gallery-caption-title')?.textContent || '';
    const sub = item.querySelector('.gallery-caption-sub')?.textContent || '';

    if (img) {
      modalImg.src = img.src;
      modalImg.alt = img.alt;
      if (modalCaption) {
        modalCaption.textContent = title ? `${title} — ${sub}` : img.alt;
      }
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-image-container')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeLightbox();
    }
  });
}

/* --------------------------------------------------------------------------
   10. SMOOTH LINK SCROLL WITH HEADER OFFSET
   -------------------------------------------------------------------------- */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - headerHeight + 10;

        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}
