---
title: Creating Dashboards and Visualizations Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, ai-bi-dashboards, visualizations, parameters, alerts]
---

# Creating Dashboards and Visualizations Practice Questions

**Exam Weight: 16 %** — Section 6 of the October 2025 exam guide

Questions marked *(2025 blueprint)* target skills added in the October 2025 exam guide. All questions were checked against the Databricks documentation on October 26, 2026. Parameters use named parameter markers (`:name`). Legacy mustache syntax (`{{ }}`) appears only where it is labelled legacy.

[← Previous: Executing Queries](./01-executing-queries.md) | [↑ Back to Practice Questions](./README.md) | [Next: Analyzing Queries](./03-analyzing-queries.md)

---

## Question 1: Showing a Single KPI *(Easy)*

Which AI/BI dashboard visualization displays one aggregated number prominently, such as total revenue?

A) Table  
B) Counter  
C) Line  
D) Pivot  

> [!success]- Answer
> **Correct Answer: B**
>
> A counter displays a single value prominently and can compare it against an offset value, which suits KPIs.
>
> A table shows rows and columns, a line chart shows change over time, and a pivot summarises values across two dimensions.

---

## Question 2: Legacy Dashboards *(Easy)*

A team still has dashboards built in the legacy Databricks SQL dashboard editor. What does Databricks recommend?

A) Use AI/BI dashboards; legacy dashboards are no longer supported and new ones cannot be created  
B) Keep building new legacy dashboards because they run queries faster  
C) Export legacy dashboards to PDF and stop using dashboards  
D) Convert them to notebook dashboards  

> [!success]- Answer
> **Correct Answer: A**
>
> AI/BI dashboards (previously called Lakeview dashboards) are the current dashboarding product. Databricks has retired the legacy dashboard documentation, you can no longer create legacy dashboards, and Databricks recommends AI/BI dashboards instead.
>
> Dashboard speed depends on the queries and the warehouse, not the editor (B).

---

## Question 3: Daily Dashboard Refresh *(Medium)*

A stakeholder needs a dashboard to refresh automatically every morning at 8 AM. How should this be configured?

A) Click **Schedule** on the dashboard and set the frequency, time, and time zone  
B) Do nothing, because dashboards refresh only when opened  
C) Write a notebook that screenshots the dashboard and schedule it as a job  
D) Dashboards cannot be scheduled, so schedule each query instead  

> [!success]- Answer
> **Correct Answer: A**
>
> The **Schedule** button on an AI/BI dashboard sets the frequency, start time, and time zone, with optional cron syntax. By default the scheduled run uses the dashboard's SQL warehouse, and you can choose another one in the advanced settings.
>
> Schedules can also send snapshots to subscribers, so no custom notebook is needed (C).

---

## Question 4: Alert Threshold *(Medium)*

An analyst creates a SQL alert on a query that returns the count of failed transactions. The alert should trigger when the count is greater than 100. How should the condition be set?

A) Value is NULL  
B) Value `=` 100  
C) Value `>` 100  
D) Value `>=` 100  

> [!success]- Answer
> **Correct Answer: C**
>
> An alert condition compares a column to a threshold using an operator. The column can be the value in the first row or an aggregate across rows, such as `SUM` or `AVG`, and the threshold is a static value by default. "Greater than 100" is `> 100`.
>
> `>=` would also trigger at exactly 100 (D). `= 100` triggers only at 100 (B), and `IS NULL` checks for missing values (A).

---

## Question 5: Sending an Alert to Slack *(Medium)*

A SQL alert must post to a Slack channel when it triggers. How is this set up?

A) A workspace admin creates a Slack notification destination, and the alert author selects it in the alert's notification settings  
B) The alert author pastes the Slack password into the alert query  
C) A Python script polls the alert status every minute  
D) Alerts can notify only by email  

> [!success]- Answer
> **Correct Answer: A**
>
> Workspace admins set up notification destinations. Alert authors then choose users or destinations in the alert's notification settings. **Notify on OK** can also send a message when the alert returns to normal.
>
> No custom polling is needed (C), and alerts are not limited to email (D).

---

## Question 6: Sharing with Account Users *(Medium)*

A manager wants a published AI/BI dashboard to be viewable by partner users who are registered in the Databricks account but are not members of the workspace. What should they do?

A) Add every partner to the workspace with edit rights  
B) Email a CSV export every week  
C) Share the published dashboard with those account users, or allow anyone in the account to view it  
D) Use Delta Sharing to share the dashboard  

> [!success]- Answer
> **Correct Answer: C**
>
> Published dashboards can be shared with account users who have no workspace access. Those users are limited to the CAN RUN permission, and they sign in with email, a one-time passcode, or SSO.
>
> Adding everyone to the workspace grants far more access than needed (A). Delta Sharing (now OpenSharing) shares data, not dashboards (D).

---

## Question 7: Trend over Time *(Easy)*

Sales data must show the trend over 12 months. Which visualization is most appropriate?

A) Bar chart  
B) Line chart  
C) Scatter plot  
D) Pie chart  

> [!success]- Answer
> **Correct Answer: B**
>
> Line charts present the change in one or more metrics over time.
>
> Bar charts suit comparisons across categories. Scatter plots show the relationship between two numeric variables. Pie charts show proportions of a whole.

---

## Question 8: Detailed Ranked List *(Easy)*

Which scenario is best suited to a table visualization?

A) Total revenue as one KPI number  
B) The sales trend over 12 months  
C) The top 20 products with their revenue, units sold, and rank  
D) The share of sales by region  

> [!success]- Answer
> **Correct Answer: C**
>
> Tables show many columns per row and let you reorder, hide, and format columns, which suits detailed lists.
>
> KPIs use counters (A), trends use line charts (B), and proportions use pie or bar charts (D).

---

## Question 9: Alert Schedule for an SLA *(Medium)*

A SQL alert watches for inventory dropping below a reorder threshold. The business must be notified within one hour. What schedule is appropriate?

A) Every hour or more often  
B) Every 24 hours  
C) Real-time streaming evaluation  
D) Manual evaluation only  

> [!success]- Answer
> **Correct Answer: A**
>
> Alerts run their query on a schedule and evaluate the condition each time. An hourly (or shorter) schedule meets a one-hour notification requirement.
>
> Alerts are not evaluated on a continuous stream (C). A daily schedule misses the requirement (B), and manual evaluation is not automated (D).

---

## Question 10: Parameter Syntax in a Dashboard Dataset *(Easy)*

A dashboard dataset must accept a date selected by viewers. Which syntax does the dataset query use?

A) `@order_date`  
B) `{{order_date}}`  
C) `$order_date`  
D) `:order_date`  

> [!success]- Answer
> **Correct Answer: D**
>
> AI/BI dashboards, the current SQL editor, notebooks, and Genie use named parameter markers: a colon followed by the parameter name.
>
> The double-brace mustache syntax (B) is legacy and works only in the legacy SQL editor. Dashboards do not support it, so queries that use it must be converted to named markers.

---

## Question 11: Region Dropdown *(Easy)*

A dashboard needs a control that lets viewers pick one region from a list, and the selected region filters a dataset through the `:region` parameter. What should the author add?

A) A text widget  
B) A date picker  
C) A counter visualization  
D) A filter widget with a single-value selector bound to the `:region` parameter  

> [!success]- Answer
> **Correct Answer: D**
>
> Parameters can be bound to filter widgets so that viewers' choices are passed into the query. A single-value selector restricts the choice to one value from a list.
>
> Text widgets display content and do not pass values (A). A counter is a visualization (C).

---

## Question 12: Multi-Select Parameter *(Medium)*

A dashboard parameter `:categories` has **Allow multiple selections** turned on. Which `WHERE` clause handles one or many selected values?

A) `WHERE category = :categories`  
B) `WHERE array_contains(:categories, category)`  
C) `WHERE category IN (:categories)`  
D) `WHERE category LIKE :categories`  

> [!success]- Answer
> **Correct Answer: B**
>
> A multi-select parameter is passed as an array, so the query must use `ARRAY_CONTAINS`. Adding `OR :categories IS NULL` handles the "All" selection.
>
> The other options compare a single value to an array. `IN ({{ ... }})` was a pattern for the legacy mustache syntax.

---

## Question 13: Embedding for External Users *(Hard)*

A company wants to embed a published AI/BI dashboard in its customer portal. The customers do not have Databricks accounts. Which approach does Databricks support?

A) Basic iframe embedding, which needs no sign-in  
B) Delta Sharing the dashboard  
C) Exporting the dashboard to HTML and hosting it  
D) Embedding for external users, where the application authenticates to Databricks with a service principal  

> [!success]- Answer
> **Correct Answer: D**
>
> Embedding for external users lets viewers without Databricks accounts see a dashboard. The application authenticates with a service principal and an OAuth secret, and the tokens are valid for one hour.
>
> Basic embedding requires viewers to sign in with Databricks credentials (A). Only published dashboards can be embedded, and workspace admins must define the surfaces where embedding is allowed.

---

## Question 14: Dashboard Refresh vs Alert Evaluation *(Medium)*

What is the difference between a dashboard schedule and a SQL alert schedule?

A) They are the same object  
B) Dashboards refresh automatically, while alerts never run on a schedule  
C) A dashboard schedule refreshes the dashboard's data and can send snapshots; an alert schedule runs the alert query, evaluates the condition, and notifies when it is met  
D) Alerts can be built only on dashboard datasets  

> [!success]- Answer
> **Correct Answer: C**
>
> Dashboards and alerts are separate objects with their own schedules. An alert evaluates to OK, TRIGGERED, or ERROR each time it runs.
>
> In the latest alerts, the query is written in the alert itself, so an existing saved query cannot be reused (D).

---

## Question 15: Pages and Datasets *(Easy)* *(2025 blueprint)*

A dashboard needs an executive summary page and a detailed operations page. Each page shows charts from different tables. How is this built in AI/BI dashboards?

A) Build two dashboards and link them with a URL  
B) Create one dataset that joins every table, because a dashboard allows only one dataset  
C) Add a second page to the canvas and define several datasets on the Data tab  
D) Use a notebook dashboard for the second page  

> [!success]- Answer
> **Correct Answer: C**
>
> New dashboards start with one page, and you add more with the plus icon next to the page title. The Data tab holds the dashboard's datasets, defined from tables, views, or custom SQL. Visualizations on any page can use any dataset.
>
> A dashboard is not limited to one dataset (B).

---

## Question 16: Text and Images *(Easy)* *(2025 blueprint)*

An author wants a short explanation and the company logo at the top of a dashboard. Which widget types are used?

A) A counter and a table  
B) A text widget for the explanation and an image widget for the logo  
C) A filter widget  
D) Images are not supported in dashboards  

> [!success]- Answer
> **Correct Answer: B**
>
> AI/BI dashboards support visualization, filter, text, and image widgets.
>
> Widget titles and descriptions also support rich text formatting.

---

## Question 17: Chart from a Query Result *(Easy)* *(2025 blueprint)*

An analyst runs a query in the SQL editor and wants a bar chart of the result. What is the quickest way?

A) Click **+** above the result, select **Visualization**, and choose the type  
B) Export the result to CSV and build the chart elsewhere  
C) Create a dashboard first, because visualizations exist only on dashboards  
D) Run `CREATE VISUALIZATION`  

> [!success]- Answer
> **Correct Answer: A**
>
> In both the SQL editor and notebooks, you click **+** above a result and select **Visualization** to open the visualization editor.
>
> In a notebook, a visualization from a SQL cell can also be added to a dashboard. Visualizations from non-SQL cells and data profiles can be added only to a notebook dashboard.

---

## Question 18: Testing a Dataset Parameter *(Medium)* *(2025 blueprint)*

An author adds `WHERE region = :region` to a dashboard dataset and wants to check the query before publishing. How is the parameter tested?

A) Publish the dashboard and ask a viewer to try it  
B) Replace `:region` with a literal, run it, then put the marker back  
C) Type a value in the field under the parameter name in the dataset editor and run the query  
D) Parameters cannot be tested in the dataset editor  

> [!success]- Answer
> **Correct Answer: C**
>
> To test, type a value into the text field under the parameter name and run the query. Running it also saves that value as the parameter's default.
>
> No publishing or query editing is needed (A, B).

---

## Question 19: Date Range Parameter *(Medium)* *(2025 blueprint)*

A dashboard parameter `:ship_date` is a date range. Which clause filters the dataset to the selected range?

A) `WHERE l_shipdate BETWEEN :ship_date.start AND :ship_date.end`  
B) `WHERE l_shipdate BETWEEN '{{ ship_date.start }}' AND '{{ ship_date.end }}'`  
C) `WHERE l_shipdate = :ship_date`  
D) `WHERE l_shipdate BETWEEN :ship_date.min AND :ship_date.max`  

> [!success]- Answer
> **Correct Answer: D**
>
> A date range parameter exposes `.min` and `.max` values. Adding `OR :ship_date IS NULL` handles the "All" selection.
>
> `.start` and `.end` are not the property names (A). Option B is legacy mustache syntax, which dashboards do not support.

---

## Question 20: Publishing with Viewer Permissions *(Hard)* *(2025 blueprint)*

A sales table has a Unity Catalog row filter so each rep sees only their own region. After a dashboard is published, every rep sees all regions. What is the most likely cause, and the fix?

A) Row filters do not apply to dashboards, so add a dashboard filter  
B) The warehouse is too small, so increase its size  
C) The row filter must be attached to the dashboard instead of the table  
D) The dashboard was published with shared data permissions, so queries run with the publisher's credentials; republish with individual data permissions  

> [!success]- Answer
> **Correct Answer: D**
>
> By default, viewers run queries with the publisher's credentials (shared data permissions), so the row filter evaluates the publisher's identity. With individual data permissions, viewers run queries with their own credentials, and the row filter applies per viewer.
>
> Row filters are attached to tables and apply to every query (A, C). Warehouse size has nothing to do with access (B).

---

## Question 21: Snapshot to a Teams Channel *(Medium)* *(2025 blueprint)*

A team wants a snapshot of a dashboard posted to a Microsoft Teams channel every Monday at 9 AM. What should the dashboard author do?

A) Share the dashboard link in Teams once  
B) Create a SQL alert with a condition that is always true  
C) Embed the dashboard in Teams  
D) Create a schedule for Monday 9 AM and add a Teams notification destination as a subscriber  

> [!success]- Answer
> **Correct Answer: D**
>
> Schedules can have subscribers, including Slack and Microsoft Teams notification destinations that a workspace admin has configured. Teams and Slack subscribers receive a PNG snapshot, a link to the dashboard, and a PDF. Email subscribers receive a PDF snapshot.
>
> A subscription list can hold up to 100 subscribers, and a notification destination counts as one.

---

## Question 22: Relationship Between Two Measures *(Easy)* *(2025 blueprint)*

An analyst wants to show whether advertising spend and revenue move together across 200 campaigns. Which visualization communicates this best?

A) Pie chart  
B) Counter  
C) Scatter plot  
D) Funnel  

> [!success]- Answer
> **Correct Answer: C**
>
> Scatter plots show the relationship between two numeric variables. Each campaign is one point.
>
> Pie charts show proportions (A), counters show one value (B), and funnels show drop-off between stages (D).

---

## Question 23: Filter or Parameter? *(Hard)* *(2025 blueprint)*

A dashboard over a large dataset needs a region selector, plus a city selector that shows only cities in the chosen region. What does Databricks recommend considering first?

A) Field filters, which support cascading and often perform better on large datasets  
B) A parameter in every dataset query  
C) A separate dashboard per region  
D) A text widget listing the regions  

> [!success]- Answer
> **Correct Answer: A**
>
> Field filters filter a dataset's fields, support cascading behaviour, and often perform better on large datasets, so Databricks recommends considering them first.
>
> Parameters change the query itself. They are useful when the value must go inside the SQL, for example in a calculation or a function argument.

---

**[← Previous: Executing Queries Practice Questions](./01-executing-queries.md) | [↑ Back to Data Analyst Associate Practice Questions](./README.md) | [Next: Analyzing Queries Practice Questions →](./03-analyzing-queries.md)**
