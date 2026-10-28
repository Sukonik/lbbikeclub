(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");

  // Mobile drawer
  var toggle = document.querySelector(".nav-toggle");
  var drawer = document.getElementById("nav-drawer");
  var closeBtn = document.querySelector(".nav-drawer__close");
  function setDrawer(open) {
    if (!drawer) return;
    drawer.dataset.open = open ? "true" : "false";
    drawer.hidden = false;
    document.body.classList.toggle("drawer-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) closeBtn.focus(); else toggle.focus();
  }
  if (toggle && drawer) {
    drawer.hidden = false;
    toggle.addEventListener("click", function () { setDrawer(true); });
    closeBtn.addEventListener("click", function () { setDrawer(false); });
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { drawer.dataset.open = "false"; document.body.classList.remove("drawer-open"); toggle.setAttribute("aria-expanded", "false"); });
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.dataset.open === "true") setDrawer(false); });
  }

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reveal on scroll + count-up
  var els = document.querySelectorAll(".reveal");
  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    if (isNaN(target) || reduce) { el.textContent = el.dataset.count; return; }
    var start = null;
    function step(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        en.target.querySelectorAll("[data-count]").forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add("in"); });
  }

  // Active nav link
  var links = document.querySelectorAll(".nav__link");
  var sections = Array.prototype.map.call(links, function (l) { return document.querySelector(l.getAttribute("href")); });
  if ("IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle("is-active", l.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(function (s) { if (s) so.observe(s); });
  }

  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
