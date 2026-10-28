(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  /* ---- drawer ---- */
  var drawer = document.getElementById("drawer");
  var scrim = document.getElementById("scrim");
  var openers = document.querySelectorAll("[data-drawer-open]");
  var closer = document.querySelector("[data-drawer-close]");
  var lastFocus = null;
  function setDrawer(open, target) {
    if (!drawer) return;
    drawer.classList.toggle("open", open);
    scrim.classList.toggle("open", open);
    document.body.classList.toggle("lock", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    openers.forEach(function (b) { b.setAttribute("aria-expanded", open ? "true" : "false"); });
    if (open) {
      lastFocus = document.activeElement;
      setTimeout(function () { closer.focus(); if (target) { var el = document.getElementById(target); if (el) el.scrollIntoView({ block: "center" }); } }, 60);
    } else if (lastFocus) { lastFocus.focus(); }
  }
  if (drawer) {
    drawer.setAttribute("aria-hidden", "true");
    openers.forEach(function (b) { b.addEventListener("click", function () { setDrawer(true, b.dataset.drawerOpen || null); }); });
    closer.addEventListener("click", function () { setDrawer(false); });
    scrim.addEventListener("click", function () { setDrawer(false); });
    drawer.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { lastFocus = null; setDrawer(false); }); });
    document.addEventListener("keydown", function (e) {
      if (!drawer.classList.contains("open")) return;
      if (e.key === "Escape") setDrawer(false);
      if (e.key === "Tab") { // keep focus inside the open drawer
        var f = drawer.querySelectorAll("a[href], button");
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- reveal + count-up ---- */
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target) || reduce) return;
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = "0";
    requestAnimationFrame(step);
  }
  var els = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add("in"); }); }

  /* ---- active nav (in-page anchors only) ---- */
  var links = Array.prototype.filter.call(document.querySelectorAll(".nav__link"), function (l) { return /^#/.test(l.getAttribute("href")); });
  if (links.length && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach(function (l) { var s = document.querySelector(l.getAttribute("href")); if (s) so.observe(s); });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
