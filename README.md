<img src="assets/favicon.svg" width="72" height="72" alt="Long Beach Bike Club wheel logo">

# 🚲 Long Beach Bike Club

A local bike club for Long Beach, NY. **Ride together. Check the weather. Roll out.** `#longbeachny #bikeclub #socialcycling`

## 🏠 Current site: v1.1.0
🚲 **Live:** [sukonik.github.io/lbbikeclub](https://sukonik.github.io/lbbikeclub/) · 🌤️ [Ride weather](https://sukonik.github.io/lbbikeclub/weather.html) · 🚀 [Deploy workflow](https://github.com/Sukonik/lbbikeclub/actions/workflows/pages.yml) · 🧪 [QA workflow](https://github.com/Sukonik/lbbikeclub/actions/workflows/qa.yml)

Pearlescent chrome on black, a clean themed header with its own right-side drawer, a live weather chip, and a ride-weather page built for cyclists. Older versions are logged at the [bottom of this README](#-site-version-history).

**Key pages:** [Home](https://sukonik.github.io/lbbikeclub/) · [About](https://sukonik.github.io/lbbikeclub/#about) · [Social Media](https://sukonik.github.io/lbbikeclub/#social) · [Partners](https://sukonik.github.io/lbbikeclub/#partners) · [Locations](https://sukonik.github.io/lbbikeclub/#locations) · [Weather](https://sukonik.github.io/lbbikeclub/weather.html)

## 🌐 Find the club
- Instagram: [@lbbikeclub](https://www.instagram.com/lbbikeclub/) (76 followers, 29 following)
- Facebook: [Long Beach Bike Club](https://www.facebook.com/groups/676497260309868/), a private group with 142 members
- Partner: [Bike Nassau](https://www.instagram.com/bikenassau/)

Counts are a snapshot from Oct 2026. Update them in `index.html`.

## 🧭 Website navigation
Home · About · Social Media · Partners · Locations · Weather. Desktop shows the links in the header. On every screen size the menu button opens the drawer, which holds the links, the theme picker and shortcuts.

## 🎨 Themes
Eight pearlescent themes named for bike brands, switchable from the header dot or the drawer. The choice is saved in the browser and applied before first paint.

| Theme | Color | Theme | Color |
| --- | --- | --- | --- |
| Giant | Black (default) | Scott | Orange |
| Trek | Red | Cervélo | Yellow |
| Specialized | Silver | Cannondale | Blue |
| Canyon | Green | Bianchi | Purple |

Each theme sets three colors (`--a` primary, `--b` color-flip highlight, `--c` deep) in `css/site.css`. The paint background, header tint, drawer, panels, buttons and the wheel all read from them, so everything matches. To add a theme, add one `[data-theme]` rule and one entry in `js/theme.js`.

## 🌤️ Ride weather
[weather.html](https://sukonik.github.io/lbbikeclub/weather.html) uses the free [Open-Meteo](https://open-meteo.com/) API (no key) and pairs with the full [ClearSky weather app](https://sukonik.github.io/weather-app/) ([source](https://github.com/Sukonik/weather-app)) for tides, air quality, wind charts, UV and moon phases.
- **Ride score** (0–100): our own estimate from feels-like temperature, wind, gusts, rain chance, UV and daylight. A guide, not a safety guarantee.
- **Wind compass** with headwind, tailwind and crosswind for the direction you pick.
- **Bike-computer tiles**, a **best two-hour window**, a **24-hour tread-bar strip** and a **7-day outlook**.
- **What to wear** and **lights and daylight** guidance.
- Eight ride areas (Long Beach, Point Lookout, Lido Beach, Atlantic Beach, Rockaway Beach, Arverne, Lawrence, Cedarhurst) and °F/mph or °C/km/h.
- A live chip in the header and live readouts on the home page use the same data (cached 10 minutes).

## 🧩 UI/UX architecture
Black first, pearlescent color second, white text. Design cues: the modular, high-contrast look of [Anduril](https://www.anduril.com/), and the mobile-first responsive structure of [GoldenSunLaw](https://github.com/Sukonik/GoldenSunLaw) and [GoldBrief](https://github.com/Sukonik/goldbrief). Inter for type, a mono face for labels. No framework and no build step.

Component patterns come from [Ant Design](https://github.com/ant-design/ant-design) (segmented control), [Base UI](https://github.com/mui/base-ui) (toggle group, accessible drawer behavior), [shadcn/ui](https://github.com/shadcn-ui/ui) (select, tabs, badge) and [Chakra UI](https://github.com/chakra-ui/chakra-ui) (spacing and token ideas). They are rewritten as small vanilla CSS and JS so the site stays a static GitHub Pages site. Check each project's license before copying code.

Responsive breakpoints: 640 / 920 / 1200 px. Keyboard-accessible drawer (Escape, focus trap), skip link, `prefers-reduced-motion` support.

## 🗂️ Structure
```
index.html, weather.html, 404.html     pages
css/site.css                           tokens, themes, header, drawer, panels
css/weather.css                        ride-weather components
js/theme.js                            theme list, saved choice (loaded in <head>)
js/weather-lib.js                      Open-Meteo, ride score, units, header chip
js/weather-page.js                     weather page renderers and controls
js/main.js                             drawer, reveal, active nav
assets/                                favicon, share image, app icon
robots.txt, sitemap.xml, site.webmanifest
tests/                                 check_site.py, browser_check.js, mock_weather.js
.github/workflows/                     pages.yml (deploy), qa.yml (PR checks)
```

## ✏️ Editing content
- Partners live in `#partners` and towns in `#locations` in `index.html`.
- Ride times are not listed. They are posted in the Facebook group. Add a schedule to `#about` when you have one.
- Ride areas are listed in `js/weather-lib.js` (`PLACES`).
- Add a custom domain by creating a `CNAME` file in the repo root.

## 🧪 Testing
```bash
python3 tests/check_site.py            # links, anchors, files, SEO basics (no dependencies)
python3 -m http.server 8123 &          # serve the site
npm i --no-save playwright && npx playwright install chromium
node tests/browser_check.js            # 3 pages x 5 widths: overflow, JS errors, drawer, all 8 themes, weather render
```
`browser_check.js` mocks the weather API, so it runs offline. The pull-request workflow (`qa.yml`) runs all of this. Automated checks do not replace human visual review.

## 🚀 Deployment and publishing
Automatic. Every push to `main` runs [`pages.yml`](.github/workflows/pages.yml): static checks first, then deploy to GitHub Pages. Pull requests run checks only. One-time setup: **Settings > Pages > Source: GitHub Actions**. Redeploy by hand from **Actions > Deploy GitHub Pages > Run workflow**. Preview locally with `python3 -m http.server`.

## 🗺️ Roadmap
- **1.2** real ride schedule, photos, and a partner list.
- **1.3** route pages with map links and wind-aware route suggestions.
- **2.0** events calendar and member features, if the club wants them.

## 📜 License
[Mozilla Public License 2.0](LICENSE).

## 🕰️ Site version history
Newest version is shown at the [top](#-current-site-v110); this log lists earlier versions, newest first. **Maintenance rule:** when the site changes in a user-visible way, move the previous "Current" entry here, add the new one at the top, and add a matching [CHANGELOG](CHANGELOG.md) entry.

| Version | Date | Status | Summary |
| --- | --- | --- | --- |
| 1.1.0 | 2026-10-28 | **Current** (see top) | Pearlescent brand themes and switcher, themed header and drawer, live weather chip, Ride Weather page, cleaner copy. |
| 1.0.0 | 2026-10-28 | Superseded | First public release: Home, About, Social Media, Partners, Locations, automated publish, 404 and SEO files. |

Exact earlier states can be viewed with `git show <commit>:index.html`.
