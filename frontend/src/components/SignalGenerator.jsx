import { Radio, ScanLine } from 'lucide-react';
import NumberControl from './NumberControl';

export default function SignalGenerator({ parameters, onChange, onTune, onSweep, sweeping, busy, f0, selected }) {
  return <section className={`panel signal-panel ${selected ? 'source-selected' : ''}`}>
    <div className="compact-heading"><h2><Radio size={16}/> Signal generator</h2><span className="tag">SINE</span></div>
    <NumberControl label="Frequency" value={parameters.frequency} onChange={v => onChange('frequency', v)} unit="Hz" min={0.000001} max={1e12} sliderMin={1} sliderMax={10000} log />
    <NumberControl label="Amplitude" value={parameters.voltage_rms} onChange={v => onChange('voltage_rms', v)} unit="V RMS" min={0} max={1000} sliderMin={0} sliderMax={20} step={0.1} />
    <div className="signal-actions"><button className="button subtle" onClick={onTune} disabled={!f0 || busy} title="Set the source frequency to the calculated resonance">Tune to f₀</button><button className="button" onClick={onSweep} disabled={sweeping || busy || !f0}><ScanLine size={15}/>{sweeping ? 'Sweeping…' : 'Run sweep'}</button></div>
  </section>;
}
