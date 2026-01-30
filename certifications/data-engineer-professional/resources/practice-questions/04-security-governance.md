# Practice Questions - Section 04: Security & Governance (10%)

[Back to Overview](./README.md) | [Previous: Data Modeling](03-data-modeling.md) | [Next: Monitoring & Logging](05-monitoring-logging.md)

---

## Question 4.1: Unity Catalog Permission Inheritance

**Scenario**: A user is granted SELECT on a schema in Unity Catalog.

**Question**: What happens to tables created in that schema after the grant?

A) User automatically has SELECT on new tables
B) User must be granted SELECT on each new table
C) User has no access to new tables
D) User has MODIFY access to new tables

> [!success]- Answer
> **Correct Answer: A**
>
> Permissions in Unity Catalog inherit downward. A SELECT grant on a schema applies to all current and future tables in that schema. This simplifies access management compared to table-level grants.

---

## Question 4.2: Row-Level Security

**Scenario**: Different sales teams should only see data for their assigned regions.

**Question**: Which approach implements row-level security in Unity Catalog?

A) Create separate tables for each region
B) Use dynamic views with `current_user()` function
C) Apply column masking policies
D) Use secret scopes for each region

> [!success]- Answer
> **Correct Answer: B**
>
> Dynamic views using `current_user()` or `is_member()` functions filter rows based on the querying user's identity or group membership. Column masking hides column values. Separate tables don't scale. Secret scopes are for credentials.

---

## Question 4.3: Delta Sharing

**Scenario**: A company needs to share data with an external partner who uses Snowflake.

**Question**: Which statement about Delta Sharing is correct?

A) The recipient must have a Databricks workspace
B) The recipient can read shared data using any Delta Sharing client
C) Data is physically copied to the recipient's storage
D) Delta Sharing only works within the same cloud provider

> [!success]- Answer
> **Correct Answer: B**
>
> Delta Sharing is an open protocol. Recipients can use any compatible client (Spark, pandas, Power BI, Snowflake, etc.) without needing Databricks. Data is read in place, not copied. It works across cloud providers.

---

## Question 4.4: Secret Management

**Scenario**: A notebook needs to access a database password without exposing it in code.

**Question**: Which approach correctly retrieves the secret?

A) `dbutils.secrets.get(scope="db-scope", key="password")`
B) `spark.conf.get("db.password")`
C) `dbutils.credentials.get("db-scope", "password")`
D) `os.environ.get("DB_PASSWORD")`

> [!success]- Answer
> **Correct Answer: A**
>
> `dbutils.secrets.get(scope, key)` retrieves secrets from Databricks secret scopes. The value is automatically redacted in notebook output. The other options either don't exist or expose credentials.

---

## Question 4.5: Managed vs External Tables

**Scenario**: A team needs to register an existing data lake path in Unity Catalog without moving the data.

**Question**: What type of table should they create?

A) Managed table
B) External table
C) View
D) Materialized view

> [!success]- Answer
> **Correct Answer: B**
>
> External tables point to data at a user-specified location. Managed tables store data in Unity Catalog-managed storage (data would be moved/copied). Views don't store data. Materialized views persist computed results.

---

[Back to Overview](./README.md) | [Previous: Data Modeling](03-data-modeling.md) | [Next: Monitoring & Logging](05-monitoring-logging.md)
