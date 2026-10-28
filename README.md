# Long Beach Bike Club

Website for **Long Beach Bike Club**, a local bike club for Long Beach, NY.
`#longbeachny #bikeclub #socialcycling`

- Instagram: [@lbbikeclub](https://www.instagram.com/lbbikeclub/) (76 followers, 29 following)
- Facebook: [Long Beach Bike Club group](https://www.facebook.com/groups/676497260309868/), a private group with 142 members

Member counts are a snapshot from Oct 2026. Update them in `index.html`.

## Design

Y2K chrome meets Anduril-style industrial UI: near-black field with a faint grid, chrome gradient type and bezels, monospace telemetry labels, and modular panels with corner ticks. Layout and responsive behavior follow the GoldenSunLaw and GoldBrief sites: mobile-first, breakpoints at 640 / 920 / 1200 px, sticky header with a slide-in drawer on small screens, skip link, and `prefers-reduced-motion` support.

## Structure

```
index.html            single-page site (Home / About / Social Media / Partners / Locations)
css/site.css          all styles
js/main.js            drawer nav, scroll reveal, count-up, active nav
assets/              favicon, share image (og-image.png), app icon
404.html, robots.txt, sitemap.xml, site.webmanifest
tests/check_site.py   pre-deploy checks
.github/workflows/pages.yml   deploys to GitHub Pages
```

No build step and no dependencies. Open `index.html` in a browser or run `python3 -m http.server`.

## Publishing (automated)

Publishing is automatic. Every push to `main` runs `.github/workflows/pages.yml`, which:

1. runs `python3 tests/check_site.py` (broken links and anchors, missing files, SEO basics),
2. deploys the repo root to GitHub Pages.

Pull requests into `main` run the same checks but do not deploy. Live site: https://sukonik.github.io/lbbikeclub/

One-time setup: **Settings > Pages > Source: GitHub Actions**. To redeploy manually, use **Actions > Deploy GitHub Pages > Run workflow**.

Workflow: edit on a branch, open a PR, merge it, and the site updates in about a minute. Run the checks locally with `python3 tests/check_site.py`.

## Editing content

- Partners live in the `#partners` section; add a card per partner. Towns live in `#locations`.
- Ride times are intentionally not listed. They live in the Facebook group. Add a schedule in the `#rides` section of `index.html` when you have one.
- Add a custom domain by creating a `CNAME` file in the repo root.
