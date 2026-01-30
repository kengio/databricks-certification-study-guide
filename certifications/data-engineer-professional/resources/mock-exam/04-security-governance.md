# Mock Exam - Section 4: Security & Governance (Questions 40-45)

[Back to Exam Overview](README.md) | [Previous: Data Modeling](03-data-modeling.md) | [Next: Monitoring & Logging](05-monitoring-logging.md)

---

## Question 40

**Scenario**: A data engineering team needs to grant a group of analysts SELECT access to all tables in a schema, including tables that will be created in the future.

**Question**: Which Unity Catalog permission model correctly implements this requirement?

A) Grant SELECT on each table individually as they're created
B) Grant USE SCHEMA and SELECT on SCHEMA to give access to all current and future tables
C) Grant SELECT on the catalog to give access to all schemas and tables
D) Create a view for each table and grant SELECT on views only

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Granting SELECT at the schema level provides access to all current and future tables in that schema. USE SCHEMA is required to access objects within the schema. Option A requires ongoing maintenance. Option C is too broad. Option D is unnecessarily complex.

</details>

---

## Question 41

**Scenario**: A table contains employee data including salary information. The HR department should see all columns, but managers should only see employee name, department, and title--not salary.

**Question**: Which Unity Catalog feature implements this column-level security requirement?

A) Create separate tables for HR and managers with different columns
B) Use dynamic views with `is_account_group_member()` to filter columns
C) Use column masks to hide salary for non-HR users
D) Implement application-level security in the BI tool

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> Column masks in Unity Catalog apply functions to column values based on the querying user's permissions, showing the real value to authorized users and masked/null values to others. Option A creates data duplication. Option B requires view maintenance. Option D doesn't protect data at the source.

</details>

---

## Question 42

**Scenario**: An organization wants to share a curated dataset with an external partner who uses Snowflake. The partner should receive daily updates but should not have direct access to the Databricks workspace.

**Question**: Which feature enables secure data sharing with external organizations?

A) Create a service principal for the partner to access via API
B) Use Delta Sharing to share data via open protocol
C) Export data daily to a shared cloud storage location
D) Create a Databricks workspace for the partner with access to the dataset

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Delta Sharing provides an open protocol for secure data sharing across organizations and platforms. Partners can use compatible clients (including Snowflake, Spark, pandas) without Databricks access. Option A requires workspace access. Option C requires file transfer management. Option D is costly and requires Databricks licenses.

</details>

---

## Question 43

**Scenario**: A data engineer is building a notebook that needs to access credentials for an external database. The credentials are stored in Azure Key Vault, which has been configured as a secret backend.

**Question**: Which code correctly retrieves the database password?

A) `dbutils.secrets.get(scope="keyvault-scope", key="db-password")`
B) `spark.conf.get("azure.keyvault.db-password")`
C) `dbutils.credentials.get("keyvault-scope", "db-password")`
D) `%keyvault get db-password`

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> When Azure Key Vault is configured as a secret scope backend, secrets are accessed through `dbutils.secrets.get()` using the scope name and key name. The Key Vault integration is transparent to the code. Options B, C, and D use invalid syntax.

</details>

---

## Question 44

**Scenario**: A Unity Catalog metastore is shared across multiple workspaces. A user has SELECT permission on a table granted in Workspace A. The same user accesses Workspace B.

**Question**: What permissions does the user have on that table in Workspace B?

A) No permissions; grants are workspace-specific
B) Same SELECT permission; Unity Catalog permissions are centralized
C) Read-only permissions with a warning about cross-workspace access
D) Permissions depend on workspace-level settings

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Unity Catalog provides centralized governance across all workspaces attached to the same metastore. Permissions granted on objects apply regardless of which workspace is used to access them. This is a key benefit of Unity Catalog over legacy Hive metastore.

</details>

---

## Question 45

**Scenario**: A healthcare organization needs to implement row-level security so that doctors can only see records for patients assigned to them. The patient_assignments table maps doctors to patients.

**Question**: Which approach correctly implements this row-level security in Unity Catalog?

A) Add a row filter using `ROW FILTER filter_function ON (patient_id)`
B) Create dynamic views with `WHERE doctor_id = current_user()`
C) Use column masks to hide rows from unauthorized users
D) Implement filtering in the application layer only

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> Unity Catalog row filters apply a function that determines which rows each user can access based on their identity. The filter function can join with assignment tables to implement complex rules. Option B works but requires view maintenance. Option C is for column security, not row security. Option D doesn't protect data at the source.

</details>

---

[Back to Exam Overview](README.md) | [Previous: Data Modeling](03-data-modeling.md) | [Next: Monitoring & Logging](05-monitoring-logging.md)
