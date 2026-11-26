import { useEffect, useRef } from 'react';
import { BookOpen, X } from 'lucide-react';

export default function HelpDialog({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const first = ref.current.querySelector('button');
    first?.focus();
    return () => previous?.focus();
  }, []);

  function trapFocus(event) {
    if (event.key !== 'Tab') return;
    const buttons = ref.current.querySelectorAll('button');
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  return <div className="modal-backdrop" onClick={onClose}>
    <section ref={ref} className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={event => event.stopPropagation()} onKeyDown={trapFocus}>
      <div className="compact-heading"><h2 id="help-title"><BookOpen size={20}/>Inside the laboratory</h2><button className="icon-button" onClick={onClose} aria-label="Close help"><X size={20}/></button></div>
      <p>Explore an ideal series RLC circuit driven by a sinusoidal voltage source. The output is measured across the resistor.</p>
      <h3>Find your balance</h3>
      <p>Click a component to adjust its value. Use the signal generator to change frequency and voltage. Click either frequency response curve to tune the source to that frequency.</p>
      <div className="help-equation">f₀ = 1 / (2π√LC)<br/>Q = 2πf₀L / R &nbsp; · &nbsp; BW = R / (2πL)</div>
      <h3>Reading the instruments</h3>
      <p>Blue is the input; orange is the resistor voltage. Voltage and current measurements are RMS. The oscilloscope displays instantaneous voltage with peak amplitude √2 × RMS. Below resonance the resistor voltage leads the source; above resonance it lags.</p>
      <p>The live display advances a slow time window through the calculated steady-state sinusoids. Pause freezes the scan; editing the circuit still recalculates the solution. A sweep scans the computed response without changing the source frequency.</p>
      <p>At resonance, gain is 0 dB and phase is 0°. The green indicator requires frequency within 0.5% of f₀ and phase within 1°. Real components add losses and parasitics not modeled here.</p>
      <button className="button primary" onClick={onClose}>Back to the laboratory</button>
    </section>
  </div>;
}
