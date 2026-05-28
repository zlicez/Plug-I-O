# Справочник функций

Этот документ описывает функции, которые формируют поведение проекта: где функция находится, за что отвечает и что можно сломать при изменении.

## `src/app`

### `App`

Application shell.

- Оборачивает routes в `Tooltip.Provider`.
- Настраивает `/` и `/editor`.
- Lazy-loads `EditorPage`.
- Монтирует `ToastHost` вне route tree, чтобы notifications работали из любой части редактора.

## `src/pages/landing`

### `LandingPage`

Рендерит entry/landing screen с animated rack units и ссылкой на `/editor`.

Важно: он не инициализирует editor state. Все состояние рэка начинается при mount `EditorPage`.

## `src/pages/editor`

### `extractDragItem`

Нормализует dnd-kit `DragStartEvent` payload в локальный `DragItem`.

Обрабатывает:

- `kind: "library"`: резолвит catalog device по `deviceId`.
- `kind: "installed"`: резолвит installed instance и его catalog device.

Возвращает `null` для malformed drag payload.

### `RackTrashTarget`

Рендерит droppable trash target только во время drag установленного устройства. Drop в эту зону удаляет устройство и связанные кабели.

### `Workspace`

Собирает весь editor workspace.

Владеет:

- dnd-kit sensors.
- dragged overlay item.
- mobile library open/closed state.
- guided-tour trigger counter.

Координирует:

- установку устройства из library.
- перемещение устройств внутри рэка.
- удаление через trash target.
- session persistence hook.
- keyboard command hook.

### `EditorErrorBoundary`

Защищает editor route от render crashes. Логирует ошибку и показывает reload fallback. Local session не очищается.

### `EditorPage`

Route-level editor component. Оборачивает `Workspace` в `EditorErrorBoundary`.

## `src/features/rack/model`

### `useRackStore`

Главный Zustand store. Обернут Immer для mutable-looking reducers и Zundo для undo/redo.

#### `configureRack(size)`

Устанавливает `rackSize` и переводит рэк в configured state. Используется first-run modal выбора rack size.

#### `clearRack()`

Удаляет installed devices, cables, active cable draft и selection. Рэк остается configured.

#### `setRackSize(size)`

Меняет высоту frame, если ни одно устройство не overflow requested rack size. Если overflow есть, показывает warning notification и не меняет state.

#### `placeDevice(deviceId, slot)`

Находит catalog device, проверяет fit через `canPlaceDevice`, создает installed instance и выбирает его.

Failure behavior:

- unknown device id: no-op.
- no room/overlap: error notification.

#### `placeDeviceInFirstAvailableSlot(deviceId)`

Находит первый slot, куда device помещается, затем делегирует `placeDevice`.

Failure behavior:

- unknown device id: no-op.
- no slot: error notification.

#### `removeDevice(instanceId)`

Удаляет installed device и все connected cables. Если это выбранное устройство - очищает selection.

#### `moveDevice(instanceId, slot)`

Перемещает installed device или делает swap с ровно одним conflicting device, если это возможно. Использует `resolveDeviceMove`.

Failure behavior:

- missing instance/catalog device: no-op.
- invalid target: error notification.

#### `startCable(instanceId, portId)`

Вооружает source endpoint для patching. Source должен быть `out`, `send`, `thru` или `bidirectional`.

Failure behavior:

- invalid/missing source: error notification.

#### `completeCable(instanceId, portId)`

Пытается соединить armed source с destination endpoint.

Flow:

1. Resolve source and destination ports.
2. Reject same-device connections.
3. Run `validateConnection`.
4. Emit validation notices as notifications.
5. If allowed, create cable with protocol color and captured notices.
6. Clear active source and select new cable.

#### `cancelCable()`

Очищает active cable source и selected cable.

#### `deleteCable(cableId)`

Удаляет один cable и очищает selection, если этот cable был selected.

#### `setViewMode(mode)`

Переключает `front`/`back`. Cancels active cable source, чтобы не оставлять скрытое patching state.

#### `selectDevice(instanceId)`

Выбирает device и очищает selected cable.

#### `selectCable(cableId)`

Выбирает cable и очищает selected device.

#### `setFilters(filters)`

Мержит partial filter updates в `devicePanelFilter`.

#### `notify(notification)`

Добавляет notification. Callers могут передать `expiresAt`; info notifications, созданные через `appendNotification`, auto-expire через 4 секунды.

#### `dismissNotification(id)`

Удаляет notification.

#### `loadSession(session)`

Sanitizes и загружает imported/stored session. Ставит rack configured, сбрасывает transient editor state и предупреждает, если invalid data была repaired.

#### `getSession()`

Возвращает portable `RackSession` snapshot.

#### `undo()` / `redo()`

Делегирует Zundo temporal state.

### Internal Store Helpers

#### `tracked(state)`

Проецирует full store state в portable/undoable `RackSession`.

#### `appendNotification(notifications, level, title, message)`

Создает notification с random id. Info notifications auto-expire.

#### `portAt(endpoint, installed)`

Резолвит cable endpoint в live catalog port, включая expanded individual sockets.

#### `sanitizeSession(session)`

Ремонтирует sessions, валидируя installed devices и cables против текущего каталога и compatibility rules.

## `src/features/rack/lib`

### `useSessionPersistence`

Один раз загружает saved session при mount editor. После rack configuration сохраняет current session каждые 30 секунд.

Нюанс: immediate save на каждое изменение и `beforeunload` flush пока нет.

### `useEditorCommands`

Регистрирует global keyboard commands:

- `Ctrl/Cmd+Z`: undo.
- `Ctrl/Cmd+Y`: redo.
- `F`: flip front/back, если focus не в input/select.
- `Delete`/`Backspace`: удалить selected cable или selected device, если focus не в input/select.
- `Escape`: cancel active cable.

## `src/features/rack/ui`

### `RackConfigurator`

First-run modal выбора rack height. Открыт, пока `rackConfigured` равен false.

### `EditorHeader`

Top command bar.

Владеет:

- rack size selector.
- front/back toggle.
- undo/redo controls.
- clear rack confirmation.
- guided tour trigger.
- manual local save.
- JSON export/import.
- PNG export.

Internal helper:

- `download(content, filename, type)`: создает temporary object URL и кликает anchor.

### `RackCanvas`

Главный rack viewport.

Владеет:

- camera scale/pan.
- fit-to-view behavior.
- pointer position для active cable preview.
- hovered port state, передаваемый в `PatchStatusBar`.

Subcomponents:

- `RackFrame`: рисует rails, unit labels, empty slots.
- `DropSlot`: dnd-kit droppable slot со статусом valid/invalid/swap.
- `SortableDevice`: invisible hit area поверх installed front-panel devices.

## `src/features/devices`

### `useFilteredDevices(filters)`

Запускает fuzzy search через Fuse.js, затем применяет category/rack-unit/protocol filters и sorting.

Sort modes:

- popularity descending.
- name A-Z.
- category A-Z.

### `DeviceLibrary`

Рендерит searchable/filterable device catalog.

Interactions:

- Click device to place it in first available slot.
- Drag device to rack slot.
- Toggle grid/list.
- Filter by category, protocol, rack units.
- Clear filters.
- Shows empty state when no devices match.

Internal components:

- `DeviceCard`
- `CheckboxFilter`

### `DeviceInfoPanel`

Inspector для selected installed device.

Показывает:

- metadata и description.
- rear-panel verification basis.
- original rear-panel port definitions.
- active cable connections for this instance.
- technical specs.
- remove-device confirmation.

## `src/features/patchbay/lib`

### `layoutPorts(instance, device, geometry)`

Считает positions rear-panel ports.

Важная логика:

- Expands individual socket groups через `getConnectablePorts`.
- Separates compact socket rows from regular connectors.
- Для mixed 1U devices выделяет right-side regular connector band, чтобы sockets и DB25/network/power connectors оставались видимыми.
- Для mixed 2U+ devices ставит regular ports под compact rows.
- Использует injected geometry, чтобы front/rear dimensions могли шарить placement logic.

### `cablePath(from, to)`

Строит cubic Bezier path для active in-progress cable preview.

### `routeCables(cables, positions, geometry)`

Прокладывает saved cables через side raceways.

Internal helpers:

- `assignLanes(intervals)`: greedy interval coloring, чтобы overlapping vertical cable ranges получали отдельные lanes.
- `roundedManhattan(points, radius)`: строит SVG path с rounded 90-degree turns.

## `src/features/patchbay/ui`

### `RearRackSvg`

Рендерит весь rear view.

Responsibilities:

- rear device panels and name strips.
- port glyphs and compact socket labels.
- dense row header labels.
- active patch preview.
- saved cable paths.
- cable hover/focus visual states.
- cable tooltip.
- cable notice icons.
- port click/keyboard interactions.

### `PatchStatusBar`

Bottom floating status bar для rear-view patching.

States:

- hidden outside rear view unless port/cable/route active.
- hovered port summary.
- source armed.
- compatible or blocked hovered target.
- selected cable route with delete action.

Internal helper:

- `endpointInfo(endpoint, installed)`: resolves endpoint to device name and port.

## `src/entities/device`

### `getDeviceById(devices, deviceId)`

Ищет catalog device по id.

### `getConnectablePorts(device)`

Материализует independent physical sockets. Если port имеет `individualSockets` и `count >= 2`, создает derived ids вроде `outputs:1`, `outputs:2`. Иначе возвращает original port.

### `occupiedSlots(installed, devices)`

Возвращает все occupied rack slot indexes.

### `canPlaceDevice(installed, devices, device, slot, rackSize, ignoredInstanceId?)`

Проверяет rack bounds и overlap. `ignoredInstanceId` используется при drag/move уже installed device.

### `resolveDeviceMove(installed, devices, instanceId, requestedSlot, rackSize)`

Возвращает:

- direct move target.
- swap resolution with one conflicting device.
- `null`, если move невозможен.

### `protocolsForDevice(device)`

Возвращает unique protocols из rear panel устройства.

### `portColor(port)`

Маппит port protocol/direction в visual color для rear panel glyphs.

### `FrontPanelSvg`

Рендерит front panel SVG для device. Использует deterministic layout и optional meter animation.

Internal helpers:

- `ControlGlyph`: knob/fader/button/display/meter rendering.
- `PatchField`: socket field rendering.
- `clamp`: numeric layout guard.

### `FrontPanelPreview`

Маленький non-animated SVG preview для library cards и drag overlay.

### `PortGlyph`

Рендерит rear connector icon shapes для common connector groups.

## `src/entities/cable`

### `endpointKey(endpoint)`

Строит stable lookup key для cable endpoint в формате `instanceId:portId`. Rear-panel rendering и cable routing используют общий helper, чтобы endpoint maps не расходились.

### `COMPATIBILITY_MATRIX`

Таблица physical connector compatibility. Основное место для добавления/удаления connector pairings.

### `validateConnection(source, destination)`

Валидирует proposed cable. Возвращает `{ allowed, notices }`.

Internal helpers:

- `canSource(direction)`
- `canReceive(direction)`
- `isLineLevelMismatch(source, destination)`

### `cableColorForPort(port)`

Выбирает cable color по source protocol/type.

## `src/shared`

### `cn(...inputs)`

Объединяет `clsx` и `tailwind-merge` для class names.

### `localSessionRepository`

Browser localStorage repository.

Methods:

- `load()`
- `save(session)`

### `parseSessionImport(content)`

Парсит imported JSON и валидирует session shape.

Internal validators:

- `isRecord`
- `isInstalledDevice`
- `isCableEndpoint`
- `isCableNotice`
- `isCable`
- `isRackSession`

### `Button`

Shared button primitive с variants: `primary`, `secondary`, `ghost`, `danger`; sizes: `sm`, `md`, `icon`.

### `ToastHost`

Рендерит последние четыре notifications. Info toasts expire automatically; warning/error toasts имеют dismiss button.

### `FRONT_GEOMETRY` / `REAR_GEOMETRY`

Shared rack layout constants. Front view compact; rear view expanded для ports/labels/cable raceways.
