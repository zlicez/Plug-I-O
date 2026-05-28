export interface RackGeometry {
  /** Pixel height of a single rack unit. */
  UNIT_HEIGHT: number;
  /** Total SVG viewport width. */
  VIEW_WIDTH: number;
  /** Outer rack-frame width. */
  RACK_WIDTH: number;
  /** Usable panel width between rails. */
  PANEL_WIDTH: number;
  /** Left X of the rack frame. */
  RACK_X: number;
  /** Left X of the device panel (inside rails). */
  PANEL_X: number;
  /** Top padding before the first unit. */
  RACK_TOP: number;
  /** Reserved px at the top of each rear panel for the device name strip. */
  NAME_STRIP: number;
  /** Vertical gap between rows of ports inside a device panel. */
  ROW_GAP: number;
  /** Default font size (px) for port labels on the rear panel. */
  PORT_FONT_SIZE: number;
  /** Whether port labels should be rendered. Front panels stay clean. */
  showLabels: boolean;
  /** Width (px) of the left/right cable raceways on the rear panel. */
  RACEWAY: number;
}

/** Front view — 19" rack proportions, design-system 1U = 38px. */
export const FRONT_GEOMETRY: RackGeometry = {
  UNIT_HEIGHT: 38,
  VIEW_WIDTH: 540,
  RACK_WIDTH: 480,
  PANEL_WIDTH: 424,
  RACK_X: 38,
  PANEL_X: 66,
  RACK_TOP: 8,
  NAME_STRIP: 0,
  ROW_GAP: 9,
  PORT_FONT_SIZE: 6,
  showLabels: false,
  RACEWAY: 0,
};

/** Rear view — schematic, expanded to fit every port and label without truncation. */
export const REAR_GEOMETRY: RackGeometry = {
  UNIT_HEIGHT: 68,
  VIEW_WIDTH: 1280,
  RACK_WIDTH: 1200,
  PANEL_WIDTH: 1000,
  RACK_X: 40,
  PANEL_X: 140,
  RACK_TOP: 10,
  NAME_STRIP: 16,
  ROW_GAP: 26,
  PORT_FONT_SIZE: 10,
  showLabels: true,
  RACEWAY: 76,
};

// Front aliases kept for back-compat with anywhere that imports a constant directly.
export const {
  UNIT_HEIGHT,
  VIEW_WIDTH,
  RACK_WIDTH,
  PANEL_WIDTH,
  RACK_X,
  PANEL_X,
  RACK_TOP,
} = FRONT_GEOMETRY;

export interface Point {
  x: number;
  y: number;
}
