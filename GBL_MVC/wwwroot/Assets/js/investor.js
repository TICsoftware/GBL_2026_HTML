/**
 * Investor relations — mark the share quote up or down from its change text.
 */
(function () {
  function init() {
    var quote = document.querySelector("[data-inv-quote]");
    if (!quote) return;

    var change = quote.querySelector("[data-inv-change]");
    var value = change ? change.textContent.replace(/^\s+/, "") : "";
    quote.classList.toggle("is-down", value.charAt(0) === "-");
    quote.classList.toggle("is-up", value.charAt(0) === "+");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
