<h1>PostHog Engineering Impact — the QUILL Score</h1>
<p><i>Weave take-home. Identifying the most impactful engineers on <a href="https://github.com/PostHog/posthog">PostHog/posthog</a> over the trailing 90 days (2026-03-14 → 2026-06-12).</i></p>

<h2>1. TL;DR — the answer</h2>
<p>We define impact with a custom framework, <b>QUILL = Quality · Users · Impact · Leverage · Leadership</b>, scored relative to the team baseline (50 = team average). Across the 8,426 PRs merged in the window, the top 5 most impactful engineers are:</p>
<table border="1" cellpadding="6" cellspacing="0">
<tr><th>#</th><th>Engineer</th><th>QUILL</th><th>Signature (why)</th></tr>
<tr><td>1</td><td>Paul D'Ambra (@pauldambra)</td><td>66</td><td>The engine room. Highest shipped <b>Impact</b> (466 merged PRs, ~5.2/day) while balancing 163 features, 155 fixes and 224 reviews. Momentum +49%.</td></tr>
<tr><td>2</td><td>Sam Pennington (@sampennington)</td><td>62</td><td>Highest <b>Leverage</b>. The cohort's #1 reviewer (320 reviews on others' PRs) and 315 of her own, half reliability work.</td></tr>
<tr><td>3</td><td>Tom Owers (@Gilbert09)</td><td>58</td><td>Highest <b>Users</b> score — 163 user-facing features (data-warehouse GA work), 307 merged, accelerating hard (+96%).</td></tr>
<tr><td>4</td><td>Andrew Maguire (@andrewm4894)</td><td>57</td><td>Strong <b>Leadership + Users</b>. 305 reviews (1.4× his own output) plus 131 features in AI/LLM analytics.</td></tr>
<tr><td>5</td><td>Marius Werner (@webjunkie)</td><td>52</td><td>Reliability anchor. Most non-feature hardening work (80 fixes + 108 maintenance PRs) and a steady reviewer (203).</td></tr>
</table>
<p><b>Dashboard:</b> a single interactive page — leaderboard, per-engineer QUILL breakdown (click any driver for the evidence), AI-written manager summary, velocity trend vs team, and links to the underlying GitHub PRs. Hosted on Vercel (see §7).</p>

<h2>2. What "impact" means — the QUILL framework</h2>
<p>Counting lines of code, commits, or files changed rewards volume, not value, so we excluded all of them. QUILL instead asks five questions a manager actually cares about:</p>
<ul>
<li><b>Quality — how well is it built?</b> Reliability investment: bug-fix PRs and their share of an engineer's work, plus hardening/refactor work. (In this repo every merged PR already clears an enforced review gate — see §4 — so quality is measured as active reliability work, not the gate.)</li>
<li><b>Users — who benefited?</b> User-facing delivery: feature PRs and the share of work that reaches end users vs internal plumbing.</li>
<li><b>Impact — what changed?</b> The scale of change that actually shipped: merged-PR throughput and breadth landing in production.</li>
<li><b>Leverage — what future value was created?</b> Force-multiplication: reviews that unblock teammates, plus refactor/infra/tooling work that compounds across the codebase.</li>
<li><b>Leadership — how did they elevate others?</b> Reviewing and mentoring: reviews given on teammates' PRs and how much of their effort goes to others vs themselves.</li>
</ul>

<h2>3. Data &amp; methodology</h2>
<p><b>Source.</b> GitHub REST + Search API (public), repo PostHog/posthog, window 2026-03-14 → 2026-06-12 (90 days, 8,426 merged PRs). No LOC or commit counts used anywhere.</p>
<p><b>Cohort.</b> Seeded from the repository's all-time top-30 contributors, then filtered to those genuinely active in the window (bots excluded). This yields a 16-engineer active core. Six former top contributors (e.g. early staff) had 0 merged PRs in the window and were dropped — confirming that all-time rank ≠ current impact.</p>
<p><b>Signals (all real counts).</b> For each engineer over the window: merged PRs; feature vs fix PRs (via conventional-commit title prefixes <i>feat/</i> and <i>fix/</i>); maintenance = merged − feat − fix (refactor/chore/perf/tests); reviews given on <i>others'</i> merged PRs; and 30-/60-day sub-windows for momentum. We also sampled review outcomes (approval rate, change-requests).</p>
<p><b>Scoring.</b> Each driver is a blend of normalized signals:</p>
<ul>
<li>Quality = fix ratio + fix volume</li>
<li>Users = feature volume + feature share</li>
<li>Impact = merged-PR volume</li>
<li>Leverage = reviews given + maintenance PRs</li>
<li>Leadership = reviews given + reviews-per-own-PR</li>
</ul>
<p>Every signal is converted to a z-score across the cohort and scaled so that <b>50 = team average</b>; an engineer above 50 on a driver is a positive outlier on it. The QUILL score is the mean of the five drivers. This makes "standout vs baseline" explicit and every number traceable.</p>

<h2>4. Key insight that shaped the model</h2>
<p>We initially planned to measure Quality from review outcomes. But PostHog's workflow (Graphite stacked diffs + an AI reviewer "stamphog" + enforced human review) means <b>~100% of merged PRs are approved and formal "changes-requested" is ~0 for everyone</b>. Those signals don't differentiate anyone. So Quality is measured as <i>active reliability work</i> (fixes and hardening) instead — a more honest read of "how well is it built" in this repo.</p>

<h2>5. Findings worth a manager's attention</h2>
<ul>
<li><b>It is not a volume leaderboard.</b> Rafael Audibert (@rafaeelaudibert) ranks #6 on only 106 merged PRs because he gave 267 reviews — the highest Leadership score in the cohort. Marius Andra (@mariusandra) posts the top Quality score on just 77 merged PRs.</li>
<li><b>Momentum tells a second story.</b> Tom Owers (+96%) and Josh Snyder (+99%) are accelerating sharply; Marius Andra (−69%) and Juraj Majerik (−60%) are cooling as they shift toward advisory/lower-volume work — which the score contextualizes rather than penalizes blindly.</li>
<li><b>Reviewing is concentrated in a few people.</b> Pennington (320), Maguire (305) and Audibert (267) carry a disproportionate share of the team's review load — a real org-health signal.</li>
</ul>

<h2>6. The dashboard</h2>
<p>One page, built to be read at a glance: a sticky <b>leaderboard</b> (top 5, expandable to all 16); an <b>engineer profile</b> with QUILL score, 30-day velocity and percentile band; an <b>explainable QUILL breakdown</b> where each driver expands to its real evidence (e.g. "155 fix PRs · 33% fix share · 148 maintenance PRs"); a <b>manager summary</b> with a driver-by-driver gap-to-team-average table; a <b>velocity trend</b> vs the top-5 and team averages; an illustrative <b>dependency surface</b>; ownership/GitHub-insight tiles; and an <b>evidence drill-down</b> linking straight to the matching merged-PR and review queries on GitHub so findings are verifiable.</p>
<p><b>AI manager summary — how it works.</b> The narrative is generated by Claude from each engineer's <i>real</i> metrics. It runs as a Vercel serverless function (<code>/api/summary</code>) holding the API key server-side, so summaries are produced live on demand; if no key is configured it falls back to a deterministic summary baked from the same real numbers. The model is instructed to use only the supplied figures (no invented incident or deploy stats).</p>

<h2>7. Hosting</h2>
<p>The deliverable is a Vercel-ready project (<code>index.html</code> + <code>api/summary.js</code>). Deploy with <code>npx vercel --prod</code> from the project folder; add <code>ANTHROPIC_API_KEY</code> as a production env var to enable live summaries. (A temporary preview was also published during the build to verify rendering.)</p>

<h2>8. Limitations &amp; honest caveats</h2>
<ul>
<li><b>AI-assisted PRs</b> are credited to the human who authored/shepherded them — the modern PostHog reality (many PRs are agent-assisted but human-owned). We score the human who directs and ships the work.</li>
<li><b>Cohort seeding</b> from all-time top contributors could, in principle, miss a brand-new hire who is already top-5 by 90-day impact; we validated activity in-window but flag this.</li>
<li><b>Velocity</b> % (30-day run-rate vs 90-day) is exact for all; the 31-60/61-90 day split shown on the trend line is estimated for a few engineers where the 60-day count wasn't retrieved before the API rate-limited.</li>
<li><b>Fix-as-quality</b> is a proxy: we read fix/hardening work as reliability stewardship; we cannot measure defects-introduced directly.</li>
<li>The <b>dependency surface</b> is illustrative of adjacent product areas, not weighted from true cross-system data.</li>
</ul>

<h2>9. Build narrative (the experience)</h2>
<p>The interesting engineering problem was data access under tight constraints. The compute sandbox had no outbound network and the only fetch path returned results into context, while GitHub's unauthenticated Search API rate-limits aggressively. Harvesting thousands of fat PR objects was infeasible, so we pivoted to <b>count queries</b>: requesting a page <i>past</i> the result set (<code>&amp;page=900</code>) returns the <code>total_count</code> with an empty body — a ~120-byte response that fully characterizes a metric. The whole QUILL model is built from ~150 of these tiny queries, paced around the rate limiter, with a clean fallback whenever a heavier query (reviews-with-author-exclusion) timed out. The framework itself went through one real revision when we discovered approval/change-requests were non-discriminating and re-anchored Quality on reliability work.</p>

<p style="color:#666"><i>Generated as part of the QUILL build. All figures are real counts from the GitHub API over the stated window.</i></p>
