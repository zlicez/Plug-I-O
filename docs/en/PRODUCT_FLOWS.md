# Product Flows

## Primary User Personas

- Studio owner planning a rack before buying or rewiring hardware.
- Audio engineer documenting a patch layout.
- System tech checking whether a proposed connection is physically/protocol compatible.
- Developer/QA verifying rear-panel density and routing behavior.

## Main User Journey

1. User opens `/`.
2. User clicks `Start building`.
3. Editor opens and shows rack frame configurator.
4. User chooses 4U, 8U, 12U, 16U, 20U, or 24U.
5. User searches/filter devices in the library.
6. User clicks a device or drags it to a slot.
7. User arranges devices in the front view.
8. User switches to rear view.
9. User clicks a valid source port.
10. User hovers/clicks a destination port.
11. App creates a cable or shows validation errors/warnings.
12. User inspects devices/cables, deletes or adjusts.
13. User saves locally, exports JSON, imports JSON, or exports PNG.

## Landing Page

Purpose:

- Communicate product category quickly.
- Route the user into the editor.

Current UI states:

- Static animated rack illustration.
- Steps summary: choose rack size, drag devices, patch connections.
- Single launch CTA.

Weak spots:

- No example project templates.
- No "open last rack" affordance even though local autosave exists.
- No explicit browser/local-only data notice.

## Rack Configuration

The configurator appears until `rackConfigured` is true.

Available frame sizes:

- 4U
- 8U
- 12U
- 16U
- 20U
- 24U

State transitions:

- unconfigured -> configured when user chooses a size.
- imported or locally restored session -> configured automatically.
- clearing rack does not return to unconfigured.

Error/edge behavior:

- Changing frame size later is blocked if existing devices overflow the new height.
- The first configurator has no cancel path because the editor needs a frame size.

## Device Library

User goals:

- Find hardware quickly.
- Understand size/category.
- Add by click or drag.

Controls:

- fuzzy search by name/manufacturer/tags.
- category multi-select.
- protocol multi-select.
- rack-unit filter.
- sort by popularity, name, category.
- grid/list toggle.

Empty states:

- No matching devices: shows icon, copy, and reset filters action.

Failure states:

- Click-to-add with no available space triggers an error toast.
- Drag-to-slot with invalid space shows invalid slot status and move is rejected if dropped.

Nuances:

- Clicking a card places it in first available slot.
- Dragging suppresses the click handler to avoid accidental duplicate adds.
- Mobile uses a drawer-style library toggle.

## Front Rack Editing

User goals:

- Arrange equipment vertically.
- See approximate front-panel identity.
- Move or remove installed devices.

Interactions:

- Drag library item to slot.
- Drag installed device to another slot.
- Swap is allowed when exactly one conflicting device can take the moving device's old slot.
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
- Understand why a cable is blocked or risky.

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

- starting from a non-source port.
- choosing destination on the same device.
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

Opened by selecting an installed device.

Shows:

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

- Inspector is device-only; cable details live in hover/status UI, not a full inspector.
- Port list shows catalog/base ports, not always every expanded individual socket.

## Save, Import, Export

Manual save:

- Saves `getSession()` to localStorage.
- Shows info notification.

Autosave:

- Every 30 seconds after rack is configured.

JSON export:

- Downloads `plug-io-session.json`.

JSON import:

- Reads file text.
- Parses and structurally validates.
- Store sanitizes against live catalog.
- Invalid JSON or invalid shape shows import error toast.
- Repaired session shows warning toast.

PNG export:

- Captures `RackCanvas` rendered node with `html-to-image`.
- Uses background `#0f0f10` and pixel ratio 2.
- Downloads `plug-io-rack.png`.

Weak spots:

- Autosave is interval-based, so the last few seconds of edits can be lost on abrupt tab close.
- PNG export errors are not caught or surfaced.
- File input value is not reset after import; importing the same file twice may require reselect behavior depending on browser.

## Keyboard Paths

- `Ctrl/Cmd+Z`: undo rack/session state.
- `Ctrl/Cmd+Y`: redo rack/session state.
- `F`: toggle front/back if focus is not in input/select.
- `Delete`/`Backspace`: delete selected cable or selected device if focus is not in input/select.
- `Escape`: cancel active patch cable.

Missing:

- `Ctrl/Cmd+Shift+Z` redo.
- documented shortcuts UI.
- keyboard-only drag/drop alternative for rack placement beyond dnd-kit basics.

## Notifications

Notifications are stored in `useRackStore`.

Levels:

- `info`
- `warning`
- `error`

Behavior:

- latest four render.
- info messages auto-expire.
- warning/error remain until dismissed.
- validation notices may create multiple notifications during one cable attempt.

Potential improvement:

- deduplicate repeated notices.
- group multi-notice cable validation into one toast.

## Empty States and Blanks

Known empty/blank states:

- Landing page before editor.
- Rack configurator before a frame exists.
- Empty rack after configuration.
- Device library empty search.
- Device inspector hidden when no device is selected.
- Device inspector connections section: "No current patching."
- Rear view with no installed devices.
- Patch status bar hidden when nothing is active.
- `blank` profile device has no rear ports and is useful as a spacer/blank panel.

## Error and Recovery Paths

Editor render crash:

- `EditorErrorBoundary` shows fallback and reload button.
- Saved local session remains untouched.

Malformed local session:

- `localSessionRepository.load()` returns `null` if JSON cannot parse or does not match session shape.

Malformed import:

- `parseSessionImport` throws.
- `EditorHeader` catches and shows import error.

Partially stale import:

- `loadSession` repairs against catalog and route rules.
- User sees "Session repaired" warning.

Drag/drop rejected:

- Store emits notification; UI drag overlay is cleared.

Patching rejected:

- Store keeps active source unless the user cancels or switches view.
- This lets user try another destination.
