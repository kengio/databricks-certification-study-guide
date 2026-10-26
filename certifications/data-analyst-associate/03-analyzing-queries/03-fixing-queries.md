---
title: Fixing Queries
type: study-material
tags:
  - data-analyst-associate
  - sql
  - debugging
  - query-correctness
---

# Fixing Queries

## Overview

Section 5 of the October 2025 exam guide ends with "fix a query to achieve the desired results". Exam items show a short query, describe what the analyst wanted, and ask what is wrong. Most answers come from a small set of SQL mistakes, collected here.

> [!abstract]
>
> - Grouping mistakes: missing `GROUP BY`, unaggregated columns, aggregates in `WHERE`
> - NULL mistakes: `= NULL`, NULL-unsafe comparisons, outer joins undone by `WHERE`
> - Join mistakes: missing key columns, duplicate keys
> - Filtering window results with `QUALIFY`

> [!tip] What the Exam Tests
>
> - Spotting the one clause that makes a query return the wrong result or fail
> - Choosing the minimal fix

---

## Common Mistakes and Fixes

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `SELECT region, COUNT(*) FROM customers ORDER BY region` does not give a count per region | No `GROUP BY` | Add `GROUP BY region` |
| Error: column not in `GROUP BY` | A selected column is neither grouped nor aggregated | Add it to `GROUP BY` (or use `GROUP BY ALL`), or aggregate it |
| Error: aggregate in `WHERE` | `WHERE COUNT(*) > 5` | Move it to `HAVING` |
| `WHERE discount = NULL` returns nothing | `=` with NULL yields NULL | Use `IS NULL` / `IS NOT NULL` |
| `LEFT JOIN` loses unmatched rows | A `WHERE` filter on the right table removes NULL rows | Move the right-table filter into `ON` |
| Row counts multiply after a join | Joined on part of a composite key, or the right table has duplicate keys | Join on every key column; deduplicate or aggregate first |
| "Top 1 per group" returns ties | `RANK()` or `DENSE_RANK()` used | Use `ROW_NUMBER()` with `QUALIFY ... = 1` |
| Window function in `WHERE` fails | `WHERE` runs before window functions | Use `QUALIFY` |
| Average looks too high | `AVG` ignores NULLs | Use `AVG(COALESCE(x, 0))` if NULL should count as 0 |
| `UNION` loses rows | `UNION` removes duplicates | Use `UNION ALL` |
| Off-by-one substring | `SUBSTR(str, pos, len)` takes a length, not an end position | Recompute the length |
| `datediff` is negative | Arguments reversed | `datediff(end_date, start_date)` |

## Worked Examples

```sql
-- Wanted: number of customers in each region
-- Broken:
SELECT region, COUNT(*) AS number_of_customers FROM customers ORDER BY region;
-- Fixed:
SELECT region, COUNT(*) AS number_of_customers
FROM customers
GROUP BY region
ORDER BY region;
```

```sql
-- Wanted: every customer, with their 2026 orders if any
-- Broken (acts like an INNER JOIN):
SELECT c.id, o.amount
FROM customers c LEFT JOIN orders o ON c.id = o.customer_id
WHERE o.order_year = 2026;
-- Fixed:
SELECT c.id, o.amount
FROM customers c LEFT JOIN orders o
  ON c.id = o.customer_id AND o.order_year = 2026;
```

```sql
-- Wanted: the single best-selling product per category
SELECT category, product, revenue
FROM product_sales
QUALIFY ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) = 1;
```

## A Debugging Routine

1. Restate what the query should return (grain: one row per what?).
2. Check `GROUP BY` against the `SELECT` list.
3. Check every join: all key columns, and whether keys are unique on the right side.
4. Check filters on outer-joined tables and comparisons with NULL.
5. Use Databricks Assistant (now Genie Code): `/explain` to walk through the query, `/fix` or **Diagnose error** for errors.
6. For slow rather than wrong queries, open the [query profile](./01-photon-and-query-performance.md).

## Use Cases

- **Exam scenarios**: "The query did NOT meet the analyst's requirements. What is the reason?"
- **Dashboard bugs**: A KPI that double-counts after a new join.

## Common Issues & Errors

### Query runs but numbers are wrong

**Scenario:** No error, but totals are too high.
**Fix:** Check join cardinality — duplicate keys on the right side multiply rows.

### Query fails with an analysis error

**Scenario:** The error mentions a column that is not grouped or a misplaced aggregate.
**Fix:** Align `GROUP BY` with the `SELECT` list; move aggregate conditions to `HAVING`.

## Exam Tips

- Count "per X" → `GROUP BY X`
- `WHERE` (rows) → `HAVING` (groups) → `QUALIFY` (window results)
- NULL needs `IS NULL`
- Outer join + `WHERE` on the outer table = inner join

## Key Takeaways

- Most "fix the query" items are grouping, NULL, join, or filter-order mistakes
- Pick the smallest change that produces the stated result

## Related Topics

- [Aggregations, Sorting & Filtering](../01-executing-queries-databricks-sql-warehouses/04-aggregations-grouping.md)
- [Joins & Set Operations](../01-executing-queries-databricks-sql-warehouses/03-joins-and-set-operations.md)
- [Window Functions & Analytics](../01-executing-queries-databricks-sql-warehouses/05-window-functions.md)

## Official Documentation

- [SELECT](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select)
- [GROUP BY clause](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-groupby)
- [QUALIFY clause](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-qry-select-qualify)

---

**[← Previous: Delta History & Liquid Clustering](./02-delta-history-and-liquid-clustering.md) | [↑ Back to Section](./README.md)**
