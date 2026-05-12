# Handoff: Sigma Connect — Hospital Ordering

## Overview

Sigma Connect is an internal ordering platform for Sigma Pharmaceuticals' hospital channel. Customer-service representatives at Sigma place orders **on behalf of** hospital pharmacy clients, then those orders are routed into SAP for fulfilment.

This handoff covers the **Hospital order type** only. Bulk Order and NRT are separate workstreams.

## About the Design Files

The files in this bundle are **design references created in HTML/React (via inline Babel)** — prototypes showing intended look and behaviour. They are **not production code to copy directly.**

The task is to **recreate these designs in the target codebase's existing environment** (React + your design system, Vue, etc.), using established patterns, component library, and routing. If no environment exists yet, choose the framework that best matches the team's expertise — the design is straightforward React + CSS and ports cleanly.

## Fidelity

**Hi-fi greyscale wireframe.** Pixel-level fidelity on type, spacing, layout, density, and component anatomy. Strict greyscale palette by design — only **three functional accents** (in-stock / low / out-of-stock dots) and **one warning tint** (below-MSP). Reproduce the visual hierarchy as-is; do not introduce additional colour.

If your codebase has an existing greyscale or neutral design system, prefer mapping these tokens onto it rather than literally copying the hex values. The named role of each token matters more than the exact shade.

---

## Screens / Views

### 1. Orders Landing (`screen-landing.jsx` → `OrdersLanding`)

**Purpose:** List submitted, on-hold, and draft orders across the rep's full client portfolio. Entry point for starting a new order.

**Layout (1440 design width, 32px page padding):**
- Page header row: title "Orders" + sub-text on the left, `Export` and primary `New order` buttons on the right
- 4-tile KPI strip below header (`Awaiting submission`, `Submitted today`, `Held for review`, `MoM order volume`) — each is a `.panel` 14×18 padded, with `.label` cap text, large 24px bold value, optional warning icon, muted sub-text
- Main panel with a sticky toolbar containing:
  - Left: segmented control with tabs `All / Submitted / Drafts / On hold`, each showing a count
  - Right: 320px search input, 220px client filter `<select>`, `Filters` button
- Orders table — sortable columns: Order (ID + reference), Client (name + code · region), Type (badge), Placed (mono timestamp), Lines (right-aligned mono), Total (right-aligned bold mono), Status (badge), Actions
- Pagination bar at bottom of table

**Behaviour:**
- Clicking a row opens the order. Drafts route to the Build screen pre-populated; submitted orders open a read-only detail view (currently stubbed — see "Open work" below).
- The client filter is independent of the persistent client-context chip in the header. The chip represents the *current scope* a rep is acting under; the filter is just a list view.

---

### 2. New Order Modal (`screen-neworder.jsx` → `NewOrderModal`)

**Purpose:** Two-step ceremony before building an order — choose client, then choose order type.

**Layout:** Modal, 760px wide, max-height `calc(100vh - 48px)`. Three sections:
- Head: label + h2 title, close button, 3-step stepper (`Select client`, `Order type`, `Build order`)
- Body: step content (scrollable)
- Foot: muted hint on the left, `Cancel`/`Back` and primary `Continue`/`Start order` on the right

**Step 1 — Select client:**
- Search input (auto-focused) above a scrollable list (max-height 320px) of clients. Each row: 36×36 building-icon tile, name + meta line (code · region · trust group), terms on the right, check mark when selected. Selected row gets `is-selected` background tint.

**Step 2 — Order type:**
- Vertical stack of `.option` cards. Each: radio dot, title, description. Disabled cards (Bulk Order, NRT) have `is-disabled` opacity and a "Coming soon" lock badge.

---

### 3. Build Order (`screen-build.jsx` → `BuildOrder`)

**Purpose:** The work happens here. User searches the catalogue, adds lines, edits prices and quantities, sets order-level metadata, and submits.

**Two layouts** (controlled by tweak `catalogueLayout`):

#### A. Split view (default)
- 1600px max width, `grid-template-columns: 1fr 420px`
- Catalogue on the left, sticky basket panel on the right (`top: calc(header + 24px)`, `max-height: calc(100vh - header - 48px)`)
- Basket scrolls independently of the catalogue
- Submit button sits in the basket footer

#### B. Stepped
- Single-column. Three sub-steps with a top stepper:
  1. Add products (catalogue only, with a sticky "Review N items" CTA)
  2. Review basket (full-width basket panel)
  3. Shipping & submit (review summary with KV pairs)

**Catalogue panel (`CataloguePanel`):**
- Sticky header: 40px search input ("Search by product name, SKU or category…") + Advanced button; below it, wrapping row of category chips and stock/DT filter chips
- Custom grid header with columns: `[42 type] [name] [pack] [stock] [unit price right] [action right]` — sticky `top: 0`
- Each row (`.cat-row`):
  - 32×32 type tile showing form code (CAP, TAB, SUS, INH, NEB)
  - Name (one-line ellipsis) + sub line "SKU · category" with optional CD / DT badges
  - Pack in monospace
  - Stock dot + tabular monospace count
  - Unit price right-aligned, with strikethrough MSP if a promo price exists
  - Action: `Add` button OR a quantity stepper if already in basket
  - Out-of-stock rows are 55% opacity with disabled Add
  - In-basket rows tinted `#f6f6f3`
- Footer bar: "Showing X–Y of Z products (of 3,475 catalogue)" + pagination

**Basket panel (`BasketPanel`):**
- Header: "Order basket" + line/unit count, `Clear` ghost button when non-empty
- Empty state: package icon + "Your basket is empty"
- Line items (`BasketLine`):
  - Row 1: name + SKU/pack on the left, line total in mono right
  - Meta row: MSP / Promo / Unit prices + percentage discount vs MSP (green if positive discount, amber if below MSP)
  - Action row: quantity stepper, editable unit price (with `£` prefix), edit-note button, delete button
  - **Below-MSP state:** the `.price-edit` input turns amber (border + background `var(--warn-bg)`, text `var(--warn)`) and a `.banner.banner--warn` appears below saying "Price £X.XX is below minimum selling price £Y.YY — requires commercial approval"
  - Expanded note editor: appears under the actions when edit toggled, holds a textarea
  - Collapsed note display: left-border quote style
- Footer (`.basket-foot`):
  - Order description textarea (visible on SAP order header)
  - Shipping agent `<select>` — full list of 5 agents with code + label
  - Manual picking card (bordered surface):
    - Switch with label + sub-text
    - When ON: reason code `<select>` (required) + free-text note (optional)
  - Subtotal / VAT / Order total stack with mono tabular numerals
  - Primary submit button — disabled if no lines OR manual pick ON without reason code; shows warn banner explaining why if blocked

**Header:** When inside Build, the AppHeader gets a persistent client chip ("On behalf of: <Client Name>") at the top, anchored next to the user pill.

---

### 4. Order Submitted (`screen-submitted.jsx` → `OrderSubmitted`)

**Purpose:** Confirm submission and surface the SAP order ID.

**Layout:** Centered 720px-max panel. Top: 56px circle with check icon (ok-bg fill), h2 "Order submitted to SAP", muted explainer. Middle (bordered): horizontal KV row showing Order ID (mono), Client, Lines, Total. Footer (muted surface): `Back to orders` and primary `Start another` buttons.

---

## Interactions & Behaviour

- **Routing:** Single-page React app with screen state (`orders | build | submitted`) + modal state (`showNew`). For deep-linking the canvas overview, screens read `window.location.hash` on mount. In production, replace with proper routes.
- **State management:** `useState` for everything in this prototype. Promote to React Query / Redux / Zustand / store of your choice. Key state shapes:
  - `Order = { draftId, clientId, type, status, lines: Line[], description, agent, manualPick: { enabled, reasonCode, note } }`
  - `Line = { sku, name, pack, msp, promo, unit, qty, description, stock, stockState }`
- **Tabs / pagination / filters** are all client-side in the mock. Server-side equivalents need to debounce search and paginate the catalogue (3,475 SKUs).
- **Quantity stepper:** Decrementing below 1 in the basket removes the line. In the catalogue, the Add button flips to a stepper once an item is in the basket.
- **Unit price editing:** Free text, parsed as float, rounded to 2 dp on display. If `unit < msp`, the field flips into warning state and the inline banner shows.
- **Manual picking:** Order-level only. When toggled on, reason code is required to submit. When toggled off, reason code and note are *not* cleared (so a user can flip back without re-entering).
- **No animations** beyond default browser focus rings and 80ms colour transitions on buttons/inputs.

---

## Design Tokens

All defined as CSS custom properties in `styles.css`.

### Colours

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f4f4f2` | Page background |
| `--surface` | `#ffffff` | Cards, panels, inputs |
| `--surface-2` | `#fafaf9` | Table header, subtle alt rows |
| `--surface-3` | `#f0f0ed` | Hover, chip background, segmented bg |
| `--border` | `#e6e6e2` | Hairline dividers |
| `--border-strong` | `#d3d3ce` | Input borders, chip borders |
| `--ink` | `#1a1a18` | Primary text, primary button bg, header bg |
| `--ink-2` | `#3d3d3a` | Strong secondary text |
| `--ink-3` | `#6b6b66` | Muted text, labels |
| `--ink-4` | `#9a9a93` | Placeholder, very muted |
| `--ink-5` | `#c2c2bb` | Disabled |
| `--ok` | `#2f6b4d` | In-stock dot, success states |
| `--ok-bg` | `#e6efe9` | Submitted/fulfilled badges, success scrim |
| `--warn` | `#8a6a14` | Low stock, below-MSP warning, on-hold |
| `--warn-bg` | `#f4ecd6` | Warn banners, on-hold badges |
| `--bad` | `#8b2f2f` | Out of stock, rejected, danger buttons |
| `--bad-bg` | `#f1e1e1` | Rejected badge, danger hover |

### Typography

- **Sans:** `"Söhne", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif` — substitute with your codebase's primary grotesque if Söhne isn't licensed
- **Mono:** `"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace` — used for SKUs, codes, money, timestamps, IDs

Scale (no explicit token system in CSS — these are the values in use):
- h1: 28px / -0.02em / 600
- h2: 20px / -0.01em / 600
- h3: 16px / 600
- h4 / `.label`: 11px / 0.08em uppercase / 600 / `var(--ink-3)`
- Body: 14px / 1.45
- Small / table cell: 13px
- Micro / table head / `.tiny`: 11–12px
- Tabular numerals: `font-variant-numeric: tabular-nums` is applied via the `.tnum` utility — use it on every column of monetary or count values

### Spacing & radii

- Spacing scale used: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 32, 40, 48, 56 px (utilities `gap-4` … `gap-32` exist in CSS)
- Radii: `--radius-xs 4px`, `--radius-sm 6px`, `--radius-md 8px`. Buttons 6px, panels 8px, modal 12px, chips 999px.
- Shadows: `--shadow-sm` for resting panels, `--shadow-md` for popovers, `--shadow-lg` for modals.

### Layout

- App header height: 56px (sticky, `z-index: 50`)
- Max page content widths: 1440 (default), 1600 (`.page__body--wide` for split-view build)
- Page padding: 32px top, 40px sides, 56px bottom

---

## Components Catalogue

Implemented in `components.jsx` and inline in screen files. Map each to your component library:

| In design | Anatomy | Maps to |
|---|---|---|
| `AppHeader` | Black bar, logo + nav links + persistent client chip + user pill | App shell / navbar |
| `AppFooter` | 4-column grid: brand + legal + resources + support | Footer |
| `Button` (`.btn`) | Variants: default, `--primary` (ink fg/bg), `--ghost`, `--danger-ghost`, `--sm`, `--lg`, `--icon` | Your button primitive |
| `Input` (`.input`) | 36px height, 6px radius, 12px padding, ink focus ring with 3px tinted halo | Text input |
| `Select` (`.select`) | Same as input | Select |
| `Textarea` (`.textarea`) | Multi-line input | Textarea |
| `Seg` (`.seg`) | Segmented control — tabs with a moving pill | Tabs / segmented |
| `Chip` (`.chip`) | Pill, 28px tall, toggleable `active` state inverts to ink | Filter chip |
| `Tbl` (`.tbl`) | Standard table with sticky header, hairline borders, hover row tint | DataTable |
| `StatusBadge` | 22px pill, variant-coloured | Badge |
| `StockDot` | Dot + tabular count | Inline indicator |
| `Qty` / `qty-mini` | Stepper: `−` value `+` | Number stepper |
| `Switch` | Track + thumb, ink when on | Toggle |
| `Modal` | Scrim + centered 760px panel with head/body/foot regions | Dialog |
| `Pager` | Prev / "Page X of Y" / Next | Pagination |
| `Stepper` (`.stepper`) | Numbered horizontal progress | Stepper |
| `Banner` (`.banner`) | Inline alert, `--warn` / `--info` variants | Inline alert |
| `KPI` | Label + big number + sub | Stat card |

---

## Mock Data

`data.js` exposes these on `window` (replace with your data layer):

- `HOSPITAL_CLIENTS` — 6 fictional NHS trusts with code/region/group/payment terms
- `ORDER_TYPES` — `hospital` (live), `bulk` and `nrt` (disabled "Coming soon")
- `SHIPPING_AGENTS` — 5 agents (DPDP-NXT, DHL-MED, RM-T24, OWN-FLT, OWN-FLT-N)
- `MANUAL_PICK_REASONS` — 6 codes (MP-01 … MP-99)
- `CATALOGUE` — 25 fictional UK pharma SKUs with msp/promo/stock/category/form/DT/CD flags
- `CATEGORIES` — 10 category strings
- `ORDERS_SEED` — 10 mock orders (mix of submitted, on-hold, draft)
- `fmt(n)` / `fmtN(n)` — money + number formatters

---

## State & Logic Notes for Implementation

- **Catalogue stock state** is pre-computed (`ok` / `low` / `out`). In production, derive from a live numeric threshold (e.g. low ≤ 100, out = 0).
- **Promo price** is optional per SKU. If present, it becomes the default unit price for a new basket line; the catalogue shows MSP struck through.
- **Below-MSP threshold** is a hard `unit < msp` check in the prototype. Real implementation likely needs a tolerance, contract-aware floor pricing, and a backend approval route.
- **Manual picking reason code** is required client-side but should also be server-validated. The `note` is optional.
- **Order submission** in the prototype is a `setState` to the submitted screen. Real implementation needs SAP integration, optimistic UI, error handling, and an idempotency key on the submit call.
- **Drafts** in this prototype don't persist (no localStorage). Real implementation needs auto-save and a server-side draft store.

---

## Files in this bundle

| File | Purpose |
|---|---|
| `index.html` | Entry point — links to prototype and canvas |
| `prototype.html` | Bootstraps React + all screens |
| `canvas.html` | Pan/zoom canvas overview of every screen |
| `styles.css` | Full design system — tokens, components, layout primitives |
| `data.js` | Mock data |
| `components.jsx` | Shared components (header, footer, inputs, etc.) |
| `screen-landing.jsx` | Orders landing screen |
| `screen-neworder.jsx` | New order modal |
| `screen-build.jsx` | Build order (catalogue + basket) — biggest file |
| `screen-submitted.jsx` | Submission confirmation |
| `app.jsx` | Root component + screen routing + tweak wiring |
| `tweaks-panel.jsx` | Live tweak panel (prototype-only — discard in production) |
| `design-canvas.jsx` | Canvas wrapper for the overview page |

To run locally, serve the folder over any static HTTP server (`python -m http.server`, `npx serve`, etc.) and open `index.html`.

---

## Open work / not yet designed

- Read-only order detail view (clicking a submitted row currently shows an alert)
- Approval routing UI for below-MSP submissions
- Bulk Order and NRT order types (different field requirements)
- Saved baskets / order templates for recurring weekly orders
- SAP error / rejection states surfaced into the orders list
- Mobile / narrow-viewport behaviour (current designs target 1280+)
- Empty / first-run state for new clients
- Accessibility audit — focus order, ARIA roles on the custom segmented and stepper, screen-reader announcements for stock and warning banners

## Assets

No raster assets used. All icons are inline SVG strokes in `components.jsx` (`Icon` component). Logo is a CSS gradient square + text wordmark — replace with the real Sigma asset when handing over.
