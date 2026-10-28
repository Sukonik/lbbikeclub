/* Theme: loaded in <head> so the saved theme paints with the first frame. */
(function () {
  "use strict";
  var THEMES = [
    { id: "giant",       brand: "Giant",       color: "Black",  a: "#8fa6c4", b: "#b58cff", c: "#1a2130" },
    { id: "trek",        brand: "Trek",        color: "Red",    a: "#ff3347", b: "#ff8a3d", c: "#62001a" },
    { id: "specialized", brand: "Specialized", color: "Silver", a: "#dbe4ee", b: "#f0dcb8", c: "#3b4655" },
    { id: "canyon",      brand: "Canyon",      color: "Green",  a: "#22e58b", b: "#12cfd6", c: "#05512f" },
    { id: "scott",       brand: "Scott",       color: "Orange", a: "#ff7a1a", b: "#ffc43d", c: "#6e2400" },
    { id: "cervelo",     brand: "Cervélo", color: "Yellow", a: "#ffe21f", b: "#b9ff3d", c: "#5c4a00" },
    { id: "cannondale",  brand: "Cannondale",  color: "Blue",   a: "#3a82ff", b: "#17d4ff", c: "#0c2a8f" },
    { id: "bianchi",     brand: "Bianchi",     color: "Purple", a: "#a855ff", b: "#ff5fd0", c: "#44168f" }
  ];
  var ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 128 128\" >\n  <defs>\n    <linearGradient id=\"fv-rim\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".32\" stop-color=\"%A\"/><stop offset=\".55\" stop-color=\"#232a35\"/><stop offset=\".78\" stop-color=\"%B\"/><stop offset=\"1\" stop-color=\"#fff\"/></linearGradient>\n    <linearGradient id=\"fv-spoke\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\"1\" stop-color=\"%A\"/></linearGradient>\n    <radialGradient id=\"fv-hub\" cx=\".35\" cy=\".3\" r=\".85\"><stop offset=\"0\" stop-color=\"#fff\"/><stop offset=\".45\" stop-color=\"%A\"/><stop offset=\".8\" stop-color=\"#0b1017\"/><stop offset=\"1\" stop-color=\"%B\"/></radialGradient>\n  </defs>\n  \n  \n  <circle cx=\"64\" cy=\"64\" r=\"56.5\" fill=\"none\" stroke=\"url(#fv-rim)\" stroke-width=\"10\"/>\n  \n  <g fill=\"#fff\" fill-opacity=\".85\"></g>\n  <g stroke=\"url(#fv-spoke)\" stroke-width=\"2.6\" stroke-linecap=\"round\"><line x1=\"67.17\" y1=\"59.63\" x2=\"115.20\" y2=\"64.00\"/><line x1=\"64.56\" y1=\"69.37\" x2=\"108.34\" y2=\"89.60\"/><line x1=\"69.37\" y1=\"64.56\" x2=\"89.60\" y2=\"108.34\"/><line x1=\"59.63\" y1=\"67.17\" x2=\"64.00\" y2=\"115.20\"/><line x1=\"66.20\" y1=\"68.93\" x2=\"38.40\" y2=\"108.34\"/><line x1=\"59.07\" y1=\"61.80\" x2=\"19.66\" y2=\"89.60\"/><line x1=\"60.83\" y1=\"68.37\" x2=\"12.80\" y2=\"64.00\"/><line x1=\"63.44\" y1=\"58.63\" x2=\"19.66\" y2=\"38.40\"/><line x1=\"58.63\" y1=\"63.44\" x2=\"38.40\" y2=\"19.66\"/><line x1=\"68.37\" y1=\"60.83\" x2=\"64.00\" y2=\"12.80\"/><line x1=\"61.80\" y1=\"59.07\" x2=\"89.60\" y2=\"19.66\"/><line x1=\"68.93\" y1=\"66.20\" x2=\"108.34\" y2=\"38.40\"/></g>\n  <circle cx=\"64\" cy=\"64\" r=\"6.6000000000000005\" fill=\"#0b1017\" stroke=\"url(#fv-rim)\" stroke-width=\"2\"/>\n  <circle cx=\"64\" cy=\"64\" r=\"3.6\" fill=\"url(#fv-hub)\"/>\n  <circle cx=\"64\" cy=\"64\" r=\"1.2\" fill=\"#05070a\"/>\n</svg>";
  var KEY = "lbbc-theme";
  var root = document.documentElement;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function valid(id) { return THEMES.some(function (t) { return t.id === id; }); }
  function apply(id) {
    if (!valid(id)) id = "giant";
    root.setAttribute("data-theme", id);
    var t = THEMES.filter(function (x) { return x.id === id; })[0];
    // Tab icon follows the theme (the static SVG/PNG links remain the fallback).
    var fav = document.getElementById("favicon");
    if (fav) fav.setAttribute("href", "data:image/svg+xml," + encodeURIComponent(ICON.split("%A").join(t.a).split("%B").join(t.b)));
    document.querySelectorAll(".swatch").forEach(function (s) { s.setAttribute("aria-pressed", s.dataset.theme === id ? "true" : "false"); });
    document.querySelectorAll("[data-theme-name]").forEach(function (el) { el.textContent = t.brand + " · " + t.color; });
    return id;
  }
  function set(id) { id = apply(id); try { localStorage.setItem(KEY, id); } catch (e) {} }

  apply(read());

  document.addEventListener("DOMContentLoaded", function () {
    var host = document.getElementById("swatches");
    if (host) {
      THEMES.forEach(function (t) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "swatch"; b.dataset.theme = t.id;
        b.style.setProperty("--sw-a", t.a); b.style.setProperty("--sw-b", t.b); b.style.setProperty("--sw-c", t.c);
        b.innerHTML = '<span class="swatch__chip"></span><span class="swatch__name">' + t.brand + "<small>" + t.color + "</small></span>";
        b.addEventListener("click", function () { set(t.id); });
        host.appendChild(b);
      });
    }
    apply(root.getAttribute("data-theme"));
  });

  window.LBBC = window.LBBC || {};
  window.LBBC.setTheme = set;
})();
