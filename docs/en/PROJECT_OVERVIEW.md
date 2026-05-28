# Project Overview

## Product Summary

Plug-I/O Rack Builder is a studio routing workspace for planning 19-inch rack builds. The product answers four core questions:

1. What devices are installed in the rack?
2. Where do they fit physically?
3. Which rear-panel ports can be patched together?
4. What warnings should the user see before a routing plan becomes misleading?

The current application is a single-page React app with no backend. It stores the active rack session in browser `localStorage`, supports JSON import/export, and can render the rack view to PNG.

## Stack

- React 19 with TypeScript.
- Vite 6 for dev server and production build.
- React Router 7 for `/` and `/editor`.
- Zustand + Immer + Zundo for editor state, immutable updates, undo/redo.
- dnd-kit for drag/drop device placement.
- Radix Dialog/Popover/Tooltip for accessible overlays.
- Framer Motion for visual transitions.
- Fuse.js for fuzzy search in the device library.
- html-to-image for PNG export.
- Vitest + jsdom for unit tests.
- ESLint Airbnb + TypeScript + jsx-a11y, Prettier.

## Commands

| Command              | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Starts the Vite dev server.                          |
| `npm run build`      | Runs `tsc -b` and creates the Vite production build. |
| `npm run typecheck`  | Runs TypeScript project checks without emit.         |
| `npm test`           | Runs all Vitest tests once.                          |
| `npm run test:watch` | Runs Vitest in watch mode.                           |
| `npm run lint`       | Runs ESLint over `src/**/*.ts(x)`.                   |
| `npm run format`     | Runs Prettier over the project.                      |

## Runtime Entry Points

- `index.html` mounts the app into `#root`.
- `src/main.tsx` creates the React root, wraps the app in `StrictMode`, and imports global styles.
- `src/app/App.tsx` declares routes:
  - `/` renders `LandingPage`.
  - `/editor` lazy-loads `EditorPage`.
- `ToastHost` is always mounted under the router so notifications can be raised from any editor action.

## Build Configuration

`vite.config.ts` configures React, Tailwind CSS v4, Vitest, and manual vendor chunks:

- `react`
- `radix-ui`
- `motion`
- `drag-and-drop`
- `image-export`
- `icons`
- `state`

The split is useful because the editor is heavy and the route itself is lazy-loaded.

## Domain Model

### Device

Defined in `src/entities/device/model/types.ts`.

A `Device` represents a rackable unit with:

- identity: `id`, `name`, `manufacturer`
- classification: `category`, `tags`, `popularity`
- physical placement: `rackUnits`
- front panel model: controls, accent color, meter type
- rear panel model: ports and verification metadata
- specs: optional technical fields

The `backPanel.verification` field is important. It labels whether the rear panel is:

- `documented`: based on a named product/specification.
- `modeled`: inferred from a class of equipment.
- `configured`: supported by code but not currently used by the catalog generator.

### Port

A `Port` has:

- connector type, for example `xlr_analog`, `jack_trs`, `db25_dsub`, `ethercon`.
- direction: `in`, `out`, `thru`, `send`, `return`, `bidirectional`.
- protocol: analog, AES/EBU, S/PDIF, ADAT, Dante, MADI, AVB, MIDI, word clock, power, etc.
- optional electrical/channel metadata: impedance, max level, sample rates, channel shape.
- optional `count` and `individualSockets`.

`count` without `individualSockets` means an aggregated connector or multi-channel interface. `count` with `individualSockets` materializes independent socket endpoints in `getConnectablePorts`.

### Rack Session

Defined in `src/features/rack/model/types.ts`.

```ts
interface RackSession {
  version: 1;
  rackSize: RackSize;
  installed: InstalledDevice[];
  cables: Cable[];
}
```

Only `rackSize`, `installed`, and `cables` are persisted and tracked by undo/redo. UI-only fields such as filters, selection, active hover, and notifications are intentionally not part of the portable session format.

### Cable

A `Cable` connects two endpoints:

- `from`: source instance/port.
- `to`: destination instance/port.
- `color`: derived from source protocol/connector.
- `notices`: validation warnings or info notices captured at creation time.

## Device Catalog

`src/data/devices.ts` contains a catalog generator plus 59 catalog definitions. The generator reduces repetition:

- `portsForProfile(profile, channels)` creates default rear-panel ports.
- `controlsFor(category, channels)` creates recognizable front-panel controls.
- `buildDevice(definition)` merges defaults, overrides, tags, specs, verification, and popularity.

Current category coverage:

- AD/DA converters, audio interfaces, Dante/MADI interfaces.
- Microphone preamps, compressors, EQs, gates, multiband dynamics.
- Reverbs/effects/delays.
- Patch bays: TRS, XLR, DB25, blanks.
- Monitor controllers, summing mixers, word clocks.
- Power amps, power conditioners, DI/reamp devices.

## Persistence

`src/shared/lib/session-repository.ts` owns local persistence:

- storage key: `plug-io:rack-session:v1`
- `localSessionRepository.load()`
- `localSessionRepository.save(session)`
- `parseSessionImport(content)`

Imported sessions are structurally validated first, then sanitized by the rack store against the live catalog. Unknown devices, overlapping placements, overflowing rack positions, missing ports, and invalid cables are removed.

## Current Boundaries

In scope:

- Client-side rack editing.
- Device search/filtering.
- Front/rear rack visualization.
- Cable compatibility validation.
- Local save, JSON import/export, PNG export.
- Basic guided tour.

Out of scope today:

- Accounts, teams, backend projects.
- Cloud persistence.
- Real-time collaboration.
- Exact electrical simulation.
- Cable length calculation.
- Full patchbay normalization modes.
- Server-side image export.
