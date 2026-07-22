/* YMK SOL — interactions essentielles (sans animation au scroll) */
(function () {
  "use strict";

  /* Année footer */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* Signature verticale sur la marge (identité atelier) */
  if (!document.querySelector(".edge-sig")) {
    var sig = document.createElement("div");
    sig.className = "edge-sig";
    sig.setAttribute("aria-hidden", "true");
    sig.innerHTML = "YMK SOL <b>&raquo;</b> POSE DE SOL <b>&raquo;</b> CANTON DE VAUD";
    document.body.appendChild(sig);
  }

  /* Header : état au scroll */
  var hdr = document.querySelector(".hdr");
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle("hdr-scrolled", document.documentElement.scrollTop > 20); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Menu plein écran */
  var burger = document.querySelector(".burger");
  var navmenu = document.getElementById("navmenu");
  var menuOpen = false;
  function setMenu(open) {
    if (!burger || !navmenu) return;
    menuOpen = open;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    navmenu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (burger && navmenu) {
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
    navmenu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && menuOpen) setMenu(false); });
  }

  document.addEventListener("touchstart", function () {}, { passive: true });

  /* Dock : caché tant que le hero est visible, apparaît après */
  var dock = document.querySelector(".dock");
  var heroEl = document.querySelector(".hero");
  if (dock && heroEl && "IntersectionObserver" in window) {
    var dockIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { dock.classList.toggle("is-hidden", e.isIntersecting); });
    }, { threshold: 0 });
    dockIO.observe(heroEl);
  }

  /* Phone picker */
  var ppick = document.getElementById("ppick");
  var ppickBackdrop = document.getElementById("ppickBackdrop");
  var _opener = null, pickOpen = false;
  function setInert(v) { if (!ppick) return; if (v) { ppick.setAttribute("inert", ""); ppick.setAttribute("aria-hidden", "true"); } else { ppick.removeAttribute("inert"); ppick.removeAttribute("aria-hidden"); } }
  function openPick() {
    if (!ppick || pickOpen) return;
    pickOpen = true; _opener = document.activeElement; setInert(false); ppick.hidden = false;
    requestAnimationFrame(function () { ppick.classList.add("open"); ppickBackdrop.classList.add("open"); var f = ppick.querySelector(".ppick-opt"); if (f) f.focus(); });
    document.body.style.overflow = "hidden";
  }
  function closePick() {
    if (!ppick || !pickOpen) return;
    pickOpen = false; ppick.classList.remove("open"); ppickBackdrop.classList.remove("open"); document.body.style.overflow = "";
    ppick.addEventListener("transitionend", function h() { ppick.removeEventListener("transitionend", h); ppick.hidden = true; setInert(true); if (_opener) { _opener.focus(); _opener = null; } });
  }
  document.querySelectorAll("[data-phone-picker]").forEach(function (btn) {
    btn.addEventListener("click", function (e) { e.preventDefault(); if (menuOpen) setMenu(false); openPick(); });
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
    setInert(true);
  }

  /* Accordéon prestations (interactif, un seul ouvert) */
  var accItems = Array.prototype.slice.call(document.querySelectorAll(".acc-item"));
  accItems.forEach(function (item) {
    var head = item.querySelector(".acc-head");
    if (!head) return;
    head.addEventListener("click", function () {
      var isOpen = item.classList.contains("is-open");
      accItems.forEach(function (o) {
        o.classList.remove("is-open");
        var h = o.querySelector(".acc-head");
        if (h) h.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) { item.classList.add("is-open"); head.setAttribute("aria-expanded", "true"); }
    });
  });

  /* Lightbox zoomable (réalisations) : pincer, double-tap, boutons +/- */
  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var lbStage = document.getElementById("lbStage");
  var _lbOpener = null, lbOpen = false;
  var zScale = 1, zTx = 0, zTy = 0, zMin = 1, zMax = 6;

  function zApply() {
    lbImg.style.transform = "translate(" + zTx + "px," + zTy + "px) scale(" + zScale + ")";
    lbImg.classList.toggle("is-zoomed", zScale > 1.02);
  }
  function zClamp() {
    if (!lbStage) return;
    var r = lbStage.getBoundingClientRect();
    var iw = lbImg.clientWidth * zScale, ih = lbImg.clientHeight * zScale;
    var mx = Math.max(0, (iw - r.width) / 2), my = Math.max(0, (ih - r.height) / 2);
    zTx = Math.max(-mx, Math.min(mx, zTx));
    zTy = Math.max(-my, Math.min(my, zTy));
  }
  function zReset() { zScale = 1; zTx = 0; zTy = 0; zApply(); }
  function zoomTo(next, fx, fy) {
    next = Math.max(zMin, Math.min(zMax, next));
    var r = lbStage.getBoundingClientRect();
    if (fx == null) { fx = r.left + r.width / 2; fy = r.top + r.height / 2; }
    var dx = fx - (r.left + r.width / 2), dy = fy - (r.top + r.height / 2);
    var k = next / zScale;
    zTx = dx * (1 - k) + k * zTx;
    zTy = dy * (1 - k) + k * zTy;
    zScale = next; zClamp(); zApply();
  }
  function coverScale() {
    if (!lbStage) return 2.6;
    var r = lbStage.getBoundingClientRect();
    var iw = lbImg.clientWidth, ih = lbImg.clientHeight;
    if (!iw || !ih) return 2.6;
    return Math.min(zMax, Math.max(2.4, r.width / iw, r.height / ih));
  }

  function openLb(src, cap) {
    if (!lb) return;
    lbOpen = true; _lbOpener = document.activeElement;
    lbImg.onload = function () { zReset(); };
    lbImg.src = src; lbImg.alt = cap || ""; lbCap.textContent = cap || "";
    zReset();
    lb.hidden = false; document.body.style.overflow = "hidden";
    var c = lb.querySelector(".lb-close"); if (c) c.focus();
  }
  function closeLb() {
    if (!lb || !lbOpen) return;
    lbOpen = false; lb.hidden = true; lbImg.src = ""; zReset(); document.body.style.overflow = "";
    if (_lbOpener) { _lbOpener.focus(); _lbOpener = null; }
  }
  document.querySelectorAll(".proj-media").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var img = a.querySelector("img");
      if (img && img.classList.contains("img-missing")) return;
      e.preventDefault();
      openLb(a.getAttribute("href"), a.getAttribute("data-cap"));
    });
  });

  if (lb) {
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lbOpen) closeLb(); });
    lb.querySelector(".lb-close").addEventListener("click", closeLb);
    var bIn = document.getElementById("lbIn"), bOut = document.getElementById("lbOut");
    if (bIn) bIn.addEventListener("click", function () { zoomTo(zScale * 1.6); });
    if (bOut) bOut.addEventListener("click", function () { zoomTo(zScale / 1.6); });

    /* Gestes : pincer + panoramique + double-tap */
    var pts = {}, pinchStart = 0, pinchScale = 1, panX = 0, panY = 0, panTx = 0, panTy = 0;
    var lastTap = 0, lastTapX = 0, lastTapY = 0, movedFar = false;

    function dist(a, b) { var dx = a.x - b.x, dy = a.y - b.y; return Math.hypot(dx, dy); }
    function mid(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; }
    function keys() { return Object.keys(pts); }

    lbStage.addEventListener("pointerdown", function (e) {
      lbStage.setPointerCapture(e.pointerId);
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var k = keys();
      if (k.length === 2) {
        pinchStart = dist(pts[k[0]], pts[k[1]]); pinchScale = zScale;
      } else if (k.length === 1) {
        panX = e.clientX; panY = e.clientY; panTx = zTx; panTy = zTy; movedFar = false;
      }
    });
    lbStage.addEventListener("pointermove", function (e) {
      if (!pts[e.pointerId]) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var k = keys();
      if (k.length === 2 && pinchStart) {
        var d = dist(pts[k[0]], pts[k[1]]);
        var m = mid(pts[k[0]], pts[k[1]]);
        zoomTo(pinchScale * (d / pinchStart), m.x, m.y);
      } else if (k.length === 1 && zScale > 1.02) {
        zTx = panTx + (e.clientX - panX);
        zTy = panTy + (e.clientY - panY);
        if (Math.abs(e.clientX - panX) > 6 || Math.abs(e.clientY - panY) > 6) movedFar = true;
        zClamp(); zApply();
      } else if (k.length === 1) {
        if (Math.abs(e.clientX - panX) > 6 || Math.abs(e.clientY - panY) > 6) movedFar = true;
      }
    });
    function endPointer(e) {
      if (!pts[e.pointerId]) return;
      var wasSingle = keys().length === 1;
      delete pts[e.pointerId];
      if (keys().length === 1) { var k = keys()[0]; panX = pts[k].x; panY = pts[k].y; panTx = zTx; panTy = zTy; }
      if (wasSingle && !movedFar) {
        var now = Date.now();
        if (now - lastTap < 320 && Math.abs(e.clientX - lastTapX) < 30 && Math.abs(e.clientY - lastTapY) < 30) {
          if (zScale > 1.05) zReset(); else zoomTo(coverScale(), e.clientX, e.clientY);
          lastTap = 0;
        } else {
          lastTap = now; lastTapX = e.clientX; lastTapY = e.clientY;
        }
      }
    }
    lbStage.addEventListener("pointerup", endPointer);
    lbStage.addEventListener("pointercancel", endPointer);

    /* clic sur le fond (hors image, non zoomé) : fermer */
    lbStage.addEventListener("click", function (e) {
      if (e.target === lbStage && zScale <= 1.02) closeLb();
    });
    /* molette : zoom (desktop) */
    lbStage.addEventListener("wheel", function (e) {
      e.preventDefault();
      zoomTo(zScale * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX, e.clientY);
    }, { passive: false });

    window.addEventListener("resize", function () { if (lbOpen) { zClamp(); zApply(); } }, { passive: true });
  }

  /* ============================================================
     FOND : vrai grillage de dalles, des cases se plient au hasard
     ============================================================ */
  (function () {
    var fx = document.querySelector(".fx");
    if (!fx) return;
    fx.innerHTML = "";
    var grid = document.createElement("div");
    grid.className = "fx-grid";
    fx.appendChild(grid);
    var CELL = 48, cells = grid.children;
    function build() {
      var cols = Math.ceil(window.innerWidth / CELL) + 1;
      var rows = Math.ceil(window.innerHeight / CELL) + 1;
      grid.style.gridTemplateColumns = "repeat(" + cols + "," + CELL + "px)";
      grid.style.gridTemplateRows = "repeat(" + rows + "," + CELL + "px)";
      grid.innerHTML = "";
      var frag = document.createDocumentFragment();
      for (var i = 0; i < cols * rows; i++) { var c = document.createElement("div"); c.className = "fx-cell"; frag.appendChild(c); }
      grid.appendChild(frag);
    }
    build();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      function peelOne() {
        var n = cells.length; if (!n) return;
        var c = cells[(Math.random() * n) | 0];
        if (c.classList.contains("peel")) return;
        var dur = 4200 + Math.random() * 1800;   // 4,2 à 6 s
        var pk = 38 + Math.random() * 28;          // pli de 38 à 66 deg (reste bien dans la case)
        c.style.setProperty("--dur", (dur / 1000).toFixed(2) + "s");
        c.style.setProperty("--pk", pk.toFixed(0) + "deg");
        c.classList.add("peel");
        window.setTimeout(function () {
          c.classList.remove("peel");
          c.style.removeProperty("--dur");
          c.style.removeProperty("--pk");
        }, dur + 70);
      }
      (function loop() {
        peelOne();
        window.setTimeout(loop, 750 + Math.random() * 1150);
      }());
    }
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = window.setTimeout(build, 300); }, { passive: true });
  }());

  /* ============================================================
     ANIMATIONS : titres mot à mot, images en volet, fondu au scroll
     ============================================================ */
  (function () {
    if (!("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* -- Découpe un titre en mots (en préservant les balises internes) -- */
    function splitWords(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (part === "") return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "wrd";
            var wi = document.createElement("span"); wi.className = "wrd-i";
            wi.textContent = part;
            w.appendChild(wi); frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.nodeName !== "BR") {
          splitWords(n);
        }
      });
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        var mode = el.getAttribute("data-anim");
        if (mode === "words") {
          el.classList.add("words-in");
          var wi = el.querySelectorAll(".wrd-i");
          var last = (wi.length - 1) * 55 + 900;
          window.setTimeout(function () { el.classList.add("words-done"); }, last);
        } else if (mode === "img") {
          el.classList.add("rimg-in");
        } else {
          el.classList.add("rv-in");
          window.setTimeout(function () {
            el.classList.remove("rv", "rv-anim", "rv-in");
            el.style.transitionDelay = "";
          }, 1300);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    /* -- Titres : mot à mot -- */
    Array.prototype.slice.call(document.querySelectorAll(
      ".hero-title, .phead-title, .shead h2, .nextcta-title"
    )).forEach(function (h) {
      splitWords(h);
      var wi = h.querySelectorAll(".wrd-i");
      wi.forEach ? wi.forEach(setDelay) : Array.prototype.forEach.call(wi, setDelay);
      function setDelay(el, i) { el.style.transitionDelay = (i * 55) + "ms"; }
      h.setAttribute("data-anim", "words");
      io.observe(h);
    });

    /* -- Image du hero : volet -- */
    Array.prototype.slice.call(document.querySelectorAll(".hero-figure")).forEach(function (el) {
      el.classList.add("reveal-img");
      el.setAttribute("data-anim", "img");
      io.observe(el);
    });

    /* -- Reste : fondu + montée, avec cascade par groupe -- */
    var SEL = ".hero-eyebrow, .hero-sub, .hero-actions, .phead-idx, .phead-sub, " +
      ".shead-top, .navcard, .proj-media, .acc-item, .cline, " +
      ".nextcta-eyebrow, .nextcta-actions, .strip-in";
    Array.prototype.slice.call(document.querySelectorAll(SEL)).forEach(function (el) {
      el.classList.add("rv", "rv-anim");
      var i = 0, p = el.previousElementSibling;
      while (p) { if (p.classList && p.classList.contains("rv")) i++; p = p.previousElementSibling; }
      if (i) el.style.transitionDelay = Math.min(i, 6) * 70 + "ms";
      io.observe(el);
    });
  }());
}());
