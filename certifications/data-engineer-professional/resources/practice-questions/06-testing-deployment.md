# Practice Questions - Section 06: Testing & Deployment (10%)

[Back to Overview](README.md) | [Previous: Monitoring & Logging](05-monitoring-logging.md) | [Next: Lakeflow Pipelines](07-lakeflow-pipelines.md)

---

## Question 6.1: Databricks Asset Bundles

**Scenario**: A team needs to deploy the same pipeline to dev, staging, and production environments.

**Question**: How should environments be configured in Databricks Asset Bundles?

A) Create separate bundle files for each environment
B) Use targets in databricks.yml with environment-specific settings
C) Use Git branches for each environment
D) Manually modify settings before each deployment

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> DAB uses targets to define environment-specific configurations in a single databricks.yml. This is the recommended approach for multi-environment deployments. Separate files or manual changes lead to drift and errors.

</details>

---

## Question 6.2: Bundle Deployment Mode

**Scenario**: A developer wants to test their bundle without affecting shared resources.

**Question**: Which target mode should they use?

A) `mode: production`
B) `mode: development`
C) `mode: testing`
D) `mode: sandbox`

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Development mode prefixes resource names with the username, pauses schedules, and uses personal workspace paths. This prevents conflicts with other developers or production resources.

</details>

---

## Question 6.3: Git Folders

**Scenario**: A team wants to version control their notebooks with automatic sync to Git.

**Question**: Which statement about Git Folders is correct?

A) Git Folders require manual sync after each change
B) Git Folders can only connect to GitHub
C) Git Folders replace the need for Databricks Asset Bundles
D) Git Folders provide native Git operations like pull, commit, and push

<details>
<summary>Answer</summary>

> **Correct Answer: D**
>
> Git Folders provide native Git operations directly in the Databricks UI. They support multiple Git providers (GitHub, GitLab, Azure DevOps, etc.). They complement DAB (which handles deployment), not replace it.

</details>

---

## Question 6.4: Unit Testing with Nutter

**Scenario**: A team needs to run tests inside Databricks notebooks as part of CI/CD.

**Question**: Which Nutter pattern is correct?

A) `def test_my_function():` followed by assertions
B) `before_`, `run_`, and `assertion_` method prefixes for each test
C) `@test` decorator on test methods
D) `TestCase` class inheritance

<details>
<summary>Answer</summary>

> **Correct Answer: B**
>
> Nutter uses a specific naming convention: `before_<test>` for setup, `run_<test>` for execution, and `assertion_<test>` for verification. This pattern allows tests to run inside Databricks notebooks.

</details>

---

## Question 6.5: CI/CD Pipeline

**Scenario**: A GitHub Actions workflow needs to deploy a bundle to Databricks.

**Question**: Which step is required before running `databricks bundle deploy`?

A) Install Python
B) Run `databricks bundle init`
C) Set up Databricks CLI with authentication
D) Create the workspace manually

<details>
<summary>Answer</summary>

> **Correct Answer: C**
>
> The Databricks CLI must be installed and authenticated (via `databricks/setup-cli` action or environment variables) before deployment commands work. The bundle already exists in the repo. Python is helpful but CLI is essential.

</details>

---

[Back to Overview](README.md) | [Previous: Monitoring & Logging](05-monitoring-logging.md) | [Next: Lakeflow Pipelines](07-lakeflow-pipelines.md)
