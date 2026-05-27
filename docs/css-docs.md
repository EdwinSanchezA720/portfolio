# CSS documentation

This portfolio splits styles into two layers:

- [`../css/styles.css`](../css/styles.css): **design tokens**, typography, global behavior, Bootstrap overrides, and the base `.reveal` animation state.
- [`../css/components.css`](../css/components.css): **section UI** (navbar glass effect, hero pattern, cards, forms).

## Design tokens (`:root`)

| Token | Purpose |
|------|---------|
| `--bg-deep-slate` | Page background (`#0f172a`) |
| `--surface-navy` | Cards / elevated surfaces (`#1e293b`) |
| `--accent-indigo` | Primary accent (`#6366f1`) |
| `--accent-cyan` | Secondary accent (`#38bdf8`) |
| `--text-primary` | High-contrast body text (`#f8fafc`) |
| `--text-muted` | Secondary text (`#94a3b8`) |
| `--radius-card` | Shared corner radius for cards/buttons (`12px`) |
| `--nav-height` | Navbar layout + scroll offset tuning (`4.5rem`) |

## Typography

- **Sans (default):** Inter — applied on `body.site-body` and headings.
- **Mono accents:** Fira Code — use `.font-mono` or `.badge-tech` for “developer” emphasis.

## Bootstrap integration

Bootstrap 5 is loaded for **grid + utilities**. Colors are **not** meant to come from Bootstrap defaults:

- `styles.css` maps key Bootstrap CSS variables under `[data-bs-theme="dark"]`.
- Primary buttons use a custom gradient + hover glow via `.btn-primary` overrides.

## Scroll + anchors

- `html { scroll-behavior: smooth; scroll-padding-top: ... }` keeps anchor jumps clear of the fixed navbar.
- Sections expose `id` anchors (`#hero`, `#about`, …) and also set `scroll-margin-top` in `components.css` as a secondary alignment aid.

## Motion accessibility

`prefers-reduced-motion: reduce` disables smooth scrolling, hero pattern drift, hover lifts where relevant, and forces `.reveal` elements visible without transitions.

## Changing the theme quickly

1. Adjust the hex values in `:root` inside `styles.css`.
2. If you change navbar height, update `--nav-height` and verify the `rootMargin` string in `main.js` still feels right for “active section” highlighting.
