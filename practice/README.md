---
title: Adaptive Practice Questions
type: index
tags:
  - practice
  - quiz
  - adaptive
status: published
---

# Adaptive Practice Questions

A browser-based quiz for the practice-question markdown files in this repo. Tracks your attempts in `localStorage` and surfaces questions you've gotten wrong recently (adaptive mode), without sending anything to a server.

## What this is

- **A static web page**: `index.html` + `app.js` + `styles.css` + `data/*.json` — no backend, no build step beyond the JSON converter.
- **Adaptive**: by default the question selector weights toward never-attempted + recently-wrong questions, so re-running the quiz quickly converges on what you don't yet know.
- **Per-cert localStorage state**: your progress for each certification is kept independently. No cross-device sync — `Export progress (JSON)` downloads it if you want to back it up or move it.
- **Source: the existing practice-question markdown files** — no parallel content to maintain. When the practice-question files change, re-run the converter and the bank refreshes.

## Available banks

**18 banks · 931 questions total** — every cert has practice questions plus two full-length mock exams.

### Practice questions (6 banks · 364 questions)

Topic-organised question sets sourced from each cert's `practice-questions/` folder. Best for drilling a specific domain.

| Bank | Source | Q |
| :--- | :--- | :---: |
| Data Engineer Associate | `certifications/data-engineer-associate/resources/practice-questions/` | 85 |
| Data Engineer Professional | `certifications/data-engineer-professional/resources/practice-questions/` | 73 |
| Data Analyst Associate | `certifications/data-analyst-associate/resources/practice-questions/` | 57 |
| ML Associate | `certifications/ml-associate/resources/practice-questions/` | 46 |
| ML Professional | `certifications/ml-professional/resources/practice-questions/` | 57 |
| GenAI Engineer Associate | `certifications/genai-engineer-associate/resources/practice-questions/` | 46 |

### Mock exams (12 banks · 567 questions)

Full-length exam-feel sets sourced from each cert's `mock-exam/` and `mock-exam-2/` folders. Each is a single `questions.md` covering every domain. Best for end-to-end timing practice.

| Cert | Mock 1 | Mock 2 |
| :--- | :---: | :---: |
| Data Engineer Associate | 45 | 45 |
| Data Engineer Professional | 63 | 60 |
| Data Analyst Associate | 45 | 45 |
| ML Associate | 43 | 44 |
| ML Professional | 45 | 45 |
| GenAI Engineer Associate | 45 | 42 |

## How to run

### Live version

**▶ [https://kengio.github.io/databricks-certification-study-guide/](https://kengio.github.io/databricks-certification-study-guide/)**

Deployed automatically from `main` whenever anything in `practice/` changes. No install, no clone — open the link and start drilling.

### Local

```bash
# 1. Generate / refresh the JSON banks (only needed when markdown changes)
python3 practice/build.py

# 2. Serve the practice/ folder. The `fetch` calls require an HTTP origin,
#    not file://, so use any static server:
python3 -m http.server 8080 --directory practice
# Then open http://localhost:8080/
```

> [!tip]
> Opening `practice/index.html` directly via `file://` won't work because browsers block `fetch()` for local files. Always use a static server (or GitHub Pages).

### Deploy (for fork maintainers)

The deploy is driven by [`.github/workflows/deploy-practice.yml`](../.github/workflows/deploy-practice.yml). It runs on every push to `main` that touches **any of**:

- `practice/**` (the quiz app itself)
- `certifications/**/practice-questions/**` (source markdown for practice banks)
- `certifications/**/mock-exam/**` or `mock-exam-2/**` (source markdown for mock banks)
- `.github/workflows/deploy-practice.yml`

The workflow:

1. Checks out the repo
2. **Re-runs `python3 practice/build.py`** so `practice/data/*.json` is rebuilt fresh from current cert markdown — even if the author forgot to regenerate locally
3. Uploads `practice/` as a Pages artifact (with `.nojekyll` so HTML/JS pass through unmodified)
4. Deploys via `actions/deploy-pages@v4`

**This means**: edit a question in `certifications/<cert>/resources/practice-questions/*.md` (or any mock-exam file), commit, push to `main`, and the live site updates within ~1 min. No need to run `build.py` locally before pushing — the committed JSON is just a convenience for local dev / quick PR review, not the source of truth at deploy time.

**First-time setup** (only needed once per fork):

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → **Source: GitHub Actions**
3. Push any change under `practice/` to `main` (or trigger the workflow manually via Actions → "Deploy practice quiz to GitHub Pages" → Run workflow)
4. After ~1 min, the live URL is shown on the workflow run page and in repo Settings → Pages

The published site lives at `https://<user>.github.io/<repo>/` (no `/practice` suffix because the workflow uploads `practice/` as the artifact root).

## Modes

| Mode | When to use |
| :--- | :--- |
| **Adaptive** (default) | Day-to-day study. The selector down-weights questions you've recently answered correctly and up-weights ones you've recently missed or never attempted. |
| **Random** | Mock-exam vibe — uniform sampling across the bank, ignoring history. Good for occasional gauges of where you stand. |
| **Sequential** | Walk through every question in source-file order. Useful when prepping a specific domain end-to-end. |

You can also filter by **Domain** and **Difficulty** in the Settings panel.

## Adaptive selector — exactly what it does

For each question in the filtered pool, the weight is:

```text
never attempted                            → 10  (highest)
last attempt CORRECT,   N days ago         → min(5, 0.5 + N * 0.3)
last attempt INCORRECT, N days ago         → max(3, 8 - N * 0.3)
```

So:

- A question you've never seen has weight `10` — it'll surface fast.
- A question you just got wrong has weight `8` — heavy priority, but decays over time so it doesn't dominate forever.
- A question you just got right has weight `0.8` — almost ignored, but rises as days pass so you do re-review eventually.

A weighted random pick chooses the next question. After a full pass through the filtered pool, the "seen this session" set clears so you don't get stuck on the same dozen questions.

## Privacy

- All state lives in your browser's `localStorage` under keys like `dbx-practice-data-engineer-associate`.
- Nothing is sent to a server — there's no server.
- Clearing browser storage or using a different browser / device wipes progress. The **Export progress (JSON)** button lets you back it up.
- Importing progress isn't built yet; if you need it, open an issue.

## Files in this folder

| File | Purpose |
| :--- | :--- |
| `index.html` | App skeleton, branded header with checkmark badge, favicon |
| `app.js` | Quiz logic, adaptive selector, localStorage, stats, theme cycle |
| `styles.css` | Minimal styling with theme variables (auto / light / dark) |
| `favicon.svg` | Browser tab icon (also displayed in the page header) |
| `build.py` | Markdown → JSON converter (Python 3.9+ stdlib only) |
| `data/<cert>.json` | Generated question banks (committed so the static page Just Works) |
| `format.md` | Markdown source format spec that `build.py` parses |
| `README.md` | This file |

## Theme

The page ships with three theme states: **auto** (follows your OS dark-mode preference), **light**, and **dark**. The button in the top-right of the header cycles through them. Your choice is saved in `localStorage` and applied immediately on every visit.

## Adding a cert to the bank

The parser supports three heading formats, all with the same body shape (choices + answer callout):

```markdown
# Format A — difficulty in body
## Question 5: Brief title

**Question** *(Easy|Medium|Hard)*: Stem text.

# Format B — difficulty between number and colon
## Question 5 *(Medium)*: Brief title

**Question**: Stem text.

# Format C — difficulty appended to title
## Question 5: Brief title *(Medium)*

Stem text (or `**Question**: Stem text.`).
```

Choices + answer callout (identical across all three formats):

```markdown
A) First choice
B) Second choice
C) Third choice
D) Fourth choice

> [!success]- Answer
> **Correct Answer: B**
>
> Short answer paragraph.
>
> Explanation paragraph(s).

---
```

To add a new cert (e.g., a future Databricks cert):

1. Make sure every question in the practice-question files uses one of the three formats above with all four `A) B) C) D)` choices and a `**Correct Answer: <letter>**` line inside the answer callout.
2. Run `python3 practice/build.py --cert <cert-id>` and check the parsed count.
3. Add a row to "Available banks" above.
4. Add the cert to the `KNOWN_BANKS` list at the top of `app.js`.
5. Add a tuple to `CERT_TITLES` in `build.py` (display name + blueprint version).
6. Open a PR.

A handful of questions where a choice contains a multi-line code block are skipped (the parser sees the bare `A)` / `C)` line with no inline content). If that affects your bank, restructure the choice to inline the code or move the code block into the answer explanation.

## Contributing

PRs welcome for: more cert banks, UI improvements, additional adaptive strategies (e.g., SuperMemo-style intervals), accessibility fixes, mobile polish, server-sync of progress (optional, requires a backend).

## Caveats

- This isn't an official Databricks practice exam. It's static study material derived from the markdown files in this repo. Quality matches the quality of those files.
- The adaptive selector is a simple weighted-random heuristic, not a full spaced-repetition algorithm like SM-2 or FSRS. It's good enough for cert prep; if you want SM-2-level scheduling, use Anki (see [`anki/README.md`](../anki/README.md)).
- The 198 questions live alongside, not inside, the 12 mock-exam files (573 questions). The mocks remain the canonical end-to-end exam simulation; this practice app is for between-mock drilling.

---

**[← Back to repo root](../README.md)** | **[Format spec →](./format.md)**
