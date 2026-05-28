# Function Reference

This file documents the functions that define the behavior of the project. It is intentionally written for developers joining the team: where the function lives, what it owns, and what can break if it changes.

## `src/app`

### `App`

Defines the application shell.

- Wraps routes with `Tooltip.Provider`.
- Configures `/` and `/editor`.
- Lazy-loads `EditorPage`.
- Mounts `ToastHost` outside the route tree so notifications survive page-level structure.

## `src/pages/landing`

### `LandingPage`

Renders the marketing/entry screen with animated rack units and a link to `/editor`.

Important: it does not initialize editor state. All rack state starts when `EditorPage` mounts.

## `src/pages/editor`

### `extractDragItem`

Normalizes dnd-kit `DragStartEvent` payloads into a local `DragItem`.

Handles:

- `kind: "library"`: resolves a catalog device by `deviceId`.
- `kind: "installed"`: resolves an installed instance and its catalog device.

Returns `null` for malformed drag payloads.

### `RackTrashTarget`

Renders a droppable trash target only while an installed device is being dragged. Dropping an installed device there removes it and its cables.

### `Workspace`

Composes the entire editor workspace.

Owns:

- dnd-kit sensors.
- dragged overlay item.
- mobile library open/closed state.
- guided-tour trigger counter.

Coordinates:

- device placement from library.
- device moves within rack.
- device deletion through trash target.
- session persistence hook.
- keyboard command hook.

### `EditorErrorBoundary`

Protects the editor route from render crashes. It logs the render failure and shows a reload fallback. It does not clear local session data.

### `EditorPage`

Exports the route-level editor component and wraps `Workspace` in `EditorErrorBoundary`.

## `src/features/rack/model`

### `useRackStore`

The main Zustand store. It is wrapped with Immer for mutable-looking reducers and Zundo for undo/redo.

#### `configureRack(size)`

Sets `rackSize` and marks the rack as configured. Used by the first-run rack size modal.

#### `clearRack()`

Removes installed devices, cables, active cable draft, and selection. It keeps the rack configured.

#### `setRackSize(size)`

Changes the frame height if no installed device overflows the requested rack size. If overflow exists, emits a warning notification and leaves state unchanged.

#### `placeDevice(deviceId, slot)`

Finds a catalog device, validates fit with `canPlaceDevice`, creates a new installed instance, and selects it.

Failure behavior:

- unknown device id: no-op.
- no room/overlap: error notification.

#### `placeDeviceInFirstAvailableSlot(deviceId)`

Finds the first slot where the device fits, then delegates to `placeDevice`.

Failure behavior:

- unknown device id: no-op.
- no slot: error notification.

#### `removeDevice(instanceId)`

Removes the installed device and all connected cables. Clears selected device if needed.

#### `moveDevice(instanceId, slot)`

Moves an installed device or swaps it with exactly one conflicting device when possible. Uses `resolveDeviceMove`.

Failure behavior:

- missing instance/catalog device: no-op.
- invalid target: error notification.

#### `startCable(instanceId, portId)`

Arms a source endpoint for patching. Source must be `out`, `send`, `thru`, or `bidirectional`.

Failure behavior:

- invalid/missing source: error notification.

#### `completeCable(instanceId, portId)`

Attempts to connect the armed source to a destination endpoint.

Flow:

1. Resolve source and destination ports.
2. Reject same-device connections.
3. Run `validateConnection`.
4. Emit validation notices as notifications.
5. If allowed, create a cable with protocol color and captured notices.
6. Clear active source and select the new cable.

#### `cancelCable()`

Clears active cable source and selected cable.

#### `deleteCable(cableId)`

Removes one cable and clears selection if that cable was selected.

#### `setViewMode(mode)`

Switches between `front` and `back`. Cancels active cable source to avoid hidden patching state.

#### `selectDevice(instanceId)`

Selects a device and clears selected cable.

#### `selectCable(cableId)`

Selects a cable and clears selected device.

#### `setFilters(filters)`

Merges partial filter updates into `devicePanelFilter`.

#### `notify(notification)`

Adds a notification. Callers may pass `expiresAt`; info notifications created through `appendNotification` auto-expire after four seconds.

#### `dismissNotification(id)`

Removes a notification.

#### `loadSession(session)`

Sanitizes and loads an imported/stored session. Marks rack configured, resets transient editor state, and warns if invalid data was repaired.

#### `getSession()`

Returns the portable `RackSession` snapshot.

#### `undo()` / `redo()`

Delegates to Zundo temporal state.

### Internal Store Helpers

#### `tracked(state)`

Projects full store state into the portable/undoable `RackSession`.

#### `appendNotification(notifications, level, title, message)`

Creates a notification with a random id. Info notifications auto-expire.

#### `portAt(endpoint, installed)`

Resolves a cable endpoint to a live catalog port, including expanded individual sockets.

#### `sanitizeSession(session)`

Repairs sessions by validating installed devices and cables against the current catalog and compatibility rules.

## `src/features/rack/lib`

### `useSessionPersistence`

Loads a saved session once on editor mount. After rack configuration, saves the current session every 30 seconds.

Nuance: there is no immediate save on every edit and no `beforeunload` flush.

### `useEditorCommands`

Registers global keyboard commands:

- `Ctrl/Cmd+Z`: undo.
- `Ctrl/Cmd+Y`: redo.
- `F`: flip front/back when focus is not in input/select.
- `Delete`/`Backspace`: delete selected cable or selected device when focus is not in input/select.
- `Escape`: cancel active cable.

## `src/features/rack/ui`

### `RackConfigurator`

First-run modal for choosing rack height. It stays open until `rackConfigured` is true.

### `EditorHeader`

Top command bar.

Owns:

- rack size selector.
- front/back toggle.
- undo/redo controls.
- clear rack confirmation.
- guided tour trigger.
- manual local save.
- JSON export/import.
- PNG export.

Internal helper:

- `download(content, filename, type)`: creates a temporary object URL and clicks an anchor.

### `RackCanvas`

Main rack viewport.

Owns:

- camera scale/pan.
- fit-to-view behavior.
- pointer position for active cable preview.
- hovered port state passed into `PatchStatusBar`.

Subcomponents:

- `RackFrame`: draws rack rails, unit labels, empty slots.
- `DropSlot`: dnd-kit droppable slot with valid/invalid/swap status.
- `SortableDevice`: invisible hit area over installed front-panel devices.

## `src/features/devices`

### `useFilteredDevices(filters)`

Runs fuzzy search through Fuse.js, then applies category/rack-unit/protocol filters and sorting.

Sort modes:

- popularity descending.
- name A-Z.
- category A-Z.

### `DeviceLibrary`

Renders searchable/filterable device catalog.

Interactions:

- Click a device to place it in first available slot.
- Drag a device to a rack slot.
- Toggle grid/list.
- Filter by category, protocol, rack units.
- Clear filters.
- Shows empty state when no devices match.

Internal components:

- `DeviceCard`
- `CheckboxFilter`

### `DeviceInfoPanel`

Inspector for the selected installed device.

Shows:

- metadata and description.
- rear-panel verification basis.
- original rear-panel port definitions.
- active cable connections for this instance.
- technical specs.
- remove-device confirmation.

## `src/features/patchbay/lib`

### `layoutPorts(instance, device, geometry)`

Calculates rear-panel port positions.

Important logic:

- Expands individual socket groups through `getConnectablePorts`.
- Separates compact socket rows from regular connectors.
- Gives mixed 1U devices a right-side regular connector band so sockets and DB25/network/power connectors remain visible.
- Places mixed 2U+ regular ports below compact rows.
- Uses injected geometry so front/rear dimensions can share placement logic.

### `cablePath(from, to)`

Builds a cubic Bezier path for the active in-progress cable preview.

### `routeCables(cables, positions, geometry)`

Routes saved cables through side raceways.

Internal helpers:

- `assignLanes(intervals)`: greedy interval coloring so overlapping vertical cable ranges get separate lanes.
- `roundedManhattan(points, radius)`: builds an SVG path with rounded 90-degree turns.

## `src/features/patchbay/ui`

### `RearRackSvg`

Renders the entire rear view.

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

Bottom floating status bar for rear-view patching.

States:

- hidden outside rear view unless a port/cable/route is active.
- hovered port summary.
- source armed.
- compatible or blocked hovered target.
- selected cable route with delete action.

Internal helper:

- `endpointInfo(endpoint, installed)`: resolves endpoint to device name and port.

## `src/entities/device`

### `getDeviceById(devices, deviceId)`

Finds a catalog device by id.

### `getConnectablePorts(device)`

Materializes independent physical sockets. If a port has `individualSockets` and `count >= 2`, it creates derived ids like `outputs:1`, `outputs:2`, etc. Otherwise it returns the original port.

### `occupiedSlots(installed, devices)`

Returns every occupied rack slot index.

### `canPlaceDevice(installed, devices, device, slot, rackSize, ignoredInstanceId?)`

Checks rack bounds and overlap. `ignoredInstanceId` is used while dragging/moving an already installed device.

### `resolveDeviceMove(installed, devices, instanceId, requestedSlot, rackSize)`

Returns either:

- direct move target.
- swap resolution with one conflicting device.
- `null` if move is impossible.

### `protocolsForDevice(device)`

Returns unique protocols found on the device rear panel.

### `portColor(port)`

Maps port protocol/direction to a visual color for rear panel glyphs.

### `FrontPanelSvg`

Renders a front panel SVG for a device. Uses deterministic layout and optional meter animation.

Internal helpers:

- `ControlGlyph`: knob/fader/button/display/meter rendering.
- `PatchField`: socket field rendering.
- `clamp`: numeric layout guard.

### `FrontPanelPreview`

Small non-animated SVG preview used in library cards and drag overlay.

### `PortGlyph`

Renders rear connector icon shapes for common connector groups.

## `src/entities/cable`

### `endpointKey(endpoint)`

Builds the stable lookup key for a cable endpoint in the format `instanceId:portId`. Rear-panel rendering and cable routing use this shared helper so endpoint maps cannot drift.

### `COMPATIBILITY_MATRIX`

Physical connector compatibility table. This is the primary place to add or remove connector pairings.

### `validateConnection(source, destination)`

Validates a proposed cable. Returns `{ allowed, notices }`.

Internal helpers:

- `canSource(direction)`
- `canReceive(direction)`
- `isLineLevelMismatch(source, destination)`

### `cableColorForPort(port)`

Chooses cable color by source protocol/type.

## `src/shared`

### `cn(...inputs)`

Merges `clsx` and `tailwind-merge` for class names.

### `localSessionRepository`

Browser localStorage repository.

Methods:

- `load()`
- `save(session)`

### `parseSessionImport(content)`

Parses imported JSON and validates session shape.

Internal validators:

- `isRecord`
- `isInstalledDevice`
- `isCableEndpoint`
- `isCableNotice`
- `isCable`
- `isRackSession`

### `Button`

Shared button primitive with variants: `primary`, `secondary`, `ghost`, `danger`; sizes: `sm`, `md`, `icon`.

### `ToastHost`

Renders the latest four notifications. Info toasts expire automatically; warning/error toasts include a dismiss button.

### `FRONT_GEOMETRY` / `REAR_GEOMETRY`

Shared rack layout constants. Front view is compact; rear view is expanded for ports/labels/cable raceways.
