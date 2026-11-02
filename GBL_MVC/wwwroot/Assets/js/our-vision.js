/**
 * Our Vision page — guiding principle icons
 * Icons are filled shapes, so the outline of each shape is drawn first and
 * the fill fades in once the line is complete. Plays when the panel enters
 * the viewport and resets when scrolling back above it.
 */
document.addEventListener("DOMContentLoaded", function () {
  var panel = document.querySelector(".guiding-principles__panel");
  if (!panel) return;

  var images = Array.from(panel.querySelectorAll(".principle-item__icon img"));
  if (!images.length) return;

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (typeof fetch === "undefined" || typeof DOMParser === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  var isMobile = window.matchMedia("(max-width: 992px)").matches;
  var isStacked = window.matchMedia("(max-width: 639px)").matches;
  var stScroller = isMobile ? window : document.documentElement;
  var LINE_DRAW = {
    strokePx: 1.25,
    drawDuration: 1.6,
    pathStagger: 0.04,
    fillDuration: 0.5,
    iconStagger: 0.18,
    start: "top 75%",
  };

  /* Keep the icons hidden until they are ready to draw. */
  gsap.set(images, { autoAlpha: 0 });

  /** Swap an <img> for its inline SVG; the <img> stays if the file can't load. */
  function inlineIcon(img) {
    return fetch(img.currentSrc || img.src)
      .then(function (res) {
        if (!res.ok) throw new Error("Icon request failed");
        return res.text();
      })
      .then(function (text) {
        var svg = new DOMParser().parseFromString(text, "image/svg+xml").documentElement;
        if (svg.nodeName.toLowerCase() !== "svg") throw new Error("Icon is not an SVG");
        svg.setAttribute("aria-hidden", "true");
        svg.setAttribute("focusable", "false");
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.setAttribute("shape-rendering", "geometricPrecision");
        svg.querySelectorAll("[clip-path]").forEach(function (node) {
          node.removeAttribute("clip-path");
        });
        img.replaceWith(svg);
        return svg;
      })
      .catch(function () {
        gsap.set(img, { autoAlpha: 1 });
        return null;
      });
  }

  /** Line draw for one icon, added to the given timeline at a position. */
  function addLineDraw(tl, svg, position) {
    var vb = svg.viewBox.baseVal;
    var bounds = svg.getBoundingClientRect();
    var unit = bounds.height > 0 && vb.height ? bounds.height / vb.height : 1;
    var strokeWidth = LINE_DRAW.strokePx / unit;
    var paths = Array.from(svg.querySelectorAll("path")).filter(function (path) {
      return path.getTotalLength() > 0;
    });

    paths.forEach(function (path) {
      var length = path.getTotalLength();
      gsap.set(path, {
        stroke: "#fff",
        strokeWidth: strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeMiterlimit: 2,
        strokeOpacity: 1,
        fillOpacity: 0,
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    });

    tl.to(
      paths,
      {
        strokeDashoffset: 0,
        duration: LINE_DRAW.drawDuration,
        stagger: LINE_DRAW.pathStagger,
        ease: "sine.inOut",
      },
      position
    ).to(
      paths,
      {
        fillOpacity: 1,
        strokeOpacity: 0,
        duration: LINE_DRAW.fillDuration,
        ease: "none",
      },
      ">-0.1"
    );
  }

  function createTimeline(trigger) {
    return gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        scroller: stScroller,
        start: LINE_DRAW.start,
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      },
    });
  }

  Promise.all(images.map(inlineIcon)).then(function (svgs) {
    svgs = svgs.filter(Boolean);
    if (!svgs.length) return;

    /* Stacked on phones: each icon draws as its own card arrives. */
    if (isStacked) {
      svgs.forEach(function (svg) {
        addLineDraw(createTimeline(svg.closest(".principle-item")), svg, 0);
      });
    } else {
      var tl = createTimeline(panel);
      svgs.forEach(function (svg, i) {
        addLineDraw(tl, svg, i * LINE_DRAW.iconStagger);
      });
    }

    ScrollTrigger.refresh();
  });
});
