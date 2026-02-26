---
title: Practice Questions — Databricks ML
type: practice-questions
tags: [ml-associate, practice-questions, databricks-ml, automl, clusters]
status: published
---

# Practice Questions — Databricks ML (Domain 1)

13 questions covering ML Runtime, AutoML, cluster configuration, and Databricks workspace features.

[← Back to Practice Questions](./README.md) | [Next: ML Workflows →](./02-ml-workflows.md)

---

## Question 1: ML Runtime Pre-installed Libraries *(Easy)*

**Question**: Which of the following libraries is pre-installed in the Databricks Runtime for Machine Learning but NOT in the standard Databricks Runtime?

A) Apache Spark
B) MLflow
C) pandas
D) Delta Lake

> [!success]- Answer
> **Correct Answer: B**
>
> The Databricks Runtime for ML pre-installs MLflow, TensorFlow, PyTorch, and scikit-learn on top of the standard Databricks Runtime. Apache Spark, pandas, and Delta Lake are all included in the standard runtime.

---

## Question 2: Single-Node Cluster Use Case *(Medium)*

**Question**: A data scientist is training a scikit-learn model on a 500 MB dataset that fits entirely in memory. Which cluster type is most appropriate?

A) Multi-node cluster with 4 workers
B) Single-node cluster
C) High-concurrency cluster
D) Multi-node cluster with autoscaling enabled

> [!success]- Answer
> **Correct Answer: B**
>
> Single-node clusters are ideal for workloads that use libraries without native Spark support, such as scikit-learn, and for datasets that fit in memory. Using a multi-node cluster adds distributed computing overhead with no benefit for non-distributed workloads.

---

## Question 3: AutoML Task Types *(Easy)*

**Question**: A data scientist wants to use Databricks AutoML to predict customer churn (a binary yes/no outcome). Which AutoML task type should they select?

A) Regression
B) Forecasting
C) Classification
D) Clustering

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks AutoML supports three task types: classification (for categorical targets), regression (for continuous targets), and forecasting (for time series). Predicting a binary outcome like churn is a classification problem. Clustering is not an AutoML task type in Databricks.

---

## Question 4: AutoML Output *(Easy)*

**Question**: After running a Databricks AutoML experiment, where are the results stored?

A) A Delta table in the default catalog
B) A set of Python scripts in a Repos folder
C) An MLflow experiment with one run per trial
D) A JSON configuration file in DBFS

> [!success]- Answer
> **Correct Answer: C**
>
> AutoML automatically creates and populates an MLflow experiment. Each trial is logged as a separate MLflow run with its parameters, metrics, and model artifact. The best model is also accompanied by an editable notebook that can be used as a starting point for further experimentation.

---

## Question 5: Cluster Policy Purpose *(Medium)*

**Question**: A platform engineer wants to prevent data science teams from launching GPU clusters without explicit approval. What is the best approach?

A) Document a policy in a wiki and ask teams to follow it
B) Create a cluster policy that restricts node type to CPU instance types only
C) Set up a budget alert that notifies the engineer when GPU spend exceeds a threshold
D) Restrict Unity Catalog permissions for the data science teams

> [!success]- Answer
> **Correct Answer: B**
>
> Cluster policies allow administrators to enforce cluster configuration constraints, including restricting the allowed instance types to non-GPU options. Policies are enforced at the platform level and cannot be bypassed by regular users.

---

## Question 6: ML Runtime Version Selection *(Medium)*

**Question**: A data scientist needs to train a deep learning model using PyTorch with GPU acceleration. Which Databricks Runtime variant should they select?

A) Databricks Runtime (standard)
B) Databricks Runtime ML
C) Databricks Runtime ML GPU
D) Databricks Runtime Photon

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Runtime ML GPU includes CUDA, cuDNN, and GPU-optimized versions of deep learning libraries such as PyTorch and TensorFlow. The standard ML Runtime does not include GPU drivers. The standard Runtime and Photon Runtime do not include ML-specific pre-installed libraries.

---

## Question 7: Notebook %run Directive

**Question** *(Easy)*: A team stores common data preprocessing utility functions in a notebook called `utils.py`. What is the correct way to execute that notebook's code in another notebook?

A) `import utils`
B) `%run ./utils`
C) `dbutils.notebook.run("utils", 60)`
D) `spark.sql("RUN NOTEBOOK utils")`

> [!success]- Answer
> **Correct Answer: B**
>
> The `%run` magic command executes another notebook in the context of the current notebook, making all defined functions and variables available in the current scope. `dbutils.notebook.run()` also executes a notebook but runs it in a separate context and only returns a string result, not the defined variables.

---

## Question 8: Databricks Repos Version Control

**Question** *(Easy)*: A data scientist wants to track changes to their model training notebooks using Git. What Databricks feature should they use?

A) Delta Lake change data feed
B) MLflow run history
C) Databricks Repos
D) Databricks Workflows

> [!success]- Answer
> **Correct Answer: C**
>
> Databricks Repos integrates with Git providers (GitHub, GitLab, Bitbucket, Azure DevOps) and allows you to version-control notebooks and code directly from the Databricks workspace. Delta Lake change data feed tracks table changes, MLflow run history tracks experiment results, and Workflows orchestrate jobs.

---

## Question 9: AutoML Forecasting Input

**Question** *(Easy)*: When configuring a Databricks AutoML forecasting experiment, which column is required in addition to the target variable?

A) A feature importance column
B) A time column
C) A grouping column
D) A row ID column

> [!success]- Answer
> **Correct Answer: B**
>
> AutoML forecasting requires a time column that identifies the time step for each observation. The time column is mandatory because forecasting is inherently a time-series problem. A grouping column is optional (for multi-series forecasting). Feature importance and row ID columns are not required inputs.

---

## Question 10: Standard vs ML Runtime

**Question** *(Medium)*: A data scientist wants to use the `mlflow.autolog()` function in a notebook. They notice the function is not available. What is the most likely cause?

A) The cluster is running the standard Databricks Runtime instead of Databricks Runtime ML
B) The cluster has autoscaling disabled
C) The notebook is attached to a shared cluster
D) The MLflow tracking server is offline

> [!success]- Answer
> **Correct Answer: A**
>
> MLflow is pre-installed on Databricks Runtime ML. On standard Databricks Runtime, MLflow may not be installed or may be a different version. The correct solution is to switch to Databricks Runtime ML, which includes a compatible version of MLflow out of the box.

---

## Question 11: Multi-Node Cluster Benefit

**Question** *(Medium)*: Which of the following workloads benefits MOST from using a multi-node Spark cluster instead of a single-node cluster?

A) Training a logistic regression model with scikit-learn on a 1 GB CSV file
B) Training a distributed gradient-boosted tree using Spark ML on a 500 GB Delta table
C) Running a hyperparameter sweep with Optuna on a single machine
D) Visualizing model performance with matplotlib

> [!success]- Answer
> **Correct Answer: B**
>
> Multi-node clusters are beneficial when the workload can be parallelized across workers. Training a Spark ML model on a large Delta table leverages distributed computation. scikit-learn, Optuna, and matplotlib do not distribute work across Spark workers, so they receive no benefit from additional nodes.

---

## Question 12: AutoML Best Model

**Question** *(Easy)*: After completing an AutoML experiment, a data scientist wants to retrain and customize the best model. What does AutoML provide to enable this?

A) A compiled binary model file that can be fine-tuned
B) A generated Python notebook containing the training code for the best model
C) A REST API endpoint that exposes the best model's hyperparameters
D) A Delta table containing the best model's feature importances

> [!success]- Answer
> **Correct Answer: B**
>
> Databricks AutoML generates an editable Python notebook for the best model. This notebook contains all the code to reproduce and customize the model, including feature engineering, training, and MLflow logging. The data scientist can clone and modify this notebook as a starting point.

---

## Question 13: Cluster Termination Policy

**Question** *(Easy)*: A platform administrator wants to ensure that ML training clusters are automatically terminated after 30 minutes of inactivity to reduce costs. Where is this configured?

A) In the cluster policy definition
B) In the cluster's auto-termination setting
C) In the Databricks workflow job settings
D) In the MLflow experiment configuration

> [!success]- Answer
> **Correct Answer: B**
>
> Each cluster has an auto-termination setting that specifies the number of minutes of inactivity before the cluster is shut down. This is configured directly on the cluster (or enforced via a cluster policy). It is independent of workflow job settings and MLflow configuration.

---

**[↑ Back to Practice Questions — ML Associate](./README.md) | [Next: Practice Questions — ML Workflows](./02-ml-workflows.md) →**
