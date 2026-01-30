# Mock Exam - Section 6: Testing & Deployment (Questions 52-57)

[Back to Exam Overview](README.md) | [Previous: Monitoring & Logging](05-monitoring-logging.md) | [Next: Lakeflow & Performance](07-lakeflow-performance.md)

---

## Question 52

**Scenario**: A data engineering team is setting up Databricks Asset Bundles (DAB) for their project. They need separate configurations for development, staging, and production environments.

**Question**: Which `databricks.yml` structure correctly defines these environments?

A) Create separate `databricks-dev.yml`, `databricks-staging.yml`, `databricks-prod.yml` files
B) Use `targets:` section with `dev:`, `staging:`, and `prod:` subsections
C) Use `environments:` section with runtime variable substitution
D) Create separate bundles for each environment in different directories

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> DAB uses a `targets:` section to define environment-specific configurations. Each target can override bundle settings like workspace host, cluster configs, and variables. Option A doesn't support DAB's inheritance model. Option C uses invalid syntax. Option D duplicates code.

</details>

---

## Question 53

**Scenario**: A CI/CD pipeline runs unit tests on PySpark code that transforms DataFrames. The tests should run quickly without requiring a Databricks cluster.

**Question**: Which testing approach is most appropriate?

A) Deploy code to a Databricks cluster and run tests remotely
B) Use local Spark session in pytest with mocked data
C) Use Nutter framework with Databricks Connect
D) Skip unit tests and rely on integration tests only

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Local Spark sessions in pytest allow fast unit tests without cluster costs or dependencies. Mock DataFrames test transformation logic efficiently. Option A is slow and costly for unit tests. Option C still requires cluster resources. Option D misses the value of unit testing.

</details>

---

## Question 54

**Scenario**: A Git folder in Databricks is configured with main branch protection. A developer tries to push directly to main and receives an error.

**Question**: What is the recommended workflow for making changes?

A) Disable branch protection temporarily to push changes
B) Create a feature branch, commit changes, and create a pull request
C) Use `%git` magic commands to force push to main
D) Make changes in a separate notebook outside Git folders

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> The standard Git workflow with branch protection: create a feature branch, make changes, push, create PR for review, then merge to main after approval. This ensures code review and testing. Options A and C bypass protections. Option D loses version control benefits.

</details>

---

## Question 55

**Scenario**: A GitHub Actions workflow deploys Databricks Asset Bundles to a staging environment. The workflow needs to authenticate with Databricks.

**Question**: Which authentication method is recommended for GitHub Actions?

A) Store personal access token in GitHub Secrets
B) Configure OIDC federation between GitHub and Databricks with service principal
C) Use username and password stored in GitHub Secrets
D) Create a dedicated user account for GitHub Actions

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> OIDC federation with service principals is the recommended approach for CI/CD authentication. GitHub Actions can authenticate using short-lived tokens without storing long-lived credentials. Option A uses personal tokens that expire. Option C is deprecated. Option D creates management overhead.

</details>

---

## Question 56

**Scenario**: A Nutter test notebook tests a function that reads from a Delta table. The test should verify the function handles empty tables correctly.

**Question**: Which Nutter pattern correctly implements this test case?

A) Create an empty table in `before_all()` and clean up in `after_all()`
B) Use `assertion_empty_table()` with the expected result
C) Mock the Delta table read using `unittest.mock`
D) Use Nutter's built-in empty table generator

<details>
<summary>Answer</summary>

> **Correct Answer: A**
>
> Nutter's `before_all()` runs setup before tests (create empty test table), and `after_all()` runs cleanup (drop table). The actual test verifies behavior with the empty table. Option B isn't a Nutter method. Option C is complex within Nutter. Option D doesn't exist.

</details>

---

## Question 57

**Scenario**: A bundle deployment fails with the error: "Resource already exists". The data engineer confirms the resource was created by a previous partial deployment.

**Question**: What is the correct approach to resolve this and complete the deployment?

A) Manually delete the resource and redeploy
B) Run `databricks bundle deploy --force` to overwrite
C) Run `databricks bundle destroy` then `databricks bundle deploy`
D) Update the resource name in databricks.yml to avoid conflict

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> The `--force` flag allows DAB to take ownership of and update existing resources that match the bundle definition. This handles partial deployments gracefully. Option A risks missing dependent resources. Option C destroys everything unnecessarily. Option D changes the deployment, not fixing it.

</details>

---

[Back to Exam Overview](README.md) | [Previous: Monitoring & Logging](05-monitoring-logging.md) | [Next: Lakeflow & Performance](07-lakeflow-performance.md)
