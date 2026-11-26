# Resonance Studio — implementation specification

## Scope and stack

A single ideal series RLC circuit with a sinusoidal source; resistor voltage is the output. React 19 / Vite 7 JavaScript frontend, custom CSS, accessible SVG component selection, Plotly.js basic bundle for all instrument plots. Python 3.12 / FastAPI / Pydantic 2 / NumPy backend. No authentication, database, external data service, SPICE library, or transient solver.

## Numerical contract

The API accepts resistance in Ω, inductance in H, capacitance in F, voltage in V RMS, and frequency in Hz. UI controls convert mH and µF to SI units. Default values: 10 Ω, 10 mH, 100 µF, 5 V RMS, 159.15494309189535 Hz.

- ω = 2πf; f₀ = 1/(2π√LC).
- Xᴸ = ωL; Xᶜ = 1/(ωC).
- Z = R + j(Xᴸ − Xᶜ); |Z| = hypot(R, Xᴸ − Xᶜ).
- I RMS = V RMS / |Z|; Vᴿ RMS = I RMS × R.
- H = R/Z; gain = 20 log₁₀(R/|Z|).
- Impedance phase θ = atan2(Xᴸ − Xᶜ, R). Resistor voltage phase relative to source φ = −θ.
- Q = 2πf₀L/R; BW = R/(2πL); Q = f₀/BW.
- Waveforms: √2 V RMS sin(2πft), √2 Vᴿ RMS sin(2πft + φ).

Pydantic rejects non-finite values, extra fields, and values outside the supported limits: R 0.001–10⁶ Ω, L 10⁻⁹–1000 H, C 10⁻¹²–1 F, f 10⁻⁶–10¹² Hz, V 0–1000 V RMS. A zero-voltage source is valid. The controls retain the last valid value when a numerical edit is invalid and revert invalid drafts on blur. Preferred logarithmic component slider ranges: 1–1000 Ω, 1–100 mH, 1–1000 µF. Direct entry supports the API limits.

The resonance status requires both |f/f₀ − 1| ≤ 0.005 and |φ| ≤ 1°. The second criterion avoids calling a high-Q circuit resonant despite a significant phase error.

## Sampling and instruments

The response covers at least f₀/100 to 100f₀ and expands to include both half-power corners. Global bounds are 10⁻⁹–10¹⁶ Hz. It uses 220 logarithmic global samples, 80 logarithmic samples across the half-power neighborhood, and exact f₀ and half-power frequencies, deduplicated and sorted. This resolves narrow peaks better than uniform logarithmic spacing alone. Stable half-power roots prevent subtractive cancellation at low Q.

Both response graphs share the same samples, hover inspection (f, gain, phase, |Z|, I), a green resonance line, and a separate operating-frequency line. Clicking a curve changes the source frequency. Automatic response updates follow every valid circuit edit. Run sweep requests fresh backend data, then scans a separate cursor across that result over 2.4 seconds; it retains the completed response and never changes the source frequency.

Waveform data consists of 720 samples over three source periods. The live oscilloscope advances its phase by 0.025 cycles per 100 ms, equivalent to shifting the sampling window by 0.025/f seconds each frame. This is explicitly labeled slow scan at 0.25 display cycles/s; it is not physical real-time acquisition. Input and output use the backend-computed peaks and relative phase. Pause freezes the scan, while parameter changes still update the mathematical solution. Matching resonance curves use an orange dashed output so the blue input remains distinguishable.

## API and state

- GET `/api/health`: service health.
- POST `/api/simulate`: structured `parameters`, `measurements`, `response`, and `waveforms`.
- `/docs`: automatically generated OpenAPI interface.
- `ALLOWED_ORIGINS`: exact comma-separated frontend origins. Credentials are disabled.
- `VITE_API_BASE_URL`: backend origin at build time. Empty uses same-origin `/api`; Vite proxies during development only.
- Requests debounce for 180 ms, use AbortController cancellation, and a monotonically increasing request identifier prevents stale results from overwriting edits. Requests have a 15-second deadline.
- While loading, readings are labeled updating. On failure, an explicit banner explains the error and marks existing readings as a previous successful result. No fabricated fallback.
- Local storage keys: `resonance-configuration` (one explicitly saved configuration), `resonance-progress` (completed experiment IDs). JSON and bounds are checked on load.
- CSV export downloads the actual calculated response, with units in column headings.

## Guided labs

Exactly three labs. Starting/restarting establishes the default RLC circuit with an off-resonance 80 Hz source, records the initial conditions, and opens an instruction panel alongside the editable workbench.

1. Discover resonance: user tunes the source and submits an estimate; both must fall within 2% of calculated f₀, with original L and C retained.
2. Effect of resistance: require R at least 1.5× baseline while L/C stay fixed; verify actual Q decrease/BW increase and the correct conceptual answer.
3. Changing component values: require correct prediction and C increase of at least 50% with L fixed; record the resulting state. Then require correct prediction and L increase of at least 50% with new C fixed. Both stages compare actual calculated f₀.

Completion checks are disabled while calculations are pending or failed. Restart clears active attempt state; prior completed lab badges persist. Restarting the workspace does not erase earned completion or explicitly saved configuration.

## Verification and delivery

Five backend tests cover exact resonance, maximum current, half-power bandwidth, Q identity, phase conventions, sinusoidal samples, API shape, extreme supported values, and invalid input rejection (including booleans and raw nonstandard NaN/Infinity JSON tokens). Five frontend DOM integration tests use the real local API and verify component selection, slider/numeric synchronization, phase-aware traces, pause, tuning, curve inspection, stale response ordering, frequency sweep completion, configuration persistence, backend failure/retry, and completion of every guided lab. The Plotly renderer is replaced by an inspectable trace surface in DOM tests. Browser graphics and responsive visual appearance are not verified by those tests.

GitHub Actions runs both suites and builds the frontend on pushes and pull requests. The frontend job starts FastAPI and waits for health before integration tests. Jobs have ten-minute limits and read-only repository access; frontend failures print API diagnostics.

The deployed frontend is https://resonance-studio-six.vercel.app/ (Vercel, `frontend` root, Vite build, `dist` output). The API is https://resonance-studio-api.onrender.com/ (Render, `backend` root, uvicorn on `$PORT`, `/api/health`). `VITE_API_BASE_URL` embeds the backend origin at build time; `ALLOWED_ORIGINS` controls exact frontend origins. Neither is a secret. Local development needs no environment file because Vite proxies `/api` and FastAPI defaults to the port-5173 local origins. See README for optional `.env` loading and setup.

Finalization verification on November 26, 2026: five backend tests passed, five frontend integration tests passed against the running API, and the Vite 7.3.8 production build passed. A Starlette/AnyIO deprecation warning and Plotly bundle-size advisory remain. Local passes do not establish remote CI or deployment success; see [REVIEW.md](REVIEW.md) and [FINAL_DELIVERY.md](FINAL_DELIVERY.md) for separately observed runs.

The portfolio integration is maintained in the separate Personal-Website repository; it is not served by this project. DEMO_SCRIPT.md provides a 110-second plan using the deployed app. Video recording/upload, the final personal README sections, independent REFLECTION.md, authorship verification, and course submission remain student responsibilities. The reflection's contents are preserved during its required uppercase rename.

Official references consulted: [FastAPI CORS](https://fastapi.tiangolo.com/tutorial/cors/), [FastAPI testing](https://fastapi.tiangolo.com/tutorial/testing/), [Plotly React and integration documentation](https://plotly.com/javascript/react/), and [Plotly.js function reference](https://plotly.com/javascript/plotlyjs-function-reference/).
