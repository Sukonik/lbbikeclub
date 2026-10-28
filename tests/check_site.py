#!/usr/bin/env python3
"""Static integrity checks run before every Pages deploy."""
import re, sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
errors = []

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids = set(); self.refs = []; self.imgs = []
    def handle_starttag(self, tag, a):
        a = dict(a)
        if "id" in a: self.ids.add(a["id"])
        for k in ("href", "src"):
            if k in a: self.refs.append(a[k])
        if tag == "img" and "alt" not in a: self.imgs.append(a.get("src"))

for page in ("index.html", "404.html"):
    p = P(); p.feed((ROOT / page).read_text())
    if p.imgs: errors.append(f"{page}: img without alt: {p.imgs}")
    for r in p.refs:
        if re.match(r"(https?:|mailto:|tel:|data:)", r): continue
        if r.startswith("#"):
            if r[1:] and r[1:] not in p.ids: errors.append(f"{page}: missing anchor {r}")
        elif r.startswith("/"):
            continue  # root-relative (404 page) resolved at the host
        else:
            if not (ROOT / r.split("#")[0].split("?")[0]).exists(): errors.append(f"{page}: missing file {r}")

html = (ROOT / "index.html").read_text()
for needle in ('<title>', 'name="description"', 'rel="canonical"', 'application/ld+json'):
    if needle not in html: errors.append(f"index.html: missing {needle}")
for f in ("robots.txt", "sitemap.xml", "site.webmanifest", ".nojekyll", "assets/og-image.png"):
    if not (ROOT / f).exists(): errors.append(f"missing {f}")

if errors:
    print("\n".join(errors)); sys.exit(1)
print("site checks passed")
