---
title: Dashboards & Visualization Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, dashboards, visualization, alerts]
---

# Dashboards & Visualization Practice Questions

**Exam Weight: 18%**

[← Back to Practice Questions](./README.md) | [Next: Analytics Applications](./05-analytics-applications.md)

---

## Question 1: Dashboard Widget Types *(Easy)*

Which widget type displays a single aggregated number prominently (e.g., total revenue)?

A) Table widget
B) Counter widget
C) Chart widget — line chart
D) Text widget

> [!success]- Answer
> **Correct Answer: B**
>
> Counter widgets display a single prominent metric value, ideal for KPIs and summary stats on
> dashboards. Table widgets display multi-column rows, line charts show trends over time, and
> text widgets display static markdown content.

---

## Question 2: Lakeview vs Legacy Dashboards *(Easy)*

What is the primary advantage of Lakeview Dashboards over legacy dashboards in Databricks SQL?

A) Lakeview supports more SQL functions
B) Lakeview has a modern drag-and-drop canvas UI with improved layout flexibility
C) Lakeview runs queries faster
D) Lakeview automatically applies row-level security

> [!success]- Answer
> **Correct Answer: B**
>
> Lakeview Dashboards (introduced in 2024) provide a modernized canvas-based editor with flexible
> layout, improved sharing, and better visualization options compared to the legacy dashboard
> editor. Performance depends on the underlying queries and warehouse, not the dashboard type.
> Row-level security is a Unity Catalog feature independent of dashboard type.

---

## Question 3: Dashboard Refresh Schedule *(Medium)*

A business stakeholder needs a dashboard to refresh automatically every morning at 8 AM. How
should this be configured?

A) The dashboard refreshes automatically when opened — no configuration needed
B) Set a schedule on the dashboard using a SQL warehouse for execution
C) Create a Databricks Job that triggers a notebook to refresh the dashboard
D) Dashboards cannot be scheduled — only individual queries can

> [!success]- Answer
> **Correct Answer: B**
>
> Dashboards can have a scheduled refresh in Databricks SQL. Configure the schedule (cron or
> interval) and assign a SQL warehouse to run the underlying queries at the specified time.
> The warehouse must be running or set to auto-start for scheduled refresh to succeed.

---

## Question 4: SQL Alert Condition *(Medium)*

An analyst creates a SQL alert on a query that returns the count of failed transactions. The alert
should fire when the count exceeds 100. How should the alert condition be configured?

A) WHEN VALUE IS NULL
B) WHEN VALUE > 100
C) WHEN VALUE = 100
D) WHEN VALUE >= 100 AND VALUE < 200

> [!success]- Answer
> **Correct Answer: B**
>
> SQL alerts support `>`, `<`, `=`, `>=`, `<=`, and `IS NULL` as threshold conditions. Setting
> `> 100` causes the alert to fire whenever the query result exceeds 100. Option D is not a valid
> single alert condition — alerts support one condition at a time.

---

## Question 5: Alert Notification Destination *(Medium)*

A SQL alert needs to send a message to a Slack channel when triggered. Which configuration enables
this?

A) Add a Slack webhook URL as a notification destination in the alert settings
B) Write a Python script that polls the alert status
C) Configure a Databricks Job to check the alert query result
D) Slack integration is not supported — use email only

> [!success]- Answer
> **Correct Answer: A**
>
> Databricks SQL alerts support multiple notification destinations: email, Slack (via webhook),
> PagerDuty, and custom webhooks. Add the Slack incoming webhook URL in the alert's notification
> settings. No custom scripting is required for this native integration.

---

## Question 6: Dashboard Sharing *(Medium)*

A manager wants to share a Databricks SQL dashboard with external stakeholders who don't have
Databricks accounts. Which sharing option allows this?

A) Grant the stakeholders workspace access
B) Publish the dashboard and share the public URL (if enabled by admin)
C) Export to PDF and email it
D) Use Delta Sharing to expose the dashboard data

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks SQL dashboards can be published to create a shareable URL that allows viewing without
> a Databricks login (requires admin to enable anonymous access or external sharing). Granting
> workspace access requires creating user accounts. PDF export is a manual workaround and does not
> stay up to date. Delta Sharing exposes data, not dashboards.

---

## Question 7: Chart Visualization — Bar vs Line *(Easy)*

Sales data needs to show trend over time for 12 months. Which visualization type is most
appropriate?

A) Bar chart — best for time series trends
B) Line chart — shows trends and changes over time clearly
C) Scatter plot — shows correlations
D) Pie chart — shows proportions

> [!success]- Answer
> **Correct Answer: B**
>
> Line charts are ideal for time series data, clearly showing trends, peaks, and patterns over
> time. Bar charts work better for comparing discrete categories. Scatter plots show the
> relationship between two variables. Pie charts show part-to-whole proportions.

---

## Question 8: Table Widget Use Case *(Easy)*

Which scenario is best suited for a table widget in a Databricks SQL dashboard?

A) Showing total revenue as a KPI number
B) Showing sales trend over 12 months
C) Showing the top 20 products with their revenue, units sold, and rank
D) Showing the proportion of sales by region

> [!success]- Answer
> **Correct Answer: C**
>
> Table widgets display tabular data with multiple columns and rows, ideal for detailed lists and
> comparisons. KPIs use counter widgets (A), trends over time use line charts (B), and proportions
> use pie or donut charts (D).

---

## Question 9: Alert Schedule *(Medium)*

A SQL alert monitors inventory below a reorder threshold. The business needs notification within
1 hour of the condition occurring. What schedule frequency is appropriate?

A) Refresh every 24 hours
B) Refresh every 1 hour
C) Real-time streaming alerts
D) Manual refresh only

> [!success]- Answer
> **Correct Answer: B**
>
> Set the alert refresh to 1-hour intervals so that an inventory drop below threshold is detected
> and notified within one hour of occurring. Databricks SQL alerts are not real-time streaming;
> they run on a polling schedule. 24-hour refresh would miss the SLA. Manual refresh provides no
> automation.

---

## Question 10: Dashboard Parameter Syntax *(Easy)*

A dashboard has a date range filter that passes the selected date to multiple queries. Which syntax
is used in SQL queries to accept dashboard parameters?

A) `:date_range` (colon prefix)
B) `@date_range` (at prefix)
C) `{{date_range}}` (double curly braces)
D) `$date_range` (dollar sign prefix)

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks SQL uses `{{parameter_name}}` (double curly braces, also called mustache syntax) for
> query parameters and dashboard filters. The parameter name inside the braces must match the
> parameter widget name configured on the dashboard.

---

**[← Previous: SQL Queries Practice Questions](./03-sql-queries.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Analytics Applications Practice Questions](./05-analytics-applications.md) →**
