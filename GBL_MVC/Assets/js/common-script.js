
document.addEventListener("DOMContentLoaded", function() {

// --------------------------------------------
// DARK MODE
// --------------------------------------------
 const html = document.documentElement;

// apply saved or system theme FIRST
const savedTheme = localStorage.getItem("theme");
if (
  savedTheme === "dark" ||
  (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  html.classList.add("dark");
}

// toggle button (icons optional)
const toggle = document.getElementById("themeToggle");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");

function syncIcons() {
  if (!sunIcon || !moonIcon) return;
  const isDark = html.classList.contains("dark");
  sunIcon.classList.toggle("is-active", !isDark);
  moonIcon.classList.toggle("is-active", isDark);
}

syncIcons();

if (toggle) {
  toggle.addEventListener("click", () => {
    const isDark = html.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    syncIcons();
  });
}  


// --------------------------------------------
// GSAP + ScrollTrigger + Lenis Setup
// --------------------------------------------
gsap.registerPlugin(ScrollTrigger);

const isMobile = window.matchMedia("(max-width: 992px)").matches;

let lenis;

if (!isMobile) {

  lenis = new Lenis({
    smooth: true,
    smoothWheel: true,
    smoothTouch: false,

    // 🔥 BEST SMOOTH SETTINGS
    lerp: 0.08,          // smoother (increase = softer)
    wheelMultiplier: 1,
    normalizeWheel: true,

    // prevent scroll inside element
    prevent: (node) => {
      return node.closest('.testimonial-content');
    }
  });

  // ✅ GSAP TICKER (BETTER THAN RAF)
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  // ---- GSAP SCROLLER PROXY ----
  ScrollTrigger.scrollerProxy(document.documentElement, {
    scrollTop(value) {
      return arguments.length
        ? lenis.scrollTo(value, { immediate: true })
        : lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight
      };
    }
  });

  lenis.on("scroll", ScrollTrigger.update);

  ScrollTrigger.addEventListener("refresh", () => lenis.resize());
  ScrollTrigger.refresh();

  window.lenis = lenis;

} else {
  document.body.classList.add("native-scroll");
}


// --------------------------------------------
// Back to top button
// --------------------------------------------

const $btn = $('.back-to-top');
const circle = document.querySelector('.progress-ring-circle');

// SVG settings
const radius = 45;   // Matches r="45"
const circumference = 2 * Math.PI * radius;

circle.style.strokeDasharray = `${circumference}`;
circle.style.strokeDashoffset = circumference;

const THRESHOLD = 600;

// Scroll position helper (supports Lenis)
const getScrollTop = () =>
  window?.lenis?.scroll ??
  window.scrollY ??
  document.documentElement.scrollTop;

// Document scroll percent
function getScrollPercent() {
  const scrollTop = getScrollTop();
  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  return scrollTop / docHeight;
}

// Update circle + button visibility
function updateScrollUI() {
  const percent = getScrollPercent();
  const offset = circumference - percent * circumference;

  circle.style.strokeDashoffset = offset;

  if (getScrollTop() > THRESHOLD) {
    $btn.addClass('active');
  } else {
    $btn.removeClass('active');
  }
}

// Run immediately
updateScrollUI();

// Use Lenis events if available
if (window?.lenis?.on) {
  window.lenis.on('scroll', updateScrollUI);
} else {
  window.addEventListener('scroll', updateScrollUI);
}

// Mobile fix → update progress when viewport height changes
window.addEventListener("resize", updateScrollUI);

// Click → scroll to top
$btn.on('click', (e) => {
  e.preventDefault();

  if (window?.lenis?.scrollTo) {
    window.lenis.scrollTo(0, { duration: 1, lerp: 0.08 });
  } else {
    $('html, body').animate({ scrollTop: 0 }, 500);
  }
});


 

// --------------------------------------------
// FOOTER YEAR
// --------------------------------------------
    document.getElementById("year-foot").innerHTML = (new Date().getFullYear());


// --------------------------------------------
// HEADER SCRIPT
// --------------------------------------------
// ── MOBILE DRAWER ──
(function () {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const drawer       = document.getElementById('mobileDrawer');
  const overlay      = document.getElementById('mobileOverlay');
  const closeBtn     = document.getElementById('drawerClose');
  const mobileList   = document.getElementById('mobileNavList');
  const mobileCtaGrp = document.getElementById('mobileCtaGroup');

  if (!hamburgerBtn || !drawer) return;

  let built = false;

  // ── BUILD NAV — runs only once, on first open ──
  function buildMobileNav() {
    if (built) return;
    built = true;

    // Build nav links
    document.querySelectorAll('#desktopNav > div').forEach(item => {
      const li       = document.createElement('li');
      const anchor   = item.querySelector('a');
      const dropdown = item.querySelector('.nav-dropdown');

      if (dropdown) {
        li.classList.add('mobile-accordion');

        const btn = document.createElement('button');
        btn.className = 'mobile-accordion-btn';
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = `
          ${anchor.textContent.trim()}
          <svg class="accordion-arrow" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        `;

        const panel = document.createElement('ul');
        panel.className = 'mobile-accordion-panel';

        dropdown.querySelectorAll('a').forEach(dLink => {
          const pLi = document.createElement('li');
          const pA  = document.createElement('a');
          pA.href        = dLink.getAttribute('href');
          pA.textContent = dLink.textContent.trim();
          pLi.appendChild(pA);
          panel.appendChild(pLi);
        });

        li.appendChild(btn);
        li.appendChild(panel);

      } else {
        const a = document.createElement('a');
        a.href        = anchor.getAttribute('href');
        a.textContent = anchor.textContent.trim();
        li.appendChild(a);
      }

      mobileList.appendChild(li);
    });

    // Build CTA buttons
    document.querySelectorAll('#desktopCta > a.themeht-btn').forEach(btn => {
      const a = document.createElement('a');
      a.href        = btn.getAttribute('href');
      a.className   = btn.className + ' mobile-cta-btn';
      a.textContent = btn.textContent.trim();
      mobileCtaGrp.appendChild(a);
    });

    // Accordion listener
    mobileList.addEventListener('click', e => {
      const accBtn = e.target.closest('.mobile-accordion-btn');
      if (!accBtn) return;

      const panel  = accBtn.nextElementSibling;
      const isOpen = accBtn.getAttribute('aria-expanded') === 'true';

      mobileList.querySelectorAll('.mobile-accordion-btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling?.classList.remove('is-open');
      });

      if (!isOpen) {
        accBtn.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
      }
    });
  }

  // ── DESTROY — wipes drawer content when switching to desktop ──
  function destroyMobileNav() {
    if (!built) return;
    mobileList.innerHTML   = '';
    mobileCtaGrp.innerHTML = '';
    built = false;
  }

  // ── OPEN / CLOSE ──
  function openDrawer() {
    buildMobileNav(); // build only now, not on page load
    overlay.style.display = 'block';
    overlay.getBoundingClientRect();
    drawer.classList.add('is-open');
    overlay.classList.add('is-visible');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
  }

  function closeDrawer() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
    setTimeout(() => { overlay.style.display = 'none'; }, 420);
  }

  hamburgerBtn.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });

  // ── RESIZE: destroy mobile nodes when switching to desktop ──
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      if (drawer.classList.contains('is-open')) closeDrawer();
      destroyMobileNav(); // wipe DOM nodes — desktop is clean
    }
  });

})();


// ── DESKTOP DROPDOWN (unchanged) ──
const isDesktop = window.matchMedia("(min-width: 1024px)");

if (isDesktop.matches) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    let timeout;
    const openMenu = () => {
      clearTimeout(timeout);
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    };
    const closeMenu = () => {
      timeout = setTimeout(() => item.classList.remove('active'), 200);
    };
    item.addEventListener('mouseenter', openMenu);
    item.addEventListener('mouseleave', closeMenu);
    const dropdown = item.querySelector('.nav-dropdown');
    if (dropdown) {
      dropdown.addEventListener('mouseenter', openMenu);
      dropdown.addEventListener('mouseleave', closeMenu);
    }
  });
}

const header = document.getElementById("mainHeader");
const hamburger = document.getElementById("scrollHamburgerDesktop");
const bottomNav = document.querySelector(".header-bottom-nav");

function isHeaderDesktop() {
  return window.innerWidth >= 1024;
}

/* ===============================
   SCROLL
=============================== */
window.addEventListener("scroll", () => {

  if (!isHeaderDesktop()) return;

  if (window.scrollY > 80) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
    header.classList.remove("show-menu");
  }

});

/* ===============================
   HOVER (NO FLICKER)
=============================== */
let hoverTimeout;

if (hamburger && bottomNav) {

  hamburger.addEventListener("mouseenter", () => {
    if (!isHeaderDesktop()) return;

    clearTimeout(hoverTimeout);
    header.classList.add("show-menu");
  });

  bottomNav.addEventListener("mouseenter", () => {
    clearTimeout(hoverTimeout);
  });

  bottomNav.addEventListener("mouseleave", () => {
    hoverTimeout = setTimeout(() => {
      header.classList.remove("show-menu");
    }, 150);
  });

}


// --------------------------------------------
// CURSER DOT
// --------------------------------------------
 // Disable custom cursor on mobile
if (window.innerWidth <= 992) {
    // console.log("Custom cursor disabled on mobile");
    return;
}

const dot = document.getElementById("cursor-dot");
const ring = document.getElementById("cursor-ring");

let mouseX = -100, mouseY = -100;
let ringX = -100, ringY = -100;
const ease = 0.15;

// Move dot
document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});

// Smooth ring follow
function animate() {
    ringX += (mouseX - ringX) * ease;
    ringY += (mouseY - ringY) * ease;

    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;

    requestAnimationFrame(animate);
}
animate();

// Hover effect — EXACT MexDot behavior
const hoverEls = document.querySelectorAll(
    "a, button, input, textarea, [role='button'], .hover-cursor, .data-trigger"
);

hoverEls.forEach(el => {
    el.addEventListener("mouseenter", () => {
        ring.classList.add("active-hover");
        dot.classList.add("active-hover");
    });
    el.addEventListener("mouseleave", () => {
        ring.classList.remove("active-hover");
        dot.classList.remove("active-hover");
    });
});

// Click effect
document.addEventListener("mousedown", () => ring.classList.add("active-click"));
document.addEventListener("mouseup", () => ring.classList.remove("active-click"));




// --------------------------------------------
// BUTTON ANIMATION
// --------------------------------------------


// --------------------------------------------
// FOOTER Hexagon ANIMATION
// --------------------------------------------

const hexagons = document.querySelectorAll('.footer-root .hexagon');

let floatAnims = [];

// 🔥 ENTRY + SCROLL TRIGGER
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".footer-root",
    start: "top 25%",
    toggleActions: "play none none reset",
    onLeaveBack: resetHexagons
  }
});

// Initial state
gsap.set(hexagons, {
  opacity: 0,
  scale: 0.6,
  y: 60
});

// ENTRY animation
tl.to(hexagons, {
  opacity: 0.2,
  scale: 1,
  y: 0,
  duration: 1,
  stagger: 0.15,
  ease: "power3.out",
  onComplete: startContinuousAnimation
});


// 🔥 CONTINUOUS PREMIUM ANIMATION (FIXED)
function startContinuousAnimation() {

  // kill old animations
  floatAnims.forEach(anim => anim.kill());
  floatAnims = [];

  hexagons.forEach((hex, i) => {

    // set transform origin once
    gsap.set(hex, {
      transformOrigin: "50% 60%"
    });

    // ✅ ONE timeline (no overlapping issue)
    const tl = gsap.timeline({
      repeat: -1,
      yoyo: true,
      delay: i * 0.2
    });

    tl.to(hex, {
      y: 15,                         // vertical float
      x: 8,                          // horizontal drift
      rotation: i % 2 === 0 ? 2 : -2,// subtle tilt
      scale: 1.04,                   // breathing effect
      duration: 4 + i * 0.3,
      ease: "sine.inOut"
    });

    floatAnims.push(tl);
  });
}


// 🔄 RESET when scrolling above
function resetHexagons() {
  floatAnims.forEach(anim => anim.kill());
  floatAnims = [];

  gsap.set(hexagons, {
    opacity: 0,
    scale: 0.6,
    x: 0,
    y: 60,
    rotation: 0
  });
}


// initial state (important for smooth animation)
gsap.set(".cta-title", { y: 50, opacity: 0 });
gsap.set(".cta-buttons a", { y: 40, opacity: 0 });
gsap.set(".cta-image", { y: 80, opacity: 0, scale: 0.9 });
gsap.set(".cta-logo", {filter: "blur(6px)", opacity: 0.8, scale: 0.9});

const ctaTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".footer-root", // 🔥 your main trigger
    start: "top 75%",
    toggleActions: "play none none reset"
  }
});

// animation sequence
ctaTl
  .to(".cta-title", {
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: "power3.out"
  })
  .to(".cta-buttons a", {
    y: 0,
    opacity: 1,
    duration: 0.6,
    stagger: 0.15,
    ease: "power3.out"
  }, "-=0.4")
  .to(".cta-image", {
    y: 0,
    opacity: 1,
    scale: 1,
    duration: 0.8,
    ease: "power3.out"
  }, "-=0.6")
  .to(".cta-logo", {
  filter: "blur(0px)",
  opacity: 1,
  duration: 0.6,
   scale: 1,
  ease: "power2.out"
}, "<");


// --------------------------------------------
// ANIMATION HEADER - HEXAGON
// --------------------------------------------
document.querySelectorAll(".title-heading-outer").forEach(title => {

  ScrollTrigger.create({
    trigger: title,            // 👈 trigger itself (important)
    start: "top 85%",          // adjust visibility timing
    toggleClass: {
      targets: title,
      className: "heading-active"
    },
    toggleActions: "play none none reverse"
  });

});


// --------------------------------------------
// ANIMATION HEADER - TEST
// --------------------------------------------

// Wrap text into spans (SAFE VERSION)
function wrapText(node) {

  // TEXT NODE
if (node.nodeType === 3) {
  const frag = document.createDocumentFragment();

  const parts = node.textContent.match(/\S+|\s+/g);

  parts.forEach(part => {

    // If it's just space → keep as is
    if (part.trim() === "") {
      frag.appendChild(document.createTextNode(part));
    } else {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";

      part.split("").forEach(char => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        wordSpan.appendChild(span);
      });

      frag.appendChild(wordSpan);
    }

  });

  return frag;
}

  // ELEMENT NODE (like <span>)
  if (node.nodeType === 1) {
    const el = node.cloneNode(false);

    node.childNodes.forEach(child => {
      el.appendChild(wrapText(child));
    });

    return el;
  }

  return document.createTextNode("");
}

// Main animation function
function titleAnimationNoSplit() {

  const titles = document.querySelectorAll(".title-heading-anim");

  if (!titles.length) return;

  titles.forEach(title => {

    // Prevent re-run
    if (title.classList.contains("split-done")) return;

    const frag = document.createDocumentFragment();

    title.childNodes.forEach(node => {
      frag.appendChild(wrapText(node));
    });

    title.innerHTML = "";
    title.appendChild(frag);
    title.classList.add("split-done");

    const chars = title.querySelectorAll(".char");

    // Initial state (RIGHT → LEFT)
  


    gsap.set(chars, {
  opacity: 0,
  x: 100,
  rotateY: 50,
  filter: "blur(6px)"
});

gsap.to(chars, {
  scrollTrigger: {
    trigger: title,
    start: "top 85%",
     toggleActions: "play none none reverse"
  },
  x: 0,
  rotateY: 0,
  opacity: 1,
  filter: "blur(0px)",
  duration: 0.6,
  ease: "power3.out",
  stagger: 0.025
});

  });
}

// Init on load
document.addEventListener("DOMContentLoaded", () => {
  titleAnimationNoSplit();
});

// Re-run on ScrollTrigger refresh (important)
ScrollTrigger.addEventListener("refresh", titleAnimationNoSplit);







  });


document.addEventListener("DOMContentLoaded", function () {

  const track = document.getElementById('hero-track');
  const loader = document.getElementById('loader');

  if (!track || !loader) return;

  // =========================
  // 🧠 NETWORK DETECTION
  // =========================
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  const isSlowNetwork = connection &&
    (connection.effectiveType === '2g' || connection.effectiveType === '3g');

  // =========================
  // 🧠 PERFORMANCE CHECK (CACHE / RELOAD)
  // =========================
  const navEntry = performance.getEntriesByType("navigation")[0];

  const isReload = navEntry && navEntry.type === "reload";

  // =========================
  // 🎯 DECISION
  // =========================
  const shouldSkipLoader = !isSlowNetwork && isReload;

  if (shouldSkipLoader) {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    loader.style.pointerEvents = 'none';

    setTimeout(() => loader.remove(), 200);
    return;
  }

  // =========================
  // 👉 BUILD MARQUEE
  // =========================
  requestAnimationFrame(() => {

    const baseWidth = track.offsetWidth;
    const targetWidth = window.innerWidth * 2;
    const repeatCount = Math.min(20, Math.ceil(targetWidth / baseWidth));

    for (let i = 0; i < repeatCount; i++) {
      const text = track.querySelector('.hero-text')?.cloneNode(true);
      const sep  = track.querySelector('.hero-sep')?.cloneNode(true);

      if (!text || !sep) break;

      track.appendChild(text);
      track.appendChild(sep);
    }

    if (!track.parentElement.querySelector('.hero-track-clone')) {
      const clone = track.cloneNode(true);
      clone.classList.add('hero-track-clone');
      clone.setAttribute('aria-hidden', 'true');
      track.parentElement.appendChild(clone);

      const speed = Math.max(5, track.offsetWidth / window.innerWidth * 5);

      track.style.animationDuration = `${speed}s`;
      clone.style.animationDuration = `${speed}s`;
    }

  });

  // =========================
  // 👉 ENTRY ANIMATION
  // =========================
  gsap.from('.hero-marquee', {
    opacity: 0,
    scale: 0.96,
    duration: 0.6,
    ease: 'power3.out'
  });

  // =========================
  // 👉 EXIT LOADER
  // =========================
  let exited = false;

  function exitLoader() {
    if (exited) return;
    exited = true;

    const tl = gsap.timeline();

    gsap.killTweensOf(loader.querySelectorAll('*'));

    if (window.logoGlowInterval) {
      clearInterval(window.logoGlowInterval);
    }

    gsap.set('.loader-cta-logo', {
      clearProps: "all",
      scale: 1,
      y: 0,
      opacity: 1
    });

    tl.to('.loader-cta-logo', {
        scale: 2,
        y: -80,
        opacity: 0,
        duration: 1,
        ease: 'power3.inOut'
      })
      .to('.hero-marquee', {
        opacity: 0,
        y: -40,
        duration: 0.5,
        ease: 'power3.in'
      }, "<0.2")
      .to(loader, {
        y: -(window.innerHeight + 100),
        duration: 1.1,
        ease: 'expo.inOut',
        onComplete: () => loader.remove()
      }, "<0.3");
  }

  // =========================
  // ⏱ EXIT TIMING (SMART)
  // =========================
  const exitDelay = isSlowNetwork ? 2000 : 1000;

  setTimeout(exitLoader, exitDelay);

  // =========================
  // 🚨 FAILSAFE
  // =========================
  setTimeout(() => {
    if (document.body.contains(loader)) {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => loader.remove()
      });
    }
  }, 4000);

});