# Interactive Event Seating Map

A React + TypeScript app that renders an interactive seating map for an event. Seats are clickable and keyboard-navigable, show their details on selection, and you can pick up to eight seats with a live subtotal that survives a page reload.

## Getting started

```bash
pnpm install
pnpm dev
```

The app loads `public/venue.json` on startup. A 15,000-seat venue is committed so the app runs at scale out of the box; run `pnpm generate-venue` to regenerate it.

```bash
pnpm test        # unit tests (Vitest)
pnpm lint        # ESLint
pnpm typecheck   # tsc, strict mode
pnpm build       # production build
```

## Architecture

The map is drawn on a single `<canvas>` rather than SVG. At 15,000 seats a DOM-per-seat approach (SVG/HTML) stops being smooth, so the seats are painted with the Canvas 2D API. Two things keep it at 60fps: the visible world rectangle is computed from the current pan/zoom and seats outside it are culled, and the survivors are grouped by colour so each colour is drawn as one batched `fill()`. Redraws are scheduled through `requestAnimationFrame` and only happen on interaction or state change — there is no always-on render loop.

Pan/zoom state lives in a ref, not React state, so dragging and pinching never trigger re-renders; React only re-renders when the selection, focused seat, or heat-map toggle changes. The data flows through small pure modules that are unit-tested in isolation: `venue.ts` flattens the nested venue into absolute-positioned seats, `render.ts` owns the geometry (transform inversion, hit-testing, drawing), `navigation.ts` builds the row/column index used for keyboard movement, and `selection.ts` holds the selection rules and `localStorage` persistence.

Prices are not part of the venue payload, so a tier→price table lives in `venue.ts` and is documented there. The only runtime dependencies are React and React DOM; everything else (rendering, gestures, state) is hand-rolled to keep the bundle small and the behaviour explicit.

## Accessibility

The canvas is focusable and exposes a roving keyboard model: arrow keys move between adjacent seats, Enter/Space toggles selection, and the view pans automatically when the focused seat scrolls out of sight. Each focus change is announced through an `aria-live` region, and the focus ring is drawn on the canvas. The trade-off is deliberate: a fully native ARIA grid would mean 15,000 focusable DOM nodes and defeat the performance goal, so the keyboard layer operates over the seat data instead of the DOM.

## Trade-offs and TODOs

- Selection state is validated against the loaded venue on every render, so stale ids from a previous venue are dropped rather than persisted.
- Touch is supported (drag to pan, pinch to zoom, tap to select) alongside mouse and keyboard. A price-tier heat-map toggle is included.
- Not implemented: live seat-status updates over WebSocket, a "find N adjacent seats" helper, a dark-mode theme, and end-to-end tests. These are isolated additions rather than structural changes.

## Tests

Vitest covers the selection rules and persistence, the venue flattening and pricing, the keyboard navigation index, the geometry (hit-testing and screen↔world conversion), and the summary component (rendering, subtotal, removal).
