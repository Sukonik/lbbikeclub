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
  var ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 128 128\"><circle cx=\"64\" cy=\"64\" r=\"56.00\" fill=\"none\" stroke=\"%C\" stroke-width=\"12\"/><g stroke=\"%C\" stroke-width=\"3.6\" stroke-linecap=\"round\"><line x1=\"68.05\" y1=\"61.06\" x2=\"115.00\" y2=\"64.00\"/><line x1=\"66.03\" y1=\"68.57\" x2=\"108.17\" y2=\"89.50\"/><line x1=\"68.57\" y1=\"66.03\" x2=\"89.50\" y2=\"108.17\"/><line x1=\"61.06\" y1=\"68.05\" x2=\"64.00\" y2=\"115.00\"/><line x1=\"64.52\" y1=\"68.97\" x2=\"38.50\" y2=\"108.17\"/><line x1=\"59.03\" y1=\"63.48\" x2=\"19.83\" y2=\"89.50\"/><line x1=\"59.95\" y1=\"66.94\" x2=\"13.00\" y2=\"64.00\"/><line x1=\"61.97\" y1=\"59.43\" x2=\"19.83\" y2=\"38.50\"/><line x1=\"59.43\" y1=\"61.97\" x2=\"38.50\" y2=\"19.83\"/><line x1=\"66.94\" y1=\"59.95\" x2=\"64.00\" y2=\"13.00\"/><line x1=\"63.48\" y1=\"59.03\" x2=\"89.50\" y2=\"19.83\"/><line x1=\"68.97\" y1=\"64.52\" x2=\"108.17\" y2=\"38.50\"/></g><path fill=\"%C\" fill-rule=\"evenodd\" d=\"M58 64a6 6 0 1 0 12 0a6 6 0 1 0 -12 0zM61.8 64a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z\"/></svg>";
  var KEY = "lbbc-theme";
  var root = document.documentElement;

  function tint(hex) { // 16% theme color over #f6f9ff
    var base = [246, 249, 255], out = "#";
    for (var i = 0; i < 3; i++) { var v = Math.round(base[i] * 0.84 + parseInt(hex.substr(1 + i * 2, 2), 16) * 0.16); out += (v < 16 ? "0" : "") + v.toString(16); }
    return out;
  }
  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function valid(id) { return THEMES.some(function (t) { return t.id === id; }); }
  function apply(id) {
    if (!valid(id)) id = "giant";
    root.setAttribute("data-theme", id);
    var t = THEMES.filter(function (x) { return x.id === id; })[0];
    // Tab icon: white with the same slight theme tint as the logo.
    var fav = document.getElementById("favicon");
    if (fav) fav.setAttribute("href", "data:image/svg+xml," + encodeURIComponent(ICON.split("%C").join(tint(t.a))));
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
