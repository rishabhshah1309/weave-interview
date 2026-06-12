# PostHog QUILL Impact Dashboard — full-stack on Vercel

Frontend (`index.html`) + two serverless backends:
- `api/quill.py`  — computes the QUILL dataset LIVE from GitHub GraphQL over a rolling
  90-day window (cohort metrics, z-scores, enrichment). Falls back to an embedded,
  validated snapshot if `GITHUB_TOKEN` is missing or GitHub errors.
- `api/summary.js` — generates each manager summary live with Claude. Falls back to a
  precomputed summary if `ANTHROPIC_API_KEY` is missing.

The page always renders: it ships with the snapshot embedded and upgrades to live data
when the APIs respond. A badge shows "Live · computed from GitHub now" vs "Snapshot data".

## Deploy
```bash
cd "<this folder>"
npx vercel --prod        # first run: log in, accept defaults
```

## Enable live mode (env vars in Vercel → Project → Settings → Environment Variables)
- `GITHUB_TOKEN`       — a GitHub PAT with public-repo read (for live QUILL computation)
- `ANTHROPIC_API_KEY`  — for live Claude manager summaries
- `ANTHROPIC_MODEL`    — optional (default claude-haiku-4-5-20251001)
Then redeploy: `npx vercel --prod`

## How QUILL is computed (api/quill.py)
Cohort = the repo's active engineers (seeded from analysis; editable in META).
For each: merged PRs, feature/fix PR mix (conventional-commit titles), maintenance
(= merged-feat-fix), reviews given on others' PRs, and 30/60-day windows for velocity —
all via batched GraphQL `search(...){issueCount}`. Each signal is z-scored across the
cohort and scaled so 50 = team average; QUILL = mean of the five drivers
(Quality, Users, Impact, Leverage, Leadership). No LOC or commit counts are used.
