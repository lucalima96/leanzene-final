// NAIL DEFENDER — DTC page scripts

// ── Countdown (all .countdown elements, starts at 10:00) ──────
(function () {
  var els = document.querySelectorAll(".countdown");
  if (!els.length) return;
  var remaining = 10 * 60; // 10 minutes

  function render() {
    var m = String(Math.floor(remaining / 60)).padStart(2, "0");
    var s = String(remaining % 60).padStart(2, "0");
    var str = m + ":" + s;
    els.forEach(function (el) {
      el.textContent = str;
      if (remaining <= 0) el.classList.add("expired");
    });
  }
  function tick() {
    render();
    if (remaining <= 0) return;
    remaining -= 1;
    setTimeout(tick, 1000);
  }
  tick();
})();

// ── Carry URL query params onto every checkout link ───────────
(function () {
  function combineParams(originalHref, currentParams) {
    var parts = (originalHref || "").split("?");
    var baseUrl = parts[0];
    var originalParams = new URLSearchParams(parts[1] || "");
    currentParams.forEach(function (value, key) {
      if (!originalParams.has(key)) originalParams.append(key, value);
    });
    var qs = originalParams.toString();
    return qs ? baseUrl + "?" + qs : baseUrl;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var currentParams = new URLSearchParams(window.location.search);
    document.querySelectorAll(".area-kits a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href && href !== "#") {
        a.setAttribute("href", combineParams(href, currentParams));
      }
    });
  });
})();
