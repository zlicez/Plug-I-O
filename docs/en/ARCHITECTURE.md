# Architecture

## Architectural Style

The codebase is organized close to feature-sliced architecture:

```text
app       application shell, routes, global styles
pages     route-level screens
features  user-facing workflows and stateful feature modules
entities  domain entities: device and cable
shared    cross-cutting primitives and utilities
data      catalog source data
qa        browser automation probes and captured screenshots
```

The important dependency direction is:

```text
app -> pages -> features -> entities -> shared
data -> entities
features -> data where catalog lookup is required
```

There is no backend boundary yet. The browser is the complete runtime.

## High-Level Flow

1. `main.tsx` mounts `App`.
2. `App` wraps routes in Radix `Tooltip.Provider`, mounts the router, and mounts `ToastHost`.
3. The landing page links to `/editor`.
4. `/editor` lazy-loads `EditorPage`.
5. `EditorPage` initializes:
   - dnd-kit sensors.
   - `useEditorCommands` for keyboard shortcuts.
   - `useSessionPersistence` for local session loading/autosave.
   - `DeviceLibrary`, `RackCanvas`, `DeviceInfoPanel`, `RackConfigurator`, and `EditorTour`.
6. `useRackStore` is the single source of truth for rack state and business actions.
7. Rear-view patching uses:
   - `layoutPorts` to place physical endpoints.
   - `validateConnection` to accept/block cable creation.
   - `routeCables` to draw readable cable paths.

## State Ownership

### Global Editor State

Owned by `src/features/rack/model/use-rack-store.ts`.

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

Used for UI mechanics that should not enter the session:

- `EditorPage`: dragged item, mobile library drawer, guided-tour request counter.
- `RackCanvas`: pointer, hovered port, zoom, pan, panning state.
- `RearRackSvg`: hovered cable id.
- `DeviceInfoPanel`: delete confirmation dialog open state.
- `EditorHeader`: clear confirmation dialog open state.
- `EditorTour`: active step, measured spotlight rect, closed request id.

## Undo/Redo

Zundo wraps the Zustand store. It tracks only `RackSession` via `partialize: tracked`.

Tracked:

- rack height
- installed devices
- cables

Not tracked:

- selected item
- active cable draft
- view mode
- search/filter state
- notifications
- tour state

The history limit is 50. Equality is currently computed with `JSON.stringify`, which is simple and reliable for this small state shape, but could become a performance concern if sessions grow substantially.

## Rack Placement

Placement uses zero-based slots internally. UI labels display one-based `1U`, `2U`, etc.

Rules:

- Device must fit within `rackSize`.
- Device cannot overlap another installed device.
- Moving can swap with exactly one conflicting device if both devices fit after the swap.
- Reducing rack size is blocked if any installed device would overflow the new height.
- Removing a device also removes every cable connected to it.

Core functions:

- `canPlaceDevice`
- `resolveDeviceMove`
- `occupiedSlots`

## Front View

Front view focuses on physical rack composition:

- SVG `RackFrame` draws rails, screws, unit labels, empty slots.
- `FrontPanelSvg` renders each installed device.
- dnd-kit overlays invisible hit targets over rack slots.
- installed devices are sortable/draggable through `SortableDevice`.
- device library cards can be dragged into slots or clicked into first available slot.

The front view does not expose ports or patching.

## Rear View

Rear view focuses on patching:

- `RearRackSvg` renders rear panels, ports, cable routes, cable notice icons, active cable preview, and hover tooltip.
- `layoutPorts` turns device ports into actual `PortLocation` values.
- `getConnectablePorts` expands individual socket banks into individual endpoints.
- `validateConnection` determines whether a selected source can connect to a destination.
- `routeCables` routes all saved cables through side raceways to reduce visual overlap.
- `PatchStatusBar` summarizes hovered port, active patch source, compatible/blocked target, or selected cable.

## Cable Validation

Validation is intentionally pragmatic rather than exhaustive electrical modeling.

Hard blockers:

- source direction is not `out`, `send`, `thru`, or `bidirectional`.
- destination direction is not `in`, `return`, or `bidirectional`.
- source and destination are on the same installed device.
- AES/EBU XLR is patched directly to analog XLR or vice versa.
- physical connector type is not allowed by `COMPATIBILITY_MATRIX`.

Warnings/info:

- S/PDIF vs word clock.
- Dante vs AVB.
- Hi-Z source into Lo-Z input.
- +4 dBu output into -10 dBV input.
- mono source into stereo input.
- send -> return insert loop.
- MIDI THRU forwarding.

## Cable Routing

`routeCables` resolves each cable endpoint through a `Map<instanceId:portId, PortLocation>`.

Routing strategy:

1. Skip cables with missing endpoint positions.
2. Choose left or right raceway based on average endpoint X position.
3. Build vertical intervals from endpoint Y values.
4. Assign raceway lanes with greedy interval coloring.
5. Draw rounded Manhattan paths from source to raceway, down/up the raceway, then to destination.

This keeps cables readable for dense racks while preserving simple deterministic output.

## Session Import Path

Import has two gates:

1. `parseSessionImport` checks JSON shape and session version.
2. `loadSession` sanitizes against live catalog/business rules.

Repair behavior:

- unknown device ids are removed.
- duplicate instance ids are removed.
- overflowing or overlapping devices are removed.
- cables with missing endpoints are removed.
- cables whose source/destination no longer validate are removed.
- repaired sessions trigger a warning notification.

## Styling

All app styles live in `src/app/styles/index.css`.

There is no component-scoped CSS or CSS module layer. Class names are organized by feature names, for example:

- `landing-*`
- `editor-*`
- `device-*`
- `rack-*`
- `patch-*`
- `toast-*`
- `tour-*`

The project has Tailwind installed through the Vite plugin, but the UI currently uses authored CSS classes rather than Tailwind utility composition.

## External Integration Points

- Browser `localStorage` for auto-save/manual save.
- Browser file input for JSON import.
- Browser download links for JSON and PNG export.
- `html-to-image` for PNG capture.
- Playwright-style QA scripts in `qa/`; these assume a running dev server via `APP_URL` or `http://localhost:5174/`.
