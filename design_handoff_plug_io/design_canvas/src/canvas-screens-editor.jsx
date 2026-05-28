// Editor screen states — frozen mocks of the 23 editor states from §5.3
// Each function returns an EditorMock with appropriate config
// Exports: SCREEN_BASELINE, all Screen* artboards

const BASELINE_PLACEMENTS = [
  { id: 'p1', deviceId: 'pn-iface',  slot: 10 },
  { id: 'p3', deviceId: 'wt-x73a',   slot: 8 },
  { id: 'p4', deviceId: 'nv-comp2',  slot: 7 },
  { id: 'p5', deviceId: 'mt-eq3',    slot: 6 },
  { id: 'p2', deviceId: 'rt-cnv8',   slot: 9 },
  { id: 'p6', deviceId: 'pw-dist',   slot: 0 },
];
const BASELINE_CABLES = [
  { id: 'c1', srcPlacement: 'p3', srcPort: 'out',  dstPlacement: 'p4', dstPort: 'inL',  protocol: 'analog' },
  { id: 'c2', srcPlacement: 'p4', srcPort: 'outL', dstPlacement: 'p5', dstPort: 'inL',  protocol: 'analog' },
  { id: 'c3', srcPlacement: 'p4', srcPort: 'outR', dstPlacement: 'p5', dstPort: 'inR',  protocol: 'analog' },
  { id: 'c4', srcPlacement: 'p5', srcPort: 'outL', dstPlacement: 'p1', dstPort: 'xi0',  protocol: 'analog' },
  { id: 'c5', srcPlacement: 'p5', srcPort: 'outR', dstPlacement: 'p1', dstPort: 'xi1',  protocol: 'analog' },
];

// ─────────────────────────────────────────────────────────
// 1. Empty rack + onboarding
// ─────────────────────────────────────────────────────────
function ScreenEmptyEditor() {
  return (
    <EditorMock
      top={{ rackName: 'Untitled rack', undoCount: 0 }}
      library={{ libView: 'grid' }}
      canvas={{ units: 12, view: 'front', empty: true }}
      inspector={{ kind: 'none' }}
      status={{ left: <span>Empty rack · 0/12 U used · ready</span>, right: <><span>0 devices</span><span style={{ color: 'var(--line-strong)' }}>│</span><span>0 patches</span></> }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 2. Default front + device selected
// ─────────────────────────────────────────────────────────
function ScreenDeviceSelected() {
  const dev = DEVICES.find(d => d.id === 'wt-x73a');
  return (
    <EditorMock
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES, selectedDevice: 'p3' }}
      inspector={{ kind: 'device', device: dev }}
      status={{ left: <><span style={{ color: 'var(--accent)' }}>● DEVICE</span><span style={{ color: 'var(--copy-2)' }}>WaveTec X73-A</span><span style={{ color: 'var(--muted-2)' }}>·</span><span>WaveTec · 1U · Preamp</span></> }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 3. Rear view idle
// ─────────────────────────────────────────────────────────
function ScreenRearIdle() {
  return (
    <EditorMock
      top={{ view: 'rear' }}
      canvas={{ units: 12, view: 'rear', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
      status={{ left: <span>Rear view · Hover any port for details · {BASELINE_CABLES.length} cables routed</span> }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 4. Rear view + cable being drawn (pending)
// ─────────────────────────────────────────────────────────
function ScreenCableInProgress() {
  // src: nv-comp2.outL — placement p4 at slot 7
  // approximate position: slot 7 → y = 7*38 + 19 = 285; outL is 3rd of 6 ports → x = 12 + 2.5*(460-24)/6 ≈ 194
  const srcPos = { x: 194, y: 285 };
  const mouse = { x: 320, y: 200 };
  return (
    <EditorMock
      top={{ view: 'rear' }}
      canvas={{
        units: 12, view: 'rear',
        placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES,
        pendingCable: { srcPos, mouse, protocol: 'analog', srcPlacement: 'p4', srcPort: 'outL', srcDir: 'out' },
      }}
      inspector={{ kind: 'none', content: (
        <div style={{ padding: 12, borderRadius: 'var(--r-3)', background: 'var(--accent-soft)', border: '1px solid var(--accent-ring)' }}>
          <div className="label-eyebrow" style={{ color: 'var(--accent)', marginBottom: 6 }}>ROUTING</div>
          <div style={{ fontSize: 13, color: 'var(--copy)', marginBottom: 4 }}>Drawing a cable…</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.6 }}>
            <div>Source: <span style={{ color: 'var(--copy-2)' }}>Nova VCA-2 · OUT L</span></div>
            <div style={{ color: PROTOCOLS.analog.color }}>Protocol: Analog</div>
            <div>Click any compatible <span style={{ color: 'var(--accent)' }}>analog IN</span> port to complete.</div>
            <div style={{ marginTop: 6 }}><span className="kbd">Esc</span> to cancel</div>
          </div>
        </div>
      )}}
      status={{ left: <><span style={{ color: 'var(--accent)' }}>● ROUTING</span><span style={{ color: 'var(--muted-2)' }}>·</span><span>start: Nova VCA-2.outL</span><span style={{ color: 'var(--muted-2)' }}>·</span><span style={{ color: 'var(--copy-2)' }}>Click compatible port to complete · Esc to cancel</span></> }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 5. Rear view + cable selected
// ─────────────────────────────────────────────────────────
function ScreenCableSelected() {
  const cable = { ...BASELINE_CABLES[0], srcName: 'WaveTec X73-A', srcLabel: 'OUTPUT', srcKind: 'xlrM', dstName: 'Nova VCA-2', dstLabel: 'IN L', dstKind: 'xlrF' };
  return (
    <EditorMock
      top={{ view: 'rear' }}
      canvas={{ units: 12, view: 'rear', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES, selectedCable: 'c1' }}
      inspector={{ kind: 'cable', cable }}
      status={{ left: <><span style={{ color: PROTOCOLS.analog.color }}>━━ SELECTED CABLE</span><span style={{ color: 'var(--muted-2)' }}>·</span><span>Analog</span></> }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 6. Invalid patch attempt + toast
// ─────────────────────────────────────────────────────────
function ScreenInvalidPatch() {
  // src: pn-iface dnt1 (Dante in) — placement p1 slot 10, port 18 of 21 — far right area
  return (
    <EditorMock
      top={{ view: 'rear' }}
      canvas={{
        units: 12, view: 'rear',
        placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES,
        pendingCable: { srcPos: { x: 380, y: 400 }, mouse: { x: 250, y: 250 }, protocol: 'dante', srcPlacement: 'p1', srcPort: 'dnt1', srcDir: 'in', invalidPorts: ['p3.out','p4.outL','p4.outR','p5.outL','p5.outR'] },
      }}
      inspector={{ kind: 'none' }}
      status={{ left: <><span style={{ color: 'var(--danger)' }}>● PROTOCOL MISMATCH</span><span style={{ color: 'var(--muted-2)' }}>·</span><span>Dante IN cannot accept Analog OUT</span></> }}
      toast={{ kind: 'error', title: 'Несовместимое подключение', body: 'XLR analog out → Dante in: protocol mismatch' }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 7. Drag in progress (from library)
// ─────────────────────────────────────────────────────────
function ScreenDragInProgress() {
  const dev = DEVICES.find(d => d.id === 'ax-pre4');
  return (
    <EditorMock
      library={{ dragDeviceId: 'ax-pre4' }}
      canvas={{
        units: 12, view: 'front',
        placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES,
        dragDevice: 'ax-pre4', dragHoverSlot: 5,
      }}
      inspector={{ kind: 'none' }}
      status={{ left: <><span style={{ color: 'var(--accent)' }}>● DRAGGING</span><span style={{ color: 'var(--copy-2)' }}>Axiom Pre-4 Mk II</span><span style={{ color: 'var(--muted-2)' }}>·</span><span>1U · drop on slot 7 to place</span></> }}
      overlay={(
        <div style={{ position: 'absolute', left: 320, top: 280, width: 220, opacity: 0.92, zIndex: 70, pointerEvents: 'none', transform: 'rotate(-1.5deg)', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.8))' }}>
          <div style={{ borderRadius: 'var(--r-3)', overflow: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--accent)', boxShadow: '0 0 0 1px var(--accent), 0 0 30px -4px rgba(200,255,0,0.5)' }}>
            <div style={{ height: 38, overflow: 'hidden' }}>
              <DeviceFront device={dev} width={220}/>
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>+ {dev.name}</div>
        </div>
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 8. Drag in progress — reorder, swap warning
// ─────────────────────────────────────────────────────────
function ScreenDragReorder() {
  return (
    <EditorMock
      canvas={{
        units: 12, view: 'front',
        placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES,
        dragHoverSlot: 7, swapIndicator: true, ghostSlot: 8,
      }}
      inspector={{ kind: 'none' }}
      status={{ left: <><span style={{ color: 'var(--warning)' }}>● SWAP</span><span>WaveTec X73-A → slot 5 will swap with Nova VCA-2</span></> }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 9. Library — empty search
// ─────────────────────────────────────────────────────────
function ScreenLibraryEmptySearch() {
  return (
    <EditorMock
      library={{ devices: [], searchQ: 'avb-bridge', emptySearch: true }}
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 10. Library filters active
// ─────────────────────────────────────────────────────────
function ScreenLibraryFiltersActive() {
  return (
    <EditorMock
      library={{
        devices: DEVICES.filter(d => d.category === 'Preamp'),
        filterChips: ['Preamp', 'Analog'],
        filtersOpen: true,
      }}
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 11. Library — list view
// ─────────────────────────────────────────────────────────
function ScreenLibraryList() {
  return (
    <EditorMock
      library={{ libView: 'list' }}
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 12. Inspector — no selection
// ─────────────────────────────────────────────────────────
function ScreenInspectorEmpty() {
  return (
    <EditorMock
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 13. Confirm delete device (with cables)
// ─────────────────────────────────────────────────────────
function ScreenConfirmDelete() {
  return (
    <EditorMock
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES, selectedDevice: 'p3' }}
      inspector={{ kind: 'device', device: DEVICES.find(d=>d.id==='wt-x73a') }}
      modal={(
        <div style={{ width: 420, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', boxShadow: 'var(--elev-3)', overflow: 'hidden' }}>
          <div style={{ padding: 18 }}>
            <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="alert" size={16} color="var(--danger)"/>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Удалить WaveTec X73-A?</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>Removing this device will disconnect 3 cables. This action can be undone.</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <span className="btn">Cancel</span>
              <span className="btn btn-danger">Удалить устройство</span>
            </div>
          </div>
        </div>
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 14. Clear rack confirmation
// ─────────────────────────────────────────────────────────
function ScreenClearRack() {
  return (
    <EditorMock
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
      modal={(
        <div style={{ width: 480, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', boxShadow: 'var(--elev-3)', overflow: 'hidden' }}>
          <div style={{ padding: 18 }}>
            <div className="label-eyebrow" style={{ marginBottom: 4, color: 'var(--danger)' }}>DESTRUCTIVE</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Очистить рамку?</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 14 }}>This will remove all 6 devices and 5 cables. You can restore via Undo (⌘Z).</div>
            <div style={{ background: 'var(--bg-2)', borderRadius: 'var(--r-3)', padding: 10, border: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11 }} className="mono">
              {BASELINE_PLACEMENTS.map(p => {
                const d = DEVICES.find(dd => dd.id === p.deviceId);
                return <div key={p.id} style={{ color: 'var(--muted)' }}>· {d?.name}</div>;
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <span className="btn">Cancel</span>
              <span className="btn btn-danger">Очистить</span>
            </div>
          </div>
        </div>
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 15. Save toast
// ─────────────────────────────────────────────────────────
function ScreenSaveToast() {
  return (
    <EditorMock
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
      toast={{ kind: 'success', title: 'Session saved', body: '14:02 · autosaved · ⌘Z to undo' }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 16. Export menu
// ─────────────────────────────────────────────────────────
function ScreenExportMenu() {
  return (
    <EditorMock
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
      modal={(
        <div style={{ width: 460, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', boxShadow: 'var(--elev-3)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <div className="label-eyebrow">EXPORT</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Save the rack as…</div>
          </div>
          <div style={{ padding: 8 }}>
            {[
              { fmt: 'json', name: 'JSON', desc: 'Machine-readable session for backup / sharing', icon: 'cpu' },
              { fmt: 'png',  name: 'PNG · 2×', desc: 'Flat image of front & rear', icon: 'eye' },
              { fmt: 'pdf',  name: 'PDF spec sheet', desc: 'A4 with patch list, port table, BOM', icon: 'printer' },
              { fmt: 'svg',  name: 'SVG', desc: 'Vector for Figma / Illustrator', icon: 'edit' },
            ].map((o, i) => (
              <div key={o.fmt} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: 12, borderRadius: 'var(--r-3)',
                background: i === 2 ? 'var(--surface-2)' : 'transparent',
                border: '1px solid ' + (i === 2 ? 'var(--line)' : 'transparent'),
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--r-2)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                  <Icon name={o.icon} size={16} color="var(--accent)"/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{o.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{o.desc}</div>
                </div>
                <Icon name="arrowRight" size={14} color="var(--muted-2)"/>
              </div>
            ))}
          </div>
        </div>
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 17. Onboarding tour (spotlight + callout)
// ─────────────────────────────────────────────────────────
function ScreenOnboardingTour() {
  return (
    <EditorMock
      canvas={{ units: 12, view: 'front', empty: true }}
      inspector={{ kind: 'none' }}
      overlay={(<>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,9,11,0.55)', zIndex: 50 }}/>
        {/* spotlight cutout (over library) */}
        <div style={{
          position: 'absolute', top: 56, left: 8, width: 280, height: 360,
          borderRadius: 'var(--r-3)',
          boxShadow: '0 0 0 4000px rgba(8,9,11,0.55), 0 0 0 2px var(--accent)',
          zIndex: 60, pointerEvents: 'none',
        }}/>
        {/* callout */}
        <div style={{
          position: 'absolute', top: 100, left: 320, width: 280,
          background: 'var(--surface)', border: '1px solid var(--accent-ring)',
          borderRadius: 'var(--r-3)', padding: 14, zIndex: 70,
          boxShadow: 'var(--elev-3)',
        }}>
          <div className="label-eyebrow" style={{ color: 'var(--accent)' }}>STEP 1 / 3</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Найдите устройство</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
            Воспользуйтесь поиском или фильтрами слева. Поддерживаются категория, протокол и размер в U.
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span className="btn btn-ghost btn-sm">Skip tour</span>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--line-strong)' }}/>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--line-strong)' }}/>
              <span className="btn btn-primary btn-sm" style={{ marginLeft: 8 }}>Next<Icon name="arrowRight" size={11}/></span>
            </div>
          </div>
        </div>
      </>)}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 18. Loading session (skeleton)
// ─────────────────────────────────────────────────────────
function ScreenLoadingSkeleton() {
  return (
    <EditorMock
      library={{ devices: [] }}
      canvas={{ units: 12, view: 'front' }}
      inspector={{ kind: 'none' }}
      overlay={(
        <div style={{ position: 'absolute', inset: 0, zIndex: 50 }}>
          {/* library skeleton */}
          <div style={{ position: 'absolute', top: 48, left: 0, width: 296, height: 'calc(100% - 80px)', background: 'var(--surface)', padding: 14 }}>
            {[...Array(6)].map((_,i) => <div key={i} style={{ height: 64, marginBottom: 6, borderRadius: 'var(--r-2)', background: 'var(--surface-2)', border: '1px solid var(--line)', animation: 'skel 1.4s infinite' }}/>)}
          </div>
          {/* canvas skeleton */}
          <div style={{ position: 'absolute', top: 48 + 56, left: 296 + 80, width: 460, height: 'calc(100% - 200px)', borderRadius: 'var(--r-3)', overflow: 'hidden' }}>
            {[...Array(8)].map((_,i) => <div key={i} style={{ height: 36, marginBottom: 2, background: i % 2 ? 'var(--surface)' : 'var(--surface-2)', animation: 'skel 1.4s infinite', animationDelay: `${i*60}ms` }}/>)}
          </div>
          <div style={{ position: 'absolute', top: 48, right: 0, width: 340, height: 'calc(100% - 80px)', background: 'var(--surface)', padding: 14 }}>
            {[...Array(5)].map((_,i) => <div key={i} style={{ height: 40, marginBottom: 8, borderRadius: 'var(--r-2)', background: 'var(--surface-2)', animation: 'skel 1.4s infinite', animationDelay: `${i*120}ms` }}/>)}
          </div>
          {/* loader bar */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, margin: '0 auto 12px', borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}/>
            <div className="label-eyebrow">LOADING SESSION</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Restoring 6 devices · 5 patches…</div>
          </div>
        </div>
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 19. Malformed session recovery banner
// ─────────────────────────────────────────────────────────
function ScreenMalformedSession() {
  return (
    <EditorMock
      canvas={{
        units: 12, view: 'front',
        placements: BASELINE_PLACEMENTS.slice(0, 4),
        cables: BASELINE_CABLES.slice(0, 2),
        bannerTop: (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px',
            background: 'var(--warning-soft)',
            border: '1px solid rgba(242,169,59,0.3)',
            borderLeft: '3px solid var(--warning)',
            borderRadius: 'var(--r-2)',
            boxShadow: 'var(--elev-2)',
          }}>
            <Icon name="alert" size={16} color="var(--warning)"/>
            <div style={{ flex: 1, fontSize: 12 }}>
              <span style={{ color: 'var(--copy)', fontWeight: 500 }}>Last session was partially restored.</span>
              <span style={{ color: 'var(--muted)', marginLeft: 8 }}>2 cables referenced devices that no longer exist. They were dropped.</span>
            </div>
            <span className="btn btn-sm btn-ghost">View details<Icon name="chevDown" size={11}/></span>
            <span className="btn btn-sm btn-ghost btn-icon"><Icon name="x" size={12}/></span>
          </div>
        )
      }}
      inspector={{ kind: 'none' }}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 20. Front↔Rear flip (mid-state)
// ─────────────────────────────────────────────────────────
function ScreenFlipMid() {
  return (
    <EditorMock
      canvas={{
        units: 12, view: 'front',
        placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES,
      }}
      inspector={{ kind: 'none' }}
      overlay={(<>
        <div style={{
          position: 'absolute', top: 48, left: 296, right: 340, bottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg)', zIndex: 9,
          backgroundImage: 'radial-gradient(circle, #1A1B1D 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}>
          <div style={{ transform: 'perspective(1200px) rotateY(60deg)', transformStyle: 'preserve-3d', filter: 'brightness(0.6)' }}>
            <RackChassis units={12} width={460}>
              <div style={{ position: 'relative', width: 460, height: 12 * U_HEIGHT }}>
                {BASELINE_PLACEMENTS.map(p => {
                  const dev = DEVICES.find(d => d.id === p.deviceId);
                  return <div key={p.id} style={{ position: 'absolute', left: 0, top: p.slot * U_HEIGHT }}><DeviceFront device={dev} width={460}/></div>;
                })}
              </div>
            </RackChassis>
          </div>
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="chip mono" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-ring)' }}>
              <Icon name="flip" size={11}/> FLIPPING · 60° / 180°
            </span>
          </div>
        </div>
      </>)}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 21. Undo with history hover
// ─────────────────────────────────────────────────────────
function ScreenUndoHistory() {
  return (
    <EditorMock
      top={{ undoCount: 12 }}
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
      overlay={(
        <div style={{
          position: 'absolute', top: 56, right: 240, width: 280,
          background: 'var(--surface)', border: '1px solid var(--line-2)',
          borderRadius: 'var(--r-3)', padding: 6,
          boxShadow: 'var(--elev-3)', zIndex: 60,
        }}>
          <div className="label-eyebrow" style={{ padding: '6px 10px' }}>UNDO STACK · 12</div>
          {[
            'Patch cable (Analog)',
            'Place Meridian EQ-3 in slot 7',
            'Remove Axiom Pre-4',
            'Patch cable (Dante)',
            'Place Nova VCA-2 in slot 8',
          ].map((act, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', borderRadius: 'var(--r-1)',
              fontSize: 12, color: i === 0 ? 'var(--accent)' : 'var(--copy-2)',
              background: i === 0 ? 'var(--accent-soft)' : 'transparent',
            }}>
              <span className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', width: 24 }}>{i === 0 ? '→' : `-${i+1}`}</span>
              <span style={{ flex: 1 }}>{act}</span>
              <span className="mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>{(i+1)*4}s</span>
            </div>
          ))}
        </div>
      )}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 22. Signal-flow overlay
// ─────────────────────────────────────────────────────────
function ScreenSignalFlow() {
  // Mark some cables with a flow class
  const cables = BASELINE_CABLES.map((c, i) => ({ ...c, dim: false, srcChain: i <= 3 ? 1 : 2 }));
  return (
    <EditorMock
      top={{ view: 'rear' }}
      canvas={{
        units: 12, view: 'rear',
        placements: BASELINE_PLACEMENTS,
        cables,
        signalFlow: 'BY SOURCE',
      }}
      inspector={{ kind: 'none', content: (
        <div>
          <div className="label-eyebrow" style={{ marginBottom: 8 }}>FLOWS DETECTED</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { c: '#C8FF00', name: 'Mic → Preamp → Comp → EQ → Interface', n: 5 },
              { c: '#6EE7FF', name: 'Converter Dante → Interface', n: 1 },
            ].map((f, i) => (
              <div key={i} style={{ padding: 10, borderRadius: 'var(--r-2)', background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 4, height: 28, background: f.c, borderRadius: 1 }}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{f.name}</div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>{f.n} cable{f.n>1?'s':''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}}
    />
  );
}

// ─────────────────────────────────────────────────────────
// 23. Shortcuts modal
// ─────────────────────────────────────────────────────────
function ScreenShortcuts() {
  const groups = [
    { title: 'View', items: [['V', 'Front view'], ['R', 'Rear view'], ['Z', 'Zoom controls'], ['Space', 'Pan canvas']] },
    { title: 'Library', items: [['⌘K', 'Quick search'], ['G', 'Toggle grid/list'], ['F', 'Open filters']] },
    { title: 'Editing', items: [['⌘Z', 'Undo'], ['⌘⇧Z', 'Redo'], ['Del', 'Remove selection'], ['Esc', 'Cancel cable']] },
    { title: 'File', items: [['⌘S', 'Save session'], ['⌘E', 'Export'], ['?', 'This help']] },
  ];
  return (
    <EditorMock
      canvas={{ units: 12, view: 'front', placements: BASELINE_PLACEMENTS, cables: BASELINE_CABLES }}
      inspector={{ kind: 'none' }}
      modal={(
        <div style={{ width: 540, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', boxShadow: 'var(--elev-3)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
            <div className="label-eyebrow">KEYBOARD</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2 }}>Shortcuts</div>
          </div>
          <div style={{ padding: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 28px' }}>
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
        </div>
      )}
    />
  );
}

Object.assign(window, {
  BASELINE_PLACEMENTS, BASELINE_CABLES,
  ScreenEmptyEditor, ScreenDeviceSelected, ScreenRearIdle, ScreenCableInProgress, ScreenCableSelected,
  ScreenInvalidPatch, ScreenDragInProgress, ScreenDragReorder, ScreenLibraryEmptySearch,
  ScreenLibraryFiltersActive, ScreenLibraryList, ScreenInspectorEmpty, ScreenConfirmDelete,
  ScreenClearRack, ScreenSaveToast, ScreenExportMenu, ScreenOnboardingTour, ScreenLoadingSkeleton,
  ScreenMalformedSession, ScreenFlipMid, ScreenUndoHistory, ScreenSignalFlow, ScreenShortcuts,
});
