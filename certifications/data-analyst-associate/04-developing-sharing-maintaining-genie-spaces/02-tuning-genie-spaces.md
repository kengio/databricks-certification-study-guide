---
title: Tuning Genie Spaces
type: study-material
tags:
  - data-analyst-associate
  - ai-bi-genie
  - genie-spaces
status: published
---

# Tuning Genie Spaces

## Overview

A Genie Space gets more accurate as you give it more *context*. Three knobs:

1. **Instructions** — plain-English guidance Genie always honours.
2. **Example queries (few-shot)** — paired natural-language ↔ SQL examples.
3. **Trusted assets** — explicitly approved queries or functions Genie may use as building blocks.

Each curation step compounds: instructions narrow the interpretation; examples teach the pattern; trusted assets give Genie pre-validated SQL to compose into bigger answers.

> [!abstract]
>
> - **Instructions** = "always", "never", definitions of business terms, default filters
> - **Example queries** = NL prompt + the SQL you'd write for it (Genie learns the mapping)
> - **Trusted assets** = curated SQL the consumer can rely on (no hallucination)
> - **Certified queries** = trusted assets with explicit signoff visible to users

> [!tip] What the Exam Tests
>
> - The names of each curation primitive and what each one does
> - That curation improves accuracy without changing data permissions
> - That instructions and examples are independent — you can have either, both, or neither
> - The lifecycle: edit space → re-test in conversation → publish → monitor accuracy

---

## Writing good instructions

| Pattern | Example |
| :--- | :--- |
| **Define a business term** | `"Active customer" means status = 'ACTIVE' and deleted_at is null.` |
| **Default filter** | `Always exclude rows where is_test = true unless explicitly asked.` |
| **Calculation rule** | `Revenue is sum(invoice_total) — do not deduct refunds.` |
| **Date semantics** | `"Last quarter" means the previous full calendar quarter, not the trailing 90 days.` |
| **Tie-breaking** | `When asked about "top customers", rank by revenue descending and limit 10 by default.` |

## Example queries (few-shot)

For each common question pattern in the domain, add an example pair:

```text
NL:  How many active customers signed up last month?
SQL: SELECT COUNT(*)
     FROM main.crm.customers
     WHERE status = 'ACTIVE'
       AND signup_date >= date_trunc('month', current_date - INTERVAL 1 MONTH)
       AND signup_date <  date_trunc('month', current_date);
```

A handful of well-chosen examples beats a sprawling collection. Cover the common shapes — counts, ranks, trends, joins — and let Genie generalise.

## Trusted assets and certified queries

A **trusted asset** is a SQL query (or UDF) that's been explicitly approved as a building block Genie can call. A **certified query** is a trusted asset that's visible to consumers as "officially blessed."

Use trusted assets when:

- The SQL is non-trivial (multi-CTE, complex window logic) and you want Genie to call it rather than re-derive it
- You want to enforce a particular implementation (e.g., revenue calculation must use this query)
- You want consumers to see "this answer came from a certified query"

## Use Cases

- **Domain-specific definitions** that vary per team (active customer, revenue, churn, MAU) — instructions
- **Recurring question patterns** — example queries
- **Complex aggregations that must be consistent** — trusted assets / certified queries
- **Reducing hallucinations on edge questions** — instructions + examples together

## Common Issues & Errors

- **Contradictory instructions** confuse Genie — keep them short and consistent
- **Examples that disagree with instructions** — Genie may pick either; align them
- **Over-curating early** — start small and add curation when you see specific failures in monitoring
- **Stale examples** when tables change — re-test after schema changes

## Exam Tips

> [!tip]
>
> - Instructions ≠ permissions. Instructions guide *interpretation*; UC enforces *access*.
> - Few-shot examples are pairs (NL + SQL), not just SQL.
> - Certified queries are *visible* to consumers as a trust signal.

## Key Takeaways

- Three curation primitives: instructions, examples, trusted/certified assets
- Each improves accuracy independently
- None of them bypass UC permissions
- Curate after observing real failures, not pre-emptively

## Related Topics

- [Genie Spaces Overview](./01-genie-spaces-overview.md)
- [Analyzing Queries](../03-analyzing-queries/README.md)

## Official Documentation

- [Tune your Genie space](https://docs.databricks.com/en/genie/tune-genie-space.html)
- [Certified queries](https://docs.databricks.com/en/genie/best-practices.html)

---

**[← Previous: Genie Spaces Overview](./01-genie-spaces-overview.md) | [↑ Back to AI/BI Genie Spaces](./README.md)**
