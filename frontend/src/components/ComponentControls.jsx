import { SlidersHorizontal } from 'lucide-react';
import NumberControl from './NumberControl';

const properties = {
  resistance: { title: 'Resistor', reference: 'R1', label: 'Resistance', unit: 'Ω', scale: 1, min: 0.001, max: 1e6, sliderMin: 1, sliderMax: 1000, description: 'Sets the damping, bandwidth, and sharpness of the resonance peak.' },
  inductance: { title: 'Inductor', reference: 'L1', label: 'Inductance', unit: 'mH', scale: 1000, min: 0.000001, max: 1e6, sliderMin: 1, sliderMax: 100, description: 'Stores energy in a magnetic field. Higher inductance lowers the resonant frequency.' },
  capacitance: { title: 'Capacitor', reference: 'C1', label: 'Capacitance', unit: 'µF', scale: 1e6, min: 0.000001, max: 1e6, sliderMin: 1, sliderMax: 1000, description: 'Stores energy in an electric field. Higher capacitance lowers the resonant frequency.' },
};

export default function ComponentControls({ selected, parameters, onChange }) {
  const key = selected === 'source' ? 'resistance' : selected;
  const item = properties[key];
  return <section className="panel properties-panel">
    <div className="compact-heading"><h2><SlidersHorizontal size={16}/> Component properties</h2><span className="reference-tag">{item.reference}</span></div>
    <div className="component-tabs" aria-label="Component selection">{Object.entries(properties).map(([k, v]) => <button key={k} className={key === k ? 'active' : ''} aria-pressed={key === k} onClick={() => onChange('selection', k)}>{v.title}</button>)}</div>
    <NumberControl {...item} value={Number((parameters[key] * item.scale).toPrecision(8))} onChange={v => onChange(key, v / item.scale)} log />
    <p className="control-description">{item.description}</p>
  </section>;
}
