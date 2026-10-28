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
index.html            single-page site (About / Rides / Community / Join)
css/site.css          all styles
js/main.js            drawer nav, scroll reveal, count-up, active nav
assets/favicon.svg
.github/workflows/pages.yml   deploys to GitHub Pages
```

No build step and no dependencies. Open `index.html` in a browser or run `python3 -m http.server`.

## Publishing to GitHub Pages

The workflow deploys the repo root with GitHub Actions on every push to `main` or `gh-pages`.

1. Merge this branch into `main` (or move it to `gh-pages`).
2. In the repo go to **Settings > Pages** and set **Source** to **GitHub Actions**.
3. The site publishes at `https://sukonik.github.io/lbbikeclub/`. All paths are relative, so it works under that subpath.

## Editing content

- Ride times are intentionally not listed. They live in the Facebook group. Add a schedule in the `#rides` section of `index.html` when you have one.
- Add a custom domain by creating a `CNAME` file in the repo root.
