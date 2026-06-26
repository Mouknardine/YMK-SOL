/* YMK SOL — interactions, zéro dépendance */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* menu mobile */
  var burger = document.querySelector(".burger");
  var mmenu = document.getElementById("mmenu");
  if (burger && mmenu) {
    var toggle = function (open) { burger.setAttribute("aria-expanded", String(open)); mmenu.hidden = !open; };
    burger.addEventListener("click", function () { toggle(burger.getAttribute("aria-expanded") !== "true"); });
    mmenu.addEventListener("click", function (e) { if (e.target.closest("a")) toggle(false); });
  }

  /* barre de progression */
  var bar = document.getElementById("scrollBar");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* reveal au scroll */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* compteurs */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, end = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "", t0 = null;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var k = Math.min((ts - t0) / 1400, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suf;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.getAttribute("data-count") + (c.getAttribute("data-suffix") || ""); });
  }

  /* lightbox galerie */
  var lb = document.getElementById("lb"),
      lbImg = document.getElementById("lbImg"),
      lbCap = document.getElementById("lbCap");
  function openLb(src, cap) {
    if (!lb) return;
    lbImg.src = src; lbImg.alt = cap || ""; lbCap.textContent = cap || "";
    lb.hidden = false; document.body.style.overflow = "hidden";
  }
  function closeLb() { if (lb) { lb.hidden = true; lbImg.src = ""; document.body.style.overflow = ""; } }
  document.querySelectorAll(".gal-item").forEach(function (a) {
    a.addEventListener("click", function (e) {
      // si l'image est absente (placeholder), ne pas ouvrir la lightbox
      if (a.classList.contains("img-missing")) return;
      e.preventDefault();
      openLb(a.getAttribute("href"), a.getAttribute("data-cap"));
    });
  });
  if (lb) {
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest(".lb-close")) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }
})();
