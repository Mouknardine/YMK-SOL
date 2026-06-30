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

  /* L'inline script dans <head> a déjà appliqué le bon thème (localStorage → préf OS → dark).
     On vérifie juste qu'un thème est bien présent (si le script était désactivé). */
  if (!root.getAttribute("data-theme")) {
    root.setAttribute("data-theme",
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }

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

  /* ---- barre de progression scroll + hdr-scrolled ---- */
  var bar = document.getElementById("scrollBar");
  var hdr = document.querySelector(".hdr");
  if (bar || hdr) {
    var onScroll = function () {
      var h = document.documentElement;
      if (bar) bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100) + "%";
      if (hdr) hdr.classList.toggle("hdr-scrolled", h.scrollTop > 40);
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

  /* ---- enable :active CSS states on iOS Safari ---- */
  document.addEventListener("touchstart", function () {}, { passive: true });

  /* ---- step cards actives au scroll (mobile seulement) ---- */
  var stepCards = document.querySelectorAll(".steps li");
  if (stepCards.length && !reduce) {
    function markStep(li) {
      stepCards.forEach(function (l) { l.classList.remove("step-active"); });
      li.classList.add("step-active");
    }

    /* scroll : la carte dont le centre est le plus proche du milieu d'écran devient active */
    function updateActiveStep() {
      if (window.innerWidth > 599) return;
      var mid = window.scrollY + window.innerHeight * 0.52;
      var closest = null, minDist = Infinity;
      stepCards.forEach(function (li) {
        var r = li.getBoundingClientRect();
        var center = r.top + window.scrollY + r.height / 2;
        var dist = Math.abs(mid - center);
        if (dist < minDist) { minDist = dist; closest = li; }
      });
      if (closest && !closest.classList.contains("step-active")) markStep(closest);
    }

    window.addEventListener("scroll", updateActiveStep, { passive: true });
    updateActiveStep();

    /* toucher léger : feedback immédiat dès le premier contact */
    stepCards.forEach(function (li) {
      li.addEventListener("touchstart", function () { markStep(li); }, { passive: true });
    });
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

  /* ---- phone picker ---- */
  var ppick         = document.getElementById("ppick");
  var ppickBackdrop = document.getElementById("ppickBackdrop");
  var _ppickOpener  = null;

  function openPick() {
    if (!ppick) return;
    _ppickOpener = document.activeElement;
    ppick.hidden = false;
    requestAnimationFrame(function () {
      ppick.classList.add("open");
      ppickBackdrop.classList.add("open");
      var firstOpt = ppick.querySelector(".ppick-opt");
      if (firstOpt) firstOpt.focus();
    });
    document.body.style.overflow = "hidden";
  }
  function closePick() {
    if (!ppick) return;
    ppick.classList.remove("open");
    ppickBackdrop.classList.remove("open");
    document.body.style.overflow = "";
    ppick.addEventListener("transitionend", function h() {
      ppick.hidden = true;
      ppick.removeEventListener("transitionend", h);
      if (_ppickOpener) { _ppickOpener.focus(); _ppickOpener = null; }
    });
  }

  document.querySelectorAll("[data-phone-picker]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openPick();
    });
  });
  if (ppickBackdrop) ppickBackdrop.addEventListener("click", closePick);
  if (ppick) {
    /* Focus trap : Tab cycle dans le picker */
    ppick.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closePick(); return; }
      if (e.key !== "Tab") return;
      var focusable = Array.from(ppick.querySelectorAll("a[href], button:not([disabled])"));
      if (!focusable.length) return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && ppick.classList.contains("open")) closePick();
    });
  }

  /* ---- lightbox galerie ---- */
  var lb       = document.getElementById("lb");
  var lbImg    = document.getElementById("lbImg");
  var lbCap    = document.getElementById("lbCap");
  var _lbOpener = null;

  function openLb(src, cap) {
    if (!lb) return;
    _lbOpener = document.activeElement;
    lbImg.src = src;
    lbImg.alt = cap || "";
    lbCap.textContent = cap || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    var closeBtn = lb.querySelector(".lb-close");
    if (closeBtn) closeBtn.focus();
  }
  function closeLb() {
    if (!lb) return;
    lb.hidden = true;
    lbImg.src = "";
    document.body.style.overflow = "";
    if (_lbOpener) { _lbOpener.focus(); _lbOpener = null; }
  }

  document.querySelectorAll(".gal-item, .port-item:not(.port-svc)").forEach(function (a) {
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
      if (e.key === "Escape" && !lb.hidden) closeLb();
    });
  }
})();
