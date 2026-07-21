/* YMK SOL — interactions essentielles (sans animation au scroll) */
(function () {
  "use strict";

  /* Année footer */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

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

  /* Lightbox (réalisations) */
  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var _lbOpener = null, lbOpen = false;
  function openLb(src, cap) {
    if (!lb) return;
    lbOpen = true; _lbOpener = document.activeElement;
    lb.classList.remove("lb-rot");
    lbImg.onload = function () {
      var landscape = lbImg.naturalWidth > lbImg.naturalHeight * 1.15;
      var mobile = window.matchMedia("(max-width: 719px)").matches;
      lb.classList.toggle("lb-rot", landscape && mobile);
    };
    lbImg.src = src; lbImg.alt = cap || ""; lbCap.textContent = cap || "";
    lb.hidden = false; document.body.style.overflow = "hidden";
    var c = lb.querySelector(".lb-close"); if (c) c.focus();
  }
  function closeLb() {
    if (!lb || !lbOpen) return;
    lbOpen = false; lb.hidden = true; lbImg.src = ""; document.body.style.overflow = "";
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
    lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest(".lb-close")) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lbOpen) closeLb(); });
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
      (function loop() {
        var n = cells.length;
        if (n) {
          var c = cells[(Math.random() * n) | 0];
          if (!c.classList.contains("peel")) {
            c.classList.add("peel");
            window.setTimeout(function () { c.classList.remove("peel"); }, 2600);
          }
        }
        window.setTimeout(loop, 360 + Math.random() * 640);
      }());
    }
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = window.setTimeout(build, 300); }, { passive: true });
  }());
}());
