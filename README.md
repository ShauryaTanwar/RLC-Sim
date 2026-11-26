# Resonance Studio

A browser laboratory for exploring an ideal series RLC circuit. Select components, change their values, and see resonance, current, waveforms, and frequency response update together. The output is measured across the resistor.

- [Deployed frontend](https://resonance-studio-six.vercel.app/)
- [Backend health](https://resonance-studio-api.onrender.com/api/health) · [API docs](https://resonance-studio-api.onrender.com/docs)
- [GitHub](https://github.com/ShauryaTanwar/RLC-Sim) · [CI runs](https://github.com/ShauryaTanwar/RLC-Sim/actions/workflows/tests.yml)
- [Portfolio](https://shauryatanwar.github.io/Personal-Website/#projects)

## Using the laboratory

1. Wait for **Simulation engine connected**. Render may need to wake after inactivity; retry if the first request times out.
2. Select R, L, or C in the SVG schematic. Use the synchronized slider or number field. Defaults are 10 Ω, 10 mH, 100 µF, and a 5 V RMS sine source.
3. Change frequency to move off resonance. Compare input and resistor-output waveforms, magnitude in dB, phase in degrees, and measurements.
4. Choose **Tune to f₀** to return to calculated resonance (159.15 Hz for the defaults). **Pause simulation** freezes the oscilloscope scan; edits still update the steady-state solution.
5. Hover over either response curve to inspect values, click it to tune the source, or choose **Run sweep** to scan a freshly calculated response.
6. Try one of three guided experiments: discover resonance, investigate resistance, or predict changes caused by L and C. Each checks the actual calculation and records completion locally.

The Configuration menu saves/loads one circuit in this browser. Export data downloads the calculated response as CSV. Reset workspace restores defaults without deleting saved configuration or completed labs.

## Features

- Clickable schematic and validated numeric/logarithmic slider controls, with mH/µF converted to SI units for the API.
- Two-channel oscilloscope using backend-calculated amplitude and relative phase.
- Plotly magnitude and phase graphs with resonance/operating markers, inspection, click-to-tune, and animated sweep cursor.
- Resonant frequency, Q, bandwidth, impedance, RMS current, resistor voltage, and phase measurements.
- Three guided experiments with predictions and numerical completion checks.
- Debounced/cancellable API requests, stale-response protection, explicit errors, and retry.
- Browser-local persistence and CSV export; no account or database required.

## Architecture and calculations

React/Vite runs on **Vercel** and sends JSON over HTTPS to **FastAPI on Render**. Pydantic validates inputs; Python/NumPy calculate the operating point, frequency response, and waveform data. Plotly.js renders the instruments. There are no AI API calls at runtime.

For ω = 2πf, series impedance is Z = R + j(ωL − 1/(ωC)), and resistor transfer is H = R/Z. The backend calculates f₀ = 1/(2π√LC), I RMS = V RMS/|Z|, Q = 2πf₀L/R, and bandwidth = R/(2πL). Output phase is the negative impedance angle. At default resonance, |Z| = 10 Ω, current = 0.5 A RMS, resistor voltage = 5 V RMS, and gain = 0 dB.

See [SPEC.md](SPEC.md) for the numerical contract and [REVIEW.md](REVIEW.md) for source inspection and verification.

## Local setup

Prerequisites: Python 3.12 and Node.js 22.12+ (Node 24 also works). From the repository root:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Keep the backend running. In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:5173 (or Vite's printed URL). Use port 5173 for default CORS. Vite forwards `/api` to `127.0.0.1:8000`. On macOS/Linux substitute `.venv/bin/python` for `.\.venv\Scripts\python.exe`. Local API docs: http://127.0.0.1:8000/docs.

## Environment and secrets

- `frontend/.env.example` documents `VITE_API_BASE_URL`. Local development needs no `.env`: an empty base uses the Vite proxy. In Vercel set `VITE_API_BASE_URL=https://resonance-studio-api.onrender.com`, without `/api`, and rebuild. Vite embeds `VITE_*` values in public JavaScript; never put secrets there.
- `backend/.env.example` documents `ALLOWED_ORIGINS`. Defaults: `http://127.0.0.1:5173,http://localhost:5173`. On Render use `https://resonance-studio-six.vercel.app` (exact origin, no trailing slash). Multiple origins are comma-separated; preview origins require explicit configuration.
- FastAPI does not automatically load `.env`. To use one locally, copy the example to `backend/.env` and add `--env-file backend/.env` to the root uvicorn command, or set the variable in the launching shell.
- No simulator API keys are required. `.env`, `.env.local`, virtual environments, dependencies, logs, and build output are ignored. Hosting credentials belong in private provider settings, never source control.
- Saved circuits and progress stay in browser localStorage, without device synchronization.

## Tests and build

With the backend still running, open another terminal at the repository root:

```powershell
cd backend
..\.venv\Scripts\python.exe -m pytest -q
cd ../frontend
npm test
npm run build
```

Run pytest **from `backend`** so `app` resolves. Frontend tests call the actual HTTP API at `http://127.0.0.1:8000`; optionally set `TEST_API_BASE_URL` to another local test backend. Only Plotly drawing is replaced by an inspectable test surface, so these DOM tests do not prove real-browser rendering.

Observed November 26, 2026:

- Backend: **5 passed**, one Starlette/AnyIO deprecation warning.
- Frontend: **5 passed** against the running FastAPI backend, including all three labs, sweep completion, save/load, request ordering, errors, and retry.
- Production build: **passed**, Vite 7.3.8. Plotly is approximately 377 kB gzip and triggers a large-chunk advisory.
- GitHub Actions runs both suites and the build on **pushes and pull requests**. The frontend job starts and health-checks FastAPI. Jobs have ten-minute limits and print API logs on failure. See [REVIEW.md](REVIEW.md) and the final delivery report for observed remote runs; local success alone is not a CI result.

## Deployment

The public services already exist. Reproduce their configuration as follows:

1. **Render:** use `render.yaml` or a Python service rooted at `backend`. Build: `pip install -r requirements.txt`. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Health: `/api/health`. The manifest specifies Python 3.12.8 and the free plan. Set `ALLOWED_ORIGINS` to the frontend origin.
2. **Vercel:** import this repository with root `frontend`, Vite framework, build `npm run build`, output `dist` (also in `frontend/vercel.json`). Set `VITE_API_BASE_URL` to the Render origin before building.
3. Verify health, POST `/api/simulate`, and deployed-browser calculations. The Vite proxy is development-only; an empty production API base does not route to Render automatically.

The earlier deployment record identifies Vercel Hobby and Render Free, and says Render was imported using a public Git URL. Do not assume every later push deploys Render automatically; check the provider before backend changes. This finalization changes CI/documentation, not runtime application code.

## Repository structure

```text
.github/workflows/tests.yml     Push/PR verification
backend/
  app/main.py                  Routes, validation errors, CORS
  app/schemas.py               SI-unit request/response models
  app/rlc.py                   RLC mathematics, response, waveforms
  tests/test_rlc.py            Five backend tests
  requirements.txt
  .env.example
frontend/
  src/App.jsx                 State, requests, save/load/export
  src/components/             Schematic, controls, plots, measurements, labs
  src/services/simulationApi.js
  src/App.test.jsx            Five real-API DOM integration tests
  src/testSetup.js
  src/main.jsx
  src/styles.css
  index.html
  package.json
  package-lock.json
  vite.config.js
  vercel.json
  .env.example
render.yaml
README.md
SPEC.md
REVIEW.md
REFLECTION.md                  Student-owned reflection (content preserved)
prompt_log.md                  Original prompt and recorded continuations
DEMO_SCRIPT.md                 90–120 second recording plan
DEMO_AND_SUBMISSION.md         Checklist and deployment notes
```

## Known limitations

Ideal sinusoidal steady state and resistor output only: no transients, parasitics, tolerances, inductor resistance, arbitrary circuits, or non-sinusoidal sources. The scope is a labeled slow scan at 0.25 display cycles/s, not physical real-time acquisition. Sweep animation scans calculated data rather than measuring hardware. Backend availability is required; cold starts can exceed the 15-second deadline. Automated DOM tests do not establish physical-hardware accuracy or comprehensive browser graphics, mobile, or accessibility coverage.

## Student-authored introduction and personal notes

The introduction above is an AI-assisted factual description. These personal statements need the student's own words and have not been fabricated:

- **Introduction in my own words:** student to supply and review.
- **Features I am personally proud of:** student to identify and explain.
- **My development experience:** student to describe actual decisions, challenges, and learning.
- **My AI usage summary:** known prompts identify Codex for implementation and technical finalization; see [prompt_log.md](prompt_log.md). The student must verify historical model names, separate ChatGPT usage, and their own coding contributions against actual records.

## Remaining assignment actions

- Complete the personal notes and independently write [REFLECTION.md](REFLECTION.md) using the assignment questions. The empty existing reflection was renamed without adding content.
- Review prompt-log completeness and identify any student-written code from actual records.
- Record/upload the deployed-app demo using [DEMO_SCRIPT.md](DEMO_SCRIPT.md), verify viewing permissions, and add the real video link here and to the portfolio if required. No recording or video URL is claimed.
- Check the actual CMU 15-114 Project 3 rubric and submit the assignment yourself. No course form has been submitted.
