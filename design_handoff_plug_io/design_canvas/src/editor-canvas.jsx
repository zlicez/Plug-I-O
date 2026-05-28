// Editor canvas + inspector + modals/toasts
// Lives in window.{RackCanvas, InspectorPanel, Toast, ExportMenu, ShortcutsModal, ConfirmModal, EmptyState}

const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

// ─────────────────────────────────────────────────────────
// RackCanvas — the central view (front or rear)
// ─────────────────────────────────────────────────────────
function RackCanvas({
  rackUnits, placements, cables, view, selection, setSelection,
  hover, setHover, dragDevice, setDragDevice, dragHoverSlot, setDragHoverSlot,
  onDropToSlot, pendingCable, setPendingCable, mouse, setPortPos, portPos,
  onPortClick, signalFlow, flowMap,
}) {
  const RACK_W = 520;
  const containerRef = useRefC(null);
  const [flipping, setFlipping] = useStateC(false);
  const prevView = useRefC(view);

  useEffectC(() => {
    if (prevView.current !== view) {
      setFlipping(true);
      const t = setTimeout(() => setFlipping(false), 480);
      prevView.current = view;
      return () => clearTimeout(t);
    }
  }, [view]);

  // Occupied slots
  const occupied = new Set();
  placements.forEach(p => {
    const d = DEVICES.find(x => x.id === p.deviceId);
    if (d) for (let i = 0; i < d.u; i++) occupied.add(p.slot + i);
  });

  // Drag computations: which slot the cursor is over while dragging
  const onCanvasDragOver = (e) => {
    if (!dragDevice) return;
    e.preventDefault();
    const rack = containerRef.current?.querySelector('.rack-inner');
    if (!rack) return;
    const r = rack.getBoundingClientRect();
    const y = e.clientY - r.top;
    const slot = Math.max(0, Math.min(rackUnits - 1, Math.floor(y / U_HEIGHT)));
    setDragHoverSlot(slot);
  };
  const onCanvasDrop = (e) => {
    const id = e.dataTransfer.getData('text/plain');
    if (id && dragHoverSlot !== null) onDropToSlot(id, dragHoverSlot);
    setDragHoverSlot(null);
  };
  const onCanvasDragLeave = (e) => {
    if (e.target === e.currentTarget) setDragHoverSlot(null);
  };

  // Validate drag-hover slot for currently dragged device
  const dragDeviceU = dragDevice ? DEVICES.find(d => d.id === dragDevice)?.u : 0;
  const dragValid = (() => {
    if (dragHoverSlot === null || !dragDeviceU) return null;
    for (let i = 0; i < dragDeviceU; i++) if (occupied.has(dragHoverSlot + i)) return false;
    if (dragHoverSlot + dragDeviceU > rackUnits) return false;
    return true;
  })();

  // Pending cable: locate src port pos
  const srcPos = pendingCable ? portPos[`${pendingCable.srcPlacement}.${pendingCable.srcPort}`] : null;

  return (
    <div
      ref={containerRef}
      onDragOver={onCanvasDragOver}
      onDrop={onCanvasDrop}
      onDragLeave={onCanvasDragLeave}
      onClick={() => setSelection({ kind: null })}
      style={{
        flex: 1, position: 'relative', overflow: 'auto',
        background: 'var(--bg)',
        backgroundImage: 'radial-gradient(circle, #1A1B1D 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: '0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 24px',
        minHeight: 0,
      }}>

      {/* Canvas overlay top-left: view chip */}
      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, alignItems: 'center', zIndex: 10 }}>
        <span className="label-eyebrow">CANVAS</span>
        <span className="chip mono" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-ring)' }}>
          {view === 'front' ? 'FRONT' : 'REAR'} VIEW
        </span>
        {pendingCable && (
          <span className="chip mono" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulse-ring 1.2s infinite' }}/>
            Drawing cable
          </span>
        )}
      </div>

      {/* Canvas overlay top-right: zoom */}
      <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4, zIndex: 10 }}>
        <button className="btn btn-sm btn-ghost btn-icon"><Icon name="zoomOut" size={14}/></button>
        <span className="chip mono" style={{ height: 26 }}>100%</span>
        <button className="btn btn-sm btn-ghost btn-icon"><Icon name="zoomIn" size={14}/></button>
      </div>

      {/* Rack */}
      <div className="rack-canvas-inner" style={{
        position: 'relative',
        perspective: '1600px',
      }}
      onClick={(e) => { e.stopPropagation(); if (pendingCable) setPendingCable(null); }}>
        <div style={{
          transition: 'transform 480ms var(--e-emphasized)',
          transformStyle: 'preserve-3d',
          transform: flipping ? 'rotateY(15deg)' : 'rotateY(0deg)',
        }}>
          <RackChassis units={rackUnits} width={RACK_W}>
            <div className="rack-inner" style={{ position: 'relative', width: RACK_W, height: rackUnits * U_HEIGHT }}>
              {/* drop slot hint */}
              {dragDevice && dragHoverSlot !== null && (
                <div style={{
                  position: 'absolute', left: 0, top: dragHoverSlot * U_HEIGHT,
                  width: RACK_W, height: (dragDeviceU || 1) * U_HEIGHT,
                  background: dragValid ? 'var(--accent-soft)' : 'rgba(224,84,84,0.15)',
                  border: `1px dashed ${dragValid ? 'var(--accent)' : 'var(--danger)'}`,
                  borderRadius: 2, zIndex: 2,
                  pointerEvents: 'none',
                  animation: 'pulse-ring 1.4s infinite',
                }}/>
              )}

              {/* Empty rack hint */}
              {placements.length === 0 && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'var(--muted)', textAlign: 'center', padding: 30,
                  pointerEvents: 'none',
                }}>
                  <div style={{ marginBottom: 14 }}>
                    <svg width="56" height="40" viewBox="0 0 56 40" fill="none">
                      <rect x="2" y="2" width="52" height="36" rx="2" stroke="var(--line-2)" strokeDasharray="3 4" strokeWidth="1"/>
                      <line x1="8" y1="20" x2="48" y2="20" stroke="var(--line-2)" strokeDasharray="2 3"/>
                      <circle cx="14" cy="14" r="2" fill="var(--accent)"/>
                      <circle cx="14" cy="26" r="2" fill="var(--accent)" opacity="0.4"/>
                    </svg>
                  </div>
                  <div className="label-eyebrow" style={{ color: 'var(--muted-2)', marginBottom: 4 }}>EMPTY RACK</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--copy-2)', marginBottom: 6 }}>Перетащите устройство из библиотеки</div>
                  <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>или нажмите <span className="kbd">⌘K</span> для поиска</div>
                </div>
              )}

              {/* Devices */}
              {placements.map(p => {
                const dev = DEVICES.find(d => d.id === p.deviceId);
                if (!dev) return null;
                const selected = selection.kind === 'device' && selection.id === p.id;
                const isPendingSrc = pendingCable && pendingCable.srcPlacement === p.id;
                return (
                  <div key={p.id}
                    onClick={(e) => { e.stopPropagation(); setSelection({ kind: 'device', id: p.id }); }}
                    style={{
                      position: 'absolute', left: 0, top: p.slot * U_HEIGHT,
                      zIndex: selected ? 5 : 3,
                      opacity: dragDevice && dragHoverSlot !== null ? 0.85 : 1,
                    }}>
                    {view === 'front' ? (
                      <DeviceFront device={dev} selected={selected} width={RACK_W}/>
                    ) : (
                      <DeviceRearWithPorts
                        device={dev} placementId={p.id} selected={selected || isPendingSrc} width={RACK_W}
                        slot={p.slot}
                        setPortPos={setPortPos}
                        onPortClick={onPortClick}
                        onPortEnter={(portId) => setHover({ kind: 'port', placementId: p.id, portId })}
                        onPortLeave={() => setHover(null)}
                        pendingCable={pendingCable}
                      />
                    )}
                  </div>
                );
              })}

              {/* Cables (rear) */}
              {view === 'rear' && (
                <svg
                  style={{ position: 'absolute', inset: 0, width: RACK_W, height: rackUnits * U_HEIGHT, pointerEvents: 'none', zIndex: 4 }}>
                  {cables.map(c => {
                    const from = portPos[`${c.srcPlacement}.${c.srcPort}`];
                    const to   = portPos[`${c.dstPlacement}.${c.dstPort}`];
                    if (!from || !to) return null;
                    const selected = selection.kind === 'cable' && selection.id === c.id;
                    const dim = (signalFlow !== 'off' && !flowMap[c.id]) || (selection.kind === 'device' && (selection.id !== c.srcPlacement && selection.id !== c.dstPlacement));
                    const overrideColor = signalFlow === 'source' ? flowMap[c.id] : null;
                    return (
                      <g key={c.id}
                         style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                         onClick={(e) => { e.stopPropagation(); setSelection({ kind: 'cable', id: c.id }); }}
                         onMouseEnter={() => setHover({ kind: 'cable', id: c.id })}
                         onMouseLeave={() => setHover(null)}>
                        <Cable from={from} to={to} protocol={c.protocol} state={selected ? 'selected' : 'idle'} dimmed={dim} glow={selected}/>
                        {overrideColor && (
                          <CableOverride from={from} to={to} color={overrideColor}/>
                        )}
                      </g>
                    );
                  })}
                  {/* Pending cable */}
                  {pendingCable && srcPos && (
                    <g style={{ pointerEvents: 'none' }}>
                      <Cable from={srcPos} to={mouse} protocol={pendingCable.srcProtocol} state="selected" glow/>
                    </g>
                  )}
                </svg>
              )}
            </div>
          </RackChassis>
        </div>
      </div>

      {/* Canvas bottom hints */}
      <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: 'var(--muted-2)' }} className="mono">
          <span className="kbd">V</span><span>front</span>
          <span style={{ margin: '0 4px' }}>·</span>
          <span className="kbd">R</span><span>rear</span>
          <span style={{ margin: '0 4px' }}>·</span>
          <span className="kbd">⌘Z</span><span>undo</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11, color: 'var(--muted-2)' }} className="mono">
          <span>{rackUnits}U · {placements.length} devices · {cables.length} cables</span>
        </div>
      </div>
    </div>
  );
}

// Empty cable color override (drawing on top of the base path for signal-flow by-source)
function CableOverride({ from, to, color }) {
  const dx = to.x - from.x;
  const sag = Math.min(80, Math.abs(dx) * 0.3 + 24);
  const c1 = { x: from.x + dx * 0.15, y: from.y + sag };
  const c2 = { x: to.x   - dx * 0.15, y: to.y   + sag };
  const d = `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`;
  return <path d={d} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" opacity="0.85"/>;
}

// Rack chassis with U index + ears (slimmer than RackFrame, no inner padding gap)
function RackChassis({ units, width, children }) {
  const innerH = units * U_HEIGHT;
  const earW = 32;
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      padding: 14,
      background: 'linear-gradient(180deg, #1A1B1D 0%, #141517 100%)',
      borderRadius: 6,
      border: '1px solid #2A2C2F',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 28px 80px -20px rgba(0,0,0,0.8)',
    }}>
      {/* Left ear */}
      <div style={{ width: earW, background: 'linear-gradient(180deg, #0E0F11 0%, #0a0b0c 100%)', borderRadius: 2, position: 'relative', border: '1px solid #2A2C2F' }}>
        {[8, innerH - 8].map((y, i) => (
          <div key={i} style={{
            position:'absolute', left: 10, top: y - 6, width: 12, height: 12,
            borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, #4a4d52, #1c1d1f 70%)',
            border:'1px solid #050608',
          }}>
            <div style={{position:'absolute', inset:'4px', borderTop:'1.5px solid #2a2c2f', transform:'rotate(45deg)'}}/>
          </div>
        ))}
        {/* U index */}
        <div style={{
          position: 'absolute', right: 0, top: 0, bottom: 0,
          display: 'flex', flexDirection: 'column',
          padding: '0',
        }}>
          {Array.from({length: units}).map((_, i) => (
            <div key={i} className="mono" style={{
              fontSize: 9, color: '#5D636C', height: U_HEIGHT,
              display:'flex', alignItems:'center', justifyContent:'flex-end',
              paddingRight: 4,
            }}>{String(units - i).padStart(2,'0')}</div>
          ))}
        </div>
      </div>
      {/* Inner cavity */}
      <div style={{
        position: 'relative',
        width, height: innerH,
        background: '#0E0F11',
        borderTop: '1px solid #050608', borderBottom: '1px solid #050608',
      }}>
        {/* U guide lines */}
        <svg width={width} height={innerH} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
          {Array.from({length: units + 1}).map((_, i) => (
            <line key={i} x1="0" y1={i * U_HEIGHT} x2={width} y2={i * U_HEIGHT}
                  stroke="#1A1B1D" strokeWidth="1"/>
          ))}
          {Array.from({length: units}).map((_, i) => (
            <line key={`d${i}`} x1="0" y1={i * U_HEIGHT + U_HEIGHT/2} x2={width} y2={i * U_HEIGHT + U_HEIGHT/2}
                  stroke="#15171A" strokeDasharray="2 5"/>
          ))}
        </svg>
        {children}
      </div>
      {/* Right ear (mirror) */}
      <div style={{ width: earW, background: 'linear-gradient(180deg, #0E0F11 0%, #0a0b0c 100%)', borderRadius: 2, position: 'relative', border: '1px solid #2A2C2F' }}>
        {[8, innerH - 8].map((y, i) => (
          <div key={i} style={{
            position:'absolute', right: 10, top: y - 6, width: 12, height: 12,
            borderRadius:'50%', background:'radial-gradient(circle at 30% 30%, #4a4d52, #1c1d1f 70%)',
            border:'1px solid #050608',
          }}>
            <div style={{position:'absolute', inset:'4px', borderTop:'1.5px solid #2a2c2f', transform:'rotate(45deg)'}}/>
          </div>
        ))}
      </div>
    </div>
  );
}

// DeviceRear that wires up port positions, click handlers, hover
function DeviceRearWithPorts({ device, placementId, selected, width, slot, setPortPos, onPortClick, onPortEnter, onPortLeave, pendingCable }) {
  const h = U_HEIGHT * device.u;
  const cols = device.portsRear.length;
  const colW = (width - 24) / cols;
  const slotTop = slot * U_HEIGHT;

  // Compute port positions (canvas coords, relative to rack-inner)
  useEffectC(() => {
    device.portsRear.forEach((port, i) => {
      const x = 12 + i * colW + colW / 2;
      const y = slotTop + h / 2;
      setPortPos(`${placementId}.${port.id}`, { x, y });
    });
  }, [device, placementId, width, slot, h, colW, slotTop, setPortPos]);

  // Determine compatibility per port if pendingCable
  const compat = (port) => {
    if (!pendingCable) return 'idle';
    if (pendingCable.srcPlacement === placementId && pendingCable.srcPort === port.id) return 'idle';
    const isCompatible = pendingCable.srcProtocol === port.protocol && pendingCable.srcDir !== port.dir;
    return isCompatible ? 'compatible' : 'invalid';
  };

  return (
    <div className="device-rear" style={{
      position: 'relative', width, height: h,
      border: selected ? '1px solid var(--accent)' : '1px solid #2A2C2F',
      borderRadius: 2,
      boxShadow: selected ? '0 0 0 1px var(--accent), 0 0 28px -4px rgba(200,255,0,0.32)' : 'none',
      transition: 'box-shadow 200ms var(--e-emphasized)',
      overflow: 'hidden',
    }}>
      <svg viewBox={`0 0 ${width} ${h}`} width="100%" height="100%" style={{display:'block'}}>
        <rect x="0" y="0" width={width} height={h} fill="#0C0D0F"/>
        <rect x="6" y="6" width={width-12} height={h-12} fill="#101113" stroke="#2A2C2F"/>
        <text x="14" y="14" fill="#5D636C" fontSize="6" fontFamily="IBM Plex Mono" letterSpacing="0.05em">{device.mfr.toUpperCase()} · {device.name}</text>
        {device.portsRear.map((port, i) => {
          const x = 12 + i * colW + colW / 2;
          const y = h / 2;
          const state = compat(port);
          return (
            <g key={port.id}>
              <text x={x} y={y - 16} fill="#5D636C" fontSize="4.5" fontFamily="IBM Plex Mono" textAnchor="middle">{port.label}</text>
              <text x={x} y={y + 16} fill={state === 'invalid' ? 'var(--danger)' : PROTOCOLS[port.protocol].color} fontSize="4" fontFamily="IBM Plex Mono" textAnchor="middle" opacity={state === 'invalid' ? 0.5 : 0.75}>
                {PROTOCOLS[port.protocol].short}·{port.dir.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
      {/* Foreign div layer over the svg for interactive port glyphs */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {device.portsRear.map((port, i) => {
          const x = 12 + i * colW + colW / 2;
          const y = h / 2;
          const state = compat(port);
          return (
            <button key={port.id}
              onMouseEnter={() => onPortEnter(port.id)}
              onMouseLeave={() => onPortLeave()}
              onClick={(e) => onPortClick(placementId, port.id, e)}
              style={{
                position: 'absolute', left: x - 12, top: y - 12, width: 24, height: 24,
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                borderRadius: '50%',
                transition: 'transform 120ms var(--e-emphasized)',
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
              onMouseUp={(e)   => { e.currentTarget.style.transform = ''; }}>
              <PortGlyph kind={port.kind} protocol={port.protocol} size={20} state={state}/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// InspectorPanel
// ─────────────────────────────────────────────────────────
function InspectorPanel({ selection, placement, device, cable, cables, placements, onRemoveDevice, onDeleteCable, deviceFor }) {
  const [tab, setTab] = useStateC('overview');
  useEffectC(() => { setTab('overview'); }, [selection.id, selection.kind]);

  return (
    <div style={{
      width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column',
      borderLeft: '1px solid var(--line)', background: 'var(--surface)',
      minHeight: 0,
    }}>
      <div style={{ padding: '14px 14px 0', borderBottom: '1px solid var(--line)' }}>
        <div className="label-eyebrow" style={{ marginBottom: 4 }}>INSPECTOR</div>
        {!selection.kind && (
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Nothing selected</div>
        )}
        {selection.kind === 'device' && device && (
          <>
            <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2 }}>{device.name}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted-2)', marginTop: 2 }}>{device.mfr} · {device.category} · {device.u}U</div>
          </>
        )}
        {selection.kind === 'cable' && cable && (
          <>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Audio patch</div>
            <div className="mono" style={{ fontSize: 11, color: PROTOCOLS[cable.protocol].color, marginTop: 2 }}>
              <ProtocolDot protocol={cable.protocol}/> {PROTOCOLS[cable.protocol].label}
            </div>
          </>
        )}
        {selection.kind && (
          <div style={{ display: 'flex', gap: 0, marginTop: 14, borderBottom: '1px solid var(--line)' }}>
            {(selection.kind === 'device' ? ['overview', 'ports', 'connections', 'specs'] : ['route', 'meta']).map(t => (
              <button key={t} onClick={() => setTab(t)} className="mono"
                style={{
                  padding: '8px 10px', fontSize: 11, letterSpacing: '0.06em',
                  textTransform: 'uppercase', cursor: 'pointer',
                  color: tab === t ? 'var(--copy)' : 'var(--muted)',
                  borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: -1,
                }}>{t}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {!selection.kind && (
          <EmptyState
            icon="cable"
            title="Select something"
            body="Click a device or cable to see its details, ports and connections here."
          />
        )}
        {selection.kind === 'device' && device && tab === 'overview' && (
          <div>
            <div style={{ borderRadius: 'var(--r-3)', overflow: 'hidden', border: '1px solid var(--line)', marginBottom: 12 }}>
              <DeviceFront device={device} width={310}/>
            </div>
            <p style={{ fontSize: 13, color: 'var(--copy-2)', lineHeight: 1.5, margin: 0 }}>{device.desc}</p>
            <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="chip">{device.category}</span>
              <span className="chip">{device.u}U</span>
              {Array.from(new Set(device.portsRear.map(p => p.protocol))).slice(0, 4).map(p => (
                <span key={p} className="chip"><ProtocolDot protocol={p}/>{PROTOCOLS[p].label}</span>
              ))}
            </div>
          </div>
        )}
        {selection.kind === 'device' && device && tab === 'ports' && (
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 8 }}>{device.portsRear.length} PORTS</div>
            {device.portsRear.map(p => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 'var(--r-2)',
                background: 'var(--surface-2)', marginBottom: 4,
                border: '1px solid var(--line)',
              }}>
                <PortGlyph kind={p.kind} protocol={p.protocol} size={20}/>
                <div style={{ flex: 1 }}>
                  <div className="mono" style={{ fontSize: 12, color: 'var(--copy)' }}>{p.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: PROTOCOLS[p.protocol].color, opacity: 0.85 }}>
                    {PROTOCOLS[p.protocol].label} · {p.dir.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {selection.kind === 'device' && device && tab === 'connections' && (
          <div>
            {(() => {
              const conn = cables.filter(c => c.srcPlacement === selection.id || c.dstPlacement === selection.id);
              if (conn.length === 0) return <EmptyState icon="cable" title="No cables connected" body="Switch to Rear view and click any port to start patching."/>;
              return (
                <div>
                  <div className="label-eyebrow" style={{ marginBottom: 8 }}>{conn.length} CONNECTIONS</div>
                  {conn.map(c => {
                    const isOut = c.srcPlacement === selection.id;
                    const port = device.portsRear.find(p => p.id === (isOut ? c.srcPort : c.dstPort));
                    const other = isOut ? deviceFor(c.dstPlacement) : deviceFor(c.srcPlacement);
                    const otherPort = isOut ? c.dstPort : c.srcPort;
                    return (
                      <div key={c.id} style={{ padding: '8px 10px', borderRadius: 'var(--r-2)', background: 'var(--surface-2)', marginBottom: 4, border: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }} className="mono">
                          <span style={{ color: 'var(--muted)' }}>{port?.label}</span>
                          <Icon name={isOut ? 'arrowRight' : 'arrowRight'} size={11} color={PROTOCOLS[c.protocol].color} style={isOut ? {} : { transform: 'rotate(180deg)' }}/>
                          <span style={{ color: 'var(--copy)' }}>{other?.name} · {otherPort}</span>
                        </div>
                        <div className="mono" style={{ fontSize: 10, color: PROTOCOLS[c.protocol].color, marginTop: 2 }}>
                          <ProtocolDot protocol={c.protocol}/> {PROTOCOLS[c.protocol].label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
        {selection.kind === 'device' && device && tab === 'specs' && (
          <div>
            {Object.entries(device.specs).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }} className="mono">
                <span style={{ color: 'var(--muted)' }}>{k}</span>
                <span style={{ color: 'var(--copy)' }}>{v}</span>
              </div>
            ))}
          </div>
        )}
        {selection.kind === 'cable' && cable && tab === 'route' && (
          <div>
            <div style={{ padding: 12, borderRadius: 'var(--r-3)', background: 'var(--surface-2)', border: '1px solid var(--line)' }}>
              <div className="label-eyebrow" style={{ marginBottom: 6 }}>SOURCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {(() => { const d = deviceFor(cable.srcPlacement); const p = d?.portsRear.find(pp => pp.id === cable.srcPort); return p ? <PortGlyph kind={p.kind} protocol={p.protocol} size={18}/> : null; })()}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{deviceFor(cable.srcPlacement)?.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{cable.srcPort}</div>
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
                {(() => { const d = deviceFor(cable.dstPlacement); const p = d?.portsRear.find(pp => pp.id === cable.dstPort); return p ? <PortGlyph kind={p.kind} protocol={p.protocol} size={18}/> : null; })()}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{deviceFor(cable.dstPlacement)?.name}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{cable.dstPort}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {selection.kind === 'cable' && cable && tab === 'meta' && (
          <div>
            <SpecRow k="Protocol" v={PROTOCOLS[cable.protocol].label}/>
            <SpecRow k="Color code" v={<span style={{ display:'inline-flex', alignItems:'center', gap:6 }}><ProtocolDot protocol={cable.protocol}/>{PROTOCOLS[cable.protocol].color}</span>}/>
            <SpecRow k="Length" v="—"/>
            <SpecRow k="Pattern" v={PROTOCOLS[cable.protocol].dash}/>
          </div>
        )}
      </div>

      {selection.kind && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '12px 14px', display: 'flex', gap: 6 }}>
          {selection.kind === 'device' ? (
            <>
              <button className="btn btn-sm" style={{ flex: 1 }}><Icon name="copy" size={13}/>Duplicate</button>
              <button className="btn btn-sm btn-danger" onClick={onRemoveDevice}><Icon name="trash" size={13}/>Remove</button>
            </>
          ) : (
            <button className="btn btn-sm btn-danger" style={{ flex: 1 }} onClick={onDeleteCable}>
              <Icon name="trash" size={13}/>Disconnect cable
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SpecRow({ k, v }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)', fontSize: 12 }} className="mono">
      <span style={{ color: 'var(--muted)' }}>{k}</span>
      <span style={{ color: 'var(--copy)' }}>{v}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// EmptyState
// ─────────────────────────────────────────────────────────
function EmptyState({ icon = 'help', title, body, action, onAction }) {
  return (
    <div style={{ padding: 18, textAlign: 'center', color: 'var(--muted)' }}>
      <div style={{
        width: 44, height: 44, margin: '0 auto 14px',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface-2)', border: '1px solid var(--line)',
      }}>
        <Icon name={icon} size={20} color="var(--muted-2)"/>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--copy)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: action ? 14 : 0, lineHeight: 1.5 }}>{body}</div>
      {action && (
        <button className="btn btn-sm" onClick={onAction}>{action}</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Toast
// ─────────────────────────────────────────────────────────
function Toast({ kind = 'info', title, body, onClose }) {
  const iconName = kind === 'success' ? 'check' : kind === 'error' ? 'alert' : kind === 'warning' ? 'alert' : 'info';
  const color = kind === 'success' ? 'var(--positive)' : kind === 'error' ? 'var(--danger)' : kind === 'warning' ? 'var(--warning)' : 'var(--info)';
  return (
    <div className={`toast toast-${kind}`}>
      <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}22`, color, flexShrink: 0 }}>
        <Icon name={iconName} size={12} color={color}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        {body && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 }}>{body}</div>}
      </div>
      <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} style={{ marginRight: -4, marginTop: -2 }}>
        <Icon name="x" size={12}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ExportMenu, ShortcutsModal, ConfirmModal
// ─────────────────────────────────────────────────────────
function Modal({ children, onClose, width = 460 }) {
  useEffectC(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(8,9,11,0.7)', backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width, maxWidth: '90vw',
          background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-4)', boxShadow: 'var(--elev-3)', overflow: 'hidden',
          animation: 'scaleIn 240ms var(--e-emphasized)' }}>
        {children}
      </div>
      <style>{`@keyframes scaleIn { from { transform: scale(0.96); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

function ExportMenu({ onClose, onSelect }) {
  const opts = [
    { fmt: 'json', name: 'JSON', desc: 'Machine-readable session for backup / sharing', icon: 'cpu' },
    { fmt: 'png', name: 'PNG', desc: 'Flat image of front & rear (2× scale)', icon: 'eye' },
    { fmt: 'pdf', name: 'PDF spec sheet', desc: 'A4 print with patch list, port table, BOM', icon: 'printer' },
    { fmt: 'svg', name: 'SVG', desc: 'Vector — editable in Figma / Illustrator', icon: 'edit' },
  ];
  return (
    <Modal onClose={onClose}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="label-eyebrow">EXPORT</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Save the rack as…</div>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div style={{ padding: 10 }}>
        {opts.map(o => (
          <button key={o.fmt} onClick={() => onSelect(o.fmt)} className="export-row" style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: 12, borderRadius: 'var(--r-3)', cursor: 'pointer',
            background: 'transparent', border: '1px solid transparent', textAlign: 'left',
            transition: 'background var(--d-fast), border-color var(--d-fast)',
          }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--line)'; }}
             onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
              <Icon name={o.icon} size={16} color="var(--accent)"/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{o.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{o.desc}</div>
            </div>
            <Icon name="arrowRight" size={14} color="var(--muted-2)"/>
          </button>
        ))}
      </div>
    </Modal>
  );
}

function ShortcutsModal({ onClose }) {
  const groups = [
    { title: 'View', items: [['V', 'Front view'], ['R', 'Rear view'], ['Z', 'Zoom controls'], ['Space', 'Pan canvas']] },
    { title: 'Library', items: [['⌘K', 'Quick search'], ['G', 'Toggle grid/list'], ['F', 'Open filters']] },
    { title: 'Editing', items: [['⌘Z', 'Undo'], ['⌘⇧Z', 'Redo'], ['Del', 'Remove selection'], ['Esc', 'Cancel cable / close modal']] },
    { title: 'File', items: [['⌘S', 'Save session'], ['⌘E', 'Export'], ['?', 'This help']] },
  ];
  return (
    <Modal onClose={onClose} width={540}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="label-eyebrow">KEYBOARD</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Shortcuts</div>
        </div>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><Icon name="x" size={14}/></button>
      </div>
      <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 28px' }}>
        {groups.map(g => (
          <div key={g.title}>
            <div className="label-eyebrow" style={{ marginBottom: 10 }}>{g.title}</div>
            {g.items.map(([k, label]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', fontSize: 12 }}>
                <span style={{ color: 'var(--copy-2)' }}>{label}</span>
                <span className="kbd">{k}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Modal>
  );
}

function ConfirmModal({ title, body, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} width={420}>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: danger ? 'var(--danger-soft)' : 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="alert" size={16} color={danger ? 'var(--danger)' : 'var(--accent)'}/>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{body}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, {
  RackCanvas, RackChassis, InspectorPanel, EmptyState,
  Toast, ExportMenu, ShortcutsModal, ConfirmModal, Modal,
  DeviceRearWithPorts,
});
