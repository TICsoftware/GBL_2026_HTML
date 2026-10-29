/* =========================================================
   MILESTONES SLIDER
   Markup: Views/Shared/_MilestonesSlider.cshtml
   - Arrows, year timeline, click on peeking slide
   - Swipe / drag, keyboard ← →
========================================================= */
(function () {
  'use strict';

  function initMilestones(root) {
    var track = root.querySelector('.milestones-track');
    var viewport = root.querySelector('.milestones-viewport');
    var timeline = root.querySelector('.milestones-timeline');
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-ms-slide]'));
    var years = Array.prototype.slice.call(root.querySelectorAll('[data-ms-year]'));
    var prevBtn = root.querySelector('[data-ms-prev]');
    var nextBtn = root.querySelector('[data-ms-next]');

    if (!track || !slides.length) return;

    var index = slides.findIndex(function (s) { return s.classList.contains('is-active'); });
    if (index < 0) index = 0;

    function centerYear(smooth) {
      var year = years[index];
      if (!year || !timeline) return;
      var left = year.offsetLeft - (timeline.clientWidth - year.offsetWidth) / 2;
      timeline.scrollTo({ left: Math.max(0, left), behavior: smooth ? 'smooth' : 'auto' });
    }

    function goTo(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      track.style.setProperty('--ms-index', index);

      slides.forEach(function (slide, n) {
        var active = n === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      years.forEach(function (year, n) {
        var active = n === index;
        year.classList.toggle('is-active', active);
        if (active) year.setAttribute('aria-current', 'step');
        else year.removeAttribute('aria-current');
      });

      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === slides.length - 1;

      centerYear(true);
    }

    // Arrows
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

    // Year timeline
    years.forEach(function (year) {
      year.addEventListener('click', function () {
        goTo(parseInt(year.getAttribute('data-ms-year'), 10));
      });
    });

    // Click a peeking slide to open it
    var suppressClick = false;
    slides.forEach(function (slide, n) {
      slide.addEventListener('click', function () {
        if (suppressClick) { suppressClick = false; return; }
        if (n !== index) goTo(n);
      });
    });

    // Swipe / drag
    var startX = null;
    var startY = null;
    viewport.addEventListener('pointerdown', function (e) {
      startX = e.clientX;
      startY = e.clientY;
    });
    viewport.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        suppressClick = true;
        goTo(dx < 0 ? index + 1 : index - 1);
        setTimeout(function () { suppressClick = false; }, 50);
      }
    });
    viewport.addEventListener('pointercancel', function () { startX = null; });

    // Stop images being dragged as files on desktop
    viewport.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // Keyboard
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    // Initial state
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
    centerYear(false);
    window.addEventListener('resize', function () { centerYear(false); });
  }

  function init() {
    document.querySelectorAll('[data-milestones]').forEach(initMilestones);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();