// Reusable static "frozen" editor mock for design-canvas screens.
// Takes a snapshot config and renders the whole editor layout at a given size.
// Exports: EditorMock, EditorMockScaled

const { useState: useStateM, useRef: useRefM, useEffect: useEffectM } = React;

// ─────────────────────────────────────────────────────────
// Layout primitives (frozen — no interaction unless explicitly enabled)
// ─────────────────────────────────────────────────────────

function MockTopBar({ rackUnits = 12, rackName = 'Studio A · Tracking', view = 'front', undoCount = 5 }) {
  return (
    <div style={{
      height: 48, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 12px', borderBottom: '1px solid var(--line)',
      background: 'var(--surface)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 16, borderRight: '1px solid var(--line)' }}>
        <Logo size={22}/>
        <span style={{ fontWeight: 600, letterSpacing: '-0.01em', fontSize: 14 }}>Plug-I/O</span>
        <span className="chip mono" style={{ height: 18, fontSize: 10 }}>beta</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 12, borderRight: '1px solid var(--line)' }}>
        <span className="label-eyebrow">RACK</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{rackName}</span>
        <Icon name="edit" size={12} color="var(--muted-2)"/>
        <span className="chip mono" style={{ height: 22 }}>{rackUnits}U<Icon name="chevDown" size={10}/></span>
      </div>
      <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'var(--bg-2)',
        borderRadius: 'var(--r-2)', border: '1px solid var(--line-2)', marginLeft: 12 }}>
        {['front', 'rear'].map(v => (
          <div key={v} className="mono"
            style={{
              height: 24, padding: '0 12px', borderRadius: 'var(--r-1)',
              background: view === v ? 'var(--accent)' : 'transparent',
              color: view === v ? 'var(--accent-text)' : 'var(--muted)',
              fontWeight: view === v ? 600 : 500, fontSize: 11, letterSpacing: '0.08em',
              display: 'flex', alignItems: 'center',
            }}>
            {v.toUpperCase()}
          </div>
        ))}
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 12, borderRight: '1px solid var(--line)' }}>
        <div className="btn btn-ghost btn-icon btn-sm"><Icon name="undo" size={14}/>{undoCount > 0 && <span className="badge" style={{ marginLeft: -4, height: 14, minWidth: 14, fontSize: 9 }}>{undoCount}</span>}</div>
        <div className="btn btn-ghost btn-icon btn-sm"><Icon name="redo" size={14}/></div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12 }}>
        <div className="btn btn-sm"><Icon name="save" size={13}/><span>Save</span></div>
        <div className="btn btn-sm"><Icon name="download" size={13}/><span>Export</span></div>
        <div className="btn btn-ghost btn-icon btn-sm"><Icon name="help" size={14}/></div>
      </div>
    </div>
  );
}

function MockStatusBar({ left, right }) {
  return (
    <div style={{
      height: 32, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 12px', borderTop: '1px solid var(--line)',
      background: 'var(--surface)', fontSize: 12, color: 'var(--muted)',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {left || <span>Front view · Hover any port for details</span>}
      </div>
      <div style={{ flex: 1 }}/>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {right || (<>
          <span><span style={{ color: 'var(--copy-2)' }}>6</span> devices</span>
          <span style={{ color: 'var(--line-strong)' }}>│</span>
          <span><span style={{ color: 'var(--copy-2)' }}>6</span> patches</span>
          <span style={{ color: 'var(--line-strong)' }}>│</span>
          <span>autosaved</span>
        </>)}
      </div>
    </div>
  );
}

function MockLibrary({ devices = DEVICES, searchQ = '', filterChips = [], libView = 'grid', dragDeviceId = null, narrow = false, emptySearch = false, filtersOpen = false }) {
  return (
    <div style={{
      width: narrow ? 220 : 296, flexShrink: 0, display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--line)', background: 'var(--surface)',
      minHeight: 0,
    }}>
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="label-eyebrow">LIBRARY</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>Devices <span style={{ color: 'var(--muted-2)', fontWeight: 400 }}>{emptySearch ? 0 : devices.length}</span></div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <div className="btn btn-ghost btn-icon btn-sm"><Icon name="filter" size={13}/></div>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={13} color="var(--muted-2)" style={{ position: 'absolute', left: 10, top: 9 }}/>
          <input className="input mono" style={{ paddingLeft: 30, paddingRight: 50, fontSize: 12 }}
            placeholder="Search devices…" defaultValue={searchQ}/>
          <span className="kbd" style={{ position: 'absolute', right: 8, top: 6 }}>⌘K</span>
        </div>
        {filterChips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {filterChips.map((c, i) => (
              <span key={i} className="chip is-active">{c}<Icon name="x" size={10}/></span>
            ))}
            <span className="chip">Reset</span>
          </div>
        )}
        {filtersOpen && (
          <div style={{ marginTop: 12, padding: 10, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)' }}>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>CATEGORY</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {['All','Preamp','Compressor','Converter','Interface','EQ','Network','Power'].map(c => (
                <span key={c} className={c === 'Preamp' ? 'chip is-active' : 'chip mono'}>{c}</span>
              ))}
            </div>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>PROTOCOL</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <span className="chip mono">Any</span>
              {['analog','dante','aes','adat'].map(p => (
                <span key={p} className="chip mono"><ProtocolDot protocol={p}/>{PROTOCOLS[p].label}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: '10px 8px' }}>
        {emptySearch ? (
          <EmptyState icon="search" title="Ничего не найдено" body={`No devices match "${searchQ}".`} action="Clear filters" onAction={() => {}}/>
        ) : libView === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {devices.slice(0, narrow ? 4 : 6).map(d => (
              <div key={d.id} style={{ opacity: dragDeviceId === d.id ? 0.35 : 1 }}>
                <DeviceCard device={d} variant="grid"/>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {devices.slice(0, 8).map(d => <DeviceCard key={d.id} device={d} variant="list"/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function MockInspector({ kind = 'none', device = null, cable = null, narrow = false, content = null }) {
  return (
    <div style={{
      width: narrow ? 280 : 340, flexShrink: 0, display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid var(--line)', background: 'var(--surface)',
      minHeight: 0,
    }}>
      <div style={{ padding: '14px 14px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="label-eyebrow" style={{ marginBottom: 4 }}>INSPECTOR</div>
        {kind === 'none' && <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Nothing selected</div>}
        {kind === 'device' && device && (<>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>{device.name}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>{device.mfr} · {device.category} · {device.u}U</div>
        </>)}
        {kind === 'cable' && cable && (<>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Audio patch</div>
          <div className="mono" style={{ fontSize: 11, color: PROTOCOLS[cable.protocol].color, marginTop: 2 }}><ProtocolDot protocol={cable.protocol}/> {PROTOCOLS[cable.protocol].label}</div>
        </>)}
        {kind !== 'none' && (
          <div style={{ display: 'flex', gap: 0, marginTop: 14, borderBottom: '1px solid var(--line)' }}>
            {(kind === 'device' ? ['overview', 'ports', 'connections', 'specs'] : ['route', 'meta']).map((t, i) => (
              <div key={t} className="mono"
                style={{
                  padding: '8px 10px', fontSize: 11, letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: i === 0 ? 'var(--copy)' : 'var(--muted)',
                  borderBottom: i === 0 ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: -1,
                }}>{t}</div>
            ))}
          </div>
        )}
      </div>
      <div style={{ flex: 1, overflow: 'hidden', padding: 14 }}>
        {content || (
          kind === 'none' ? (
            <EmptyState icon="cable" title="Select something" body="Click a device or cable to see its details, ports and connections here."/>
          ) : kind === 'device' && device ? (
            <div>
              <div style={{ borderRadius: 'var(--r-3)', overflow: 'hidden', border: '1px solid var(--line)', marginBottom: 12 }}>
                <DeviceFront device={device} width={narrow ? 250 : 310}/>
              </div>
              <p style={{ fontSize: 13, color: 'var(--copy-2)', lineHeight: 1.5, margin: 0 }}>{device.desc}</p>
              <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="chip">{device.category}</span>
                <span className="chip">{device.u}U</span>
                {Array.from(new Set(device.portsRear.map(p => p.protocol))).slice(0, 3).map(p => (
                  <span key={p} className="chip"><ProtocolDot protocol={p}/>{PROTOCOLS[p].label}</span>
                ))}
              </div>
            </div>
          ) : kind === 'cable' && cable ? (
            <CableRouteInspector cable={cable}/>
          ) : null
        )}
      </div>
      {kind === 'device' && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 14px', display: 'flex', gap: 6 }}>
          <div className="btn btn-sm" style={{ flex: 1 }}><Icon name="copy" size={13}/>Duplicate</div>
          <div className="btn btn-sm btn-danger"><Icon name="trash" size={13}/>Remove</div>
        </div>
      )}
      {kind === 'cable' && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 14px', display: 'flex', gap: 6 }}>
          <div className="btn btn-sm btn-danger" style={{ flex: 1 }}><Icon name="trash" size={13}/>Disconnect cable</div>
        </div>
      )}
    </div>
  );
}

function CableRouteInspector({ cable }) {
  const src = DEVICES.find(d => d.portsRear.some(p => p.id === cable.srcPort) || d.id === cable.srcDeviceId);
  const dst = DEVICES.find(d => d.portsRear.some(p => p.id === cable.dstPort) || d.id === cable.dstDeviceId);
  // Fallback: use cable.srcName etc when provided
  return (
    <div style={{ padding: 12, borderRadius: 'var(--r-3)', background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
      <div className="label-eyebrow" style={{ marginBottom: 6 }}>SOURCE</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <PortGlyph kind={cable.srcKind || 'xlrM'} protocol={cable.protocol} size={18}/>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{cable.srcName || (src && src.name) || 'Device'}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{cable.srcLabel || cable.srcPort}</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
        <svg width="40" height="20" viewBox="0 0 40 20">
          <path d="M 4 4 Q 20 16 36 4" stroke={PROTOCOLS[cable.protocol].color} strokeWidth="1.8" fill="none"/>
          <polygon points="32,2 38,4 32,7" fill={PROTOCOLS[cable.protocol].color}/>
        </svg>
      </div>
      <div className="label-eyebrow" style={{ marginBottom: 6 }}>DESTINATION</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <PortGlyph kind={cable.dstKind || 'xlrF'} protocol={cable.protocol} size={18}/>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{cable.dstName || (dst && dst.name) || 'Device'}</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{cable.dstLabel || cable.dstPort}</div>
        </div>
      </div>
    </div>
  );
}

// Mock canvas — static rack render with overlays
function MockCanvas({
  units = 12, view = 'front', placements = [], cables = [], selectedDevice = null, selectedCable = null,
  pendingCable = null, dragHoverSlot = null, dragDevice = null, ghostSlot = null, swapIndicator = false,
  bannerTop = null, signalFlow = null, showZoom = true, hint = null, empty = false,
  scale = 1,
}) {
  const RACK_W = 460;
  const ports = {};
  // pre-compute port positions
  const slotTop = (slot) => slot * U_HEIGHT;
  placements.forEach(p => {
    const dev = DEVICES.find(d => d.id === p.deviceId);
    if (!dev) return;
    const h = U_HEIGHT * dev.u;
    const cols = dev.portsRear.length;
    const colW = (RACK_W - 24) / cols;
    dev.portsRear.forEach((port, i) => {
      const x = 12 + i * colW + colW / 2;
      const y = slotTop(p.slot) + h / 2;
      ports[`${p.id}.${port.id}`] = { x, y, dev, port };
    });
  });

  const dragDeviceObj = dragDevice ? DEVICES.find(d => d.id === dragDevice) : null;

  return (
    <div style={{
      flex: 1, position: 'relative', overflow: 'hidden',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(circle, #1A1B1D 1px, transparent 1px)',
      backgroundSize: '24px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '36px 24px',
    }}>
      {bannerTop && (
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 9 }}>{bannerTop}</div>
      )}
      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, alignItems: 'center', zIndex: 10 }}>
        <span className="label-eyebrow">CANVAS</span>
        <span className="chip mono" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-ring)' }}>{view === 'front' ? 'FRONT' : 'REAR'} VIEW</span>
        {pendingCable && (
          <span className="chip mono" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
            Drawing cable
          </span>
        )}
        {signalFlow && (
          <span className="chip mono" style={{ background: 'var(--info-soft)', borderColor: 'rgba(64,147,214,0.3)', color: 'var(--info)' }}>
            <Icon name="signalFlow" size={11}/>
            Signal-flow · {signalFlow}
          </span>
        )}
      </div>
      {showZoom && (
        <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
          <span className="btn btn-sm btn-ghost btn-icon"><Icon name="zoomOut" size={14}/></span>
          <span className="chip mono" style={{ height: 26 }}>100%</span>
          <span className="btn btn-sm btn-ghost btn-icon"><Icon name="zoomIn" size={14}/></span>
        </div>
      )}

      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <RackChassis units={units} width={RACK_W}>
          <div style={{ position: 'relative', width: RACK_W, height: units * U_HEIGHT }}>
            {empty && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', textAlign: 'center', padding: 30 }}>
                <svg width="56" height="40" viewBox="0 0 56 40" fill="none" style={{ marginBottom: 14 }}>
                  <rect x="2" y="2" width="52" height="36" rx="2" stroke="var(--line-2)" strokeDasharray="3 4" strokeWidth="1"/>
                  <line x1="8" y1="20" x2="48" y2="20" stroke="var(--line-2)" strokeDasharray="2 3"/>
                  <circle cx="14" cy="14" r="2" fill="var(--accent)"/>
                  <circle cx="14" cy="26" r="2" fill="var(--accent)" opacity="0.4"/>
                </svg>
                <div className="label-eyebrow" style={{ color: 'var(--muted-2)', marginBottom: 4 }}>EMPTY RACK</div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--copy-2)', marginBottom: 6 }}>Перетащите устройство из библиотеки</div>
                <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>или нажмите <span className="kbd">⌘K</span> для поиска</div>
              </div>
            )}

            {/* drop slot hint */}
            {dragHoverSlot !== null && dragDeviceObj && (
              <div style={{
                position: 'absolute', left: 0, top: dragHoverSlot * U_HEIGHT,
                width: RACK_W, height: dragDeviceObj.u * U_HEIGHT,
                background: 'var(--accent-soft)',
                border: '1px dashed var(--accent)',
                borderRadius: 2, zIndex: 2, pointerEvents: 'none',
              }}/>
            )}
            {swapIndicator && dragHoverSlot !== null && (
              <div style={{
                position: 'absolute', left: 0, top: dragHoverSlot * U_HEIGHT,
                width: RACK_W, height: U_HEIGHT,
                background: 'rgba(242,169,59,0.15)',
                border: '1px dashed var(--warning)',
                borderRadius: 2, zIndex: 2,
              }}/>
            )}
            {ghostSlot !== null && (
              <div style={{
                position: 'absolute', left: 0, top: ghostSlot * U_HEIGHT,
                width: RACK_W, height: U_HEIGHT,
                background: 'repeating-linear-gradient(45deg, transparent 0 4px, rgba(255,255,255,0.05) 4px 8px)',
                border: '1px dashed var(--line-strong)',
                borderRadius: 2, zIndex: 1,
              }}/>
            )}

            {/* Devices */}
            {placements.map(p => {
              const dev = DEVICES.find(d => d.id === p.deviceId);
              if (!dev) return null;
              const selected = selectedDevice === p.id;
              return (
                <div key={p.id} style={{ position: 'absolute', left: 0, top: p.slot * U_HEIGHT, zIndex: selected ? 5 : 3 }}>
                  {view === 'front' ? (
                    <DeviceFront device={dev} selected={selected} width={RACK_W}/>
                  ) : (
                    <MockDeviceRear device={dev} placementId={p.id} selected={selected} width={RACK_W} pendingCable={pendingCable} ports={ports} signalFlow={signalFlow}/>
                  )}
                </div>
              );
            })}

            {/* Cables */}
            {view === 'rear' && (
              <svg style={{ position: 'absolute', inset: 0, width: RACK_W, height: units * U_HEIGHT, pointerEvents: 'none', zIndex: 4 }}>
                {cables.map(c => {
                  const from = ports[`${c.srcPlacement}.${c.srcPort}`];
                  const to   = ports[`${c.dstPlacement}.${c.dstPort}`];
                  if (!from || !to) return null;
                  const sel = selectedCable === c.id;
                  return <Cable key={c.id} from={from} to={to} protocol={c.protocol} state={sel ? 'selected' : 'idle'} glow={sel} dimmed={c.dim}/>;
                })}
                {pendingCable && pendingCable.srcPos && (
                  <Cable from={pendingCable.srcPos} to={pendingCable.mouse} protocol={pendingCable.protocol} state="selected" glow/>
                )}
              </svg>
            )}
          </div>
        </RackChassis>
      </div>

      {hint && (
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: 'var(--muted-2)' }} className="mono">
            {hint}
          </div>
        </div>
      )}
    </div>
  );
}

// Frozen rear-panel renderer with port glyphs (compat state per port if pendingCable)
function MockDeviceRear({ device, placementId, selected, width, pendingCable, ports, signalFlow }) {
  const h = U_HEIGHT * device.u;
  const cols = device.portsRear.length;
  const colW = (width - 24) / cols;
  const compatOf = (port) => {
    if (!pendingCable) return 'idle';
    if (pendingCable.srcPlacement === placementId && pendingCable.srcPort === port.id) return 'idle';
    const isCompat = pendingCable.protocol === port.protocol && pendingCable.srcDir !== port.dir;
    return isCompat ? 'compatible' : (pendingCable.invalidPorts && pendingCable.invalidPorts.includes(`${placementId}.${port.id}`) ? 'invalid' : 'idle');
  };
  return (
    <div style={{
      position: 'relative', width, height: h,
      border: selected ? '1px solid var(--accent)' : '1px solid #2A2C2F',
      borderRadius: 2,
      boxShadow: selected ? '0 0 0 1px var(--accent), 0 0 24px -4px rgba(200,255,0,0.32)' : 'none',
      overflow: 'hidden',
    }}>
      <svg viewBox={`0 0 ${width} ${h}`} width="100%" height="100%" style={{ display:'block' }}>
        <rect x="0" y="0" width={width} height={h} fill="#0C0D0F"/>
        <rect x="6" y="6" width={width-12} height={h-12} fill="#101113" stroke="#2A2C2F"/>
        <text x="14" y="14" fill="#5D636C" fontSize="6" fontFamily="IBM Plex Mono" letterSpacing="0.05em">{device.mfr.toUpperCase()} · {device.name}</text>
        {device.portsRear.map((port, i) => {
          const x = 12 + i * colW + colW / 2;
          const y = h / 2;
          return (
            <g key={port.id}>
              <text x={x} y={y - 16} fill="#5D636C" fontSize="4.5" fontFamily="IBM Plex Mono" textAnchor="middle">{port.label}</text>
              <text x={x} y={y + 16} fill={PROTOCOLS[port.protocol].color} fontSize="4" fontFamily="IBM Plex Mono" textAnchor="middle" opacity="0.7">
                {PROTOCOLS[port.protocol].short}·{port.dir.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0 }}>
        {device.portsRear.map((port, i) => {
          const x = 12 + i * colW + colW / 2;
          const y = h / 2;
          const state = compatOf(port);
          return (
            <div key={port.id} style={{ position: 'absolute', left: x - 10, top: y - 10, width: 20, height: 20 }}>
              <PortGlyph kind={port.kind} protocol={port.protocol} size={20} state={state}/>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// EditorMock — assemble the full editor at given size, with config
// ─────────────────────────────────────────────────────────

function EditorMock({
  width = 1240, height = 760,
  top = {}, library = {}, canvas = {}, inspector = {}, status = {},
  overlay = null, modal = null, toast = null,
}) {
  return (
    <div style={{
      width, height, display: 'flex', flexDirection: 'column',
      background: 'var(--bg)', color: 'var(--copy)', overflow: 'hidden',
      borderRadius: 'var(--r-3)', border: '1px solid var(--line-2)', position: 'relative',
    }}>
      <MockTopBar {...top}/>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <MockLibrary {...library}/>
        <MockCanvas {...canvas}/>
        <MockInspector {...inspector}/>
      </div>
      <MockStatusBar {...status}/>

      {overlay}

      {toast && (
        <div style={{ position: 'absolute', right: 20, bottom: 50, zIndex: 50 }}>
          <Toast {...toast} onClose={() => {}}/>
        </div>
      )}

      {modal && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,9,11,0.65)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          {modal}
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  MockTopBar, MockStatusBar, MockLibrary, MockInspector, MockCanvas,
  MockDeviceRear, EditorMock,
});
