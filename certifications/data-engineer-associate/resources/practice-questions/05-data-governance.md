---
title: "Practice Questions: Data Governance"
type: practice-questions
tags: [data-engineer-associate, practice-questions, data-governance]
---

# Domain 5: Data Governance

## Question 1: Git Operations Outside Databricks Repos

**Question** *(Easy)*: Which Git operations need to be completed outside of Databricks Repos?

A) Commit
B) Push
C) Merge
D) Pull

> [!success]- Answer
> **Correct Answer: C**
>
> Merge.
>
> Databricks Repos supports commit, pull, push, clone, and branch operations within the UI. However, merging branches must be performed in the external Git provider (GitHub, GitLab, Bitbucket, Azure DevOps) where pull requests and merge conflict resolution are handled.

---

## Question 2: Benefit of Databricks Repos Over Notebook Versioning

**Question** *(Medium)*: A data engineer must decide between the built-in versioning of Databricks Notebooks and Databricks Repos. What is one benefit of using Repos instead?

A) Repos automatically back up notebooks to cloud storage every 5 minutes
B) Repos eliminates the need for a Git provider by hosting repositories internally
C) Repos provides a visual diff tool for comparing notebook cell outputs
D) Databricks Repos supports the use of multiple branches

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks Repos supports the use of multiple branches.
>
> Built-in notebook versioning provides only a linear history of auto-saved snapshots. Repos integrates fully with Git, enabling feature branches, pull requests, code reviews, and collaborative development workflows — essential for team-based software engineering practices.

---

## Question 3: Table Ownership Transfer

**Question** *(Medium)*: A data engineer has departed from the organization. The data team needs to transfer ownership of the departed engineer's Delta tables to the new lead data engineer. The previous engineer no longer has access. Who can perform this ownership transfer in Data Explorer?

A) A workspace administrator
B) Any user with SELECT privilege on the tables
C) The new lead data engineer by running ALTER TABLE SET OWNER
D) Any member of the data team with MODIFY privilege

> [!success]- Answer
> **Correct Answer: A**
>
> A workspace administrator.
>
> Only workspace administrators have the authority to transfer ownership of objects when the original owner is unavailable. Regular users — including the new lead data engineer — cannot reassign ownership to themselves without admin privileges.

---

## Question 4: GRANT ALL PRIVILEGES on a Database

**Question** *(Easy)*: A new data engineering team needs full privileges on the `customers` database to manage the project effectively. Which command grants all permissions?

A) `GRANT FULL ACCESS ON DATABASE customers TO team;`
B) `GRANT ALL PRIVILEGES ON DATABASE customers TO team;`
C) `GRANT READ, WRITE, ADMIN ON DATABASE customers TO team;`
D) `GRANT MANAGE ON DATABASE customers TO team;`

> [!success]- Answer
> **Correct Answer: B**
>
> `GRANT ALL PRIVILEGES ON DATABASE customers TO team;`
>
> This grants all available permissions (SELECT, CREATE, MODIFY, USAGE, READ_METADATA, etc.) on the database and its objects to the team. It is the broadest privilege grant, giving the team complete control over the schema.

---

## Question 5: GRANT USAGE on a Database

**Question** *(Medium)*: A newly formed data engineering team needs access to browse the `customers` database to identify existing tables. Which GRANT command provides the necessary permission?

A) `GRANT SELECT ON DATABASE customers TO team;`
B) `GRANT READ_METADATA ON DATABASE customers TO team;`
C) `GRANT USAGE ON DATABASE customers TO team;`
D) `GRANT BROWSE ON DATABASE customers TO team;`

> [!success]- Answer
> **Correct Answer: C**
>
> `GRANT USAGE ON DATABASE customers TO team;`
>
> `USAGE` allows users to browse the database and see its contents (tables, views, functions) without granting read or write access to the underlying data. It is the minimum permission required for teams to discover what objects exist in a database.

---

## Question 6: Syncing Databricks Repos with Remote Changes

**Question** *(Easy)*: A data engineer's colleague has pushed updates to the central Git repository. The data engineer needs to sync their Databricks Repo with these changes. Which Git operation accomplishes this?

A) Clone
B) Fetch
C) Rebase
D) Pull

> [!success]- Answer
> **Correct Answer: D**
>
> Pull.
>
> A `git pull` fetches changes from the remote repository and merges them into the current local branch. In Databricks Repos, this is performed via the "Pull" action in the Repos UI, keeping the local copy synchronized with the latest upstream changes.

---

## Question 7: Where to Check Table Permissions

**Question** *(Easy)*: A data engineer needs to use a Delta table but is unsure whether they have the necessary permissions. Where can they check their table permissions?

A) The Databricks Admin Console under User Management
B) Data Explorer
C) The cluster configuration page under Security settings
D) The SQL endpoint's access control list

> [!success]- Answer
> **Correct Answer: B**
>
> Data Explorer.
>
> The Data Explorer in Databricks provides a dedicated "Permissions" tab for each table, listing which users and groups have access and what privilege levels are granted. It is the primary interface for inspecting and managing object-level permissions.

---

## Question 8: When to Use a Single-Node Cluster

**Question** *(Medium)*: What scenario would prompt a data engineer to use a single-node cluster?

A) When running a distributed join across tables with billions of rows
B) When deploying a production DLT pipeline with multiple streaming sources
C) When working interactively with a small amount of data
D) When maximizing parallelism for a large-scale ETL workload

> [!success]- Answer
> **Correct Answer: C**
>
> When working interactively with a small amount of data.
>
> Single-node clusters run both the driver and executor on the same machine, making them suitable for development, exploratory data analysis on small datasets, and libraries that do not support distributed execution (e.g., some scikit-learn workflows). They are not appropriate for large-scale production jobs.

---

## Question 9: Using SQL in a Python Notebook Cell

**Question** *(Easy)*: A data engineer is working in a Python notebook on Databricks but needs to use SQL for one specific cell. They prefer that all other cells remain Python. How can they incorporate SQL into only that cell?

A) Add `%sql` to the first line of the cell
B) Wrap the SQL query in `spark.sql()` and assign it to a variable
C) Change the notebook's default language to SQL and then switch back
D) Import the `sql` module and call `sql.execute()`

> [!success]- Answer
> **Correct Answer: A**
>
> Add `%sql` to the first line of the cell.
>
> Databricks magic commands (`%sql`, `%python`, `%scala`, `%r`) override the cell language for that individual cell only. All other cells continue using the notebook's default language. This allows mixing languages within a single notebook without changing the global setting.

---

## Question 10: Identifying a Table Owner

**Question** *(Easy)*: A data engineer requires access to `new_table` but does not know who owns it. What method can be used to identify the owner?

A) Run `SHOW GRANT ON TABLE new_table` to list all privilege holders
B) Check the cluster logs for the user who last wrote to the table
C) Query the `information_schema.tables` view for the table's creator
D) Review the Owner field in the table's page in Data Explorer

> [!success]- Answer
> **Correct Answer: D**
>
> Review the Owner field in the table's page in Data Explorer.
>
> Data Explorer displays the table owner in the table details panel. Any user with workspace access can view this field without needing special permissions, making it the standard way to identify who to contact for permission requests.

---

**[← Previous: Domain 4: Production Pipelines](./04-production-pipelines.md) | [↑ Back to DE Associate Practice Questions](./README.md)**
