#!/usr/bin/env python3
"""Refresh the club's Instagram follower and Facebook group member counts.

  python3 scripts/update_stats.py                                     # read what is public
  python3 scripts/update_stats.py --instagram 80 --facebook 150       # enter numbers by hand

Updates data/stats.json (dated history) and the fallback numbers in index.html.
Instagram's public embed page lists followers, so that is read automatically.
Facebook hides a private group's member count behind a login, so it is entered by hand;
until then the last known number is carried forward and labelled with its date.

Exit codes: 0 everything current, 3 nothing could be read, 4 Instagram updated but the
Facebook members number needs to be entered by hand.
"""
import argparse, json, re, sys, urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATS = ROOT / "data" / "stats.json"
INDEX = ROOT / "index.html"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
MAX_HISTORY = 156  # three years of weekly entries


def read_instagram(handle):
    """Followers from the public embed page, or None if it cannot be read."""
    try:
        req = urllib.request.Request(f"https://www.instagram.com/{handle}/embed/", headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception:
        return None
    m = re.search(r'followers_count\\*"\s*:\s*(\d+)', html) or re.search(r'edge_followed_by\\*"\s*:\s*\{\\*"count\\*"\s*:\s*(\d+)', html)
    return int(m.group(1)) if m else None


def set_stat(html, name, value):
    """Update a <span data-stat="name" data-count="N">N</span> fallback in index.html."""
    pat = re.compile(r'(data-stat="%s"[^>]*?data-count=")\d+(">)\d+(<)' % re.escape(name))
    return pat.sub(lambda m: f"{m.group(1)}{value}{m.group(2)}{value}{m.group(3)}", html)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--instagram", type=int, help="Instagram followers")
    ap.add_argument("--facebook", type=int, help="Facebook group members")
    ap.add_argument("--date", default=date.today().isoformat())
    a = ap.parse_args()

    data = json.loads(STATS.read_text())
    last = data["history"][-1]
    ig, fb = a.instagram, a.facebook
    if ig is None:
        ig = read_instagram(data["instagram"]["handle"])
    ig_read = ig is not None
    ig = ig if ig is not None else last["instagram_followers"]
    fb_entered = fb is not None
    fb = fb if fb_entered else last["facebook_members"]

    changed = (ig != last["instagram_followers"]) or (fb != last["facebook_members"]) or (fb_entered and data["facebook"].get("as_of") != a.date)
    if changed:
        entry = {"date": a.date, "instagram_followers": ig, "facebook_members": fb}
        hist = [h for h in data["history"] if h["date"] != a.date] + [entry]
        hist.sort(key=lambda h: h["date"])
        data["history"] = hist[-MAX_HISTORY:]
        data["updated"] = a.date
        data["instagram"]["followers"] = ig
        data["facebook"]["members"] = fb
        if fb_entered:
            data["facebook"]["as_of"] = a.date
        STATS.write_text(json.dumps(data, indent=2) + "\n")
        html = INDEX.read_text()
        for name, val in (("ig-followers", ig), ("fb-members", fb)):
            html = set_stat(html, name, val)
        html = re.sub(r'(data-stat-updated>)[^<]*(<)', lambda m: f"{m.group(1)}Updated {a.date}{m.group(2)}", html)
        INDEX.write_text(html)
        print(f"Updated {a.date}: Instagram {last['instagram_followers']} -> {ig}, Facebook {last['facebook_members']} -> {fb}")
    else:
        print("Counts unchanged.")

    if not (ig_read or a.instagram is not None or fb_entered):
        print("Could not read the Instagram count either. Nothing changed.")
        return 3
    if not fb_entered:
        print(f"Facebook members need to be entered by hand (last known {fb}, as of {data['facebook'].get('as_of')}).")
        return 4
    return 0


if __name__ == "__main__":
    sys.exit(main())
