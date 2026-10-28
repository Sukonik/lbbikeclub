#!/usr/bin/env node
/* Generates the wheel mark: a deep-section (40 mm) road wheel with 2-cross laced spokes.
   node scripts/build_icons.js            writes assets/*.svg and PNG icons (needs playwright)
   node scripts/build_icons.js --symbol   prints the inline <symbol> used in the page header/hero */
const fs = require("fs");
const path = require("path");
const C = 64;

const f = (n) => n.toFixed(2);
const pt = (r, deg) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)];

/* colors: either fixed hex or CSS variables (for the inline, theme-aware symbol) */
function wheel({ a, b, spokes = 24, spokeW = 0.5, id = "w", detail = true }) {
  const R = detail ? 49.6 : 51.2, HUB = 5.4, CROSS = 54;
  let sp = "";
  for (let i = 0; i < spokes; i++) {
    const ar = (360 / spokes) * i;
    const ah = ar + (i % 2 ? CROSS : -CROSS);
    const [x1, y1] = pt(HUB, ah), [x2, y2] = pt(R, ar);
    sp += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  }
  let nipples = "";
  if (detail) for (let i = 0; i < spokes; i++) { const [x, y] = pt(R + 0.6, (360 / spokes) * i); nipples += `<circle cx="${f(x)}" cy="${f(y)}" r="0.7"/>`; }
  return `
  <defs>
    <linearGradient id="${id}-rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".32" stop-color="${a}"/><stop offset=".55" stop-color="#232a35"/><stop offset=".78" stop-color="${b}"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <linearGradient id="${id}-spoke" gradientUnits="userSpaceOnUse" x1="14" y1="14" x2="114" y2="114"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="${a}"/></linearGradient>
    <radialGradient id="${id}-hub" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="${a}"/><stop offset=".8" stop-color="#0b1017"/><stop offset="1" stop-color="${b}"/></radialGradient>
  </defs>
  ${detail ? `<circle cx="${C}" cy="${C}" r="59.4" fill="none" stroke="#161b22" stroke-width="5.4"/>
  <circle cx="${C}" cy="${C}" r="62.1" fill="none" stroke="url(#${id}-rim)" stroke-width="0.9" opacity=".9"/>` : ""}
  ${detail ? `<circle cx="${C}" cy="${C}" r="56.9" fill="none" stroke="#000" stroke-opacity=".55" stroke-width=".8"/>` : ""}
  <circle cx="${C}" cy="${C}" r="${detail ? 53.3 : 56.5}" fill="none" stroke="url(#${id}-rim)" stroke-width="${detail ? 7.4 : 10}"/>
  ${detail ? `<circle cx="${C}" cy="${C}" r="53.3" fill="none" stroke="#000" stroke-opacity=".28" stroke-width=".7"/>
  <circle cx="${C}" cy="${C}" r="50.1" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width=".5"/>` : ""}
  <g fill="#fff" fill-opacity=".85">${nipples}</g>
  <g stroke="url(#${id}-spoke)" stroke-width="${spokeW}" stroke-linecap="round">${sp}</g>
  <circle cx="${C}" cy="${C}" r="${HUB + 1.2}" fill="#0b1017" stroke="url(#${id}-rim)" stroke-width="${detail ? 1 : 2}"/>
  <circle cx="${C}" cy="${C}" r="3.6" fill="url(#${id}-hub)"/>
  <circle cx="${C}" cy="${C}" r="1.2" fill="#05070a"/>`;
}

const svg = (inner, extra = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" ${extra}>${inner}\n</svg>\n`;

if (process.argv.includes("--symbol")) {
  process.stdout.write(`<symbol id="wheel-mark" viewBox="0 0 128 128">${wheel({ a: "var(--a)", b: "var(--b)", id: "wm", spokeW: 0.8 })}</symbol>\n`);
  process.exit(0);
}

const out = path.join(__dirname, "..", "assets");
const pal = { a: "#aebfd4", b: "#c8b4ff" };
fs.writeFileSync(path.join(out, "logo-wheel.svg"), svg(wheel({ ...pal, id: "lw", spokeW: 0.6 })));
// favicon: fewer, thicker spokes and no fine detail so it reads at 16 px
fs.writeFileSync(path.join(out, "favicon.svg"), svg(wheel({ ...pal, id: "fv", spokes: 12, spokeW: 2.6, detail: false })));

(async () => {
  let chromium;
  try { ({ chromium } = require("playwright")); } catch (e) { console.log("playwright not installed: SVGs written, PNGs skipped"); return; }
  const b = await chromium.launch();
  const png = async (file, size, bg, pad, detailed) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    const src = fs.readFileSync(path.join(out, detailed ? "logo-wheel.svg" : "favicon.svg"), "utf8").replace("<svg ", `<svg width="${size * (1 - pad * 2)}" height="${size * (1 - pad * 2)}" `);
    await p.setContent(`<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${bg}">${src}</body>`);
    await p.screenshot({ path: path.join(out, file), omitBackground: bg === "transparent" });
    await p.close();
  };
  await png("icon-512.png", 512, "#05070a", 0.1, true);
  await png("apple-touch-icon.png", 180, "#05070a", 0.1, true);
  await png("favicon-32.png", 32, "transparent", 0, false);
  await png("favicon-192.png", 192, "#05070a", 0.08, true);
  await b.close();
  console.log("icons written");
})();
