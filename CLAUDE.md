# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This repository contains study notes and materials for ALL Databricks certifications, including:

- Data Engineer Associate & Professional
- Data Analyst Associate
- Machine Learning Associate & Professional
- Generative AI Engineer Associate

## Repository Structure

```text
databricks-certification-study-guide/
├── certifications/
│   ├── data-engineer-associate/
│   │   ├── README.md
│   │   ├── 01-lakehouse-platform/
│   │   │   ├── README.md
│   │   │   ├── 01-lakehouse-architecture.md
│   │   │   ├── 02-databricks-workspace.md
│   │   │   └── 03-compute-clusters.md
│   │   ├── 02-etl-spark-sql/
│   │   │   ├── README.md
│   │   │   ├── 01-spark-sql-fundamentals.md
│   │   │   ├── 02-dataframe-operations.md
│   │   │   ├── 03-joins-aggregations.md
│   │   │   └── 04-advanced-transformations.md
│   │   ├── 03-delta-lake/
│   │   │   ├── README.md
│   │   │   ├── 01-delta-lake-fundamentals.md
│   │   │   ├── 02-time-travel-versioning.md
│   │   │   └── 03-delta-optimization.md
│   │   ├── 04-workflows-orchestration/
│   │   │   ├── README.md
│   │   │   ├── 01-databricks-jobs.md
│   │   │   ├── 02-scheduling-triggers.md
│   │   │   └── 03-job-monitoring.md
│   │   ├── 05-data-governance/
│   │   │   ├── README.md
│   │   │   ├── 01-unity-catalog-basics.md
│   │   │   ├── 02-access-control-permissions.md
│   │   │   └── 03-data-sharing.md
│   │   └── resources/
│   │       ├── README.md
│   │       ├── exam-tips.md
│   │       ├── official-links.md
│   │       ├── practice-questions/
│   │       │   ├── README.md
│   │       │   ├── 01-lakehouse-platform.md
│   │       │   ├── 02-elt-spark-sql-python.md
│   │       │   ├── 03-incremental-processing.md
│   │       │   ├── 04-production-pipelines.md
│   │       │   └── 05-data-governance.md
│   │       ├── mock-exam/
│   │       │   ├── README.md
│   │       │   └── questions.md
│   │       └── mock-exam-2/
│   │           ├── README.md
│   │           └── questions.md
│   │
│   ├── data-engineer-professional/
│   │   ├── README.md
│   │   ├── prd.md
│   │   ├── 01-data-processing/
│   │   │   ├── README.md
│   │   │   ├── 01-batch-etl-pipelines-part1.md
│   │   │   ├── 01-batch-etl-pipelines-part2.md
│   │   │   ├── 02-incremental-processing.md
│   │   │   ├── 03-structured-streaming-part1.md
│   │   │   ├── 03-structured-streaming-part2.md
│   │   │   ├── 04-auto-loader.md
│   │   │   ├── 05-change-data-capture-part1.md
│   │   │   ├── 05-change-data-capture-part2.md
│   │   │   ├── 06-delta-lake-operations-part1.md
│   │   │   ├── 06-delta-lake-operations-part2.md
│   │   │   ├── 07-data-deduplication.md
│   │   │   ├── 08-streaming-joins-stateful.md
│   │   │   └── 09-streaming-monitoring-optimization.md
│   │   ├── 02-databricks-tooling/
│   │   │   ├── README.md
│   │   │   ├── 01-workspace-and-notebooks.md
│   │   │   ├── 02-databricks-cli-part1.md
│   │   │   ├── 02-databricks-cli-part2.md
│   │   │   ├── 03-rest-api-part1.md
│   │   │   ├── 03-rest-api-part2.md
│   │   │   ├── 04-databricks-compute.md
│   │   │   └── 05-dbfs-and-mounts.md
│   │   ├── 03-data-modeling/
│   │   │   ├── README.md
│   │   │   ├── 01-medallion-architecture.md
│   │   │   ├── 02-delta-lake-fundamentals.md
│   │   │   ├── 03-schema-management.md
│   │   │   ├── 04-scd-patterns.md
│   │   │   └── 05-partitioning-strategies.md
│   │   ├── 04-security-governance/
│   │   │   ├── README.md
│   │   │   ├── 01-unity-catalog.md
│   │   │   ├── 02-access-control.md
│   │   │   ├── 03-data-sharing.md
│   │   │   ├── 04-secret-management.md
│   │   │   ├── 05-audit-lineage-network-security.md
│   │   │   └── 06-classification-compliance-permissions.md
│   │   ├── 05-monitoring-logging/
│   │   │   ├── README.md
│   │   │   ├── 01-system-tables.md
│   │   │   ├── 02-spark-ui-debugging.md
│   │   │   ├── 03-lakeflow-event-logs.md
│   │   │   └── 04-query-profiler.md
│   │   ├── 06-testing-deployment/
│   │   │   ├── README.md
│   │   │   ├── 01-asset-bundles-part1.md
│   │   │   ├── 01-asset-bundles-part2.md
│   │   │   ├── 02-cicd-integration-part1.md
│   │   │   ├── 02-cicd-integration-part2.md
│   │   │   ├── 03-git-folders.md
│   │   │   ├── 04-unit-testing-part1.md
│   │   │   ├── 04-unit-testing-part2.md
│   │   │   ├── 05-bundle-deployment-strategies-part1.md
│   │   │   ├── 05-bundle-deployment-strategies-part2.md
│   │   │   ├── 06-advanced-testing-operations-part1.md
│   │   │   └── 06-advanced-testing-operations-part2.md
│   │   ├── 07-lakeflow-pipelines/
│   │   │   ├── README.md
│   │   │   ├── 01-declarative-pipelines.md
│   │   │   ├── 02-expectations-data-quality.md
│   │   │   ├── 03-apply-changes-api.md
│   │   │   ├── 04-lakeflow-jobs-part1.md
│   │   │   └── 04-lakeflow-jobs-part2.md
│   │   ├── 08-performance-optimization/
│   │   │   ├── README.md
│   │   │   ├── 01-file-sizing.md
│   │   │   ├── 02-zorder-indexing.md
│   │   │   ├── 03-spark-tuning.md
│   │   │   ├── 04-cost-optimization.md
│   │   │   ├── 05-explain-plans-aqe.md
│   │   │   ├── 06-photon-diagnostics-optimization-part1.md
│   │   │   ├── 06-photon-diagnostics-optimization-part2.md
│   │   │   └── 07-streaming-optimization.md
│   │   ├── cheat-sheets/
│   │   │   ├── README.md
│   │   │   ├── auto-loader-quick-ref.md
│   │   │   ├── delta-lake-quick-ref.md
│   │   │   ├── dlt-quick-ref.md
│   │   │   ├── streaming-quick-ref.md
│   │   │   └── unity-catalog-quick-ref.md
│   │   └── resources/
│   │       ├── exam-tips.md
│   │       ├── official-links.md
│   │       ├── practice-questions/
│   │       │   ├── README.md
│   │       │   ├── 05-monitoring-logging.md
│   │       │   ├── 06-testing-deployment.md
│   │       │   ├── 07-lakeflow-pipelines.md
│   │       │   └── 08-performance-optimization.md
│   │       ├── mock-exam/
│   │       │   ├── README.md
│   │       │   ├── 05-monitoring-logging.md
│   │       │   ├── 06-testing-deployment.md
│   │       │   └── 07-lakeflow-performance.md
│   │       └── mock-exam-2/
│   │           ├── README.md
│   │           ├── 04-security-governance.md
│   │           ├── 05-monitoring-logging.md
│   │           ├── 06-testing-deployment.md
│   │           └── 07-lakeflow-performance.md
│   │
│   ├── data-analyst-associate/
│   │   ├── README.md
│   │   ├── 01-databricks-sql/
│   │   │   ├── README.md
│   │   │   ├── 01-sql-warehouses.md
│   │   │   ├── 02-query-editor.md
│   │   │   └── 03-connections.md
│   │   ├── 02-data-management/
│   │   │   ├── README.md
│   │   │   ├── 01-tables-schemas.md
│   │   │   ├── 02-unity-catalog.md
│   │   │   └── 03-access-control.md
│   │   ├── 03-sql-queries/
│   │   │   ├── README.md
│   │   │   ├── 01-joins.md
│   │   │   ├── 02-aggregations-grouping.md
│   │   │   └── 03-window-functions.md
│   │   ├── 04-dashboards-visualization/
│   │   │   ├── README.md
│   │   │   ├── 01-dashboards.md
│   │   │   ├── 02-visualizations.md
│   │   │   └── 03-alerts-scheduling.md
│   │   ├── 05-analytics-applications/
│   │   │   ├── README.md
│   │   │   ├── 01-parameters-queries.md
│   │   │   └── 02-sharing-collaboration.md
│   │   └── resources/
│   │       ├── README.md
│   │       ├── exam-tips.md
│   │       ├── official-links.md
│   │       ├── practice-questions/
│   │       │   └── README.md
│   │       ├── mock-exam/
│   │       │   └── README.md
│   │       └── mock-exam-2/
│   │           └── README.md
│   │
│   ├── ml-associate/
│   │   ├── README.md
│   │   ├── 01-databricks-ml/
│   │   │   ├── README.md
│   │   │   ├── 01-databricks-ml-workspace.md
│   │   │   ├── 02-compute-clusters-ml.md
│   │   │   └── 03-databricks-automl.md
│   │   ├── 02-ml-workflows/
│   │   │   ├── README.md
│   │   │   ├── 01-mlflow-tracking.md
│   │   │   ├── 02-experiments-runs.md
│   │   │   └── 03-ml-experimentation-workflow.md
│   │   ├── 03-feature-engineering/
│   │   │   ├── README.md
│   │   │   ├── 01-spark-ml-pipelines.md
│   │   │   ├── 02-feature-engineering-techniques.md
│   │   │   └── 03-feature-store.md
│   │   ├── 04-mlflow-deployment/
│   │   │   ├── README.md
│   │   │   ├── 01-model-registry.md
│   │   │   └── 02-model-deployment-serving.md
│   │   └── resources/
│   │       ├── README.md
│   │       ├── exam-tips.md
│   │       ├── official-links.md
│   │       ├── practice-questions/
│   │       │   ├── README.md
│   │       │   ├── 01-databricks-ml.md
│   │       │   ├── 02-ml-workflows.md
│   │       │   ├── 03-feature-engineering.md
│   │       │   └── 04-mlflow-deployment.md
│   │       ├── mock-exam/
│   │       │   ├── README.md
│   │       │   └── questions.md
│   │       └── mock-exam-2/
│   │           ├── README.md
│   │           └── questions.md
│   │
│   ├── ml-professional/
│   │   ├── README.md
│   │   ├── 01-advanced-feature-engineering/
│   │   │   ├── README.md
│   │   │   ├── 01-feature-store-fundamentals.md
│   │   │   ├── 02-databricks-feature-store.md
│   │   │   ├── 03-advanced-feature-techniques.md
│   │   │   └── 04-feature-store-production.md
│   │   ├── 02-hyperparameter-optimization/
│   │   │   ├── README.md
│   │   │   ├── 01-tuning-fundamentals.md
│   │   │   ├── 02-bayesian-optimization.md
│   │   │   └── 03-distributed-tuning.md
│   │   ├── 03-model-production-lifecycle/
│   │   │   ├── README.md
│   │   │   ├── 01-model-versioning-registry.md
│   │   │   ├── 02-model-serving-deployment.md
│   │   │   ├── 03-ab-testing-canary.md
│   │   │   └── 04-model-lifecycle-orchestration.md
│   │   ├── 04-model-governance-mlops/
│   │   │   ├── README.md
│   │   │   ├── 01-model-monitoring-observability.md
│   │   │   ├── 02-drift-detection-remediation.md
│   │   │   ├── 03-governance-frameworks.md
│   │   │   └── 04-compliance-audit-logging.md
│   │   └── resources/
│   │       ├── README.md
│   │       ├── exam-tips.md
│   │       ├── official-links.md
│   │       ├── practice-questions/
│   │       │   ├── README.md
│   │       │   ├── 01-feature-engineering.md
│   │       │   ├── 02-hyperparameter-optimization.md
│   │       │   ├── 03-model-lifecycle.md
│   │       │   └── 04-model-governance.md
│   │       ├── mock-exam/
│   │       │   ├── README.md
│   │       │   └── questions.md
│   │       └── mock-exam-2/
│   │           ├── README.md
│   │           └── questions.md
│   │
│   └── genai-engineer-associate/
│       ├── README.md
│       ├── 01-rag-architecture/
│       │   ├── README.md
│       │   ├── 01-rag-design-patterns.md
│       │   ├── 02-document-processing-chunking.md
│       │   └── 03-retrieval-augmentation-strategies.md
│       ├── 02-vector-search-embeddings/
│       │   ├── README.md
│       │   ├── 01-embeddings-models.md
│       │   ├── 02-databricks-vector-search.md
│       │   └── 03-vector-search-production.md
│       ├── 03-llm-application-development/
│       │   ├── README.md
│       │   ├── 01-prompt-engineering.md
│       │   ├── 02-chains-agents.md
│       │   └── 03-evaluation-llm-apps.md
│       ├── 04-databricks-genai-tools/
│       │   ├── README.md
│       │   ├── 01-mosaic-ai-and-foundation-models.md
│       │   └── 02-mlflow-for-genai.md
│       └── resources/
│           ├── README.md
│           ├── exam-tips.md
│           ├── official-links.md
│           ├── practice-questions/
│           │   ├── README.md
│           │   ├── 01-rag-architecture.md
│           │   ├── 02-vector-search-embeddings.md
│           │   ├── 03-llm-application-development.md
│           │   └── 04-databricks-genai-tools.md
│           ├── mock-exam/
│           │   ├── README.md
│           │   └── questions.md
│           └── mock-exam-2/
│               ├── README.md
│               └── questions.md
│
├── shared/
│   ├── fundamentals/
│   │   ├── README.md
│   │   ├── databricks-workspace.md
│   │   ├── delta-lake-basics.md
│   │   ├── feature-engineering-basics.md
│   │   ├── medallion-architecture.md
│   │   ├── mlflow-basics.md
│   │   ├── open-table-formats.md
│   │   ├── platform-architecture.md
│   │   ├── python-essentials.md
│   │   ├── python-essentials-2.md
│   │   ├── rag-vector-search-basics.md
│   │   ├── spark-fundamentals.md
│   │   ├── sql-essentials.md
│   │   ├── streaming-fundamentals.md
│   │   └── unity-catalog-basics.md
│   ├── cheat-sheets/
│   │   ├── README.md
│   │   ├── delta-lake-commands.md
│   │   ├── describe-show-commands.md
│   │   ├── dlt-quick-ref.md
│   │   ├── mlflow-quick-ref.md
│   │   ├── performance-optimization.md
│   │   ├── pyspark-api-quick-ref.md
│   │   ├── spark-configurations.md
│   │   ├── sql-functions.md
│   │   └── unity-catalog-quick-ref.md
│   ├── appendix/
│   │   ├── README.md
│   │   ├── comparison-tables.md
│   │   ├── error-messages.md
│   │   ├── glossary.md
│   │   ├── performance-troubleshooting.md
│   │   └── version-history.md
│   ├── code-examples/
│   │   ├── README.md
│   │   ├── python/
│   │   │   ├── delta_lake_operations.md
│   │   │   ├── python_patterns.md
│   │   │   ├── streaming_examples.md
│   │   │   └── unity_catalog_setup.md
│   │   └── sql/
│   │       ├── cte_patterns.md
│   │       ├── delta_lake_operations.md
│   │       └── window_functions.md
│   └── interview-prep/
│       ├── README.md
│       ├── 01-system-design.md
│       ├── 02-delta-lake-internals.md
│       ├── 03-pipeline-architecture.md
│       ├── 04-performance-optimization.md
│       ├── 05-streaming-cdc.md
│       ├── 06-governance-security.md
│       ├── 07-file-formats-spark.md
│       ├── 08-pyspark-api.md
│       ├── 09-python-code-quality.md
│       └── 10-data-modeling.md
│
├── learning-paths/
│   ├── README.md
│   ├── data-analyst-path.md
│   ├── data-engineer-path.md
│   ├── genai-path.md
│   └── ml-engineer-path.md
│
└── images/
    └── databricks-ui/           # UI screenshots organized by feature area
```

## Content Guidelines

### When Adding Content

1. **Check `shared/` first** - If content applies to multiple certifications, add it there
2. **Certification-specific content** goes in `certifications/<cert-name>/`
3. **Reference shared content** rather than duplicating it

### Code Examples

- **Always create code examples as `.md` files**, never as `.py` or `.sql` files
- Store them in `shared/code-examples/python/` or `shared/code-examples/sql/`
- Wrap each snippet in a fenced code block with the appropriate language tag (` ```python `, ` ```sql `)
- Group related snippets under `##` section headings within the same `.md` file
- Add YAML frontmatter with relevant `tags` (e.g., `delta-lake`, `python`, `sql`)
- This keeps examples readable, navigable, and syntax-highlighted inside Obsidian

### File Size Guidelines

- **Target size per file: 300–600 lines** — keeps files scannable in Obsidian without excessive scrolling
- **Hard limit: ~800 lines (~20–25 KB)** — files beyond this should be split into focused sub-topics
  - **Exception**: Mock exam `questions.md` files are exempt from this limit to preserve the continuous testing experience. Do not split `mock-exam/questions.md` files.
- **When to split**: when a file contains two or more conceptually distinct sub-topics that can each stand alone (e.g., "joins & state" vs "monitoring & tuning")
- **How to split**:
  1. Part 1 appends the `-part1` suffix: `NN-topic-name-part1.md`
  2. Part 2 uses same number with `-part2` suffix: `NN-topic-name-part2.md`
  3. Each part gets its own YAML frontmatter and a brief 1–2 sentence intro paragraph
  4. Terminal sections (Exam Tips, Practice Questions, Related Topics, Official Docs, Common Issues) go to **Part 2 only** — end Part 1 with a single forward link to Part 2
  5. Update the section `README.md` index table to list both new files
  6. Delete the original oversized file
  7. Search the repo for any links pointing to the old filename and update them all, and ensure the "Previous" and "Next" navigation links between the split files are correct.

**Example**: If `03-structured-streaming.md` exceeds 800 lines:

- Part 1 becomes: `03-structured-streaming-part1.md`
- Part 2 becomes: `03-structured-streaming-part2.md`

### Markdown Conventions

- Always run markdownlint to check for issues with every MD file
- Ensure headings have blank lines before and after them (MD022 rule)
- Use appropriate code blocks (SQL, Python, Scala)
- **Use parenthesized expressions** for multi-line Python method chains instead of backslash `\` continuations:

  ```python
  # Preferred: parenthesized expression
  df = (spark.read.format("delta")
      .option("key", "value")
      .load("/path"))

  # Avoid: backslash continuation
  df = spark.read.format("delta") \
      .option("key", "value") \
      .load("/path")
  ```

- **Use Obsidian foldable callouts** for answers/spoilers (collapsed by default in Obsidian). Use the `[!success]-` callout type:

  ```markdown
  > [!success]- Answer
  > **Correct Answer: X**
  >
  > Explanation text here.
  ```

- **Practice Question Choices**: Format as separate lines without bullets. End each line with **two spaces** to force a hard line break:

  ```markdown
  A) Option one
  B) Option two
  C) Option three
  ```

### Diagrams

- **Always use Mermaid syntax** for logical flow/architecture diagrams
- Use ASCII/text-based tree diagrams for directory structures and file hierarchies
- Common diagram types:
  - `flowchart TB` or `flowchart LR` for architecture diagrams
  - `sequenceDiagram` for process flows
  - `graph` for relationships
- Example:

```markdown
\`\`\`mermaid
flowchart TB
    subgraph ControlPlane["Control Plane"]
        WebUI[Web UI]
        API[REST APIs]
    end
    subgraph DataPlane["Data Plane"]
        Cluster[Clusters]
        Storage[(Storage)]
    end
    ControlPlane --> DataPlane
\`\`\`
```

### Images

- **Supplement mermaid diagrams with screenshots** when showing Databricks UI elements
- Store images in `images/databricks-ui/` organized by feature area
- Use descriptive alt text and captions
- Keep images under 800px width for readability
- Use standard markdown image syntax for cross-platform compatibility (GitHub + Obsidian):

```markdown
![Alt text describing the image](../../images/databricks-ui/feature/image-name.png)

*Caption explaining what the screenshot shows*
```

- **Note:** Avoid HTML image tags (`<img>`) - use markdown syntax for Obsidian compatibility

### Link Verification

- **Always check for broken links** after editing or adding files - scan all markdown files to verify internal links still work
- **Always link directly to files, not folders** (e.g., `path/to/README.md` not `path/to/`)
- **Always use `./README.md` (with `./` prefix), never bare `README.md`** — Obsidian uses shortest-path link resolution, so a bare `README.md` can silently resolve to the root `README.md` instead of the local one. Always write `./README.md` to make the path unambiguous:

  ```markdown
  <!-- Correct: unambiguous, always resolves to local README -->
  [Back to Practice Questions](./README.md)

  <!-- Wrong: Obsidian may resolve to root README.md -->
  [Back to Practice Questions](README.md)
  ```

- When adding or modifying links, confirm the target file exists
- Standard entry points for each section:
  - `certifications/data-engineer-associate/README.md`
  - `certifications/data-engineer-professional/README.md`
  - `certifications/data-analyst-associate/README.md`
  - `certifications/ml-associate/README.md`
  - `certifications/ml-professional/README.md`
  - `certifications/genai-engineer-associate/README.md`
  - `shared/fundamentals/README.md`
  - `shared/cheat-sheets/README.md`
  - `shared/appendix/README.md`
  - `learning-paths/README.md`

### Content Requirements

- Include sample images of Databricks platform UI when helpful
- Include step-by-step setup guides for configurations
- Add a use cases section for each topic
- Add common issues/errors that appear in exam questions
- Reference official Databricks documentation
- Use information from 2025 or 2026 sources

### Section Ordering (End of Topic Files)

All topic `.md` files should end with **terminal sections** in this exact order:

1. `## Use Cases`
2. `## Common Issues & Errors`
3. `## Best Practices` *(optional — include when the topic has clear do/don't guidance)*
4. `## Exam Tips`
5. `## Key Exam Concepts` *(used in DE, DA, ML-Professional files — bullet-point summary of must-know facts)*
   — **OR** —
   `## Key Takeaways` *(used in ML-Associate files — same purpose, different name by convention)*
6. `## Related Topics`
7. `## Official Documentation`
8. `---` separator + navigation link

**Section name conventions by certification:**

| Certification | Summary section name |
|---|---|
| Data Engineer Associate | `## Key Exam Concepts` |
| Data Engineer Professional | *(no summary section — ends after `## Official Documentation`)* |
| Data Analyst Associate | `## Key Exam Concepts` |
| ML Associate | `## Key Takeaways` |
| ML Professional | `## Key Exam Concepts` |
| GenAI Engineer Associate | `## Key Exam Concepts` |

**Navigation link format** (always the very last element in the file):

```markdown
---

**[← Previous: Topic Name](./NN-prev-topic.md) | [↑ Back to Section](./README.md) | [Next: Topic Name](./NN-next-topic.md) →**
```

- Single-file topics: include `← Previous`, `↑ Back to`, and `Next →` links as applicable.
- **Part 1** files: end with only a forward link — `**[Next: Topic Name — Part 2 →](./NN-topic-part2.md)**`
- **Part 2** files: include the full three-way nav (prev, up, next) as above.
- Terminal sections (`## Use Cases`, `## Common Issues & Errors`, `## Best Practices`, `## Exam Tips`, `## Key Exam Concepts` / `## Key Takeaways`, `## Related Topics`, `## Official Documentation`) go in **Part 2 only**. Part 1 ends with its last content section followed by a single link to Part 2.
- Never place any terminal section after the navigation link.

## Certification Folder Structure (Standardized)

All certifications follow this consistent folder structure for easy navigation and scalability:

```text
certifications/{cert-name}/
├── README.md                           # Certification overview, exam info, study path
├── 01-topic-area/
│   ├── README.md                      # Topic overview, exam weight, contents list
│   ├── 01-subtopic.md                 # Study material (300-600 lines)
│   ├── 02-subtopic.md
│   ├── NN-subtopic-part1.md
│   └── NN-subtopic-part2.md           # If file exceeds 800 lines
├── NN-final-topic-area/               # (same structure repeating)
│   └── ...
├── cheat-sheets/                       # (optional: cert-specific; link to shared/)
│   └── README.md
└── resources/
    ├── README.md                       # Resources overview
    ├── exam-tips.md                    # Exam strategies, time management
    ├── official-links.md               # Links to docs, registration
    ├── practice-questions/
    │   ├── README.md                  # Q index by topic
    │   ├── 01-topic.md
    │   └── NN-topic.md
    ├── mock-exam/
    │   ├── README.md                  # Exam instructions, passing score
    │   └── questions.md               # All questions
    └── mock-exam-2/                    # (duplicate structure)
        └── ...
```

### Certification Entry Point (README.md)

Each certification's main README must include:

- Frontmatter: `title`, `type: certification`, `aliases`, `tags`
- Exam Overview table (questions, duration, passing score, languages, experience requirement)
- Exam Domain Weights (pie chart visualization)
- Study Topics table: Links to each topic folder with exam weights
- Practice & Resources table: Links to exam tips, official links, practice questions, mock exams
- Prerequisites: Links to shared fundamentals
- Study Progress Tracker: Checkboxes for each phase
- Interview Preparation: Link to `shared/interview-prep/`

### Topic Folder Entry Point (README.md)

Each topic folder's README must include:

- Frontmatter: `title`, `type: category`, `tags`, `status`
- Topic title with exam weight (e.g., "# Data Processing (30% of Exam)")
- Topics Overview (mermaid flowchart showing subtopics)
- Section Contents (table listing .md files with priority)
- Key Concepts (definitions and concepts to master)
- Related Resources (links to shared fundamentals and code examples)
- Next Steps (link to next topic or back to certification)
- Back button (link to parent certification README)

## Key Topics by Certification

### Data Engineer Associate

| # | Topic Folder | Key Files |
|---|---|---|
| 01 | `01-lakehouse-platform` | lakehouse-architecture, databricks-workspace, compute-clusters |
| 02 | `02-etl-spark-sql` | spark-sql-fundamentals, dataframe-operations, joins-aggregations, advanced-transformations |
| 03 | `03-delta-lake` | delta-lake-fundamentals, time-travel-versioning, delta-optimization |
| 04 | `04-workflows-orchestration` | databricks-jobs, scheduling-triggers, job-monitoring |
| 05 | `05-data-governance` | unity-catalog-basics, access-control-permissions, data-sharing |

### Data Engineer Professional

| # | Topic Folder | Key Files |
|---|---|---|
| 01 | `01-data-processing` | batch-etl-pipelines (×2), incremental-processing, structured-streaming (×2), auto-loader, change-data-capture (×2), delta-lake-operations (×2), data-deduplication, streaming-joins-stateful, streaming-monitoring-optimization |
| 02 | `02-databricks-tooling` | workspace-and-notebooks, databricks-cli (×2), rest-api (×2), databricks-compute, dbfs-and-mounts |
| 03 | `03-data-modeling` | medallion-architecture, delta-lake-fundamentals, schema-management, scd-patterns, partitioning-strategies |
| 04 | `04-security-governance` | unity-catalog, access-control, data-sharing, secret-management, audit-lineage-network-security, classification-compliance-permissions |
| 05 | `05-monitoring-logging` | system-tables, spark-ui-debugging, lakeflow-event-logs, query-profiler |
| 06 | `06-testing-deployment` | asset-bundles (×2), cicd-integration (×2), git-folders, unit-testing (×2), bundle-deployment-strategies (×2), advanced-testing-operations (×2) |
| 07 | `07-lakeflow-pipelines` | declarative-pipelines, expectations-data-quality, apply-changes-api, lakeflow-jobs (×2) |
| 08 | `08-performance-optimization` | file-sizing, zorder-indexing, spark-tuning, cost-optimization, explain-plans-aqe, photon-diagnostics-optimization (×2), streaming-optimization |

### Data Analyst Associate

| # | Topic Folder | Key Files |
|---|---|---|
| 01 | `01-databricks-sql` | sql-warehouses, query-editor, connections |
| 02 | `02-data-management` | tables-schemas, unity-catalog, access-control |
| 03 | `03-sql-queries` | joins, aggregations-grouping, window-functions |
| 04 | `04-dashboards-visualization` | dashboards, visualizations, alerts-scheduling |
| 05 | `05-analytics-applications` | parameters-queries, sharing-collaboration |

### ML Associate

| # | Topic Folder | Key Files |
|---|---|---|
| 01 | `01-databricks-ml` | databricks-ml-workspace, compute-clusters-ml, databricks-automl |
| 02 | `02-ml-workflows` | mlflow-tracking, experiments-runs, ml-experimentation-workflow |
| 03 | `03-feature-engineering` | spark-ml-pipelines, feature-engineering-techniques, feature-store |
| 04 | `04-mlflow-deployment` | model-registry, model-deployment-serving |

### ML Professional

| # | Topic Folder | Key Files |
|---|---|---|
| 01 | `01-advanced-feature-engineering` | feature-store-fundamentals, databricks-feature-store, advanced-feature-techniques, feature-store-production |
| 02 | `02-hyperparameter-optimization` | tuning-fundamentals, bayesian-optimization, distributed-tuning |
| 03 | `03-model-production-lifecycle` | model-versioning-registry, model-serving-deployment, ab-testing-canary, model-lifecycle-orchestration |
| 04 | `04-model-governance-mlops` | model-monitoring-observability, drift-detection-remediation, governance-frameworks, compliance-audit-logging |

### GenAI Engineer Associate

| # | Topic Folder | Key Files |
|---|---|---|
| 01 | `01-rag-architecture` | rag-design-patterns, document-processing-chunking, retrieval-augmentation-strategies |
| 02 | `02-vector-search-embeddings` | embeddings-models, databricks-vector-search, vector-search-production |
| 03 | `03-llm-application-development` | prompt-engineering, chains-agents, evaluation-llm-apps |
| 04 | `04-databricks-genai-tools` | mosaic-ai-and-foundation-models, mlflow-for-genai |

### Shared Content

| Section | Key Files |
|---|---|
| `shared/fundamentals/` | platform-architecture, databricks-workspace, delta-lake-basics, spark-fundamentals, sql-essentials, streaming-fundamentals, unity-catalog-basics, medallion-architecture, mlflow-basics, feature-engineering-basics, rag-vector-search-basics, open-table-formats, python-essentials (×2) |
| `shared/cheat-sheets/` | delta-lake-commands, dlt-quick-ref, mlflow-quick-ref, pyspark-api-quick-ref, spark-configurations, sql-functions, unity-catalog-quick-ref, performance-optimization, describe-show-commands |
| `shared/appendix/` | glossary, comparison-tables, error-messages, performance-troubleshooting, version-history |
| `shared/code-examples/python/` | delta_lake_operations, python_patterns, streaming_examples, unity_catalog_setup |
| `shared/code-examples/sql/` | cte_patterns, delta_lake_operations, window_functions |
| `shared/interview-prep/` | system-design, delta-lake-internals, pipeline-architecture, performance-optimization, streaming-cdc, governance-security, file-formats-spark, pyspark-api, python-code-quality, data-modeling |
