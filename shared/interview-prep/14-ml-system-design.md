---
tags: [interview-prep, ml, system-design]
---

# Interview Questions — ML System Design

---

## Question 1: End-to-End ML Pipeline on Databricks

**Level**: Professional
**Type**: System Design

**Scenario / Question**:
Your team needs to build a churn prediction model that retrains weekly on customer behavior data, serves predictions via a REST API, and alerts the team if model accuracy drops. Walk me through how you would design this system on Databricks.

> [!success]- Answer Framework
>
> **Short Answer**: Feature engineering via Feature Store with scheduled writes from Silver tables, weekly retraining job using AutoML or custom Spark ML pipeline tracked with MLflow, model registered in Unity Catalog Model Registry with alias promotion, served via Model Serving endpoint, and monitored with Lakehouse Monitoring for data/prediction drift.
>
> ### Key Points to Cover
>
> - Feature Store for consistent feature computation (offline training + online serving)
> - MLflow experiment tracking for all training runs (params, metrics, artifacts)
> - Unity Catalog Model Registry for model versioning and alias-based promotion
> - Model Serving endpoint with traffic routing (for canary/A-B testing)
> - Lakehouse Monitoring or custom drift detection job
> - Orchestrated via Databricks Workflows (weekly retrain + daily inference)
>
> ### Example Answer
>
> I'd design this in four layers: **feature engineering**, **training**, **serving**, and **monitoring**.
>
> For **features**, I'd use the Databricks Feature Store. A scheduled job reads from Silver customer-behavior tables and computes features like `avg_sessions_last_30d`, `days_since_last_purchase`, and `support_tickets_count`. These are written to a Feature Store table with `customer_id` as the primary key. For serving, I'd publish features to an online store so the endpoint can look up features at request time.
>
> ```python
> from databricks.feature_engineering import FeatureEngineeringClient
>
> fe = FeatureEngineeringClient()
>
> fe.create_table(
>     name="ml.churn.customer_features",
>     primary_keys=["customer_id"],
>     df=feature_df,
>     description="Weekly customer behavior features for churn prediction"
> )
> ```
>
> For **training**, I'd run a weekly Databricks Workflow that creates a training set from the Feature Store, trains using AutoML (or a custom scikit-learn/XGBoost pipeline), logs everything to MLflow, and registers the best model in Unity Catalog. I'd use `mlflow.autolog()` for automatic metric capture.
>
> For **serving**, I'd deploy via Model Serving with the `@champion` alias. When a new model version passes validation, I'd update the alias — the endpoint picks it up with zero downtime.
>
> For **monitoring**, I'd set up Lakehouse Monitoring on the inference table to track prediction drift and data drift. A daily job compares current accuracy against a holdout set. If accuracy drops below threshold, it triggers an alert and optionally kicks off early retraining.
>
> ### Follow-up Questions
>
> - How would you handle feature freshness for real-time vs batch predictions?
> - What's your strategy for A/B testing a new model version?
> - How would you handle class imbalance in churn prediction?

---

## Question 2: Feature Store Design for Multiple Models

**Level**: Professional
**Type**: Architecture

**Scenario / Question**:
Three ML models in your organization share overlapping features (user demographics, transaction history, product interactions). How would you design the Feature Store to maximize reuse and minimize compute waste?

> [!success]- Answer Framework
>
> **Short Answer**: Create shared feature tables organized by entity (users, transactions, products) rather than by model. Each model's training set is assembled by joining feature lookups on the relevant primary keys. Feature computation jobs are centralized and scheduled independently of model training.
>
> ### Key Points to Cover
>
> - Entity-centric feature table design (one table per entity, not per model)
> - Primary key design: `user_id`, `product_id`, `transaction_id`
> - Feature computation decoupled from model training
> - Point-in-time lookups to prevent data leakage
> - Online vs offline feature serving trade-offs
>
> ### Example Answer
>
> The key principle is **entity-centric design**. Instead of creating feature tables per model, I'd create them per business entity:
>
> - `ml.features.user_demographics` — keyed on `user_id`, updated daily
> - `ml.features.user_transactions` — keyed on `user_id`, updated hourly
> - `ml.features.product_interactions` — keyed on `user_id, product_id`, updated hourly
>
> Each model creates its training set via feature lookups:
>
> ```python
> from databricks.feature_engineering import FeatureEngineeringClient, FeatureLookup
>
> fe = FeatureEngineeringClient()
>
> training_set = fe.create_training_set(
>     df=labels_df,  # has user_id, label, timestamp
>     feature_lookups=[
>         FeatureLookup(table_name="ml.features.user_demographics", lookup_key="user_id"),
>         FeatureLookup(table_name="ml.features.user_transactions", lookup_key="user_id"),
>     ],
>     label="churned",
>     exclude_columns=["user_id"]
> )
> ```
>
> For time-sensitive features, I'd use **point-in-time lookups** with a timestamp column to avoid data leakage — the Feature Store only joins features available *before* the label timestamp.
>
> Feature computation is a separate workflow from training — if `user_transactions` needs an hourly refresh, that's a single shared job, not three jobs per model.
>
> ### Follow-up Questions
>
> - How do you handle feature versioning when a feature definition changes?
> - What's the trade-off between wide feature tables vs many narrow tables?
> - When would you publish to an online store vs compute features in the serving endpoint?

---

## Question 3: Model Monitoring and Drift Detection

**Level**: Professional
**Type**: Operations

**Scenario / Question**:
A fraud detection model in production has been performing well for 6 months, but the business suspects its accuracy has degraded. How would you design a monitoring system to detect and respond to model drift?

> [!success]- Answer Framework
>
> **Short Answer**: Implement three monitoring layers — data drift (input feature distribution shifts), prediction drift (output distribution shifts), and performance drift (actual vs predicted accuracy). Use Lakehouse Monitoring for automated statistical tests, set alert thresholds, and define a retraining trigger policy.
>
> ### Key Points to Cover
>
> - Distinguish data drift, prediction drift, and concept drift
> - Lakehouse Monitoring on inference tables
> - Statistical tests: PSI, KS test, chi-squared for distribution comparison
> - Ground truth latency problem (labels arrive late for fraud)
> - Automated vs human-in-the-loop retraining decisions
> - Baseline comparison (training distribution vs production distribution)
>
> ### Example Answer
>
> I'd implement monitoring at three levels:
>
> **Data drift**: Compare production input feature distributions against the training baseline. Use Population Stability Index (PSI) for continuous features and chi-squared tests for categorical features. If `transaction_amount` distribution shifts significantly, that's a signal even before we see label degradation.
>
> **Prediction drift**: Monitor the distribution of model output probabilities. If the model suddenly predicts 40% fraud rate instead of the typical 2%, something has changed — even if we don't have ground truth labels yet.
>
> **Performance drift**: When ground truth labels arrive (fraud confirmed/denied), compare actual accuracy, precision, and recall against the baseline. For fraud, this is tricky because labels can take weeks to arrive (chargebacks).
>
> On Databricks, I'd use **Lakehouse Monitoring** on the inference table. It automatically computes drift metrics and generates dashboard profiles. I'd configure alerts when PSI exceeds 0.2 (significant drift) or when precision drops below 0.85.
>
> The response policy: mild drift triggers an alert for the team to investigate. Significant drift triggers automatic retraining with the latest data. Critical drift (accuracy collapse) triggers a fallback to the previous model version via alias swap.
>
> ### Follow-up Questions
>
> - How would you handle the ground truth latency problem in fraud detection?
> - What's the difference between concept drift and data drift?
> - How would you decide between retraining from scratch vs incremental fine-tuning?

---

## Question 4: Retraining Pipeline Architecture

**Level**: Professional
**Type**: System Design

**Scenario / Question**:
Design an automated retraining pipeline for a recommendation model. It should retrain when new data is available, validate the new model against the current production model, and promote it only if it performs better.

> [!success]- Answer Framework
>
> **Short Answer**: Scheduled or trigger-based Databricks Workflow that (1) assembles a training set from Feature Store, (2) trains a candidate model with MLflow tracking, (3) evaluates against a holdout set and compares metrics to the current `@champion` model, (4) promotes the candidate via alias update only if it outperforms, (5) logs all decisions for audit.
>
> ### Key Points to Cover
>
> - Champion/Challenger pattern using UC Model Registry aliases
> - Automated validation gate (metric comparison)
> - Holdout or shadow evaluation before promotion
> - Rollback strategy if promoted model degrades
> - MLflow for experiment tracking and model lineage
>
> ### Example Answer
>
> The pipeline has five stages, orchestrated as a Databricks Workflow:
>
> **Stage 1: Data assembly** — Read from Feature Store tables, join with latest labels, split into train/validation/holdout.
>
> **Stage 2: Training** — Train candidate model with `mlflow.autolog()`. Log all hyperparameters, metrics, and the model artifact. Register as a new model version in Unity Catalog.
>
> **Stage 3: Validation** — Evaluate the candidate on the holdout set. Compare key metrics (AUC, precision@k, NDCG) against the current `@champion` model version.
>
> ```python
> import mlflow
>
> champion_model = mlflow.pyfunc.load_model("models:/ml.prod.recommender@champion")
> candidate_model = mlflow.pyfunc.load_model(f"models:/ml.prod.recommender/{new_version}")
>
> champion_auc = evaluate(champion_model, holdout_df)
> candidate_auc = evaluate(candidate_model, holdout_df)
>
> if candidate_auc > champion_auc + 0.005:  # require meaningful improvement
>     client.set_registered_model_alias("ml.prod.recommender", "champion", new_version)
>     mlflow.log_metric("promotion_decision", 1)
> else:
>     mlflow.log_metric("promotion_decision", 0)
> ```
>
> **Stage 4: Promotion** — If the candidate wins, update the `@champion` alias. The serving endpoint automatically picks up the new version.
>
> **Stage 5: Post-deployment monitoring** — A follow-up job checks real-world metrics for the first 24 hours. If degradation is detected, swap the alias back to the previous version.
>
> ### Follow-up Questions
>
> - How would you handle A/B testing instead of a simple cutover?
> - What if the training data has a temporal distribution shift?
> - How do you ensure reproducibility across retraining runs?

---

## Question 5: Distributed Hyperparameter Tuning Strategy

**Level**: Professional
**Type**: Technical Deep Dive

**Scenario / Question**:
You have a gradient-boosted tree model with 8 hyperparameters to tune. Training a single model takes 15 minutes on a 4-node cluster. How would you approach hyperparameter optimization on Databricks?

> [!success]- Answer Framework
>
> **Short Answer**: Use Hyperopt with `SparkTrials` to distribute trials across the cluster. Use Bayesian optimization (TPE) instead of grid search to explore the space efficiently. Define a reasonable search space with log-uniform distributions for learning rate and uniform for tree parameters. Set a max_evals budget based on time constraints.
>
> ### Key Points to Cover
>
> - Hyperopt with TPE (Tree-structured Parzen Estimator) for Bayesian optimization
> - `SparkTrials` for distributed trial execution (one trial per Spark task)
> - Search space design: `hp.loguniform` for learning rate, `hp.quniform` for integer params
> - `max_evals` budget calculation based on cluster size and time
> - MLflow integration for tracking all trials
> - Early stopping to avoid wasting compute on poor configurations
>
> ### Example Answer
>
> With 8 hyperparameters, grid search is infeasible (exponential combinations). I'd use **Hyperopt with Bayesian optimization (TPE)** and `SparkTrials` for distributed execution.
>
> ```python
> from hyperopt import fmin, tpe, hp, SparkTrials, STATUS_OK
> import mlflow
>
> search_space = {
>     "learning_rate": hp.loguniform("learning_rate", -5, 0),
>     "max_depth": hp.quniform("max_depth", 3, 12, 1),
>     "n_estimators": hp.quniform("n_estimators", 100, 1000, 50),
>     "subsample": hp.uniform("subsample", 0.5, 1.0),
>     "colsample_bytree": hp.uniform("colsample_bytree", 0.5, 1.0),
>     "min_child_weight": hp.quniform("min_child_weight", 1, 10, 1),
>     "reg_alpha": hp.loguniform("reg_alpha", -5, 2),
>     "reg_lambda": hp.loguniform("reg_lambda", -5, 2),
> }
>
> spark_trials = SparkTrials(parallelism=4)  # one trial per worker node
>
> best = fmin(
>     fn=train_and_evaluate,
>     space=search_space,
>     algo=tpe.suggest,
>     max_evals=50,
>     trials=spark_trials
> )
> ```
>
> With 4 nodes running in parallel and 15 minutes per trial, 50 evaluations take ~3 hours. TPE learns from previous results, so it converges much faster than random search.
>
> I'd set `parallelism=4` to match the number of worker nodes. Each trial runs a complete training + evaluation on a single worker. MLflow auto-logs each trial as a child run, so I can compare all 50 configurations in the experiment UI.
>
> The budget calculation: if I have a 4-hour window and 4 parallel workers, that's `4 * (4*60/15) = 64` possible trials. I'd set `max_evals=50` to leave headroom for slower trials.
>
> ### Follow-up Questions
>
> - When would you use `Trials` instead of `SparkTrials`?
> - How does TPE differ from random search in practice?
> - What's the trade-off between parallelism and TPE's ability to learn from previous trials?

---

**[← Previous: System Design](./13-system-design.md) | [↑ Back to Interview Prep](./README.md) | [Next: GenAI & RAG Design →](./15-genai-rag-design.md)**
