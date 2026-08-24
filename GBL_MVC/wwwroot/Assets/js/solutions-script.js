document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reduceMotion && typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    if (typeof gsap.registerPlugin === "function") gsap.registerPlugin(ScrollTrigger);

    /* ---------------------------------------
       Lion stroke draw → fill (intro + enquiry)
    --------------------------------------- */
    function initLionDraw(lionWrap, options = {}) {
      if (!lionWrap) return;
      const lionSvg =
        lionWrap.querySelector(".lion-logo-svg") || lionWrap.querySelector("svg");
      const lionFill = lionSvg && lionSvg.querySelector(".lion-logo-fill");
      if (!lionSvg || !lionFill) return;

      const strokeColor = options.stroke || "#C8C8C8";
      const start = options.start || "top 85%";
      const trigger =
        options.trigger ||
        lionWrap.closest("#solutions-enquiry") ||
        lionWrap.closest(".page-intro-outer") ||
        lionWrap;

      let lionStroke = lionSvg.querySelector(".lion-logo-stroke");
      if (!lionStroke) {
        lionStroke = lionFill.cloneNode();
        lionStroke.removeAttribute("fill");
        lionStroke.removeAttribute("fill-opacity");
        lionStroke.classList.remove("lion-logo-fill");
        lionStroke.classList.add("lion-logo-stroke");
        lionStroke.setAttribute("fill", "none");
        lionStroke.setAttribute("stroke", strokeColor);
        lionStroke.setAttribute("stroke-width", "1.75");
        lionStroke.setAttribute("stroke-linecap", "round");
        lionStroke.setAttribute("stroke-linejoin", "round");
        lionStroke.setAttribute("vector-effect", "non-scaling-stroke");
        lionSvg.insertBefore(lionStroke, lionFill);
      }

      let pathLen = 0;
      try {
        pathLen = lionStroke.getTotalLength();
      } catch (e) {
        pathLen = 0;
      }
      if (pathLen <= 0) return;

      gsap.set(lionWrap, {
        xPercent: 0,
        yPercent: 0,
        scale: 0.05,
        transformOrigin: "50% 50%",
        force3D: true,
      });
      gsap.set(lionStroke, {
        strokeDasharray: pathLen,
        strokeDashoffset: pathLen,
        autoAlpha: 1,
      });
      gsap.set(lionFill, { autoAlpha: 0 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger,
            start,
            toggleActions: "play none none reverse",
            invalidateOnRefresh: true,
          },
        })
        .to(
          lionWrap,
          {
            scale: 1,
            duration: 1.35,
            ease: "power2.out",
            force3D: true,
          },
          0
        )
        .to(
          lionStroke,
          {
            strokeDashoffset: 0,
            duration: 1.35,
            ease: "power2.inOut",
          },
          0
        )
        .to(lionFill, { autoAlpha: 1, duration: 0.55, ease: "power2.out" }, "-=0.3")
        .to(lionStroke, { autoAlpha: 0, duration: 0.4, ease: "power1.out" }, "-=0.35");
    }

    initLionDraw(document.querySelector(".page-intro-outer .lion-logo-wrap"), {
      stroke: "#C8C8C8",
      start: "top 85%",
    });
    initLionDraw(document.querySelector("#solutions-enquiry .lion-logo-wrap"), {
      stroke: "rgba(255,255,255,0.55)",
      start: "top 75%",
    });

    /* ---------------------------------------
       Left/right image parallax (same as Careers)
       Needs .parallax-wrap + .parallax-img (height 130% in common-style)
    --------------------------------------- */
    gsap.utils.toArray(".parallax-wrap").forEach((wrap) => {
      if (wrap.classList.contains("enlarge-wrapper")) return;
      if (wrap.closest(".bg-parallax-section")) return;

      const img = wrap.querySelector(".parallax-img");
      if (!img) return;

      gsap.fromTo(
        img,
        { yPercent: -12 },
        {
          yPercent: 12,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: wrap,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        }
      );
    });
  }

  /* ---------------------------------------
     Why partner cards — rise on scroll (our-products-cards pattern)
  --------------------------------------- */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    const whypartnerGrid = document.querySelector(".whypartner-section .whypartner-grid");
    const whypartnerCards = whypartnerGrid
      ? gsap.utils.toArray(whypartnerGrid.querySelectorAll(".whypartner-card"))
      : [];

    if (whypartnerGrid && whypartnerCards.length) {
      if (reduceMotion) {
        gsap.set(whypartnerCards, { clearProps: "transform" });
      } else {
        whypartnerGrid.classList.add("is-rise-anim");

        function getWhypartnerColCount() {
          const w = window.innerWidth;
          if (w >= 1200) return 4;
          if (w >= 768) return 2;
          return 1;
        }

        whypartnerCards.forEach((card, i) => {
          const fromY = 60 * (i + 1);
          const col = i % getWhypartnerColCount();
          const start = `top ${90 - col * 4}%`;
          const end = `top ${58 - col * 3}%`;

          gsap.fromTo(
            card,
            { y: fromY, force3D: true },
            {
              y: 0,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: card,
                start,
                end,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      }
    }
  }

  /* ---------------------------------------
     Brochure language cards — rise on scroll
     (match whypartner-card feel)
  --------------------------------------- */
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    const brochureGrid = document.querySelector(
      ".whypartner-brochure-section .solutions-brochure-grid"
    );
    const brochureCards = brochureGrid
      ? gsap.utils.toArray(
          brochureGrid.querySelectorAll(".solutions-brochure-block")
        )
      : [];

    if (brochureGrid && brochureCards.length) {
      if (reduceMotion) {
        gsap.set(brochureCards, { clearProps: "transform,opacity" });
      } else {
        brochureGrid.classList.add("is-rise-anim");

        function getBrochureColCount() {
          const w = window.innerWidth;
          if (w >= 1024) return 6;
          if (w >= 768) return 4;
          if (w >= 640) return 3;
          return 2;
        }

        brochureCards.forEach((card, i) => {
          const col = i % getBrochureColCount();
          const fromY = 60 * (i + 1);
          const start = `top ${90 - col * 4}%`;
          const end = `top ${58 - col * 3}%`;

          gsap.fromTo(
            card,
            { y: fromY, autoAlpha: 0, force3D: true },
            {
              y: 0,
              autoAlpha: 1,
              ease: "none",
              force3D: true,
              scrollTrigger: {
                trigger: card,
                start,
                end,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      }
    }
  }

  /* ---------------------------------------
     FAQ accordion — one open at a time (CSS grid expand)
  --------------------------------------- */
  const faqRoot = document.querySelector("[data-solutions-faq]");
  if (faqRoot) {
    const items = [...faqRoot.querySelectorAll(".solutions-faq-item")];

    function setOpen(item, open) {
      const btn = item.querySelector(".solutions-faq-trigger");
      const panel = item.querySelector(".solutions-faq-panel");
      if (!btn || !panel) return;
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.setAttribute("aria-hidden", open ? "false" : "true");
    }

    items.forEach((item) => {
      const panel = item.querySelector(".solutions-faq-panel");
      if (panel) {
        panel.removeAttribute("hidden");
        panel.style.height = "";
        panel.setAttribute(
          "aria-hidden",
          item.classList.contains("is-open") ? "false" : "true"
        );
      }

      const btn = item.querySelector(".solutions-faq-trigger");
      if (!btn) return;
      btn.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");
        items.forEach((other) => setOpen(other, other === item && willOpen));
      });
    });
  }

  /* ---------------------------------------
     Enquiry form — custom selects + sqft
  --------------------------------------- */
  const enquiryRoot = document.getElementById("solutions-enquiry");
  if (enquiryRoot) {
    function buildSelect(root) {
      const name = root.dataset.name;
      const placeholder = root.dataset.placeholder;
      const options = (root.dataset.options || "").split("|").filter(Boolean);
      const id = "solutions-cs-" + name;

      root.innerHTML = `
    <input type="hidden" name="${name}" value="" />
    <button type="button" class="f-field cselect-btn" data-empty="true" role="combobox"
            aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}" aria-label="${placeholder}">
      <span class="cselect-value">${placeholder}</span>
      <svg class="cselect-chevron" width="14" height="8" viewBox="0 0 14 8" fill="none" aria-hidden="true">
        <path d="M1 1l6 6 6-6" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="cselect-menu" id="${id}" role="listbox" aria-label="${placeholder}">
      ${options.map((o) => `<button type="button" class="cselect-option" role="option" aria-selected="false" data-value="${o}">${o}</button>`).join("")}
    </div>`;

      const btn = root.querySelector(".cselect-btn");
      const menu = root.querySelector(".cselect-menu");
      const hidden = root.querySelector("input[type=hidden]");
      const label = root.querySelector(".cselect-value");

      function close() {
        if (!root.classList.contains("is-open")) return;
        root.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        if (typeof gsap !== "undefined") {
          gsap.to(menu, { autoAlpha: 0, y: -6, duration: 0.18, ease: "power2.in" });
        } else {
          menu.style.opacity = "0";
          menu.style.visibility = "hidden";
        }
      }

      function open() {
        enquiryRoot.querySelectorAll("[data-cselect].is-open").forEach((el) => {
          if (el !== root && el._close) el._close();
        });
        root.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        if (typeof gsap !== "undefined") {
          gsap.fromTo(
            menu,
            { autoAlpha: 0, y: -6 },
            { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }
          );
        } else {
          menu.style.opacity = "1";
          menu.style.visibility = "visible";
        }
      }

      root._close = close;

      btn.addEventListener("click", () =>
        root.classList.contains("is-open") ? close() : open()
      );
      menu.addEventListener("click", (e) => {
        const opt = e.target.closest(".cselect-option");
        if (!opt) return;
        menu
          .querySelectorAll(".cselect-option")
          .forEach((o) => o.setAttribute("aria-selected", String(o === opt)));
        hidden.value = opt.dataset.value;
        label.textContent = opt.dataset.value;
        btn.dataset.empty = "false";
        close();
        btn.focus();
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
          menu.querySelector(".cselect-option")?.focus();
        }
      });
    }

    enquiryRoot.querySelectorAll("[data-cselect]").forEach(buildSelect);
    document.addEventListener("click", (e) => {
      enquiryRoot.querySelectorAll("[data-cselect].is-open").forEach((el) => {
        if (!el.contains(e.target) && el._close) el._close();
      });
    });

    const sqftField = enquiryRoot.querySelector("[data-sqft-field]");
    const spaceRadios = enquiryRoot.querySelectorAll('input[name="hasStoreSpace"]');
    function syncSqft() {
      if (!sqftField) return;
      const yes = enquiryRoot.querySelector('input[name="hasStoreSpace"][value="yes"]');
      const show = !!(yes && yes.checked);
      sqftField.classList.toggle("is-collapsed", !show);
      const input = sqftField.querySelector('input[name="sqft"]');
      if (input) {
        input.disabled = !show;
        input.required = show;
        if (!show) input.value = "";
      }
    }
    spaceRadios.forEach((radio) => radio.addEventListener("change", syncSqft));
    syncSqft();

    const enquiryForm = document.getElementById("solutions-enquiry-form");
    if (enquiryForm) {
      enquiryForm.addEventListener("submit", (e) => e.preventDefault());
    }
  }
  
});
