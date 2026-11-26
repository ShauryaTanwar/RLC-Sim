# Demonstration and submission preparation

Prepared November 26, 2026. This is a recording plan, not a completed video or student reflection. Check the actual assignment for its required duration, format, rubric, and submission destination; those instructions were not supplied in this session.

## Recording setup

Open https://resonance-studio-six.vercel.app and let Render wake before recording. Confirm “Simulation engine connected.” Use a clean browser profile if you want guided-lab progress to begin at zero; the verification profile has all three labs completed. Hide notifications and unrelated tabs. Test microphone audio and make a short trial recording. Do not expose account dashboards, email verification codes, or credentials.

## Suggested 4–5 minute walkthrough

| Time | Show | Explain |
| --- | --- | --- |
| 0:00–0:30 | Public URL and series circuit | An ideal sinusoidal steady-state series RLC lab; output is across R. |
| 0:30–1:10 | Default component values and measurements | R = 10 Ω, L = 10 mH, C = 100 µF, Vin = 5 V RMS. Resonance is about 159.15 Hz. Reactances cancel, so Z = R and current is 0.5 A RMS. |
| 1:10–1:50 | Oscilloscope; frequency and phase plots | At resonance, resistor output matches input, with 7.07 V peak and zero phase. Move the frequency away from resonance and explain the amplitude and phase change. |
| 1:50–2:25 | Increase R to 20 Ω, tune to resonance | Q falls to 0.50, bandwidth rises to 318.31 Hz, and current falls to 250 mA. |
| 2:25–3:20 | Guided experiments | Show a lab with a prediction, component adjustment, and verified completion. Starting a lab restores default circuit conditions. |
| 3:20–3:50 | Increase C to 200 µF, then L to 20 mH | Resonance falls to 112.54 Hz, then 79.58 Hz; demonstrate the inverse-square-root relationship. |
| 3:50–4:30 | Repository and green Actions run | React/Vite calls FastAPI; Python computes the results. Show tests and explain that DOM tests stub chart rendering, while browser verification checked actual plots. |
| 4:30–5:00 | Return to app | State limitations: ideal components, steady state, no transient solver or parasitics. |

Adapt the spoken explanation to your own understanding. Do not claim hours, personal learning experiences, or tests that were not actually performed.

## Before submission

- [x] Public repository: https://github.com/ShauryaTanwar/RLC-Sim
- [x] Public frontend: https://resonance-studio-six.vercel.app
- [x] Backend health: https://resonance-studio-api.onrender.com/api/health
- [x] Frontend/backend connection works with exact-origin CORS.
- [x] Successful GitHub Actions: https://github.com/ShauryaTanwar/RLC-Sim/actions/runs/45778088208
- [x] Production browser: component updates, measured values, plots, all three guided-lab completions, persisted progress.
- [ ] Review the final README in your own words as required by the project authorship instructions.
- [ ] Review prompt log for completeness against your actual earlier sessions; this session cannot reconstruct missing conversations.
- [ ] Check smaller-screen layout, graph inspection/click-to-tune, sweep completion, configuration save/load, and CSV export before recording if you intend to show them.
- [ ] Record video with audible explanation and readable text; watch the entire recording.
- [ ] Upload video to the assignment-approved destination, confirm viewer permissions, and add its link to README/portfolio.
- [ ] Write and publish the portfolio entry, then add its URL.
- [ ] Independently complete reflection.md using the actual assignment questions. No reflection content is provided here.
- [ ] Confirm exact course, deadline, duration requirements, and submission fields from the actual CMU Project 3 assignment.
- [ ] Submit required links/files through the course system and retain the confirmation.

## Deployment maintenance

Vercel is on Hobby and Render is on Free. Do not upgrade without approval. Render sleeps after inactivity, so allow a warm-up before a live demo. The backend was imported from a public Git URL; do not assume future pushes trigger Render deployment. Use the Render dashboard to deploy a reviewed commit when needed. Vercel is connected only to RLC-Sim. Preview origins are not included in CORS.

## Current status

The application is deployed. Video recording/upload, portfolio publishing, final student README review, independent reflection, and course submission remain outstanding. Local documentation changes from this finalization session require review and approval before commit/push.
