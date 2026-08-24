/* ==========================================================
   HERO MEDIA SLIDER (image + video slides)
   - Each slide carries its own caption markup, so it just moves
     with the slide automatically — no JS text-swapping needed.
   - Controls (arrows + pagination) only show when there is
     more than one slide.
   - A video slide always plays to the end before the
     slider auto-advances to the next slide.
   - Slide changes use Swiper's built-in "creative" effect:
     the outgoing slide eases back and fades (parallax depth)
     while the incoming slide glides in from the right. The
     active slide's media also gets a slow continuous zoom/pan
     ("Ken Burns") for a smooth, alive parallax feel at rest.
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {
  var heroEl = document.querySelector(".hero-media-swiper");
  if (!heroEl || typeof Swiper === "undefined") return;

  var slides = heroEl.querySelectorAll(".hero-slide");
  var controls = document.querySelector(".hero-swiper-controls");
  var IMAGE_DELAY = 5000; // ms an image slide stays before advancing

  // Slow continuous zoom/pan on the active slide's media — restarted every
  // time a slide becomes active so the motion never looks static.
  function triggerZoom(slide) {
    heroEl.querySelectorAll(".hero-media").forEach(function (media) {
      media.classList.remove("is-zooming");
    });
    var media = slide && slide.querySelector(".hero-media");
    if (!media) return;
    void media.offsetWidth; // force reflow so the transition restarts cleanly
    media.classList.add("is-zooming");
  }

  // Only one slide: skip Swiper entirely, no controls, just loop the media.
  if (slides.length <= 1) {
    var soloVideo = heroEl.querySelector("video");
    if (soloVideo) {
      soloVideo.loop = true;
      soloVideo.play().catch(function () {});
    }
    // No Swiper instance means nothing adds "swiper-slide-active" — the
    // caption's CSS entrance animation is keyed off that class, so add it
    // by hand for the single-slide case.
    if (slides[0]) slides[0].classList.add("swiper-slide-active");
    triggerZoom(slides[0]);
    return;
  }

  var heroSwiper = new Swiper(heroEl, {
    loop: true,
    speed: 1100,
    effect: "creative",
    creativeEffect: {
      prev: { shadow: true, translate: ["-20%", 0, -300], opacity: 0.55 },
      next: { translate: ["100%", 0, 0] },
    },
    autoplay: { delay: IMAGE_DELAY, disableOnInteraction: false },
    pagination: { el: ".hero-swiper-pagination", clickable: true },
    navigation: { nextEl: ".hero-swiper-next", prevEl: ".hero-swiper-prev" },
  });

  if (controls) controls.classList.add("is-active");

  function syncActiveSlide() {
    var activeSlide = heroSwiper.slides[heroSwiper.activeIndex];
    triggerZoom(activeSlide);

    var activeVideo = activeSlide && activeSlide.querySelector("video");

    // Pause/rewind every video that isn't the active one.
    heroEl.querySelectorAll("video").forEach(function (video) {
      if (video !== activeVideo) {
        video.pause();
        video.currentTime = 0;
      }
    });

    if (!activeVideo) {
      heroSwiper.autoplay.start();
      return;
    }

    // Hold the timed autoplay until this video finishes playing.
    heroSwiper.autoplay.stop();
    activeVideo.currentTime = 0;

    var resume = function () {
      activeVideo.removeEventListener("ended", resume);
      heroSwiper.autoplay.start();
      heroSwiper.slideNext();
    };
    activeVideo.addEventListener("ended", resume);

    activeVideo.play().catch(function () {
      // Autoplay blocked (e.g. no user interaction yet) — fall back to timed autoplay.
      heroSwiper.autoplay.start();
    });
  }

  heroSwiper.on("slideChangeTransitionEnd", syncActiveSlide);
  syncActiveSlide();
});
