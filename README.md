# Resonance Studio

> README scaffold generated with Codex. **TODO (student): write and review the final README in your own words.** Technical commands below describe the implementation; narrative, screenshots, and submission links still need your review.

TODO (student): describe your project, intended audience, and what you learned building it.

## Public application

- Frontend: https://resonance-studio-six.vercel.app
- API health: https://resonance-studio-api.onrender.com/api/health
- Repository: https://github.com/ShauryaTanwar/RLC-Sim
- Successful CI run: https://github.com/ShauryaTanwar/RLC-Sim/actions/runs/45778088208
- Demonstration preparation and submission checklist: [DEMO_AND_SUBMISSION.md](DEMO_AND_SUBMISSION.md)

Hosted on Vercel Hobby and Render Free. Render may take 50 seconds or more to wake after inactivity; use Retry connection once it is awake. Only the production frontend origin is allowed by CORS; preview deployment origins are not enabled.

## Run locally

Prerequisites: Python 3.12 and Node.js 22.12+ (or Node 24).

From the repository root, create and install the backend environment:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open the URL printed by Vite (normally http://127.0.0.1:5173). Vite forwards `/api` to the backend during development. On macOS/Linux use `.venv/bin/python` in place of `.venv\Scripts\python.exe`.

On a fresh machine, install Python 3.12 and create the virtual environment before running these commands.

## Verify

```powershell
cd backend
..\.venv\Scripts\python.exe -m pytest -q
cd ../frontend
npm test
npm run build
```

Keep the backend running for `npm test`: these five DOM interaction tests use the actual HTTP API (override `TEST_API_BASE_URL` to test another local service). They verify controls, request ordering, sweep completion, storage, error recovery, and all three guided labs. Plotly drawing is replaced by an inspectable trace surface in DOM tests, so these do not verify browser rendering.

GitHub Actions runs five backend tests, five frontend integration tests, and the frontend build on push and pull request. Backend API documentation is available at http://127.0.0.1:8000/docs while the server runs.

## Architecture facts to review

- `frontend/`: React, JavaScript, CSS, Vite, SVG schematic, Plotly.js charts, Lucide icons.
- `backend/app/rlc.py`: ideal series RLC mathematics, logarithmic sweep, sinusoidal steady-state waveforms.
- `backend/app/schemas.py`: Pydantic request/response schemas; all API quantities use SI units.
- `backend/app/main.py`: FastAPI health and simulation endpoints with configurable CORS.
- Debounced requests cancel stale work. Failed API calls display errors; no synthetic fallback data.
- Exactly three guided experiments verify actual results. Completed labs and one saved configuration persist in browser storage.
- This is an ideal circuit model. It does not model transients, parasitics, inductor resistance, or component tolerances.

TODO (student): explain the equations, design decisions, and important limitations in your own words. See `SPEC.md` for implementation facts.

## Deploy the backend to Render

1. Push the reviewed project to the GitHub repository. Select the Free instance type before deployment.
2. In Render, create a Blueprint from the repository using `render.yaml`, or create a Python web service with root directory `backend`.
3. Build command: `pip install -r requirements.txt`.
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
5. Set `ALLOWED_ORIGINS` to the exact Vercel frontend origin, e.g. `https://your-project.vercel.app`. For multiple origins, use a comma-separated list without trailing slashes.
6. Check `https://YOUR-BACKEND/api/health` returns `{"status":"ok","service":"resonance-studio"}`.

## Deploy the frontend to Vercel

1. Import the GitHub repository into Vercel; select **frontend** as the root directory and Vite as the framework.
2. Set `VITE_API_BASE_URL` to the backend origin (e.g. `https://YOUR-BACKEND.onrender.com`), without a trailing `/api`.
3. Use `npm run build` and output directory `dist` (also declared in `frontend/vercel.json`).
4. Deploy, update Render's `ALLOWED_ORIGINS` to the resulting frontend origin, and verify a simulation from the deployed frontend.
5. Changing `VITE_API_BASE_URL` requires a new frontend build. Render cold starts can cause the first request to time out; retry when the service wakes.

Do not deploy a frontend with an empty API base unless the hosting platform also routes `/api` to the real backend. The Vite development proxy is not included in production.

The public application and repository links above were verified on November 26, 2026. Add the demonstration video and portfolio links after they are published.

## Assignment deliverables

- [ ] TODO: write and review this README.
- [x] Confirm the public GitHub repository and successful Actions run.
- [x] Deploy frontend/backend and add the working demonstration link.
- [ ] TODO: record and link the demonstration video.
- [ ] TODO: write and link your portfolio entry.
- [ ] TODO: independently write `reflection.md` using the actual assignment questions.
- [ ] TODO: review `prompt_log.md` and append subsequent prompts actually used.

`prompt_log.md` begins with the exact original implementation prompt. `reflection.md` is intentionally empty; the assignment questions were not supplied, and no reflection content has been generated.

## Deployment verification — November 26, 2026

- Vercel production deployment succeeded using `frontend`, Vite, `npm run build`, and `dist`.
- Render Free backend deployed with Python 3.12.8 and `/api/health` returned the expected status JSON.
- `VITE_API_BASE_URL=https://resonance-studio-api.onrender.com`; `ALLOWED_ORIGINS=https://resonance-studio-six.vercel.app`. Render logs showed successful OPTIONS and POST requests.
- Public browser verification: engine connected; real oscilloscope, magnitude, and phase plots rendered.
- Default measurements: resonance 159.15 Hz, impedance 10 Ω, current 500 mA, resistor voltage 5 V RMS, phase 0°.
- Changing R to 20 Ω produced Q 0.50, bandwidth 318.31 Hz, and current 250 mA at resonance.
- All three guided experiments completed in the public browser; progress persisted after reload. C = 200 µF produced 112.54 Hz; then L = 20 mH produced 79.58 Hz.
- GitHub Actions run #1 for `89395c6` succeeded: backend and frontend jobs both passed. Action-runtime deprecation warnings remain; no CI failures were observed.
- Responsive/mobile checks, graph hover/click behavior, CSV export, and full sweep completion were not verified in this deployment session.
- No new commits or pushes were made in this deployment session. Demo video is not recorded or uploaded. Reflection was not modified.

## Historical implementation verification record

Verified locally on November 24, 2026:

- Backend: **5 passed** (one dependency deprecation warning from Starlette/AnyIO).
- Frontend: **5 passed**, using the actual running FastAPI backend. Plotly drawing is stubbed only within DOM tests.
- Production frontend build: **passed**. The separate Plotly bundle is approximately 377 kB gzipped and triggers Vite's large-chunk advisory.
- Vite-to-FastAPI proxy POST: **passed**. Default operating point: f₀ 159.154943 Hz, |Z| 10 Ω, I 0.5 A RMS, Vᴿ 5 V RMS, gain 0 dB, phase 0°.
- CORS preflight for the local frontend origin: **passed**.
- Initial prompt: retained verbatim as the first prompt-log entry. Reflection: zero bytes.
- Browser visual verification: **not completed**; browser connection unavailable and native Chrome access request timed out. Responsive layout and real Plotly browser rendering need a visual check before submission.
- At that earlier verification stage, GitHub Actions had not run remotely and deployment had not been performed. See the newer deployment record above.
