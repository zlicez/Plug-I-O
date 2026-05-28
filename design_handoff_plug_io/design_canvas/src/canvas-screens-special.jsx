// Special screens — landing, configurator, mobile, tablet, compare, share viewer, spec-sheet
// Exports: ScreenLanding, ScreenConfigurator, ScreenMobile, ScreenTablet, ScreenCompare, ScreenShareViewer, ScreenSpecSheet

// ─────────────────────────────────────────────────────────
// Landing — hero + 3-step + use cases + footer
// ─────────────────────────────────────────────────────────
function ScreenLanding() {
  return (
    <div style={{
      width: 1280, height: 760, background: 'var(--bg)', color: 'var(--copy)',
      borderRadius: 'var(--r-3)', border: '1px solid var(--line-2)', overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Top nav */}
      <div style={{
        height: 60, display: 'flex', alignItems: 'center', padding: '0 40px',
        borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo size={26}/>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Plug-I/O</span>
          <span className="chip mono" style={{ marginLeft: 6 }}>beta</span>
        </div>
        <div style={{ flex: 1 }}/>
        <nav style={{ display: 'flex', gap: 26, alignItems: 'center', fontSize: 13, color: 'var(--copy-2)' }}>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>Devices</a>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>Templates</a>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>Changelog</a>
          <a style={{ color: 'inherit', textDecoration: 'none' }}>Docs</a>
          <span className="btn btn-sm btn-ghost">Open last session</span>
          <span className="btn btn-sm btn-primary">Start building<Icon name="arrowRight" size={12}/></span>
        </nav>
      </div>

      {/* Hero */}
      <div style={{ display: 'flex', padding: '54px 40px 0', gap: 40, position: 'relative' }}>
        <div style={{ width: 520, flexShrink: 0 }}>
          <div className="label-eyebrow" style={{ color: 'var(--accent)', marginBottom: 14 }}>PRO AUDIO RACK BUILDER</div>
          <h1 style={{ fontSize: 56, fontWeight: 600, lineHeight: 1.04, letterSpacing: '-0.025em', margin: 0 }}>
            Design audio racks<br/>
            <span style={{ color: 'var(--accent)' }}>that actually work.</span>
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--muted)', marginTop: 18, marginBottom: 28, maxWidth: 460 }}>
            Patch real preamps, converters and interfaces in a 19-inch rack. We validate the signal chain — XLR, Dante, MADI, ADAT — in real time.
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="btn btn-primary btn-lg">Start building<Icon name="arrowRight" size={14}/></span>
            <span className="btn btn-lg">Open last session<span className="mono" style={{ marginLeft: 8, fontSize: 11, color: 'var(--muted-2)' }}>3 hrs ago</span></span>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 38, color: 'var(--muted-2)', fontSize: 11 }} className="mono">
            <span><Icon name="check" size={11} style={{ marginRight: 6, color: 'var(--accent)' }}/>NO INSTALL · WORKS IN BROWSER</span>
            <span><Icon name="check" size={11} style={{ marginRight: 6, color: 'var(--accent)' }}/>EXPORT TO JSON · PDF · PNG</span>
          </div>
        </div>

        {/* Hero illustration — isometric rack with cables */}
        <div style={{ flex: 1, height: 460, position: 'relative' }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 600, height: 460,
            background: 'radial-gradient(circle at 30% 30%, rgba(200,255,0,0.08), transparent 60%)',
          }}/>
          <div style={{ position: 'absolute', top: 20, right: 40, transform: 'perspective(1400px) rotateY(-18deg) rotateX(6deg)', filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.5))' }}>
            <RackChassis units={8} width={440}>
              <div style={{ position: 'relative', width: 440, height: 8 * U_HEIGHT }}>
                {[
                  { id:'l1', deviceId:'pn-iface', slot:6 },
                  { id:'l2', deviceId:'rt-cnv8',  slot:5 },
                  { id:'l3', deviceId:'wt-x73a',  slot:4 },
                  { id:'l4', deviceId:'nv-comp2', slot:3 },
                  { id:'l5', deviceId:'mt-eq3',   slot:2 },
                  { id:'l6', deviceId:'pw-dist',  slot:0 },
                ].map(p => {
                  const d = DEVICES.find(dd => dd.id === p.deviceId);
                  return <div key={p.id} style={{ position: 'absolute', left: 0, top: p.slot * U_HEIGHT }}>
                    <DeviceFront device={d} width={440}/>
                  </div>;
                })}
              </div>
            </RackChassis>
          </div>
          {/* dangling cable as decoration */}
          <svg width="200" height="280" viewBox="0 0 200 280" style={{ position: 'absolute', bottom: 0, left: 30, opacity: 0.7 }}>
            <path d="M 20 0 C 20 80 180 100 60 260" stroke="#C8FF00" strokeWidth="2" fill="none" strokeLinecap="round"/>
            <circle cx="60" cy="260" r="4" fill="#C8FF00"/>
            <path d="M 80 0 C 80 100 200 130 120 270" stroke="#6EE7FF" strokeWidth="2" fill="none" strokeDasharray="6 4" strokeLinecap="round"/>
            <circle cx="120" cy="270" r="4" fill="#6EE7FF"/>
          </svg>
        </div>
      </div>

      {/* 3-step explainer */}
      <div style={{ padding: '50px 40px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {[
          { n: '01', t: 'Choose rack size', d: '4U to 24U. Real 19-inch proportions, real U pitch.', icon: 'rack' },
          { n: '02', t: 'Drag devices', d: 'Real preamps, comps, interfaces. Filter by category or protocol.', icon: 'grid' },
          { n: '03', t: 'Patch connections', d: 'Click ports to draw cables. We validate every protocol in real time.', icon: 'cable' },
        ].map(s => (
          <div key={s.n} style={{ padding: 22, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div className="mono" style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>{s.n}</div>
              <Icon name={s.icon} size={16} color="var(--muted)"/>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{s.t}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Rack-size configurator — modal AND inline option side-by-side
// ─────────────────────────────────────────────────────────
function ScreenConfigurator() {
  const sizes = [
    { u: 4, name: 'Compact', desc: 'Tabletop' },
    { u: 6, name: 'Mid',     desc: 'Portable' },
    { u: 8, name: 'Studio',  desc: 'Side-car' },
    { u: 12, name: 'Standard', desc: 'Full rack' },
    { u: 16, name: 'Large',    desc: 'Live FOH' },
    { u: 24, name: 'XL',       desc: 'Touring road case' },
  ];
  return (
    <div style={{
      width: 1280, height: 760, background: 'var(--bg)',
      borderRadius: 'var(--r-3)', border: '1px solid var(--line-2)', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundImage: 'radial-gradient(circle, #1A1B1D 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>
      <div style={{ width: 880, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', boxShadow: 'var(--elev-3)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="label-eyebrow">NEW RACK</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>Выберите размер рамы</div>
          </div>
          <span className="btn btn-ghost btn-icon btn-sm"><Icon name="x" size={14}/></span>
        </div>
        <div style={{ display: 'flex' }}>
          {/* Options */}
          <div style={{ flex: 1, padding: 22, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {sizes.map(s => (
              <div key={s.u} style={{
                padding: 16, borderRadius: 'var(--r-3)',
                background: s.u === 12 ? 'var(--accent-soft)' : 'var(--bg-2)',
                border: s.u === 12 ? '1px solid var(--accent)' : '1px solid var(--line)',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: s.u === 12 ? '0 0 0 1px var(--accent), 0 0 30px -4px rgba(200,255,0,0.3)' : 'none',
              }}>
                {s.u === 12 && <div style={{ position: 'absolute', top: 8, right: 8 }}><Icon name="check" size={14} color="var(--accent)"/></div>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div className="mono" style={{ fontSize: 28, fontWeight: 600, color: s.u === 12 ? 'var(--accent)' : 'var(--copy)' }}>{s.u}</div>
                  <div className="mono" style={{ fontSize: 13, color: 'var(--muted)' }}>U</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginTop: 4 }}>{s.name}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', marginTop: 2 }}>{s.desc} · {s.u*44.45/10|0} cm</div>
                {/* mini silhouette */}
                <div style={{ marginTop: 12, height: 8 * 4 - 2, width: '100%', maxHeight: 48, background: '#0a0b0c', borderRadius: 2, border: '1px solid var(--line)', position: 'relative', overflow: 'hidden' }}>
                  {Array.from({ length: s.u }).map((_, i) => (
                    <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: i * (44 / s.u), height: 44 / s.u, borderBottom: '1px solid #1a1b1d' }}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Preview */}
          <div style={{
            width: 280, padding: 22, background: 'var(--bg)',
            borderLeft: '1px solid var(--line)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <div className="label-eyebrow">PREVIEW</div>
            <div style={{ transform: 'scale(0.45)', transformOrigin: 'top center', marginTop: -20 }}>
              <RackChassis units={12} width={460}>
                <div style={{ width: 460, height: 12 * U_HEIGHT }}/>
              </RackChassis>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: -120 }}>
              482 × 533 mm · 12U<br/>
              19-inch standard
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>You can change this anytime from the top bar.</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="btn">Cancel</span>
            <span className="btn btn-primary">Create 12U rack<Icon name="arrowRight" size={12}/></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Mobile editor (390 × 800)
// ─────────────────────────────────────────────────────────
function ScreenMobile() {
  return (
    <div style={{
      width: 390, height: 780, background: 'var(--bg)',
      borderRadius: 32, border: '1px solid var(--line-2)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      {/* status bar */}
      <div style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', fontSize: 13, color: 'var(--copy)' }} className="mono">
        <span>9:41</span>
        <span style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span>● ● ●</span>
          <Icon name="signalFlow" size={12}/>
          <span>87%</span>
        </span>
      </div>
      {/* app header */}
      <div style={{ padding: '10px 14px 12px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo size={20}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Studio A · Tracking</div>
          <div className="mono" style={{ fontSize: 10, color: 'var(--muted-2)' }}>12U · 5 patches · autosaved</div>
        </div>
        <span className="btn btn-ghost btn-icon btn-sm"><Icon name="settings" size={14}/></span>
      </div>
      {/* segmented control */}
      <div style={{ display: 'flex', gap: 4, padding: 10, background: 'var(--bg-2)' }}>
        <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--surface)', borderRadius: 'var(--r-2)', border: '1px solid var(--line)', flex: 1 }}>
          {[{l:'FRONT',a:true},{l:'REAR',a:false}].map(t => (
            <div key={t.l} className="mono" style={{ flex: 1, padding: '6px 0', textAlign: 'center', borderRadius: 'var(--r-1)', background: t.a ? 'var(--accent)' : 'transparent', color: t.a ? 'var(--accent-text)' : 'var(--muted)', fontSize: 11, fontWeight: 600 }}>{t.l}</div>
          ))}
        </div>
        <span className="btn btn-sm btn-icon"><Icon name="layers" size={14}/></span>
      </div>
      {/* canvas */}
      <div style={{ flex: 1, padding: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)',
        backgroundImage: 'radial-gradient(circle, #1A1B1D 1px, transparent 1px)',
        backgroundSize: '18px 18px',
      }}>
        <div style={{ transform: 'scale(0.6)', transformOrigin: 'top center' }}>
          <RackChassis units={12} width={460}>
            <div style={{ position: 'relative', width: 460, height: 12 * U_HEIGHT }}>
              {BASELINE_PLACEMENTS.map(p => {
                const d = DEVICES.find(dd => dd.id === p.deviceId);
                return <div key={p.id} style={{ position: 'absolute', left: 0, top: p.slot * U_HEIGHT }}>
                  <DeviceFront device={d} width={460}/>
                </div>;
              })}
            </div>
          </RackChassis>
        </div>
      </div>
      {/* bottom sheet handle */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--line)', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: 8 }}>
        <div style={{ width: 36, height: 4, background: 'var(--line-strong)', borderRadius: 2, margin: '0 auto 12px' }}/>
        <div style={{ display: 'flex', padding: '0 14px 10px', gap: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Icon name="search" size={13} color="var(--muted-2)" style={{ position: 'absolute', left: 10, top: 9 }}/>
            <input className="input mono" style={{ paddingLeft: 30, fontSize: 12 }} placeholder="Find a device…"/>
          </div>
          <span className="btn btn-icon btn-sm" style={{ width: 32, height: 32 }}><Icon name="filter" size={14}/></span>
        </div>
        <div style={{ padding: '0 14px 14px', display: 'flex', gap: 6, overflow: 'hidden' }}>
          {DEVICES.slice(0, 3).map(d => (
            <div key={d.id} style={{ width: 132, padding: 6, background: 'var(--surface-2)', borderRadius: 'var(--r-3)', border: '1px solid var(--line)', flexShrink: 0 }}>
              <div style={{ height: 26, overflow: 'hidden', borderRadius: 1 }}><DeviceFront device={d} width={120}/></div>
              <div style={{ fontSize: 11, fontWeight: 500, marginTop: 6 }}>{d.name}</div>
              <div className="mono" style={{ fontSize: 9, color: 'var(--muted-2)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{d.mfr}</span><span>{d.u}U</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* bottom tab bar */}
      <div style={{ height: 56, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: 'var(--surface)' }}>
        {[{i:'rack',l:'Rack',a:true},{i:'grid',l:'Library'},{i:'signalFlow',l:'Flow'},{i:'eye',l:'Preview'},{i:'menu',l:'More'}].map(t => (
          <div key={t.l} style={{ textAlign: 'center', color: t.a ? 'var(--accent)' : 'var(--muted)' }}>
            <Icon name={t.i} size={18}/>
            <div className="mono" style={{ fontSize: 9, marginTop: 2, letterSpacing: '0.06em' }}>{t.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Tablet editor (834 × 1100)
// ─────────────────────────────────────────────────────────
function ScreenTablet() {
  return (
    <div style={{
      width: 1024, height: 720, background: 'var(--bg)',
      borderRadius: 'var(--r-3)', border: '1px solid var(--line-2)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <MockTopBar/>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* Library — collapsed icon rail */}
        <div style={{ width: 56, borderRight: '1px solid var(--line)', background: 'var(--surface)', padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          {[
            { i: 'search', a: false }, { i: 'grid', a: true }, { i: 'cpu', a: false }, { i: 'waves', a: false },
            { i: 'cable', a: false }, { i: 'zap', a: false }, { i: 'shield', a: false }, { i: 'bookOpen', a: false },
          ].map((t, i) => (
            <div key={i} style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-2)', background: t.a ? 'var(--accent-soft)' : 'transparent', border: t.a ? '1px solid var(--accent-ring)' : '1px solid transparent', color: t.a ? 'var(--accent)' : 'var(--muted)' }}>
              <Icon name={t.i} size={18}/>
            </div>
          ))}
        </div>
        <MockCanvas units={12} view="front" placements={BASELINE_PLACEMENTS} cables={BASELINE_CABLES} selectedDevice="p3"/>
        {/* Inspector — slide-over overlay */}
        <div style={{
          position: 'absolute', top: 48, right: 0, bottom: 32, width: 320,
          background: 'var(--surface)', borderLeft: '1px solid var(--line-2)',
          boxShadow: 'var(--elev-3)', display: 'flex', flexDirection: 'column',
        }}>
          <MockInspector kind="device" device={DEVICES.find(d=>d.id==='wt-x73a')} narrow/>
        </div>
      </div>
      <MockStatusBar/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Compare view — 2 sessions side-by-side
// ─────────────────────────────────────────────────────────
function ScreenCompare() {
  const altPlacements = [
    { id: 'p1', deviceId: 'pn-iface',  slot: 10 },
    { id: 'p3', deviceId: 'ax-pre4',   slot: 7 },
    { id: 'p2', deviceId: 'dn-bridge', slot: 9 },
    { id: 'p5', deviceId: 'mt-eq3',    slot: 6 },
    { id: 'p6', deviceId: 'pw-dist',   slot: 0 },
  ];
  const altCables = [
    { id: 'c1', srcPlacement: 'p3', srcPort: 'out0', dstPlacement: 'p5', dstPort: 'inL', protocol: 'analog' },
    { id: 'c2', srcPlacement: 'p3', srcPort: 'out1', dstPlacement: 'p5', dstPort: 'inR', protocol: 'analog' },
  ];
  return (
    <div style={{
      width: 1280, height: 760, background: 'var(--bg)',
      borderRadius: 'var(--r-3)', border: '1px solid var(--line-2)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: 48, display: 'flex', alignItems: 'center', padding: '0 16px',
        borderBottom: '1px solid var(--line)', background: 'var(--surface)', gap: 12,
      }}>
        <span className="btn btn-ghost btn-sm"><Icon name="chevLeft" size={12}/>Back</span>
        <span style={{ color: 'var(--line-strong)' }}>│</span>
        <div className="label-eyebrow">COMPARE</div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>Studio A · Tracking <span style={{ color: 'var(--muted-2)' }}>vs</span> Studio A · v2 (Dante)</div>
        <div style={{ flex: 1 }}/>
        <span className="btn btn-sm"><Icon name="layers" size={13}/>Diff overlay</span>
        <span className="btn btn-sm btn-primary"><Icon name="check" size={13}/>Pick A</span>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
        {/* Left rack */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)' }}>
            <div className="label-eyebrow" style={{ color: 'var(--accent)' }}>A · CURRENT</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Studio A · Tracking</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>6 devices · 5 patches · 1 → 1 channels</div>
            </div>
          </div>
          <MockCanvas units={12} view="front" placements={BASELINE_PLACEMENTS} cables={BASELINE_CABLES} scale={0.85} showZoom={false}/>
        </div>
        <div style={{ background: 'var(--line-strong)' }}/>
        {/* Right rack */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)' }}>
            <div className="label-eyebrow" style={{ color: 'var(--info)' }}>B · ALTERNATIVE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>Studio A · v2 (Dante)</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>5 devices · 2 patches · 4 → 4 channels</div>
            </div>
          </div>
          <MockCanvas units={12} view="front" placements={altPlacements} cables={altCables} scale={0.85} showZoom={false}/>
        </div>
      </div>
      <div style={{ height: 60, borderTop: '1px solid var(--line)', background: 'var(--surface)', display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', padding: '0 24px', fontSize: 12, color: 'var(--muted)' }}>
        <div className="mono">
          <span style={{ color: 'var(--copy)' }}>−1 device</span> · <span style={{ color: 'var(--copy)' }}>−3 patches</span> · <span style={{ color: 'var(--copy)' }}>+1 Dante bridge</span> · <span style={{ color: 'var(--positive)' }}>+ network channel count</span>
        </div>
        <div className="mono" style={{ textAlign: 'right' }}>
          BOM cost diff: <span style={{ color: 'var(--copy)' }}>+$340</span> · power: <span style={{ color: 'var(--copy)' }}>−14 W</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Share / read-only viewer
// ─────────────────────────────────────────────────────────
function ScreenShareViewer() {
  return (
    <div style={{
      width: 1280, height: 760, background: 'var(--bg)',
      borderRadius: 'var(--r-3)', border: '1px solid var(--line-2)', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        height: 56, display: 'flex', alignItems: 'center', padding: '0 22px',
        borderBottom: '1px solid var(--line)', gap: 12,
      }}>
        <Logo size={22}/>
        <span style={{ fontWeight: 600, fontSize: 14 }}>Plug-I/O</span>
        <span className="chip mono"><Icon name="eye" size={11}/>READ-ONLY</span>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 12, color: 'var(--muted)' }} className="mono">plug-i.io/r/sx72-tracking-studio-a</div>
        <span className="btn btn-sm"><Icon name="copy" size={13}/>Copy link</span>
        <span className="btn btn-sm btn-primary"><Icon name="edit" size={13}/>Open in editor</span>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: 'var(--bg)',
          backgroundImage: 'radial-gradient(circle, #1A1B1D 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* view toggle floating */}
          <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'var(--surface-2)', borderRadius: 'var(--r-2)', border: '1px solid var(--line-2)' }}>
              {['FRONT', 'REAR'].map((v, i) => (
                <div key={v} className="mono" style={{ height: 24, padding: '0 12px', borderRadius: 'var(--r-1)', background: i === 0 ? 'var(--accent)' : 'transparent', color: i === 0 ? 'var(--accent-text)' : 'var(--muted)', fontWeight: i === 0 ? 600 : 500, fontSize: 11, letterSpacing: '0.08em', display: 'flex', alignItems: 'center' }}>{v}</div>
              ))}
            </div>
            <span className="chip mono">12U</span>
          </div>
          <RackChassis units={12} width={460}>
            <div style={{ position: 'relative', width: 460, height: 12 * U_HEIGHT }}>
              {BASELINE_PLACEMENTS.map(p => {
                const d = DEVICES.find(dd => dd.id === p.deviceId);
                return <div key={p.id} style={{ position: 'absolute', left: 0, top: p.slot * U_HEIGHT }}>
                  <DeviceFront device={d} width={460}/>
                </div>;
              })}
            </div>
          </RackChassis>
        </div>
        <div style={{ background: 'var(--surface)', borderLeft: '1px solid var(--line)', padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <div className="label-eyebrow">SHARED BY</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #C8FF00, #6EE7FF)' }}/>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>Aleksei Volkov</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>FOH · Studio A</div>
              </div>
            </div>
          </div>
          <div>
            <div className="label-eyebrow">RACK</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>Studio A · Tracking</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>12U · 6 devices · 5 patches</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Last updated · 2 hrs ago</div>
          </div>
          <div>
            <div className="label-eyebrow" style={{ marginBottom: 6 }}>BILL OF MATERIALS</div>
            {BASELINE_PLACEMENTS.slice(0, 5).map(p => {
              const d = DEVICES.find(dd => dd.id === p.deviceId);
              return (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--muted-2)', width: 22 }}>{p.slot+1}U</span>
                  <span style={{ fontSize: 12, flex: 1 }}>{d?.name}</span>
                  <span className="chip mono" style={{ height: 16, fontSize: 9 }}>{d?.u}U</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 'auto' }}>
            <span className="btn" style={{ width: '100%', justifyContent: 'center' }}><Icon name="download" size={13}/>Export PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Print / spec-sheet (A4-feel)
// ─────────────────────────────────────────────────────────
function ScreenSpecSheet() {
  return (
    <div style={{
      width: 880, height: 1180, background: '#FAFAF7', color: '#1A1A1A',
      padding: '48px 56px', overflow: 'hidden',
      borderRadius: 'var(--r-2)', border: '1px solid var(--line-2)',
      fontFamily: 'var(--font-sans)',
      boxShadow: '0 30px 80px -10px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '2px solid #1A1A1A', paddingBottom: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="22" height="22" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="18" rx="3" fill="#fff" stroke="#1A1A1A" strokeWidth="1.4"/><circle cx="8" cy="12" r="2.6" fill="#1A1A1A"/><circle cx="16" cy="12" r="2.6" fill="none" stroke="#1A1A1A" strokeWidth="1.4"/><line x1="10.6" y1="12" x2="13.4" y2="12" stroke="#1A1A1A" strokeWidth="1.4"/></svg>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>Plug-I/O · Rack spec</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, marginTop: 14, letterSpacing: '-0.02em' }}>Studio A · Tracking</div>
          <div style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4, fontFamily: 'var(--font-mono)' }}>v1.0 · 28 May 2026 · 12U · 19″</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: '#6B6B6B', fontFamily: 'var(--font-mono)' }}>
          <div>PREPARED BY</div>
          <div style={{ color: '#1A1A1A', fontWeight: 500, marginTop: 4 }}>Aleksei Volkov · FOH</div>
          <div style={{ marginTop: 12 }}>SIGN-OFF</div>
          <div style={{ width: 140, height: 28, borderBottom: '1px solid #1A1A1A', marginTop: 4 }}/>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 36, marginTop: 28 }}>
        {/* Rack image */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', fontWeight: 600 }}>RACK · FRONT</div>
          <div style={{ marginTop: 10, padding: 4, background: '#1A1A1A', borderRadius: 2 }}>
            <div style={{ transform: 'scale(0.42)', transformOrigin: 'top left', width: 460*0.42, height: 12*U_HEIGHT*0.42 + 50 }}>
              <RackChassis units={12} width={460}>
                <div style={{ position: 'relative', width: 460, height: 12 * U_HEIGHT }}>
                  {BASELINE_PLACEMENTS.map(p => {
                    const d = DEVICES.find(dd => dd.id === p.deviceId);
                    return <div key={p.id} style={{ position: 'absolute', left: 0, top: p.slot * U_HEIGHT }}>
                      <DeviceFront device={d} width={460}/>
                    </div>;
                  })}
                </div>
              </RackChassis>
            </div>
          </div>
        </div>

        {/* BOM */}
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.15em', fontWeight: 600 }}>BILL OF MATERIALS · 6 devices</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #1A1A1A', textAlign: 'left' }}>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>U</th>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>Device</th>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>Mfr</th>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>Cat</th>
                <th style={{ padding: '6px 0', fontWeight: 600, textAlign: 'right' }}>Power</th>
              </tr>
            </thead>
            <tbody>
              {BASELINE_PLACEMENTS.map((p, i) => {
                const d = DEVICES.find(dd => dd.id === p.deviceId);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px dashed #ccc' }}>
                    <td style={{ padding: '6px 0' }}>{12-p.slot}–{12-p.slot-d.u+1}</td>
                    <td style={{ padding: '6px 0', fontWeight: 500 }}>{d?.name}</td>
                    <td style={{ padding: '6px 0', color: '#6B6B6B' }}>{d?.mfr}</td>
                    <td style={{ padding: '6px 0', color: '#6B6B6B' }}>{d?.category}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right' }}>{d?.specs?.Power || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Patch list */}
          <div style={{ fontSize: 10, letterSpacing: '0.15em', fontWeight: 600, marginTop: 22 }}>PATCH LIST · 5 cables</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid #1A1A1A', textAlign: 'left' }}>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>#</th>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>→</th>
                <th style={{ padding: '6px 0', fontWeight: 600 }}>Destination</th>
                <th style={{ padding: '6px 0', fontWeight: 600, textAlign: 'right' }}>Protocol</th>
              </tr>
            </thead>
            <tbody>
              {BASELINE_CABLES.map((c, i) => {
                const sd = DEVICES.find(d => BASELINE_PLACEMENTS.find(p => p.id === c.srcPlacement)?.deviceId === d.id);
                const dd = DEVICES.find(d => BASELINE_PLACEMENTS.find(p => p.id === c.dstPlacement)?.deviceId === d.id);
                return (
                  <tr key={c.id} style={{ borderBottom: '1px dashed #ccc' }}>
                    <td style={{ padding: '6px 0' }}>{i+1}</td>
                    <td style={{ padding: '6px 0' }}>{sd?.name}.{c.srcPort}</td>
                    <td style={{ padding: '6px 0' }}>→</td>
                    <td style={{ padding: '6px 0' }}>{dd?.name}.{c.dstPort}</td>
                    <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 500 }}>{PROTOCOLS[c.protocol].label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 24, left: 56, right: 56, paddingTop: 14, borderTop: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B6B6B', fontFamily: 'var(--font-mono)' }}>
        <span>plug-i.io · generated 28 May 2026</span>
        <span>page 1 / 2</span>
      </div>
    </div>
  );
}

Object.assign(window, {
  ScreenLanding, ScreenConfigurator, ScreenMobile, ScreenTablet,
  ScreenCompare, ScreenShareViewer, ScreenSpecSheet,
});
