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
├── certifications/           # Certification-specific content
│   ├── data-engineer-associate/
│   ├── data-engineer-professional/
│   ├── data-analyst-associate/
│   ├── ml-associate/
│   ├── ml-professional/
│   └── genai-engineer-associate/
├── shared/                  # Content shared across certifications
│   ├── fundamentals/        # Core concepts (Delta Lake, Spark, etc.)
│   ├── cheat-sheets/        # Quick reference guides
│   ├── appendix/            # Glossary, comparisons, errors
│   └── code-examples/       # Python and SQL examples
├── learning-paths/          # Certification progression guides
└── images/                  # Shared images and diagrams
```text

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
- **When to split**: when a file contains two or more conceptually distinct sub-topics that can each stand alone (e.g., "joins & state" vs "monitoring & tuning")
- **How to split**:
  1. Part 1 keeps the original file number with name: `NN-topic-name.md`
  2. Part 2 uses same number with `-part2` suffix: `NN-topic-name-part2.md` (NOT next sequential number)
  3. Each part gets its own YAML frontmatter and a brief 1–2 sentence intro paragraph
  4. Terminal sections (Exam Tips, Practice Questions, Related Topics, Official Docs, Common Issues) go to **Part 2 only** — end Part 1 with a single forward link to Part 2
  5. Update the section `README.md` index table to list both new files
  6. Delete the original oversized file
  7. Search the repo for any links pointing to the old filename and update them all

**Example**: If `03-structured-streaming.md` exceeds 800 lines:

- Part 1 stays: `03-structured-streaming.md`
- Part 2 becomes: `03-structured-streaming-part2.md` (NOT `12-structured-streaming-part2.md`)

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
  ```text

- **Use Obsidian foldable callouts** for answers/spoilers (collapsed by default in Obsidian). Use the `[!success]-` callout type:

  ```markdown
  > [!success]- Answer
  > **Correct Answer: X**
  >
  > Explanation text here.
  ```text

- **Practice Question Choices**: Format as separate lines without bullets. End each line with **two spaces** to force a hard line break:

  ```markdown
  A) Option one
  B) Option two
  C) Option three
  ```text

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
```text

### Images

- **Supplement mermaid diagrams with screenshots** when showing Databricks UI elements
- Store images in `images/databricks-ui/` organized by feature area
- Use descriptive alt text and captions
- Keep images under 800px width for readability
- Use standard markdown image syntax for cross-platform compatibility (GitHub + Obsidian):

```markdown
![Alt text describing the image](../../images/databricks-ui/feature/image-name.png)

*Caption explaining what the screenshot shows*
```text

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
  ```text

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

## Certification Folder Structure (Standardized)

All certifications follow this consistent folder structure for easy navigation and scalability:

```text
certifications/{cert-name}/
├── README.md                           # Certification overview, exam info, study path
├── 01-topic-area/
│   ├── README.md                      # Topic overview, exam weight, contents list
│   ├── 01-subtopic.md                 # Study material (300-600 lines)
│   ├── 02-subtopic.md
│   ├── NN-subtopic.md
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
```text

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

### Data Engineer (Associate & Professional)

- Delta Lake operations and optimization
- Data pipeline design and orchestration
- Data governance with Unity Catalog
- Performance tuning and query optimization
- Structured Streaming
- Change Data Capture (CDC) patterns
- Multi-hop architecture (Bronze/Silver/Gold)

### Data Analyst Associate

- Databricks SQL and warehouses
- Dashboard creation and visualization
- SQL query optimization

### ML Associate & Professional

- MLflow tracking and model registry
- Feature engineering with Spark ML
- Model deployment and serving

### GenAI Engineer Associate

- RAG architecture patterns
- Vector search and embeddings
- LLM application development
