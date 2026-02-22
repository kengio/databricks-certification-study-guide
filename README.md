---
title: Databricks Certification Study Guide
type: overview
status: stable
tags:
  - databricks
  - certification
  - study-guide
---

# Databricks Certification Study Guide

A comprehensive study guide for all Databricks certifications.

## Certifications

### Data Engineering

| Certification                                                                     | Level        | Status           |
| --------------------------------------------------------------------------------- | ------------ | ---------------- |
| [Data Engineer Associate](certifications/data-engineer-associate/README.md)       | Associate    | ✅ Complete |
| [Data Engineer Professional](certifications/data-engineer-professional/README.md) | Professional | ✅ Complete |

### Data Analytics

| Certification                                                             | Level     | Status        |
| ------------------------------------------------------------------------- | --------- | ------------- |
| [Data Analyst Associate](certifications/data-analyst-associate/README.md) | Associate | ✅ Complete |

### Machine Learning

| Certification                                                | Level        | Status        |
| ------------------------------------------------------------ | ------------ | ------------- |
| [ML Associate](certifications/ml-associate/README.md)        | Associate    | ✅ Complete |
| [ML Professional](certifications/ml-professional/README.md)  | Professional | ✅ Complete |

### Generative AI

| Certification                                                                 | Level     | Status        |
| ----------------------------------------------------------------------------- | --------- | ------------- |
| [GenAI Engineer Associate](certifications/genai-engineer-associate/README.md) | Associate | ✅ Complete |

## Certification Paths

```mermaid
graph TD
    DEA[Data Engineer Associate] --> DEP[Data Engineer Professional]
    DAA[Data Analyst Associate] --> DEA
    MLA[ML Associate] --> MLP[ML Professional]
    DEA --> MLA
    GAIA[GenAI Engineer Associate]
    MLA --> GAIA
```

See [Learning Paths](learning-paths/README.md) for detailed progression guides.

## Shared Resources

| Resource                                                     | Description                            |
| ------------------------------------------------------------ | -------------------------------------- |
| [Fundamentals](shared/fundamentals/README.md)               | Core concepts used across certifications |
| [Cheat Sheets](shared/cheat-sheets/README.md)               | Quick reference guides                 |
| [Appendix](shared/appendix/README.md)                       | Glossary, comparisons, error reference |
| [Code Examples](shared/code-examples/README.md)             | Python and SQL examples                |
| [Interview Prep](shared/interview-prep/README.md)           | Open-ended design and architecture questions |

## Quick Start

1. Choose a certification from the table above
2. Review the prerequisites in the certification README
3. Study the shared fundamentals first
4. Work through the certification-specific topics
5. Use cheat sheets for final review

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
│   ├── fundamentals/
│   ├── cheat-sheets/
│   ├── appendix/
│   ├── code-examples/
│   └── interview-prep/
├── learning-paths/           # Certification progression guides
└── images/                   # Shared images and diagrams
```

## Official Resources

- [Databricks Certifications](https://www.databricks.com/learn/certification)
- [Databricks Documentation](https://docs.databricks.com/)
- [Databricks Academy](https://www.databricks.com/learn/training)

---

*Last updated: February 2026*
