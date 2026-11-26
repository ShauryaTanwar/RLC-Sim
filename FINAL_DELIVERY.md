# Resonance Studio — Final Delivery Record

**Audit date:** November 26, 2026  
**Course:** CMU 15-114 Project 3: Capstone 2  
**Deadline:** December 2, 2026, 11:59 PM

This file records repository and CI evidence observed during the November 26 audit. It does not claim that the student's personal writing, video, form submission, or oral exam is complete.

## Public project links

- Live app: https://resonance-studio-six.vercel.app/
- Backend health: https://resonance-studio-api.onrender.com/api/health
- Source: https://github.com/ShauryaTanwar/RLC-Sim
- Portfolio: https://shauryatanwar.github.io/Personal-Website/#projects

## RLC-Sim repository

Latest audited `main` commit:

- SHA: `6b4b9dca13a614592c460208946c7b74a96c391e`
- Message: `Record verified CI and portfolio deployment results`
- GitHub Actions: [run #5 — completed/success](https://github.com/ShauryaTanwar/RLC-Sim/actions/runs/45789026306)

Both workflow jobs succeeded for that exact commit.

| Job | Observed steps |
|---|---|
| Backend | Python setup, requirements installation, `pytest -q` |
| Frontend | Node/Python setup, dependency installation, FastAPI startup/health check, `npm test`, `npm run build` |

The latest run's backend and frontend jobs were both completed with success. The workflow's failure-diagnostics step was skipped because no failure occurred.

### Commit history observed

| Commit (short SHA) | Message | Author date (UTC) |
|---|---|---|
| `89395c6` | first build | 2026-11-26 07:48 |
| `ee07e50` | Document verified deployments and prepare submission checklist | 2026-11-26 08:31 |
| `026e18e` | Improve CI timeouts and API failure diagnostics | 2026-11-26 08:52 |
| `bff67fe` | Finalize technical documentation and deployed demo preparation | 2026-11-26 09:02 |
| `6b4b9dc` | Record verified CI and portfolio deployment results | 2026-11-26 09:07 |

These are five genuine commits, all on November 26 within approximately 80 minutes. They show several implementation/finalization steps, but they do not by themselves demonstrate work distributed throughout the full project period or prove eight hours of effort. Do not fabricate or backdate commits. Continue committing meaningful work as it actually happens.

## Portfolio integration

The Resonance Studio card is present in `Personal-Website/data.js`, with a local SVG preview at `assets/resonance-studio-preview.svg`. Existing project entries were retained. The project is mapped to Python, JavaScript, React, and Git.

The portfolio workflow repair commit:

- SHA: `b5d607c3b0d4d0620412b95ae2278d7aac4ca06a`
- Message: `Separate Pages build and deployment artifact handoff`

Observed successful GitHub Pages runs:

- [Push run #508 — success](https://github.com/ShauryaTanwar/Personal-Website/actions/runs/45788631735)
- [Scheduled run #509 — success](https://github.com/ShauryaTanwar/Personal-Website/actions/runs/45848178345)

Both build and deploy jobs succeeded in those runs. The current portfolio branch tip subsequently advanced to `e13b2e319374c8827363ebf5e4dc493c7aa32c2e`, an automated Spotify snapshot update. No Pages run for that exact bot-generated commit was observed in this audit; the Resonance Studio project-card code was included in the successful Pages deployment at `b5d607c`.

## Documentation status

| File | Status |
|---|---|
| `README.md` | Technical reference present; student-authored overview, proud features, and AI summary remain to be written |
| `prompt_log.md` | Original implementation/finalization prompts retained; current audit prompt and tools appended; student must verify missing historical prompts/models/contributions |
| `SPEC.md` | Present and describes the implemented technical contract |
| `REVIEW.md` | Present with source review, test methodology, CI and deployment evidence |
| `DEMO_SCRIPT.md` | Present; 110-second deployed-app walkthrough plan |
| `DEMO_AND_SUBMISSION.md` | Present and updated with current run evidence |
| `REFLECTION.md` | Empty by design; student must write it independently |

## Remaining student actions

1. Complete the student-authored README sections in your own words.
2. Verify `prompt_log.md` against actual Codex and ChatGPT history. Add any missing important prompts verbatim, exact model names where known, and an accurate description of which code you personally wrote or substantially modified.
3. Identify and understand at least one substantial code section that you personally wrote or meaningfully modified. The current repository record does not establish a specific student-authored source section. If you have not yet made such a contribution, make a genuine one and be prepared to explain it.
4. Independently write `REFLECTION.md` (250–750 words) without AI assistance. Do not ask AI to draft, outline, edit, translate, or polish it.
5. Record the deployed-app demonstration using `DEMO_SCRIPT.md`, upload it to an approved destination, verify link permissions, and add the actual video URL.
6. Complete the CMU project submission form with the repository and video links. No form has been submitted by this audit.
7. Prepare for the in-person oral exam and be able to explain the RLC equations, React/FastAPI architecture, error handling, testing, and your own code contribution.

## Verification limits

This audit verified GitHub repository contents, commit metadata, and Actions run/job status. It did not rerun local tests, record a video, submit the course form, or conduct a full automated browser interaction/responsive-layout test. Earlier technical verification details are recorded in `REVIEW.md`.
