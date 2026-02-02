# Mock Exam 2 - Section 4: Security & Governance (Questions 40-45)

[Back to Exam Overview](./README.md) | [Previous: Data Modeling](03-data-modeling.md) | [Next: Monitoring & Logging](05-monitoring-logging.md)

---

## Question 40

**Scenario**: Your organization recently purchased a second Databricks workspace for a newly acquired subsidiary. The platform team attaches this new workspace to the existing Unity Catalog metastore that the parent company already uses. Before the attachment, the subsidiary's workspace relied on a legacy Hive metastore with several hundred tables.

**Question**: What happens to the existing Hive metastore tables in the subsidiary workspace once it is attached to the Unity Catalog metastore?

A) The legacy Hive metastore tables are automatically migrated into Unity Catalog as managed tables
B) The legacy Hive metastore tables remain accessible through the `hive_metastore` catalog but are not governed by Unity Catalog
C) The legacy Hive metastore tables are deleted and must be recreated in Unity Catalog
D) The legacy Hive metastore tables are copied into Unity Catalog as external tables with identical permissions

> [!success]- Answer
> **Correct Answer: B**
>
> When a workspace is attached to a Unity Catalog metastore, the legacy Hive metastore does not disappear. Its tables remain accessible under the built-in `hive_metastore` catalog, but they are not governed by Unity Catalog's centralized access controls. To bring those tables under Unity Catalog governance, teams must explicitly migrate them using tools like the UCX migration utility or `CREATE TABLE` statements.

---

## Question 41

**Scenario**: A financial services company stores transaction data in a single `transactions` table containing records from all regional offices. Compliance requires that analysts in each regional group (e.g., `region_us`, `region_eu`, `region_apac`) can only query rows that belong to their own region. The security team wants this enforced at the data layer, not in the BI tool.

**Question**: Which approach correctly implements this row-level security requirement in Unity Catalog?

A) Create a dynamic view that filters rows using `SELECT * FROM transactions WHERE region = CASE WHEN is_account_group_member('region_us') THEN 'US' WHEN is_account_group_member('region_eu') THEN 'EU' WHEN is_account_group_member('region_apac') THEN 'APAC' END`
B) Apply a column mask on the `region` column so that unauthorized analysts see NULL instead of the actual region value
C) Create three separate tables partitioned by region and grant each group SELECT on only their table
D) Use a cluster-level Spark configuration to set `spark.sql.region.filter` to the user's assigned region

> [!success]- Answer
> **Correct Answer: A**
>
> Dynamic views with `is_account_group_member()` provide row-level security by evaluating the querying user's group membership at runtime and filtering rows accordingly. This approach enforces security centrally at the data layer without requiring data duplication. Option B hides column values but still returns all rows, Option C creates data management overhead with duplicated tables, and Option D is not a real Spark configuration parameter.

---

## Question 42

**Scenario**: A pharmaceutical company wants to share de-identified clinical trial results with three external research institutions. Two of the institutions use Databricks, but the third institution uses only Apache Spark on their own Hadoop cluster. The data must be shared securely without giving any institution direct access to the company's workspace.

**Question**: How does the third institution (the non-Databricks recipient) authenticate and access data shared via Delta Sharing?

A) They receive a Databricks personal access token that grants read-only access to the shared tables
B) They connect via OAuth using the pharmaceutical company's identity provider
C) They install a Databricks Connect client that tunnels into the provider's workspace
D) They download an activation link that provisions a bearer token, which the open-source Delta Sharing client uses to authenticate with the sharing server

> [!success]- Answer
> **Correct Answer: D**
>
> Delta Sharing uses an open protocol where recipients receive an activation link to generate a bearer token stored in a credential file. The open-source Delta Sharing connector (available for Spark, pandas, and other platforms) uses this token to authenticate directly with the sharing server without requiring a Databricks account. Options A and C incorrectly assume the recipient needs Databricks credentials or workspace connectivity, and Option B is not how Delta Sharing authenticates external recipients.

---

## Question 43

**Scenario**: The security operations team has detected suspicious behavior -- a service principal that normally runs nightly ETL pipelines has been issuing `GRANT` statements during business hours. The team needs to query the audit logs to identify all privilege escalation events performed by this service principal in the last 7 days.

**Question**: Which query correctly retrieves the relevant audit log entries from the Unity Catalog system tables?

A) `SELECT * FROM system.information_schema.grants WHERE grantee = 'etl-service-principal' AND grant_date > current_date() - INTERVAL 7 DAYS`
B) `SELECT * FROM system.access.audit WHERE user_identity = 'etl-service-principal' AND event_type = 'SECURITY_ALERT'`
C) `SELECT * FROM system.access.audit WHERE user_identity.email = 'etl-service-principal' AND action_name IN ('updatePermissions', 'grantPermission') AND event_time > current_date() - INTERVAL 7 DAYS`
D) `SELECT * FROM system.billing.usage WHERE identity.email = 'etl-service-principal' AND usage_type = 'GRANT_OPERATION'`

> [!success]- Answer
> **Correct Answer: C**
>
> The `system.access.audit` table records all governance-related actions in Unity Catalog, including permission changes. Filtering on `user_identity.email` for the service principal and `action_name` for grant-related operations isolates privilege escalation events. Option A queries the information schema which shows current grants but not the audit trail of who made changes, Option B uses a non-existent `event_type` value, and Option D queries billing data which does not track security operations.

---

## Question 44

**Scenario**: A data engineering team currently uses a senior engineer's personal access token (PAT) embedded in an Airflow DAG to trigger Databricks jobs in production. The engineer is planning to leave the company in two weeks, and management is concerned about continuity and security.

**Question**: What is the recommended approach to address this situation and prevent similar issues going forward?

A) Create a service principal with a client secret, assign it only the permissions needed to run production jobs, and configure Airflow to authenticate using the service principal's credentials
B) Transfer the engineer's personal access token to a shared team account so that multiple engineers can maintain it
C) Generate a new personal access token under the engineering manager's account and update Airflow before the engineer departs
D) Disable token-based authentication entirely and switch to interactive SSO login for all Airflow-triggered jobs

> [!success]- Answer
> **Correct Answer: A**
>
> Service principals are the recommended approach for production workloads because their lifecycle is independent of any individual user. They support least-privilege access through dedicated role assignments and their credentials can be rotated without impacting a person's account. Option B creates a shared credential anti-pattern with no individual accountability, Option C merely shifts the same problem to a different person, and Option D is impractical since orchestrators like Airflow require non-interactive authentication.

---

## Question 45

**Scenario**: A government agency stores classified datasets in a Databricks workspace deployed in an isolated VNet with no public internet access. Despite these network controls, a recent internal review discovered that a user with `SELECT` access on a sensitive table was able to copy data to an external cloud storage account by running `COPY INTO 'abfss://external-container@external-account.dfs.core.windows.net/'` from a notebook.

**Question**: Which combination of controls should be implemented to prevent this type of data exfiltration while still allowing legitimate workloads?

A) Revoke all `SELECT` permissions and require users to submit data access requests for each query
B) Enable IP access lists on the workspace and restrict notebook execution to read-only mode
C) Disable the `COPY INTO` command at the cluster level using a Spark configuration override
D) Configure storage firewall rules to restrict egress to only approved storage accounts, and apply table ACLs in Unity Catalog to limit write permissions on external locations to authorized service principals only

> [!success]- Answer
> **Correct Answer: D**
>
> Defense-in-depth requires both network-level and data-level controls working together. Storage firewall rules and NSG/egress restrictions block connectivity to unapproved storage accounts, while Unity Catalog's external location permissions ensure that only authorized service principals can write to sanctioned destinations. Option A is operationally impractical, Option B does not prevent data writes to external storage, and Option C does not address other exfiltration methods such as direct Spark writes via DataFrames.

---

[Back to Exam Overview](./README.md) | [Previous: Data Modeling](03-data-modeling.md) | [Next: Monitoring & Logging](05-monitoring-logging.md)
