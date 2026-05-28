// Editor chrome — TopBar, StatusBar, Library, Inspector, modals, toasts
// Lives in window.{TopBar, StatusBar, LibraryPanel, InspectorPanel, Toast, ExportMenu, ShortcutsModal, ConfirmModal, RackCanvas}

const { useState: useStateP, useRef: useRefP, useEffect: useEffectP, useMemo: useMemoP } = React;

// ─────────────────────────────────────────────────────────
// TopBar
// ─────────────────────────────────────────────────────────
function TopBar({ rackUnits, setRackUnits, view, setView, history, onSave, onExport, onHelp }) {
  const [rackOpen, setRackOpen] = useStateP(false);
  return (
    <div style={{
      height: 48, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 12px', borderBottom: '1px solid var(--line)',
      background: 'var(--surface)', position: 'relative', zIndex: 30,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingRight: 16, borderRight: '1px solid var(--line)' }}>
        <Logo size={22}/>
        <span style={{ fontWeight: 600, letterSpacing: '-0.01em', fontSize: 14 }}>Plug-I/O</span>
        <span className="chip mono" style={{ height: 18, fontSize: 10 }}>beta</span>
      </div>

      {/* Rack name + size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 12, paddingRight: 12, borderRight: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="label-eyebrow">RACK</span>
          <span style={{ fontSize: 13, fontWeight: 500 }}>Studio A · Tracking</span>
          <Icon name="edit" size={12} color="var(--muted-2)"/>
        </div>
        <div style={{ position: 'relative' }}>
          <button className="chip mono" onClick={() => setRackOpen(o => !o)}
            style={{ height: 22, cursor: 'pointer' }}>
            {rackUnits}U
            <Icon name="chevDown" size={10}/>
          </button>
          {rackOpen && (
            <div style={{
              position: 'absolute', top: 28, left: 0, zIndex: 50,
              background: 'var(--surface-2)', border: '1px solid var(--line-2)',
              borderRadius: 'var(--r-3)', padding: 6, boxShadow: 'var(--elev-3)', minWidth: 100,
            }}>
              {[4,6,8,12,16,24].map(u => (
                <button key={u} className="mono" onClick={() => { setRackUnits(u); setRackOpen(false); }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', padding: '6px 10px', fontSize: 12,
                    borderRadius: 'var(--r-1)', color: u === rackUnits ? 'var(--accent)' : 'var(--copy-2)',
                    background: u === rackUnits ? 'var(--accent-soft)' : 'transparent',
                    cursor: 'pointer',
                  }}>
                  <span>{u}U</span>
                  <span style={{ color: 'var(--muted-2)', fontSize: 10 }}>{u*44.45/10|0} cm</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Front/Rear toggle */}
      <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'var(--bg-2)',
        borderRadius: 'var(--r-2)', border: '1px solid var(--line-2)', marginLeft: 12 }}>
        {['front', 'rear'].map(v => (
          <button key={v} onClick={() => setView(v)} className="mono"
            style={{
              height: 24, padding: '0 12px', borderRadius: 'var(--r-1)',
              background: view === v ? 'var(--accent)' : 'transparent',
              color: view === v ? 'var(--accent-text)' : 'var(--muted)',
              fontWeight: view === v ? 600 : 500, fontSize: 11, letterSpacing: '0.08em',
              cursor: 'pointer', transition: 'background var(--d-fast)',
            }}>
            {v.toUpperCase()}
          </button>
        ))}
      </div>
      <span className="kbd" style={{ marginLeft: 8 }}>V</span>
      <span style={{ color: 'var(--muted-2)', margin: '0 4px', fontSize: 11 }}>/</span>
      <span className="kbd">R</span>

      {/* Spacer */}
      <div style={{ flex: 1 }}/>

      {/* Undo/Redo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingRight: 12, borderRight: '1px solid var(--line)' }}>
        <button className="btn btn-ghost btn-icon btn-sm" title={history.undo[0] ? `Undo: ${history.undo[0]}` : 'Nothing to undo'}>
          <Icon name="undo" size={14}/>
          {history.undo.length > 0 && <span className="badge" style={{ marginLeft: -4, height: 14, minWidth: 14, fontSize: 9 }}>{history.undo.length}</span>}
        </button>
        <button className="btn btn-ghost btn-icon btn-sm">
          <Icon name="redo" size={14}/>
        </button>
      </div>

      {/* Save / Export / Share */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12 }}>
        <button className="btn btn-sm" onClick={onSave}>
          <Icon name="save" size={13}/>
          <span>Save</span>
          <span className="kbd" style={{ height: 16, fontSize: 9, marginLeft: 4 }}>⌘S</span>
        </button>
        <button className="btn btn-sm" onClick={onExport}>
          <Icon name="download" size={13}/>
          <span>Export</span>
        </button>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onHelp} title="Keyboard shortcuts (?)">
          <Icon name="help" size={14}/>
        </button>
      </div>
    </div>
  );
}

// Logo
function Logo({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="18" rx="3" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.4"/>
      <circle cx="8"  cy="12" r="2.6" fill="var(--accent)"/>
      <circle cx="16" cy="12" r="2.6" fill="none" stroke="var(--accent)" strokeWidth="1.4"/>
      <line x1="10.6" y1="12" x2="13.4" y2="12" stroke="var(--accent)" strokeWidth="1.4"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// StatusBar
// ─────────────────────────────────────────────────────────
function StatusBar({ hover, placements, cables, selection, deviceFor, view, pendingCable }) {
  const portInfo = (hover && hover.kind === 'port') ? (() => {
    const d = deviceFor(hover.placementId);
    if (!d) return null;
    const port = d.portsRear.find(p => p.id === hover.portId);
    return { d, port };
  })() : null;

  const cableInfo = (hover && hover.kind === 'cable') ? cables.find(c => c.id === hover.id) : null;
  const selCable = selection.kind === 'cable' ? cables.find(c => c.id === selection.id) : null;
  const selDevice = selection.kind === 'device' ? deviceFor(selection.id) : null;

  return (
    <div style={{
      height: 32, flexShrink: 0, display: 'flex', alignItems: 'center',
      padding: '0 12px', borderTop: '1px solid var(--line)',
      background: 'var(--surface)', fontSize: 12, color: 'var(--muted)',
      fontFamily: 'var(--font-mono)',
    }}>
      {/* Left: port hover / pending cable */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {pendingCable ? (
          <>
            <span style={{ color: 'var(--accent)' }}>● ROUTING</span>
            <span style={{ color: 'var(--muted-2)' }}>·</span>
            <span>start: {pendingCable.srcPlacement}.{pendingCable.srcPort}</span>
            <span style={{ color: 'var(--muted-2)' }}>·</span>
            <span style={{ color: 'var(--copy-2)' }}>Click compatible port to complete · Esc to cancel</span>
          </>
        ) : portInfo ? (
          <>
            <PortGlyph kind={portInfo.port.kind} protocol={portInfo.port.protocol} size={16}/>
            <span style={{ color: 'var(--copy)' }}>{portInfo.d.name}</span>
            <span style={{ color: 'var(--muted-2)' }}>·</span>
            <span>{portInfo.port.label}</span>
            <span style={{ color: 'var(--muted-2)' }}>·</span>
            <span style={{ color: PROTOCOLS[portInfo.port.protocol].color }}>
              {PROTOCOLS[portInfo.port.protocol].label} {portInfo.port.dir.toUpperCase()}
            </span>
          </>
        ) : cableInfo ? (
          <>
            <span style={{ color: PROTOCOLS[cableInfo.protocol].color }}>━━</span>
            <span>{deviceFor(cableInfo.srcPlacement)?.name}.{cableInfo.srcPort}</span>
            <Icon name="arrowRight" size={11} color="var(--muted-2)"/>
            <span>{deviceFor(cableInfo.dstPlacement)?.name}.{cableInfo.dstPort}</span>
          </>
        ) : selCable ? (
          <>
            <span style={{ color: PROTOCOLS[selCable.protocol].color }}>━━ SELECTED CABLE</span>
            <span style={{ color: 'var(--muted-2)' }}>·</span>
            <span>{PROTOCOLS[selCable.protocol].label}</span>
          </>
        ) : selDevice ? (
          <>
            <span style={{ color: 'var(--accent)' }}>● DEVICE</span>
            <span style={{ color: 'var(--copy-2)' }}>{selDevice.name}</span>
            <span style={{ color: 'var(--muted-2)' }}>·</span>
            <span>{selDevice.mfr}</span>
            <span style={{ color: 'var(--muted-2)' }}>·</span>
            <span>{selDevice.u}U · {selDevice.category}</span>
          </>
        ) : (
          <span>{view === 'front' ? 'Front view' : 'Rear view'} · Hover any port for details</span>
        )}
      </div>

      <div style={{ flex: 1 }}/>

      {/* Right: summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span><span style={{ color: 'var(--copy-2)' }}>{placements.length}</span> devices</span>
        <span style={{ color: 'var(--line-strong)' }}>│</span>
        <span><span style={{ color: 'var(--copy-2)' }}>{cables.length}</span> patches</span>
        <span style={{ color: 'var(--line-strong)' }}>│</span>
        <span>1.0 · autosaved</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LibraryPanel
// ─────────────────────────────────────────────────────────
function LibraryPanel({ devices, all, searchQ, setSearchQ, filters, setFilters, libView, dragDevice, setDragDevice }) {
  const categories = ['All', ...Array.from(new Set(all.map(d => d.category)))];
  const protocols = Array.from(new Set(all.flatMap(d => d.portsRear.map(p => p.protocol))));
  const [filterOpen, setFilterOpen] = useStateP(false);
  const activeChips = [];
  if (filters.category !== 'All') activeChips.push({ k: 'cat', label: filters.category });
  if (filters.protocol) activeChips.push({ k: 'proto', label: PROTOCOLS[filters.protocol].label });

  return (
    <div style={{
      width: 296, flexShrink: 0, display: 'flex', flexDirection: 'column',
      borderRight: '1px solid var(--line)', background: 'var(--surface)',
      minHeight: 0,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="label-eyebrow">LIBRARY</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>Devices <span style={{ color: 'var(--muted-2)', fontWeight: 400 }}>{devices.length}</span></div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn-ghost btn-icon btn-sm" title="Filters" onClick={() => setFilterOpen(o => !o)}>
              <Icon name="filter" size={13}/>
            </button>
          </div>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={13} color="var(--muted-2)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}/>
          <input className="input mono" style={{ paddingLeft: 30, paddingRight: 50, fontSize: 12 }}
            placeholder="Search devices…" value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}/>
          <span className="kbd" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>⌘K</span>
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {activeChips.map(c => (
              <span key={c.k} className="chip is-active" style={{ cursor: 'pointer' }}
                onClick={() => setFilters(f => ({ ...f, [c.k === 'cat' ? 'category' : 'protocol']: c.k === 'cat' ? 'All' : null }))}>
                <span>{c.label}</span>
                <Icon name="x" size={10}/>
              </span>
            ))}
            <button className="chip" style={{ cursor: 'pointer' }} onClick={() => setFilters({ category: 'All', protocol: null })}>Reset</button>
          </div>
        )}

        {/* Filter dropdown */}
        {filterOpen && (
          <div style={{ marginTop: 12, padding: 10, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-3)' }}>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>CATEGORY</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {categories.map(c => (
                <button key={c} className="chip mono" style={{ cursor: 'pointer', background: filters.category === c ? 'var(--accent-soft)' : 'var(--surface-2)', color: filters.category === c ? 'var(--accent)' : 'var(--copy-2)', borderColor: filters.category === c ? 'var(--accent-ring)' : 'var(--line-2)' }}
                  onClick={() => setFilters(f => ({ ...f, category: c }))}>{c}</button>
              ))}
            </div>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>PROTOCOL</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <button className="chip mono" style={{ cursor: 'pointer' }} onClick={() => setFilters(f => ({ ...f, protocol: null }))}>Any</button>
              {protocols.map(p => (
                <button key={p} className="chip mono" style={{ cursor: 'pointer', borderColor: filters.protocol === p ? PROTOCOLS[p].color : 'var(--line-2)' }}
                  onClick={() => setFilters(f => ({ ...f, protocol: p }))}>
                  <ProtocolDot protocol={p}/> {PROTOCOLS[p].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {devices.length === 0 ? (
          <EmptyState
            icon="search"
            title="Ничего не найдено"
            body={`No devices match "${searchQ}".`}
            action="Clear filters"
            onAction={() => { setSearchQ(''); setFilters({ category: 'All', protocol: null }); }}
          />
        ) : libView === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {devices.map(d => <DeviceCard key={d.id} device={d} variant="grid" onDragStart={() => setDragDevice(d.id)} onDragEnd={() => setDragDevice(null)} dragging={dragDevice === d.id}/>)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {devices.map(d => <DeviceCard key={d.id} device={d} variant="list" onDragStart={() => setDragDevice(d.id)} onDragEnd={() => setDragDevice(null)} dragging={dragDevice === d.id}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function DeviceCard({ device, variant = 'grid', onDragStart, onDragEnd, dragging }) {
  if (variant === 'list') {
    return (
      <div draggable
        onDragStart={(e) => { e.dataTransfer.setData('text/plain', device.id); onDragStart && onDragStart(); }}
        onDragEnd={onDragEnd}
        className="device-card lib-row"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 8px', borderRadius: 'var(--r-2)',
          background: 'var(--surface-2)', border: '1px solid var(--line)',
          cursor: 'grab', opacity: dragging ? 0.4 : 1,
          transition: 'background var(--d-fast), border-color var(--d-fast)',
        }}>
        <div style={{ width: 36, height: 18 }}>
          <DeviceFront device={device} width={36} style={{ borderRadius: 1 }}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--copy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{device.name}</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>{device.mfr} · {device.category}</div>
        </div>
        <span className="chip mono" style={{ height: 18, fontSize: 10 }}>{device.u}U</span>
      </div>
    );
  }
  return (
    <div draggable
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', device.id); onDragStart && onDragStart(); }}
      onDragEnd={onDragEnd}
      className="device-card"
      style={{
        padding: 8, borderRadius: 'var(--r-3)',
        background: 'var(--surface-2)', border: '1px solid var(--line)',
        cursor: 'grab', opacity: dragging ? 0.4 : 1,
        transition: 'background var(--d-fast), border-color var(--d-fast), transform var(--d-fast)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--line-strong)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)'; }}>
      <div style={{ width: '100%', aspectRatio: '4 / 1.2', overflow: 'hidden', borderRadius: 'var(--r-1)', marginBottom: 8, border: '1px solid var(--line)' }}>
        <DeviceFront device={device} width={120}/>
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--copy)', lineHeight: 1.2, marginBottom: 2 }}>{device.name}</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{device.mfr}</span>
        <span className="chip mono" style={{ height: 16, fontSize: 9, padding: '0 5px' }}>{device.u}U</span>
      </div>
    </div>
  );
}

window.TopBar = TopBar;
window.StatusBar = StatusBar;
window.LibraryPanel = LibraryPanel;
window.DeviceCard = DeviceCard;
window.Logo = Logo;
