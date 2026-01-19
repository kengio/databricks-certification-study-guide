# Databricks Certification Study Guide

A comprehensive study guide for all Databricks certifications.

## Certifications

### Data Engineering

| Certification | Level | Status |
|--------------|-------|--------|
| [Data Engineer Associate](certifications/data-engineer-associate/) | Associate | 📝 Placeholder |
| [Data Engineer Professional](certifications/data-engineer-professional/) | Professional | ✅ In Progress |

### Data Analytics

| Certification | Level | Status |
|--------------|-------|--------|
| [Data Analyst Associate](certifications/data-analyst-associate/) | Associate | 📝 Placeholder |

### Machine Learning

| Certification | Level | Status |
|--------------|-------|--------|
| [ML Associate](certifications/ml-associate/) | Associate | 📝 Placeholder |
| [ML Professional](certifications/ml-professional/) | Professional | 📝 Placeholder |

### Generative AI

| Certification | Level | Status |
|--------------|-------|--------|
| [GenAI Engineer Associate](certifications/genai-engineer-associate/) | Associate | 📝 Placeholder |

## Certification Paths

```mermaid
graph LR
    DEA[DE Associate] --> DEP[DE Professional]
    MLA[ML Associate] --> MLP[ML Professional]
    DEA --> MLA
    MLA --> GAIA[GenAI Associate]
```

See [Learning Paths](learning-paths/) for detailed progression guides.

## Shared Resources

| Resource | Description |
|----------|-------------|
| [Fundamentals](_shared/fundamentals/) | Core concepts used across certifications |
| [Cheat Sheets](_shared/cheat-sheets/) | Quick reference guides |
| [Appendix](_shared/appendix/) | Glossary, comparisons, error reference |
| [Code Examples](_shared/code-examples/) | Python and SQL examples |

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
├── _shared/                  # Content shared across certifications
│   ├── fundamentals/
│   ├── cheat-sheets/
│   ├── appendix/
│   └── code-examples/
├── learning-paths/           # Certification progression guides
└── images/                   # Shared images and diagrams
```

## Official Resources

- [Databricks Certifications](https://www.databricks.com/learn/certification)
- [Databricks Documentation](https://docs.databricks.com/)
- [Databricks Academy](https://www.databricks.com/learn/training)

---

*Last updated: January 2026*
