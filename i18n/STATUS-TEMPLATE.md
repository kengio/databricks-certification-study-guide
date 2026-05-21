---
title: Translation Status Template
type: template
tags:
  - i18n
  - template
status: published
---

# Translation Status Template

A starter checklist that community translation forks can copy into their own fork as `i18n/<lang>/STATUS.md` (or wherever you prefer) to track per-file translation progress.

The Thai in-tree translation uses a populated version of this at [`th/STATUS.md`](./th/STATUS.md) — look there for a worked example.

## Status symbols

| Symbol | Meaning |
| :--- | :--- |
| ✅ | Translated and current (matches English upstream as of `last_synced`) |
| 🔄 | English upstream changed since last translation — needs re-sync |
| ⏳ | Untranslated |
| ❌ | Intentionally not translated (e.g., `LICENSE`, `CHANGELOG.md` — see [TRANSLATING.md](../TRANSLATING.md#whats-not-translated-by-policy)) |

## Template body — copy from here

```markdown
---
title: <Language> Translation Status
type: status
tags:
  - i18n
  - <language>
  - status
status: published
---

# <Language> Translation Status

Last upstream sync: `<git-tag-or-commit-sha>` on `<YYYY-MM-DD>`

## Top-level

| File | Status |
| :--- | :--- |
| `README.md` | ⏳ |
| `CONTRIBUTING.md` | ⏳ |
| `TRANSLATING.md` | ❌ (English-only by policy) |
| `LICENSE` | ❌ (English-only by policy) |
| `CHANGELOG.md` | ❌ (English-only by policy) |
| `CONTRIBUTORS.md` | ❌ (English-only by policy) |
| `CLAUDE.md` | ❌ (English-only by policy) |

## Certifications

### Data Engineer Associate

| File | Status |
| :--- | :--- |
| `certifications/data-engineer-associate/README.md` | ⏳ |
| `certifications/data-engineer-associate/01-lakehouse-platform/` (N files) | ⏳ |
| `certifications/data-engineer-associate/02-etl-spark-sql/` (N files) | ⏳ |
| `certifications/data-engineer-associate/03-delta-lake/` (N files) | ⏳ |
| `certifications/data-engineer-associate/04-workflows-orchestration/` (N files) | ⏳ |
| `certifications/data-engineer-associate/05-data-governance/` (N files) | ⏳ |
| `certifications/data-engineer-associate/06-cicd-and-monitoring/` (N files) | ⏳ |
| `certifications/data-engineer-associate/resources/` | ⏳ |

… (repeat per cert) …

## Shared content

### Fundamentals

| File | Status |
| :--- | :--- |
| `shared/fundamentals/platform-architecture.md` | ⏳ |
| `shared/fundamentals/databricks-workspace.md` | ⏳ |
| `shared/fundamentals/delta-lake-basics.md` | ⏳ |
| `shared/fundamentals/spark-fundamentals.md` | ⏳ |
| `shared/fundamentals/sql-essentials.md` | ⏳ |
| `shared/fundamentals/streaming-fundamentals.md` | ⏳ |
| `shared/fundamentals/unity-catalog-basics.md` | ⏳ |
| `shared/fundamentals/medallion-architecture.md` | ⏳ |
| `shared/fundamentals/mlflow-basics.md` | ⏳ |
| `shared/fundamentals/feature-engineering-basics.md` | ⏳ |
| `shared/fundamentals/rag-vector-search-basics.md` | ⏳ |
| `shared/fundamentals/open-table-formats.md` | ⏳ |
| `shared/fundamentals/python-essentials.md` | ⏳ |
| `shared/fundamentals/python-essentials-2.md` | ⏳ |

### Cheat sheets, appendix, interview prep, code examples, labs, learning paths

(populate the same way)

## Progress summary

- Total files in scope: `N`
- Translated (✅): `0` (`0%`)
- Stale (🔄): `0`
- Untranslated (⏳): `N`
- Excluded (❌): `5`

Update this table at the end of every translation PR so progress is visible at a glance.
```

## Tips

- **Generate the file list from the English tree**: `find . -name '*.md' -not -path './i18n/*' -not -path './.git/*'` gives you every file to consider.
- **Pin the `last_synced` tag** — re-sync from a tagged release (e.g., `v1.0.0`), not from a moving `main` branch. The tag is your stable reference point.
- **One file = one row.** Don't fold groups of files into a single row — granular tracking is what makes "what's stale?" answerable.
- **Update STATUS.md in the same PR** as any translation change. Out-of-sync status tables are worse than no status table.

---

**[← Back to translations index](./README.md)** | **[Translation policy →](../TRANSLATING.md)**
