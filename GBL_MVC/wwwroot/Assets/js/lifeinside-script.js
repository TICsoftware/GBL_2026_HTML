/* =====================================================================
   LIFE INSIDE PRIYA CEMENT — cinematic scroll story
   GSAP + ScrollTrigger + HTML5 Canvas image sequence (120 frames)
   ===================================================================== */
(() => {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  const FRAME_COUNT = 120;

  const section = document.getElementById("life-inside");
  const stickyStage = section && section.querySelector(".sticky-stage");
  const stage = document.getElementById("stage");
  const canvas = document.getElementById("flower");
  const title = document.getElementById("section-title");
  const logo = document.getElementById("center-logo");

  if (!section || !stickyStage || !stage || !canvas || !title) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  /* Razor ~/ does not work in JS — use data-frames-base from the section */
  const framesBase = (
    section.dataset.framesBase || "/Assets/images/careers/images/"
  ).replace(/\/?$/, "/");
  const FRAME_PATH = (i) =>
    `${framesBase}frame_${String(i).padStart(4, "0")}.png`;

  /* Reveal order around the flower (clockwise from Learning) */
  const ORDER = [
    "learning",
    "leadership",
    "recognition",
    "purpose",
    "culture",
    "safety",
    "wellness",
  ];
  const icons = ORDER.map((k) =>
    section.querySelector(`.icon[data-key="${k}"]`)
  ).filter(Boolean);
  const labels = ORDER.map((k) =>
    section.querySelector(`.label[data-key="${k}"]`)
  ).filter(Boolean);
  const pairs = ORDER.map((k) => ({
    key: k,
    icon: section.querySelector(`.icon[data-key="${k}"]`),
    label: section.querySelector(`.label[data-key="${k}"]`),
  })).filter((p) => p.icon || p.label);

  const images = new Array(FRAME_COUNT);
  const state = { frame: 0 };
  let needsRender = true;

  const SEQ_DURATION = 3;
  let master = null;
  let seqStart = 0;

  /* Original Figma layout — matched to petal tips before any canvas nudge */
  const FIGMA_LAYOUT = {
    nodes: {
      logo: { x: 47.81, y: 51.36, size: 25.23 },
      wellness: { x: 52.8, y: 13.9, size: 24.76 },
      learning: { x: 80.17, y: 30.77, size: 24.76 },
      leadership: { x: 84.92, y: 64.13, size: 24.76 },
      recognition: { x: 62.22, y: 86.9, size: 24.76 },
      purpose: { x: 28.41, y: 83.9, size: 24.76 },
      culture: { x: 9.7, y: 56.13, size: 24.76 },
      safety: { x: 19.95, y: 26.78, size: 24.76 },
    },
    labelOffset: {
      wellness: { x: 14.2, y: -13.7 },
      learning: { x: 14.8, y: -5.9 },
      leadership: { x: 14.9, y: -5.2 },
      recognition: { x: 12.4, y: 8.3 },
      purpose: { x: -14.1, y: 5.4 },
      culture: { x: -14.3, y: 3.2 },
      safety: { x: -1.4, y: -25.0 },
    },
    /* Push labels farther into side gutters when the stage is scaled down */
    labelOffsetMobile: {
      wellness: { x: 22, y: -18 },
      learning: { x: 24, y: -4 },
      leadership: { x: 24, y: -2 },
      recognition: { x: 20, y: 12 },
      purpose: { x: -22, y: 8 },
      culture: { x: -24, y: 2 },
      safety: { x: -8, y: -28 },
    },
  };

  const mqNarrow = window.matchMedia("(max-width: 767px)");
  const EDGE_PAD = () => (mqNarrow.matches ? 8 : 12);
  /* Icons slightly smaller on phone so petals leave room for copy */
  const NODE_SIZE_SCALE = () => (mqNarrow.matches ? 0.82 : 1);

  /*
   * Per-icon fine-tune in % of stage (added on top of Figma %).
   * x: + right / − left | y: + down / − up | ~1 ≈ 1% of stage width
   */
  const NODE_NUDGE = {
    learning: { x: 0, y: 0 },
    leadership: { x: 0, y: 0 },
    recognition: { x: 0, y: 0 },
    purpose: { x: 0, y: 0 },
    culture: { x: 0, y: 0 },
    safety: { x: 0, y: 0 },
    wellness: { x: 0, y: 0 },
    logo: { x: 0, y: 0 },
  };

  /*
   * Shift drawn frames so the flower hole lands on Figma logo center.
   * Icons/labels keep Figma % — they already match the (nudged) petals.
   */
  const FRAME_NUDGE = { x: 0.0341, y: 0.0466 };

  const nodes = [...icons, logo].filter(Boolean);

  /** Center nodes on their left/top anchor — GSAP only (no CSS translate) */
  function centerNodes(extra = {}) {
    gsap.set(nodes, {
      x: 0,
      y: 0,
      xPercent: -50,
      yPercent: -50,
      ...extra,
    });
  }

  function layoutScene() {
    const stageRect = stage.getBoundingClientRect();
    const hostRect = stickyStage.getBoundingClientRect();
    const w = stageRect.width;
    const h = stageRect.height;
    if (!w || !h) return;

    const stageToHostX = stageRect.left - hostRect.left;
    const stageToHostY = stageRect.top - hostRect.top;
    const iconCenters = {};
    const sizeScale = NODE_SIZE_SCALE();
    const labelOffsets = mqNarrow.matches
      ? FIGMA_LAYOUT.labelOffsetMobile
      : FIGMA_LAYOUT.labelOffset;

    for (const [key, p] of Object.entries(FIGMA_LAYOUT.nodes)) {
      const el =
        key === "logo"
          ? logo
          : section.querySelector(`.icon[data-key="${key}"]`);
      if (!el) continue;

      const nudge = NODE_NUDGE[key] || { x: 0, y: 0 };
      const left = ((p.x + nudge.x) / 100) * w;
      const top = ((p.y + nudge.y) / 100) * h;
      const size = ((p.size * sizeScale) / 100) * w;

      el.style.left = left + "px";
      el.style.top = top + "px";
      el.style.width = size + "px";

      if (key !== "logo") {
        iconCenters[key] = { x: left, y: top, size };
      }
    }

    for (const key of ORDER) {
      const labelEl = section.querySelector(`.label[data-key="${key}"]`);
      const icon = iconCenters[key];
      const off = labelOffsets[key];
      if (!labelEl || !icon || !off) continue;

      const side = labelEl.dataset.side || "right";

      labelEl.style.left = "0px";
      labelEl.style.top = "0px";
      const lr = labelEl.getBoundingClientRect();

      /*
       * labelOffset is % of stage from the icon CENTER.
       * x/y here are what you edit in FIGMA_LAYOUT.labelOffset /
       * labelOffsetMobile.
       */
      const ox = (off.x / 100) * w;
      const oy = (off.y / 100) * h;

      let left = stageToHostX + icon.x + ox;
      let top = stageToHostY + icon.y + oy;

      /* Left-side copy: offset is to the text start — shift by label width
         so the block sits fully on the left of the orb */
      if (side === "left") {
        left -= lr.width;
      }

      const pad = EDGE_PAD();
      left = Math.max(pad, Math.min(left, hostRect.width - pad - lr.width));
      top = Math.max(pad, Math.min(top, hostRect.height - pad - lr.height));

      labelEl.style.left = left + "px";
      labelEl.style.top = top + "px";
    }
  }

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function preloadImages() {
    let loaded = 0;
    let failed = 0;

    return new Promise((resolve) => {
      const finishOne = () => {
        loaded++;
        if (loaded === FRAME_COUNT) resolve({ failed });
      };

      for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        img.decoding = "async";
        img.src = FRAME_PATH(i);
        images[i - 1] = img;
        img.onload = () => {
          if (img.decode) {
            img.decode().then(finishOne).catch(finishOne);
          } else {
            finishOne();
          }
        };
        img.onerror = () => {
          failed++;
          finishOne();
        };
      }
    });
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = stage.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    needsRender = true;
  }

  function renderFrame(index) {
    const img = images[Math.max(0, Math.min(FRAME_COUNT - 1, index | 0))];
    if (!img || !img.naturalWidth) return;

    const cw = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, cw, ch);

    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const dx = (cw - w) / 2 + cw * FRAME_NUDGE.x;
    const dy = (ch - h) / 2 + ch * FRAME_NUDGE.y;
    ctx.drawImage(img, dx, dy, w, h);
  }

  let lastDrawn = -1;
  function tick() {
    if (master) {
      const p = gsap.utils.clamp(
        0,
        1,
        (master.time() - seqStart) / SEQ_DURATION
      );
      const f = Math.round(p * (FRAME_COUNT - 1));
      if (f !== state.frame) {
        state.frame = f;
        needsRender = true;
      }
    }
    if (needsRender || (state.frame | 0) !== lastDrawn) {
      lastDrawn = state.frame | 0;
      renderFrame(lastDrawn);
      needsRender = false;
    }
    requestAnimationFrame(tick);
  }

  function createTimeline() {
    /* Keep title inside the sticky panel — viewport centering at init time
       pushed it hundreds of px above the fold once the section pins. */
    gsap.set(title, { opacity: 0, scale: 1.12, y: 48 });
    gsap.set(canvas, { opacity: 0, filter: "blur(12px)" });
    /* GSAP alone centers nodes — never mix with CSS translate(-50%,-50%) */
    centerNodes({
      opacity: 0,
      scale: 0.5,
      filter: "blur(10px)",
    });
    gsap.set(labels, {
      opacity: 0,
      x: (i, el) => (el.dataset.side === "left" ? -24 : 24),
    });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=260%",
        pin: stickyStage,
        pinSpacing: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: () => {
          layoutScene();
          centerNodes();
        },
      },
    });

    /* Title + canvas appear as soon as the section pins — no empty white beat */
    tl.to(title, { opacity: 1, scale: 1, duration: 1.0 }, 0)
      .to(canvas, { opacity: 1, duration: 0.5, ease: "power1.out" }, 0.15)
      .to(title, { y: 0, duration: 1.4, ease: "power3.out" }, 0.35)
      .addLabel("seq", ">-0.1")
      .to({}, { duration: SEQ_DURATION }, "seq")
      .to(
        canvas,
        {
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power2.out",
        },
        "seq+=0.35"
      )
      .to(
        logo,
        {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.65,
          ease: "power2.out",
        },
        "seq+=0.5"
      );

    /* Each value: icon + label together, then next pair */
    const PAIR_STAGGER = 0.24;
    const PAIR_DUR = 0.55;
    pairs.forEach((pair, i) => {
      const at = `seq+=${(0.65 + i * PAIR_STAGGER).toFixed(2)}`;
      if (pair.icon) {
        tl.to(
          pair.icon,
          {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: PAIR_DUR,
            ease: "back.out(1.6)",
          },
          at
        );
      }
      if (pair.label) {
        tl.to(
          pair.label,
          {
            opacity: 1,
            x: 0,
            duration: PAIR_DUR,
            ease: "power2.out",
          },
          at
        );
      }
    });

    tl.to({}, { duration: 0.9 });

    master = tl;
    seqStart = tl.labels.seq;
    return tl;
  }

  function init() {
    layoutScene();
    centerNodes({ scale: 0.5 });
    resizeCanvas();
    requestAnimationFrame(tick);

    preloadImages().then(() => {
      renderFrame(0);

      if (reduceMotion) {
        state.frame = FRAME_COUNT - 1;
        needsRender = true;
        gsap.set(
          [title, canvas, ...icons, ...labels, logo].filter(Boolean),
          {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            filter: "none",
          }
        );
        centerNodes({ opacity: 1, scale: 1, filter: "none" });
        // No pin gets created on this path, but sections below still wait
        // for this signal (see careers-script.js) — fire it regardless.
        window.dispatchEvent(new Event("lifeinside:ready"));
        return;
      }

      createTimeline();
      ScrollTrigger.refresh();
      /* Sections further down the page (CTA parallax, workplace culture
         tile parallax, man-cutout reveal) create their own ScrollTriggers
         only after this fires — creating them earlier measures against
         the pre-pin page height, and a later ScrollTrigger.refresh() does
         not correct that mismatch. */
      window.dispatchEvent(new Event("lifeinside:ready"));
    });

    let resizeQueued = false;
    const onViewportChange = () => {
      if (resizeQueued) return;
      resizeQueued = true;
      requestAnimationFrame(() => {
        resizeQueued = false;
        layoutScene();
        centerNodes();
        resizeCanvas();
        ScrollTrigger.refresh();
      });
    };
    window.addEventListener("resize", onViewportChange, { passive: true });
    if (typeof mqNarrow.addEventListener === "function") {
      mqNarrow.addEventListener("change", onViewportChange);
    } else if (typeof mqNarrow.addListener === "function") {
      mqNarrow.addListener(onViewportChange);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        layoutScene();
        centerNodes();
      });
    }
    ScrollTrigger.addEventListener("refreshInit", () => {
      layoutScene();
      centerNodes();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
