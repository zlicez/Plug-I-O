// Canvas components — buttons, chips, inputs, badges, kbd, tooltips, toasts, modals, device cards
// Exports: ButtonsArtboard, ChipsArtboard, InputsArtboard, ToastsArtboard, BadgesArtboard, DeviceCardsArtboard, ModalsArtboard, KbdArtboard

function ButtonsArtboard() {
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 12 }}>BUTTONS · all variants × all states</div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8, fontSize: 10, color: 'var(--muted-2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Variant</th>
            {['Default','Hover','Focus','Active','Disabled','Loading'].map(s => (
              <th key={s} style={{ textAlign: 'left', padding: 8, fontSize: 10, color: 'var(--muted-2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { name: 'Primary',   cls: 'btn btn-primary', label: 'Place device' },
            { name: 'Secondary', cls: 'btn', label: 'Cancel' },
            { name: 'Ghost',     cls: 'btn btn-ghost', label: 'Skip' },
            { name: 'Danger',    cls: 'btn btn-danger', label: 'Disconnect' },
          ].map((row) => (
            <tr key={row.name}>
              <td style={{ padding: 8, fontSize: 11, color: 'var(--muted)' }} className="mono">{row.name}</td>
              <td style={{ padding: 8 }}><button className={row.cls}>{row.label}</button></td>
              <td style={{ padding: 8 }}><button className={row.cls} style={{ background: row.cls.includes('primary') ? 'var(--accent-2)' : 'var(--control-hover)', borderColor: row.cls.includes('primary') ? 'var(--accent-2)' : 'var(--line-strong)' }}>{row.label}</button></td>
              <td style={{ padding: 8 }}><button className={row.cls} style={{ boxShadow: '0 0 0 2px var(--bg), 0 0 0 4px var(--accent)' }}>{row.label}</button></td>
              <td style={{ padding: 8 }}><button className={row.cls} style={{ background: 'var(--surface-2)' }}>{row.label}</button></td>
              <td style={{ padding: 8 }}><button className={row.cls} disabled>{row.label}</button></td>
              <td style={{ padding: 8 }}><button className={row.cls}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="9" strokeDasharray="40 60" strokeLinecap="round"/></svg>Loading</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 24 }}>
        <div className="label-eyebrow" style={{ marginBottom: 8 }}>SIZES</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-primary btn-sm">Small · 26</button>
          <button className="btn btn-primary">Medium · 32</button>
          <button className="btn btn-primary btn-lg">Large · 40</button>
          <button className="btn btn-primary btn-icon"><Icon name="plus" size={14}/></button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ChipsArtboard() {
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 12 }}>CHIPS · FILTERS · PROTOCOLS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Default</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="chip">Preamp</span>
            <span className="chip">Compressor</span>
            <span className="chip">Converter</span>
            <span className="chip">EQ</span>
            <span className="chip">Network</span>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Active (with close)</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className="chip is-active">Preamp <Icon name="x" size={10}/></span>
            <span className="chip is-active">192 kHz <Icon name="x" size={10}/></span>
            <span className="chip is-active">XLR <Icon name="x" size={10}/></span>
            <button className="chip">Reset</button>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Protocol chips · color-coded</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {Object.keys(PROTOCOLS).map(k => (
              <span key={k} className="chip"><ProtocolDot protocol={k}/>{PROTOCOLS[k].label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="label-eyebrow" style={{ marginTop: 24, marginBottom: 8 }}>BADGES</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span className="badge">12</span>
        <span className="badge badge-accent">3</span>
        <span className="badge" style={{ background: 'var(--positive-soft)', color: 'var(--positive)', borderColor: 'rgba(74,222,128,0.3)' }}>OK</span>
        <span className="badge" style={{ background: 'var(--danger-soft)', color: '#FFB4B4', borderColor: 'rgba(224,84,84,0.3)' }}>ERR</span>
        <span className="badge" style={{ background: 'var(--warning-soft)', color: 'var(--warning)', borderColor: 'rgba(242,169,59,0.3)' }}>BETA</span>
      </div>

      <div className="label-eyebrow" style={{ marginTop: 24, marginBottom: 8 }}>KEYBOARD KEYS</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--copy-2)' }}>
        <span>Cancel:</span> <span className="kbd">Esc</span>
        <span style={{ margin: '0 10px 0 16px' }}>Save:</span> <span className="kbd">⌘</span> + <span className="kbd">S</span>
        <span style={{ margin: '0 10px 0 16px' }}>Search:</span> <span className="kbd">⌘K</span>
        <span style={{ margin: '0 10px 0 16px' }}>Front/Rear:</span> <span className="kbd">V</span> / <span className="kbd">R</span>
      </div>
    </div>
  );
}

function InputsArtboard() {
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 12 }}>INPUTS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Default</div>
          <input className="input" placeholder="Rack name…" defaultValue="Studio A · Tracking"/>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Focus</div>
          <input className="input" placeholder="Search devices" style={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)' }} defaultValue="preamp"/>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Search with affordance</div>
          <div style={{ position: 'relative' }}>
            <Icon name="search" size={13} color="var(--muted-2)" style={{ position: 'absolute', left: 10, top: 9 }}/>
            <input className="input" placeholder="Find a device…" style={{ paddingLeft: 30, paddingRight: 30 }} defaultValue="WaveTec"/>
            <Icon name="x" size={12} color="var(--muted)" style={{ position: 'absolute', right: 10, top: 10, cursor: 'pointer' }}/>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Error</div>
          <input className="input" defaultValue="0.0.0.0" style={{ borderColor: 'var(--danger)' }}/>
          <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Invalid IP for Dante primary</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Disabled</div>
          <input className="input" defaultValue="Read-only" disabled style={{ opacity: 0.5 }}/>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Select</div>
          <button className="btn" style={{ width: '100%', justifyContent: 'space-between', height: 32 }}>
            <span>Internal clock · 96 kHz</span>
            <Icon name="chevDown" size={12}/>
          </button>
        </div>
      </div>

      <div className="label-eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>CHECKBOX · RADIO · SWITCH</div>
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <div>
          {['Phantom power +48V', 'High-pass 80 Hz', 'Pad −20 dB'].map((l, i) => (
            <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, cursor: 'pointer' }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3,
                background: i === 0 ? 'var(--accent)' : 'var(--bg-2)',
                border: '1px solid var(--line-strong)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i === 0 && <Icon name="check" size={10} color="var(--accent-text)" strokeWidth={3}/>}</span>
              <span style={{ color: 'var(--copy-2)' }}>{l}</span>
            </label>
          ))}
        </div>
        <div>
          {['Comfortable', 'Compact'].map((l, i) => (
            <label key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, cursor: 'pointer' }}>
              <span style={{
                width: 14, height: 14, borderRadius: '50%',
                border: '1.5px solid ' + (i === 0 ? 'var(--accent)' : 'var(--line-strong)'),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{i === 0 && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}/>}</span>
              <span style={{ color: 'var(--copy-2)' }}>{l}</span>
            </label>
          ))}
        </div>
        <div>
          {[{l:'Reduced motion', on:true}, {l:'Snap to grid', on:false}].map((sw) => (
            <label key={sw.l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', fontSize: 12, cursor: 'pointer' }}>
              <span style={{
                width: 28, height: 16, borderRadius: 9,
                background: sw.on ? 'var(--accent)' : 'var(--control)',
                border: '1px solid ' + (sw.on ? 'var(--accent)' : 'var(--line-2)'),
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', top: 1, left: sw.on ? 13 : 1,
                  width: 12, height: 12, borderRadius: '50%',
                  background: sw.on ? 'var(--accent-text)' : 'var(--muted)',
                  transition: 'left 160ms',
                }}/>
              </span>
              <span style={{ color: 'var(--copy-2)' }}>{sw.l}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToastsArtboard() {
  const items = [
    { kind: 'success', title: 'Session saved', body: '14:02 · автосохранение через 30 c' },
    { kind: 'info',    title: 'Cable created', body: 'Analog · Nova VCA-2 OUT L → Meridian EQ-3 IN L' },
    { kind: 'warning', title: 'Clock drift', body: 'Wordclock 48 kHz, but interface reports 96 kHz' },
    { kind: 'error',   title: 'Несовместимое подключение', body: 'XLR analog out → AES/EBU in: protocol mismatch' },
  ];
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 14 }}>TOASTS · 4 kinds · slide-up bottom-right</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map(t => <Toast key={t.kind} kind={t.kind} title={t.title} body={t.body} onClose={() => {}}/>)}
      </div>

      <div className="label-eyebrow" style={{ marginTop: 24, marginBottom: 10 }}>TOOLTIP / POPOVER</div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ position: 'relative', padding: 24, background: 'var(--bg-2)', borderRadius: 'var(--r-3)', border: '1px solid var(--line)' }}>
          <button className="btn btn-sm" style={{ position: 'relative' }}>
            <Icon name="info" size={12}/>
            Hover me
            <span className="tt" style={{ left: '50%', bottom: '110%', transform: 'translateX(-50%)' }}>
              Drag to slot 4
            </span>
          </button>
        </div>
        <div style={{ position: 'relative', padding: 24, background: 'var(--bg-2)', borderRadius: 'var(--r-3)', border: '1px solid var(--line)', flex: 1 }}>
          <div className="label-eyebrow" style={{ marginBottom: 8 }}>POPOVER · Quick actions</div>
          <div style={{ width: 200, background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-3)', padding: 6, boxShadow: 'var(--elev-3)' }}>
            {[{i:'copy',l:'Duplicate device'},{i:'edit',l:'Rename'},{i:'flip',l:'Flip orientation'},{i:'trash',l:'Remove'}].map((it,i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 'var(--r-1)', fontSize: 12, color: i === 3 ? 'var(--danger)' : 'var(--copy-2)', cursor: 'pointer', background: i === 0 ? 'var(--control)' : 'transparent' }}>
                <Icon name={it.i} size={13}/>
                <span>{it.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceCardsArtboard() {
  const sample = DEVICES.slice(0, 4);
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 14 }}>DEVICE CARDS · Grid + List</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Grid · 2-column</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {sample.map(d => <DeviceCard key={d.id} device={d} variant="grid"/>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>List · dense</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {DEVICES.map(d => <DeviceCard key={d.id} device={d} variant="list"/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalsArtboard() {
  return (
    <div style={{ padding: 24, background: 'var(--surface)', borderRadius: 'var(--r-3)', height: '100%' }}>
      <div className="label-eyebrow" style={{ marginBottom: 14 }}>MODALS · Confirm · Export</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        {/* Confirm */}
        <div style={{ background: 'rgba(8,9,11,0.6)', padding: 24, borderRadius: 'var(--r-3)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', overflow: 'hidden', boxShadow: 'var(--elev-3)' }}>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--danger-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="alert" size={16} color="var(--danger)"/>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Remove WaveTec X73-A?</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>This will disconnect 3 cables. Action can be undone.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn">Cancel</button>
                <button className="btn btn-danger">Remove device</button>
              </div>
            </div>
          </div>
        </div>
        {/* Export */}
        <div style={{ background: 'rgba(8,9,11,0.6)', padding: 24, borderRadius: 'var(--r-3)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-4)', overflow: 'hidden', boxShadow: 'var(--elev-3)' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
              <div className="label-eyebrow">EXPORT</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginTop: 2 }}>Save the rack as…</div>
            </div>
            <div style={{ padding: 8 }}>
              {[
                { fmt: 'json', name: 'JSON', desc: 'Machine-readable session', icon: 'cpu' },
                { fmt: 'pdf',  name: 'PDF spec sheet', desc: 'A4 with patch list', icon: 'printer' },
                { fmt: 'png',  name: 'PNG · 2×', desc: 'Flat image', icon: 'eye' },
              ].map((o, i) => (
                <div key={o.fmt} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: 10, borderRadius: 'var(--r-2)',
                  background: i === 1 ? 'var(--surface-2)' : 'transparent',
                  border: '1px solid ' + (i === 1 ? 'var(--line)' : 'transparent'),
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 'var(--r-2)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--line)' }}>
                    <Icon name={o.icon} size={14} color="var(--accent)"/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{o.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{o.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  ButtonsArtboard, ChipsArtboard, InputsArtboard, ToastsArtboard,
  DeviceCardsArtboard, ModalsArtboard,
});
