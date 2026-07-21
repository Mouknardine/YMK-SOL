/* YMK SOL — interactions, zéro dépendance de build */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function lerp(a, b, t) { return a + (b - a) * t; }

  /* ---- Année footer ---- */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ============================================================
     MENU
     ============================================================ */
  var burger    = document.querySelector(".burger");
  var mmenu     = document.getElementById("mmenu");
  var mbackdrop = document.getElementById("mmenuBackdrop");
  var pickOpen  = false;

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
    mmenu.addEventListener("click", function (e) { if (e.target.closest("a")) menuToggle(false); });
    if (mbackdrop) mbackdrop.addEventListener("click", function () { menuToggle(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuOpen) menuToggle(false); });
  }

  /* ============================================================
     BARRE DE SCROLL + HEADER
     ============================================================ */
  var bar = document.getElementById("scrollBar");
  var hdr = document.querySelector(".hdr");
  if (bar || hdr) {
    var onScroll = function () {
      var h = document.documentElement;
      if (bar) bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100) + "%";
      if (hdr) hdr.classList.toggle("hdr-scrolled", h.scrollTop > 30);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ============================================================
     HERO — révélation du titre mot par mot (masque)
     ============================================================ */
  if (!reduce) {
    var heroTitle = document.querySelector(".hero-title");
    if (heroTitle) {
      var frag = document.createDocumentFragment();
      heroTitle.childNodes.forEach(function (node) {
        if (node.nodeType === 3) {
          node.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); }
            else {
              var sw = document.createElement("span"); sw.className = "sw";
              var swi = document.createElement("span"); swi.className = "swi"; swi.textContent = part;
              sw.appendChild(swi); frag.appendChild(sw);
            }
          });
        } else if (node.nodeName === "BR") {
          frag.appendChild(document.createElement("br"));
        } else {
          var sw2 = document.createElement("span"); sw2.className = "sw";
          var swi2 = document.createElement("span"); swi2.className = "swi";
          swi2.appendChild(node.cloneNode(true));
          sw2.appendChild(swi2); frag.appendChild(sw2);
        }
      });
      heroTitle.innerHTML = "";
      heroTitle.appendChild(frag);
      var swis = heroTitle.querySelectorAll(".swi");
      swis.forEach(function (swi, i) { swi.style.transitionDelay = (260 + i * 70) + "ms"; });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          swis.forEach(function (swi) { swi.classList.add("swi-in"); });
        });
      });
    }
  }

  /* ============================================================
     HERO — parallaxe souris légère (pointeur fin)
     ============================================================ */
  if (!reduce && window.matchMedia("(pointer: fine)").matches) {
    var heroIn = document.querySelector(".hero-in");
    if (heroIn) {
      var mRaw = { x: 0, y: 0 }, mL = { x: 0, y: 0 };
      document.addEventListener("mousemove", function (e) {
        mRaw.x = e.clientX / window.innerWidth - 0.5;
        mRaw.y = e.clientY / window.innerHeight - 0.5;
      });
      (function raf() {
        mL.x = lerp(mL.x, mRaw.x, 0.06);
        mL.y = lerp(mL.y, mRaw.y, 0.06);
        var inView = window.scrollY < window.innerHeight;
        heroIn.style.transform = inView ? "translate3d(" + (-mL.x * 12) + "px," + (-mL.y * 8) + "px,0)" : "";
        requestAnimationFrame(raf);
      }());
    }
  }

  /* ============================================================
     REVEAL AU SCROLL
     ============================================================ */
  var revealEls = document.querySelectorAll(".reveal");
  if (!reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* iOS :active */
  document.addEventListener("touchstart", function () {}, { passive: true });

  /* ============================================================
     MARQUEE — boucle infinie + drag
     ============================================================ */
  (function () {
    var wrap = document.querySelector(".marquee-wrap");
    if (!wrap) return;
    var track = wrap.querySelector(".marquee-track");
    if (!track) return;

    var orig = Array.from(track.children), guard = 0;
    while (track.scrollWidth < window.innerWidth * 2.5 && guard++ < 40) {
      orig.forEach(function (el) { track.appendChild(el.cloneNode(true)); });
    }
    var halfW = track.scrollWidth / 2;
    var state = { x: 0, speed: -0.6 };
    var dragging = false, lastX = 0;

    (function tick() {
      if (!dragging) state.x += state.speed;
      while (state.x < -halfW) state.x += halfW;
      while (state.x > 0) state.x -= halfW;
      track.style.transform = "translateX(" + state.x + "px)";
      requestAnimationFrame(tick);
    }());

    wrap.addEventListener("pointerdown", function (e) {
      if (e.button && e.button !== 0) return;
      dragging = true; lastX = e.clientX;
      try { wrap.setPointerCapture(e.pointerId); } catch (ex) {}
      wrap.style.cursor = "grabbing";
    });
    wrap.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      state.x += e.clientX - lastX; lastX = e.clientX;
    });
    function end() { if (!dragging) return; dragging = false; wrap.style.cursor = ""; }
    wrap.addEventListener("pointerup", end);
    wrap.addEventListener("pointercancel", end);
  }());

  /* ============================================================
     PHONE PICKER
     ============================================================ */
  var ppick = document.getElementById("ppick");
  var ppickBackdrop = document.getElementById("ppickBackdrop");
  var _ppickOpener = null;

  function setPickInert(inert) {
    if (!ppick) return;
    if (inert) { ppick.setAttribute("inert", ""); ppick.setAttribute("aria-hidden", "true"); }
    else { ppick.removeAttribute("inert"); ppick.removeAttribute("aria-hidden"); }
  }
  function openPick() {
    if (!ppick || pickOpen) return;
    pickOpen = true; _ppickOpener = document.activeElement;
    setPickInert(false); ppick.hidden = false;
    requestAnimationFrame(function () {
      ppick.classList.add("open"); ppickBackdrop.classList.add("open");
      var f = ppick.querySelector(".ppick-opt"); if (f) f.focus();
    });
    document.body.style.overflow = "hidden";
  }
  function closePick() {
    if (!ppick || !pickOpen) return;
    pickOpen = false;
    ppick.classList.remove("open"); ppickBackdrop.classList.remove("open");
    document.body.style.overflow = "";
    ppick.addEventListener("transitionend", function h() {
      ppick.removeEventListener("transitionend", h);
      ppick.hidden = true; setPickInert(true);
      if (_ppickOpener) { _ppickOpener.focus(); _ppickOpener = null; }
    });
  }
  document.querySelectorAll("[data-phone-picker]").forEach(function (btn) {
    btn.addEventListener("click", function (e) { e.preventDefault(); openPick(); });
  });
  if (ppickBackdrop) ppickBackdrop.addEventListener("click", closePick);
  if (ppick) {
    ppick.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closePick(); return; }
      if (e.key !== "Tab") return;
      var f = Array.from(ppick.querySelectorAll("a[href], button:not([disabled])"));
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && pickOpen) closePick(); });
    setPickInert(true);
  }

  /* ============================================================
     LIGHTBOX
     ============================================================ */
  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var _lbOpener = null, lbOpen = false;

  function openLb(src, cap) {
    if (!lb) return;
    lbOpen = true; _lbOpener = document.activeElement;
    lbImg.src = src; lbImg.alt = cap || ""; lbCap.textContent = cap || "";
    lb.hidden = false; document.body.style.overflow = "hidden";
    var c = lb.querySelector(".lb-close"); if (c) c.focus();
  }
  function closeLb() {
    if (!lb || !lbOpen) return;
    lbOpen = false; lb.hidden = true; lbImg.src = "";
    document.body.style.overflow = "";
    if (_lbOpener) { _lbOpener.focus(); _lbOpener = null; }
  }
  document.querySelectorAll(".work-item").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (a.classList.contains("img-missing")) return;
      var img = a.querySelector("img");
      if (img && img.classList.contains("img-missing")) return;
      e.preventDefault();
      openLb(a.getAttribute("href"), a.getAttribute("data-cap"));
    });
  });
  if (lb) {
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest(".lb-close")) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lbOpen) closeLb(); });
  }

  /* ============================================================
     GSAP — parallaxe intérieure sur les images des réalisations
     Motivation : profondeur éditoriale, la matière du sol "respire" au scroll
     ============================================================ */
  (function () {
    if (!window.gsap || !window.ScrollTrigger || reduce) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll(".work-figure img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -4 }, {
        yPercent: 4, ease: "none",
        scrollTrigger: { trigger: img.closest(".work-item"), start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    });
  }());
}());
