# Interactive Event Seating Map: Front-End Technical Assessment

Technical assessment showcasing an interactive event seating map built with the React + TypeScript stack. Seats are clickable and keyboard-navigable, show their details on selection, and you can pick up to eight seats with a live subtotal that survives a page reload. The brief asks for smooth rendering of arenas up to ~15,000 seats, which drives most of the design below.

## Getting started

```bash
pnpm install
pnpm dev
```

Five datasets (1k-15k seats) are committed, with a size switcher in the header so you can watch performance hold up as the seat count grows. The 15k set is `public/venue.json`; the rest live under `public/venues/`.

```bash
pnpm lint        # ESLint
pnpm format      # Prettier check
pnpm typecheck   # tsc, strict mode
pnpm build       # production build
```

CI runs lint, format, typecheck and build on every push.

## Architecture

The map is drawn on a single `<canvas>` rather than SVG. At 15,000 seats a DOM-per-seat approach (SVG/HTML) stops being smooth, so the seats are painted with the Canvas 2D API. Two things keep it at 60fps: the visible world rectangle is computed from the current pan/zoom and seats outside it are culled, and the survivors are grouped by colour so each colour is drawn as one batched `fill()`. Redraws are scheduled through `requestAnimationFrame` and only happen on interaction or state change. There is no always-on render loop.

Pan/zoom state lives in a ref, not React state, so dragging and pinching never trigger re-renders; React only re-renders when the selection, focused seat, or heat-map toggle changes. The code is grouped by feature: `map/` owns the canvas (rendering geometry, hit-testing, keyboard navigation, the FPS meter), `venue/` fetches and flattens the nested venue into absolute-positioned seats, `selection/` holds the selection rules and `localStorage` persistence, and `ui/` is the presentational sidebar. The [React Compiler](https://react.dev/learn/react-compiler) is enabled in `vite.config.ts`, so there is no hand-written `useMemo`/`useCallback`: derived values like the placed seats and the seat index are plain expressions the compiler memoises.

Each venue is fetched once and read with `use()` under a `<Suspense>` boundary; the promise is cached per URL so returning to a venue is instant, and `useDeferredValue` keeps the header and size switcher responsive while a larger dataset streams in behind the still-visible map. Prices are not part of the venue payload, so a tier→price table lives in `venue/venue.ts`. The only runtime dependencies are React and React DOM; everything else (rendering, gestures, state) is hand-rolled to keep the bundle small and the behaviour explicit.

## Measuring frame rate

A live frame-rate badge sits in the top-left of the map. It samples `requestAnimationFrame` the way stats.js does, so a stalled main thread shows up immediately as a number below 60. Switch to the 15k dataset, drag continuously and pinch-zoom, and the badge should hold around 60.

For an independent reading, open Chrome DevTools → ⋮ → **More tools → Rendering** and tick **Frame Rendering Stats** for the built-in FPS overlay, or record the **Performance** panel while dragging and confirm each frame stays under ~16 ms.

## Accessibility

The canvas is focusable and exposes the two-level keyboard model arena pickers use: arrow keys move seat-by-seat **within the current section** (along a row and between rows) and stop at the section's edge, while Page Up / Page Down switch to the previous / next section, ordered around the bowl and landing on its first seat. Keeping arrows inside one section avoids the disorienting jumps you get from letting them cross a curved tier, where "screen-right" rarely lines up with the neighbouring block. Enter/Space toggles selection, and the view pans automatically when the focused seat scrolls out of sight. Each focus change is announced through an `aria-live` region, and the focus ring is drawn on the canvas. The trade-off is deliberate: a fully native ARIA grid would mean 15,000 focusable DOM nodes and defeat the performance goal, so the keyboard layer operates over the seat data instead of the DOM.

## Trade-offs and TODOs

- Each arena size keeps its own selection under a separate `localStorage` key (`seating-map.selection.<size>`), so switching sizes preserves what you picked and "Clear all" only resets the current arena. Ids are still validated against the loaded venue, so seats that are no longer available are dropped.
- Touch is supported (drag to pan, pinch to zoom, tap to select) alongside mouse and keyboard. A price-tier heat-map toggle is included.
- Not implemented: live seat-status updates over WebSocket, a "find N adjacent seats" helper, a dark-mode theme, and automated tests. These are isolated additions rather than structural changes.
