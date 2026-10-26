---
title: AI/BI Genie Spaces (Genie Agents) Practice Questions
type: practice-questions
tags: [data-analyst-associate, practice-questions, ai-bi-genie, genie-spaces, genie-agents]
---

# AI/BI Genie Spaces (Genie Agents) Practice Questions

**Exam Weight: 12%**

Questions target the October 2025 blueprint's Genie domain and were checked against the Databricks Genie Agents documentation on October 26, 2026. Genie Spaces were renamed **Genie Agents** on July 8, 2026; the exam still says "Genie spaces".

[← Back to Practice Questions](./README.md) | [Back to Resources](../README.md)

---

## Question 1: Where Genie's Answer Comes From *(Easy)* *(2025 blueprint)*

A business user asks a Genie space, "How many orders shipped last month?" How does Genie produce the number?

A) The model reads the table rows and counts them itself
B) Genie generates a read-only SQL query that runs on the space's SQL warehouse, then summarises the result
C) Genie looks the number up in a cache of previous dashboard results
D) Genie exports the table to the model provider, which computes the answer

> [!success]- Answer
> **Correct Answer: B**
>
> Genie translates the question into read-only SQL, runs it on the space's SQL warehouse, and returns the result table, a visualization, and a text summary.
>
> The model does not scan or count rows (A, D), and Genie does not answer from a dashboard cache (C). This is why Unity Catalog permissions apply: the generated SQL is executed like any other query.

---

## Question 2: Warehouse Requirement *(Easy)* *(2025 blueprint)*

An analyst is creating a Genie space. Which SQL warehouse types can the space use?

A) Any warehouse, including classic
B) Pro or serverless warehouses only
C) Serverless only
D) No warehouse — Genie uses its own compute

> [!success]- Answer
> **Correct Answer: B**
>
> Genie requires a pro or serverless SQL warehouse; Databricks recommends serverless for performance.
>
> Classic warehouses are not supported (A). Serverless is recommended but not the only option (C). Generated SQL runs on the space's warehouse, not on separate Genie compute (D).

---

## Question 3: PII and Genie *(Medium)* *(2025 blueprint)*

A Genie space covers a `customers` table that has a column mask on `email` and a row filter that limits each sales rep to their own region. A sales rep asks Genie, "List the emails of all customers." What happens?

A) Genie returns all emails because the space author created the space
B) Genie refuses every question about the customers table
C) The query runs under the rep's Unity Catalog permissions, so the mask and the row filter apply
D) Genie returns all rows but hides the email column from the chart only

> [!success]- Answer
> **Correct Answer: C**
>
> Genie runs on the author's warehouse, but data access is checked against the asking user's Unity Catalog permissions. Row filters and column masks apply per user.
>
> The author's identity does not widen access (A). Genie does not block the table (B), and masking is enforced by UC in the query result, not only in a chart (D).

---

## Question 4: Consumer Permissions *(Medium)* *(2025 blueprint)*

The marketing team should be able to ask questions in a Genie space. Which combination is sufficient for a marketing user?

A) `CAN USE` on the SQL warehouse and `CAN VIEW` on the space
B) `CAN RUN` on the space and `SELECT` on every Unity Catalog object the space uses (plus consumer access or the Databricks SQL entitlement)
C) `CAN MANAGE` on the space only
D) Workspace admin rights

> [!success]- Answer
> **Correct Answer: B**
>
> Consumers need at least `CAN VIEW` or `CAN RUN` on the space, `SELECT` on the underlying UC data, and the consumer-access or Databricks SQL entitlement.
>
> Consumers do **not** need warehouse permissions — queries run with the warehouse credentials the author embedded — so A adds an unnecessary grant and still misses data access. `CAN MANAGE` (C) and admin rights (D) are far more than needed and still don't grant data access by themselves.

---

## Question 5: Trusted Assets *(Medium)* *(2025 blueprint)*

Which items are **trusted assets** in a Genie space?

A) Text instructions and column synonyms
B) Parameterized example SQL queries and Unity Catalog SQL functions
C) Benchmarks and their ground-truth SQL
D) SQL expressions (filters, measures, fields)

> [!success]- Answer
> **Correct Answer: B**
>
> Trusted assets are parameterized example queries and SQL functions whose exact logic an author verified; answers that use them come from that verified logic.
>
> Text instructions and synonyms (A) are context, not verified logic. Benchmarks (C) are only used to score accuracy. SQL expressions (D) are knowledge-store entries.

---

## Question 6: Parameter Syntax *(Easy)* *(2025 blueprint)*

An author wants an example query that answers "What is revenue for region X?" for any region. How is the parameter written in the example SQL?

A) `WHERE region = ?`
B) `WHERE region = {{region}}`
C) `WHERE region = :region_name`
D) `WHERE region = $region`

> [!success]- Answer
> **Correct Answer: C**
>
> Genie example queries use named parameters: type a colon followed by a name (`:parameter_name`), or click **Add parameter**.
>
> The gear icon sets the parameter's data type (String, Date, Date and Time, Decimal, Integer) and a comment. `?` placeholders, `{{ }}` mustache syntax, and `$` variables are not Genie's parameter syntax.

---

## Question 7: Choosing a Curation Lever *(Medium)* *(2025 blueprint)*

Genie sometimes sums `paid_amount` and sometimes `invoice_total` when users ask about revenue. The business rule is that revenue is always `SUM(invoice_total)`. What is the recommended fix?

A) Add a text instruction: "Revenue means invoice_total"
B) Add a Measure SQL expression named `revenue` with code `SUM(invoice_total)` and synonyms such as "sales"
C) Add a benchmark question about revenue
D) Hide the `paid_amount` column from every user with a UC column mask

> [!success]- Answer
> **Correct Answer: B**
>
> The curation guide says to prioritize SQL expressions and example SQL over text instructions, and to use text instructions only as a last resort. A Measure SQL expression encodes the KPI exactly.
>
> A text instruction (A) works less reliably. A benchmark (C) only measures accuracy — it does not change Genie's context. Masking a column (D) changes data access for everyone and is the wrong tool for an interpretation problem.

---

## Question 8: Users Type Different Values *(Medium)* *(2025 blueprint)*

Users ask about "NYC", but the `city` column stores `New York City`. Genie keeps returning empty results. Which feature addresses this?

A) Entity matching on the `city` column (in the column's Advanced settings)
B) A text instruction listing every city alias
C) Increasing the warehouse size
D) A row filter on `city`

> [!success]- Answer
> **Correct Answer: A**
>
> Entity matching (the value dictionary) maps what users type to the values actually stored. It works on string columns and requires format assistance; limits are 120 columns and 1,024 values per column.
>
> A long alias list in instructions (B) is the last-resort lever and hard to maintain. Warehouse size (C) does not affect interpretation. A row filter (D) restricts access, it doesn't resolve terms.

---

## Question 9: Knowledge Store vs Unity Catalog *(Medium)* *(2025 blueprint)*

A curator edits a table's description in the Genie space's knowledge store. What happens to the table comment in Unity Catalog?

A) It is overwritten with the new description
B) It is unchanged — the knowledge store is scoped to the space; **Reset** restores the UC description in the space
C) It is deleted
D) It is copied into every other Genie space that uses the table

> [!success]- Answer
> **Correct Answer: B**
>
> Knowledge-store descriptions and synonyms are scoped to the Genie space and do not overwrite metadata stored in Unity Catalog. **Reset** brings the UC description back into the space.
>
> To improve every space and tool at once, update the UC comment itself (for example with `COMMENT ON TABLE`).

---

## Question 10: Benchmark Scoring *(Hard)* *(2025 blueprint)*

A benchmark question has a SQL Answer that returns `region, revenue`. In a Chat-mode run, Genie returns the correct revenue per region plus an extra `order_count` column. How is the result labelled?

A) Good, because the revenue values match
B) Bad, because the result has extra columns
C) Manual review needed, always
D) It is skipped because the columns differ

> [!success]- Answer
> **Correct Answer: B**
>
> Chat mode compares result sets with the SQL Answer. Results with extra columns are labelled **Bad**; exact matches, matches with different row sorting, or numeric values that round to the same 4 significant digits are **Good**.
>
> The curator can open the run, compare **Model output** with **Ground truth**, and relabel the result or use **Update ground truth**. Agent mode, by contrast, uses an LLM judge guided by the evaluation note.

---

## Question 11: What Benchmarks Do *(Easy)* *(2025 blueprint)*

What is the purpose of benchmark questions in a Genie space?

A) They are added to Genie's context so similar questions are answered better
B) They score the space's accuracy systematically; they do not feed Genie's context
C) They replace example SQL queries
D) They limit which questions users may ask

> [!success]- Answer
> **Correct Answer: B**
>
> Benchmarks are test questions used only to evaluate accuracy. Up to 500 can be added, and each runs as a new conversation without threaded context.
>
> To improve answers, add example SQL, SQL expressions, functions, or instructions — benchmarks then confirm the improvement.

---

## Question 12: Acting on User Feedback *(Medium)* *(2025 blueprint)*

After a month in production, users have marked several Genie answers with **Fix it** and **Request review**. What is the best maintenance workflow?

A) Raise the warehouse size and ask users to retry
B) Review the questions in the **Monitor** tab, curate fixes (instructions, trusted assets, knowledge store, or UC metadata), add the failing questions as benchmarks, and re-run benchmarks
C) Delete the conversations so the feedback disappears
D) Recreate the space from scratch

> [!success]- Answer
> **Correct Answer: B**
>
> The exam's "optimize" skill is a loop: track user questions, accuracy, and feedback (Monitor tab, Weekly digest); update instructions and trusted assets from stakeholder input; refresh UC metadata; and validate with benchmarks.
>
> Bigger compute (A) does not fix interpretation errors, deleting conversations (C) throws away the evidence, and rebuilding (D) loses curation.

---

## Question 13: Embedding a Space *(Medium)* *(2025 blueprint)*

A team wants the Genie space inside its intranet portal. What is required?

A) Only a public link — anyone with the URL can use it without signing in
B) A workspace admin adds the portal's domain to the allowed embedding surfaces, an author with `CAN MANAGE` copies the iframe code from **Share**, and end users still need space and data access
C) Exporting the space as a static HTML file
D) Granting the portal's web server `SELECT` on all tables

> [!success]- Answer
> **Correct Answer: B**
>
> iframe embedding needs the host domain on the allowlist in Genie access-management settings, an author with at least `CAN MANAGE`, and end users with explicit access to the space and its data. Users who are not signed in are prompted to authenticate.
>
> There is no anonymous public access (A), no static export (C), and no grant to a web server (D).

---

## Question 14: Scoping a Space *(Medium)* *(2025 blueprint)*

An analyst wants one Genie space for the whole company's 40 tables. What does the official curation guidance recommend?

A) Add all 40 tables — the limit is 50
B) Aim for five or fewer tables per space, prejoin tables into views or metric views when a topic needs more, and split broad domains into focused spaces
C) Add the tables but hide every column except keys
D) Use text instructions to describe all 40 tables

> [!success]- Answer
> **Correct Answer: B**
>
> The curation guide says to aim for five or fewer tables and include only those needed for the questions the space should handle; the hard limit is 50 tables, views, or metric views.
>
> Many tables dilute Genie's context and make wrong joins more likely. Hiding columns (C) or long instructions (D) do not fix an over-broad scope.

---

## Question 15: Hidden Columns *(Hard)* *(2025 blueprint)*

A curator hides the `salary` column in a Genie space's knowledge store. Which statement is true?

A) Nobody can read `salary` any more
B) Genie no longer uses `salary` in its context, but users with direct table access can still query it — use UC grants or column masks to restrict access
C) The column is dropped from the table
D) Hiding the column also hides it in Catalog Explorer

> [!success]- Answer
> **Correct Answer: B**
>
> Hiding a column only removes it from Genie's context. Hidden columns stay visible to users with direct table access, so hiding is not a security control.
>
> Restrict sensitive data with Unity Catalog permissions, row filters, and column masks.

---

[← Back to Practice Questions](./README.md) | [Back to Resources](../README.md)
