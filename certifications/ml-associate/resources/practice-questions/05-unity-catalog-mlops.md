---
title: Practice Questions — Unity Catalog, MLOps & MLflow Client
type: practice-questions
tags: [ml-associate, practice-questions, mlops, feature-store, model-registry, mlflow]
status: published
---

# Practice Questions — Unity Catalog, MLOps & MLflow Client (Section 1)

14 questions added for the re-issued exam guide, covering the **Section 1: Databricks Machine Learning (38 %)** bullets that earlier files did not test: MLOps best practices, deploy code vs deploy models, feature tables in Unity Catalog, online vs offline features, the MLflow Client API, the Unity Catalog registry, tags, and champion/challenger aliases. Study material: [Databricks Machine Learning](../../01-databricks-machine-learning/README.md).

[← Back to Practice Questions](./README.md) | [Next: Data Processing →](./06-data-processing.md)

---

## Question 1: MLOps Environment Best Practice *(2026 guide)*

**Question** *(Medium)*: A team is formalising its MLOps process on Databricks. Which setup follows the recommended best practices?

A) One shared catalog for all work, with production jobs running notebooks straight from each data scientist's home folder  
B) Separate development, staging, and production environments, each with its own Unity Catalog catalog, and ML pipeline code in Git promoted through branches with CI tests  
C) Training only in the development workspace and emailing the model file to the platform team for production  
D) A single production catalog where data scientists experiment directly so models always see live data  

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks recommends separate environments for development, staging, and production — each backed by its own Unity Catalog catalog — with ML pipelines kept as code in Git, tested in CI, and promoted from branch to branch.
>
> Running production from personal folders, sending model files around by hand, or experimenting directly on production data all skip review, testing, and governance.

---

## Question 2: Deploy Code When Production Data Is Restricted *(2026 guide)*

**Question** *(Medium)*: Data scientists at a bank cannot read production customer data from the development workspace. The company has a CI/CD process and wants automated monthly retraining. Which deployment pattern fits best?

A) Deploy models — train in development and copy the model version to production  
B) Deploy models — train in staging on a sample and promote the artifact  
C) Deploy code — promote the reviewed training code so the model is trained in production on production data  
D) Neither — retraining must be done manually in a notebook each month  

> [!success]- Answer
> **Correct Answer: C**
>
> With **deploy code**, the training code moves through dev → staging → production and the model is trained in production, where the data lives. The docs list restricted production data access and safer automated retraining as advantages of this pattern, and recommend it in most situations.
>
> Deploy models may not be viable when production data is not accessible from development, and automated retraining is harder in that pattern.

---

## Question 3: Deploy Models for Expensive Training *(2026 guide)*

**Question** *(Medium)*: A team fine-tunes a large vision model for three days on many GPUs. All of its work happens in a single Databricks workspace and it has no external CI/CD pipeline. Which approach is most appropriate?

A) Deploy models — train once, validate the artifact, then promote that model version  
B) Deploy code — retrain the model from scratch in staging and again in production  
C) Deploy code — retrain in production every night to keep the model fresh  
D) Avoid the model registry and serve the model file from a volume  

> [!success]- Answer
> **Correct Answer: A**
>
> The docs suggest **deploy models** when training is very expensive or hard to reproduce, when all work is in a single workspace, or when there is no external repo / CI/CD process. Training once and promoting the validated artifact avoids repeating a multi-day GPU job in every environment.
>
> Retraining in each environment multiplies the cost, and bypassing the registry loses versioning and governance.

---

## Question 4: Account-Level Feature Tables *(2026 guide)*

**Question** *(Easy)*: Teams in two workspaces attached to the same Unity Catalog metastore want to reuse one set of customer features. What is the main benefit of keeping these feature tables in Unity Catalog rather than in a legacy workspace feature store?

A) Unity Catalog feature tables refresh themselves automatically every hour  
B) Unity Catalog feature tables can be shared and discovered across workspaces, with centralised access control and lineage  
C) Unity Catalog feature tables do not need a primary key  
D) Unity Catalog feature tables can only be read by the workspace that created them, which improves security  

> [!success]- Answer
> **Correct Answer: B**
>
> Unity Catalog is account-level: any workspace on the metastore can discover and use the table, governed by UC privileges, with lineage to the models that use it. The docs describe "built-in governance, lineage, point-in-time joins, and cross-workspace feature sharing and discovery."
>
> Refresh is still your pipeline's job, a primary key is required, and per-workspace isolation is what the legacy store had.

---

## Question 5: Turning an Existing Delta Table into a Feature Table *(2026 guide)*

**Question** *(Medium)*: The Unity Catalog Delta table `ml.features.store_sales` already contains one row per `store_id`. What makes it usable as a feature table?

A) `ALTER TABLE ml.features.store_sales SET AS FEATURE STORE`  
B) `fe.register_table(delta_table="ml.features.store_sales")`  
C) `CREATE FEATURE TABLE ml.features.store_sales AS SELECT * FROM ml.features.store_sales`  
D) Make `store_id` `NOT NULL`, then `ALTER TABLE ml.features.store_sales ADD CONSTRAINT store_sales_pk PRIMARY KEY (store_id)`  

> [!success]- Answer
> **Correct Answer: D**
>
> In Unity Catalog, any Delta table with a **primary key constraint** is a feature table. For an existing table, set the key column(s) to `NOT NULL` and add the `PRIMARY KEY` constraint.
>
> There is no `SET AS FEATURE STORE` or `CREATE FEATURE TABLE` syntax, and `register_table` is not the Unity Catalog path.

---

## Question 6: Online vs Offline Feature Tables *(2026 guide)*

**Question** *(Medium)*: A fraud model served on a real-time endpoint must fetch a customer's latest aggregates within milliseconds using only `customer_id`. The same features are used for nightly retraining. How should the features be organised?

A) Keep the offline Delta feature table for training and batch scoring, and publish it to an online store for low-latency lookups at serving time  
B) Query the offline Delta table with a full scan for each request  
C) Store the features only in the online store and train from there  
D) Copy the features into the model artifact at training time  

> [!success]- Answer
> **Correct Answer: A**
>
> The **offline** feature table (a Delta table in Unity Catalog) is optimised for large scans and joins — training sets and batch scoring. An **online store** holds a published copy optimised for key-based millisecond lookups; a model logged with `fe.log_model` and deployed to Model Serving can look features up automatically.
>
> Scanning Delta per request is too slow, the online store is not the training source, and baking features into the artifact makes them stale.

---

## Question 7: Building a Training Set from Feature Tables *(2026 guide)*

**Question** *(Medium)*: A label DataFrame has `customer_id` and `churned`. Which sequence produces a training DataFrame that joins features from `ml.features.customer_features`?

A) `fe.read_table(...)` then `labels_df.union(...)`  
B) Define `FeatureLookup(table_name="ml.features.customer_features", lookup_key="customer_id")`, call `fe.create_training_set(df=labels_df, feature_lookups=[...], label="churned")`, then `.load_df()`  
C) `fe.score_batch(model_uri, labels_df)` to add the features  
D) `fe.write_table(name="ml.features.customer_features", df=labels_df, mode="merge")`  

> [!success]- Answer
> **Correct Answer: B**
>
> `FeatureLookup` says which table to join on which key; `create_training_set` combines the label DataFrame with the looked-up features, and `load_df()` returns the joined DataFrame. Logging the model later with `fe.log_model(..., training_set=training_set)` records the lookups for scoring.
>
> A union does not join on keys, `score_batch` needs a trained model, and `write_table` would write labels into the feature table.

---

## Question 8: Best Run with the MLflow Client API *(2026 guide)*

**Question** *(Medium)*: An experiment holds 60 runs, each logging `val_auc`. Which MLflow Client API call returns the single run with the **highest** `val_auc`?

A) `MlflowClient().search_runs([exp_id], order_by=["metrics.val_auc ASC"], max_results=1)[0]`  
B) `MlflowClient().get_run(exp_id)`  
C) `MlflowClient().search_runs([exp_id], order_by=["metrics.val_auc DESC"], max_results=1)[0]`  
D) `MlflowClient().search_experiments(order_by=["metrics.val_auc DESC"])[0]`  

> [!success]- Answer
> **Correct Answer: C**
>
> `search_runs` ranks runs server-side: for a score where higher is better, order by `metrics.val_auc DESC` and take the first result.
>
> `ASC` would return the *worst* AUC, `get_run` needs a run ID and does not rank, and `search_experiments` returns experiments, not runs.

---

## Question 9: Unity Catalog Registry vs Workspace Registry *(2026 guide)*

**Question** *(Easy)*: Which is a benefit of registering models in Unity Catalog instead of the legacy workspace model registry?

A) Models are automatically promoted to `Production` when their metrics improve  
B) Model versions no longer need a signature  
C) Models get centralised access control, auditing, lineage, and discovery across workspaces  
D) Model serving endpoints respond faster for UC models  

> [!success]- Answer
> **Correct Answer: C**
>
> The docs state that Models in Unity Catalog extend "centralized access control, auditing, lineage, and model discovery across workspaces" to ML models.
>
> UC does not auto-promote (and has no stages), new UC versions *must* have a signature, and the registry choice does not change endpoint latency.

---

## Question 10: Registering a Model with the MLflow Client API *(2026 guide)*

**Question** *(Medium)*: With the registry URI set to `databricks-uc`, a data scientist wants to use the **MLflow Client API** (not the fluent API) to create the registered model `ml.churn.clf` and add the model from run `r42` as a version. Which calls are correct?

A) `client.create_registered_model("ml.churn.clf")` then `client.create_model_version(name="ml.churn.clf", source="runs:/r42/model", run_id="r42")`  
B) `client.register_model("runs:/r42/model")` with no name  
C) `client.create_model_version(name="ml.churn.clf")` with no source  
D) `client.log_model("ml.churn.clf", "runs:/r42/model")`  

> [!success]- Answer
> **Correct Answer: A**
>
> `MlflowClient.create_registered_model(name)` creates the registered model (three-level name in UC), and `create_model_version(name, source, run_id)` adds a numbered version pointing at the logged model. The fluent shortcut for the same thing is `mlflow.register_model("runs:/r42/model", "ml.churn.clf")`.
>
> A version needs a source; `MlflowClient` has no `log_model` method.

---

## Question 11: Removing a Model Version Tag *(2026 guide)*

**Question** *(Easy)*: Version 4 of `ml.churn.clf` carries the tag `validation_status=pending`. Validation was rerun, and the tag should be removed from that version only. Which call does this?

A) `client.delete_registered_model_tag("ml.churn.clf", "validation_status")`  
B) `client.set_model_version_tag("ml.churn.clf", "4", "validation_status", None)`  
C) `client.delete_registered_model_alias("ml.churn.clf", "validation_status")`  
D) `client.delete_model_version_tag("ml.churn.clf", "4", "validation_status")`  

> [!success]- Answer
> **Correct Answer: D**
>
> `delete_model_version_tag(name, version, key)` removes a tag from one version; `set_model_version_tag(name, version, key, value)` sets it.
>
> `delete_registered_model_tag` removes a **model-level** tag, an alias is not a tag, and setting a value is not the same as removing the key.

---

## Question 12: Rolling Back a Champion *(2026 guide)*

**Question** *(Hard)*: Yesterday the team moved the `champion` alias of `ml.churn.clf` from version 4 to version 5. Batch and serving code load `models:/ml.churn.clf@champion`. Version 5 is now misbehaving. What is the fastest rollback that needs no code change?

A) `client.set_registered_model_alias("ml.churn.clf", "champion", 4)`  
B) Delete version 5 so the registry falls back automatically  
C) `client.transition_model_version_stage("ml.churn.clf", 4, "Production")`  
D) Edit every job to load `models:/ml.churn.clf/4`  

> [!success]- Answer
> **Correct Answer: A**
>
> Aliases are movable pointers: reassigning `champion` to version 4 makes every consumer of `@champion` use version 4 on its next load. Deployment is decoupled from inference code.
>
> Deleting versions is destructive and does not move an alias for you, stages are not supported in Unity Catalog, and hard-coding versions is exactly what aliases avoid.

---

## Question 13: AutoML Feature Importance *(2026 guide)*

**Question** *(Medium)*: After an AutoML classification run, a data scientist wants to see which features drive the best model's predictions. What should they do?

A) Read the `feature_importance` Delta table that AutoML writes  
B) Open the best-trial notebook and enable the SHAP-based feature importance section (`shap_enabled = True`), then rerun it  
C) Query the `summary.best_trial.shap_values` attribute  
D) AutoML does not support any form of feature importance  

> [!success]- Answer
> **Correct Answer: B**
>
> AutoML's generated notebooks include a **Feature importance** section that computes Shapley values with the SHAP package. Because it is memory-intensive it is **off by default**; set `shap_enabled = True` and rerun the notebook.
>
> AutoML writes no feature-importance Delta table, and `TrialInfo` has no `shap_values` attribute.

---

## Question 14: Advantage of the ML Runtime *(2026 guide)*

**Question** *(Easy)*: Why would a team choose the Databricks Runtime for Machine Learning over the standard runtime for model development?

A) It is the only runtime that can read Delta tables  
B) It runs Spark SQL queries on GPUs automatically  
C) It provides pre-installed, version-compatible ML and deep-learning libraries plus MLflow and AutoML, so no environment assembly is needed  
D) It removes the need for Unity Catalog permissions  

> [!success]- Answer
> **Correct Answer: C**
>
> The ML runtime "automates the creation of a compute resource with pre-built machine learning and deep learning infrastructure": popular libraries (scikit-learn, PyTorch, TensorFlow, XGBoost, …) and MLflow are installed and tested together, and AutoML is available.
>
> Every runtime reads Delta, Spark SQL is not automatically GPU-accelerated, and Unity Catalog permissions still apply.

---

**[← Previous: Model Registry & Deployment](./04-mlflow-deployment.md) | [↑ Back to Practice Questions — ML Associate](./README.md) | [Next: Data Processing →](./06-data-processing.md)**
