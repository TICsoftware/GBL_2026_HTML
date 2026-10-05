document.addEventListener("DOMContentLoaded", function () {
  var el = document.querySelector(".whyJoin-cards-outer");
  if (!el || typeof Swiper === "undefined") return;

  var swiper = null;
  var MOBILE_MAX = 767;

  function isMobileView() {
    return window.innerWidth <= MOBILE_MAX;
  }

  function enableSlider() {
    if (swiper) return;
    swiper = new Swiper(el, {
      slidesPerView: 1,
      spaceBetween: 16,
      watchOverflow: true,
      pagination: {
        el: ".whyJoin-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".whyJoin-nav--next",
        prevEl: ".whyJoin-nav--prev",
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
