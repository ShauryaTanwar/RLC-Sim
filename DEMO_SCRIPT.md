# Resonance Studio — 110-second demonstration plan

Record the actual deployed app at https://resonance-studio-six.vercel.app/. This is preparation, not a recording, voiceover, upload, or video URL. Adapt technical narration to your own understanding without unsupported personal claims.

## Before recording

- Open the public URL, let the backend wake, and confirm **Simulation engine connected**. Keep the address bar readable.
- Use a desktop window with legible measurements and charts. Reset workspace to 10 Ω, 10 mH, 100 µF, 5 V RMS.
- Rehearse, check the microphone, and hide notifications/private dashboards. Starting a lab restores defaults at 80 Hz. Existing badges do not prevent reopening it.
- Open repository files `frontend/src/App.jsx` and `backend/app/rlc.py` in another tab. These paths and calculations were inspected in source.

## Shot-by-shot checklist and narration

1. **0:00–0:10 — Public URL and introduction.** Show the deployed address and workspace.
   “Resonance Studio is a browser laboratory for an ideal series RLC circuit. It connects component controls, waveforms, and frequency-response analysis.”
2. **0:10–0:27 — Schematic and all three components.** Click R, set 20 Ω; click L, set 20 mH; click C, set 200 µF. Wait for connected status after edits.
   “Selecting a component opens its controls. I can edit resistance, inductance, and capacitance directly, and the instruments update from the calculation.”
3. **0:27–0:39 — Oscilloscope and tuning.** The source remains about 159 Hz, while edited f₀ is about 79.58 Hz. Show amplitude/phase differences; click **Tune to f₀**, then pause for a readable capture.
   “Off resonance, resistor output changes in amplitude and phase. Tuning makes the reactances cancel. The traces align; pause freezes this slow display scan.”
4. **0:39–0:52 — Magnitude and phase graphs.** Show the peak, zero-phase crossing, green resonance marker, and hover values. Optionally run the 2.4-second sweep if rehearsal permits.
   “Magnitude peaks at resonance and phase crosses zero. Both graphs use logarithmic frequency. Hover reveals calculated values; clicking a curve tunes the source.”
5. **0:52–1:02 — Electrical measurements.** Show edited-resonance f₀ ≈ 79.58 Hz, |Z| = 20 Ω, I = 250 mA RMS, VR = 5 V RMS, Q = 0.50, BW ≈ 159.15 Hz.
   “Measurements include resonance, impedance, RMS current, resistor voltage, quality factor, bandwidth, and phase.”
6. **1:02–1:24 — One guided lab to completion.** Open **The effect of resistance**. It resets to 10 Ω, 10 mH, 100 µF at 80 Hz. Select R, set 20 Ω, wait, select **Q decreases; bandwidth increases**, then **Verify result**. Show **Experiment complete**.
   “This lab records a baseline. Increasing resistance lowers Q and widens bandwidth while L and C keep resonance fixed. Completion checks the actual circuit values and prediction.”
7. **1:24–1:38 — Architecture.** Switch briefly to the repository, without localhost or provider dashboards.
   “React and Vite run on Vercel. The workbench sends JSON to FastAPI on Render. Python validates inputs and computes results; Plotly renders the graphs.”
8. **1:38–1:50 — Engineering calculation.** Show `resonance()` and `operating_point()` in `backend/app/rlc.py`, then return to the public app.
   “Resonance is one over two pi times the square root of L C. Reactances cancel, leaving impedance equal to R and current equal to voltage divided by R. This is an ideal steady-state model.”

Target **110 seconds**, within 90–120 seconds. Keep transitions short; omit the optional sweep if needed but retain every numbered shot. Displayed lab durations refer to learning time, not recording length.

## After recording — student actions

- Watch the full recording; check readable URL/plots, audible explanation, and verified lab completion.
- Upload to the assignment-approved destination, test viewing permissions, and add the real video URL to README/portfolio if required.
- Check the actual CMU 15-114 Project 3 rubric and submit it yourself. No video or course form submission is claimed.
