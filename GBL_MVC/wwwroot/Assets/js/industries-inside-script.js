document.addEventListener("DOMContentLoaded", function () {
  /* ---------------------------------------
     Industry inside page only.
     Tabs: Additives / Solvents.
     Cards: same CARD_RISE look as homepage,
     scoped here so other pages are unchanged.
  --------------------------------------- */
  var tabRoot = document.querySelector(".tab-outer");
  var contentRoot = document.querySelector(".industries-tab-content");
  if (!tabRoot || !contentRoot) return;

  var tabs = Array.from(tabRoot.querySelectorAll("[role='tab']"));
  var panels = Array.from(contentRoot.querySelectorAll("[data-tab-panel]"));

  var CARD_RISE = {
    y: 140,
    duration: 1.15,
    stagger: 0.28,
    start: "top 90%"
  };

  var canAnimate =
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canAnimate) gsap.registerPlugin(ScrollTrigger);

  var isMobile = window.matchMedia("(max-width: 992px)").matches;
  var stScroller = isMobile ? window : document.documentElement;
  var riseTriggers = [];

  /** Grid columns — matches industries-inside.css. */
  function columns() {
    if (window.matchMedia("(max-width: 1179px)").matches) return 1;
    if (window.matchMedia("(max-width: 1279px)").matches) return 2;
    return 3;
  }

  /** Remove this page's ScrollTriggers only (ids start with inside-product-). */
  function destroyRise() {
    riseTriggers.forEach(function (st) {
      st.kill();
    });
    riseTriggers = [];
  }

  /**
   * Bind rise animation to cards in the visible tab panel.
   * Each visual row plays when it enters the viewport.
   */
  function bindRise(panel) {
    if (!canAnimate || !panel) return;

    destroyRise();

    var cards = Array.from(panel.querySelectorAll(".industry-product-card"));
    if (!cards.length) return;

    var cols = columns();

    for (var r = 0; r < cards.length; r += cols) {
      bindRow(cards.slice(r, r + cols), r / cols);
    }

    ScrollTrigger.refresh();
  }

  /** One row: stagger left to right, play when the first card hits the viewport. */
  function bindRow(row, rowIndex) {
    if (!row.length) return;

    var tl = gsap.timeline({
      paused: true,
      defaults: { force3D: true, ease: "power2.out" }
    });

    row.forEach(function (card, i) {
      gsap.set(card, { autoAlpha: 0, y: CARD_RISE.y, force3D: true });
      tl.to(
        card,
        { autoAlpha: 1, y: 0, duration: CARD_RISE.duration },
        i * CARD_RISE.stagger
      );
    });

    var st = ScrollTrigger.create({
      id: "inside-product-row-" + rowIndex,
      trigger: row[0],
      scroller: stScroller,
      start: CARD_RISE.start,
      invalidateOnRefresh: true,
      onEnter: function () {
        tl.timeScale(1).play();
      },
      onEnterBack: function () {
        tl.timeScale(1).play();
      },
      onLeaveBack: function () {
        tl.timeScale(1).reverse();
      }
    });

    riseTriggers.push(st);

    if (st.isActive) tl.play();
  }

  /** Show the panel that matches the clicked tab, then replay card rise. */
  function activateTab(tab) {
    var id = tab.getAttribute("data-tab");

    tabs.forEach(function (btn) {
      var on = btn === tab;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    var activePanel = null;

    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-tab-panel") === id;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
      if (on) activePanel = panel;
    });

    bindRise(activePanel);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (tab.classList.contains("is-active")) return;
      activateTab(tab);
    });
  });

  var firstPanel = contentRoot.querySelector(".industry-tab-panel.is-active") || panels[0];
  bindRise(firstPanel);

  window.addEventListener("load", function () {
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  });
});
