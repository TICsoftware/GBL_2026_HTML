document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const MQ = window.matchMedia("(max-width: 1199px)");
  const isMobile = () => MQ.matches;
  const isHome = header.dataset.theme === "home";

  const backdrop = header.querySelector("[data-header-backdrop]");
  const toggleBtn = header.querySelector("[data-nav-toggle]");
  const searchPanel = header.querySelector("#headerSearch");
  const searchToggle = header.querySelector("[data-search-toggle]");
  const searchInput = header.querySelector("#headerSearchInput");
  const triggers = Array.from(header.querySelectorAll("[data-mega-trigger]"));
  const menus = Array.from(header.querySelectorAll(".mega-menu"));

  let openTimer = 0;
  let closeTimer = 0;
  let closeAnimTimer = 0;
  let activeMenu = null;
  const navWrap = header.querySelector(".site-header__nav-wrap");

  const getScrollY = () => {
    if (window.lenis && typeof window.lenis.scroll === "number") {
      return window.lenis.scroll;
    }
    return window.scrollY || document.documentElement.scrollTop || 0;
  };

  const getScrollbarWidth = () => {
    return Math.max(0, window.innerWidth - document.documentElement.clientWidth);
  };

  const lockPage = (lock) => {
    const root = document.documentElement;
    const body = document.body;
    const already = root.classList.contains("is-header-locked");

    if (lock) {
      if (!already) {
        const gap = getScrollbarWidth();
        root.style.setProperty("--header-scrollbar-w", gap + "px");
        root.classList.add("is-header-locked");
        body.style.overflow = "hidden";
        body.style.paddingRight = gap + "px";
        header.style.paddingRight = gap + "px";
      }
      if (window.lenis && typeof window.lenis.stop === "function") window.lenis.stop();
      return;
    }

    root.classList.remove("is-header-locked");
    root.style.removeProperty("--header-scrollbar-w");
    body.style.overflow = "";
    body.style.paddingRight = "";
    header.style.paddingRight = "";
    if (window.lenis && typeof window.lenis.start === "function") window.lenis.start();
  };

  const setExpanded = (trigger, expanded) => {
    if (trigger) trigger.setAttribute("aria-expanded", expanded ? "true" : "false");
  };

  const positionCaret = (trigger, instant) => {
    if (!trigger || !navWrap || isMobile()) return;
    const wrapRect = navWrap.getBoundingClientRect();
    const trigRect = trigger.getBoundingClientRect();
    const left = trigRect.left + trigRect.width / 2 - wrapRect.left;
    const pad = 16;
    const clamped = Math.min(wrapRect.width - pad, Math.max(pad, left));
    if (instant) navWrap.classList.add("is-caret-instant");
    navWrap.style.setProperty("--mega-caret-left", clamped + "px");
    if (instant) {
      requestAnimationFrame(() => navWrap.classList.remove("is-caret-instant"));
    }
  };

  const closeAllL2 = (menu) => {
    menu.querySelectorAll("[data-l2]").forEach((el) => el.classList.remove("is-active"));
    menu.querySelectorAll(".mega-l3-panel").forEach((panel) => {
      panel.classList.remove("is-active");
      panel.hidden = true;
    });
  };

  const closeAllL4 = (scope, instant) => {
    const root = scope || header;
    root.querySelectorAll("[data-l3][data-l4]").forEach((el) => {
      el.classList.remove("is-active");
      el.setAttribute("aria-expanded", "false");
    });
    root.querySelectorAll(".mega-l4-card").forEach((card) => {
      card.classList.remove("is-active");
      if (instant) {
        card.hidden = true;
        return;
      }
      const finish = (event) => {
        if (event && event.target !== card) return;
        if (!card.classList.contains("is-active")) card.hidden = true;
        card.removeEventListener("transitionend", finish);
      };
      card.addEventListener("transitionend", finish);
      window.setTimeout(finish, 360);
    });
  };

  const activateL2 = (item) => {
    const menu = item.closest(".mega-menu");
    if (!menu) return;
    closeAllL2(menu);
    closeAllL4(menu, true);
    item.classList.add("is-active");
    const id = item.getAttribute("data-panel");
    if (!id) return;
    const panel = menu.querySelector('.mega-l3-panel[data-panel="' + id + '"]');
    if (!panel) return;
    panel.hidden = false;
    panel.classList.add("is-active");
  };

  const toggleL4 = (item) => {
    const menu = item.closest(".mega-menu");
    if (!menu) return;
    const already = item.classList.contains("is-active");
    closeAllL4(menu);
    if (already) return;
    item.classList.add("is-active");
    item.setAttribute("aria-expanded", "true");
    const id = item.getAttribute("data-l4");
    if (!id) return;
    const card = menu.querySelector('.mega-l4-card[data-l4="' + id + '"]');
    if (!card) return;
    card.hidden = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => card.classList.add("is-active"));
    });
  };

  const activateFirstL2 = (menu) => {
    const first = menu.querySelector("[data-l2]");
    if (first) activateL2(first);
  };

  const closeMega = () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    clearTimeout(closeAnimTimer);
    triggers.forEach((trigger) => {
      setExpanded(trigger, false);
      trigger.closest("[data-nav-item]")?.classList.remove("is-open");
    });
    header.classList.remove("is-mega-open", "is-mega-switching");
    activeMenu = null;
    closeAllL4(header, true);

    const hideMenus = () => {
      menus.forEach((menu) => {
        menu.hidden = true;
      });
    };

    if (isMobile()) {
      hideMenus();
    } else {
      closeAnimTimer = window.setTimeout(hideMenus, 300);
    }

    if (!header.classList.contains("is-nav-open") && !header.classList.contains("is-search-open")) {
      lockPage(false);
    }
  };

  const openMega = (trigger) => {
    const key = trigger.getAttribute("data-mega-trigger");
    const menu = header.querySelector('.mega-menu[data-mega="' + key + '"]');
    if (!menu) return;

    clearTimeout(closeAnimTimer);
    const switching = !!(activeMenu && activeMenu !== menu);
    header.classList.toggle("is-mega-switching", switching && !isMobile());
    if (activeMenu !== menu) activateFirstL2(menu);

    menus.forEach((item) => {
      item.hidden = item !== menu;
    });
    triggers.forEach((item) => {
      const on = item === trigger;
      setExpanded(item, on);
      item.closest("[data-nav-item]")?.classList.toggle("is-open", on);
    });

    menu.hidden = false;
    header.classList.add("is-mega-open");
    activeMenu = menu;
    if (!isMobile()) lockPage(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => positionCaret(trigger, !switching));
    });
  };

  const closeMobileNav = () => {
    header.classList.remove("is-nav-open");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Open menu");
    }
    closeMega();
    lockPage(header.classList.contains("is-search-open"));
  };

  const openMobileNav = () => {
    closeSearch();
    header.classList.add("is-nav-open");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.setAttribute("aria-label", "Close menu");
    }
    lockPage(true);
  };

  const closeSearch = () => {
    if (!searchPanel) return;
    header.classList.remove("is-search-open");
    if (searchToggle) searchToggle.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      if (!header.classList.contains("is-search-open")) searchPanel.hidden = true;
    }, 320);
    if (!header.classList.contains("is-nav-open") && !header.classList.contains("is-mega-open")) {
      lockPage(false);
    }
    updateTheme();
  };

  const openSearch = () => {
    if (!searchPanel) return;
    if (isMobile()) closeMobileNav();
    closeMega();
    searchPanel.hidden = false;
    header.classList.add("is-search-open");
    if (searchToggle) searchToggle.setAttribute("aria-expanded", "true");
    lockPage(true);
    updateTheme();
    window.setTimeout(() => searchInput && searchInput.focus(), 80);
  };

  const updateTheme = () => {
    if (!isHome) return;
    if (header.classList.contains("is-nav-open") || header.classList.contains("is-search-open")) {
      header.classList.add("is-light");
      header.classList.remove("is-dark");
      return;
    }
    const scrolled = getScrollY() > 24;
    header.classList.toggle("is-light", scrolled);
    header.classList.toggle("is-dark", !scrolled);
  };

  triggers.forEach((trigger) => {
    const item = trigger.closest("[data-nav-item]");

    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      if (isMobile()) {
        const already = item.classList.contains("is-open");
        closeMega();
        if (!already) openMega(trigger);
        return;
      }
      if (activeMenu && !activeMenu.hidden && item.classList.contains("is-open")) {
        closeMega();
        return;
      }
      openMega(trigger);
    });

    item.addEventListener("mouseenter", () => {
      if (isMobile()) return;
      clearTimeout(closeTimer);
      clearTimeout(openTimer);
      const delay = header.classList.contains("is-mega-open") ? 0 : 80;
      openTimer = window.setTimeout(() => openMega(trigger), delay);
    });

    item.addEventListener("mouseleave", () => {
      if (isMobile()) return;
      clearTimeout(openTimer);
      closeTimer = window.setTimeout(closeMega, 220);
    });
  });

  menus.forEach((menu) => {
    menu.addEventListener("mouseenter", () => {
      if (isMobile()) return;
      clearTimeout(closeTimer);
    });
    menu.addEventListener("mouseleave", () => {
      if (isMobile()) return;
      closeTimer = window.setTimeout(closeMega, 220);
    });

    menu.querySelectorAll("[data-l2]").forEach((item) => {
      item.addEventListener("mouseenter", () => {
        if (!isMobile()) activateL2(item);
      });
      item.addEventListener("click", (event) => {
        if (item.getAttribute("href") === "#") event.preventDefault();
        if (item.hasAttribute("data-panel")) {
          event.preventDefault();
          activateL2(item);
        }
      });
    });

    menu.querySelectorAll("[data-l3]").forEach((item) => {
      item.addEventListener("click", (event) => {
        if (item.hasAttribute("data-l4")) {
          event.preventDefault();
          toggleL4(item);
          return;
        }
        if (item.getAttribute("href") === "#") event.preventDefault();
      });
    });
  });

  header.querySelectorAll("[data-mega-close]").forEach((btn) => {
    btn.addEventListener("click", closeMega);
  });

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      if (header.classList.contains("is-nav-open")) closeMobileNav();
      else openMobileNav();
      updateTheme();
    });
  }

  if (searchToggle) {
    searchToggle.addEventListener("click", () => {
      if (header.classList.contains("is-search-open")) closeSearch();
      else openSearch();
    });
  }

  header.querySelector("[data-search-close]")?.addEventListener("click", closeSearch);

  header.querySelector(".site-header__search-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = (searchInput && searchInput.value || "").trim();
    if (!q) {
      searchInput && searchInput.focus();
      return;
    }
    window.location.href = "/search/" + encodeURIComponent(q);
  });

  backdrop?.addEventListener("click", () => {
    closeSearch();
    closeMega();
    if (isMobile()) closeMobileNav();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeSearch();
    closeMega();
    if (isMobile()) closeMobileNav();
    updateTheme();
  });

  header.addEventListener("click", (event) => {
    const link = event.target.closest('a[href="#"]');
    if (link && header.contains(link) && !link.hasAttribute("data-mega-trigger")) {
      if (!link.hasAttribute("data-l2") && !link.hasAttribute("data-l3") && !link.hasAttribute("data-l4")) {
        event.preventDefault();
      }
    }
  });

  window.addEventListener("resize", () => {
    if (!isMobile()) {
      header.classList.remove("is-nav-open");
      if (toggleBtn) {
        toggleBtn.setAttribute("aria-expanded", "false");
        toggleBtn.setAttribute("aria-label", "Open menu");
      }
    }
    if (activeMenu && !activeMenu.hidden) {
      const trigger = header.querySelector('[data-mega-trigger][aria-expanded="true"]');
      positionCaret(trigger, true);
    }
    updateTheme();
  });

  window.addEventListener("scroll", updateTheme, { passive: true });
  if (window.lenis && typeof window.lenis.on === "function") {
    window.lenis.on("scroll", updateTheme);
  }
  menus.forEach(activateFirstL2);
  updateTheme();
});
