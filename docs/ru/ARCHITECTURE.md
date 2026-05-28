# Архитектура

## Архитектурный стиль

Кодовая база организована близко к feature-sliced architecture:

```text
app       application shell, routes, global styles
pages     route-level screens
features  пользовательские workflows и stateful feature-модули
entities  доменные сущности: device и cable
shared    общие primitives и utilities
data      исходные данные каталога
qa        browser automation probes и screenshots
```

Важное направление зависимостей:

```text
app -> pages -> features -> entities -> shared
data -> entities
features -> data там, где нужен lookup по каталогу
```

Backend boundary пока нет. Browser - единственный runtime.

## High-Level Flow

1. `main.tsx` монтирует `App`.
2. `App` оборачивает routes в Radix `Tooltip.Provider`, монтирует router и `ToastHost`.
3. Landing page ведет на `/editor`.
4. `/editor` лениво загружает `EditorPage`.
5. `EditorPage` инициализирует:
   - dnd-kit sensors.
   - `useEditorCommands` для keyboard shortcuts.
   - `useSessionPersistence` для загрузки local session и autosave.
   - `DeviceLibrary`, `RackCanvas`, `DeviceInfoPanel`, `RackConfigurator`, `EditorTour`.
6. `useRackStore` - single source of truth для состояния рэка и business actions.
7. Rear-view patching использует:
   - `layoutPorts` для размещения physical endpoints.
   - `validateConnection` для accept/block создания кабеля.
   - `routeCables` для читаемых cable paths.

## Владение состоянием

### Global Editor State

Находится в `src/features/rack/model/use-rack-store.ts`.

Persistent/session state:

- `rackSize`
- `installed`
- `cables`

Editor-only state:

- `rackConfigured`
- `activeCableStart`
- `viewMode`
- `selectedDeviceId`
- `selectedCableId`
- `devicePanelFilter`
- `notifications`

Actions:

- rack lifecycle: `configureRack`, `clearRack`, `setRackSize`
- device placement: `placeDevice`, `placeDeviceInFirstAvailableSlot`, `moveDevice`, `removeDevice`
- patching: `startCable`, `completeCable`, `cancelCable`, `deleteCable`
- selection/view/filtering: `setViewMode`, `selectDevice`, `selectCable`, `setFilters`
- notifications: `notify`, `dismissNotification`
- persistence: `loadSession`, `getSession`
- history: `undo`, `redo`

### Local Component State

Используется для UI mechanics, которые не должны попадать в session:

- `EditorPage`: dragged item, mobile library drawer, guided-tour request counter.
- `RackCanvas`: pointer, hovered port, zoom, pan, panning state.
- `RearRackSvg`: hovered cable id.
- `DeviceInfoPanel`: delete confirmation dialog open state.
- `EditorHeader`: clear confirmation dialog open state.
- `EditorTour`: active step, measured spotlight rect, closed request id.

## Undo/Redo

Zundo оборачивает Zustand store. Он отслеживает только `RackSession` через `partialize: tracked`.

Отслеживается:

- высота рэка
- установленные устройства
- кабели

Не отслеживается:

- selected item
- active cable draft
- view mode
- search/filter state
- notifications
- tour state

History limit - 50. Equality сейчас считается через `JSON.stringify`: для текущего размера state это просто и надежно, но при сильно больших сессиях может стать performance risk.

## Размещение устройств в рэке

Внутри проекта slots zero-based. В UI они показываются как one-based `1U`, `2U` и т.д.

Правила:

- устройство должно помещаться в `rackSize`.
- устройство не может overlap another installed device.
- move может сделать swap с ровно одним conflicting device, если оба устройства помещаются после swap.
- уменьшение rack size блокируется, если любое установленное устройство выйдет за новую высоту.
- удаление устройства удаляет все подключенные к нему кабели.

Ключевые функции:

- `canPlaceDevice`
- `resolveDeviceMove`
- `occupiedSlots`

## Front View

Front view отвечает за физическую композицию рэка:

- SVG `RackFrame` рисует rails, screws, unit labels, empty slots.
- `FrontPanelSvg` рендерит каждое установленное устройство.
- dnd-kit кладет invisible hit targets поверх rack slots.
- installed devices draggable/sortable через `SortableDevice`.
- device library cards можно drag into slots или click into first available slot.

Front view не показывает порты и patching.

## Rear View

Rear view отвечает за коммутацию:

- `RearRackSvg` рендерит rear panels, ports, cable routes, cable notice icons, active cable preview и hover tooltip.
- `layoutPorts` превращает ports устройства в конкретные `PortLocation`.
- `getConnectablePorts` разворачивает individual socket banks в отдельные endpoints.
- `validateConnection` определяет, можно ли соединить source и destination.
- `routeCables` проводит все saved cables через side raceways, чтобы уменьшить overlap.
- `PatchStatusBar` показывает hovered port, active patch source, compatible/blocked target или selected cable.

## Валидация кабелей

Валидация намеренно прагматичная: это не полная electrical simulation.

Hard blockers:

- source direction не `out`, `send`, `thru` или `bidirectional`.
- destination direction не `in`, `return` или `bidirectional`.
- source и destination на одном installed device.
- AES/EBU XLR соединяется напрямую с analog XLR или наоборот.
- physical connector type не разрешен `COMPATIBILITY_MATRIX`.

Warnings/info:

- S/PDIF vs word clock.
- Dante vs AVB.
- Hi-Z source into Lo-Z input.
- +4 dBu output into -10 dBV input.
- mono source into stereo input.
- send -> return insert loop.
- MIDI THRU forwarding.

## Routing кабелей

`routeCables` резолвит endpoints кабеля через `Map<instanceId:portId, PortLocation>`.

Routing strategy:

1. Пропустить кабели с missing endpoint positions.
2. Выбрать left/right raceway по average endpoint X.
3. Построить vertical intervals по endpoint Y.
4. Назначить raceway lanes через greedy interval coloring.
5. Нарисовать rounded Manhattan paths: source -> raceway -> destination.

Так dense racks остаются читаемыми, а output остается deterministic.

## Import Session Path

Import проходит два gate:

1. `parseSessionImport` проверяет JSON shape и session version.
2. `loadSession` sanitizes against live catalog/business rules.

Repair behavior:

- unknown device ids удаляются.
- duplicate instance ids удаляются.
- overflowing или overlapping devices удаляются.
- cables с missing endpoints удаляются.
- cables, которые больше не проходят validation, удаляются.
- repaired sessions показывают warning notification.

## Styling

Все app styles находятся в `src/app/styles/index.css`.

Component-scoped CSS или CSS modules пока нет. Class names сгруппированы по feature names:

- `landing-*`
- `editor-*`
- `device-*`
- `rack-*`
- `patch-*`
- `toast-*`
- `tour-*`

Tailwind подключен через Vite plugin, но UI сейчас построен на authored CSS classes, а не на Tailwind utility composition.

## External Integration Points

- Browser `localStorage` для autosave/manual save.
- Browser file input для JSON import.
- Browser download links для JSON и PNG export.
- `html-to-image` для PNG capture.
- Playwright-style QA scripts в `qa/`; они ожидают running dev server через `APP_URL` или `http://localhost:5174/`.
