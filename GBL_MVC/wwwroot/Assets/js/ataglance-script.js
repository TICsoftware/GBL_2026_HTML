(() => {
  const section = document.querySelector(".ataglance");
  if (!section || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const items = Array.from(section.querySelectorAll(".ataglance-item"));
  const wrappers = Array.from(section.querySelectorAll(".ataglance-card-wrapper"));
  const cards = wrappers.map((wrapper) => wrapper.querySelector("[data-glance-card]"));
  if (!items.length || !wrappers.length || cards.some((card) => !card)) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mm = gsap.matchMedia();
  const PIN_GAP = 32;
  let activeIndex = 0;

  const setItemState = (index) => {
    if (index === activeIndex) return;
    activeIndex = index;

    items.forEach((item, i) => {
      const on = i === index;
      item.classList.toggle("is-active", on);
      item.setAttribute("aria-pressed", on ? "true" : "false");
    });

    cards.forEach((card, i) => {
      card.classList.toggle("is-active", i === index);
    });
  };

  function getHeaderPx() {
    const headerRaw =
      getComputedStyle(document.documentElement).getPropertyValue("--header-h").trim() ||
      "5.5rem";
    const probe = document.createElement("div");
    probe.style.cssText = `position:absolute;visibility:hidden;height:${headerRaw}`;
    document.body.appendChild(probe);
    const headerPx = probe.offsetHeight || 96;
    probe.remove();
    return headerPx;
  }

  function getPinTopPx() {
    const title = section.querySelector(".title-section");
    let titleBlock = 0;
    if (title) {
      const cs = getComputedStyle(title);
      titleBlock =
        title.getBoundingClientRect().height + (parseFloat(cs.marginBottom) || 0);
    }

    const pinTop = Math.round(getHeaderPx() + PIN_GAP + titleBlock);
    section.style.setProperty("--ataglance-pin-top", `${pinTop}px`);
    section.style.setProperty("--ataglance-title-h", `${Math.round(titleBlock)}px`);
    return pinTop;
  }

  const scrollToCard = (index) => {
    const target = wrappers[index];
    if (!target) return;

    const pinTop = getPinTopPx();

    if (window.lenis && typeof window.lenis.scrollTo === "function") {
      window.lenis.scrollTo(target, { offset: -pinTop, duration: 1.05 });
      return;
    }

    const top = target.getBoundingClientRect().top + window.pageYOffset - pinTop;
    window.scrollTo({ top, behavior: "smooth" });
  };

  items.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      scrollToCard(Number(item.dataset.glanceIndex));
    });
  });

  /**
   * Desktop: one clipped stage. Active slide comes up from the bottom.
   * The previous slide stays behind it and scales to 60%.
   */
  mm.add("(min-width: 1024px)", () => {
    const triggers = [];
    const stack = section.querySelector("[data-glance-stack]");
    const pinStart = () => `top top+=${getPinTopPx()}px`;

    if (!stack) return;

    const stage = document.createElement("div");
    stage.className = "ataglance-stage";
    stack.parentNode.insertBefore(stage, stack);
    cards.forEach((card) => stage.appendChild(card));

    cards.forEach((card, index) => {
      const wrapper = wrappers[index];
      const nextWrapper = wrappers[index + 1];
      const isLast = index === wrappers.length - 1;

      gsap.set(card, {
        zIndex: index + 1,
        scale: 1,
        yPercent: index === 0 ? 0 : 100,
        opacity: 1,
        force3D: true,
        transformOrigin: "50% 50%",
      });

      triggers.push(
        ScrollTrigger.create({
          trigger: wrapper,
          start: pinStart,
          end: isLast ? "bottom top" : () => `bottom top+=${getPinTopPx()}px`,
          onEnter: () => setItemState(index),
          onEnterBack: () => setItemState(index),
        })
      );

      if (reduceMotion) {
        gsap.set(card, { yPercent: 0, scale: 1 });
        return;
      }

      if (index > 0) {
        const enterTl = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: wrapper,
            start: "top bottom",
            end: pinStart,
            scrub: 1.15,
            invalidateOnRefresh: true,
          },
        });
        enterTl.fromTo(
          card,
          { yPercent: 100 },
          { yPercent: 0, immediateRender: true }
        );
        if (enterTl.scrollTrigger) triggers.push(enterTl.scrollTrigger);
      }

      if (!isLast && nextWrapper) {
        const exitTl = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: nextWrapper,
            start: pinStart,
            end: () =>
              `top+=${Math.max(nextWrapper.offsetHeight, 1)} top+=${getPinTopPx()}px`,
            scrub: 1.15,
            invalidateOnRefresh: true,
          },
        });
        exitTl.fromTo(
          card,
          { scale: 1 },
          { scale: 0.6, immediateRender: false }
        );
        if (exitTl.scrollTrigger) triggers.push(exitTl.scrollTrigger);
      }
    });

    const onRefreshInit = () => {
      getPinTopPx();
    };
    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    const onRefresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", onRefresh);
    requestAnimationFrame(onRefresh);

    return () => {
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      window.removeEventListener("load", onRefresh);
      section.style.removeProperty("--ataglance-pin-top");
      triggers.forEach((t) => t && t.kill());
      cards.forEach((card, index) => {
        gsap.set(card, { clearProps: "all" });
        wrappers[index].appendChild(card);
      });
      if (stage.parentNode) stage.remove();
    };
  });

  mm.add("(max-width: 1023px)", () => {
    const triggers = wrappers.map((wrapper, index) =>
      ScrollTrigger.create({
        trigger: wrapper,
        start: "top 65%",
        end: "bottom 40%",
        onEnter: () => setItemState(index),
        onEnterBack: () => setItemState(index),
      })
    );

    ScrollTrigger.refresh();
    return () => triggers.forEach((t) => t.kill());
  });

  setItemState(0);
})();
