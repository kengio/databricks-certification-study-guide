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
