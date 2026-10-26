---
title: "Practice Questions: Implementing CI/CD"
type: practice-questions
tags: [data-engineer-associate, practice-questions, implementing-cicd]
---

# Domain 5: Implementing CI/CD

Exam weight: **10 %** (August 2026 exam guide). Questions marked *(2026 blueprint)* target skills added or reworded in the 2026 guide. Each question cites the Databricks documentation that supports its answer, where one exists.

## Question 1: Where Pull Requests Are Created

**Question** *(Easy)*: A data engineer works on a feature branch in a Databricks Git folder. Which step of their workflow is performed in the Git provider (for example GitHub) rather than in the Databricks Git dialog?

A) Committing and pushing changes
B) Creating the feature branch
C) Creating and merging the pull request into the default branch
D) Pulling a teammate's latest changes

> [!success]- Answer
> **Correct Answer: C**
>
> Creating and merging the pull request into the default branch.
>
> Git folders handle branch creation, switching, Commit & Push, pull, merge, rebase, and conflict resolution in the workspace UI. The docs say to "use your Git provider's interface to create a pull request and merge it into the default branch", where reviews and branch protections apply ([Git operations in Git folders](https://docs.databricks.com/aws/en/repos/git-operations-with-repos)).

---

## Question 2: Benefit of Git Folders Over Notebook Versioning

**Question** *(Medium)*: A data engineer must decide between the built-in versioning of Databricks Notebooks and Databricks Git folders. What is one benefit of using Git folders (formerly Repos) instead?

A) Git folders automatically back up notebooks to cloud storage every 5 minutes
B) Git folders eliminate the need for a Git provider by hosting repositories internally
C) Git folders provide a visual diff tool for comparing notebook cell outputs
D) Databricks Git folders support the use of multiple branches

> [!success]- Answer
> **Correct Answer: D**
>
> Databricks Git folders support the use of multiple branches.
>
> Built-in notebook versioning provides only a linear history of auto-saved snapshots. Git folders integrate fully with Git, enabling feature branches, pull requests, code reviews, and collaborative development workflows — essential for team-based software engineering practices.

---

## Question 3: Syncing a Git Folder With Remote Changes

**Question** *(Easy)*: A data engineer's colleague has pushed updates to the central Git repository. The data engineer needs to sync their Databricks Git folder with these changes. Which Git operation accomplishes this?

A) Clone
B) Fetch
C) Rebase
D) Pull

> [!success]- Answer
> **Correct Answer: D**
>
> Pull.
>
> A `git pull` fetches changes from the remote repository and merges them into the current local branch. In a Databricks Git folder, this is the **Pull** action in the Git dialog (pull also clears notebook state), keeping the local copy synchronized with the latest upstream changes.

---

## Question 4: Committing From a Git Folder *(2026 blueprint)*

**Question** *(Easy)*: A data engineer has edited two notebooks in a Databricks Git folder on branch `feature/dedup`. How do they get the changes to the remote repository from the workspace UI?

A) Export the notebooks as DBC files and upload them to the Git provider
B) Open the Git dialog, select the changes, enter a commit message, and click Commit & Push
C) Run `databricks bundle deploy`
D) Click Pull, which pushes local changes automatically

> [!success]- Answer
> **Correct Answer: B**
>
> Open the Git dialog, select the changes, enter a commit message, and click Commit & Push.
>
> In Git folders, the UI "commits and pushes in a single action", and a commit message is required. Pull brings remote changes **in**. Bundle deploy pushes to a workspace, not to Git ([Git operations in Git folders](https://docs.databricks.com/aws/en/repos/git-operations-with-repos)).

---

## Question 5: Creating a Feature Branch *(2026 blueprint)*

**Question** *(Easy)*: Before starting new work, an engineer wants a separate branch based on `main` in their Git folder. What should they do?

A) Use the Git dialog's Create Branch option, name the branch, and choose `main` as the base
B) Clone the repository again into a new workspace folder
C) Ask an admin to create the branch with the Repos API
D) Rename the `main` branch in the Git dialog

> [!success]- Answer
> **Correct Answer: A**
>
> Use the Git dialog's Create Branch option, name the branch, and choose `main` as the base.
>
> Git folders create and switch branches from the Git dialog. Switching branches can carry uncommitted changes over. It can also delete workspace assets that don't exist on the target branch, and recreate them with new IDs when you switch back ([Git operations in Git folders](https://docs.databricks.com/aws/en/repos/git-operations-with-repos)).

---

## Question 6: Reset in a Git Folder *(2026 blueprint)*

**Question** *(Hard)*: An engineer clicks **Reset** on a branch in a Git folder. What is the effect?

A) Only uncommitted local changes are discarded
B) It is equivalent to `git reset --hard` plus `git push --force`, so committed and uncommitted changes are lost locally and on the remote branch
C) The branch is restored from notebook revision history
D) The Git folder is unlinked from the remote repository

> [!success]- Answer
> **Correct Answer: B**
>
> It is equivalent to `git reset --hard` plus `git push --force`, so committed and uncommitted changes are lost locally and on the remote branch.
>
> The docs warn: "When you reset, you lose all uncommitted and committed changes in both the local and remote version of the branch." Use it only when you really want to discard work ([Git operations in Git folders](https://docs.databricks.com/aws/en/repos/git-operations-with-repos)).

---

## Question 7: Keeping a Secret Out of the Bundle *(2026 blueprint)*

**Question** *(Medium)*: A Declarative Automation Bundle deploys a job that needs a database password. The password must not appear in `databricks.yml`, in notebooks, or in Git. The CI system stores it as a secret. How should the bundle receive it at deploy time?

A) Declare a bundle variable with no default, and have CI export `BUNDLE_VAR_<variable_name>` from its secret store
B) Put the password in the variable's `default`
C) Store it in a `passwords.txt` file in the bundle root
D) Hard-code it with `spark.conf.set` in the notebook

> [!success]- Answer
> **Correct Answer: A**
>
> Declare a bundle variable with no default, and have CI export `BUNDLE_VAR_<variable_name>` from its secret store.
>
> Bundle variables can be set from `BUNDLE_VAR_`-prefixed environment variables, so the value never enters source control. Runtime credentials can also be read in code with `dbutils.secrets.get` ([bundle variables](https://docs.databricks.com/aws/en/dev-tools/bundles/variables)).

---

## Question 8: Bundle Variable Precedence *(2026 blueprint)*

**Question** *(Hard)*: A bundle declares `catalog` with `default: dev`. The `prod` target sets `variables: {catalog: prod}`. In CI, the environment has `BUNDLE_VAR_catalog=staging`, and the command is `databricks bundle deploy -t prod --var="catalog=prod_v2"`. Which value is used?

A) `dev`
B) `prod`
C) `staging`
D) `prod_v2`

> [!success]- Answer
> **Correct Answer: D**
>
> `prod_v2`.
>
> The CLI uses the first source that provides a value, in this order: the `--var` option, then `BUNDLE_VAR_` environment variables, then `variable-overrides.json`, then target `variables`, then the declaration's `default` ([bundle variables](https://docs.databricks.com/aws/en/dev-tools/bundles/variables)).

---

## Question 9: Promoting One Codebase Across Environments *(2026 blueprint)*

**Question** *(Medium)*: A team wants the same job definition deployed to dev, test, and prod workspaces, each writing to a different Unity Catalog catalog. What is the bundle-native approach?

A) Copy `resources/job.yml` into three folders, one per environment
B) Define `dev`, `test`, and `prod` targets with their own workspace hosts, and override a `catalog` variable per target
C) Create three Git repositories
D) Edit the job in each workspace UI after deployment

> [!success]- Answer
> **Correct Answer: B**
>
> Define `dev`, `test`, and `prod` targets with their own workspace hosts, and override a `catalog` variable per target.
>
> Targets override top-level settings (workspace, `run_as`, variables, resource settings) per environment, so one set of resource YAML is promoted with `databricks bundle deploy -t <target>`. Manual UI edits drift from source control, and the next deploy can overwrite them ([Declarative Automation Bundles](https://docs.databricks.com/aws/en/dev-tools/bundles/)).

---

## Question 10: Development Mode Behaviour *(2026 blueprint)*

**Question** *(Medium)*: An engineer deploys a bundle with `-t dev`, where the target has `mode: development`. The deployed job never runs on its daily schedule. Why?

A) Development mode deletes schedules from the YAML
B) Development mode pauses schedules and triggers on deployed resources, and prefixes resource names with `[dev <user>]`
C) Development mode requires a service principal
D) The `dev` target always deploys to a read-only workspace

> [!success]- Answer
> **Correct Answer: B**
>
> Development mode pauses schedules and triggers on deployed resources, and prefixes resource names with `[dev <user>]`.
>
> `mode: development` also marks pipelines as `development: true` and allows concurrent runs, so engineers can iterate safely. Run the job manually with `databricks bundle run`, or deploy to a production-mode target for scheduled runs ([deployment modes](https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes)).

---

## Question 11: Production Mode Safeguards *(2026 blueprint)*

**Question** *(Medium)*: Which behaviour is part of `mode: production` for a bundle target?

A) It pauses all schedules after deployment
B) It validates the configured Git branch and that `run_as` and permissions are specified (a service principal is recommended), and it disallows cluster overrides
C) It prefixes every resource name with the deployer's user name
D) It skips YAML validation for faster deploys

> [!success]- Answer
> **Correct Answer: B**
>
> It validates the configured Git branch and that `run_as` and permissions are specified (a service principal is recommended), and it disallows cluster overrides.
>
> Production mode also checks that pipelines are `development: false` and that paths aren't overridden to a specific user. The branch check can be overridden with `--force` ([deployment modes](https://docs.databricks.com/aws/en/dev-tools/bundles/deployment-modes)).

---

## Question 12: Validating Before Deploying *(2026 blueprint)*

**Question** *(Easy)*: In a CI pipeline, which Databricks CLI command checks that the bundle configuration is syntactically correct before anything is deployed?

A) `databricks bundle validate`
B) `databricks bundle destroy`
C) `databricks bundle sync`
D) `databricks jobs list`

> [!success]- Answer
> **Correct Answer: A**
>
> `databricks bundle validate`.
>
> `validate` checks the bundle configuration. `deploy -t <target>` deploys it, `run` runs a job or pipeline, `plan` shows the deployment plan, and `destroy` deletes previously deployed resources ([bundle command group](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands)).

---

## Question 13: Running a Bundle Job From CI *(2026 blueprint)*

**Question** *(Easy)*: After `databricks bundle deploy -t test`, the CI pipeline must start the bundle's `orders_job` in the test environment and wait for the result. Which command does this?

A) `databricks bundle run orders_job -t test`
B) `databricks bundle deploy orders_job --run`
C) `databricks bundle summary -t test`
D) `databricks bundle init orders_job`

> [!success]- Answer
> **Correct Answer: A**
>
> `databricks bundle run orders_job -t test`.
>
> `bundle run` runs "a job, pipeline, app, or script" defined in the bundle, against the selected target. `summary` lists the bundle's identity and deployed resources, and `init` creates a bundle from a template ([bundle command group](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands)).

---

## Question 14: Bringing an Existing Job Under a Bundle *(2026 blueprint)*

**Question** *(Hard)*: A job was built by hand in the UI. The team wants it managed by their bundle without recreating it from scratch. Which CLI commands help?

A) `databricks bundle generate` to produce YAML for the existing job, then `databricks bundle deployment bind` to link the bundle resource to it
B) `databricks bundle destroy`, then recreate it in the UI
C) `databricks bundle sync`, which copies the workspace job into Git
D) `databricks bundle validate --import`

> [!success]- Answer
> **Correct Answer: A**
>
> `databricks bundle generate` to produce YAML for the existing job, then `databricks bundle deployment bind` to link the bundle resource to it.
>
> `generate` creates bundle configuration for a resource that already exists in the workspace. `deployment bind` links a bundle-defined resource to the existing remote resource, so later deploys update it instead of creating a duplicate. `sync` is a one-way copy of local files to the workspace ([bundle command group](https://docs.databricks.com/aws/en/dev-tools/cli/bundle-commands)).

---

## Question 15: What a Bundle Packages *(2026 blueprint)*

**Question** *(Easy)*: Which set of assets can a Declarative Automation Bundle define and deploy together?

A) Only notebooks
B) Lakeflow Jobs, Lakeflow (Declarative) Pipelines, and other workspace assets such as dashboards, alongside their source code
C) Only Unity Catalog grants
D) Only cluster policies

> [!success]- Answer
> **Correct Answer: B**
>
> Lakeflow Jobs, Lakeflow (Declarative) Pipelines, and other workspace assets such as dashboards, alongside their source code.
>
> A bundle is YAML configuration (`databricks.yml` plus included resource files) and the code it references, versioned in Git and deployed per target. Newer CLI versions also support resources such as Genie Agents and Lakebase projects ([bundles release notes](https://docs.databricks.com/aws/en/release-notes/dev-tools/bundles)).

---

**[← Previous: Domain 4: Working with Lakeflow Jobs](./04-working-with-lakeflow-jobs.md) | [↑ Back to DE Associate Practice Questions](./README.md) | [Next: Domain 6: Troubleshooting, Monitoring, and Optimization →](./06-troubleshooting-monitoring-and-optimization.md)**
