---
title: Analytics Applications Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, analytics, parameters, row-level-security]
---

# Analytics Applications Practice Questions

**Exam Weight: 11%**

[← Back to Practice Questions](./README.md) | [Back to Resources](../README.md)

---

## Question 1: Query Parameter Type *(Easy)*

A dashboard has a dropdown for selecting a region that filters all queries. What is the parameter
widget type?

A) Text box — allows free-form input
B) Dropdown list — allows selection from predefined values
C) Date picker — for calendar selection
D) Number input — for numeric values

> [!success]- Answer
> **Correct Answer: B**
>
> Dropdown list parameters let users choose from a predefined set of values (e.g., regions). The
> selected value is substituted into `{{region}}` in the SQL query. Text boxes allow any input,
> date pickers are for calendar dates, and number inputs are for numeric ranges.

---

## Question 2: Multi-Value Parameter *(Medium)*

An analyst needs a filter that allows selecting multiple product categories at once. Which SQL
syntax handles multiple values from a multi-select dropdown?

A) `WHERE category = '{{categories}}'`
B) `WHERE category IN ({{categories}})`
C) `WHERE category LIKE '{{categories}}%'`
D) `WHERE category CONTAINS '{{categories}}'`

> [!success]- Answer
> **Correct Answer: B**
>
> When a parameter supports multiple values, they are substituted as a comma-separated list.
> `IN ({{categories}})` correctly handles single or multiple selected values. Using `= '{{...}}'`
> only matches a single value. `LIKE` and `CONTAINS` do not handle multi-value substitution.

---

## Question 3: Scheduled Query Use Case *(Hard)*

A data team runs a heavy aggregation query daily to populate a summary table for analyst
dashboards. Which approach reduces dashboard load time?

A) Have each dashboard query run the aggregation when opened
B) Schedule the aggregation query to run nightly and write results to a Delta table; dashboard
   queries read from the summary table
C) Use a larger SQL warehouse so aggregation runs faster on-demand
D) Enable query caching on the dashboard

> [!success]- Answer
> **Correct Answer: B**
>
> Pre-computing aggregates with a scheduled query and storing results in a summary Delta table
> dramatically reduces dashboard query time. On-demand aggregation of raw data slows every user's
> experience. A larger warehouse (C) reduces run time but still runs the expensive query per
> session. Query caching (D) helps for repeated identical queries but does not help when underlying
> data changes.

---

## Question 4: Row-Level Security *(Hard)*

A sales dashboard must show each sales rep only their own region's data. Which feature implements
this transparently without requiring separate dashboards?

A) Dashboard-level filter set by each user
B) A WHERE clause hardcoded for each user in the dashboard query
C) Row-level security (row access policy) on the underlying Delta table via Unity Catalog
D) Separate dashboard per region

> [!success]- Answer
> **Correct Answer: C**
>
> Row-level security in Unity Catalog applies dynamic filters based on the current user's identity,
> transparently enforcing data access without requiring separate objects or manual filter
> configuration. This works at the table level, so the policy applies to all queries regardless
> of how the table is accessed. Available with Pro or Serverless SQL warehouses.

---

## Question 5: Dashboard Embedding *(Medium)*

A company wants to embed a Databricks SQL dashboard in their internal web portal for non-Databricks
users. Which capability enables this?

A) Delta Sharing
B) REST API polling for dashboard screenshots
C) Dashboard embedding using the published URL or iFrame embedding (if enabled by admin)
D) Export to HTML and host separately

> [!success]- Answer
> **Correct Answer: C**
>
> Published Databricks dashboards can be embedded in external applications via iFrame using the
> public URL. Admin must enable external sharing or anonymous access in workspace settings. Delta
> Sharing (A) exposes data, not dashboards. REST API polling (B) is not a supported embedding
> method. HTML export (D) would produce a static snapshot, not a live dashboard.

---

## Question 6: Alert Refresh vs Query Refresh *(Medium)*

What is the difference between refreshing a dashboard query and refreshing a SQL alert?

A) They are the same — both use the same schedule configuration
B) Dashboard refresh updates visualization data; SQL alert refresh evaluates the alert condition
   and sends notifications if triggered
C) Dashboard refresh is automatic; SQL alerts never auto-refresh
D) SQL alerts only work on scheduled queries, not dashboard queries

> [!success]- Answer
> **Correct Answer: B**
>
> Dashboard refresh updates the data shown in visualizations. SQL alert refresh runs the alert
> query and checks whether the trigger condition is met, sending notifications if true. They are
> independently configured objects in Databricks SQL and can have different schedules.

---

## Question 7: Query Result Caching *(Medium)*

Databricks SQL query result caching can improve performance. Under which condition does the cache
NOT apply?

A) The query runs within 24 hours of the last execution
B) The underlying Delta table has been modified since the last query execution
C) The same query text is used
D) The same SQL warehouse is used

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL caches query results but invalidates the cache when the underlying data changes.
> If new data was written to the Delta table, the cache is stale and the query runs fresh against
> the current data. Cache hits require identical query text, the same warehouse, and no data
> changes in the source table.

---

**[← Previous: Dashboards & Visualization Practice Questions](./04-dashboards-visualization.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md)**
