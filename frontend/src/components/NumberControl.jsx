import { useEffect, useState } from 'react';

export default function NumberControl({ label, value, onChange, unit, min, max, sliderMin = min, sliderMax = max, step = 'any', log = false, digits = 3, disabled = false }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(Number(value.toPrecision(8)))); }, [value]);
  const number = Number(draft);
  const valid = draft.trim() !== '' && Number.isFinite(number) && number >= min && number <= max;
  const sliderValue = Math.max(sliderMin, Math.min(sliderMax, value));
  function edit(text) {
    setDraft(text);
    const n = Number(text);
    if (text.trim() && Number.isFinite(n) && n >= min && n <= max) onChange(n);
  }
  return <div className="number-control">
    <label><span>{label}</span><div className={`value-input ${!valid ? 'invalid' : ''}`}>
      <input aria-label={label} inputMode="decimal" type="number" value={draft} min={min} max={max} step={step} disabled={disabled} aria-invalid={!valid} onChange={e => edit(e.target.value)} onBlur={() => { if (!valid) setDraft(String(value)); }} />
      <span>{unit}</span>
    </div></label>
    <input aria-label={`${label} slider`} type="range" disabled={disabled} min={log ? Math.log10(sliderMin) : sliderMin} max={log ? Math.log10(sliderMax) : sliderMax} step={log ? 0.002 : step === 'any' ? (sliderMax - sliderMin) / 1000 : step} value={log ? Math.log10(sliderValue) : sliderValue} onChange={e => onChange(Number((log ? 10 ** Number(e.target.value) : Number(e.target.value)).toPrecision(digits + 2)))} />
    <div className="range-labels"><span>{sliderMin} {unit}</span><span>{sliderMax.toLocaleString()} {unit}</span></div>
    {!valid && <span className="field-error">Enter {min}–{max} {unit}. Last valid value is retained.</span>}
  </div>;
}
