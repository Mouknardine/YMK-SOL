/* YMK SOL — interactions légères, zéro dépendance */
(function () {
  "use strict";

  /* année du footer */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* menu mobile */
  var burger = document.querySelector(".burger");
  var menu = document.getElementById("mobile-menu");
  if (burger && menu) {
    var toggle = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    };
    burger.addEventListener("click", function () {
      toggle(burger.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) toggle(false);
    });
  }

  /* apparition au scroll */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          // léger décalage en cascade pour les groupes de cartes
          var delay = entry.target.closest(".cards, .contact-grid, .steps, .hero-inner") ? (i % 6) * 70 : 0;
          setTimeout(function () { entry.target.classList.add("is-in"); }, delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-in"); });
  }
})();
