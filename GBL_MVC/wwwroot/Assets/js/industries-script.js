document.addEventListener("DOMContentLoaded", function () {
  /* ---------------------------------------
     Industry cards only (.industries-list).
     Same CARD_RISE as homepage card-animation.js:
     fade + rise, scrubbed to scroll, stagger
     within each row. Other pages are untouched.
  --------------------------------------- */
  var CARD_RISE = {
    y: 140,           /* start offset (px) below the rest position */
    duration: 1.15,   /* rise length on the scrub timeline */
    stagger: 0.28,    /* delay between cards in the same row */
    scrub: 1.15,      /* catch-up so motion follows the scrollbar */
    listStart: "top 90%",
    listEnd: "top 38%"
  };

  var list = document.querySelector(".industries-list");
  if (!list) return;

  var cards = Array.from(list.querySelectorAll(".industry-card"));
  if (!cards.length) return;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var isMobile = window.matchMedia("(max-width: 992px)").matches;
  /* Desktop uses Lenis on documentElement; mobile uses native window scroll. */
  var stScroller = isMobile ? window : document.documentElement;

  /** Grid columns for this viewport — matches industries-list.css breakpoints. */
  function columns() {
    if (window.matchMedia("(max-width: 1179px)").matches) return 1; /* mobile */
    if (window.matchMedia("(max-width: 1279px)").matches) return 2; /* 1180–1279 */
    return 4; /* desktop 1280+ */
  }

  var cols = columns();

  /* One scrubbed timeline per visual row so later rows wait until they enter view. */
  for (var r = 0; r < cards.length; r += cols) {
    var row = cards.slice(r, r + cols);
    var rowIndex = r / cols;

    var tl = gsap.timeline({
      defaults: { force3D: true, ease: "power2.out" },
      scrollTrigger: {
        id: "industry-card-rise-row-" + rowIndex,
        trigger: row[0],
        scroller: stScroller,
        start: CARD_RISE.listStart,
        end: CARD_RISE.listEnd,
        scrub: CARD_RISE.scrub,
        invalidateOnRefresh: true
      }
    });

    /* Stagger left-to-right inside the row (same as homepage card-animation.js). */
    row.forEach(function (card, i) {
      tl.fromTo(
        card,
        { autoAlpha: 0, y: CARD_RISE.y },
        {
          autoAlpha: 1,
          y: 0,
          duration: CARD_RISE.duration,
          immediateRender: true
        },
        i * CARD_RISE.stagger
      );
    });
  }

  /** Recalc start/end after layout, images, or font load. */
  function refreshTriggers() {
    ScrollTrigger.refresh();
  }

  requestAnimationFrame(refreshTriggers);
  window.addEventListener("load", refreshTriggers);
  window.setTimeout(refreshTriggers, 400);
});
