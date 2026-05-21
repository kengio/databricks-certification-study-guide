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

A Genie Space gets more accurate as you give it more *context*. Four primary knobs (per the official best practices), in roughly the order to reach for them:

1. **SQL expressions** — reusable, named SQL fragments Genie can call. The recommended *first* tool: more reliable than free-text instructions because the SQL is exact.
2. **Example SQL queries** — canonical SQL for common analysis patterns; Genie learns to recognise when to emit a similar shape. Parameterised example queries can also generate exact-match "Trusted" responses.
3. **Text instructions** — plain-English guidance. Official guidance: use as a **last resort** when SQL expressions and examples don't fit.
4. **Synonyms / metadata descriptions** — column-level synonyms and table/column descriptions that improve term resolution (e.g., "revenue" → `invoice_total`).

> [!abstract]
>
> - **SQL expressions** = named SQL Genie can plug into generated queries (exact, deterministic)
> - **Example SQL queries** = canonical SQL examples; optional NL prompt annotations describe when to use each
> - **Text instructions** = free-form guidance — fallback when SQL can't express the rule
> - **Synonyms** = teach Genie that "revenue" means `invoice_total`, or that "active" means `status = 'ACTIVE' AND deleted_at IS NULL`
> - **"Trusted asset"** is an informal term in the docs for curated content (SQL expressions + example queries) Genie reliably uses; "certified queries" is community shorthand for the same — neither is a formal first-class object

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
| **Disambiguate columns** | `Both customers and orders have customer_id. Use customers.customer_id when joining the two.` |

## Example SQL queries

For each common analysis pattern in the domain, add an example SQL query that demonstrates the canonical shape. The SQL is the contract; an optional NL prompt annotation describes when to use it:

```sql
-- Pattern: "How many active customers signed up in <period>?"
SELECT COUNT(*)
FROM main.crm.customers
WHERE status = 'ACTIVE'
  AND signup_date >= date_trunc('month', current_date - INTERVAL 1 MONTH)
  AND signup_date <  date_trunc('month', current_date);
```

A handful of well-chosen examples beats a sprawling collection. Cover the common shapes — counts, ranks, trends, joins — and let Genie generalise. **Parameterised** example queries (with `?`-style placeholders) can also generate exact-match "Trusted" answers when a user's question matches the parameterisation closely.

## Trusted content (informal term)

"Trusted asset" and "certified query" are informal shorthand used in the Databricks docs and community for **SQL expressions + example queries** that you've curated explicitly so Genie reliably uses them. They're not separate first-class objects — they ARE the SQL expressions and example queries listed above, with the additional convention that the team treats them as the canonical building blocks for that Genie Space.

Use them when:

- The SQL is non-trivial (multi-CTE, complex window logic) and you want Genie to call it rather than re-derive it
- You want to enforce a particular implementation (e.g., revenue calculation must use this SQL expression)
- You want consumers to recognise common answers as coming from a known, vetted source

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
> - **Prefer SQL expressions over text instructions** when both can express the rule — the official guidance is to use text instructions as a last resort.
> - Example queries are **SQL** (with optional NL annotations describing when each applies).
> - Synonyms (column-level metadata) are a separate, complementary lever.

## Key Takeaways

- Four curation knobs: SQL expressions, example SQL queries, text instructions (last resort), synonyms/metadata
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
