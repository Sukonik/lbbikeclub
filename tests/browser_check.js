// Browser checks: pages x widths for overflow and JS errors, drawer, themes, weather render.
// Usage: node tests/browser_check.js [baseUrl]   (needs `playwright`; weather API is mocked)
const { chromium } = require("playwright");
const mock = require("./mock_weather.js");
const base = process.argv[2] || "http://localhost:8123/";
const pages = ["index.html", "weather.html", "404.html"];
const widths = [320, 390, 768, 1024, 1440];
const themes = ["giant", "trek", "specialized", "canyon", "scott", "cervelo", "cannondale", "bianchi"];
(async () => {
  const browser = await chromium.launch();
  let failed = 0;
  const fail = (m) => { failed++; console.log("FAIL", m); };
  for (const pg of pages) for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(e.message));
    await p.route("**/api.open-meteo.com/**", (r) => r.fulfill({ json: mock() }));
    await p.route("**/fonts.g*apis.com/**", (r) => r.abort());
    await p.goto(base + pg, { waitUntil: "load" });
    await p.waitForTimeout(500);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w) fail(`${pg}@${w}: horizontal overflow (${sw})`);
    if (errs.length) fail(`${pg}@${w}: ${errs.join("; ")}`);
    await ctx.close();
  }
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 } });
  const p = await ctx.newPage();
  await p.route("**/api.open-meteo.com/**", (r) => r.fulfill({ json: mock() }));
  await p.route("**/fonts.g*apis.com/**", (r) => r.abort());
  await p.goto(base + "weather.html"); await p.waitForSelector("#wx-app:not([hidden])");
  if (!(await p.$$eval("#hours .hour", (e) => e.length))) fail("weather: no hourly cards");
  if ((await p.$$eval("#days li", (e) => e.length)) !== 7) fail("weather: expected 7 days");
  if (!/\d/.test(await p.textContent(".wx-chip__temp"))) fail("header chip not filled");
  await p.click('[data-drawer-open=""]');
  await p.waitForTimeout(600);
  if (!(await p.$eval("#drawer", (d) => d.classList.contains("open")))) fail("drawer did not open");
  for (const t of themes) {
    await p.click(`.swatch[data-theme="${t}"]`);
    if ((await p.getAttribute("html", "data-theme")) !== t) fail("theme " + t + " not applied");
  }
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  if (await p.$eval("#drawer", (d) => d.classList.contains("open"))) fail("Escape did not close drawer");
  await p.click("#units button[data-u=metric]");
  if (!/km\/h/.test(await p.textContent("#computer"))) fail("metric toggle did not update tiles");
  await browser.close();
  console.log(failed ? `${failed} failure(s)` : "browser checks passed");
  process.exit(failed ? 1 : 0);
})();
