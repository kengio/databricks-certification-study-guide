# Translating This Study Guide

Thank you for considering a translation! Non-English study material is one of the highest-leverage things you can contribute back to the Databricks certification community.

## Supported languages (current)

| Language | Status | Location | Lead |
| :--- | :--- | :--- | :--- |
| **English** (source) | Complete | repo root | maintainer |
| **ภาษาไทย (Thai)** | In progress | [`i18n/th/`](./i18n/th/README.md) | maintainer |
| Other languages | Fork model | see [`i18n/README.md`](./i18n/README.md) | — |

**Scope today**: English is the canonical source. Thai is the only in-tree translation. Other languages are welcome via the fork model described below — we don't merge non-Thai translations into the upstream repo to keep the maintainer's review burden sustainable.

## Quick decision tree

```text
What do you want to do?
│
├─ Read in Thai
│  → Go to i18n/th/README.md
│
├─ Contribute Thai translations (improve existing or translate a new file)
│  → Open a PR on this repo modifying i18n/th/<corresponding-path>
│  → Follow the glossary at i18n/th/glossary.md
│
├─ Translate the guide into a language other than Thai
│  → Fork this repo → translate in your fork → submit a 1-line PR to add
│    your fork to i18n/README.md so others can find it.
│
└─ Found a typo or factual error in someone else's language fork?
   → Open an issue / PR on THEIR fork.
```

## Why Thai in-tree, others as forks?

Two reasons:

1. **Maintainer fluency** — the repo maintainer reads Thai and English, so Thai PRs can be reviewed for quality directly. Non-Thai languages can't be meaningfully reviewed by the maintainer, so accepting them in-tree would either rubber-stamp them (quality unclear) or block them in PR purgatory.
2. **Maintenance load** — keeping N in-tree languages in sync with an evolving English upstream multiplies every English edit by N+1. One in-tree non-English language is sustainable; many are not.

If a community grows around a second non-English language (Japanese, Korean, Chinese, Portuguese, Spanish) and someone wants to maintain it long-term, we can revisit and promote that language to in-tree too. For now: fork-and-link.

## What stays English (do not translate)

| Category | Examples | Why |
| :--- | :--- | :--- |
| Product names | `Delta Lake`, `Unity Catalog`, `Lakeflow Declarative Pipelines`, `Lakeflow Jobs`, `MLflow`, `Databricks Runtime`, `Photon`, `Mosaic AI`, `AutoML`, `AI Gateway`, `Genie Spaces`, `Vector Search`, `Inference Tables` | Exam stems use English product names. Translating them creates dictionary mismatch with the actual test. |
| Code | All fenced code blocks (`python`, `sql`, `scala`, `bash`) | Code is universal. Translate inline `# comments` and string literals only if it adds value to the learner. |
| File and folder names | `01-lakeflow-pipelines.md`, `data-engineer-associate/` | Path stability matters for links and search. Keep ASCII filenames in `i18n/th/` too — mirror the English paths exactly. |
| Exam-guide PDF titles | "Databricks Certified Data Engineer Associate Exam Guide" | The PDF you'll actually be tested against is in English. |
| Class / function / parameter names | `mlflow.set_registry_uri("databricks-uc")`, `@dlt.table`, `StringIndexer` | These are stable code symbols. |
| Markdown structural keywords | `> [!note]`, `> [!important]`, `> [!warning]`, `> [!success]-`, YAML frontmatter keys (`title:`, `type:`, `tags:`) | Obsidian + GitHub render these literally. |
| Acronyms inside code spans | `` `UC` ``, `` `DLT` ``, `` `CDC` ``, `` `SCD` `` | Translate the *expansion* once at first mention; keep the acronym. |

## What gets translated

- Prose paragraphs and explanations
- Topic descriptions and intros
- Callout body text (the content inside `> [!note]`, not the keyword itself)
- Table headers and cell content (except product names and code identifiers above)
- Image captions
- Practice-question stems and answer-explanation text (but keep code blocks in answers as-is)
- The narrative around code, not the code itself

## The Thai glossary

`i18n/th/glossary.md` is the **single source of truth** for how Databricks-adjacent terms render in Thai. Every Thai PR must conform to it. If a term you need isn't in the glossary yet, add it in the same PR — don't translate ad-hoc.

Glossary discipline is the difference between a translation that reads like one author and one that reads like ten authors talking past each other. Stick to the glossary.

## Translation status tracking

For Thai, see [`i18n/th/STATUS.md`](./i18n/th/STATUS.md) — per-file checklist showing what's been translated, what's stale (English upstream changed since last Thai update), and what's untouched.

For non-Thai forks: copy [`i18n/STATUS-TEMPLATE.md`](./i18n/STATUS-TEMPLATE.md) into your fork to track your own progress.

## Sync model — how Thai stays current with English

The repo evolves (new blueprints, new content). The Thai translation has to keep up:

1. **Watch the English changelog**. Every English-changing PR has an entry in [`CHANGELOG.md`](./CHANGELOG.md). When English content lands, the affected Thai files are now stale.
2. **Mark stale entries in `i18n/th/STATUS.md`** — change the status from ✅ to 🔄 for any Thai file whose English counterpart was edited.
3. **Translate the diff, not the whole file** — `git diff main~1 main -- <english-path>` shows what changed. Update only those sections in the Thai counterpart.
4. **Translation PRs are commit-by-commit** — one English-source PR maps to one or more Thai catch-up PRs.

## Path mirroring

The Thai translation mirrors the English directory structure exactly under `i18n/th/`:

```text
README.md                                          → i18n/th/README.md
CONTRIBUTING.md                                    → i18n/th/CONTRIBUTING.md
shared/fundamentals/delta-lake-basics.md           → i18n/th/shared/fundamentals/delta-lake-basics.md
certifications/data-engineer-associate/README.md   → i18n/th/certifications/data-engineer-associate/README.md
…
```

Same filenames (English). Same folder structure. **Don't rename**. The reason: cross-references inside translated content can use the same relative paths as English, which makes Thai files trivially convertible to/from English by path substitution.

## What's not translated (by policy)

These files **don't** get Thai counterparts — they're English-only:

- `LICENSE` (legal text — translation can change meaning)
- `CHANGELOG.md` (commit history is English)
- `CONTRIBUTORS.md` (names are names)
- `.github/` workflow files (YAML configuration)
- `CLAUDE.md` (internal maintainer instructions)
- `TRANSLATING.md` (this file — the canonical English version is the policy)

If a Thai-speaking learner needs an entry-point translation of CONTRIBUTING.md, that one is optional — but the English version remains canonical.

## Quality bar (Thai)

- Native Thai fluency
- Working knowledge of Databricks / Spark / SQL / Python
- Consistent voice — match the English file's tone (concise, technical, exam-focused)
- Conform to `i18n/th/glossary.md`
- Translate in self-contained units (one file at a time, fully)

## Quality bar (other-language forks)

Same as Thai, just in your target language. We can't enforce this on forks — we can only link to ones we trust. The `i18n/README.md` "Community translation forks" table lists self-registered forks; their maintainers vouch for quality, not us.

## Submitting Thai contributions

Standard repo PR flow:

1. Branch off `main` with prefix `docs(th):` or `i18n(th):`
2. Translate one file (or fix one glossary entry) per PR — keeps reviews small
3. Update `i18n/th/STATUS.md` in the same PR
4. CI (markdownlint + lychee) must pass
5. The maintainer reviews and squash-merges

## Submitting a non-Thai community fork to `i18n/README.md`

When your fork has at least one cert track fully translated and is publishable:

1. Open a PR on this repo modifying `i18n/README.md` only
2. Add a single row to the "Community translation forks" table with: language, link to your fork, what's translated, last upstream-sync date, maintainer GitHub handle
3. PR title: `docs(i18n): register <Language> translation fork`
4. We'll merge fast — this PR is just a directory entry, not a content review

## Attribution

By contributing translations (Thai in-tree, or any non-Thai language downstream), you agree the work is released under the same [MIT License](./LICENSE) covering the rest of the project.

For Thai contributions, add yourself to [`CONTRIBUTORS.md`](./CONTRIBUTORS.md) as part of your PR.

---

**[← Back to repo root](./README.md)** | **[อ่านภาษาไทย →](./i18n/th/README.md)** | **[See all translations →](./i18n/README.md)**
