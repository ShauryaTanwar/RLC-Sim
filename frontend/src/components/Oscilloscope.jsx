import { useEffect, useMemo, useState } from 'react';
import { Activity } from 'lucide-react';
import Plot, { axis, colors } from './Plot';

export default function Oscilloscope({ result, running }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (!running) return;
    // Advance by a true fraction of the source period. This is a slow scan,
    // not a claim to reproduce real-time high-frequency sampling on a monitor.
    const timer = setInterval(() => setOffset(v => (v + 0.025) % 1), 100);
    return () => clearInterval(timer);
  }, [running]);
  const data = useMemo(() => {
    if (!result) return [];
    const { parameters: p, waveforms: w, measurements: m } = result;
    const x = w.time_seconds.map(t => t * 1000);
    const angle = 2 * Math.PI * offset;
    const input = w.time_seconds.map(t => w.input_peak * Math.sin(2 * Math.PI * p.frequency * t + angle));
    const output = w.time_seconds.map(t => w.output_peak * Math.sin(2 * Math.PI * p.frequency * t + angle + m.phase_degrees * Math.PI / 180));
    return [{ x, y: input, name: 'Input voltage', type: 'scatter', mode: 'lines', line: { color: colors.blue, width: 2 }, hovertemplate: '%{y:.3f} V<extra>Input</extra>' },
      { x, y: output, name: 'Resistor voltage', type: 'scatter', mode: 'lines', line: { color: colors.orange, width: 2, dash: Math.abs(m.phase_degrees) < 0.1 ? 'dash' : 'solid' }, hovertemplate: '%{y:.3f} V<extra>Across R</extra>' }];
  }, [result, offset]);
  const layout = useMemo(() => ({
    xaxis: { ...axis, title: { text: 'Time (ms)' }, range: result ? [0, 3000 / result.parameters.frequency] : undefined },
    yaxis: { ...axis, title: { text: 'Voltage (V)' }, range: result ? [-Math.max(result.waveforms.input_peak * 1.22, 0.1), Math.max(result.waveforms.input_peak * 1.22, 0.1)] : undefined },
    uirevision: result?.parameters.frequency,
  }), [result]);
  return <section className="panel scope-panel">
    <div className="instrument-heading"><h2><Activity size={17}/> Oscilloscope</h2><span className={`live-label ${running ? '' : 'paused'}`}><i/>{running ? 'LIVE' : 'PAUSED'}</span></div>
    <div className="scope-info"><div className="legend"><span><i className="line-key blue"/>Input V<sub>in</sub></span><span><i className="line-key orange"/>Resistor V<sub>R</sub></span></div><span className="mono">{result ? `${result.parameters.frequency.toLocaleString(undefined, { maximumFractionDigits: 2 })} Hz` : 'Awaiting simulation'}</span></div>
    <div className="chart-container"><Plot data={data} layout={layout} ariaLabel="Input and resistor voltage against time, in milliseconds" />{!result && <div className="chart-wait">Connect to the simulation service to view waveforms.</div>}</div>
    <div className="instrument-footer"><span>V<sub>in</sub> <b>{result?.waveforms.input_peak.toFixed(2) ?? '—'} V peak</b></span><span>V<sub>R</sub> <b>{result?.waveforms.output_peak.toFixed(2) ?? '—'} V peak</b></span><span>Phase <b>{result?.measurements.phase_degrees.toFixed(2) ?? '—'}°</b></span><span title="Display advances 0.025 periods per frame">{running ? 'Slow scan · 0.25 cycles/s' : 'Steady-state capture'}</span></div>
  </section>;
}
