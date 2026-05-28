# Продуктовые сценарии

## Основные пользователи

- Владелец студии, который планирует rack до покупки или перекоммутации оборудования.
- Audio engineer, документирующий patch layout.
- System tech, проверяющий физическую/protocol совместимость соединения.
- Developer/QA, проверяющий rear-panel density и routing behavior.

## Основной пользовательский путь

1. Пользователь открывает `/`.
2. Нажимает `Start building`.
3. Открывается editor и показывает rack frame configurator.
4. Пользователь выбирает 4U, 8U, 12U, 16U, 20U или 24U.
5. Ищет/фильтрует устройства в library.
6. Кликает устройство или drag it to a slot.
7. Расставляет устройства во front view.
8. Переключается в rear view.
9. Кликает valid source port.
10. Hover/click destination port.
11. App создает cable или показывает validation errors/warnings.
12. Пользователь инспектирует devices/cables, удаляет или корректирует.
13. Сохраняет locally, экспортирует JSON, импортирует JSON или экспортирует PNG.

## Landing Page

Назначение:

- быстро объяснить product category.
- провести пользователя в editor.

Current UI states:

- static animated rack illustration.
- steps summary: choose rack size, drag devices, patch connections.
- single launch CTA.

Weak spots:

- нет project templates.
- нет явного "open last rack", хотя local autosave уже есть.
- нет явного browser/local-only data notice.

## Rack Configuration

Configurator показывается, пока `rackConfigured` равен false.

Доступные frame sizes:

- 4U
- 8U
- 12U
- 16U
- 20U
- 24U

State transitions:

- unconfigured -> configured после выбора size.
- imported или locally restored session -> configured automatically.
- clear rack не возвращает в unconfigured.

Error/edge behavior:

- Change frame size позже блокируется, если existing devices overflow new height.
- Первый configurator не имеет cancel path, потому что editor нужен frame size.

## Device Library

User goals:

- быстро найти hardware.
- понять size/category.
- добавить через click или drag.

Controls:

- fuzzy search by name/manufacturer/tags.
- category multi-select.
- protocol multi-select.
- rack-unit filter.
- sort by popularity, name, category.
- grid/list toggle.

Empty states:

- No matching devices: icon, copy и reset filters action.

Failure states:

- Click-to-add без свободного места показывает error toast.
- Drag-to-slot в invalid space показывает invalid slot status и move rejected on drop.

Nuances:

- Click по card ставит device в first available slot.
- Drag suppresses click handler, чтобы не было accidental duplicate add.
- Mobile использует drawer-style library toggle.

## Front Rack Editing

User goals:

- Arrange equipment vertically.
- See approximate front-panel identity.
- Move or remove installed devices.

Interactions:

- Drag library item to slot.
- Drag installed device to another slot.
- Swap allowed, когда ровно один conflicting device может занять старый slot moving device.
- Drag installed device to trash target to remove.
- Click installed device to open inspector.
- Zoom and pan canvas.

States:

- empty rack: rack frame with patterned empty slots.
- dragging valid target: slot shows `PLACE nU`.
- dragging invalid target: slot shows `NO SPACE`.
- dragging swap target: slot shows `SWAP`.
- selected device: inspector opens.

Errors:

- no contiguous rack space.
- move rejected.
- resize blocked.

## Rear Patching

User goals:

- See every routable rear-panel connector.
- Create valid patch cables.
- Understand why cable is blocked or risky.

Interactions:

- Switch view toggle to `back`.
- Click source port.
- Hover ports to see compatible/blocked state.
- Click destination port to complete route.
- Click cable to select.
- Hover cable to see floating tooltip.
- Delete selected cable from status bar or keyboard.

States:

- rear empty rack: frame and empty panels only.
- source armed: source highlighted and status bar shows source.
- compatible target: status bar shows `COMPATIBLE`.
- blocked target: status bar shows `BLOCKED`.
- selected cable: status bar shows route and delete button.
- cable with notices: warning/info icon near raceway midpoint.

Hard errors:

- start from non-source port.
- destination on the same device.
- incompatible direction.
- incompatible connector.
- AES/EBU direct to analog XLR.

Warnings/info:

- S/PDIF and word clock mismatch.
- Dante and AVB interoperability bridge needed.
- Hi-Z to Lo-Z.
- +4 dBu to -10 dBV.
- mono to stereo.
- insert loop established.
- MIDI THRU forwarding.

## Device Inspector

Открывается при выборе installed device.

Показывает:

- manufacturer, category, rack units.
- description.
- rear-panel verification basis/reference.
- rear-panel ports.
- current connections touching this device.
- specs.
- remove action with confirmation.

Empty state:

- No current patching.

Deletion behavior:

- Removing a device removes connected cables too.

Weak spots:

- Inspector device-only; cable details живут в hover/status UI, а не в полноценном inspector.
- Port list показывает catalog/base ports, не всегда все expanded individual sockets.

## Save, Import, Export

Manual save:

- сохраняет `getSession()` в localStorage.
- показывает info notification.

Autosave:

- каждые 30 секунд после rack configured.

JSON export:

- скачивает `plug-io-session.json`.

JSON import:

- читает file text.
- parse + structural validation.
- store sanitizes against live catalog.
- Invalid JSON или invalid shape показывает import error toast.
- Repaired session показывает warning toast.

PNG export:

- captures `RackCanvas` rendered node через `html-to-image`.
- background `#0f0f10`, pixel ratio 2.
- downloads `plug-io-rack.png`.

Weak spots:

- Autosave interval-based, последние секунды edits можно потерять при abrupt tab close.
- PNG export errors не ловятся и не показываются пользователю.
- File input value не сбрасывается после import; повторный импорт того же файла может зависеть от browser behavior.

## Keyboard Paths

- `Ctrl/Cmd+Z`: undo rack/session state.
- `Ctrl/Cmd+Y`: redo rack/session state.
- `F`: toggle front/back, если focus не в input/select.
- `Delete`/`Backspace`: delete selected cable или selected device, если focus не в input/select.
- `Escape`: cancel active patch cable.

Missing:

- `Ctrl/Cmd+Shift+Z` redo.
- documented shortcuts UI.
- keyboard-only drag/drop alternative for rack placement beyond dnd-kit basics.

## Notifications

Notifications хранятся в `useRackStore`.

Levels:

- `info`
- `warning`
- `error`

Behavior:

- рендерятся последние четыре.
- info messages auto-expire.
- warning/error остаются до dismiss.
- validation notices могут создать несколько notifications за одну cable attempt.

Potential improvement:

- deduplicate repeated notices.
- group multi-notice cable validation into one toast.

## Empty States and Blanks

Known empty/blank states:

- Landing page before editor.
- Rack configurator before frame exists.
- Empty rack after configuration.
- Device library empty search.
- Device inspector hidden when no device selected.
- Device inspector connections section: "No current patching."
- Rear view with no installed devices.
- Patch status bar hidden when nothing active.
- `blank` profile device useful as spacer/blank panel.

## Error and Recovery Paths

Editor render crash:

- `EditorErrorBoundary` shows fallback and reload button.
- Saved local session remains untouched.

Malformed local session:

- `localSessionRepository.load()` returns `null`, если JSON cannot parse или не match session shape.

Malformed import:

- `parseSessionImport` throws.
- `EditorHeader` catches and shows import error.

Partially stale import:

- `loadSession` repairs against catalog and route rules.
- User sees "Session repaired" warning.

Drag/drop rejected:

- Store emits notification; UI drag overlay clears.

Patching rejected:

- Store keeps active source, пока user cancels или switches view.
- Это позволяет выбрать another destination.
