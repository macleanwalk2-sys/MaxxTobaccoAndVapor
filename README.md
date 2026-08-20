# Maxx Tobacco & Vapor — website demo

A single-page home screen demo for the Maxx Tobacco & Vapor stores around Raleigh.
Static HTML, CSS and vanilla JS — no build step, no dependencies. Open `index.html`
in a browser and it runs.

```
index.html
assets/
  css/styles.css     design tokens + all section styles
  js/main.js         age gate, nav, filter, form, reveals
  img/*.svg          placeholder logo + category icons
```

To preview with a local server (needed only if you add a background video):

```sh
python3 -m http.server 8000    # then open http://localhost:8000
```

---

## What's on the page

1. **Header** — sticky, with nav, phone and a "Find a Store" button. Collapses to a
   hamburger under 860px.
2. **Hero** — intro headline, lede and two CTAs, over a CSS-built backdrop.
3. **Ticker** — scrolling red category strip.
4. **Products** — six category tiles.
5. **Locations** — nine store cards, a working text filter, and the "find nearest" button.
6. **About + Contact** — short about copy beside a contact form.
7. **Footer** — nav columns, 21+ policy, nicotine warning.
8. **Age gate** — 21+ confirmation on first visit (standard for tobacco retail).

---

## Placeholders — what to swap before this goes live

### 🔴 Logo
`assets/img/logo-mark.svg` (and the matching `favicon.svg`) is a **stand-in** built
from the brand's white/red/blue palette — a white "M" on a blue badge over a red bar.
Replace both files with the real artwork. The wordmark next to it is HTML text in
`index.html` (`.brand__name` / `.brand__sub`), so it restyles in CSS rather than
needing new image assets.

### 🔴 Category images
The six SVGs (`assets/img/cat-*.svg`) are placeholder line icons. Each tile's
`.cat__art` panel is a fixed 16:11 box, so a real product photo drops straight in:

```html
<span class="cat__art"><img src="assets/img/disposables.jpg" alt="Disposable vapes"></span>
```

Then add `.cat__art img{width:100%;height:100%;object-fit:cover}` to override the
icon sizing.

### 🔴 Category links
Every tile is `<a href="#" data-category="...">`. Point `href` at the real category
page and delete the click handler in `main.js` (the block under
*"Product categories (placeholders)"*) — the toast is only there so the demo
does something when clicked.

### 🔴 "Find nearest location"
A placeholder. It shows a brief loading state, then a toast. To make it real you need
lat/lng for each store, then sort the cards by distance from
`navigator.geolocation.getCurrentPosition()`. There's a comment in `main.js` marking
the spot. The **text filter next to it already works** — it's not a placeholder.

### 🔴 Contact form
Not connected to anything. The `<form>` carries `data-demo`, which short-circuits
submission and fakes a success state. To go live: set an `action` (Formspree,
Netlify Forms, or your own endpoint) and remove `data-demo`.

### 🔴 Background video
The hero is built to take one. In `index.html` uncomment the `<video class="hero__video">`
block near the top of `<section class="hero">` and add your files under `assets/video/`.
The scrim and glow layers already sit above it, so text stays readable. Keep the CSS
backdrop underneath as the fallback for slow connections.

### ⚠️ Store data — verify before launch
The nine addresses and phone numbers came from **public map listings** (Yelp, Apple
Maps, Waze, Facebook), not from the business. Confirm every row with the owner —
and ask whether there are more stores, since some listings suggest a larger footprint
than the nine shown here.

Hours are deliberately left off the cards rather than guessed; the note under the grid
tells visitors to call. Add real hours when you have them.

---

## Notes

- **Fonts** — Archivo (display) and Inter (body) load from Google Fonts. Both have
  system fallbacks, so the page still looks right if the request fails. For production,
  consider self-hosting to drop the third-party request.
- **Accessibility** — skip link, focus rings, labelled form fields, focus trap on the
  age gate, and `prefers-reduced-motion` honoured (the ticker and reveals stop).
- **No-JS** — all content is in the HTML. Reveal animations only engage once JS
  confirms it's running, so nothing stays invisible if the script fails.
- The footer says "Demo site — not an official web property." Remove that line when
  the site becomes official.
