/* YMK SOL — interactions, zéro dépendance */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* année */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  /* ---- sol 3D : génération des lames ---- */
  var floor = document.getElementById("floor");
  if (floor) {
    var COLS = 14, ROWS = 10, total = COLS * ROWS;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < total; i++) {
      var p = document.createElement("div");
      p.className = "plank";
      var col = i % COLS;
      var dist = Math.floor(i / COLS); // rangées du fond vers l'avant
      p.style.setProperty("--d", (reduce ? 0 : (dist * 0.05 + (col % 3) * 0.02)) + "s");
      frag.appendChild(p);
    }
    floor.appendChild(frag);
    paintFloor("parquet");
  }

  /* teintes par matière (damier chaud / froid) */
  function paintFloor(mat) {
    if (!floor) return;
    floor.setAttribute("data-mat", mat);
    var sets = {
      parquet:  ["#c69a52", "#a87c3e", "#8a6330"],
      pvc:      ["#9fb4c2", "#7d96a8", "#5f7787"],
      lino:     ["#d8b25a", "#bf8f3e", "#9c6f2c"],
      moquette: ["#6f6a86", "#565172", "#403c59"]
    };
    var c = sets[mat] || sets.parquet;
    var planks = floor.querySelectorAll(".plank");
    for (var i = 0; i < planks.length; i++) {
      var col = i % 14, row = Math.floor(i / 14);
      var t = (col + row) % 3;               // motif tissé
      planks[i].style.setProperty("--pk", c[t]);
    }
  }

  /* sélecteur de matière */
  var mats = document.querySelectorAll(".mat");
  mats.forEach(function (b) {
    b.addEventListener("click", function () {
      mats.forEach(function (x) { x.classList.remove("is-active"); });
      b.classList.add("is-active");
      paintFloor(b.getAttribute("data-mat"));
    });
  });

  /* survol des prestations -> change la matière du sol en fond */
  var matFromRow = { parquet:"parquet", lino:"lino", pvc:"pvc", moquette:"moquette", poncage:"parquet", renovation:"pvc" };
  document.querySelectorAll(".row").forEach(function (r) {
    r.addEventListener("mouseenter", function () {
      var m = matFromRow[r.getAttribute("data-img")];
      if (m) paintFloor(m);
    });
  });

  /* ---- damier "Le rendu" ---- */
  var grid = document.getElementById("tileGrid");
  if (grid) {
    var palette = ["#c69a52", "#a87c3e", "#8a6330", "#bf8f3e"];
    for (var t = 0; t < 36; t++) {
      var d = document.createElement("div");
      d.className = "tile";
      var col = t % 6, row = Math.floor(t / 6);
      d.style.setProperty("--tc", palette[(col + row) % palette.length]);
      grid.appendChild(d);
    }
    if (!reduce) {
      setInterval(function () {
        var tiles = grid.children;
        var k = Math.floor(Math.random() * tiles.length);
        tiles[k].style.setProperty("--tc", palette[Math.floor(Math.random() * palette.length)]);
      }, 600);
    }
  }

  /* ---- menu mobile ---- */
  var burger = document.querySelector(".burger");
  var mmenu = document.getElementById("mmenu");
  if (burger && mmenu) {
    var toggle = function (open) { burger.setAttribute("aria-expanded", String(open)); mmenu.hidden = !open; };
    burger.addEventListener("click", function () { toggle(burger.getAttribute("aria-expanded") !== "true"); });
    mmenu.addEventListener("click", function (e) { if (e.target.closest("a")) toggle(false); });
  }

  /* ---- barre de progression scroll ---- */
  var bar = document.getElementById("scrollBar");
  if (bar) {
    var onScroll = function () {
      var h = document.documentElement;
      var p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      bar.style.width = (p * 100) + "%";
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
        var el = e.target, end = +el.getAttribute("data-count"), suf = el.getAttribute("data-suffix") || "";
        var t0 = null, dur = 1400;
        var step = function (ts) {
          if (!t0) t0 = ts;
          var k = Math.min((ts - t0) / dur, 1);
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

  /* ---- boutons magnétiques (desktop fin) ---- */
  if (window.matchMedia("(hover:hover) and (pointer:fine)").matches && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var str = 18;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width;
        var yy = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = "translate(" + (x * str) + "px," + (yy * str) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }
})();
