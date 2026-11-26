import { useMemo, useState } from 'react';
import { ChartNoAxesCombined } from 'lucide-react';
import Plot, { axis, colors } from './Plot';

export default function FrequencyResponse({ result, sweepProgress, sweepState, onFrequency }) {
  const [inspected, setInspected] = useState(null);
  const r = result?.response, m = result?.measurements;
  const index = inspected === null || !r ? null : Math.min(inspected, r.frequency.length - 1);
  const shapes = useMemo(() => !m ? [] : [
    { type: 'line', x0: m.resonant_frequency, x1: m.resonant_frequency, y0: 0, y1: 1, yref: 'paper', line: { color: colors.green, dash: 'dot', width: 1.4 } },
    { type: 'line', x0: result.parameters.frequency, x1: result.parameters.frequency, y0: 0, y1: 1, yref: 'paper', line: { color: '#a4b6bf', dash: 'dash', width: 1 } },
    ...(sweepProgress !== null ? [{ type: 'line', x0: 10 ** (Math.log10(r.frequency[0]) + sweepProgress * Math.log10(r.frequency.at(-1) / r.frequency[0])), x1: 10 ** (Math.log10(r.frequency[0]) + sweepProgress * Math.log10(r.frequency.at(-1) / r.frequency[0])), y0: 0, y1: 1, yref: 'paper', line: { color: colors.orange, width: 2 } }] : []),
  ], [result, sweepProgress]);
  const xaxis = { ...axis, type: 'log', title: { text: 'Frequency (Hz)' }, exponentformat: 'SI', dtick: 1 };
  const gainData = useMemo(() => !r ? [] : [{ x: r.frequency, y: r.magnitude_db, mode: 'lines', type: 'scatter', name: 'Gain', line: { color: colors.blue, width: 2.3 }, fill: 'tozeroy', fillcolor: 'rgba(131,207,255,0.045)', hovertemplate: '%{x:.3f} Hz · %{y:.2f} dB<extra></extra>' }], [r]);
  const phaseData = useMemo(() => !r ? [] : [{ x: r.frequency, y: r.phase_degrees, mode: 'lines', type: 'scatter', name: 'Phase', line: { color: colors.blue, width: 2.3 }, hovertemplate: '%{x:.3f} Hz · %{y:.2f}°<extra></extra>' }], [r]);
  const common = { shapes, xaxis, uirevision: `${result?.parameters.resistance}-${result?.parameters.inductance}-${result?.parameters.capacitance}` };
  function hover(e) { if (e.points?.[0]) setInspected(e.points[0].pointIndex); }
  function click(e) { if (e.points?.[0]) onFrequency(e.points[0].x); }
  return <section className="panel response-panel">
    <div className="instrument-heading"><h2><ChartNoAxesCombined size={17}/> Frequency response</h2><div className="response-heading-right"><span className="tag">LOG SCALE</span><span className="sweep-status" aria-live="polite">{sweepState}</span></div></div>
    <div className="response-legend"><span><i className="line-key green"/>Resonance f₀</span><span><i className="line-key operating"/>Operating frequency</span><span>Click a curve to tune the source</span></div>
    <div className="response-charts"><div><div className="chart-title">Magnitude <span>dB</span></div><Plot data={gainData} layout={{ ...common, margin: { l: 48, r: 18, t: 10, b: 42 }, yaxis: { ...axis, title: { text: 'Gain (dB)' }, rangemode: 'tozero' } }} onHover={hover} onClick={click} ariaLabel="Resistor transfer magnitude in decibels against logarithmic frequency" /></div>
      <div><div className="chart-title">Phase <span>degrees</span></div><Plot data={phaseData} layout={{ ...common, margin: { l: 48, r: 18, t: 10, b: 42 }, yaxis: { ...axis, title: { text: 'Phase (°)' }, range: [-100, 100], dtick: 45 } }} onHover={hover} onClick={click} ariaLabel="Resistor transfer phase in degrees against logarithmic frequency" /></div></div>
    <div className="inspection-bar" aria-live="polite">{r && index !== null ? <><span>CURSOR</span><b>{r.frequency[index].toFixed(2)} Hz</b><span>Gain <b>{r.magnitude_db[index].toFixed(2)} dB</b></span><span>Phase <b>{r.phase_degrees[index].toFixed(2)}°</b></span><span>|Z| <b>{r.impedance[index].toPrecision(4)} Ω</b></span><span>I <b>{(r.current_rms[index] * 1000).toPrecision(4)} mA</b></span></> : <><span>CURSOR</span><span>Hover over either curve to inspect frequency, gain, phase, impedance, and current.</span></>}</div>
  </section>;
}
