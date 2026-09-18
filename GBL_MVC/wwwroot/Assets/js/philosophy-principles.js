/**
 * Philosophy & Guiding Principles — scroll animation
 *
 * Desktop (1024px+):
 *   1. Title + intro stay on screen; intro words fill on scroll.
 *   2. Keep scrolling → image starts scaling up.
 *   3. After the image is 60% of the way to full viewport,
 *      the infographic travels in with the remaining scroll.
 */
document.addEventListener("DOMContentLoaded", function () {
  var section = document.querySelector(".ourPhilosophy");
  if (!section) return;

  var track = section.querySelector(".philosophy-track");
  var sticky = section.querySelector(".philosophy-sticky");
  var frame = section.querySelector("[data-philosophy-frame]");
  var frameImg = frame ? frame.querySelector("img") : null;
  var veil = section.querySelector(".philosophy-frame__veil");
  var copy = section.querySelector(".philosophy-copy");
  var infographic = section.querySelector("[data-philosophy-infographic]");
  if (!track || !sticky || !frame || !copy || !infographic) return;

  var introParagraph = copy.querySelector(".section-intro__content p");
  var cardTl = infographic.querySelector('.philosophy-card[data-principle="tl"]');
  var cardTr = infographic.querySelector('.philosophy-card[data-principle="tr"]');
  var cardBl = infographic.querySelector('.philosophy-card[data-principle="bl"]');
  var cardBr = infographic.querySelector('.philosophy-card[data-principle="br"]');
  var cards = [cardTl, cardTr, cardBl, cardBr].filter(Boolean);
  var hubInner = infographic.querySelector(".philosophy-hub__inner");
  var titleEl = copy.querySelector(".text-h2");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  var START_Y = 0;
  var FRAME_MIN_H = 480;
  var FILL_FROM = "#cccccc";
  var FILL_TO = "#282b31";

  function wrapIntroWords(el) {
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
        span.className = "intro-fill-word";
        span.textContent = part;
        frag.appendChild(span);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.dataset.introFill = "ready";
  }

  function boxedRect() {
    var stickyRect = sticky.getBoundingClientRect();
    var copyRect = copy.getBoundingClientRect();
    var stickyH = sticky.offsetHeight;
    var width = copy.offsetWidth;
    var left = Math.max(0, copyRect.left - stickyRect.left);
    var top = Math.max(0, copyRect.bottom - stickyRect.top + 8);
    var height = Math.max(FRAME_MIN_H, stickyH - top - 16);
    return { left: left, top: top, width: width, height: height };
  }

  function travelY(rect) {
    var maxY = Math.max(0, sticky.offsetHeight - rect.top - rect.height - 8);
    return Math.min(START_Y, maxY);
  }

  function applyBox(rect, y) {
    gsap.set(frame, {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      y: y == null ? travelY(rect) : y,
    });
  }

  function ninetyRect() {
    var vw = sticky.offsetWidth;
    var vh = sticky.offsetHeight;
    var width = vw * 0.9;
    var height = vh * 0.9;
    return {
      left: (vw - width) / 2,
      top: (vh - height) / 2,
      width: width,
      height: height,
    };
  }

  if (!hasGsap || reduceMotion) {
    wrapIntroWords(introParagraph);
    if (hasGsap) {
      gsap.set(frame, { left: 0, top: 0, width: "100%", height: "100%", y: 0 });
      var staticWords = copy.querySelectorAll(".intro-fill-word");
      if (staticWords.length) gsap.set(staticWords, { color: FILL_TO });
    } else {
      frame.style.left = "0";
      frame.style.top = "0";
      frame.style.width = "100%";
      frame.style.height = "100%";
    }
    section.classList.add("is-on-media");
    infographic.style.opacity = "1";
    infographic.style.visibility = "visible";
    if (veil) veil.style.opacity = "0.5";
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  var mm = gsap.matchMedia();
  var isMobileView = window.matchMedia("(max-width: 992px)").matches;
  var stScroller = isMobileView ? window : document.documentElement;

  mm.add("(min-width: 1024px)", function () {
    wrapIntroWords(introParagraph);
    var fillWords = copy.querySelectorAll(".intro-fill-word");

    var startBox = boxedRect();
    applyBox(startBox, travelY(startBox));
    if (frameImg) gsap.set(frameImg, { scale: 1, transformOrigin: "50% 50%" });
    gsap.set(veil, { opacity: 0 });
    gsap.set(copy, { y: 0, autoAlpha: 1 });
    gsap.set(infographic, {
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      y: "110vh",
      autoAlpha: 1,
    });
    if (hubInner) gsap.set(hubInner, { scale: 1, autoAlpha: 1 });
    cards.forEach(function (card) {
      gsap.set(card, { autoAlpha: 1, x: 0, y: 0 });
    });
    if (fillWords.length) gsap.set(fillWords, { color: FILL_FROM });
    section.classList.remove("is-on-media");

    var fillTween = null;
    var introBlock = copy.querySelector(".section-intro") || copy;
    if (fillWords.length) {
      fillTween = gsap.to(fillWords, {
        color: FILL_TO,
        stagger: 0.05,
        ease: "none",
        immediateRender: false,
        scrollTrigger: {
          id: "philosophy-intro-fill",
          trigger: introBlock,
          scroller: stScroller,
          start: "top 88%",
          end: "top 28%",
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });
    }

    var SCALE_START = 0.5;
    var SCALE_END = 1;
    var INFOGRAPHIC_START = SCALE_START + (SCALE_END - SCALE_START) * 0.6;

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: track,
        scroller: stScroller,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.9,
        invalidateOnRefresh: true,
      },
    });

    tl.to(frame, { y: 0, duration: 0.04 }, SCALE_START)
      .to(
        frame,
        {
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          duration: SCALE_END - SCALE_START,
        },
        SCALE_START
      )
      .to(frameImg, { scale: 1.12, duration: SCALE_END - SCALE_START }, SCALE_START)
      .to(veil, { opacity: 0.5, duration: SCALE_END - SCALE_START }, SCALE_START)
      .to(
        copy,
        {
          y: function () {
            return -(copy.offsetHeight + 48);
          },
          duration: INFOGRAPHIC_START - SCALE_START,
        },
        SCALE_START
      )
      .to(
        infographic,
        { y: 0, duration: SCALE_END - INFOGRAPHIC_START },
        INFOGRAPHIC_START
      );

    var onRefresh = function () {
      if (!tl.scrollTrigger) return;
      if (tl.scrollTrigger.progress < 0.02) {
        var box = boxedRect();
        applyBox(box, travelY(box));
      }
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);
    requestAnimationFrame(function () {
      ScrollTrigger.refresh();
    });

    return function () {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      if (fillTween) {
        if (fillTween.scrollTrigger) fillTween.scrollTrigger.kill();
        fillTween.kill();
      }
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
      tl.kill();
      gsap.set([frame, frameImg, veil, infographic, hubInner, titleEl, copy].concat(cards), { clearProps: "all" });
      gsap.set(copy.querySelectorAll(".intro-fill-word"), { clearProps: "color" });
      section.classList.remove("is-on-media");
    };
  });

  mm.add("(max-width: 1023px)", function () {
    frame.removeAttribute("style");
    if (frameImg) frameImg.removeAttribute("style");
    infographic.style.opacity = "1";
    infographic.style.visibility = "visible";
    if (veil) veil.style.opacity = "0.42";
    section.classList.remove("is-on-media");
    return function () {
      infographic.removeAttribute("style");
    };
  });
});
