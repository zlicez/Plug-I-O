// Canvas foundations — color tokens, typography, motion, port glyphs, cable states, protocols
// Exports: ColorsArtboard, TypeArtboard, MotionArtboard, PortGlyphsArtboard, CableStatesArtboard, ProtocolArtboard

const COLOR_GROUPS = [
  { name: 'Neutrals', items: [
    { token: '--bg',            hex: '#0F0F10', desc: 'base canvas' },
    { token: '--bg-2',          hex: '#131416', desc: 'secondary base' },
    { token: '--surface',       hex: '#161719', desc: 'panels' },
    { token: '--surface-2',     hex: '#1D1F23', desc: 'raised cards' },
    { token: '--control',       hex: '#26292E', desc: 'buttons · inputs' },
    { token: '--line',          hex: '#2A2E34', desc: 'dividers' },
    { token: '--line-2',        hex: '#34383F', desc: 'borders' },
    { token: '--line-strong',   hex: '#4C525D', desc: 'prominent border' },
    { token: '--muted',         hex: '#9DA4AF', desc: 'secondary text' },
    { token: '--copy-2',        hex: '#C8CCD2', desc: 'body text' },
    { token: '--copy',          hex: '#F0F1F2', desc: 'primary text' },
  ]},
  { name: 'Accent', items: [
    { token: '--accent',        hex: '#C8FF00', desc: 'CTA · focus · selection' },
    { token: '--accent-2',      hex: '#B6E800', desc: 'accent hover' },
    { token: '--accent-soft',   hex: 'rgba(200,255,0,.14)', raw: 'rgba(200, 255, 0, 0.14)', desc: 'accent surface tint' },
  ]},
  { name: 'Semantic', items: [
    { token: '--positive',      hex: '#4ADE80', desc: 'success · meters OK' },
    { token: '--warning',       hex: '#F2A93B', desc: 'warning · over-level' },
    { token: '--danger',        hex: '#E05454', desc: 'validation error · destroy' },
    { token: '--info',          hex: '#4093D6', desc: 'neutral info' },
  ]},
];

function Swatch({ item, big }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
      <div style={{ width: big ? 56 : 36, height: big ? 56 : 36, borderRadius: 'var(--r-2)', background: item.raw || item.hex, border: '1px solid var(--line-2)', flexShrink: 0 }}/>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--copy)' }}>{item.token}</div>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', display: 'flex', gap: 8 }}>
          <span>{item.hex}</span>
          <span>· {item.desc}</span>
        </div>
      </div>
    </div>
  );
}

function ColorsArtboard() {
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: 28 }}>
        {COLOR_GROUPS.map(g => (
          <div key={g.name}>
            <div className="label-eyebrow" style={{ marginBottom: 10 }}>{g.name.toUpperCase()}</div>
            {g.items.map(it => <Swatch key={it.token} item={it}/>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeArtboard() {
  const rows = [
    { tag: 'Display / 40 / 600', size: 40, weight: 600, family: 'sans', sample: 'Plug-I/O' },
    { tag: 'H1 / 32 / 600',      size: 32, weight: 600, family: 'sans', sample: 'Build a 19-inch audio rack' },
    { tag: 'H2 / 24 / 600',      size: 24, weight: 600, family: 'sans', sample: 'Editor · Studio A · Tracking' },
    { tag: 'H3 / 20 / 500',      size: 20, weight: 500, family: 'sans', sample: 'Rack canvas · 12U' },
    { tag: 'Body / 14 / 400',    size: 14, weight: 400, family: 'sans', sample: 'Drag a device from the library to start. Switch to rear view to patch cables.' },
    { tag: 'Small / 12 / 400',   size: 12, weight: 400, family: 'sans', sample: 'Hover any port for protocol details.' },
    { tag: 'Mono / 13 / 500',    size: 13, weight: 500, family: 'mono', sample: 'WaveTec X73-A · OUT → Nova VCA-2 · IN L' },
    { tag: 'Mono / 11 / 500',    size: 11, weight: 500, family: 'mono', sample: '+12.4 dB · 1d20 · 192 kHz · 24-bit' },
    { tag: 'Label / 10 / 600 · uppercase + 0.14em', size: 10, weight: 600, family: 'mono', sample: 'INPUT · PROTOCOL · DESTINATION', upper: true },
  ];
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 18 }}>TYPE SCALE</div>
      {rows.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: 28, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
          <div className="mono" style={{ width: 220, color: 'var(--muted)', fontSize: 11, flexShrink: 0 }}>{r.tag}</div>
          <div style={{ flex: 1, fontFamily: r.family === 'mono' ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: r.size, fontWeight: r.weight, lineHeight: 1.2,
            textTransform: r.upper ? 'uppercase' : 'none', letterSpacing: r.upper ? '0.14em' : '-0.005em' }}>{r.sample}</div>
        </div>
      ))}
      <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-2)', borderRadius: 'var(--r-3)', border: '1px solid var(--line)' }}>
        <div className="label-eyebrow" style={{ marginBottom: 8 }}>FAMILIES</div>
        <div style={{ display: 'flex', gap: 36 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 600 }}>DM Sans</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 4 }}>UI · DM Sans 400/500/600/700 · LATIN + CYRILLIC</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 500 }}>IBM Plex Mono</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 4 }}>NUMBERS · LABELS · DBFS · 400/500</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MotionArtboard() {
  const durations = [
    { name: '--d-instant', ms: 80, use: 'press feedback, dot pulse' },
    { name: '--d-fast',    ms: 160, use: 'hover tint, focus ring' },
    { name: '--d-base',    ms: 240, use: 'modals, toasts, accordion' },
    { name: '--d-slow',    ms: 400, use: 'cable draw-on, panel slide' },
    { name: '--d-deep',    ms: 600, use: 'front↔rear flip' },
  ];
  const easings = [
    { name: '--e-standard',    val: 'cubic-bezier(0.2, 0, 0, 1)',     use: 'most things' },
    { name: '--e-emphasized',  val: 'cubic-bezier(0.3, 0, 0, 1)',     use: 'flips, snaps' },
    { name: '--e-decelerated', val: 'cubic-bezier(0.05, 0.7, 0.1, 1)', use: 'enter, slide-in' },
    { name: '--e-accelerated', val: 'cubic-bezier(0.3, 0, 0.8, 0.15)', use: 'exit, dismiss' },
  ];
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 12 }}>DURATIONS</div>
          {durations.map(d => (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--copy)', width: 100 }}>{d.name}</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', width: 50 }}>{d.ms}ms</div>
              <div style={{ flex: 1, height: 4, background: 'var(--bg-2)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, width: `${Math.min(100, d.ms / 6)}%`, background: 'var(--accent)' }}/>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted-2)', width: 130, textAlign: 'right' }}>{d.use}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 12 }}>EASINGS</div>
          {easings.map(e => (
            <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--copy)' }}>{e.name}</div>
                <div className="mono" style={{ fontSize: 9, color: 'var(--muted-2)' }}>{e.val}</div>
              </div>
              <div style={{ flex: 1 }}/>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{e.use}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 22, padding: 16, background: 'var(--bg-2)', borderRadius: 'var(--r-3)', border: '1px solid var(--line)' }}>
        <div className="label-eyebrow" style={{ marginBottom: 10 }}>BEHAVIOUR PRINCIPLES</div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: 'var(--copy-2)' }}>
          <li>· No confetti, no parallax, no scroll-linked effects.</li>
          <li>· Spring-bounce only on snap-back (invalid drop, cancel cable).</li>
          <li>· Reduced-motion: durations collapse to ~1ms.</li>
          <li>· Haptic-style flash on commit ≤ 400ms.</li>
        </ul>
      </div>
    </div>
  );
}

function PortGlyphsArtboard() {
  const ports = [
    { kind: 'xlrM',   p: 'analog', label: 'XLR M' },
    { kind: 'xlrF',   p: 'analog', label: 'XLR F' },
    { kind: 'trs',    p: 'analog', label: '1/4″ TRS' },
    { kind: 'ts',     p: 'analog', label: '1/4″ TS' },
    { kind: 'rca',    p: 'analog', label: 'RCA' },
    { kind: 'bnc',    p: 'wclock', label: 'BNC' },
    { kind: 'rj45',   p: 'dante',  label: 'RJ45 · Dante' },
    { kind: 'optical',p: 'adat',   label: 'Optical · ADAT' },
    { kind: 'optical',p: 'madi',   label: 'Optical · MADI' },
    { kind: 'usbA',   p: 'usb',    label: 'USB-A' },
    { kind: 'usbB',   p: 'usb',    label: 'USB-B' },
    { kind: 'usbC',   p: 'usb',    label: 'USB-C' },
    { kind: 'thunderbolt', p:'thunderbolt', label: 'Thunderbolt' },
    { kind: 'powerCon', p: 'power', label: 'powerCON' },
    { kind: 'iec',    p: 'power',  label: 'IEC C14' },
    { kind: 'midi5',  p: 'midi',   label: 'MIDI DIN-5' },
    { kind: 'xlrM',   p: 'aes',    label: 'XLR · AES/EBU' },
    { kind: 'rca',    p: 'spdif',  label: 'RCA · S/PDIF' },
  ];
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 14 }}>CONNECTOR GLYPHS · 26 types</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
        {ports.map((p, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, background: 'var(--bg-2)', borderRadius: 'var(--r-2)', border: '1px solid var(--line)' }}>
            <PortGlyph kind={p.kind} protocol={p.p} size={36}/>
            <div className="mono" style={{ fontSize: 10, color: 'var(--copy-2)', textAlign: 'center' }}>{p.label}</div>
            <div className="mono" style={{ fontSize: 9, color: PROTOCOLS[p.p].color }}>{PROTOCOLS[p.p].label}</div>
          </div>
        ))}
      </div>

      <div className="label-eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>STATES</div>
      <div style={{ display: 'flex', gap: 18 }}>
        {[
          { s: 'idle',       l: 'Idle' },
          { s: 'compatible', l: 'Compatible (pulse)' },
          { s: 'invalid',    l: 'Invalid (red halo)' },
        ].map(x => (
          <div key={x.s} style={{ display:'flex', flexDirection: 'column', alignItems:'center', gap: 8, padding: 16, background: 'var(--bg-2)', borderRadius: 'var(--r-3)', border: '1px solid var(--line)', minWidth: 140 }}>
            <PortGlyph kind="xlrF" protocol="analog" size={40} state={x.s}/>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{x.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CableStatesArtboard() {
  const states = [
    { label: 'Idle · Analog',     protocol: 'analog', s: 'idle' },
    { label: 'Idle · Dante',      protocol: 'dante',  s: 'idle' },
    { label: 'Idle · ADAT (dashed)', protocol: 'adat', s: 'idle' },
    { label: 'Idle · S/PDIF (dotted)', protocol: 'spdif', s: 'idle' },
    { label: 'Selected · glow',   protocol: 'analog', s: 'selected', glow: true },
    { label: 'Dimmed (not in scope)', protocol: 'analog', s: 'idle', dim: true },
    { label: 'Invalid attempt',   protocol: 'analog', s: 'invalid' },
  ];
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 14 }}>CABLE RENDERING</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {states.map((c, i) => (
          <div key={i} style={{ padding: 14, background: 'var(--bg-2)', borderRadius: 'var(--r-3)', border: '1px solid var(--line)' }}>
            <svg width="280" height="80" viewBox="0 0 280 80" style={{ display: 'block', width: '100%' }}>
              <circle cx="20" cy="40" r="6" fill="#0E0F11" stroke="#3A3C3F"/>
              <circle cx="260" cy="40" r="6" fill="#0E0F11" stroke="#3A3C3F"/>
              <Cable from={{x:20,y:40}} to={{x:260,y:40}} protocol={c.protocol} state={c.s} dimmed={c.dim} glow={c.glow}/>
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--copy-2)' }}>{c.label}</div>
              <div className="mono" style={{ fontSize: 10, color: PROTOCOLS[c.protocol].color }}>{PROTOCOLS[c.protocol].dash}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProtocolArtboard() {
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 14 }}>PROTOCOL PALETTE · 11 values · hue + dash pattern</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {Object.entries(PROTOCOLS).map(([k, p]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 'var(--r-2)', border: '1px solid var(--line)' }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: p.color, opacity: 0.9 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{p.label}</div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>{k} · {p.short} · {p.dash}</div>
            </div>
            <svg width="60" height="14" viewBox="0 0 60 14">
              <line x1="2" y1="7" x2="58" y2="7" stroke={p.color} strokeWidth="2.4" strokeDasharray={({solid:'',dashed:'6 4',dotted:'2 3'})[p.dash]}/>
            </svg>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-2)', borderRadius: 'var(--r-3)', border: '1px dashed var(--line-2)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
        <strong style={{ color: 'var(--copy-2)' }}>Принцип:</strong> протокол кодируется цветом <em>и</em> паттерном линии. Это покрывает колорблайнд-сценарии — даже при дальтонизме AES/EBU отличим от Dante по dashed-vs-solid.
      </div>
    </div>
  );
}

Object.assign(window, {
  ColorsArtboard, TypeArtboard, MotionArtboard,
  PortGlyphsArtboard, CableStatesArtboard, ProtocolArtboard,
});
