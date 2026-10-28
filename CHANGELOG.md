# Changelog

## 1.2.1 (2026-10-28)
- UI sweep across 2 pages x 6 widths x 8 themes: no overflow, clipping or contrast issues found.
- Tap targets: nav links, unit toggle and heading toggle are now at least 44 px tall; the heading toggle is a 4x2 grid so each button is wide enough on phones.
- Added `tests/ui_sweep.js` and run it in the pull-request QA workflow.

## 1.2.0 (2026-10-28)
- New wheel mark: a flat, bright 2D wheel with just the rim, crossing spokes and a hub. No tire or outer line. Bright white with a slight theme tint (16%). Used as the logo, hero wheel, favicon and app icons.
- Larger logo in the header and drawer; hover spin.
- Favicon is a bolder 12-spoke variant that reads at 16 px, with the same slight theme tint.
- Mobile polish: menu icon and theme orb centered, consistent circular icon buttons, optically centered button and toggle labels, full-width button rows on phones, fits at 320 px.
- Hero readouts moved below the wheel so they no longer overlap it.

## 1.1.0 (2026-10-28)
- Pearlescent theme system with a switcher: Giant (Black, default), Trek (Red), Specialized (Silver), Canyon (Green), Scott (Orange), Cervélo (Yellow), Cannondale (Blue), Bianchi (Purple). Saved per visitor.
- New themed header and right-side drawer (menu, theme picker, links).
- Live weather chip in the header (temperature, wind, ride score).
- New Ride Weather page: ride score gauge, wind compass with headwind/crosswind, bike-computer tiles, best two-hour window, 24-hour and 7-day outlook, what to wear, lights and daylight. Eight ride areas, °F/mph or °C/km/h.
- Removed the scrolling text bar; tightened copy; smoother motion and spacing.
- Added browser QA (pages x widths, drawer, themes, weather) and a QA workflow for pull requests.

## 1.0.0 (2026-10-28)
- First public release: Home, About, Social Media, Partners, Locations; automated GitHub Pages deploy with pre-deploy checks; 404, sitemap, robots, manifest, share image.

## pre-1.0 drafts (2026-10-28)
- Draft 3 (`5c2d27d`): main-only automated deploy with pre-deploy checks; 404, sitemap, robots, manifest, share image, structured data.
- Draft 2 (`1fba65c`): Social Media, Partners and Locations sections; navigation restructure.
- Draft 1 (`a25829e`): first single-page Y2K chrome site with spinning wheel.
