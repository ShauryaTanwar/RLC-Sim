import { useEffect, useState } from 'react';
import { ArrowUpRight, BookOpen, Check, CheckCircle2, RotateCcw, X } from 'lucide-react';

const experiments = [
  { title: 'Discover resonance', topic: 'FREQUENCY & CURRENT', description: 'Find the frequency where reactances cancel and current reaches its maximum.', objective: 'Locate the current maximum by tuning the source and inspecting the response.', steps: ['Explore the circuit with the signal generator or click a response curve.', 'Tune the source to the current maximum. At resonance, inductive and capacitive reactance cancel.', 'Enter your measured resonance frequency below and verify your result.'], duration: '3 min' },
  { title: 'The effect of resistance', topic: 'QUALITY FACTOR & BANDWIDTH', description: 'See how resistance changes the shape and selectivity of your response.', objective: 'Increase resistance and relate the measured quality factor to bandwidth.', steps: ['Record the starting values below, then select the resistor in the workbench.', 'Increase resistance to at least 1.5 times its starting value. Keep L and C unchanged.', 'Inspect the new Q and bandwidth, then identify the relationship.'], duration: '4 min' },
  { title: 'Changing component values', topic: 'INDUCTANCE & CAPACITANCE', description: 'Predict, adjust, and observe what sets the resonant frequency.', objective: 'Verify f₀ = 1 / (2π√LC) with separate capacitance and inductance changes.', steps: ['Predict the effect of increasing capacitance, then increase it by at least 50%. Keep L fixed.', 'Verify the measured resonance shift, then predict the effect of increasing inductance.', 'Increase L by at least 50% while keeping the new C fixed. Verify your final result.'], duration: '5 min' },
];

function loadProgress() { try { return JSON.parse(localStorage.getItem('resonance-progress') || '[]').filter(n => [0, 1, 2].includes(n)); } catch { return []; } }

export default function GuidedExperiments({ result, onParameters, defaults, pending }) {
  const [completed, setCompleted] = useState(loadProgress);
  const [active, setActive] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [answer, setAnswer] = useState('');
  const [stage, setStage] = useState(0);
  const [capBaseline, setCapBaseline] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    if (active === null) return;
    const close = event => { if (event.key === 'Escape') setActive(null); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [active]);
  const near = (a, b) => Math.abs(a / b - 1) < 1e-5;

  function start(index) {
    // Establish identical reproducible experimental conditions, rather than
    // relying on a possibly stale in-flight simulation from the workbench.
    const initial = { ...defaults, frequency: 80 };
    onParameters(initial);
    setBaseline({ ...initial, f0: 1 / (2 * Math.PI * Math.sqrt(initial.inductance * initial.capacitance)), q: Math.sqrt(initial.inductance / initial.capacitance) / initial.resistance, bw: initial.resistance / (2 * Math.PI * initial.inductance) });
    setActive(index); setAnswer(''); setStage(0); setFeedback(null); setFinished(false); setCapBaseline(null);
  }
  function complete() {
    const next = [...new Set([...completed, active])];
    setCompleted(next);
    try { localStorage.setItem('resonance-progress', JSON.stringify(next)); } catch { /* Storage may be unavailable in private browsing. */ }
    setFinished(true); setFeedback({ ok: true, text: active === 0 ? 'At resonance, Xᴸ = Xᶜ, so |Z| = R. Current is maximized, resistor gain is 0 dB, and its phase is zero.' : active === 1 ? 'Higher resistance increases bandwidth and lowers Q. The resonant frequency stays fixed because it depends only on L and C.' : 'Increasing either L or C lowers f₀. Doubling either component divides resonance by √2; doubling both halves it.' });
  }
  function verify() {
    if (!result || pending || !baseline) return;
    const p = result.parameters, m = result.measurements;
    let error = '';
    if (active === 0) {
      if (!near(p.inductance, baseline.inductance) || !near(p.capacitance, baseline.capacitance)) error = 'Keep L and C at their initial values for this experiment, or restart.';
      else if (!Number(answer) || Math.abs(Number(answer) / m.resonant_frequency - 1) > 0.02) error = 'Inspect the peak in the magnitude response. Your answer should be within 2% of the resonant frequency.';
      else if (Math.abs(p.frequency / m.resonant_frequency - 1) > 0.02) error = 'Your estimate is close. Now tune the source to within 2% of that resonance frequency.';
      else { complete(); return; }
    } else if (active === 1) {
      if (!near(p.inductance, baseline.inductance) || !near(p.capacitance, baseline.capacitance)) error = 'Restore L = 10 mH and C = 100 µF to isolate the effect of resistance.';
      else if (p.resistance < baseline.resistance * 1.5) error = 'Increase resistance to at least 15 Ω, then inspect the updated measurements.';
      else if (answer !== 'lower-wider') error = 'Compare Q and bandwidth with the recorded starting values, then try again.';
      else if (m.quality_factor < baseline.q && m.bandwidth > baseline.bw) { complete(); return; }
    } else if (stage === 0) {
      if (answer !== 'decreases') error = 'Use f₀ = 1 / (2π√LC): what happens to the denominator as C increases?';
      else if (!near(p.inductance, baseline.inductance)) error = 'Keep L = 10 mH for the capacitance step.';
      else if (p.capacitance < baseline.capacitance * 1.5) error = 'Increase capacitance to at least 150 µF in the workbench.';
      else if (m.resonant_frequency < baseline.f0) { setCapBaseline({ ...p, f0: m.resonant_frequency }); setStage(1); setAnswer(''); setFeedback({ ok: true, text: `Verified: f₀ fell from ${baseline.f0.toFixed(2)} to ${m.resonant_frequency.toFixed(2)} Hz. Now increase L by at least 50%, keeping this capacitance fixed.` }); return; }
    } else {
      if (answer !== 'decreases') error = 'As L increases, √LC increases. Reconsider the predicted frequency shift.';
      else if (!near(p.capacitance, capBaseline.capacitance)) error = `Keep C = ${(capBaseline.capacitance * 1e6).toFixed(2)} µF to isolate the effect of L.`;
      else if (p.inductance < capBaseline.inductance * 1.5) error = 'Increase inductance to at least 15 mH.';
      else if (m.resonant_frequency < capBaseline.f0) { complete(); return; }
    }
    setFeedback({ ok: false, text: error || 'Check your component values and retry.' });
  }

  return <section className="experiments-section" id="experiments">
    <div className="section-heading"><div><span className="eyebrow">LEARN BY DOING</span><h2>Guided experiments</h2><p>A little theory. A lot of discovery.</p></div><span className="progress-summary"><BookOpen size={15}/>{completed.length} of 3 completed</span></div>
    <div className="experiment-grid">{experiments.map((exp, i) => <button key={exp.title} className={`experiment-card ${completed.includes(i) ? 'complete' : ''}`} onClick={() => start(i)} disabled={!result || pending}>
      <div className="experiment-top"><span className="experiment-number">{completed.includes(i) ? <Check size={18}/> : `0${i + 1}`}</span><span>{exp.duration}</span><ArrowUpRight size={17}/></div>
      <span className="eyebrow">{exp.topic}</span><h3>{exp.title}</h3><p>{exp.description}</p><div className="experiment-bottom">{completed.includes(i) ? 'Completed · explore again' : 'Open experiment'}<span>Interactive lab</span></div>
    </button>)}</div>
    {active !== null && <div className="experiment-overlay" role="region" aria-label={`${experiments[active].title} experiment`}><div className="experiment-workspace">
      <div className="experiment-detail-top"><span className="eyebrow">GUIDED LAB / 0{active + 1}</span><button className="icon-button" aria-label="Close experiment" onClick={() => setActive(null)}><X size={19}/></button></div>
      <h2>{experiments[active].title}</h2><p>{experiments[active].objective}</p>
      <div className="lab-progress"><span style={{ width: finished ? '100%' : active === 2 && stage === 1 ? '66%' : '25%' }}/></div><span className="lab-progress-label">{finished ? 'Experiment complete' : active === 2 ? `Step ${stage + 1} of 2` : 'Explore · measure · verify'}</span>
      <ol>{experiments[active].steps.map(step => <li key={step}>{step}</li>)}</ol>
      <div className="lab-baseline"><span>RECORDED START</span><div>R {baseline.resistance} Ω · L {baseline.inductance * 1000} mH · C {baseline.capacitance * 1e6} µF</div><div>f₀ {baseline.f0.toFixed(2)} Hz · Q {baseline.q.toFixed(2)} · BW {baseline.bw.toFixed(2)} Hz</div></div>
      {result && <div className="lab-current"><span>CURRENT MEASUREMENTS {pending ? '(updating)' : ''}</span><div>f₀ {result.measurements.resonant_frequency.toFixed(2)} Hz · Q {result.measurements.quality_factor.toFixed(2)} · BW {result.measurements.bandwidth.toFixed(2)} Hz</div></div>}
      {!finished && <div className="lab-answer">{active === 0 ? <label>Your measured resonant frequency (Hz)<input type="number" min="0" step="any" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Enter frequency" /></label> : <label>{active === 1 ? 'When resistance increases…' : `Prediction: increasing ${stage === 0 ? 'capacitance' : 'inductance'} makes f₀…`}<select value={answer} onChange={e => setAnswer(e.target.value)}><option value="">Select your prediction</option>{active === 1 ? <><option value="lower-wider">Q decreases; bandwidth increases</option><option value="higher-narrower">Q increases; bandwidth decreases</option><option value="same">Both stay the same</option></> : <><option value="increases">Increase</option><option value="decreases">Decrease</option><option value="same">Stay the same</option></>}</select></label>}</div>}
      {feedback && <div className={`lab-feedback ${feedback.ok ? 'success' : ''}`} role="status">{feedback.ok && <CheckCircle2 size={18}/>}<span>{feedback.text}</span></div>}
      <div className="lab-actions"><button className="button" onClick={() => start(active)}><RotateCcw size={14}/>Restart</button>{!finished ? <button className="button primary" onClick={verify} disabled={pending || !answer}>Verify {active === 2 && stage === 0 ? 'capacitance' : 'result'}</button> : <button className="button primary" onClick={() => setActive(null)}>Return to workbench</button>}</div>
      <p className="lab-hint">Use the workbench alongside this panel. Starting or restarting a lab restores the default circuit.</p>
    </div></div>}
  </section>;
}
