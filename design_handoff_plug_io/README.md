# Handoff: Plug-I/O — Pro-Audio Rack Builder

## Overview

Plug-I/O is a web app for designing professional 19-inch audio racks. Users place real preamps / compressors / converters / interfaces into a rack chassis, flip between front and rear views, and draw cables between ports while the app validates the signal chain (XLR, Dante, MADI, ADAT, S/PDIF…) in real time.

This bundle delivers a **complete design system + 35 designed screens** that implement the original brief (`DESIGN_BRIEF.md`, also included in this folder) without deviation. Dark theme primary, lime `#C8FF00` accent, DM Sans + IBM Plex Mono.

## About the Design Files

The files under `design_canvas/` are **design references created in HTML/React/Babel** — they are static prototypes meant to show the intended look, layout and behaviour. **Do not ship them as-is.** Your task is to recreate these designs in the target codebase's environment.

The intended target stack (per the brief §4) is:

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** via `@tailwindcss/vite`
- **Radix UI primitives** (Dialog, Popover, Tooltip)
- **Framer Motion 12** for transitions
- **dnd-kit** for drag-and-drop
- **lucide-react** for icons
- **SVG** for rack rendering, panels, ports, cables (no canvas / WebGL)

If you are starting from an existing repo with this stack, integrate into its FSD-style structure (`src/entities`, `src/features`, `src/shared`, `src/pages`). If you are scaffolding from scratch, the same structure is recommended.

## Fidelity

**High-fidelity (hifi).** Colors, typography, spacing, radii, motion durations, and component states are all final. Recreate them pixel-perfectly. The mock files (`*.jsx`) embed exact hex / OKLCH-ready values you can lift verbatim — the canonical source for tokens is `src/tokens.css`.

The interactivity shown is the *design* of the interaction — actual behaviour (cable validation rules, drag-drop snapping, undo stack) must be implemented in production code following the spec below. The brief's §5.3 list of 23 editor states is implemented in this canvas under `canvas-screens-editor.jsx`; each state corresponds to a real production state you must support.

## How to view the designs

```bash
cd design_canvas
# Open index.html directly in a browser — no build needed.
# Pan with drag, zoom with cmd/ctrl-scroll, click any artboard to focus it.
```

`index.html` renders a Figma-like canvas (`design-canvas.jsx` is a tiny pan/zoom wrapper, ignore for production). All design content is in `src/`:

| File | Contents |
|---|---|
| `src/tokens.css`                | **Design tokens** — colors, type, spacing, radii, motion, shadows. The single source of truth for token names. |
| `src/shared.jsx`                | **Design primitives:** `PROTOCOLS`, `DEVICES` catalog, `PortGlyph`, `Cable`, `Icon`, `DeviceFront`, `DeviceRear`, `RackFrame`. |
| `src/editor-chrome.jsx`         | Definitions used in screens: `Logo`, `TopBar`, `LibraryPanel`, `DeviceCard`, `StatusBar`. |
| `src/editor-canvas.jsx`         | More definitions: `RackChassis`, `InspectorPanel`, `Toast`, `Modal`, `ExportMenu`, `ShortcutsModal`, `ConfirmModal`, `EmptyState`, `RackCanvas`, `DeviceRearWithPorts`. |
| `src/canvas-foundations.jsx`    | Foundations artboards: ColorsArtboard, TypeArtboard, MotionArtboard, ProtocolArtboard, PortGlyphsArtboard, CableStatesArtboard. |
| `src/canvas-components.jsx`     | Component artboards: ButtonsArtboard, ChipsArtboard, InputsArtboard, ToastsArtboard, DeviceCardsArtboard, ModalsArtboard. |
| `src/canvas-mock-editor.jsx`    | Reusable frozen-editor mock used to render the 23 editor states (`EditorMock` + `MockTopBar`, `MockLibrary`, `MockCanvas`, `MockInspector`, `MockStatusBar`). |
| `src/canvas-screens-editor.jsx` | The 23 editor screens — one component per state. |
| `src/canvas-screens-special.jsx`| Landing, configurator, mobile, tablet, compare, share, spec-sheet. |

---

## Design tokens

The canonical source is `src/tokens.css`. Replicate as CSS custom properties **and** as your Tailwind `@theme` block. Hex values are duplicated below for fast reference; verbatim is in `tokens.css`.

### Color — neutrals

| Token | Hex | OKLCH | Use |
|---|---|---|---|
| `--bg`            | `#0F0F10` | `oklch(0.155 0.004 280)` | Base canvas |
| `--bg-2`          | `#131416` | `oklch(0.180 0.004 280)` | Secondary base |
| `--surface`       | `#161719` | `oklch(0.197 0.004 280)` | Side panels |
| `--surface-2`     | `#1D1F23` | `oklch(0.232 0.005 268)` | Raised cards |
| `--control`       | `#26292E` | `oklch(0.282 0.007 268)` | Buttons, inputs |
| `--control-hover` | `#2D3137` | `oklch(0.317 0.007 268)` | Button hover |
| `--line`          | `#2A2E34` | `oklch(0.299 0.008 268)` | Dividers |
| `--line-2`        | `#34383F` | `oklch(0.348 0.009 268)` | Borders |
| `--line-strong`   | `#4C525D` | `oklch(0.453 0.011 268)` | Prominent border |
| `--muted-2`       | `#6B7280` | `oklch(0.555 0.022 264)` | Tertiary text |
| `--muted`         | `#9DA4AF` | `oklch(0.711 0.016 265)` | Secondary text |
| `--copy-2`        | `#C8CCD2` | `oklch(0.834 0.010 268)` | Body text |
| `--copy`          | `#F0F1F2` | `oklch(0.949 0.003 268)` | Primary text |

### Color — accent + semantic

| Token | Hex | Use |
|---|---|---|
| `--accent`      | `#C8FF00` | CTA · focus · selection · active state |
| `--accent-2`    | `#B6E800` | Accent hover |
| `--accent-soft` | `rgba(200,255,0,.14)` | Tint surface |
| `--accent-ring` | `rgba(200,255,0,.30)` | Focus halo |
| `--positive`    | `#4ADE80` | Success · meters OK |
| `--warning`     | `#F2A93B` | Warning · over-level meter |
| `--danger`      | `#E05454` | Destructive · validation error |
| `--info`        | `#4093D6` | Neutral notification |

### Color — protocol palette (11 values)

Each protocol is encoded by **color *and* dash pattern** so colorblind users can distinguish them.

| Protocol | Token | Hex | Dash | Short |
|---|---|---|---|---|
| Analog       | `--p-analog`       | `#E0A458` | solid  | ANA |
| AES/EBU      | `--p-aes`          | `#6EE7FF` | dashed | AES |
| S/PDIF       | `--p-spdif`        | `#F2A93B` | dotted | SPD |
| ADAT         | `--p-adat`         | `#B58CFF` | dashed | ADT |
| Dante        | `--p-dante`        | `#6366F1` | solid  | DNT |
| MADI         | `--p-madi`         | `#FF7AB6` | dashed | MAD |
| MIDI         | `--p-midi`         | `#4ADE80` | dotted | MID |
| Wordclock    | `--p-wclock`       | `#9DA4AF` | solid  | WCK |
| USB          | `--p-usb`          | `#6EE7FF` | dashed | USB |
| Thunderbolt  | `--p-thunderbolt`  | `#B58CFF` | solid  | TB  |
| Power        | `--p-power`        | `#E05454` | solid  | PWR |
| Bluetooth    | `--p-bluetooth`    | `#4093D6` | —      | —   |

`PROTOCOLS` object in `src/shared.jsx` is the source of truth.

### Typography

- **Sans (UI):** `'DM Sans', ui-sans-serif, system-ui, sans-serif` — weights 400/500/600/700. Cyrillic supported.
- **Mono (numbers, port labels):** `'IBM Plex Mono', ui-monospace, monospace` — weights 400/500/600.

Scale (fixed, no in-betweens): **10 / 12 / 13 / 14 / 16 / 20 / 24 / 32 / 40 / 56**.

| Role | Family | Size | Weight | LH | Tracking |
|---|---|---|---|---|---|
| Display          | sans | 56 / 64 | 600 | 1.04 | −0.025em |
| H1               | sans | 32      | 600 | 1.1  | −0.02em  |
| H2               | sans | 24      | 600 | 1.2  | −0.01em  |
| H3               | sans | 20      | 500 | 1.25 | −0.005em |
| Body             | sans | 14      | 400 | 1.45 | 0        |
| Small            | sans | 12      | 400 | 1.45 | 0        |
| Mono numerals    | mono | 13      | 500 | 1.2  | −0.01em  |
| Mono small       | mono | 11      | 500 | 1.4  | 0.04em   |
| Label (eyebrow)  | mono | 10–11   | 600 | 1.2  | 0.14em UPPERCASE |

### Spacing

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64` — exposed as `--s-1 … --s-16`. 4-based scale.

### Radius

Slightly odd on purpose (hand-set feel): `3 / 6 / 8 / 10 / 14` and pill (`999px`). Tokens: `--r-1 … --r-5`, `--r-pill`.

### Motion

| Token | Duration | Use |
|---|---|---|
| `--d-instant` | 80ms  | Press feedback, dot pulse |
| `--d-fast`    | 160ms | Hover tint, focus ring |
| `--d-base`    | 240ms | Modals, toasts, accordion |
| `--d-slow`    | 400ms | Cable draw-on, panel slide |
| `--d-deep`    | 600ms | Front ↔ Rear 3D flip |

| Easing | Value | Use |
|---|---|---|
| `--e-standard`    | `cubic-bezier(0.2, 0, 0, 1)`     | Most things |
| `--e-emphasized`  | `cubic-bezier(0.3, 0, 0, 1)`     | Flips, snaps |
| `--e-decelerated` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Enter, slide-in |
| `--e-accelerated` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Exit, dismiss |

`prefers-reduced-motion: reduce` collapses durations to ~1ms. There is also an in-design **Reduced motion** tweak (driven by an `.no-motion` class on the editor root).

### Elevation

No drop shadows on dark surfaces beyond modals. Use `border + inset 1px highlight` for everything below the modal layer.

- `--elev-1` — surface card · `inset 0 1px 0 0 rgba(255,255,255,0.04), 0 1px 0 0 rgba(0,0,0,0.4)`
- `--elev-2` — popover, mid-stack · `inset 0 1px 0 0 rgba(255,255,255,0.06), 0 4px 16px -4px rgba(0,0,0,0.6)`
- `--elev-3` — modal, toast · `inset 0 1px 0 0 rgba(255,255,255,0.08), 0 12px 40px -8px rgba(0,0,0,0.7)`
- `--focus-ring` — `0 0 0 2px var(--bg), 0 0 0 4px var(--accent)` (2px offset, lime, always on focus-visible)

---

## Component library

All components are visible in the design canvas. Implementation notes — where to use Radix, where Tailwind utility classes suffice, where you need custom logic.

### Atoms

| Component | Variants | States | Radix / library | Notes |
|---|---|---|---|---|
| **Button** | primary, secondary (default), ghost, danger × sm (26px), md (32px), lg (40px), icon-only | default, hover, focus-visible, active, disabled, loading | none (native `<button>`) | Tokens: `--control`, `--control-hover`. Primary uses `--accent` background, `--accent-text` foreground. Focus ring is `--focus-ring`. |
| **Icon button** | same as Button, no label | same | none | Square aspect, 32×32 by default, 26×26 sm. |
| **Input** (text, search) | default, focus, error, disabled | + clear affordance for search | none | `--bg-2` background. Focus border `--accent` + 3px `--accent-soft` ring. |
| **Select / Combobox** | — | default, open, disabled | **Radix Popover** | Looks like a button; chevron-down icon to the right. |
| **Checkbox** | — | unchecked, checked, indeterminate, disabled | **Radix Checkbox** | 14×14 square, 3px radius. Check icon stroke is `--accent-text` on accent fill. |
| **Radio** | — | unchecked, checked, disabled | **Radix RadioGroup** | 14×14 circle, 1.5px border. |
| **Switch** | — | off, on | **Radix Switch** | 28×16 pill, 12×12 knob. |
| **Chip / Tag** | default, active (with × close), button (Reset) | hover | none | 22px tall, pill radius, mono font 11px. Protocol chips carry a `<ProtocolDot>` glyph. |
| **Badge** | default, accent, semantic | — | none | 18×min-18 pill, mono 10px. Counter for undo stack uses `--badge`. |
| **Kbd** | — | — | none | 20px tall, mono 11px, bottom-border 2px for tactile feel. |
| **Tooltip** | top, bottom, left, right | — | **Radix Tooltip** | `--bg-2` background, mono 12px, `--elev-3` shadow. Pointer-events none. Never use above ports — show their label in the **status bar** instead. |
| **Divider** | horizontal, vertical | — | none | `--line` 1px. |

### Molecules

| Component | Purpose | Notes |
|---|---|---|
| **TopBar**     | Brand · rack name+size · view toggle · undo/redo · save · export · help | `editor-chrome.jsx`. 48px tall. Each region separated by 1px `--line`. |
| **StatusBar**  | Port hover info / cable selection summary / pending-cable instructions on the left; counts on the right | `editor-chrome.jsx`. 32px tall. Mono font. **No tooltips on ports** — info goes here. |
| **Toast** (Notification) | info / success / warning / error | `editor-canvas.jsx`. 3px left border colored by kind. 320–460px wide. Slide-up from bottom-right, 4s auto-dismiss for info/success/warning, **error sticks until dismissed**. |
| **Modal / Dialog** | Confirm delete, clear rack, configurator, export, shortcuts, etc. | `editor-canvas.jsx`. Uses **Radix Dialog**. 460px default width, `--r-4` radius, `--elev-3` shadow. Backdrop `rgba(8,9,11,0.7)` + 2px blur. Scale-in entrance 240ms `--e-emphasized`. |
| **Popover** (filters, action menu) | List of actions, filter groups | `editor-canvas.jsx`. **Radix Popover**. `--surface-2` background, 1px `--line-2`, `--elev-2` shadow. |
| **EmptyState** | Library "no results", inspector "nothing selected", connections empty | `editor-canvas.jsx`. 44px circle icon background, title 13px, body 12px muted. |
| **Skeleton loaders** | Loading session (screen 18) | Use the `@keyframes skel` from `index.html` — opacity 0.4 → 0.7. Use as `background: var(--surface-2)` rectangles staggered by 60ms each. |

### Organisms

| Component | Notes |
|---|---|
| **DeviceCard** (grid) | `editor-chrome.jsx`. ~120px wide, `aspectRatio: 4 / 1.2` for the device preview, name 12px below, mfr 10px mono, U chip on the right. |
| **DeviceCard** (list) | 36×18 preview thumbnail, 12px name, 10px mfr · category, U chip on the right. 36px tall row. |
| **LibraryPanel** | 296px wide (296 desktop, narrow 220 on tablet). Header: eyebrow + count + filter icon · search input · active filter chips · optional inline filter dropdown. Body: grid (2-col) or list. Footer reserved for collapse. |
| **RackChassis** | 19″ chassis with mounting ears, U index numbers, screws in corners. 460px inner width is the canonical render size. **`U_HEIGHT = 38px`** (1U). |
| **RackCanvas** | The pan/zoom container around the chassis. Backed by radial dot grid (24×24px). Top-left: view chip + drawing-cable chip + signal-flow chip. Top-right: zoom in/out + percent chip. Bottom: kbd hints + counters. |
| **FrontPanelGraphics** | SVG illustrations of preamp / comp / converter / interface / EQ / power-strip / network — see `src/shared.jsx` `FrontPanelGraphics`. **Each new device type adds another `frontStyle` branch**, built from the primitives `knob`, `led`, `screw`. |
| **RearPanelGraphics** | Port row with label above, glyph in center, protocol-short label below in colored mono. |
| **PortGlyph** | 26 connector variants × 11 protocols (color from PROTOCOLS). 3 states: `idle`, `compatible` (pulse-ring accent), `invalid` (red halo). |
| **Cable** | Bezier path: shadow (`rgba(0,0,0,0.55)` 3.6px translated +1.5y) + main stroke 2.4px + endpoint dots. `state`: `idle` / `selected` (glow) / `invalid` (red). `dimmed` (opacity 0.25) used for signal-flow scoping. Dash pattern is set per protocol. |
| **InspectorPanel** | 340px wide. Tabs: device → Overview / Ports / Connections / Specs; cable → Route / Meta. Bottom-anchored action row (Duplicate + Remove for device; Disconnect for cable). |

---

## Screens

35 designed surfaces. Each is implemented in the canvas as a static mock with exact spacing/colour — copy from the corresponding file.

### 03 · Editor — 23 states (per brief §5.3)

All in `src/canvas-screens-editor.jsx`. Standard size **1280 × 760 px**.

| # | State | Component | Trigger | Notes |
|---|---|---|---|---|
| 01 | Empty rack + onboarding hint     | `ScreenEmptyEditor`       | App start, no localStorage | Dimmed U-index column, ghost SVG illustration in canvas, "Drag a device or ⌘K" copy. |
| 02 | Device selected (front)          | `ScreenDeviceSelected`    | Click device                | Glow ring 1px lime + 28px outer glow at 32% opacity. Inspector opens on Overview tab. |
| 03 | Rear view, idle                  | `ScreenRearIdle`          | View toggle / `R`           | All ports visible with labels + protocol shortcodes. |
| 04 | Rear view, cable being drawn     | `ScreenCableInProgress`   | Click port                  | Source port pulse; compatible ports get accent halo; cable bezier follows mouse with `--accent`; inspector swapped to "Routing" panel; status bar shows source & instructions. |
| 05 | Cable selected                   | `ScreenCableSelected`     | Click cable                 | Cable selected (lime, glow); inspector shows Route panel with source / arrow / destination. |
| 06 | Invalid patch attempt + toast    | `ScreenInvalidPatch`      | Click incompatible dest     | Cable disintegrates (200ms path-disintegrate), error toast slides up: title + specific reason. Target port flashes red 200ms. |
| 07 | Drag from library                | `ScreenDragInProgress`    | Mouse-down on lib card      | Drag overlay (scale 1.02, lime border + 30px glow, slight rotation); slot beneath cursor highlights lime if valid, red if not (full-row dashed). Trash zone surfaces at bottom (not shown in mock — add via Framer Motion AnimatePresence). |
| 08 | Drag reorder + swap warn         | `ScreenDragReorder`       | Drag existing device        | Origin slot shows diagonal ghost pattern; warning amber outline on swap target. |
| 09 | Library: empty search            | `ScreenLibraryEmptySearch`| Search yields 0             | Empty-state inside the library panel; "Clear filters" button. |
| 10 | Library: filters active          | `ScreenLibraryFiltersActive` | Filter open                | Filter chips above list, inline filter dropdown with category/protocol groups. |
| 11 | Library: list view               | `ScreenLibraryList`       | View toggle in library      | Dense 36-px rows. |
| 12 | Inspector: empty                 | `ScreenInspectorEmpty`    | Deselect all                | Centered empty state. |
| 13 | Confirm device delete            | `ScreenConfirmDelete`     | Delete device that has cables | Modal with cable count, danger style. |
| 14 | Clear rack confirmation          | `ScreenClearRack`         | Menu → Clear                | Modal with preview list of every item being removed. |
| 15 | Save toast                       | `ScreenSaveToast`         | `⌘S`                        | Success toast with timestamp + "⌘Z to undo" affordance. |
| 16 | Export menu                      | `ScreenExportMenu`        | `Export` button             | Modal with 4 formats (JSON / PNG · 2× / PDF spec sheet / SVG). |
| 17 | Onboarding tour                  | `ScreenOnboardingTour`    | First run, optional         | Dark overlay with cutout spotlight over Library (Step 1/3). Callout has Skip + Next, dot indicator. |
| 18 | Loading session                  | `ScreenLoadingSkeleton`   | App start with localStorage | Skeleton rectangles in library, canvas, inspector. Center: spinner + label. |
| 19 | Malformed-session recovery       | `ScreenMalformedSession`  | Restored session has errors | Amber-border banner above canvas; "View details" + dismiss. |
| 20 | Front ↔ Rear flip mid-state      | `ScreenFlipMid`           | View toggle                 | 3D rotateY at 60° / 180°; perspective 1200px; 600ms `--e-emphasized`. Devices slightly raised mid-flip. |
| 21 | Undo stack history               | `ScreenUndoHistory`       | Hover undo button >1s       | Popover listing last N actions with timestamps; topmost row highlighted lime. |
| 22 | Signal-flow overlay              | `ScreenSignalFlow`        | Tweak: signal-flow ≠ off    | Cables colored by source-chain; out-of-chain cables dimmed; inspector shows flow legend. |
| 23 | Shortcuts modal                  | `ScreenShortcuts`         | `?`                         | 540-wide modal, 4 keybind groups. |

### 04 · Adaptive

| Screen | Component | Notes |
|---|---|---|
| Tablet (1024) | `ScreenTablet` | Library collapses to 56-px **icon rail**. Inspector becomes a 320-px slide-over overlay. |
| Mobile (390)  | `ScreenMobile` | Library is a **bottom-sheet drawer** above the bottom tab bar. Front/rear segmented control above the canvas. 5-tab bottom nav: Rack · Library · Flow · Preview · More. Cable editing **view-only on mobile** per brief §9. |

### 05 · Beyond the editor

| Screen | Component | Route |
|---|---|---|
| Landing                   | `ScreenLanding`      | `/` |
| Rack-size configurator    | `ScreenConfigurator` | `/editor#new` (or inline split — see brief §5.2 open question) |
| Compare view (A vs B)     | `ScreenCompare`      | `/compare/:a/:b` |
| Share / read-only viewer  | `ScreenShareViewer`  | `/r/:slug` |
| Print · A4 spec sheet     | `ScreenSpecSheet`    | `/print/:id` or auto-CSS-print |

---

## Behaviour spec

### Cable drawing — validation rules

When the user clicks a port (the *start*), the next port click must satisfy:

1. **Protocol match.** `start.protocol === end.protocol`. If not → toast: `"<StartProtocol> <StartDir> → <EndProtocol> <EndDir>: protocol mismatch"`, port flashes red, no cable created.
2. **Direction inverse.** `start.dir !== end.dir` (one OUT, one IN). If not → toast: `"<dir> → <dir>: оба порта одного направления"`.
3. **Not the same port.** `start.id !== end.id` (cancel by clicking the same port again).

On success, create cable with `srcPlacement/srcPort` always = OUT and `dstPlacement/dstPort` always = IN regardless of click order. Push an "Patch cable (<Protocol>)" entry into the undo stack.

While drawing: compatible ports get a pulsing lime ring (`@keyframes pulse-ring`), incompatible ports stay idle (or red-halo if you want to surface invalid candidates aggressively — see invalid-port behaviour in `ScreenInvalidPatch`). Cursor "sticks" the cable end to the nearest port within ~12px (snap).

### Drag-drop — slot occupancy

When dragging a device into the rack, compute occupied slots:

```ts
const occupied = new Set<number>();
for (const p of placements) {
  const d = deviceById[p.deviceId];
  for (let i = 0; i < d.u; i++) occupied.add(p.slot + i);
}
function fits(slot: number, u: number) {
  if (slot + u > rackUnits) return false;
  for (let i = 0; i < u; i++) if (occupied.has(slot + i)) return false;
  return true;
}
```

Highlight the would-be slot range: lime if `fits()`, red if not. On drop into invalid → spring bounce back to library, no placement.

### Keyboard shortcuts (per brief §8)

| Key | Action |
|---|---|
| `V` | Front view |
| `R` | Rear view |
| `⌘K`  | Open quick search (focus library input) |
| `⌘Z`  | Undo |
| `⌘⇧Z` | Redo |
| `⌘S`  | Save session |
| `⌘E`  | Open export menu |
| `Del` | Remove selected device or cable |
| `Esc` | Cancel pending cable / close modal / dismiss tour |
| `?`   | Open shortcuts modal |
| `Space` | Pan canvas |

Show all of them in the Shortcuts modal (screen 23).

### State management

Use a single Zustand store (matches existing `use-rack-store.ts` per brief §11). Shape:

```ts
type RackStore = {
  // structure
  rackUnits: number;                                 // 4 | 6 | 8 | 12 | 16 | 24
  view: 'front' | 'rear';
  placements: Placement[];                           // {id, deviceId, slot}
  cables: Cable[];                                   // {id, srcPlacement, srcPort, dstPlacement, dstPort, protocol}

  // UI
  selection: { kind: 'device' | 'cable' | null; id?: string };
  hover: { kind: 'port' | 'cable'; placementId?: string; portId?: string; id?: string } | null;
  pendingCable: { srcPlacement: string; srcPort: string; srcProtocol: ProtocolId; srcDir: 'in'|'out' } | null;
  dragDevice: string | null;                         // device id from library
  dragHoverSlot: number | null;

  // history
  undo: HistoryEntry[];
  redo: HistoryEntry[];

  // tweaks/preferences
  libView: 'grid' | 'list';
  density: 'comfortable' | 'compact';
  signalFlow: 'off' | 'protocol' | 'source';
  reducedMotion: boolean;

  // session
  sessionMeta: { name: string; updatedAt: number };
};
```

Persist to localStorage on every commit (`onChange` middleware), keyed by `plug-io.session.<slug>`. On boot, attempt to restore; if a cable references a missing device, drop the cable and surface the malformed-session banner (screen 19).

### Motion script — 6 key interactions

| Interaction | Property | Duration | Easing | Notes |
|---|---|---|---|---|
| Drag from library | `scale 1 → 1.02`, `boxShadow` swap, source `opacity 1 → 0.4` | 120ms | `--e-emphasized` | Use Framer Motion `layoutId` to animate to the drop target. |
| Drop valid | `scale 1.05 → 1`, ring flash from `--accent` to transparent | 240ms | `--e-decelerated` | "Suction" feel; lock to slot center. |
| Drop invalid | `x: 0 → +12 → −12 → 0` + red ring flash | 320ms total | spring `stiffness: 400, damping: 18` | Then snap back to library. |
| Front ↔ Rear flip | `rotateY 0 → 90 → 180` on `.rack-canvas-inner > div`; `perspective: 1600px` on the parent | 600ms | `--e-emphasized` | Devices slightly translate Z mid-flip; status bar text fades. |
| Pending cable | endpoint pulse-ring (`@keyframes pulse-ring`, 1.2s loop); bezier path updates every `mousemove` | continuous | linear | Use `requestAnimationFrame` for smoothness; debounce path setState through a ref. |
| Cable commit | snap; flash both endpoints lime (200ms); cable path draws in (`stroke-dashoffset 200 → 0`, 240ms) | 240ms | `--e-emphasized` | Then push to cables[] and update inspector. |

Wrap **every** transform/opacity animation in a `useReducedMotion()` Framer guard. The class `.no-motion` on the editor root collapses all durations to ~1ms (already wired in `tokens.css`).

---

## Iconography

- Family: **lucide-react**, single stroke weight 1.6, rounded joins.
- Default size **16px**, micro-hint **12px**, section header glyph **20px**, dice/large CTA **24px**.
- Color always inherits from text; never colored for decoration; only when carrying state (low-HP red, resistance green, etc.). For Plug-I/O specifically, no decorative coloring at all — port glyphs are colored, everything else is monochrome.
- `src/shared.jsx` `ICON_PATHS` is the inline-SVG fallback used by the canvas — use real `lucide-react` imports in production. Names map 1:1 (e.g. `Icon name="zoomIn"` → `<ZoomIn>`).

---

## Device catalog (data model)

The canonical catalog is in `src/shared.jsx` (`DEVICES` constant). Migrate as `src/data/devices.ts` or `src/entities/device/lib/devices.ts`. Shape:

```ts
type Device = {
  id: string;
  name: string;
  mfr: string;
  category: 'Preamp' | 'Compressor' | 'EQ' | 'Converter' | 'Interface' | 'Network' | 'Power';
  u: 1 | 2 | 3 | 4;
  color: string;                  // chassis hex
  desc: string;                   // 1-2 sentence
  specs: Record<string, string>;  // sparse table for the Specs tab
  frontStyle: 'preamp-vintage' | 'comp-modern' | 'converter-mod' | 'iface-screen'
            | 'preamp-4ch' | 'eq-3band' | 'power-strip' | 'network-modern';
  portsRear: Port[];
};

type Port = {
  id: string;
  kind:  'xlrM' | 'xlrF' | 'trs' | 'ts' | 'rca' | 'bnc' | 'rj45'
       | 'optical' | 'usbA' | 'usbB' | 'usbC' | 'thunderbolt'
       | 'powerCon' | 'iec' | 'midi5';
  protocol: keyof typeof PROTOCOLS;
  dir:   'in' | 'out';
  label: string;                  // shown above the glyph: "INPUT", "OUT L"
};
```

The 8 devices in the canvas catalog are sufficient demo data. **All names are fictitious** ("WaveTec X73-A", "Nova VCA-2", "Rhythm Converter 8/8", "Panorama Studio 16", "Axiom Pre-4 Mk II", "Meridian EQ-3", "PowerDist 8 Pro", "Dante Bridge 64") — extend with real-world catalog as needed, but the data shape stays identical.

### `frontStyle` system

Each `frontStyle` is a hand-drawn SVG composition in `FrontPanelGraphics` (`src/shared.jsx`) built from three primitives:

- `knob(x, y, r, label, value)` — dial with indicator line. `value` ∈ [0, 1] maps to rotation `−135° … +135°`.
- `led(x, y, r, color)` — soft halo + dot.
- `screw(x, y)` — 4 of these in the corners + chassis-name text + brand text.

Add a new `frontStyle` by extending the branching in `FrontPanelGraphics`. Render at 1U-height resolution (`U_HEIGHT = 38px` × `device.u`) — never raster a panel.

---

## Accessibility checklist

- [ ] **Contrast.** All body text ≥ AA against `--bg`. Port labels, U-numbers and validation errors are AAA.
- [ ] **Focus-visible ring** on every interactive element: `0 0 0 2px var(--bg), 0 0 0 4px var(--accent)`. Already in `:focus-visible` in `tokens.css`.
- [ ] **Keyboard flow.** `Tab` traverses Library → Canvas → Inspector → TopBar buttons. Arrows inside the rack canvas move slot focus; Enter places/selects; Space toggles front/rear; Esc cancels pending cable / closes modal.
- [ ] **Radix ARIA.** All modals use `Dialog.Root` (auto-applies `role="dialog"`, focus trap, ESC, scroll lock). All icon-only buttons need `aria-label`.
- [ ] **Live region.** Toasts must announce: `<div role="status" aria-live="polite">` wrapper. Errors use `aria-live="assertive"`. Status-bar copy uses `role="status"` too.
- [ ] **Color-not-only.** Protocols carry **dash pattern** in addition to color (see Cable). Port glyphs convey IN/OUT via the visible "·IN" or "·OUT" suffix.
- [ ] **`prefers-reduced-motion`.** Honored globally via `tokens.css` media query. Plus a manual toggle exposed as a tweak.

---

## Implementation map

Suggested files in a FSD-flavoured project:

| Design surface | File |
|---|---|
| **Tokens** | `src/app/styles/tokens.css` + Tailwind `@theme` block in `tailwind.config.ts` |
| **Global styles** | `src/app/styles/index.css` (imports tokens, base resets, scrollbar) |
| Buttons, chips, badge, kbd, input, switch, checkbox, radio | `src/shared/ui/*` |
| Tooltip, popover, modal, toast | `src/shared/ui/*` wrapping Radix primitives |
| EmptyState, Skeleton | `src/shared/ui/*` |
| PortGlyph, Cable, ProtocolDot | `src/shared/audio/*` (domain-shared visual) |
| Device types | `src/entities/device/model/types.ts` |
| Device catalog | `src/entities/device/lib/devices.ts` |
| Device card (grid + list), DeviceFront, DeviceRear | `src/entities/device/ui/*` |
| Cable type + helpers | `src/entities/cable/model/types.ts`, `src/entities/cable/lib/validation.ts` |
| Rack model | `src/entities/rack/model/types.ts` |
| RackChassis | `src/entities/rack/ui/RackChassis.tsx` |
| Rack canvas (pan/zoom, drag-drop, cable interactions) | `src/features/rack/ui/RackCanvas.tsx` + `use-rack-store.ts` |
| Library panel | `src/features/library/ui/LibraryPanel.tsx` + `use-library.ts` |
| Inspector panel | `src/features/inspector/ui/InspectorPanel.tsx` |
| TopBar, StatusBar | `src/widgets/*` |
| Configurator modal | `src/features/rack-size/ui/ConfiguratorModal.tsx` |
| Onboarding tour | `src/features/onboarding/ui/Tour.tsx` |
| Signal-flow overlay | `src/features/signal-flow/lib/trace.ts` + overlay in RackCanvas |
| Export | `src/features/export/lib/*.ts` (json, png via dom-to-image, pdf via @react-pdf/renderer, svg verbatim) |
| Compare view | `src/pages/compare/CompareView.tsx` |
| Read-only viewer | `src/pages/share/ShareView.tsx` |
| Print spec-sheet | `src/pages/print/PrintSheet.tsx` (CSS print or `@react-pdf/renderer`) |
| Landing | `src/pages/landing/LandingPage.tsx` |

---

## Risks & open questions

These were called out in the brief; track them in the project tracker.

1. **Configurator UX:** modal vs split-screen inline. Brief asks for both. Recommendation: ship modal first (`ScreenConfigurator`), open issue for inline iteration.
2. **Compare view diff overlay (proposed):** spec only sketches; need UX-pass on what a "diff" means visually for racks (different colours for added / removed / kept devices).
3. **Cable length input:** Brief mentions length as a field. Current inspector shows a `—` placeholder. Decide whether to support manual length or auto-route lengths (path measurement).
4. **Print/PDF backend:** `@react-pdf/renderer` vs CSS `@page` print. Spec-sheet design intentionally uses light page background — see `ScreenSpecSheet` for the visual contract.
5. **Cable snap distance:** chose ~12px in the design. Calibrate on real input devices.
6. **Mobile editing:** current scope is view-only on mobile per brief §9. Confirm with product before committing.

---

## Files in this bundle

```
design_handoff_plug_io/
├── README.md                          ← you are here
├── DESIGN_BRIEF.md                    ← the original brief (kept for reference)
└── design_canvas/
    ├── index.html                     ← open in a browser to see all designs
    ├── design-canvas.jsx              ← pan/zoom canvas wrapper (not for prod)
    └── src/
        ├── tokens.css                 ← THE token source
        ├── shared.jsx                 ← protocols, devices, glyphs, cable, icons
        ├── editor-chrome.jsx          ← Logo, TopBar, LibraryPanel, DeviceCard, StatusBar
        ├── editor-canvas.jsx          ← RackChassis, Inspector, Toast, Modal, ExportMenu, ShortcutsModal, ConfirmModal, EmptyState, RackCanvas, DeviceRearWithPorts
        ├── canvas-foundations.jsx     ← Colors, Type, Motion, Protocols, Ports, Cable states
        ├── canvas-components.jsx      ← Buttons, Chips, Inputs, Toasts, Cards, Modals
        ├── canvas-mock-editor.jsx     ← EditorMock + Mock* primitives
        ├── canvas-screens-editor.jsx  ← all 23 editor states
        └── canvas-screens-special.jsx ← landing, configurator, mobile, tablet, compare, share, spec-sheet
```

Good luck — and ping back any token / spacing question; the canonical answer is always in `tokens.css` or `shared.jsx`.
