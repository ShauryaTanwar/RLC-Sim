# Demonstration and submission checklist

Updated November 26, 2026. Use [DEMO_SCRIPT.md](DEMO_SCRIPT.md) for the requested **90–120 second** deployed-app demonstration (110-second target). That script supersedes the earlier 4–5 minute suggestion. This file does not claim a completed video or student reflection.

## Technical preparation

- [x] Frontend: https://resonance-studio-six.vercel.app/
- [x] API health: https://resonance-studio-api.onrender.com/api/health
- [x] Repository: https://github.com/ShauryaTanwar/RLC-Sim
- [x] Local backend tests: 5 passed; frontend real-API integration tests: 5 passed; production build passed during this finalization.
- [x] Latest RLC-Sim push CI passed for commit [6b4b9dc](https://github.com/ShauryaTanwar/RLC-Sim/commit/6b4b9dca13a614592c460208946c7b74a96c391e): [Actions run #5](https://github.com/ShauryaTanwar/RLC-Sim/actions/runs/45789026306). Backend and frontend jobs both succeeded.
- [x] Portfolio project card, preview, and skill mappings are published: [portfolio](https://shauryatanwar.github.io/Personal-Website/#projects). Pages build/deploy passed in [push run #508](https://github.com/ShauryaTanwar/Personal-Website/actions/runs/45788631735) and [scheduled run #509](https://github.com/ShauryaTanwar/Personal-Website/actions/runs/45848178345).
- [x] Source-inspected architecture/calculation review: [REVIEW.md](REVIEW.md).
- [x] Reflection renamed to [REFLECTION.md](REFLECTION.md) without adding or changing its content.

## Student responsibilities

- [ ] Write the README introduction/personal notes in your own words and review the technical text.
- [ ] Independently write REFLECTION.md using the actual assignment questions.
- [ ] Verify prompt_log.md against actual earlier sessions: model names, ChatGPT/Codex use, missing prompts, and student code contributions. Do not invent history or hours.
- [ ] Rehearse the public app, allow Render to wake, and check legibility, chart interactions, and the selected guided experiment. Current-session browser graphics verification was unavailable; the earlier deployment record reported working real charts and labs.
- [ ] Record the 90–120 second walkthrough with audible explanation; watch the whole recording.
- [ ] Upload to an assignment-approved destination, test viewer permissions, and add the actual video URL to README/portfolio if required.
- [ ] Check the actual CMU 15-114 Project 3 rubric, deadline, file naming, and submission fields.
- [ ] Submit the required links/files yourself and retain confirmation. No CMU Google Form is submitted here.

## Deployment maintenance

The earlier deployment record reported Vercel Hobby and Render Free. Render cold starts can exceed the app's 15-second deadline; allow warm-up before recording and use Retry connection. Render was imported by public Git URL, so automatic deployment of later commits must not be assumed. Use the provider dashboard for runtime updates when needed. Vercel production origins are allowed by exact CORS; preview origins need explicit configuration. This finalization changes documentation/CI and portfolio content, not simulator runtime code.


## Additional ownership and evidence checks

- [ ] Identify at least one substantial section of code you personally wrote or meaningfully modified, and be ready to explain it. The current repository log does not establish which source section is yours.
- [ ] Continue genuine development/verification commits as work progresses. The five RLC-Sim commits currently visible are all from November 26 within about 80 minutes; do not create artificial or backdated commits.
- [ ] Complete the student-authored README sections; AI-generated technical reference is now clearly separated at the bottom.
- [ ] Review [FINAL_DELIVERY.md](FINAL_DELIVERY.md) for exact commit and workflow evidence.
