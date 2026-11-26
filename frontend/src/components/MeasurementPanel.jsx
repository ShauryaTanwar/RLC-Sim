import { Gauge } from 'lucide-react';

const format = n => n === undefined ? '—' : n === 0 ? '0.00' : Math.abs(n) < 0.01 || Math.abs(n) >= 1e6 ? n.toExponential(2) : n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export default function MeasurementPanel({ result, updating }) {
  const m = result?.measurements;
  const rows = [ ['Quality factor', m?.quality_factor, 'Q'], ['Bandwidth', m?.bandwidth, 'Hz'], ['Impedance |Z|', m?.impedance_magnitude, 'Ω'], ['RMS current', m ? m.current_rms * 1000 : undefined, 'mA'], ['Resistor voltage', m?.resistor_voltage_rms, 'V RMS'], ['Phase difference', m ? Math.abs(m.phase_degrees) < 1e-10 ? 0 : m.phase_degrees : undefined, '°'] ];
  return <section className={`panel measurements-panel ${updating ? 'updating' : ''}`}>
    <div className="compact-heading"><h2><Gauge size={17}/> Measurements</h2><span className="tag">{updating ? 'UPDATING' : 'CALCULATED'}</span></div>
    <div className="resonance-measurement"><span>Resonant frequency <span className="mono">f₀</span></span><div><strong>{format(m?.resonant_frequency)}</strong><span>Hz</span></div><span className={`resonance-status ${m?.at_resonance ? 'at-resonance' : ''}`}><i/>{m?.at_resonance ? 'Circuit is at resonance' : m ? 'Off resonance' : 'Awaiting calculation'}</span></div>
    <dl className="measurement-list">{rows.map(([name, value, unit]) => <div key={name}><dt>{name}</dt><dd>{format(value)} <span>{unit}</span></dd></div>)}</dl>
    <div className="measurement-note">Ideal components · steady-state solution<br/>All voltages and currents are RMS unless labeled.</div>
  </section>;
}
