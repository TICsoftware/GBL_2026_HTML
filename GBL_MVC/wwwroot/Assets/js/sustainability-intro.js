/**
 * Sustainability page-intro — landscape mantra panel
 * Background travels with scroll; quote rises in; body copy fills.
 */
document.addEventListener("DOMContentLoaded", function () {
  var section = document.querySelector(".page-intro-outer--mantra");
  if (!section) return;

  var img = section.querySelector(".page-intro-mantra__img");
  var quote = section.querySelector(".page-intro-mantra__quote");
  var copy = section.querySelector(".page-intro-mantra__copy");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 992px)").matches;
  var stScroller = isMobile ? window : document.documentElement;
  var FILL_FROM = "#8b8b8b";
  var FILL_TO = "#ffffff";

  function wrapWords(el) {
    if (!el || el.dataset.introFill === "ready") return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var text = node.nodeValue;
      if (!text || !text.trim()) return;
      var frag = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        var span = document.createElement("span");
        span.className = "page-intro-fill-word";
        span.textContent = part;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.dataset.introFill = "ready";
  }

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || reduceMotion) {
    if (copy) wrapWords(copy);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  if (img) {
    gsap.fromTo(
      img,
      { yPercent: -10 },
      {
        yPercent: 10,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: section,
          scroller: stScroller,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      }
    );
  }

  if (quote) {
    gsap.fromTo(
      quote,
      { y: 48, autoAlpha: 0.35 },
      {
        y: 0,
        autoAlpha: 1,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: quote,
          scroller: stScroller,
          start: "top 88%",
          end: "top 52%",
          scrub: 1.25,
          invalidateOnRefresh: true,
        },
      }
    );
  }

  var isPhone = window.matchMedia("(max-width: 767px)").matches;

  if (copy) {
    wrapWords(copy);
    var words = copy.querySelectorAll(".page-intro-fill-word");
    if (words.length && !isPhone) {
      gsap.set(words, { color: FILL_FROM });
      gsap.to(words, {
        color: FILL_TO,
        stagger: 0.05,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          trigger: copy,
          scroller: stScroller,
          start: "top 82%",
          end: "bottom 46%",
          scrub: 1.15,
          invalidateOnRefresh: true,
        },
      });
    }
  }
});
document.addEventListener("DOMContentLoaded", function () {
  var el = document.querySelector(".turningCommitment-cards-outer");
  if (!el || typeof Swiper === "undefined") return;

  var swiper = null;
  var MOBILE_MAX = 767;

  function isMobileView() {
    return window.innerWidth <= MOBILE_MAX;
  }

  function enableSlider() {
    if (swiper) return;
    swiper = new Swiper(el, {
      slidesPerView: 1.08,
      spaceBetween: 16,
      watchOverflow: true,
      pagination: {
        el: ".turningCommitment-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".turningCommitment-nav--next",
        prevEl: ".turningCommitment-nav--prev",
      },
    });
  }

  function disableSlider() {
    if (!swiper) return;
    swiper.destroy(true, true);
    swiper = null;
  }

  function syncMode() {
    if (isMobileView()) enableSlider();
    else disableSlider();
  }

  syncMode();
  window.addEventListener("resize", function () {
    syncMode();
  });
});
