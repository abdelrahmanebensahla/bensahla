# Portfolio — Abdelrahmane Bensahla

Static implementation of the `Portfolio.dc.html` design from the
[Claude Design project](https://claude.ai/design/p/7a55c814-e9e8-4b5d-af8f-0ba39da3ad83).
No build step, no dependencies — open `index.html` or serve the folder.

```bash
python -m http.server 8000
```

## Files

| File | What it holds |
| --- | --- |
| `index.html` | All content: index rows and the three case-study panels |
| `styles.css` | Design tokens, both layout states, all transitions |
| `app.js` | Progressive enhancement only (Escape to close, scroll landing) |
| `assets/` | Images |

## How the two states work

The page has one piece of state: whether a case study is open. That state
is the URL fragment, so `#jc`, `#net`, and `#sahl` are real deep links and
the back button works.

Everything that differs between "home" (index of work) and "detail"
(case study beside a collapsed rail) is a CSS custom property on `body`,
flipped by `body:has(.panel:target)`. Because the properties that consume
those variables are transitionable, the rail collapse, title resize, and
blurb fold animate for free — and the whole thing works with JavaScript
disabled. `app.js` only adds the Escape shortcut and the design's
scroll-to-`#work` landing.

This relies on `:has()` and `:target`.

## Responsive behaviour

| Breakpoint | What changes |
| --- | --- |
| `≤ 900px` | Shell drops to one column — the rail stacks above the panel and stops being sticky. Panels grow a `← All work` link. |
| `≤ 700px` | Index rows go two-column (title + year) with the blurb wrapping beneath. Masthead puts the name on its own line. Panel insets drop 30px → 18px, topology labels sit above their nodes, body type steps down one size. Small mono links get a 44px touch target. |
| `≤ 420px` | Page gutter 22px → 18px, panel titles 34px → 30px, image slots 230px → 200px tall. |
| `height ≤ 660px` | Landscape phones: index blurbs collapse (from the design) and their column collapses with them. |
| `height ≤ 500px` + landscape | Masthead and intro shed vertical padding. |

Verified with no horizontal overflow in all four routes at 320, 375, 414,
768, 812×375, 1440, and 1920 wide.

Two things phones need that the design file did not have to solve:

- **A way back.** On a stacked layout the rail — and its Close link —
  scrolls off above the panel, and there is no Escape key. Each panel
  carries a `← All work` link, shown only under 900px.
- **Where a tap lands.** `app.js` scrolls to the panel on stacked
  layouts instead of to `#work`; landing on `#work` there would put the
  collapsed index between you and the case study you just tapped.

## Motion

Everything that starts an element hidden is scoped to a `.motion` class
that an inline script in `<head>` adds only when JS is on **and** the
reader has not asked for reduced motion. With no script, or with reduced
motion, none of those rules apply — nothing is ever hidden waiting for a
script that will not arrive.

| | What it does |
| --- | --- |
| **Arrival** | Masthead, hero, index rows and footer rise 8px into place, staggered 0 → 500ms. The two hairline rules wipe in from the left. Runs once — `.entered` lands at 1300ms so returning home does not replay it. |
| **Section reveal** | Each `.panel-section` fades up 8px as it enters view, via IntersectionObserver, once each. |
| **Pipeline** | The Job Cannon diagram builds itself: node lands, its connector draws downward, the edge label fades in, then the next step — 320ms apart, triggered when its section is revealed. |
| **Panel exit** | Closing plays `panelOut` on the panel *before* the hash flips, so it leaves under its own power instead of being switched off. |
| **Index rows** | The accent mark grows from the top edge on hover (dim amber) and stays at full accent when open; the title nudges 3px right. |
| **Mono links** | An amber rule wipes in from the left on hover and keyboard focus. |
| **Deep links** | Landing directly on `/#jc` skips the entrance — there is nothing to slide in from. Cleared on the first hashchange. |

Two details worth knowing if you edit this:

- `EXIT_MS` in `app.js` must match the `panelOut` duration in
  `styles.css`. The close waits on `animationend` and falls back to that
  timer.
- The deep-link suppression is scoped per panel
  (`[data-deep-link="jc"] #jc:target`). A broader
  `[data-deep-link] .panel:target` also mutes the *next* panel you open,
  because the attribute is not cleared until hashchange fires.

## Adding an image later

Every empty slot and "add link" stub has been removed — the page shows
only real assets. To add one back, put a `<figure class="shot">` where
you want it:

```html
<figure class="shot shot--16x10"><img src="assets/thing.png" alt="…" loading="lazy"></figure>
```

Size it with `shot--16x10`, `shot--16x9`, `shot--fixed` (230px) or
`shot--tall` (240px). Add `shot--contain` when the whole frame matters
more than filling it — otherwise it covers, anchored top-centre. Inside
a `.shot-pair` a lone figure holds a 480px column rather than stretching.

For a link, copy the live chip pattern:

```html
<a href="https://…" class="chip chip--live" target="_blank" rel="noopener">label ↗</a>
```

## Deviations from the design file

Two, both deliberate:

1. **Detail-mode row gutter.** The design keeps a `clamp(24px, 4vw, 56px)`
   column gap while collapsing the blurb column to `0px`, which charges
   that gutter twice inside a 280px rail and leaves ~62px for the project
   title. The gutter drops to `12px` in detail mode instead.
2. **Everything under "Responsive behaviour" above.** The design only
   adapts the shell columns at 900px; the rest of the page was laid out
   for a wide canvas.
3. **Blurb collapse on short viewports.** The design used
   `display: none`, which let the year reflow up into the blurb's grid
   track and stranded it mid-row. The blurb now collapses to zero height
   and its column collapses with it, so the year stays at the right edge.
