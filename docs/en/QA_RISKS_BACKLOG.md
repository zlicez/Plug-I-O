# QA, Risks, and Backlog

## Automated Test Coverage

Current Vitest coverage is focused on business logic:

- `src/shared/lib/session-repository.test.ts`
  - accepts valid sessions.
  - rejects malformed sessions.
- `src/entities/cable/lib/validation.test.ts`
  - validates allowed/blocked cable compatibility.
- `src/entities/device/lib/device-utils.test.ts`
  - placement, occupation, movement/swap helpers.
- `src/data/devices.test.ts`
  - catalog verification metadata.
  - equalizer profile regression.
  - hand-tuned front panels.
  - patch bay socket fields.
  - unique device ids.
- `src/features/patchbay/lib/port-geometry.test.ts`
  - regular ports.
  - individual socket banks.
  - mixed devices.
  - Crown DCi regression for hidden connectors.
- `src/features/patchbay/lib/cable-router.test.ts`
  - overlapping lanes.
  - lane reuse.
  - left/right raceway selection.
  - missing endpoint skip.
- `src/features/rack/model/use-rack-store.test.ts`
  - session load sanitization for unknown devices, orphan cables, overlaps.

Baseline check on 2026-05-28:

- `npm test`: 7 files, 26 tests passed.
- `npm run typecheck`: passed.

## Manual / Browser QA

`qa/` contains Playwright-style scripts. They are not wired into `package.json` and Playwright is not declared as a project dependency, so treat them as local exploratory probes unless the dependency is added explicitly.

### `qa/rear-audit.mjs`

Broad rear-panel audit:

- opens app.
- configures 12U rack.
- checks empty front/back views.
- adds several dense/mixed devices.
- captures rear density screenshots.
- creates multiple cables.
- captures tooltip/focus behavior.
- opens inspector from back view.

Outputs screenshots to `qa/screenshots/rear-audit`.

### `qa/rear-probes.mjs`

Focused rear-view/cable probe:

- seeds a smaller rack.
- creates clean cables.
- uses SVG `getPointAtLength` to hover directly on a cable path.
- captures cable tooltip and compatibility state screenshots.

### `qa/find-undefined-rect.mjs`

Regression probe for SVG `<rect width="undefined">` warnings. It monkey-patches `SVGRectElement.prototype.setAttribute` before app load and logs stack traces.

## Recommended QA Checklist

Run before meaningful releases:

1. `npm run typecheck`
2. `npm test`
3. `npm run build`
4. Start dev server.
5. Manually test:
   - first-load configurator.
   - add by click.
   - add by drag.
   - move and swap.
   - remove via inspector and trash.
   - resize blocked by overflowing devices.
   - switch front/back.
   - create valid analog patch.
   - attempt invalid connector patch.
   - delete cable.
   - undo/redo after placement and cable creation.
   - save, reload, import/export JSON.
   - PNG export.
   - mobile-width library drawer.

Optional visual regression:

1. Install Playwright if not already available.
2. Start Vite on the expected port or set `APP_URL`.
3. Run `node qa/rear-audit.mjs`.
4. Review screenshots in `qa/screenshots/rear-audit`.

## Technical Risks

### Single Large CSS File

All styling lives in `src/app/styles/index.css`. This keeps the current app simple, but it makes ownership and regression isolation harder as features grow.

Recommendation:

- keep global tokens/base styles global.
- split feature sections when CSS churn increases.

### Catalog Coupling

Features import `devices` directly from `src/data/devices.ts`. That is fine for a client-only prototype, but a future backend/catalog API will need a repository boundary.

Recommendation:

- introduce a catalog access module before adding remote catalogs or user-defined devices.

### `JSON.stringify` Undo Equality

Zundo equality uses full JSON serialization of tracked state.

Risk:

- acceptable today, but expensive for large sessions or high-frequency changes.

Recommendation:

- move to shallow revision counters or structured equality if sessions become large.

### Session Versioning

Only `version: 1` is accepted. There is no migration layer.

Recommendation:

- add `migrateSession(value)` before changing `RackSession`.

### Autosave Timing

Autosave runs every 30 seconds after configuration.

Risk:

- abrupt tab close can lose recent edits.

Recommendation:

- save on important mutations, debounce saves, or flush on `visibilitychange`/`beforeunload`.

### PNG Export Error Handling

PNG export awaits `toPng` without catch.

Risk:

- CORS/canvas/render failures fail silently from the user's perspective.

Recommendation:

- catch export errors and show a toast.

### QA Scripts Not Productized

The `qa/*.mjs` scripts rely on Playwright but the dependency and npm scripts are not declared.

Recommendation:

- add Playwright to devDependencies if these scripts are part of CI/team workflow.
- add npm scripts and document expected `APP_URL`.

### Accessibility Gaps

Strengths:

- Radix dialogs/popovers/tooltips.
- buttons have labels.
- ports and cables have keyboard handlers.

Risks:

- SVG port groups use `role="button"` manually.
- drag/drop may not have a complete keyboard alternative.
- the guided tour is custom and should be checked with screen readers.

Recommendation:

- run axe/manual keyboard audit.
- add integration tests for keyboard patching.

### Patching Model Is Simplified

The app validates connector/protocol compatibility but does not model:

- signal levels in depth.
- balanced vs unbalanced wiring beyond coarse warnings.
- phantom power.
- patchbay normal/half-normal modes.
- cable length and physical cable inventory.
- multi-channel channel-by-channel DB25 routing.

Recommendation:

- define explicit "simulation depth" product tier before adding complex audio rules.

## Product Backlog

High-value next steps:

- Project templates: vocal chain, mix bus, live room, mastering rack.
- User-defined custom device.
- Cable notes/labels.
- Full cable inspector.
- Patchbay normaling modes.
- Immediate/debounced autosave.
- Session migration layer.
- Cloud/project backend if collaboration is desired.
- Shareable read-only link.
- PDF report export with device list and connection table.
- Import/export catalog entries.
- Accessibility audit and keyboard workflow polish.
- Visual regression CI for rear-panel density.

## Development Backlog

Engineering improvements:

- Add `qa:*` npm scripts after Playwright is added.
- Split global CSS by feature or introduce a styling convention document.
- Extract catalog repository boundary.
- Add tests for `useFilteredDevices`.
- Add tests for `useEditorCommands`.
- Add tests for session repair notification behavior.
- Add tests for rack resize blocking.
- Add import/export browser integration test.
- Add route smoke tests with Playwright.
- Catch PNG export errors.
- Support `Ctrl/Cmd+Shift+Z` redo.
- Continue extracting repeated view/router glue into small typed helpers when the same concept appears in more than one feature.

## Known Nuances for Developers

- Internal rack slots are zero-based; UI labels are one-based.
- `RackSession` does not include UI filter/view/selection state.
- `getConnectablePorts` changes port ids for individual sockets by appending `:n`.
- Cable notices are saved on the cable when created. If validation rules later change, old cable notices only update when session is loaded and sanitized.
- Switching view cancels active cable source.
- Removing a device is destructive to connected cables, but the operation can be undone through Zundo.
- Info notifications created by store helper expire automatically; warning/error notifications persist.
- Device library click-to-add and drag-to-add share cards, so `suppressClick` prevents double placement after dragging.
