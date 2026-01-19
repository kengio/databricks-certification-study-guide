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
├── _shared/                  # Content shared across certifications
│   ├── fundamentals/         # Core concepts (Delta Lake, Spark, etc.)
│   ├── cheat-sheets/         # Quick reference guides
│   ├── appendix/             # Glossary, comparisons, errors
│   └── code-examples/        # Python and SQL examples
├── learning-paths/           # Certification progression guides
└── images/                   # Shared images and diagrams
```

## Content Guidelines

### When Adding Content

1. **Check `_shared/` first** - If content applies to multiple certifications, add it there
2. **Certification-specific content** goes in `certifications/<cert-name>/`
3. **Reference shared content** rather than duplicating it

### Markdown Conventions

- Always run markdownlint to check for issues with every MD file
- Ensure headings have blank lines before and after them (MD022 rule)
- Use appropriate code blocks (SQL, Python, Scala)

### Diagrams

- **Always use Mermaid syntax** for diagrams (GitHub renders mermaid natively)
- Never use ASCII/text-based diagrams - convert to mermaid
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
- Use centered HTML format for images with captions on separate line:

```markdown
<p align="center">
  <img src="../../images/databricks-ui/feature/image-name.png" alt="Alt text describing the image" />
</p>
<p align="center"><em>Caption explaining what the screenshot shows</em></p>
```

### Link Verification

- **Always link directly to files, not folders** (e.g., `path/to/README.md` not `path/to/`)
- When adding or modifying links, confirm the target file exists
- Standard entry points for each section:
  - `certifications/data-engineer-associate/README.md`
  - `certifications/data-engineer-professional/README.md`
  - `certifications/data-analyst-associate/README.md`
  - `certifications/ml-associate/README.md`
  - `certifications/ml-professional/README.md`
  - `certifications/genai-engineer-associate/README.md`
  - `_shared/fundamentals/README.md`
  - `learning-paths/README.md`

### Content Requirements

- Include sample images of Databricks platform UI when helpful
- Include step-by-step setup guides for configurations
- Add a use cases section for each topic
- Add common issues/errors that appear in exam questions
- Reference official Databricks documentation
- Use information from 2025 or 2026 sources

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
