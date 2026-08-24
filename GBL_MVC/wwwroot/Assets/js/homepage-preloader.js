/* ---------------------------------------
   SITE PRELOADER
   Logo + progress bar + counter. On completion:
     - only the logo shatters into particle tiles and fades (bar/counter
       fade plainly, backdrop just disappears with the preloader)
     - the header slides in (translateY -100px -> 0)
     - dispatches 'homepagePreloaderDone', which homepage-script.js waits
       on before constructing the hero Swiper — that slider's own existing
       animation is untouched by this file.

   Skip: ?loader=0
--------------------------------------- */
(function () {
  function whenReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function skipLoader() {
    return new URLSearchParams(window.location.search).get('loader') === '0';
  }

  function announceDone() {
    document.dispatchEvent(new CustomEvent('homepagePreloaderDone'));
  }

  function animateHeaderIn() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    header.style.transition = 'none';
    header.style.transform = 'translateY(-100px)';
    void header.offsetHeight; // force reflow so the next line transitions
    header.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';

    requestAnimationFrame(() => {
      header.style.transform = 'translateY(0)';
    });

    header.addEventListener(
      'transitionend',
      () => {
        header.style.transition = '';
        header.style.transform = '';
      },
      { once: true }
    );
  }

  // Hero is already fully built (Swiper initializes immediately, hidden
  // behind this backdrop) by the time this runs — this only handles how
  // it becomes visible. Settles in slightly after the header (0.12s
  // delay) so the exit reads as one cascading sequence, not two things
  // popping in at once.
  function animateHeroIn() {
    const hero = document.querySelector('.hero-banner-section');
    if (!hero) return;

    hero.style.transition = 'none';
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(24px) scale(1.02)';
    hero.style.filter = 'blur(6px)';
    hero.style.willChange = 'opacity, transform, filter';
    void hero.offsetHeight; // force reflow so the next line transitions

    // Delay is folded into each entry of the shorthand itself — setting
    // transition (shorthand) after transitionDelay would otherwise reset
    // the delay back to 0s, since shorthand resets unlisted sub-values.
    hero.style.transition =
      'opacity 1s cubic-bezier(0.22, 1, 0.36, 1) 0.12s, ' +
      'transform 1s cubic-bezier(0.22, 1, 0.36, 1) 0.12s, ' +
      'filter 1s cubic-bezier(0.22, 1, 0.36, 1) 0.12s';

    requestAnimationFrame(() => {
      hero.style.opacity = '1';
      hero.style.transform = 'translateY(0) scale(1)';
      hero.style.filter = 'blur(0)';
    });

    hero.addEventListener(
      'transitionend',
      () => {
        hero.style.transition = '';
        hero.style.transitionDelay = '';
        hero.style.opacity = '';
        hero.style.transform = '';
        hero.style.filter = '';
        hero.style.willChange = '';
      },
      { once: true }
    );
  }

  // Layered on top of animateHeroIn(): once the section itself is
  // settling into focus, the active slide's title+paragraph rise up
  // into place, then its CTA fades in last. Only touches transform on
  // .slide-content itself (the wrapper, not the parallax-tagged title/
  // paragraph inside it) and opacity-only on the button — its transform
  // is already owned by Swiper's native parallax (data-swiper-parallax),
  // so this never fights it for the same property.
  function animateHeroContentIn() {
    const activeSlide = document.querySelector('.hero-swiper .swiper-slide-active');
    if (!activeSlide) return;

    const content = activeSlide.querySelector('.slide-content');
    const btnWrap = activeSlide.querySelector('.outer-hero-button');

    if (content) {
      content.style.transition = 'none';
      content.style.opacity = '0';
      content.style.transform = 'translateY(18px)';
      content.style.willChange = 'opacity, transform';
      void content.offsetHeight;

      content.style.transition =
        'opacity 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.35s, ' +
        'transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.35s';

      requestAnimationFrame(() => {
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      });

      content.addEventListener(
        'transitionend',
        () => {
          content.style.transition = '';
          content.style.opacity = '';
          content.style.transform = '';
          content.style.willChange = '';
        },
        { once: true }
      );
    }

    if (btnWrap) {
      btnWrap.style.transition = 'none';
      btnWrap.style.opacity = '0';
      btnWrap.style.willChange = 'opacity';
      void btnWrap.offsetHeight;

      btnWrap.style.transition = 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.55s';

      requestAnimationFrame(() => {
        btnWrap.style.opacity = '1';
      });

      btnWrap.addEventListener(
        'transitionend',
        () => {
          btnWrap.style.transition = '';
          btnWrap.style.opacity = '';
          btnWrap.style.willChange = '';
        },
        { once: true }
      );
    }
  }

  function init() {
    const html = document.documentElement;
    const preloader = document.getElementById('sitePreloader');
    const fill = document.getElementById('sitePreloaderFill');
    const counter = document.getElementById('sitePreloaderCounter');
    const logoWrap = preloader && preloader.querySelector('.site-preloader__logo-wrap');
    const logo = document.getElementById('sitePreloaderLogo');

    const finishImmediate = () => {
      html.classList.remove('site-preloader-pending');
      if (preloader) preloader.remove();
      announceDone();
    };

    if (!preloader || !fill || !counter || !logoWrap || !logo) {
      finishImmediate();
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (skipLoader() || reduceMotion) {
      // No animated fill, no shatter, header snaps to place (no translate).
      finishImmediate();
      return;
    }

    html.classList.add('site-preloader-lock');
    document.getElementById('siteHeader')?.setAttribute('inert', '');
    document.getElementById('main-content')?.setAttribute('inert', '');

    function unlock() {
      html.classList.remove('site-preloader-lock');
      document.getElementById('siteHeader')?.removeAttribute('inert');
      document.getElementById('main-content')?.removeAttribute('inert');
    }

    function setProgress(n) {
      fill.style.width = n + '%';
      counter.firstChild.textContent = n;
    }

    let finished = false;
    let shatterStarted = false;
    let shatterHandle = null;
    const MIN_MS = 750;
    const MAX_MS = 3500;
    const SHATTER_AT = 80; // dissolve starts once the bar reaches this
    const FAST_TIME_SCALE = 6; // speed multiplier applied the instant we hit 100%
    let pageLoaded = document.readyState === 'complete';
    window.addEventListener('load', () => { pageLoaded = true; }, { once: true });

    const startTime = performance.now();
    let shown = 0;

    function beginShatter() {
      if (shatterStarted) return;
      shatterStarted = true;
      shatterHandle = shatterLogo();
    }

    function finishAtFull() {
      if (finished) return;
      finished = true;

      beginShatter(); // safety net if 100% was reached without passing 80% first
      if (shatterHandle) shatterHandle.fastForward();

      const progressEl = preloader.querySelector('.site-preloader__progress');
      if (progressEl) {
        if (typeof gsap !== 'undefined') {
          gsap.to(progressEl, { autoAlpha: 0, duration: 0.25, ease: 'power2.out' });
        } else {
          progressEl.style.transition = 'opacity .25s ease';
          progressEl.style.opacity = '0';
        }
      }
    }

    function tick() {
      if (finished) return;
      const elapsed = performance.now() - startTime;
      const minRatio = Math.min(1, elapsed / MIN_MS);
      // Reserve the last stretch for real load confirmation, not a guess.
      const target = pageLoaded ? 100 : Math.min(90, Math.round(minRatio * 90));
      shown += (target - shown) * 0.35;
      if (target - shown < 0.4) shown = target;
      const displayed = Math.round(shown);
      setProgress(displayed);

      if (displayed >= SHATTER_AT) {
        beginShatter();
      }

      if (displayed >= 100 || elapsed > MAX_MS) {
        setProgress(100);
        finishAtFull();
        return;
      }
      requestAnimationFrame(tick);
    }

    function onTilesDone() {
      html.classList.remove('site-preloader-pending');
      unlock();
      animateHeaderIn();
      animateHeroIn();
      animateHeroContentIn();
      announceDone();

      // Crossfade the backdrop out instead of yanking it away instantly —
      // the tiles are already gone, but the solid background behind them
      // was still fully opaque until now.
      if (typeof gsap !== 'undefined') {
        gsap.to(preloader, {
          autoAlpha: 0,
          duration: 0.25,
          ease: 'power2.out',
          onComplete: () => preloader.remove(),
        });
      } else {
        preloader.style.transition = 'opacity .25s ease';
        preloader.style.opacity = '0';
        window.setTimeout(() => preloader.remove(), 260);
      }
    }

    function shatterLogo() {
      const rect = logo.getBoundingClientRect();
      const wrapRect = logoWrap.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      // Fixed small tile size (not a fixed grid count) — keeps particles
      // small and consistent no matter how large the logo/gif renders.
      const TARGET_TILE = 16;
      const cols = Math.min(40, Math.max(4, Math.round(w / TARGET_TILE)));
      const rows = Math.min(40, Math.max(4, Math.round(h / TARGET_TILE)));
      const tileW = w / cols;
      const tileH = h / rows;
      const offsetX = rect.left - wrapRect.left;
      const offsetY = rect.top - wrapRect.top;
      const src = logo.currentSrc || logo.src;

      // Radial explosion: each tile's travel direction is derived from
      // where it sat relative to the logo's own center, then scaled out
      // far enough to clear the viewport in that direction — tiles near
      // the top-left of the logo fly toward the screen's top-left, etc.
      const centerX = w / 2;
      const centerY = h / 2;
      const travelDist = Math.hypot(window.innerWidth, window.innerHeight) * 0.65;

      const tiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const tile = document.createElement('div');
          tile.className = 'site-preloader-tile';
          tile.style.width = tileW + 'px';
          tile.style.height = tileH + 'px';
          tile.style.left = (offsetX + c * tileW) + 'px';
          tile.style.top = (offsetY + r * tileH) + 'px';
          tile.style.backgroundImage = 'url(' + src + ')';
          tile.style.backgroundSize = w + 'px ' + h + 'px';
          tile.style.backgroundPosition = (-c * tileW) + 'px ' + (-r * tileH) + 'px';

          let vx = (c + 0.5) * tileW - centerX;
          let vy = (r + 0.5) * tileH - centerY;
          const mag = Math.hypot(vx, vy);
          if (mag < 0.01) {
            const a = Math.random() * Math.PI * 2;
            vx = Math.cos(a);
            vy = Math.sin(a);
          } else {
            vx /= mag;
            vy /= mag;
          }
          tile.dataset.dx = vx * travelDist;
          tile.dataset.dy = vy * travelDist;

          logoWrap.appendChild(tile);
          tiles.push(tile);
        }
      }
      logo.style.visibility = 'hidden';

      // stagger.amount spreads the delay across a FIXED total window no
      // matter how many tiles there are (unlike stagger.each, which
      // multiplies per-tile and can stretch a large logo's dissolve to
      // several seconds) — keeps total time bounded and predictable.
      if (typeof gsap !== 'undefined') {
        const tween = gsap.to(tiles, {
          autoAlpha: 0,
          x: (i, target) => parseFloat(target.dataset.dx) + gsap.utils.random(-20, 20),
          y: (i, target) => parseFloat(target.dataset.dy) + gsap.utils.random(-20, 20),
          rotate: () => gsap.utils.random(-45, 45),
          scale: 0.6,
          duration: 0.5,
          ease: 'power2.out',
          stagger: { amount: 0.15, from: 'random' },
          onComplete: onTilesDone,
        });
        return { fastForward: () => tween.timeScale(FAST_TIME_SCALE) };
      }

      tiles.forEach((t) => {
        t.style.transition = 'opacity .3s ease';
        t.style.opacity = '0';
      });
      let fallbackTimer = window.setTimeout(onTilesDone, 320);
      return {
        fastForward: () => {
          window.clearTimeout(fallbackTimer);
          tiles.forEach((t) => { t.style.transition = 'opacity .12s ease'; t.style.opacity = '0'; });
          fallbackTimer = window.setTimeout(onTilesDone, 130);
        },
      };
    }

    window.setTimeout(finishAtFull, MAX_MS + 400);
    requestAnimationFrame(tick);
  }

  whenReady(init);
})();
