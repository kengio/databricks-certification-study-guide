# Contributing to the Databricks Certification Study Guide

Thanks for being here. This guide exists because someone open-sourced their exam notes — every PR you send keeps it useful for the next reader.

## Ground rules

- **The official Databricks exam guide PDFs are the source of truth.** If a claim in this guide conflicts with the current exam guide for a certification, Databricks wins. Always link the source for factual changes. The exam-guide PDFs are linked from each certification page on [databricks.com/learn/certification](https://www.databricks.com/learn/certification).
- **Be kind in reviews and issues.** This is a study aid for people about to take a stressful exam.
- **Small PRs are easier to merge than big ones.** If you're rewriting a whole section, open an issue first.

## What kinds of contributions are welcome

| Type | How to contribute |
| :--- | :--- |
| **Typo / link rot fix** | Open a PR directly. No issue needed. |
| **Factual correction** | Open a PR. Cite the Databricks docs or exam-guide PDF in the description. |
| **New practice question** | Open a PR adding it under the matching certification in `certifications/<cert>/resources/practice-questions/`. Follow the existing format. |
| **Topic-file expansion** | Open an issue first to align scope, then PR. |
| **New cheat sheet or worked example** | Open an issue first — these are higher-effort additions and we want to keep the set focused. |
| **Blueprint refresh** | When Databricks updates the exam guide for a certification, follow the [Currency Policy](#currency-policy) below. |
| **Translation** | Awesome — open an issue to coordinate (we don't want two people starting the same translation). |

## How to contribute

1. **Fork** the repo and clone your fork
2. **Create a branch** off `main` — name it descriptively (e.g., `fix/de-pro-q42-cdc`, `feat/genai-rag-walkthrough`)
3. **Make the change.** Run `markdownlint` on any file you touch (see [conventions](#conventions))
4. **Update `README.md` and `CLAUDE.md` if your change touches their content.** This is required — see [README & CLAUDE.md sync rule](#readme--claudemd-sync-rule)
5. **Commit** with a clear message. We use loose conventional-commit prefixes: `docs:`, `fix:`, `feat:`, `chore:`, `review(roundN):` for review passes
6. **Open a PR** against `main`. The PR template will prompt you for the relevant details
7. **Self-review in 3 rounds** before requesting a merge — see [3-round review workflow](#3-round-review-workflow)
8. **Squash-merge** when all three rounds pass. The PR title becomes the squashed commit message — keep it short and useful.

## 3-round review workflow

Every PR — including author-only PRs — is reviewed in **three distinct rounds** before squash-merging. Each round leaves a review comment and may trigger follow-up commits prefixed `review(roundN):`.

| Round | Focus | What's checked |
| :---: | :--- | :--- |
| **1 — Technical correctness** | Code, examples, links, syntax | Every PySpark/SQL snippet runs as written. Every internal link resolves. `markdownlint` passes on every modified file. No dead code blocks. |
| **2 — Factual / blueprint accuracy** | Sources, currency, exam alignment | Every factual change cites a Databricks doc or exam-guide PDF. New questions map to a current blueprint bullet. No claims about features that have been renamed, deprecated, or moved to GA/preview without a citation. |
| **3 — Style & conventions** | Structure, callouts, terminal sections | Topic-file ordering follows the conventions in [`CLAUDE.md`](./CLAUDE.md). Callouts use the standard types. Practice-question answers are foldable `> [!success]-` callouts. A/B/C/D on separate lines with two trailing spaces. |

You can request reviews from automated agents (e.g., a code-review agent for round 1, a senior-data-engineer agent for round 2, a style-focused agent for round 3) or from human reviewers. The point is the three-pass discipline, not who runs each pass.

Branch protection on `main` does **not** require approving reviews from another GitHub user, so a solo maintainer can self-review and merge. The three-round discipline is enforced through the PR template checklist — do not check the boxes unless each round actually ran.

## README & CLAUDE.md sync rule

Every PR that changes content **must** also update `README.md` and `CLAUDE.md` if those files describe the changed content.

| If your PR… | …then update |
| :--- | :--- |
| Adds a new certification | `README.md` (certs table, exam-at-a-glance), `CLAUDE.md` (Repository Structure, Certification Topic Folders) |
| Renames or restructures a topic folder | `CLAUDE.md` (Certification Topic Folders), the cert's `README.md` (Study Topics table) |
| Adds a new cheat sheet, interview-prep file, fundamental, code example, or appendix entry | `CLAUDE.md` (Shared Content section) |
| Changes domain weights, exam fee, duration, or question count | `README.md` (per-cert exam-at-a-glance) and the cert's `README.md` (Exam Overview + Mermaid pie) |
| Bumps the exam-guide version date for a cert | `README.md` (badge/date), `CHANGELOG.md`, the cert's `README.md` (Exam Overview) |
| Touches a file convention or layout rule | `CLAUDE.md` (Content Guidelines) |

The PR template has a checkbox for this. Reviewers will block merges that touch content without the matching `README.md` / `CLAUDE.md` update.

## Currency Policy

When Databricks updates the exam guide for any certification:

- Update the exam-guide version date in the cert's `README.md` Exam Overview table
- Update any domain weights that changed (Mermaid pie + Study Topics table)
- Update the "What changed in the latest blueprint" callout at the top of that cert's `README.md`
- Update the matching cert row in the top-level `README.md` certifications table
- Add an entry to [`CHANGELOG.md`](./CHANGELOG.md) describing the refresh
- Mark new practice questions targeting the updated skills with a `*(YYYY blueprint)*` suffix in the question heading

Always cite the new exam-guide PDF URL in the PR description so reviewers can verify.

## Conventions

All conventions are documented in [`CLAUDE.md`](./CLAUDE.md). The highest-impact ones:

### File layout

- Topic files live under `certifications/<cert>/<NN-topic>/NN-sub-topic.md`
- Code examples are `.md` files under `shared/code-examples/python/` or `shared/code-examples/sql/` — never `.py` or `.sql`
- Topic-folder index files are `README.md`
- Always use `./README.md` for local READMEs — bare `README.md` resolves ambiguously in Obsidian

### Topic-file structure

Every topic file opens with this pattern:

1. YAML frontmatter
2. `# Title`
3. `## Overview` (1–3 sentences)
4. `> [!abstract]` callout (2–4 bullets)
5. `> [!tip] What the Exam Tests` callout (2–4 bullets)
6. `---` separator
7. First `##` content section

And ends with these terminal sections in this exact order:

1. `## Use Cases`
2. `## Common Issues & Errors`
3. `## Best Practices` *(optional)*
4. `## Exam Tips`
5. `## Key Takeaways`
6. `## Related Topics`
7. `## Official Documentation`
8. `---` separator + navigation link

### Practice questions

- A/B/C/D on separate lines (no bullets), two trailing spaces for line breaks
- Answer in an Obsidian foldable `> [!success]- Answer` callout
- Explanation teaches the **why**, not just confirms the letter
- Mark questions targeting the latest blueprint refresh with `*(YYYY blueprint)*` in the heading
- Per-domain target: 15–20 questions; difficulty mix: ~30 % Easy, ~50 % Medium, ~20 % Hard

### Callouts

Use Obsidian-flavoured callouts (also render on GitHub). Standard types:

| Callout | Usage |
| :--- | :--- |
| `> [!info]` | Section intros, neutral context |
| `> [!tip] What the Exam Tests` | Top-of-file orientation |
| `> [!tip] Exam Tips` | Exam advice in the terminal Exam Tips section |
| `> [!warning] Common Mistake` | Gotchas |
| `> [!note]` | Extra detail, caveats |
| `> [!success]- Answer` | Foldable practice-question answers |
| `> [!abstract]` | Top-of-file summary |

### Diagrams

- Architecture and flow → Mermaid (`sequenceDiagram`, `flowchart`, `graph`)
- Directory trees → ASCII text (not Mermaid)
- Both GitHub and Obsidian render Mermaid natively

### Markdown

- Run `markdownlint` on every modified file
- Blank lines before/after headings (MD022)
- Language tags on all code blocks (`sql`, `python`, `scala`, `bash`, `yaml`)
- Multi-line Python: parenthesised expressions, not backslash continuations

## What to do if you find a bug in the practice questions

This is the most exam-impactful category. Please:

1. **Cite the Databricks docs page** that supports your correction
2. **Note any cheat-sheet / topic-file / mock-exam locations** that contain the same error (we want them all fixed in one PR)
3. **Re-frame the question** if possible — sometimes a wrong answer is salvageable by reframing the scenario, which preserves the question variety

## Reviews

- One or two-line PRs (typos, link fixes) typically merge same-day after a single review pass
- Larger PRs go through all three review rounds before merge
- We optimise for **factual accuracy** and **exam relevance** over stylistic preference

## Code of conduct

Be kind, assume good intent, focus on the work. No tolerance for harassment of any kind.

## License

By contributing, you agree your contribution is released under the [MIT License](./LICENSE) that covers the rest of the project.

---

If something is unclear about contributing, [open an issue](https://github.com/kengio/databricks-certification-study-guide/issues/new) and we'll iterate on this guide.
