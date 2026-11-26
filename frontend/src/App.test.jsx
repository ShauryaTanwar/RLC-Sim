import React from 'react';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from './App';

// DOM tests exercise real backend responses. Plotly drawing needs a browser;
// this lightweight instrument surface exposes the actual trace data for checks.
vi.mock('./components/Plot', () => ({
  default: ({ data, ariaLabel, onHover, onClick }) => <div role="img" aria-label={ariaLabel} data-traces={JSON.stringify(data)}>
    {onHover && <button aria-label={`Inspect ${ariaLabel}`} onClick={() => onHover({ points: [{ pointIndex: 20 }] })}>Inspect curve</button>}
    {onClick && <button aria-label={`Tune ${ariaLabel}`} onClick={() => onClick({ points: [{ x: 100 }] })}>Tune curve</button>}
  </div>,
  axis: {}, colors: { blue: '#386bd6', orange: '#d98845', green: '#3c8c70' },
}));

const nativeFetch = globalThis.fetch;
const apiFetch = (url, { signal, ...options } = {}) => {
  // jsdom's AbortSignal is a different realm from Node fetch's AbortSignal.
  // Omit it in this HTTP harness; the production request retains cancellation.
  return nativeFetch(new URL(url, process.env.TEST_API_BASE_URL || 'http://127.0.0.1:8000').href, options);
};
const ready = () => waitFor(() => {
  const error = screen.queryByRole('alert');
  if (error) throw new Error(error.textContent);
  expect(screen.getByText('Simulation engine connected')).toBeInTheDocument();
}, { timeout: 5000 });
const edit = (label, value) => fireEvent.change(screen.getByRole('spinbutton', { name: label }), { target: { value: String(value) } });
const start = async name => { fireEvent.click(screen.getByRole('button', { name: new RegExp(name) })); await ready(); };
const lab = title => within(screen.getByRole('region', { name: `${title} experiment` }));

beforeEach(() => { localStorage.clear(); vi.stubGlobal('fetch', apiFetch); });
afterEach(() => { vi.unstubAllGlobals(); });

describe('workstation connected to the Python simulation engine', () => {
  it('synchronizes component selection, inputs, sliders, plots, source tuning, and pause', async () => {
    render(<App/>); await ready();
    expect(screen.getByText('Circuit is at resonance')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select inductance' }));
    edit('Inductance', 20); await ready();
    expect(screen.getByRole('slider', { name: 'Inductance slider' })).toHaveValue(String(Math.log10(20)));
    expect(screen.getByText('112.54')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('slider', { name: 'Inductance slider' }), { target: { value: '1' } }); await ready();
    expect(screen.getByRole('spinbutton', { name: 'Inductance' })).toHaveValue(10);
    edit('Inductance', -2);
    expect(screen.getByRole('spinbutton', { name: 'Inductance' })).toHaveAttribute('aria-invalid', 'true');
    fireEvent.blur(screen.getByRole('spinbutton', { name: 'Inductance' }));
    expect(screen.getByRole('spinbutton', { name: 'Inductance' })).toHaveValue(10);
    fireEvent.click(screen.getByRole('button', { name: 'Pause simulation' }));
    expect(screen.getByText('PAUSED')).toBeInTheDocument();
    edit('Frequency', 80); await ready();
    const traces = JSON.parse(screen.getByRole('img', { name: /Input and resistor voltage/ }).dataset.traces);
    expect(traces).toHaveLength(2); expect(traces[0].x).toHaveLength(720);
    expect(traces[0].y[0]).not.toBeCloseTo(traces[1].y[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Tune to f₀' })); await ready();
    expect(screen.getByRole('spinbutton', { name: 'Frequency' }).valueAsNumber).toBeCloseTo(159.154943, 4);
    fireEvent.click(screen.getByRole('button', { name: /^Inspect Resistor transfer magnitude/ }));
    expect(screen.getByText('CURSOR').parentElement).toHaveTextContent('Gain');
    fireEvent.click(screen.getByRole('button', { name: /^Tune Resistor transfer magnitude/ })); await ready();
    expect(screen.getByRole('spinbutton', { name: 'Frequency' })).toHaveValue(100);
    let releaseOlder;
    let olderArrived = false;
    let olderCompleted = false;
    const delayed = new Promise(resolve => { releaseOlder = resolve; });
    vi.stubGlobal('fetch', async (url, options) => {
      const response = await apiFetch(url, options);
      if (JSON.parse(options.body).frequency === 300) { olderArrived = true; await delayed; olderCompleted = true; }
      return response;
    });
    edit('Frequency', 300);
    await waitFor(() => expect(olderArrived).toBe(true));
    edit('Frequency', 400); await ready();
    releaseOlder();
    await waitFor(() => expect(olderCompleted).toBe(true));
    await waitFor(() => expect(screen.getByText('400 Hz')).toBeInTheDocument());
    expect(screen.getByRole('spinbutton', { name: 'Frequency' })).toHaveValue(400);
  });

  it('completes a real sweep, saves/restores a configuration, and displays service failures', async () => {
    render(<App/>); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Run sweep' }));
    await screen.findByText(/SWEEP COMPLETE/, {}, { timeout: 6000 });
    expect(screen.getByRole('spinbutton', { name: 'Frequency' }).valueAsNumber).toBeCloseTo(159.154943, 4);
    fireEvent.click(screen.getByRole('button', { name: 'Configuration' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save current circuit' }));
    edit('Resistance', 30); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Configuration' }));
    fireEvent.click(screen.getByRole('button', { name: 'Load saved circuit' })); await ready();
    expect(screen.getByRole('spinbutton', { name: 'Resistance' })).toHaveValue(10);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    edit('Frequency', 200);
    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent('Cannot reach the simulation service');
    screen.getAllByRole('button', { name: /Open experiment/ }).forEach(button => expect(button).toBeDisabled());
    vi.stubGlobal('fetch', apiFetch);
    fireEvent.click(screen.getByRole('button', { name: 'Retry connection' })); await ready();
    fireEvent.click(screen.getByRole('button', { name: 'Help and circuit theory' }));
    expect(screen.getByRole('dialog')).toHaveTextContent('Below resonance the resistor voltage leads');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('verifies the resonance experiment and persists its completion', async () => {
    render(<App/>); await ready(); await start('Discover resonance');
    const panel = lab('Discover resonance');
    fireEvent.change(panel.getByRole('spinbutton'), { target: { value: '159.15' } });
    fireEvent.click(panel.getByRole('button', { name: 'Minimize experiment' }));
    expect(panel.queryByRole('spinbutton')).not.toBeInTheDocument();
    edit('Frequency', 159.15); await ready();
    fireEvent.click(panel.getByRole('button', { name: 'Expand experiment' }));
    expect(panel.getByRole('spinbutton')).toHaveValue(159.15);
    fireEvent.change(panel.getByRole('spinbutton'), { target: { value: '50' } });
    fireEvent.click(panel.getByRole('button', { name: 'Verify result' }));
    expect(panel.getByRole('status')).toHaveTextContent('within 2%');
    fireEvent.change(panel.getByRole('spinbutton'), { target: { value: '159.15' } });
    fireEvent.click(panel.getByRole('button', { name: 'Verify result' }));
    expect(panel.getByText('Experiment complete')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('resonance-progress'))).toEqual([0]);
  });

  it('verifies resistance changes against actual Q and bandwidth', async () => {
    render(<App/>); await ready(); await start('The effect of resistance');
    const panel = lab('The effect of resistance');
    fireEvent.change(panel.getByRole('combobox'), { target: { value: 'lower-wider' } });
    fireEvent.click(panel.getByRole('button', { name: 'Verify result' }));
    expect(panel.getByRole('status')).toHaveTextContent('at least 15 Ω');
    edit('Resistance', 20); await ready();
    expect(panel.getByText(/f₀ 159.15 Hz · Q 0.50 · BW 318.31 Hz/)).toBeInTheDocument();
    fireEvent.click(panel.getByRole('button', { name: 'Verify result' }));
    expect(panel.getByText('Experiment complete')).toBeInTheDocument();
  });

  it('completes both capacitance and inductance prediction stages with isolated changes', async () => {
    render(<App/>); await ready(); await start('Changing component values');
    const panel = lab('Changing component values');
    fireEvent.change(panel.getByRole('combobox'), { target: { value: 'decreases' } });
    fireEvent.click(screen.getByRole('button', { name: 'Select capacitance' }));
    edit('Capacitance', 200); await ready();
    fireEvent.click(panel.getByRole('button', { name: 'Verify capacitance' }));
    expect(panel.getByText('Step 2 of 2')).toBeInTheDocument();
    expect(panel.getByRole('status')).toHaveTextContent('112.54 Hz');
    fireEvent.change(panel.getByRole('combobox'), { target: { value: 'decreases' } });
    fireEvent.click(screen.getByRole('button', { name: 'Select inductance' }));
    edit('Inductance', 20); await ready();
    fireEvent.click(panel.getByRole('button', { name: 'Verify result' }));
    expect(panel.getByText('Experiment complete')).toBeInTheDocument();
    expect(screen.getAllByText('79.58')).toHaveLength(2);
    fireEvent.click(panel.getByRole('button', { name: 'Restart' })); await ready();
    expect(panel.getByText('Step 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Frequency' })).toHaveValue(80);
  });
});
