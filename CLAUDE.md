# CLAUDE.md

Study notes for Databricks certifications: Data Engineer (Associate & Professional), Data Analyst Associate, ML Associate & Professional, GenAI Engineer Associate.

## Repository Structure

```text
databricks-certification-study-guide/
├── certifications/
│   ├── data-engineer-associate/    # 5 topic folders + resources/
│   ├── data-engineer-professional/ # 8 topic folders + resources/
│   ├── data-analyst-associate/     # 5 topic folders + resources/
│   ├── ml-associate/               # 4 topic folders + resources/
│   ├── ml-professional/            # 4 topic folders + resources/
│   └── genai-engineer-associate/   # 4 topic folders + resources/
├── shared/
│   ├── fundamentals/       # Cross-cert concept files
│   ├── cheat-sheets/       # Quick-reference sheets
│   ├── appendix/           # Glossary, comparisons, errors, troubleshooting
│   ├── code-examples/      # python/ and sql/ (always .md files)
│   └── interview-prep/     # 15 topic files, 108 open-ended questions
├── learning-paths/         # Per-role study paths
└── images/databricks-ui/   # Screenshots by feature area
```

Each certification folder contains numbered topic folders (`01-topic/`, `02-topic/`, …) with a `README.md` index and individual `.md` topic files. Each also has `resources/` with `exam-tips.md`, `official-links.md`, `practice-questions/`, `mock-exam/`, and `mock-exam-2/`.

## Content Guidelines

### Content Placement

- **Check `shared/` first** — if content applies to multiple certifications, put it there
- **Reference, don't duplicate** shared content across certifications

### Code Examples

- **Always `.md` files**, never `.py` or `.sql` — store in `shared/code-examples/python/` or `sql/`
- Fenced code blocks with language tags; group related snippets under `##` headings; add YAML frontmatter with `tags`

### File Size

- **Target: 300–600 lines**; hard limit: ~800 lines (~20–25 KB)
- **Exception:** `mock-exam/questions.md` files — do not split
- **Split** when 2+ distinct sub-topics can stand alone → `03-topic-part1.md` + `03-topic-part2.md`:
  1. Same number prefix; append `-part1` / `-part2`
  2. Each part gets own YAML frontmatter and intro
  3. Terminal sections (Use Cases → Official Docs) go in **Part 2 only**; Part 1 ends with forward link
  4. Update topic `README.md` index; delete original; fix all links repo-wide

### Markdown Conventions

- Run markdownlint on every modified file; blank lines before/after headings (MD022)
- Language tags on all code blocks (`sql`, `python`, `scala`)
- **Multi-line Python:** parenthesized expressions, not backslash continuations:

  ```python
  df = (spark.read.format("delta")
      .option("key", "value")
      .load("/path"))
  ```

- **Practice answers:** Obsidian foldable `> [!success]- Answer` callout
- **Practice choices:** A/B/C/D on separate lines (no bullets); two trailing spaces for line breaks

### Diagrams & Images

- **Architecture diagrams:** Mermaid (`flowchart`, `sequenceDiagram`, `graph`)
- **Directory trees:** ASCII text, not Mermaid
- **Screenshots:** `images/databricks-ui/<feature>/`; standard markdown `![Alt](path)` with caption; ≤800 px wide

### Links

- **Link to files, not folders** (`path/to/README.md`, not `path/to/`)
- **Always `./README.md`** for local READMEs — bare `README.md` resolves ambiguously in Obsidian
- Verify target files exist after edits

### Section Ordering (End of Topic Files)

Terminal sections in this exact order:

1. `## Use Cases`
2. `## Common Issues & Errors`
3. `## Best Practices` *(optional)*
4. `## Exam Tips`
5. `## Key Takeaways`
6. `## Related Topics`
7. `## Official Documentation`
8. `---` separator + navigation link (always last)

**Nav format:** `**[← Previous](./NN-prev.md) | [↑ Back to Section](./README.md) | [Next →](./NN-next.md)**`

- Part 1 files: end with only forward link to Part 2
- Part 2 files: full three-way nav

## README Standards

### Certification README (`certifications/<cert>/README.md`)

Required: YAML frontmatter (`title`, `type: certification`, `aliases`, `tags`), Exam Overview table, Domain Weights (Mermaid pie), Study Topics table with weights, Practice & Resources table, Prerequisites (shared fundamentals links), Study Progress Tracker (checkboxes), Interview Preparation link.

### Topic Folder README (`<topic-folder>/README.md`)

Required: YAML frontmatter (`title`, `type: category`, `tags`, `status`), topic title with exam weight, Topics Overview (Mermaid flowchart), Section Contents table, Key Concepts, Related Resources, Back/Next navigation.

## Certification Topic Folders

- **DE Associate:** 01-lakehouse-platform, 02-etl-spark-sql, 03-delta-lake, 04-workflows-orchestration, 05-data-governance
- **DE Professional:** 01-data-processing, 02-databricks-tooling, 03-data-modeling, 04-security-governance, 05-monitoring-logging, 06-testing-deployment, 07-lakeflow-pipelines, 08-performance-optimization
- **Data Analyst:** 01-databricks-sql, 02-data-management, 03-sql-queries, 04-dashboards-visualization, 05-analytics-applications
- **ML Associate:** 01-databricks-ml, 02-ml-workflows, 03-feature-engineering, 04-mlflow-deployment
- **ML Professional:** 01-advanced-feature-engineering, 02-hyperparameter-optimization, 03-model-production-lifecycle, 04-model-governance-mlops
- **GenAI Engineer:** 01-rag-architecture, 02-vector-search-embeddings, 03-llm-application-development, 04-databricks-genai-tools

## Shared Content

- **fundamentals/**: platform-architecture, databricks-workspace, delta-lake-basics, spark-fundamentals, sql-essentials, streaming-fundamentals, unity-catalog-basics, medallion-architecture, mlflow-basics, feature-engineering-basics, rag-vector-search-basics, open-table-formats, python-essentials (×2)
- **cheat-sheets/**: delta-lake-commands, dlt-quick-ref, mlflow-quick-ref, pyspark-api-quick-ref, spark-configurations, sql-functions, unity-catalog-quick-ref, performance-optimization, describe-show-commands
- **appendix/**: glossary, comparison-tables, error-messages, performance-troubleshooting, version-history
- **code-examples/**: python/ (delta_lake_operations, python_patterns, streaming_examples, unity_catalog_setup), sql/ (cte_patterns, delta_lake_operations, window_functions)
- **interview-prep/**: associate-fundamentals, file-formats-spark-internals, delta-lake-internals, pipeline-architecture, streaming-cdc, data-modeling, performance-optimization, pyspark-sql-patterns, python-code-quality, governance-security, production-operations, data-compliance-quality, system-design, ml-system-design, genai-rag-design
