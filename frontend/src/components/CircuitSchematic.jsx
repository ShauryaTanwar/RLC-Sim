import { MousePointer2 } from 'lucide-react';

export default function CircuitSchematic({ parameters: p, selected, onSelect, atResonance }) {
  const selectable = key => ({
    role: 'button', tabIndex: 0, 'aria-label': `Select ${key === 'source' ? 'voltage source' : key}`,
    'aria-pressed': selected === key, className: `circuit-part ${selected === key ? 'selected' : ''}`,
    onClick: () => onSelect(key), onKeyDown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(key); } },
  });
  return <section className="panel circuit-panel" aria-labelledby="circuit-title">
    <div className="panel-heading"><div><span className="eyebrow">THE WORKBENCH</span><h2 id="circuit-title">Series RLC circuit</h2></div><span className="tag">IDEAL COMPONENTS</span></div>
    <div className="schematic-surface">
      <div className="schematic-meta"><span>AC / SERIES NETWORK</span><span>V<sub>out</sub> measured across R</span></div>
      <svg className="schematic" viewBox="0 0 760 290" role="img" aria-label="Series circuit with AC source, resistor, inductor, capacitor, and ground. Components are selectable.">
        <g className="wires" fill="none" strokeWidth="2.2" strokeLinejoin="round">
          <path d="M100 133 V86 H230 M330 86 H397 M491 86 H600 V142 M600 167 V225 H100 V183" />
          <path d="M350 225 V240 M332 240 H368 M338 247 H362 M345 254 H355" />
        </g>
        <g {...selectable('source')}>
          <rect className="hitbox" x="53" y="110" width="94" height="94" rx="10" />
          <circle className="symbol" cx="100" cy="158" r="25" />
          <path className="symbol" d="M83 158 Q91 136 100 158 T117 158" />
          <text x="47" y="152" textAnchor="end" className="component-label">V<tspan baselineShift="sub" fontSize="11">in</tspan></text>
          <text x="47" y="174" textAnchor="end" className="component-value">{p.voltage_rms} V</text>
        </g>
        <g {...selectable('resistance')}>
          <rect className="hitbox" x="218" y="29" width="126" height="98" rx="10" />
          <path className="symbol" d="M230 86 H240 L246 73 L258 99 L270 73 L282 99 L294 73 L306 99 L318 73 L324 86 H330" />
          <text x="280" y="43" className="component-label">R<tspan baselineShift="sub" fontSize="11">1</tspan></text>
          <text x="280" y="118" className="component-value">{p.resistance.toLocaleString()} Ω</text>
        </g>
        <g {...selectable('inductance')}>
          <rect className="hitbox" x="382" y="29" width="124" height="98" rx="10" />
          <path className="symbol" d="M397 86 H403 C403 57 425 57 425 86 C425 57 447 57 447 86 C447 57 469 57 469 86 C469 57 491 57 491 86" />
          <text x="444" y="43" className="component-label">L<tspan baselineShift="sub" fontSize="11">1</tspan></text>
          <text x="444" y="118" className="component-value">{Number((p.inductance * 1000).toPrecision(6))} mH</text>
        </g>
        <g {...selectable('capacitance')}>
          <rect className="hitbox" x="550" y="116" width="126" height="80" rx="10" />
          <path className="symbol" d="M579 142 H621 M579 167 H621" />
          <text x="644" y="143" className="component-label" textAnchor="start">C<tspan baselineShift="sub" fontSize="11">1</tspan></text>
          <text x="644" y="169" className="component-value" textAnchor="start">{Number((p.capacitance * 1e6).toPrecision(6))} µF</text>
        </g>
        <g className="junctions" strokeWidth="2"><circle cx="230" cy="86" r="4"/><circle cx="330" cy="86" r="4"/><circle cx="350" cy="225" r="4"/></g>
        <g className="probe"><path d="M230 86 V13 M330 86 V13"/><circle cx="230" cy="13" r="3"/><circle cx="330" cy="13" r="3"/><text x="280" y="14">V<tspan baselineShift="sub" fontSize="9">out</tspan></text></g>
        <path className="current-arrow" d="M154 65 H197 M192 60 L197 65 L192 70"/><text className="current-label" x="176" y="53">I</text>
      </svg>
      <div className="schematic-footer"><span><MousePointer2 size={13}/> Select a component to edit its properties</span><span className={atResonance ? 'resonance-label' : 'muted'}>{atResonance ? 'At resonance' : 'Sinusoidal steady state'}</span></div>
    </div>
    <div className="circuit-equation"><span>TRANSFER FUNCTION</span><span>H(jω) = <b>R</b> / [R + j(ωL − 1/ωC)]</span><span className="muted">V<sub>out</sub> / V<sub>in</sub></span></div>
  </section>;
}
