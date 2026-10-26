---
title: Practice Questions — Model Development
type: practice-questions
tags: [ml-associate, practice-questions, model-development, hyperparameter-tuning, evaluation-metrics]
status: published
---

# Practice Questions — Model Development (Section 3)

18 questions added for the re-issued exam guide, covering **Section 3: Model Development (31 %)** — algorithm selection, class imbalance, estimators vs transformers, training pipelines, Hyperopt and search strategies, cross-validation, metrics, log targets, and the bias-variance tradeoff. Study material: [Model Development](../../03-model-development/README.md).

[← Back to Practice Questions](./README.md) | [Next: Model Deployment →](./08-model-deployment.md)

---

## Question 1: Interpretable Algorithm Choice *(2026 guide)*

**Question** *(Medium)*: A lender must explain to a regulator how each input affects every approve/decline decision. Which algorithm is the most appropriate starting point?

A) Logistic regression  
B) k-means clustering  
C) A deep neural network with many hidden layers  
D) Linear regression on the approve/decline label  

> [!success]- Answer
> **Correct Answer: A**
>
> Approve/decline is binary classification, and logistic regression's coefficients explain each feature's effect on the log-odds — ideal when interpretability is required.
>
> k-means is unsupervised, a deep network is hard to explain, and linear regression is meant for continuous targets.

---

## Question 2: Non-Linear Tabular Regression *(2026 guide)*

**Question** *(Medium)*: A team predicts delivery time (minutes) from tabular features with strong non-linear effects and interactions. Interpretability is secondary. Which algorithm family is the best first choice?

A) Logistic regression  
B) Gradient-boosted tree regression (e.g. `GBTRegressor`, XGBoost, LightGBM)  
C) k-means clustering  
D) Naive Bayes  

> [!success]- Answer
> **Correct Answer: B**
>
> The target is continuous (regression), and tree ensembles capture non-linear effects and interactions without manual feature crosses.
>
> Logistic regression and Naive Bayes are classifiers, and k-means is unsupervised.

---

## Question 3: Where to Oversample *(2026 guide)*

**Question** *(Hard)*: Only 5 % of rows are fraud. A data scientist plans to oversample the fraud class. At which point should oversampling be applied?

A) Before splitting, to the whole dataset, so every split is balanced  
B) To the test set only, so evaluation is fair  
C) To the training split only, after splitting; validation and test keep the real class distribution  
D) To the validation set only, so tuning sees more fraud  

> [!success]- Answer
> **Correct Answer: C**
>
> Resampling changes the data the model **learns** from; evaluation must reflect reality. Oversampling before the split leaks duplicated minority rows into validation/test and inflates metrics. (AutoML follows the same rule: it balances only the training split.)

---

## Question 4: Class Weights in Spark ML *(2026 guide)*

**Question** *(Medium)*: How do you make a Spark ML `LogisticRegression` penalise errors on the minority class more heavily?

A) Add a weight column (higher for minority rows) and set `weightCol` on the estimator  
B) Set `classWeight="balanced"` on `LogisticRegression`  
C) Add a `StandardScaler` stage before the model  
D) Increase `maxIter`  

> [!success]- Answer
> **Correct Answer: A**
>
> Spark ML estimators such as `LogisticRegression` accept `weightCol`; giving minority rows a larger weight is cost-sensitive learning. `class_weight="balanced"` is the scikit-learn equivalent — Spark's `LogisticRegression` has no `classWeight` parameter.
>
> Scaling and more iterations do not address imbalance.

---

## Question 5: Is Imputer an Estimator? *(2026 guide)*

**Question** *(Easy)*: In Spark ML, what kind of pipeline stage is `Imputer`?

A) A Transformer — it only has `transform()`  
B) An Evaluator  
C) An Estimator — `fit()` learns the fill values and returns an `ImputerModel`  
D) It cannot be used inside a `Pipeline`  

> [!success]- Answer
> **Correct Answer: C**
>
> Anything that must learn from data is an Estimator. `Imputer.fit(df)` computes the mean/median/mode and returns an `ImputerModel` (a Transformer). `StringIndexer`, `OneHotEncoder`, `StandardScaler`, and every learning algorithm are Estimators too; `VectorAssembler`, `Bucketizer`, and `SQLTransformer` are Transformers.

---

## Question 6: Leakage in a Training Pipeline *(2026 guide)*

**Question** *(Medium)*: A data scientist fits `StandardScaler` on the full dataset, then splits into train and test and trains a model. What is wrong, and what is the fix?

A) Nothing — scaling statistics are harmless  
B) Test-set statistics leak into training; split first, then fit a `Pipeline` (scaler + model) on the training data and only `transform` the test data  
C) The scaler should be fitted on the test set only  
D) `StandardScaler` must always come after the model in a `Pipeline`  

> [!success]- Answer
> **Correct Answer: B**
>
> Fitting any Estimator (scaler, imputer, encoder) on data that includes the test set leaks information into training. Split first, fit the whole `Pipeline` on the training split, and apply the fitted `PipelineModel` to validation/test data.

---

## Question 7: What fmin Optimises *(2026 guide)*

**Question** *(Medium)*: A Hyperopt objective returns validation accuracy, and `fmin` keeps choosing the *worst* hyperparameters. What should the objective return instead?

A) `{"loss": accuracy, "status": STATUS_OK}`  
B) `{"accuracy": accuracy}`  
C) `{"loss": -accuracy, "status": STATUS_OK}` (or `1 - accuracy`)  
D) Nothing — `fmin` reads metrics from MLflow  

> [!success]- Answer
> **Correct Answer: C**
>
> `fmin` **minimises** the `loss` returned by the objective. To maximise a score, return its negative (or 1 − score). Loss-type metrics such as RMSE or log loss can be returned as-is.

---

## Question 8: Bayesian Search in Hyperopt *(2026 guide)*

**Question** *(Easy)*: Which Hyperopt `algo` performs Bayesian (adaptive) optimisation, choosing each trial based on earlier results?

A) `rand.suggest`  
B) `grid.suggest`  
C) `SparkTrials`  
D) `tpe.suggest`  

> [!success]- Answer
> **Correct Answer: D**
>
> `tpe.suggest` (Tree-structured Parzen Estimator) uses completed trials to propose promising regions — Bayesian search. `rand.suggest` is random search; Hyperopt has no `grid.suggest`. `SparkTrials` controls *where* trials run, not *how* they are chosen.

---

## Question 9: Parallelising Single-Node Tuning *(2026 guide)*

**Question** *(Medium)*: A scikit-learn random forest trains on a single machine. The team wants Hyperopt to run eight trials at a time across an eight-worker cluster. What should they pass to `fmin`?

A) `trials=SparkTrials(parallelism=8)`  
B) `trials=Trials()`  
C) `algo=rand.suggest` with `max_evals=8`  
D) Wrap the model in Spark ML `CrossValidator(parallelism=8)`  

> [!success]- Answer
> **Correct Answer: A**
>
> `SparkTrials` "is designed to parallelize computations for single-machine ML models such as scikit-learn": each trial runs on a worker, up to `parallelism` at once. `Trials()` runs sequentially on the driver, the algorithm choice does not add parallelism, and `CrossValidator` tunes Spark ML estimators, not scikit-learn models.

---

## Question 10: SparkTrials with Spark MLlib *(2026 guide)*

**Question** *(Hard)*: A data scientist uses Hyperopt to tune a Spark ML `GBTClassifier` on a 500 GB table. Which `trials` object is recommended?

A) `SparkTrials`, because the data is large  
B) The default `Trials`, because MLlib already distributes model training across the cluster  
C) `SparkTrials(parallelism=1)` only  
D) Hyperopt cannot tune MLlib models  

> [!success]- Answer
> **Correct Answer: B**
>
> For distributed algorithms such as Spark MLlib, use the default `Trials` class: each trial is already a distributed Spark job. `SparkTrials` is for single-machine models. (Platform note: Hyperopt is no longer included in Databricks Runtime ML after 16.4 LTS ML; the docs recommend Optuna or Ray Tune for new work.)

---

## Question 11: Cost of Grid Search *(2026 guide)*

**Question** *(Medium)*: Which statement about grid search is true?

A) Its cost grows with the **product** of the number of values per hyperparameter, so adding parameters quickly multiplies the number of models  
B) It learns from previous trials to choose the next combination  
C) It always finds a better optimum than random search for the same budget  
D) It samples a fixed number of random combinations  

> [!success]- Answer
> **Correct Answer: A**
>
> Grid search is exhaustive: 4 values × 4 values × 5 values = 80 combinations, multiplied again by the number of CV folds. Bayesian search learns from previous trials, random search samples a fixed number of combinations, and random search often matches grid search with far fewer trials when only some parameters matter.

---

## Question 12: Counting Models in a Cross-Validated Grid *(2026 guide)*

**Question** *(Medium)*: A `ParamGridBuilder` has `regParam` = [0.01, 0.1, 1.0], `elasticNetParam` = [0.0, 0.5], and `maxIter` = [50, 100]. It is used with `CrossValidator(numFolds=4)`. How many models are fitted **during the search** (not counting the final refit)?

A) 12  
B) 16  
C) 48  
D) 19  

> [!success]- Answer
> **Correct Answer: C**
>
> The grid has 3 × 2 × 2 = 12 combinations, and 4-fold CV fits 4 models per combination: 12 × 4 = 48. `CrossValidator` then refits the best combination once on the full training data (49 in total).

---

## Question 13: Downside of Cross-Validation *(2026 guide)*

**Question** *(Easy)*: Compared with a single train-validation split, what is the main downside of k-fold cross-validation?

A) It uses less of the data for validation  
B) It trains k times as many models, so it costs more time and compute  
C) It cannot be used with Spark ML pipelines  
D) It produces higher-variance estimates  

> [!success]- Answer
> **Correct Answer: B**
>
> k-fold CV trains and evaluates k models per combination, giving a lower-variance, more reliable estimate (every row is validated once) at roughly k times the cost. `TrainValidationSplit` is cheaper but noisier. CV works with Spark ML via `CrossValidator`.

---

## Question 14: Metric for Costly False Negatives *(2026 guide)*

**Question** *(Medium)*: In a disease-screening model, missing a sick patient is far worse than flagging a healthy one for a follow-up test. Which metric should drive model selection?

A) Precision  
B) Accuracy  
C) R²  
D) Recall  

> [!success]- Answer
> **Correct Answer: D**
>
> Recall = TP / (TP + FN) measures how many actual positives are found, so it directly penalises missed patients. Precision matters when false positives are costly, accuracy misleads on imbalanced data, and R² is a regression metric.

---

## Question 15: RMSE vs MAE *(2026 guide)*

**Question** *(Medium)*: A forecasting team wants an error metric in dollars that is **not** dominated by a few very large misses. Which metric should they use?

A) RMSE  
B) MAE  
C) MSE  
D) ROC AUC  

> [!success]- Answer
> **Correct Answer: B**
>
> MAE averages absolute errors, so every dollar of error counts equally and outliers do not dominate. RMSE and MSE square errors, which emphasises large misses (useful when big misses are especially costly). ROC AUC is a classification metric.

---

## Question 16: Evaluating a Log-Transformed Target *(2026 guide)*

**Question** *(Medium)*: A model was trained on `log(price)`. The team reports an RMSE of 0.21 computed on the model's raw predictions and the log labels. Management wants the error in dollars. What should be done?

A) Report 0.21 dollars — RMSE is unit-free  
B) Multiply 0.21 by the mean price  
C) Retrain on raw price, because log targets cannot be evaluated  
D) Exponentiate the predictions (e.g. `F.exp("prediction")`) and compute RMSE against the original `price` column  

> [!success]- Answer
> **Correct Answer: D**
>
> Predictions from a log-target model are in log space. Convert them back with `exp` (or `expm1` after `log1p`) and compute metrics against the original labels so the numbers mean something in dollars. RMSE is in the target's units, so 0.21 is in log units. Log targets are fine to use; they just have to be undone before evaluation and interpretation.

---

## Question 17: Diagnosing Underfitting *(2026 guide)*

**Question** *(Medium)*: A model's error is high on **both** the training and validation sets, and the two are similar. What is happening, and what should the data scientist try?

A) High variance — reduce model complexity  
B) High bias (underfitting) — increase model complexity or add more informative features  
C) Data leakage — remove the validation set  
D) The model is well fitted — deploy it  

> [!success]- Answer
> **Correct Answer: B**
>
> High error everywhere means the model is too simple to capture the pattern (high bias). Increase capacity (deeper trees, more features, less regularisation). High variance would show **low** training error with much higher validation error.

---

## Question 18: Choosing Tree Depth *(2026 guide)*

**Question** *(Hard)*: As `maxDepth` increases from 2 to 20, training error falls steadily. Validation error falls until depth 8, then rises. Which conclusion is correct?

A) Depth 20 is best because training error is lowest  
B) Depth 2 is best because the model is simplest  
C) Depth around 8 balances bias and variance; deeper trees overfit (high variance)  
D) The validation set is broken because its error should keep falling  

> [!success]- Answer
> **Correct Answer: C**
>
> More complexity lowers bias but raises variance. The best setting minimises **validation** error (here around depth 8). Beyond that, the model memorises training noise: training error keeps falling while validation error rises — classic overfitting.

---

**[← Previous: Data Processing](./06-data-processing.md) | [↑ Back to Practice Questions — ML Associate](./README.md) | [Next: Model Deployment →](./08-model-deployment.md)**
