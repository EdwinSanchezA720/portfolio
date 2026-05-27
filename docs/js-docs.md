# JavaScript documentation

Scripts live in [`../js/`](../js/):

- [`animations.js`](../js/animations.js): scroll-driven reveal animations.
- [`main.js`](../js/main.js): partial loading, navigation UX, and contact form handling.

## Modular HTML partials

`index.html` contains **empty containers** (for example `#site-navbar`). On `DOMContentLoaded`, `main.js` sequentially loads:

1. `navbar.html`
2. `hero.html`
3. `about.html`
4. `projects.html`
5. `skills.html`
6. `contact.html`

Implementation detail: `loadComponent(selector, fileName)` uses `fetch()` against `./components/<file>`.

### Local development requirement

Browsers commonly block `fetch()` for `file://` pages. Use a **static local server** (for example VS Code **Live Server**) or deploy over **HTTPS** (GitHub Pages, Netlify, etc.).

If loading fails, `main.js` renders a small inline error panel in the affected container explaining the `file://` limitation.

## `initScrollAnimations()` (`animations.js`)

After all partials are injected, `main.js` calls:

```js
window.initScrollAnimations();
```

Behavior:

- Finds `.reveal` elements and toggles `.reveal-visible` when they intersect the viewport.
- Unobserves elements after they reveal once (cheap + stable).
- If `prefers-reduced-motion: reduce` is enabled, it immediately adds `.reveal-visible` to all `.reveal` elements.

## Navigation UX (`main.js`)

### Smooth in-page navigation

Click listeners intercept `a[href^="#"]` links (unmodified left clicks only) and call `scrollIntoView({ behavior: "smooth" })`.

### Active navbar state

`IntersectionObserver` watches `#hero`, `#about`, `#projects`, `#skills`, `#contact` and toggles `.active` on `.nav-pill[data-nav-target=...]` links.

On boot, `setActiveNav("hero")` runs once so the Home pill starts active.

### Mobile menu

After navigation, if Bootstrap’s `#primaryNav` collapse is open, `main.js` attempts to hide it via `bootstrap.Collapse`.

## Contact form (`main.js`)

The form is **front-end only**:

- Uses Bootstrap’s `needs-validation` / `was-validated` pattern.
- Prevents default submit, runs `checkValidity()`, shows a short demo message, then resets.

To make it “real”, replace the submit handler with EmailJS, Formspree, or your API client.

## Script order in `index.html`

Load order matters:

1. Bootstrap bundle (DOM APIs used by the navbar)
2. `animations.js` (defines `initScrollAnimations`)
3. `main.js` (loads partials, then calls `initScrollAnimations()`)

Both app scripts use `defer` so they execute after HTML parsing, in document order.
