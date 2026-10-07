/**
 * Resource circularity — connector paths and energy-mix donuts.
 */
(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";
  var LINK_LIME = "#cddd4a";
  var LINK_GREEN = "#5f8a3c";
  var STACKED_MQ = "(max-width: 1100px)";

  var COLORS = {
    other: "#1a3d7c",
    wind: "#7eb6e6",
    gas: "#e7dcc0",
    biofuels: "#e8772a",
    hydro: "#c6c84a",
    solar: "#5fa03a",
    nuclear: "#2d6a3e",
    oil: "#1a6b62",
    coal: "#1a2e24",
    hsd: "#1a3d7c",
    lpg: "#14685c",
    da: "#7a3e9a",
    solarG: "#8fbf55",
    bagasse: "#ddd6a8",
    petrol: "#3d7a32",
    coalG: "#163d2c",
    grid: "#d5e0a8"
  };

  var CHARTS = {
    world: {
      start: 56,
      slices: [
        { key: "gas", value: 24, label: "24%" },
        { key: "coal", value: 32 },
        { key: "oil", value: 11 },
        { key: "nuclear", value: 8 },
        { key: "other", value: 3 },
        { key: "wind", value: 4 },
        { key: "biofuels", value: 4 },
        { key: "hydro", value: 6 },
        { key: "solar", value: 8 }
      ]
    },
    india: {
      start: -18,
      slices: [
        { key: "gas", value: 57, label: "57%" },
        { key: "coal", value: 15 },
        { key: "oil", value: 6 },
        { key: "nuclear", value: 2.5 },
        { key: "other", value: 2 },
        { key: "wind", value: 3.5 },
        { key: "biofuels", value: 3 },
        { key: "hydro", value: 4 },
        { key: "solar", value: 7 }
      ]
    },
    gbl: {
      start: 292,
      slices: [
        { key: "bagasse", value: 83.6, label: "83.6%" },
        { key: "coalG", value: 13.4 },
        { key: "petrol", value: 0.7 },
        { key: "hsd", value: 0.5 },
        { key: "lpg", value: 0.4 },
        { key: "da", value: 0.4 },
        { key: "solarG", value: 0.5 },
        { key: "grid", value: 0.5 }
      ]
    }
  };

  function init() {
    drawLinks();
    paintCharts();
    var frame;
    window.addEventListener("resize", function () {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(drawLinks);
    });
  }

  function drawLinks() {
    var stage = document.querySelector(".rc-pillars__stage");
    var svg = stage && stage.querySelector(".rc-pillars__links");
    if (!stage || !svg) return;

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    if (window.matchMedia(STACKED_MQ).matches) return;

    var energy = box(stage, stage.querySelector(".rc-pillar--energy .rc-capsule__frame"));
    var water = box(stage, stage.querySelector(".rc-water"));
    var hub = box(stage, stage.querySelector(".rc-hub"));
    var waste = box(stage, stage.querySelector(".rc-pillar--waste .rc-capsule__frame"));
    if (!energy || !water || !hub || !waste) return;

    var w = stage.clientWidth;
    var h = stage.clientHeight;
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);

    var leftJoin = { x: energy.right + 34, y: energy.bottom - 22 };
    var rightJoin = { x: waste.left - 34, y: waste.bottom - 22 };

    addPath(svg, tail(energy, 1, leftJoin), LINK_GREEN, 6);
    addPath(svg, tail(waste, -1, rightJoin), LINK_GREEN, 6);
    addPath(svg, snake(water.left + 3, water.top + water.h * 0.42, leftJoin.x, leftJoin.y, -1), LINK_LIME, 7);
    addPath(svg, snake(water.right - 3, water.top + water.h * 0.42, rightJoin.x, rightJoin.y, 1), LINK_LIME, 7);
    addDot(svg, leftJoin.x, leftJoin.y, LINK_LIME);
    addDot(svg, rightJoin.x, rightJoin.y, LINK_GREEN);
  }

  function addPath(svg, d, color, width) {
    var path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", String(width));
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.appendChild(path);
  }

  function addDot(svg, x, y, color) {
    var dot = document.createElementNS(SVG_NS, "circle");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", y);
    dot.setAttribute("r", "6.5");
    dot.setAttribute("fill", color);
    svg.appendChild(dot);
  }

  function snake(x1, y1, x2, y2, dir) {
    var span = Math.abs(x2 - x1);
    var midX = x1 + dir * Math.max(54, span * 0.46);
    var knee = y1 + Math.max(64, (y2 - y1) * 0.5);
    var low = Math.max(knee + 36, y2 + 18);
    return [
      "M", x1, y1,
      "C", x1 + dir * 30, y1, midX, y1 + 6, midX, knee,
      "C", midX, low, x2 - dir * 12, low, x2, y2
    ].join(" ");
  }

  function tail(frame, dir, join) {
    var x = dir > 0 ? frame.right - 1 : frame.left + 1;
    var y = frame.bottom - 10;
    return [
      "M", x, y,
      "C", x + dir * 26, y + 8, join.x, join.y + 22, join.x, join.y
    ].join(" ");
  }

  function box(stage, el) {
    if (!el) return null;
    var stageRect = stage.getBoundingClientRect();
    var rect = el.getBoundingClientRect();
    return {
      left: rect.left - stageRect.left,
      right: rect.right - stageRect.left,
      top: rect.top - stageRect.top,
      bottom: rect.bottom - stageRect.top,
      cx: rect.left - stageRect.left + rect.width / 2,
      cy: rect.top - stageRect.top + rect.height / 2,
      w: rect.width,
      h: rect.height
    };
  }

  function paintCharts() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.querySelectorAll("[data-rc-chart]").forEach(function (figure) {
      var spec = CHARTS[figure.getAttribute("data-rc-chart")];
      if (!spec) return;
      paintLegend(figure);
      if (reduce) {
        renderDonut(figure, spec, 1);
        return;
      }
      var played = false;
      if (!("IntersectionObserver" in window)) {
        renderDonut(figure, spec, 1);
        return;
      }
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || played) return;
          played = true;
          observer.disconnect();
          animateDonut(figure, spec);
        });
      }, { threshold: 0.35 });
      observer.observe(figure);
    });
  }

  function paintLegend(figure) {
    figure.querySelectorAll(".rc-chart__legend [data-key]").forEach(function (item) {
      var color = COLORS[item.getAttribute("data-key")];
      if (color) item.style.setProperty("--swatch", color);
    });
  }

  function animateDonut(figure, spec) {
    var start = performance.now();
    var duration = 1100;
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      renderDonut(figure, spec, eased);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function renderDonut(figure, spec, progress) {
    var svg = figure.querySelector(".rc-chart__svg");
    var group = figure.querySelector(".rc-chart__slices");
    var label = figure.querySelector(".rc-chart__value");
    if (!svg || !group) return;

    while (group.firstChild) group.removeChild(group.firstChild);

    var budget = Math.max(0, Math.min(1, progress)) * 360;
    var angle = spec.start;
    var highlight = null;

    spec.slices.forEach(function (slice) {
      var full = (slice.value / 100) * 360;
      var sweep = Math.min(full, budget);
      budget -= sweep;
      if (sweep > 0.15) {
        var path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", ringSlice(100, 100, 52, 96, angle, angle + sweep));
        path.setAttribute("fill", COLORS[slice.key] || "#ccc");
        group.appendChild(path);
      }
      if (slice.label && progress > 0.98) {
        highlight = { mid: angle + full / 2, text: slice.label };
      }
      angle += sweep > 0 ? sweep : 0;
      if (budget <= 0) return;
    });

    if (label) {
      if (highlight) {
        var point = polar(100, 100, 78, highlight.mid);
        label.setAttribute("x", point.x.toFixed(2));
        label.setAttribute("y", point.y.toFixed(2));
        label.setAttribute("dominant-baseline", "central");
        label.textContent = highlight.text;
        figure.classList.add("is-drawn");
      } else {
        label.textContent = "";
        figure.classList.remove("is-drawn");
      }
    }
  }

  function polar(cx, cy, r, deg) {
    var rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function ringSlice(cx, cy, rInner, rOuter, a0, a1) {
    var delta = a1 - a0;
    while (delta < 0) delta += 360;
    while (delta >= 360) delta -= 360;
    var large = delta > 180 ? 1 : 0;
    var p1 = polar(cx, cy, rOuter, a0);
    var p2 = polar(cx, cy, rOuter, a1);
    var p3 = polar(cx, cy, rInner, a1);
    var p4 = polar(cx, cy, rInner, a0);
    return [
      "M", p1.x, p1.y,
      "A", rOuter, rOuter, 0, large, 1, p2.x, p2.y,
      "L", p3.x, p3.y,
      "A", rInner, rInner, 0, large, 0, p4.x, p4.y,
      "Z"
    ].join(" ");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
