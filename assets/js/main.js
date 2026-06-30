/* YMK SOL — interactions premium, zéro dépendance */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Utilitaires ---- */
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  /* ---- Année footer ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ============================================================
     THÈME
     ============================================================ */
  var root   = document.documentElement;
  var toggle = document.getElementById("themeToggle");
  var PREF   = "ymk-theme";

  /* L'inline script <head> a déjà appliqué le bon thème.
     Fallback si JS inline désactivé. */
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

  /* ============================================================
     MENU
     ============================================================ */
  var burger   = document.querySelector(".burger");
  var mmenu    = document.getElementById("mmenu");
  var mbackdrop = document.getElementById("mmenuBackdrop");
  if (burger && mmenu) {
    var menuOpen = false;
    var menuToggle = function (open) {
      menuOpen = open;
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      mmenu.hidden = !open;
      if (mbackdrop) mbackdrop.hidden = !open;
      if (!open) document.body.style.overflow = "";
      else if (!pickOpen) document.body.style.overflow = "hidden";
    };
    burger.addEventListener("click", function () {
      menuToggle(burger.getAttribute("aria-expanded") !== "true");
    });
    mmenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) menuToggle(false);
    });
    if (mbackdrop) mbackdrop.addEventListener("click", function () { menuToggle(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) menuToggle(false);
    });
  }

  /* ============================================================
     BARRE SCROLL + HDR-SCROLLED
     ============================================================ */
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

  /* ============================================================
     HERO — WORD MASK REVEAL
     ============================================================ */
  if (!reduce) {
    var heroTitle = document.querySelector(".hero-title");
    if (heroTitle) {
      /* Découpe le titre en mots, chacun caché par overflow:hidden sur .sw */
      var frag = document.createDocumentFragment();
      heroTitle.childNodes.forEach(function (node) {
        if (node.nodeType === 3) {
          /* nœud texte → couper par mots */
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) {
              frag.appendChild(document.createTextNode(part));
            } else {
              var sw = document.createElement("span");
              sw.className = "sw";
              var swi = document.createElement("span");
              swi.className = "swi";
              swi.textContent = part;
              sw.appendChild(swi);
              frag.appendChild(sw);
            }
          });
        } else if (node.nodeName === "BR") {
          frag.appendChild(document.createElement("br"));
        } else {
          /* <span class="u">parfait.</span> → envelopper */
          var sw = document.createElement("span");
          sw.className = "sw sw-last";
          var swi = document.createElement("span");
          swi.className = "swi";
          swi.appendChild(node.cloneNode(true));
          sw.appendChild(swi);
          frag.appendChild(sw);
        }
      });

      /* Remplacer le contenu, annuler l'animation CSS de secours */
      heroTitle.style.cssText = "opacity:1;transform:none;animation:none;";
      heroTitle.innerHTML = "";
      heroTitle.appendChild(frag);

      /* Déclencher l'animation mot par mot */
      var swis = heroTitle.querySelectorAll(".swi");
      swis.forEach(function (swi, i) {
        swi.style.transitionDelay = (80 + i * 65) + "ms";
      });
      /* Double RAF pour s'assurer que les styles initiaux sont peints */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          swis.forEach(function (swi) { swi.classList.add("swi-in"); });
        });
      });
    }
  }

  /* ============================================================
     MOUSE PARALLAX — hero (desktop pointer fin seulement)
     ============================================================ */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    var heroEl  = document.querySelector(".hero");
    var heroIn  = document.querySelector(".hero-in");
    var carpetTex = document.querySelector(".carpet-texture");

    if (heroEl && heroIn) {
      var mRaw = { x: 0, y: 0 };
      var mLerp = { x: 0, y: 0 };

      document.addEventListener("mousemove", function (e) {
        mRaw.x = (e.clientX / window.innerWidth  - 0.5);
        mRaw.y = (e.clientY / window.innerHeight - 0.5);
      });

      (function rafParallax() {
        mLerp.x = lerp(mLerp.x, mRaw.x, 0.055);
        mLerp.y = lerp(mLerp.y, mRaw.y, 0.055);

        var inView = window.scrollY < window.innerHeight;
        heroIn.style.transform = inView
          ? "translate3d(" + (-mLerp.x * 16) + "px," + (-mLerp.y * 10) + "px,0)"
          : "";
        if (carpetTex) {
          carpetTex.style.transform = inView
            ? "translate3d(" + (mLerp.x * 9) + "px," + (mLerp.y * 6) + "px,0) scale(1.06)"
            : "";
        }
        requestAnimationFrame(rafParallax);
      }());
    }
  }

  /* ============================================================
     SCROLL PARALLAX — texture tapis
     ============================================================ */
  if (!reduce) {
    var _carpetTex = document.querySelector(".carpet-texture");
    if (_carpetTex) {
      /* Ne pas écraser le transform du parallax souris si actif — on utilisera
         une variable CSS pour composer les deux effets */
      window.addEventListener("scroll", function () {
        var sy = window.scrollY;
        if (sy < window.innerHeight * 1.5) {
          _carpetTex.style.setProperty("--scroll-y", sy + "px");
        }
      }, { passive: true });
    }
  }

  /* ============================================================
     REVEAL AU SCROLL — smooth
     ============================================================ */
  var revealEls = document.querySelectorAll(".reveal");

  if (!reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -60px 0px"
    });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ============================================================
     ACTIVE :active sur iOS Safari
     ============================================================ */
  document.addEventListener("touchstart", function () {}, { passive: true });

  /* ============================================================
     STEP CARDS — active au scroll (mobile)
     ============================================================ */
  var stepCards = document.querySelectorAll(".steps li");
  if (stepCards.length && !reduce) {
    function markStep(li) {
      stepCards.forEach(function (l) { l.classList.remove("step-active"); });
      li.classList.add("step-active");
    }
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
    stepCards.forEach(function (li) {
      li.addEventListener("touchstart", function () { markStep(li); }, { passive: true });
    });
  }

  /* ============================================================
     COMPTEURS ANIMÉS — easeOutExpo
     ============================================================ */
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el  = e.target;
        var end = +el.getAttribute("data-count");
        var suf = el.getAttribute("data-suffix") || "";
        var t0  = null;
        var dur = 1600;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var k = Math.min((ts - t0) / dur, 1);
          el.textContent = Math.round(end * easeOutExpo(k)) + suf;
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = c.getAttribute("data-count") + (c.getAttribute("data-suffix") || "");
    });
  }

  /* ============================================================
     PHONE PICKER
     ============================================================ */
  var ppick         = document.getElementById("ppick");
  var ppickBackdrop = document.getElementById("ppickBackdrop");
  var _ppickOpener  = null;
  var pickOpen      = false;

  function setPickInert(inert) {
    /* Empêche le Tab dans ppick quand fermé, sans s'appuyer sur display */
    if (!ppick) return;
    if (inert) {
      ppick.setAttribute("inert", "");
      ppick.setAttribute("aria-hidden", "true");
    } else {
      ppick.removeAttribute("inert");
      ppick.removeAttribute("aria-hidden");
    }
  }

  function openPick() {
    if (!ppick || pickOpen) return;
    pickOpen      = true;
    _ppickOpener  = document.activeElement;
    setPickInert(false);
    ppick.hidden  = false;
    requestAnimationFrame(function () {
      ppick.classList.add("open");
      ppickBackdrop.classList.add("open");
      var firstOpt = ppick.querySelector(".ppick-opt");
      if (firstOpt) firstOpt.focus();
    });
    document.body.style.overflow = "hidden";
  }

  function closePick() {
    if (!ppick || !pickOpen) return;
    pickOpen = false;
    ppick.classList.remove("open");
    ppickBackdrop.classList.remove("open");
    document.body.style.overflow = "";
    ppick.addEventListener("transitionend", function h() {
      ppick.removeEventListener("transitionend", h);
      ppick.hidden = true;
      setPickInert(true);
      if (_ppickOpener) { _ppickOpener.focus(); _ppickOpener = null; }
    });
  }

  document.querySelectorAll("[data-phone-picker]").forEach(function (btn) {
    btn.addEventListener("click", function (e) { e.preventDefault(); openPick(); });
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

    /* ESC global — seulement si picker ouvert ; pas de doublon car ppick handler
       capture avant que ça ne bubble sur document */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && pickOpen) closePick();
    });

    /* État initial : inactif et caché */
    setPickInert(true);
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  var lb       = document.getElementById("lb");
  var lbImg    = document.getElementById("lbImg");
  var lbCap    = document.getElementById("lbCap");
  var _lbOpener = null;
  var lbOpen   = false;

  function openLb(src, cap) {
    if (!lb) return;
    lbOpen   = true;
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
    if (!lb || !lbOpen) return;
    lbOpen    = false;
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
      if (e.key === "Escape" && lbOpen) closeLb();
    });
  }
}());
