import { useEffect, useRef, useState } from 'react';
import { Activity, BookOpen, Check, ChevronDown, CircleHelp, CircuitBoard, Download, FlaskConical, Layers, Pause, Play, RotateCcw, Save, X } from 'lucide-react';
import CircuitSchematic from './components/CircuitSchematic';
import ComponentControls from './components/ComponentControls';
import SignalGenerator from './components/SignalGenerator';
import Oscilloscope from './components/Oscilloscope';
import FrequencyResponse from './components/FrequencyResponse';
import MeasurementPanel from './components/MeasurementPanel';
import GuidedExperiments from './components/GuidedExperiments';
import HelpDialog from './components/HelpDialog';
import { simulate } from './services/simulationApi';
export const defaults = {
  resistance: 10,
  inductance: 0.01,
  capacitance: 0.0001,
  voltage_rms: 5,
  frequency: 1 / (2 * Math.PI * Math.sqrt(0.01 * 0.0001))
};
export default function App() {
  const [parameters, setParameters] = useState(defaults);
  const [selected, setSelected] = useState('resistance');
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [running, setRunning] = useState(true);
  const [help, setHelp] = useState(false);
  const [activeSection, setActiveSection] = useState('workspace');
  const [saveMenu, setSaveMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [sweepProgress, setSweepProgress] = useState(null);
  const [sweepState, setSweepState] = useState('AUTO RESPONSE');
  const sweepTimer = useRef(null);
  const sweepController = useRef(null);
  const requestId = useRef(0);
  useEffect(() => {
    const id = ++requestId.current;
    const controller = new AbortController();
    setPending(true);
    setError(null);
    clearInterval(sweepTimer.current);
    sweepController.current?.abort();
    setSweepProgress(null);
    setSweepState('AUTO RESPONSE');
    const timer = setTimeout(async () => {
      let timedOut = false;
      const deadline = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 15000);
      try {
        const next = await simulate(parameters, controller.signal);
        if (id === requestId.current) {
          setResult(next);
          setPending(false);
        }
      } catch (e) {
        if (id === requestId.current && (e.name !== 'AbortError' || timedOut)) {
          setPending(false);
          setError(timedOut ? 'The simulation service took too long to respond. Please retry.' : e.message === 'Failed to fetch' ? 'Cannot reach the simulation service. Start the Python backend or check VITE_API_BASE_URL.' : e.message);
        }
      } finally {
        clearTimeout(deadline);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [parameters, retry]);
  useEffect(() => () => {
    clearInterval(sweepTimer.current);
    sweepController.current?.abort();
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const close = e => {
      if (e.key === 'Escape') {
        setHelp(false);
        setSaveMenu(false);
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);
  function change(key, value) {
    if (key === 'selection') setSelected(value);else setParameters(p => ({
      ...p,
      [key]: value
    }));
  }
  function reset() {
    setParameters({
      ...defaults
    });
    setSelected('resistance');
    setRunning(true);
    setNotice('Default circuit restored.');
  }
  async function sweep() {
    if (!result || pending) return;
    const id = requestId.current;
    setSweepState('CALCULATING');
    try {
      // Request an actual fresh backend sweep. Its full result is retained after
      // the cursor scan; the signal generator's operating point is independent.
      const snapshot = parameters;
      const controller = new AbortController();
      sweepController.current = controller;
      const deadline = setTimeout(() => controller.abort(), 15000);
      let next;
      try {
        next = await simulate(snapshot, controller.signal);
      } finally {
        clearTimeout(deadline);
      }
      if (id !== requestId.current) return;
      setResult(next);
      setSweepProgress(0);
      setSweepState('SWEEPING');
      const start = performance.now();
      sweepTimer.current = setInterval(() => {
        const progress = Math.min((performance.now() - start) / 2400, 1);
        setSweepProgress(progress);
        if (progress >= 1) {
          clearInterval(sweepTimer.current);
          setSweepProgress(null);
          setSweepState(`SWEEP COMPLETE · ${next.response.frequency.length} POINTS`);
        }
      }, 60);
    } catch (e) {
      if (id !== requestId.current) return;
      setSweepState('SWEEP FAILED');
      setNotice(`Frequency sweep failed: ${e.name === 'AbortError' ? 'service timed out' : e.message}`);
    }
  }
  function save() {
    try {
      localStorage.setItem('resonance-configuration', JSON.stringify(parameters));
      setNotice('Circuit configuration saved in this browser.');
    } catch {
      setNotice('Browser storage is unavailable. Use Export data to save your results.');
    }
    setSaveMenu(false);
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem('resonance-configuration'));
      const limits = {
        resistance: [0.001, 1e6],
        inductance: [1e-9, 1000],
        capacitance: [1e-12, 1],
        frequency: [1e-6, 1e12],
        voltage_rms: [0, 1000]
      };
      if (!saved || !Object.keys(defaults).every(key => typeof saved[key] === 'number' && Number.isFinite(saved[key]) && saved[key] >= limits[key][0] && saved[key] <= limits[key][1])) throw new Error();
      setParameters(Object.fromEntries(Object.keys(defaults).map(key => [key, saved[key]])));
      setNotice('Saved circuit configuration restored.');
    } catch {
      setNotice('No valid saved configuration found. Save a circuit first.');
    }
    setSaveMenu(false);
  }
  function exportData() {
    if (!result) return;
    const r = result.response;
    const csv = ['frequency_hz,gain_db,phase_degrees,impedance_ohms,current_rms_a', ...r.frequency.map((f, i) => [f, r.magnitude_db[i], r.phase_degrees[i], r.impedance[i], r.current_rms[i]].join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], {
      type: 'text/csv'
    }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resonance-frequency-response.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
  return <div className="app-shell">
    <a className="skip-link" href="#workspace">Skip to workbench</a>
    <header className="topbar">
      <a className="brand" href="#workspace" aria-label="Resonance Studio home">
        <span className="brand-mark"><Activity size={24} /></span>
        <span>resonance<span className="brand-light">studio</span><span className="brand-period">.</span></span>
      </a>
      <nav className="studio-nav" aria-label="Workspace navigation">
        {[['workspace', 'Workbench', CircuitBoard], ['analysis', 'Analysis', Activity], ['experiments', 'Experiments', FlaskConical]].map(([id, label, Icon]) =>
          <a key={id} href={`#${id}`} className={activeSection === id ? 'active' : ''} aria-current={activeSection === id ? 'location' : undefined} onClick={() => setActiveSection(id)}><Icon size={16}/><span>{label}</span></a>
        )}
      </nav>
      <div className="topbar-right">
        <button className="button text-button" onClick={reset} aria-label="Reset workspace"><RotateCcw size={15}/><span>Reset workspace</span></button>
        <button className="icon-button help-button" onClick={() => setHelp(true)} aria-label="Help and circuit theory"><CircleHelp size={20}/></button>
      </div>
    </header>
    <main id="workspace" tabIndex={-1}>
      <div className="page-heading">
        <div>
          <div className="breadcrumbs"><span className="lab-indicator"/> THE INTERACTIVE ELECTRONICS LAB</div>
          <h1>Find your <span>frequency.</span></h1>
          <p>Build an intuition for resonance. One component at a time.</p>
        </div>
        <div className="heading-actions">
          <div className="save-wrap">
            <button className="button" onClick={() => setSaveMenu(v => !v)} aria-expanded={saveMenu}><Save size={15}/>Configuration<ChevronDown size={14}/></button>
            {saveMenu && <div className="save-menu"><button onClick={save}><Save size={15}/>Save current circuit</button><button onClick={load}><Layers size={15}/>Load saved circuit</button></div>}
          </div>
          <button className={`button ${running ? 'running-button' : 'primary'}`} onClick={() => setRunning(v => !v)}>{running ? <Pause size={15}/> : <Play size={15}/>}<span>{running ? 'Pause simulation' : 'Start simulation'}</span></button>
        </div>
      </div>
      <div className="workspace-toolbar">
        <div><CircuitBoard size={16}/><span>Series RLC</span><span className="toolbar-divider"/><span className="muted">Sinusoidal source · output across R</span></div>
        <span className={`service-state ${error ? 'error' : pending ? 'pending' : ''}`} role="status"><i/>{pending ? 'Calculating…' : error ? 'Service unavailable' : 'Simulation engine connected'}</span>
      </div>
      {error && <div className="error-banner" role="alert"><span><strong>Simulation unavailable.</strong> {error}{result && ' Instruments show the last successful calculation.'}</span><button className="button" onClick={() => setRetry(v => v + 1)}>Retry connection</button></div>}
      <div className="studio-grid">
        <CircuitSchematic parameters={parameters} selected={selected} onSelect={setSelected} atResonance={!pending && !error && result?.measurements.at_resonance}/>
        <aside className="workbench-controls" aria-label="Circuit controls">
          <ComponentControls selected={selected} parameters={parameters} onChange={change}/>
          <SignalGenerator parameters={parameters} onChange={change} onTune={() => change('frequency', result.measurements.resonant_frequency)} onSweep={sweep} sweeping={sweepProgress !== null || sweepState === 'CALCULATING'} busy={pending || !!error} f0={!pending && !error ? result?.measurements.resonant_frequency : undefined} selected={selected === 'source'}/>
        </aside>
        <Oscilloscope result={result} running={running && !pending && !error}/>
        <MeasurementPanel result={result} updating={pending || !!error}/>
      </div>
      <section id="analysis" className="analysis-section" aria-label="Frequency analysis">
        <FrequencyResponse result={result} onFrequency={f => change('frequency', f)} sweepProgress={sweepProgress} sweepState={sweepState}/>
      </section>
      <GuidedExperiments result={result} onParameters={setParameters} defaults={defaults} pending={pending || !!error}/>
      <footer className="page-footer">
        <span><Activity size={16}/> Resonance Studio <span className="footer-separator">/</span><span>Explore. Measure. Understand.</span></span>
        <div><button onClick={exportData} disabled={!result || pending || !!error}><Download size={15}/>Export response data</button><button onClick={() => setHelp(true)}><BookOpen size={15}/>Circuit theory</button></div>
      </footer>
    </main>
    {notice && <div className="toast" role="status"><Check size={18}/>{notice}<button className="icon-button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15}/></button></div>}
    {help && <HelpDialog onClose={() => setHelp(false)}/>}
  </div>;
}
