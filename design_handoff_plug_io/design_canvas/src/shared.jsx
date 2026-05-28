// Plug-I/O shared components & data
// Exports to window: PortGlyph, Cable, DeviceFront, DeviceRear, RackFrame, Icon, ProtocolDot, PROTOCOLS, DEVICES

// ─────────────────────────────────────────────────────────
// PROTOCOLS — 11 distinct, colorblind-aware via hue + dash pattern
// ─────────────────────────────────────────────────────────
const PROTOCOLS = {
  analog:      { label: 'Analog',    color: 'var(--p-analog)',      dash: 'solid',  short: 'ANA' },
  aes:         { label: 'AES/EBU',   color: 'var(--p-aes)',         dash: 'dashed', short: 'AES' },
  spdif:       { label: 'S/PDIF',    color: 'var(--p-spdif)',       dash: 'dotted', short: 'SPD' },
  adat:        { label: 'ADAT',      color: 'var(--p-adat)',        dash: 'dashed', short: 'ADT' },
  dante:       { label: 'Dante',     color: 'var(--p-dante)',       dash: 'solid',  short: 'DNT' },
  madi:        { label: 'MADI',      color: 'var(--p-madi)',        dash: 'dashed', short: 'MAD' },
  midi:        { label: 'MIDI',      color: 'var(--p-midi)',        dash: 'dotted', short: 'MID' },
  wclock:      { label: 'Wordclock', color: 'var(--p-wclock)',      dash: 'solid',  short: 'WCK' },
  usb:         { label: 'USB',       color: 'var(--p-usb)',         dash: 'dashed', short: 'USB' },
  thunderbolt: { label: 'Thunderbolt', color: 'var(--p-thunderbolt)', dash: 'solid', short: 'TB' },
  power:       { label: 'Power',     color: 'var(--p-power)',       dash: 'solid',  short: 'PWR' },
};

const DASH_TO_ARRAY = { solid: '', dashed: '6 4', dotted: '2 3' };

// ─────────────────────────────────────────────────────────
// CONNECTORS — 26 physical connector glyphs
// ─────────────────────────────────────────────────────────
// Each renders inside a 24×24 viewBox with the port hole centered.
const Connector = {
  xlrM: (c) => (
    <g>
      <circle cx="12" cy="12" r="10" fill="var(--bg)" stroke={c} strokeWidth="1.4"/>
      <circle cx="12" cy="9"  r="1.5" fill={c}/>
      <circle cx="9.5"  cy="13.5" r="1.5" fill={c}/>
      <circle cx="14.5" cy="13.5" r="1.5" fill={c}/>
    </g>
  ),
  xlrF: (c) => (
    <g>
      <circle cx="12" cy="12" r="10" fill="var(--bg)" stroke={c} strokeWidth="1.4"/>
      <circle cx="12" cy="9"  r="2.2" fill="none" stroke={c} strokeWidth="1"/>
      <circle cx="9.5"  cy="13.5" r="2.2" fill="none" stroke={c} strokeWidth="1"/>
      <circle cx="14.5" cy="13.5" r="2.2" fill="none" stroke={c} strokeWidth="1"/>
    </g>
  ),
  trs: (c) => (
    <g>
      <circle cx="12" cy="12" r="7"   fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <circle cx="12" cy="12" r="3"   fill={c}/>
    </g>
  ),
  ts: (c) => (
    <g>
      <circle cx="12" cy="12" r="7"   fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <circle cx="12" cy="12" r="2"   fill={c}/>
    </g>
  ),
  rca: (c) => (
    <g>
      <circle cx="12" cy="12" r="7" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <circle cx="12" cy="12" r="2" fill={c}/>
      <circle cx="12" cy="12" r="4.4" fill="none" stroke={c} strokeWidth="0.5" opacity="0.5"/>
    </g>
  ),
  bnc: (c) => (
    <g>
      <circle cx="12" cy="12" r="7" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <path d="M 6 12 A 6 6 0 0 1 18 12" fill="none" stroke={c} strokeWidth="0.8"/>
      <circle cx="12" cy="12" r="1.8" fill={c}/>
    </g>
  ),
  rj45: (c) => (
    <g>
      <rect x="3" y="6" width="18" height="12" rx="1" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      {[6,9,12,15,18].map(x=> <line key={x} x1={x} y1="9" x2={x} y2="12" stroke={c} strokeWidth="0.8"/>)}
    </g>
  ),
  optical: (c) => (
    <g>
      <rect x="4" y="8" width="16" height="8" rx="1" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <circle cx="12" cy="12" r="2.4" fill={c}/>
    </g>
  ),
  usbA: (c) => (
    <g>
      <rect x="4" y="8" width="16" height="8" rx="0.5" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <rect x="6.5" y="10" width="11" height="3" fill={c}/>
    </g>
  ),
  usbB: (c) => (
    <g>
      <path d="M 7 7 H 17 L 18 11 V 17 H 6 V 11 Z" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <rect x="8.5" y="10" width="7" height="3" fill={c}/>
    </g>
  ),
  usbC: (c) => (
    <g>
      <rect x="3" y="9" width="18" height="6" rx="3" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <rect x="6" y="11" width="12" height="2" rx="1" fill={c}/>
    </g>
  ),
  thunderbolt: (c) => (
    <g>
      <rect x="3" y="9" width="18" height="6" rx="3" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <path d="M 11 9 L 9 12 L 12 12 L 11 15 L 14 11 L 11 11 Z" fill={c}/>
    </g>
  ),
  powerCon: (c) => (
    <g>
      <circle cx="12" cy="12" r="9" fill="var(--bg)" stroke={c} strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="0.5" fill={c}/>
      <rect x="11" y="6" width="2" height="3" fill={c}/>
    </g>
  ),
  iec: (c) => (
    <g>
      <path d="M 4 9 H 20 V 14 Q 20 16 18 16 H 6 Q 4 16 4 14 Z" fill="var(--bg)" stroke={c} strokeWidth="1.2"/>
      <rect x="7"  y="11" width="2" height="3" fill={c}/>
      <rect x="11" y="11" width="2" height="3" fill={c}/>
      <rect x="15" y="11" width="2" height="3" fill={c}/>
    </g>
  ),
  midi5: (c) => (
    <g>
      <circle cx="12" cy="12" r="9" fill="var(--bg)" stroke={c} strokeWidth="1.4"/>
      <circle cx="12"   cy="7.5" r="1"  fill={c}/>
      <circle cx="7.5"  cy="11"  r="1"  fill={c}/>
      <circle cx="16.5" cy="11"  r="1"  fill={c}/>
      <circle cx="9"    cy="15"  r="1"  fill={c}/>
      <circle cx="15"   cy="15"  r="1"  fill={c}/>
    </g>
  ),
};

function PortGlyph({ kind = 'xlrM', protocol = 'analog', size = 24, state = 'idle', title }) {
  const color = (state === 'invalid') ? 'var(--danger)'
              : (state === 'compatible') ? 'var(--accent)'
              : PROTOCOLS[protocol]?.color || 'var(--muted)';
  const render = Connector[kind] || Connector.xlrM;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block' }} aria-label={title}>
      {state === 'compatible' && (
        <circle cx="12" cy="12" r="11" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.5"
          style={{ animation: 'pulse-ring 1.2s ease-out infinite' }}/>
      )}
      {render(color)}
      {state === 'invalid' && (
        <circle cx="12" cy="12" r="11" fill="none" stroke="var(--danger)" strokeWidth="1.2" opacity="0.7"/>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// Cable — Bézier curve between two points
// ─────────────────────────────────────────────────────────
function Cable({ from, to, protocol = 'analog', state = 'idle', dimmed = false, glow = false }) {
  if (!from || !to) return null;
  const p = PROTOCOLS[protocol] || PROTOCOLS.analog;
  const stroke = state === 'invalid' ? 'var(--danger)'
               : state === 'selected' ? 'var(--accent)'
               : p.color;
  const opacity = dimmed ? 0.25 : (state === 'idle' ? 0.85 : 1);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const sag = Math.min(80, Math.abs(dx) * 0.3 + 24);
  const c1 = { x: from.x + dx * 0.15, y: from.y + sag };
  const c2 = { x: to.x   - dx * 0.15, y: to.y   + sag };
  const d = `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`;
  const dashArr = DASH_TO_ARRAY[p.dash];
  return (
    <g style={{ opacity }}>
      {glow && (
        <path d={d} fill="none" stroke={stroke} strokeWidth="6" opacity="0.18" strokeLinecap="round"/>
      )}
      <path d={d} fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="3.6" strokeLinecap="round" transform="translate(0, 1.5)"/>
      <path d={d} fill="none" stroke={stroke} strokeWidth="2.4" strokeLinecap="round"
        strokeDasharray={dashArr || undefined}/>
      <circle cx={from.x} cy={from.y} r="2.6" fill={stroke}/>
      <circle cx={to.x}   cy={to.y}   r="2.6" fill={stroke}/>
    </g>
  );
}

// ─────────────────────────────────────────────────────────
// Icon — lucide via inline SVG (a curated subset)
// ─────────────────────────────────────────────────────────
const ICON_PATHS = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  x:      <><path d="M18 6 6 18M6 6l12 12"/></>,
  plus:   <><path d="M12 5v14M5 12h14"/></>,
  minus:  <><path d="M5 12h14"/></>,
  check:  <><path d="M20 6 9 17l-5-5"/></>,
  chevDown:  <><path d="m6 9 6 6 6-6"/></>,
  chevRight: <><path d="m9 18 6-6-6-6"/></>,
  chevLeft:  <><path d="m15 18-6-6 6-6"/></>,
  chevUp:    <><path d="m18 15-6-6-6 6"/></>,
  grid:   <><rect x="3"  y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
  list:   <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
  flip:   <><path d="M12 3v18"/><path d="m17 8 4 4-4 4"/><path d="m7 8-4 4 4 4"/></>,
  undo:   <><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-15-6.7L3 13"/></>,
  redo:   <><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 15-6.7L21 13"/></>,
  save:   <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></>,
  download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></>,
  share:  <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></>,
  trash:  <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  help:   <><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></>,
  settings: <><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2"/><circle cx="12" cy="12" r="3"/></>,
  filter: <><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>,
  alert:  <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  cable:  <><path d="M4 9a2 2 0 0 1 2-2h3v6H6a2 2 0 0 1-2-2V9z"/><path d="M9 13h6"/><path d="M15 7h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3V7z"/></>,
  zap:    <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  info:   <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  eye:    <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
  edit:   <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  printer: <><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
  layers:  <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
  zoomIn:  <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></>,
  zoomOut: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><line x1="8" y1="11" x2="14" y2="11"/></>,
  hand:   <><path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></>,
  arrowRight: <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
  external:   <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></>,
  copy:       <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  star:       <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
  menu:       <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  rotateCw:   <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  bookOpen:   <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  cpu:        <><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></>,
  waves:      <><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></>,
  command:    <><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></>,
  github:     <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></>,
  loader:     <><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>,
  signalFlow: <><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
  compare:    <><rect x="2" y="4" width="8" height="16" rx="1"/><rect x="14" y="4" width="8" height="16" rx="1"/></>,
  rack:       <><rect x="4" y="3" width="16" height="18" rx="1"/><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="13" x2="20" y2="13"/><line x1="4" y1="18" x2="20" y2="18"/></>,
};

function Icon({ name = 'help', size = 16, color = 'currentColor', strokeWidth = 1.6, style }) {
  const path = ICON_PATHS[name] || ICON_PATHS.help;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline-block', flexShrink: 0, ...style }}>
      {path}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// ProtocolDot — small color + pattern indicator for chips
// ─────────────────────────────────────────────────────────
function ProtocolDot({ protocol = 'analog', size = 10 }) {
  const p = PROTOCOLS[protocol] || PROTOCOLS.analog;
  return (
    <span style={{
      display: 'inline-block', width: size, height: size,
      borderRadius: '50%', background: p.color,
      boxShadow: p.dash === 'dashed' ? `inset 0 0 0 2px var(--bg)` :
                 p.dash === 'dotted' ? `inset 0 0 0 1px var(--bg)` : 'none',
      flexShrink: 0,
    }}/>
  );
}

// ─────────────────────────────────────────────────────────
// DEVICES — curated catalog inspired by real pro-audio gear
// (generic names, no real brand IP)
// ─────────────────────────────────────────────────────────
const DEVICES = [
  {
    id: 'wt-x73a', name: 'WaveTec X73-A', mfr: 'WaveTec',
    category: 'Preamp', u: 1, color: '#1A1B1D',
    desc: 'Single-channel transformer preamp with high-pass filter and stepped gain. Classic console flavor.',
    specs: { 'Freq. response': '20 Hz – 30 kHz (±0.3)', 'THD': '< 0.005%', 'Dyn. range': '116 dB', 'Power': '8 W' },
    frontStyle: 'preamp-vintage',
    portsRear: [
      { id: 'in',   kind: 'xlrF', protocol: 'analog', dir: 'in',  label: 'INPUT' },
      { id: 'out',  kind: 'xlrM', protocol: 'analog', dir: 'out', label: 'OUTPUT' },
      { id: 'link', kind: 'trs',  protocol: 'analog', dir: 'in',  label: 'LINK' },
      { id: 'pwr',  kind: 'iec',  protocol: 'power',  dir: 'in',  label: 'AC' },
    ],
  },
  {
    id: 'nv-comp2', name: 'Nova VCA-2', mfr: 'Nova Audio',
    category: 'Compressor', u: 1, color: '#16181A',
    desc: 'Dual-channel VCA bus compressor with sidechain HPF. Glue for the mix bus.',
    specs: { 'Freq. response': '10 Hz – 50 kHz', 'THD': '< 0.008%', 'Ratio': '1.5:1 – 20:1', 'Power': '12 W' },
    frontStyle: 'comp-modern',
    portsRear: [
      { id: 'inL',  kind: 'xlrF', protocol: 'analog', dir: 'in',  label: 'IN L' },
      { id: 'inR',  kind: 'xlrF', protocol: 'analog', dir: 'in',  label: 'IN R' },
      { id: 'outL', kind: 'xlrM', protocol: 'analog', dir: 'out', label: 'OUT L' },
      { id: 'outR', kind: 'xlrM', protocol: 'analog', dir: 'out', label: 'OUT R' },
      { id: 'sc',   kind: 'trs',  protocol: 'analog', dir: 'in',  label: 'SIDECHAIN' },
      { id: 'pwr',  kind: 'iec',  protocol: 'power',  dir: 'in',  label: 'AC' },
    ],
  },
  {
    id: 'rt-cnv8', name: 'Rhythm Converter 8/8', mfr: 'Rhythm Systems',
    category: 'Converter', u: 1, color: '#171819',
    desc: '8-in / 8-out AD/DA converter, 192 kHz, with ADAT and AES outputs.',
    specs: { 'Sample rate': 'up to 192 kHz', 'Dyn. range': '124 dB', 'Latency': '0.4 ms', 'Power': '20 W' },
    frontStyle: 'converter-mod',
    portsRear: [
      ...Array.from({length:8}).map((_,i)=>({ id:`an${i}`, kind:'trs', protocol:'analog', dir:i<4?'in':'out', label:`${i<4?'IN':'OUT'} ${i+1}` })),
      { id: 'adat1', kind: 'optical', protocol: 'adat',  dir: 'in',  label: 'ADAT IN' },
      { id: 'adat2', kind: 'optical', protocol: 'adat',  dir: 'out', label: 'ADAT OUT' },
      { id: 'aes1',  kind: 'xlrF',    protocol: 'aes',   dir: 'in',  label: 'AES IN' },
      { id: 'aes2',  kind: 'xlrM',    protocol: 'aes',   dir: 'out', label: 'AES OUT' },
      { id: 'wck',   kind: 'bnc',     protocol: 'wclock',dir: 'in',  label: 'WCK IN' },
      { id: 'pwr',   kind: 'iec',     protocol: 'power', dir: 'in',  label: 'AC' },
    ],
  },
  {
    id: 'pn-iface', name: 'Panorama Studio 16', mfr: 'Panorama',
    category: 'Interface', u: 2, color: '#16181B',
    desc: 'Thunderbolt audio interface, 16 analog in / 16 out, Dante expansion, DSP mixing.',
    specs: { 'Sample rate': 'up to 192 kHz', 'I/O': '16/16 analog · 64×64 Dante', 'Connection': 'Thunderbolt 3', 'Power': '36 W' },
    frontStyle: 'iface-screen',
    portsRear: [
      ...Array.from({length:8}).map((_,i)=>({ id:`xi${i}`, kind:'xlrF', protocol:'analog', dir:'in',  label:`MIC ${i+1}` })),
      ...Array.from({length:8}).map((_,i)=>({ id:`xo${i}`, kind:'xlrM', protocol:'analog', dir:'out', label:`OUT ${i+1}` })),
      { id: 'tb1',   kind: 'thunderbolt', protocol: 'thunderbolt', dir: 'in',  label: 'TB 3' },
      { id: 'tb2',   kind: 'thunderbolt', protocol: 'thunderbolt', dir: 'out', label: 'TB 3' },
      { id: 'dnt1',  kind: 'rj45', protocol: 'dante', dir: 'in',  label: 'DANTE PRI' },
      { id: 'dnt2',  kind: 'rj45', protocol: 'dante', dir: 'in',  label: 'DANTE SEC' },
      { id: 'midi1', kind: 'midi5', protocol: 'midi',  dir: 'in',  label: 'MIDI IN' },
      { id: 'midi2', kind: 'midi5', protocol: 'midi',  dir: 'out', label: 'MIDI OUT' },
      { id: 'wck1',  kind: 'bnc',  protocol: 'wclock', dir: 'in',  label: 'WCK IN' },
      { id: 'wck2',  kind: 'bnc',  protocol: 'wclock', dir: 'out', label: 'WCK OUT' },
      { id: 'pwr',   kind: 'iec',  protocol: 'power',  dir: 'in',  label: 'AC' },
    ],
  },
  {
    id: 'ax-pre4', name: 'Axiom Pre-4 Mk II', mfr: 'Axiom',
    category: 'Preamp', u: 1, color: '#181A1C',
    desc: '4-channel mic preamp, switchable impedance, 80 dB gain range.',
    specs: { 'Gain': '0 – 80 dB', 'Noise (EIN)': '-129 dBu', 'Power': '14 W' },
    frontStyle: 'preamp-4ch',
    portsRear: [
      ...Array.from({length:4}).map((_,i)=>({ id:`in${i}`,  kind:'xlrF', protocol:'analog', dir:'in',  label:`IN ${i+1}` })),
      ...Array.from({length:4}).map((_,i)=>({ id:`out${i}`, kind:'xlrM', protocol:'analog', dir:'out', label:`OUT ${i+1}` })),
      { id: 'pwr', kind: 'iec', protocol: 'power', dir: 'in', label: 'AC' },
    ],
  },
  {
    id: 'mt-eq3', name: 'Meridian EQ-3', mfr: 'Meridian',
    category: 'EQ', u: 1, color: '#15171A',
    desc: 'Stereo 3-band passive EQ with inductor low-shelf. Mastering-grade.',
    specs: { 'Bands': '3 (low/mid/high)', 'THD': '< 0.003%', 'Power': '6 W' },
    frontStyle: 'eq-3band',
    portsRear: [
      { id: 'inL',  kind: 'xlrF', protocol: 'analog', dir: 'in',  label: 'IN L' },
      { id: 'inR',  kind: 'xlrF', protocol: 'analog', dir: 'in',  label: 'IN R' },
      { id: 'outL', kind: 'xlrM', protocol: 'analog', dir: 'out', label: 'OUT L' },
      { id: 'outR', kind: 'xlrM', protocol: 'analog', dir: 'out', label: 'OUT R' },
      { id: 'pwr',  kind: 'iec',  protocol: 'power',  dir: 'in',  label: 'AC' },
    ],
  },
  {
    id: 'pw-dist', name: 'PowerDist 8 Pro', mfr: 'PowerLink',
    category: 'Power', u: 1, color: '#141618',
    desc: '8-outlet rack power distributor with sequenced startup and surge protection.',
    specs: { 'Outlets': '8 × IEC', 'Capacity': '16 A', 'Surge': '4500 J' },
    frontStyle: 'power-strip',
    portsRear: [
      ...Array.from({length:8}).map((_,i)=>({ id:`p${i}`, kind:'iec', protocol:'power', dir:'out', label:`OUT ${i+1}` })),
      { id: 'in', kind: 'powerCon', protocol: 'power', dir: 'in', label: 'MAINS' },
    ],
  },
  {
    id: 'dn-bridge', name: 'Dante Bridge 64', mfr: 'NetSound',
    category: 'Network', u: 1, color: '#16181B',
    desc: '64 × 64 Dante to MADI bridge with redundant network.',
    specs: { 'Channels': '64×64', 'Network': 'Gigabit redundant', 'Latency': '0.25 ms' },
    frontStyle: 'network-modern',
    portsRear: [
      { id: 'dpri', kind: 'rj45', protocol: 'dante', dir: 'in',  label: 'DANTE PRI' },
      { id: 'dsec', kind: 'rj45', protocol: 'dante', dir: 'in',  label: 'DANTE SEC' },
      { id: 'madiI',kind: 'optical', protocol: 'madi', dir: 'in',  label: 'MADI IN' },
      { id: 'madiO',kind: 'optical', protocol: 'madi', dir: 'out', label: 'MADI OUT' },
      { id: 'usbC', kind: 'usbC', protocol: 'usb', dir: 'in', label: 'CTRL' },
      { id: 'pwr',  kind: 'iec',  protocol: 'power',dir: 'in', label: 'AC' },
    ],
  },
];

// ─────────────────────────────────────────────────────────
// Front panel renderer — schematic SVG abstractions
// ─────────────────────────────────────────────────────────
function FrontPanelGraphics({ device, width, height }) {
  const w = width, h = height;
  const cy = h / 2;
  const stroke = '#3A3C3F';
  const text = '#9DA4AF';
  const accent = device.frontStyle === 'iface-screen' ? '#C8FF00' : (device.frontStyle === 'comp-modern' ? '#E0A458' : '#C8FF00');

  const knob = (x, y, r, label, val) => (
    <g key={`k${x}${y}${label}`}>
      <circle cx={x} cy={y} r={r} fill="#0E0F11" stroke={stroke} strokeWidth="0.8"/>
      <circle cx={x} cy={y} r={r-3} fill="#1B1C1E"/>
      <line x1={x} y1={y-r+3} x2={x} y2={y-2} stroke={accent} strokeWidth="1.2" strokeLinecap="round"
            transform={`rotate(${(val||0.4)*270-135} ${x} ${y})`}/>
      {label && <text x={x} y={y+r+8} fill={text} fontSize="6" textAnchor="middle" fontFamily="IBM Plex Mono">{label}</text>}
    </g>
  );

  const led = (x, y, r=2, color='#4ADE80') => (
    <g key={`l${x}${y}`}>
      <circle cx={x} cy={y} r={r+1.6} fill={color} opacity="0.18"/>
      <circle cx={x} cy={y} r={r} fill={color}/>
    </g>
  );

  const screw = (x, y) => (
    <g key={`s${x}${y}`}>
      <circle cx={x} cy={y} r="2.4" fill="#0A0B0C" stroke="#2A2C2F" strokeWidth="0.4"/>
      <line x1={x-1.4} y1={y} x2={x+1.4} y2={y} stroke="#3A3C3F" strokeWidth="0.5"/>
    </g>
  );

  // shared chrome — ears + brand label
  const chrome = (
    <g>
      {screw(8, 8)}{screw(8, h-8)}
      {screw(w-8, 8)}{screw(w-8, h-8)}
    </g>
  );

  if (device.frontStyle === 'preamp-vintage') {
    return (<svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill={device.color}/>
      <rect x="16" y="6" width={w-32} height={h-12} rx="3" fill="#101113" stroke={stroke}/>
      {chrome}
      <text x="26" y="18" fill={text} fontSize="6" fontFamily="DM Sans" fontWeight="600" letterSpacing="0.1em">{device.mfr.toUpperCase()}</text>
      <text x="26" y={h-9} fill="#5D636C" fontSize="5" fontFamily="IBM Plex Mono">{device.name}</text>
      {knob(w*0.30, cy, 11, 'GAIN', 0.7)}
      {knob(w*0.46, cy, 8,  'OUT', 0.5)}
      {knob(w*0.60, cy, 6,  'HPF', 0.2)}
      <rect x={w*0.72} y={cy-9} width="18" height="18" rx="1.5" fill="#0E0F11" stroke={stroke}/>
      <text x={w*0.72+9} y={cy+1} fill={accent} fontSize="6" textAnchor="middle" fontFamily="IBM Plex Mono">+48</text>
      <text x={w*0.72+9} y={cy+12} fill={text} fontSize="5" textAnchor="middle" fontFamily="IBM Plex Mono">PHANTOM</text>
      {led(w*0.86, cy-4, 1.8, accent)}
      {led(w*0.86, cy+4, 1.8, '#E05454')}
    </svg>);
  }
  if (device.frontStyle === 'comp-modern') {
    return (<svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill={device.color}/>
      {chrome}
      <text x="22" y="14" fill={text} fontSize="6" fontFamily="DM Sans" fontWeight="700" letterSpacing="0.14em">{device.mfr.toUpperCase()}</text>
      <text x={w-22} y="14" fill="#5D636C" fontSize="5" fontFamily="IBM Plex Mono" textAnchor="end">{device.name}</text>
      {/* GR meter */}
      <rect x="22" y="20" width={w*0.35} height={h-32} rx="1.5" fill="#0A0B0C" stroke={stroke}/>
      {Array.from({length:12}).map((_,i)=>(
        <rect key={i} x={26+i*((w*0.35-8)/12)} y="24" width={(w*0.35-8)/12-1.5} height={h-40}
              fill={i<3?'#4ADE80':i<7?'#F2A93B':'#E05454'} opacity={i<5?1:0.25}/>
      ))}
      <text x={22+w*0.35/2} y={h-5} fill={text} fontSize="5" textAnchor="middle" fontFamily="IBM Plex Mono">GAIN REDUCTION</text>
      {/* knobs */}
      {knob(w*0.65, cy-2, 8, 'THR', 0.6)}
      {knob(w*0.76, cy-2, 8, 'RATIO', 0.5)}
      {knob(w*0.87, cy-2, 8, 'ATK', 0.35)}
      <rect x={w*0.62} y={h-16} width={w*0.28} height="6" rx="1" fill="#0A0B0C" stroke={stroke}/>
    </svg>);
  }
  if (device.frontStyle === 'converter-mod') {
    return (<svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill={device.color}/>
      {chrome}
      <text x="22" y="14" fill={text} fontSize="6" fontFamily="DM Sans" fontWeight="700" letterSpacing="0.12em">{device.mfr.toUpperCase()}</text>
      <text x={w-22} y="14" fill="#5D636C" fontSize="5" fontFamily="IBM Plex Mono" textAnchor="end">8/8 · 192k</text>
      {/* 8 channel meters */}
      <g>{Array.from({length:8}).map((_,i)=>{
        const x = 24 + i*((w-48)/8);
        return <g key={i}>
          <rect x={x} y="20" width={(w-48)/8 - 4} height={h-36} rx="1" fill="#0A0B0C" stroke={stroke}/>
          {Array.from({length:6}).map((_,j)=>(
            <rect key={j} x={x+2} y={22 + j*((h-40)/6)} width={(w-48)/8 - 8} height={(h-40)/6 - 1.5}
                  fill={j>3?'#E05454':j>2?'#F2A93B':accent} opacity={j>=(5-Math.floor(Math.random()*4 + 0.5)) ? 1 : 0.15}/>
          ))}
          <text x={x+(w-48)/16-2} y={h-5} fill={text} fontSize="4.5" textAnchor="middle" fontFamily="IBM Plex Mono">{i+1}</text>
        </g>;
      })}</g>
    </svg>);
  }
  if (device.frontStyle === 'iface-screen') {
    return (<svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill={device.color}/>
      {chrome}
      <text x="22" y="16" fill={text} fontSize="7" fontFamily="DM Sans" fontWeight="700" letterSpacing="0.14em">{device.mfr.toUpperCase()}</text>
      {/* Big screen */}
      <rect x="22" y="24" width={w*0.42} height={h-40} rx="2" fill="#050608" stroke={stroke}/>
      <text x="30" y="38" fill={accent} fontSize="5" fontFamily="IBM Plex Mono">96.000 kHz · 24-bit</text>
      <text x="30" y="48" fill="#9DA4AF" fontSize="4.5" fontFamily="IBM Plex Mono">Internal · Locked</text>
      {Array.from({length:16}).map((_,i)=>(
        <rect key={i} x={28+(i%8)*8} y={54+Math.floor(i/8)*5} width="6" height="3"
              fill={i<10?accent:'#3A3C3F'} opacity={0.4 + (i<10?0.4:0)}/>
      ))}
      {/* Knobs + buttons */}
      {knob(w*0.74, cy-2, 11, 'MONITOR', 0.55)}
      {[0,1,2,3].map(i=>(
        <rect key={i} x={w*0.85} y={20 + i*((h-32)/4)} width={w-w*0.85-16} height={(h-32)/4-3} rx="1.5"
              fill="#0E0F11" stroke={stroke}/>
      ))}
      {[0,1,2,3].map(i=>led(w*0.86 + 4, 20 + i*((h-32)/4) + (h-32)/8, 1.4, [accent, '#F2A93B', '#4ADE80', '#9DA4AF'][i]))}
    </svg>);
  }
  if (device.frontStyle === 'preamp-4ch') {
    return (<svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill={device.color}/>
      {chrome}
      <text x="22" y="14" fill={text} fontSize="6" fontFamily="DM Sans" fontWeight="700" letterSpacing="0.12em">{device.mfr.toUpperCase()}</text>
      <text x={w-22} y="14" fill="#5D636C" fontSize="5" fontFamily="IBM Plex Mono" textAnchor="end">PRE-4 MK II</text>
      {[0,1,2,3].map(i=>{
        const x = 50 + i*((w-100)/4);
        return <g key={i}>
          {knob(x, cy, 9, `CH${i+1}`, 0.3+i*0.15)}
          {led(x-12, cy-6, 1.6, accent)}
          {led(x-12, cy+1,  1.6, '#F2A93B')}
        </g>;
      })}
    </svg>);
  }
  if (device.frontStyle === 'eq-3band') {
    return (<svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill={device.color}/>
      {chrome}
      <text x="22" y="14" fill={text} fontSize="6" fontFamily="DM Sans" fontWeight="700" letterSpacing="0.12em">{device.mfr.toUpperCase()}</text>
      <text x={w-22} y="14" fill="#5D636C" fontSize="5" fontFamily="IBM Plex Mono" textAnchor="end">EQ-3</text>
      {['LOW','MID','HIGH'].map((l,i)=>{
        const x = w*0.25 + i*w*0.2;
        return <g key={i}>
          {knob(x, cy-3, 10, l, 0.5)}
          {knob(x, cy+12, 4, '', 0.5)}
        </g>;
      })}
      <rect x={w*0.78} y={cy-12} width={w*0.16} height="24" rx="2" fill="#0E0F11" stroke={stroke}/>
      <path d={`M ${w*0.78+4} ${cy} Q ${w*0.78+w*0.08} ${cy-8} ${w*0.78+w*0.16-4} ${cy+4}`} fill="none" stroke={accent} strokeWidth="1"/>
    </svg>);
  }
  if (device.frontStyle === 'power-strip') {
    return (<svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill={device.color}/>
      {chrome}
      <text x="22" y="14" fill={text} fontSize="6" fontFamily="DM Sans" fontWeight="700" letterSpacing="0.12em">POWERLINK</text>
      <text x={w-22} y="14" fill="#5D636C" fontSize="5" fontFamily="IBM Plex Mono" textAnchor="end">8 × 16A</text>
      {Array.from({length:8}).map((_,i)=>{
        const x = 28 + i*((w-56)/8);
        return <g key={i}>
          <rect x={x} y={cy-6} width={(w-56)/8 - 4} height="12" rx="1" fill="#0E0F11" stroke={stroke}/>
          {led(x+(w-56)/16 - 2, cy, 1.5, i<6?'#4ADE80':'#3A3C3F')}
        </g>;
      })}
    </svg>);
  }
  if (device.frontStyle === 'network-modern') {
    return (<svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill={device.color}/>
      {chrome}
      <text x="22" y="14" fill={text} fontSize="6" fontFamily="DM Sans" fontWeight="700" letterSpacing="0.14em">NETSOUND</text>
      <text x={w-22} y="14" fill="#5D636C" fontSize="5" fontFamily="IBM Plex Mono" textAnchor="end">Dante 64×64</text>
      <rect x="22" y="22" width={w*0.55} height={h-38} rx="2" fill="#050608" stroke={stroke}/>
      <text x="28" y="36" fill="#6366F1" fontSize="5" fontFamily="IBM Plex Mono">NETWORK · OK</text>
      <text x="28" y="46" fill="#9DA4AF" fontSize="4.5" fontFamily="IBM Plex Mono">PRI: 192.168.10.4</text>
      <text x="28" y="54" fill="#9DA4AF" fontSize="4.5" fontFamily="IBM Plex Mono">SEC: 192.168.11.4</text>
      {[0,1,2,3].map(i=>led(w*0.8+i*9, cy, 1.5, ['#4ADE80','#4ADE80','#F2A93B','#9DA4AF'][i]))}
    </svg>);
  }
  // fallback
  return <rect x="0" y="0" width={w} height={h} fill={device.color}/>;
}

// ─────────────────────────────────────────────────────────
// Rear panel renderer — port layout with labels
// ─────────────────────────────────────────────────────────
function RearPanelGraphics({ device, width, height, onPortPos }) {
  const w = width, h = height;
  const cols = device.portsRear.length;
  const colW = (w - 24) / cols;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" style={{display:'block'}}>
      <rect x="0" y="0" width={w} height={h} fill="#0C0D0F"/>
      <rect x="6" y="6" width={w-12} height={h-12} fill="#101113" stroke="#2A2C2F"/>
      {device.portsRear.map((port, i) => {
        const x = 12 + i*colW + colW/2;
        const y = h/2;
        if (onPortPos) onPortPos(port, { x, y });
        return (
          <g key={port.id} data-port-id={`${device.id}.${port.id}`}>
            <text x={x} y={y - 16} fill="#5D636C" fontSize="4.5" fontFamily="IBM Plex Mono" textAnchor="middle">{port.label}</text>
            <foreignObject x={x-9} y={y-9} width="18" height="18">
              <PortGlyph kind={port.kind} protocol={port.protocol} size={18}/>
            </foreignObject>
            <text x={x} y={y + 14} fill={PROTOCOLS[port.protocol].color} fontSize="4" fontFamily="IBM Plex Mono" textAnchor="middle" opacity="0.7">
              {PROTOCOLS[port.protocol].short}·{port.dir.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// DeviceFront / DeviceRear — sized container (1U = ~38px tall)
// ─────────────────────────────────────────────────────────
const U_HEIGHT = 38;
const U_WIDTH  = 520; // 19" inner width

function DeviceFront({ device, selected = false, ghost = false, dimmed = false, width = U_WIDTH, onClick, style }) {
  const h = U_HEIGHT * device.u;
  return (
    <div onClick={onClick} className="device-front"
      style={{
        position: 'relative', width, height: h,
        border: selected ? '1px solid var(--accent)' : '1px solid #2A2C2F',
        borderRadius: '2px',
        boxShadow: selected ? '0 0 0 1px var(--accent), 0 0 28px -4px rgba(200,255,0,0.32)' : 'none',
        opacity: ghost ? 0.3 : (dimmed ? 0.4 : 1),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 200ms var(--e-emphasized), border-color 200ms var(--e-emphasized)',
        ...style,
      }}>
      <FrontPanelGraphics device={device} width={width} height={h}/>
    </div>
  );
}

function DeviceRear({ device, selected = false, dimmed = false, width = U_WIDTH, registerPort, style }) {
  const h = U_HEIGHT * device.u;
  return (
    <div className="device-rear" style={{
      position: 'relative', width, height: h,
      border: selected ? '1px solid var(--accent)' : '1px solid #2A2C2F',
      borderRadius: '2px',
      opacity: dimmed ? 0.4 : 1,
      ...style,
    }}>
      <RearPanelGraphics device={device} width={width} height={h} onPortPos={registerPort}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// RackFrame — 19" rack chassis with U-indices
// ─────────────────────────────────────────────────────────
function RackFrame({ children, units = 12, view = 'front', empty = false, width = U_WIDTH, scale = 1, label }) {
  const innerH = units * U_HEIGHT;
  const sideRailW = 26;
  const totalW = width + sideRailW*2 + 24;
  const totalH = innerH + 60;
  return (
    <div style={{ display: 'inline-block', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
      <div style={{
        position: 'relative',
        width: totalW, height: totalH,
        background: 'linear-gradient(180deg, #1A1B1D 0%, #141517 100%)',
        borderRadius: '6px',
        border: '1px solid #2A2C2F',
        padding: '20px 12px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 60px -16px rgba(0,0,0,0.6)',
      }}>
        {/* top corner screws */}
        {[[10,10],[totalW-22,10],[10,totalH-22],[totalW-22,totalH-22]].map(([x,y],i)=>(
          <div key={i} style={{
            position:'absolute', left:x, top:y, width:12, height:12,
            borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, #4a4d52, #1c1d1f 70%)',
            border:'1px solid #0a0b0c',
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            <div style={{position:'absolute', inset:'4px', borderTop:'1.5px solid #2a2c2f', transform:'rotate(45deg)'}}/>
          </div>
        ))}
        {/* U index column */}
        <div style={{
          position:'absolute', left: 20, top: 20, width: sideRailW, height: innerH,
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          paddingTop: 2, paddingBottom: 2,
        }}>
          {Array.from({length: units}).map((_,i)=>(
            <div key={i} className="mono" style={{
              fontSize: 9, color: '#5D636C', height: U_HEIGHT - 1,
              display:'flex', alignItems:'center', justifyContent:'flex-end',
              paddingRight: 4,
            }}>{String(units - i).padStart(2,'0')}U</div>
          ))}
        </div>
        {/* right side rail */}
        <div style={{
          position:'absolute', right: 20, top: 20, width: sideRailW, height: innerH,
          background: 'linear-gradient(180deg, #0F1012 0%, #0a0b0c 100%)',
          borderLeft:'1px solid #2A2C2F', borderRight:'1px solid #2A2C2F',
          borderRadius:'2px',
        }}>
          {Array.from({length: units}).map((_,i)=>(
            <div key={i} style={{
              position:'absolute', right: 6, top: i * U_HEIGHT + U_HEIGHT/2 - 2,
              width: 8, height: 4, borderRadius:'1px', background:'#1c1d1f',
              border:'1px solid #050608',
            }}/>
          ))}
        </div>
        {/* left side rail mirror */}
        <div style={{
          position:'absolute', left: 20 + sideRailW, top: 20, width: 4, height: innerH,
          background: 'repeating-linear-gradient(0deg, #0a0b0c 0px, #0a0b0c 2px, #1a1b1d 2px, #1a1b1d 4px)',
        }}/>
        {/* inner rack body */}
        <div style={{
          position:'absolute', left: 20 + sideRailW + 4, top: 20,
          width, height: innerH,
          background: empty ? '#0a0b0c' : '#0E0F11',
          borderTop: '1px solid #050608', borderBottom: '1px solid #050608',
          overflow: 'hidden',
        }}>
          {/* empty U lines */}
          <svg width={width} height={innerH} style={{position:'absolute', inset:0, pointerEvents:'none'}}>
            {Array.from({length: units}).map((_,i)=>(
              <line key={i} x1="0" y1={i*U_HEIGHT} x2={width} y2={i*U_HEIGHT}
                    stroke="#1A1B1D" strokeWidth="1"/>
            ))}
            {Array.from({length: units}).map((_,i)=>(
              <line key={`d${i}`} x1="0" y1={i*U_HEIGHT + U_HEIGHT/2} x2={width} y2={i*U_HEIGHT + U_HEIGHT/2}
                    stroke="#15171A" strokeWidth="1" strokeDasharray="2 4"/>
            ))}
          </svg>
          {children}
        </div>
        {label && (
          <div className="label-eyebrow" style={{
            position:'absolute', bottom: 6, left: 20 + sideRailW + 4,
          }}>{label}</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────
Object.assign(window, {
  PROTOCOLS, DEVICES,
  PortGlyph, Cable, ProtocolDot, Icon,
  FrontPanelGraphics, RearPanelGraphics,
  DeviceFront, DeviceRear, RackFrame,
  U_HEIGHT, U_WIDTH,
});
