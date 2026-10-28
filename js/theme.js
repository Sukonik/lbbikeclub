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
  var KEY = "lbbc-theme";
  var root = document.documentElement;

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function valid(id) { return THEMES.some(function (t) { return t.id === id; }); }
  function apply(id) {
    if (!valid(id)) id = "giant";
    root.setAttribute("data-theme", id);
    var t = THEMES.filter(function (x) { return x.id === id; })[0];
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", "#05070a");
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
