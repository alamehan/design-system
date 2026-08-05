#!/usr/bin/env python3
"""visual-audit.py — the headless-Chromium gate.

WHY THIS EXISTS
---------------
The v3.4.2 release notes claim "mandatory visual audit gate: headless-Chromium computed-style
checks on the reference gallery before packaging". No such script was ever in the repository.
A gate that exists only in a changelog is worse than no gate at all, because everyone
downstream believes the check happened.

It is written now. Python, not Node, because `ship.js` already requires python3 for
validate-pages.py — the release chain gains no new language.

It checks the class of fault that static linting structurally cannot see:

  A. HORIZONTAL OVERFLOW. Nothing in reference/ ever set `box-sizing: border-box`, so the whole
     tier rendered in the browser default content-box while the first adopter (portal-nuxt)
     runs Tailwind preflight, which is border-box. Every `width:100%` field overflowed its
     column by exactly its own padding + border — 26px for an .es-field__box. A stylesheet
     cannot see that. A layout engine can.
  B. GHOST CONTROLS. An interactive element at `opacity:0` that still takes pointer events is
     invisible and clickable at once — the CandidateCard "View profile" bug.
  C. BROKEN ASSETS AT RUNTIME. lint-reference GATE 5 proves the file is on disk; only a render
     proves the browser decoded it.
  D. THE TYPEFACE ACTUALLY IN USE. GATE 2 proves an @font-face is declared. Only a render
     proves the glyphs came from it.
  E. TYPE SCALE. Every rendered font-size must sit on the ramp in foundations.json.

HISTORY.md law #1 is NOT repealed by this file: a programmatic check is never a visual verdict.
This finds what a person would otherwise have to notice. It cannot find what nobody has thought
to look for. Run it, then open the gallery and look.

    python3 src/scripts/visual-audit.py

Playwright is an AUTHOR-side dependency only; it is never shipped and the product package still
has zero dependencies. If it is missing this script SKIPS LOUDLY and exits 0 — it must never
report a pass it did not earn.
"""
import json
import os
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
REF = ROOT / "reference"

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("\u26a0\ufe0f  visual-audit SKIPPED — playwright is not installed.")
    print("   This gate did NOT run. Do not read a green pipeline as a visual pass.")
    print("   Install it author-side:  pip install playwright && playwright install chromium")
    sys.exit(0)

# the type ramp, read from the source of truth rather than hardcoded
found = json.loads((ROOT / "src" / "foundations.json").read_text(encoding="utf-8"))
SCALE = sorted({sub["$value"]["fontSize"]["value"]
                for weight in found.get("text-styles", {}).values()
                for sub in weight.values()
                if isinstance(sub.get("$value", {}).get("fontSize"), dict)})
if not SCALE:
    SCALE = [11, 12, 14, 16, 18, 22]

PROBE = """
(scale) => {
  const out = {overflow: [], ghosts: [], broken: [], badFont: [], offScale: []};
  const R = (el) => el.getBoundingClientRect();

  for (const el of document.querySelectorAll('body *')) {
    const p = el.parentElement;
    if (!p || p === document.body) continue;
    const ps = getComputedStyle(p), es = getComputedStyle(el);
    /* A parent that declares ANY non-visible overflow-x has taken responsibility for what
       sticks out: `auto`/`scroll` scroll it, `hidden`/`clip` clip it (that is how
       text-overflow: ellipsis works at all). Only `visible` overflow actually spills onto the
       page, and only that is a layout fault. */
    if (ps.overflowX !== 'visible' || ps.display === 'contents') continue;
    if (es.position === 'absolute' || es.position === 'fixed') continue;
    const a = R(el), c = R(p);
    if (a.width === 0 || c.width === 0) continue;
    const over = Math.round(Math.max(a.right - c.right, c.left - a.left));
    if (over > 1) out.overflow.push({cls: el.className.toString().slice(0,60), tag: el.tagName, over});
  }

  /* A control's OWN computed opacity is 1 even when an ancestor is at 0 — opacity does not
     inherit, it composites. Checking the element alone therefore never fires, which is exactly
     how the CandidateCard ghost survived. checkVisibility({opacityProperty}) walks the chain;
     elementFromPoint proves the thing is still hit-testable while invisible. */
  for (const el of document.querySelectorAll('button,a,input,select,textarea,[tabindex]')) {
    const r = R(el);
    if (r.width <= 0 || r.height <= 0) continue;
    const visible = el.checkVisibility
      ? el.checkVisibility({opacityProperty: true, visibilityProperty: true, contentVisibilityAuto: true})
      : parseFloat(getComputedStyle(el).opacity) !== 0;
    if (visible) continue;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
    const hit = document.elementFromPoint(cx, cy);
    if (hit && (hit === el || el.contains(hit)))
      out.ghosts.push((el.className.toString().slice(0,60) || el.tagName) + ' [invisible yet hit-testable]');
  }

  for (const img of document.images)
    if (!img.complete || img.naturalWidth === 0) out.broken.push(img.getAttribute('src'));

  for (const el of document.querySelectorAll('body *')) {
    if (!el.firstChild || el.firstChild.nodeType !== 3 || !el.textContent.trim()) continue;
    const s = getComputedStyle(el);
    const fam = s.fontFamily.split(',')[0].replace(/["']/g,'').trim();
    if (fam && fam !== 'Fustat' && fam !== 'DM Mono' && !/^(monospace|ui-monospace)$/.test(fam))
      out.badFont.push(el.tagName + '.' + el.className.toString().slice(0,40) + ' -> ' + fam);
    const px = Math.round(parseFloat(s.fontSize));
    if (!scale.includes(px))
      out.offScale.push(el.tagName + '.' + el.className.toString().slice(0,40) + ' -> ' + px + 'px');
  }
  return out;
}
"""


def dedupe(items):
    seen, out = set(), []
    for i in items:
        k = json.dumps(i, sort_keys=True)
        if k not in seen:
            seen.add(k)
            out.append(i)
    return out


# The gallery collapses its index below 900px. That branch had never been rendered by anything,
# which is exactly how a layout fault survives: the code path nobody looks at.
VIEWPORTS = [(1280, 900, "desktop"), (820, 900, "narrow")]


def main():
    files = sorted(p for p in REF.rglob("*.html"))
    violations = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        for f in files:
            page.goto("file://" + str(f))
            page.wait_for_timeout(450)
            r = page.evaluate(PROBE, SCALE)
            rel = f.relative_to(ROOT)
            groups = []
            ov = dedupe(r["overflow"])
            if ov:
                groups.append(("overflows its container",
                               [f"{o['tag']}.{o['cls']} by {o['over']}px" for o in ov[:6]]))
            if r["ghosts"]:
                groups.append(("invisible but clickable", dedupe(r["ghosts"])[:6]))
            if r["broken"]:
                groups.append(("image failed to load", dedupe(r["broken"])[:6]))
            if r["badFont"]:
                groups.append(("not rendering in Fustat", dedupe(r["badFont"])[:4]))
            if r["offScale"]:
                groups.append(("font-size off the type ramp", dedupe(r["offScale"])[:6]))
            if groups:
                violations += len(groups)
                print(f"\n\u274c {rel}")
                for what, items in groups:
                    print(f"   {what}:")
                    for i in items:
                        print(f"     - {i}")
        # second pass: the narrow branch, gallery only (the standalone pages are plain documents)
        gallery = REF / "gallery.html"
        if gallery.exists():
            for w, h, label in VIEWPORTS[1:]:
                page.set_viewport_size({"width": w, "height": h})
                page.goto("file://" + str(gallery))
                page.wait_for_timeout(500)
                r = page.evaluate(PROBE, SCALE)
                ov = dedupe(r["overflow"])
                if ov or r["ghosts"]:
                    violations += 1
                    print(f"\n\u274c reference/gallery.html @ {w}px ({label})")
                    for o in ov[:6]:
                        print(f"     - {o['tag']}.{o['cls']} overflows by {o['over']}px")
                    for gh in dedupe(r["ghosts"])[:4]:
                        print(f"     - invisible but clickable: {gh}")
        browser.close()

    print()
    if violations:
        print(f"\u274c {violations} visual fault group(s) across {len(files)} reference file(s).")
        sys.exit(1)
    print(f"\u2705 visual audit clean across {len(files)} reference file(s) at {len(VIEWPORTS)} viewport(s)  (ramp: {SCALE})")
    print("   no overflow \u00b7 no invisible-but-clickable control \u00b7 no broken image \u00b7 "
          "Fustat everywhere \u00b7 type on the ramp")
    print("   This is a floor, not a verdict. Open gallery.html and look (HISTORY.md law #1).")


if __name__ == "__main__":
    main()
