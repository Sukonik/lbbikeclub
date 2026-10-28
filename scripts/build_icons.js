#!/usr/bin/env node
/* Generates the wheel mark: a flat, bright 2D wheel (rim + spokes + hub), no outer line.
   Fixed bright color so it never clashes with a theme.
   node scripts/build_icons.js            writes assets/*.svg and PNG icons (needs playwright)
   node scripts/build_icons.js --symbol   prints the inline <symbol> used in the page header/hero */
const fs = require("fs");
const path = require("path");
const C = 64, INK = "#f4f8ff";

const f = (n) => n.toFixed(2);
const pt = (r, deg) => [C + r * Math.cos((deg * Math.PI) / 180), C + r * Math.sin((deg * Math.PI) / 180)];

function wheel({ spokes, spokeW, rimW }) {
  const rimR = 62 - rimW / 2, inner = 62 - rimW, HUB = 6;
  let sp = "";
  for (let i = 0; i < spokes; i++) {
    const ar = (360 / spokes) * i;
    const ah = ar + (i % 2 ? 36 : -36); // 2-cross lacing: spokes cross in pairs
    const [x1, y1] = pt(HUB - 1, ah), [x2, y2] = pt(inner + 1, ar);
    sp += `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`;
  }
  return `<circle cx="${C}" cy="${C}" r="${f(rimR)}" fill="none" stroke="${INK}" stroke-width="${rimW}"/>` +
    `<g stroke="${INK}" stroke-width="${spokeW}" stroke-linecap="round">${sp}</g>` +
    `<path fill="${INK}" fill-rule="evenodd" d="M${C - HUB} ${C}a${HUB} ${HUB} 0 1 0 ${HUB * 2} 0a${HUB} ${HUB} 0 1 0 ${-HUB * 2} 0zM${C - 2.2} ${C}a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0z"/>`;
}

const LOGO = { spokes: 16, spokeW: 2.2, rimW: 9 };
const SMALL = { spokes: 12, spokeW: 3.6, rimW: 12 }; // favicon: bolder so it reads at 16 px
const svg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${inner}</svg>\n`;

if (process.argv.includes("--symbol")) {
  // the inline mark takes a slight theme tint through CSS (.wm-s / .wm-f use --wheel)
  const inline = wheel(LOGO).split(`stroke="${INK}"`).join('class="wm-s"').split(`fill="${INK}"`).join('class="wm-f"');
  process.stdout.write(`<symbol id="wheel-mark" viewBox="0 0 128 128">${inline}</symbol>\n`);
  process.exit(0);
}

const out = path.join(__dirname, "..", "assets");
fs.writeFileSync(path.join(out, "logo-wheel.svg"), svg(wheel(LOGO)));
fs.writeFileSync(path.join(out, "favicon.svg"), svg(wheel(SMALL)));

(async () => {
  let chromium;
  try { ({ chromium } = require("playwright")); } catch (e) { console.log("playwright not installed: SVGs written, PNGs skipped"); return; }
  const b = await chromium.launch();
  const png = async (file, size, bg, pad, src) => {
    const p = await b.newPage({ viewport: { width: size, height: size } });
    const s = fs.readFileSync(path.join(out, src), "utf8").replace("<svg ", `<svg width="${size * (1 - pad * 2)}" height="${size * (1 - pad * 2)}" `);
    await p.setContent(`<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${bg}">${s}</body>`);
    await p.screenshot({ path: path.join(out, file), omitBackground: bg === "transparent" });
    await p.close();
  };
  await png("icon-512.png", 512, "#05070a", 0.12, "logo-wheel.svg");
  await png("apple-touch-icon.png", 180, "#05070a", 0.12, "logo-wheel.svg");
  await png("favicon-192.png", 192, "#05070a", 0.1, "favicon.svg");
  await png("favicon-32.png", 32, "transparent", 0, "favicon.svg");
  await b.close();
  console.log("icons written");
})();
