/* YMK SOL — interactions, zéro dépendance */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- année footer ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- toggle mode clair / sombre ---- */
  var root   = document.documentElement;
  var toggle = document.getElementById("themeToggle");
  var PREF   = "ymk-theme";

  var saved = localStorage.getItem(PREF) ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  root.setAttribute("data-theme", saved);

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem(PREF, next);
    });
  }

  /* ---- menu (toutes tailles) ---- */
  var burger   = document.querySelector(".burger");
  var mmenu    = document.getElementById("mmenu");
  var backdrop = document.getElementById("mmenuBackdrop");
  if (burger && mmenu) {
    var menuToggle = function (open) {
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      mmenu.hidden = !open;
      if (backdrop) backdrop.hidden = !open;
      document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", function () {
      menuToggle(burger.getAttribute("aria-expanded") !== "true");
    });
    mmenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) menuToggle(false);
    });
    if (backdrop) backdrop.addEventListener("click", function () { menuToggle(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") menuToggle(false);
    });
  }

  /* ---- barre de progression scroll ---- */
  var bar = document.getElementById("scrollBar");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100) + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---- reveal au scroll ---- */
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- compteurs animés ---- */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el  = e.target;
        var end = +el.getAttribute("data-count");
        var suf = el.getAttribute("data-suffix") || "";
        var t0  = null;
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
    counters.forEach(function (c) {
      c.textContent = c.getAttribute("data-count") + (c.getAttribute("data-suffix") || "");
    });
  }

  /* ---- lightbox galerie ---- */
  var lb    = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");

  function openLb(src, cap) {
    if (!lb) return;
    lbImg.src = src;
    lbImg.alt = cap || "";
    lbCap.textContent = cap || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    if (!lb) return;
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gal-item").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (a.classList.contains("img-missing")) return;
      var img = a.querySelector("img");
      if (img && img.classList.contains("img-missing")) return;
      e.preventDefault();
      openLb(a.getAttribute("href"), a.getAttribute("data-cap"));
    });
  });

  if (lb) {
    lb.addEventListener("click", function (e) {
      if (e.target === lb || e.target.closest(".lb-close")) closeLb();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLb();
    });
  }
})();
