# QA, риски и backlog

## Автоматическое покрытие тестами

Текущие Vitest-тесты сфокусированы на business logic:

- `src/shared/lib/session-repository.test.ts`
  - принимает valid sessions.
  - rejects malformed sessions.
- `src/entities/cable/lib/validation.test.ts`
  - проверяет allowed/blocked cable compatibility.
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

Baseline check на 2026-05-28:

- `npm test`: 7 files, 26 tests passed.
- `npm run typecheck`: passed.

## Manual / Browser QA

`qa/` содержит Playwright-style scripts. Они не подключены в `package.json`, а Playwright не объявлен dependency проекта, поэтому сейчас это local exploratory probes, пока dependency не добавлен явно.

### `qa/rear-audit.mjs`

Broad rear-panel audit:

- opens app.
- configures 12U rack.
- checks empty front/back views.
- adds dense/mixed devices.
- captures rear density screenshots.
- creates multiple cables.
- captures tooltip/focus behavior.
- opens inspector from back view.

Screenshots пишутся в `qa/screenshots/rear-audit`.

### `qa/rear-probes.mjs`

Focused rear-view/cable probe:

- seeds smaller rack.
- creates clean cables.
- uses SVG `getPointAtLength`, чтобы hover попадал точно в cable path.
- captures cable tooltip and compatibility state screenshots.

### `qa/find-undefined-rect.mjs`

Regression probe для SVG `<rect width="undefined">` warnings. До загрузки app monkey-patches `SVGRectElement.prototype.setAttribute` и логирует stack traces.

## Recommended QA Checklist

Перед meaningful releases:

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
2. Start Vite on expected port or set `APP_URL`.
3. Run `node qa/rear-audit.mjs`.
4. Review screenshots in `qa/screenshots/rear-audit`.

## Technical Risks

### Single Large CSS File

Все styling живет в `src/app/styles/index.css`. Для текущего app это просто, но по мере роста сложнее владеть изменениями и изолировать regressions.

Recommendation:

- keep global tokens/base styles global.
- split feature sections when CSS churn increases.

### Catalog Coupling

Features напрямую импортируют `devices` из `src/data/devices.ts`. Для client-only prototype нормально, но future backend/catalog API потребует repository boundary.

Recommendation:

- introduce catalog access module before remote catalogs или user-defined devices.

### `JSON.stringify` Undo Equality

Zundo equality использует full JSON serialization tracked state.

Risk:

- acceptable today, expensive for large sessions/high-frequency changes.

Recommendation:

- перейти на shallow revision counters или structured equality, если sessions станут большими.

### Session Versioning

Принимается только `version: 1`. Migration layer отсутствует.

Recommendation:

- добавить `migrateSession(value)` до изменения `RackSession`.

### Autosave Timing

Autosave запускается каждые 30 секунд после configuration.

Risk:

- abrupt tab close может потерять последние edits.

Recommendation:

- save on important mutations, debounce saves или flush on `visibilitychange`/`beforeunload`.

### PNG Export Error Handling

PNG export вызывает `toPng` без catch.

Risk:

- CORS/canvas/render failures не видны пользователю.

Recommendation:

- catch export errors и show toast.

### QA Scripts Not Productized

`qa/*.mjs` используют Playwright, но dependency и npm scripts не объявлены.

Recommendation:

- добавить Playwright в devDependencies, если scripts должны быть частью CI/team workflow.
- добавить npm scripts и documented expected `APP_URL`.

### Accessibility Gaps

Strengths:

- Radix dialogs/popovers/tooltips.
- buttons have labels.
- ports and cables have keyboard handlers.

Risks:

- SVG port groups используют `role="button"` вручную.
- drag/drop может не иметь полной keyboard alternative.
- guided tour custom, его нужно проверить screen readers.

Recommendation:

- axe/manual keyboard audit.
- integration tests for keyboard patching.

### Patching Model Is Simplified

App validates connector/protocol compatibility, но не моделирует:

- signal levels in depth.
- balanced vs unbalanced wiring beyond coarse warnings.
- phantom power.
- patchbay normal/half-normal modes.
- cable length and physical cable inventory.
- multi-channel channel-by-channel DB25 routing.

Recommendation:

- определить explicit "simulation depth" product tier перед добавлением complex audio rules.

## Product Backlog

High-value next steps:

- Project templates: vocal chain, mix bus, live room, mastering rack.
- User-defined custom device.
- Cable notes/labels.
- Full cable inspector.
- Patchbay normaling modes.
- Immediate/debounced autosave.
- Session migration layer.
- Cloud/project backend if collaboration desired.
- Shareable read-only link.
- PDF report export with device list and connection table.
- Import/export catalog entries.
- Accessibility audit and keyboard workflow polish.
- Visual regression CI for rear-panel density.

## Development Backlog

Engineering improvements:

- Add `qa:*` npm scripts after Playwright added.
- Split global CSS by feature or introduce styling convention document.
- Extract catalog repository boundary.
- Add tests for `useFilteredDevices`.
- Add tests for `useEditorCommands`.
- Add tests for session repair notification behavior.
- Add tests for rack resize blocking.
- Add import/export browser integration test.
- Add route smoke tests with Playwright.
- Catch PNG export errors.
- Support `Ctrl/Cmd+Shift+Z` redo.
- Continue extracting repeated view/router glue into small typed helpers when same concept appears in more than one feature.

## Known Nuances for Developers

- Internal rack slots zero-based; UI labels one-based.
- `RackSession` не включает UI filter/view/selection state.
- `getConnectablePorts` меняет port ids для individual sockets, добавляя `:n`.
- Cable notices сохраняются на cable в момент создания. Если validation rules меняются позже, старые cable notices обновятся только при load/sanitize session.
- Switching view cancels active cable source.
- Removing device destructive to connected cables, но operation можно undo через Zundo.
- Info notifications, созданные store helper, expire automatically; warning/error persist.
- Device library click-to-add и drag-to-add используют одни cards, поэтому `suppressClick` предотвращает double placement после dragging.
