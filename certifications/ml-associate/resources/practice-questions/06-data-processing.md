---
title: Practice Questions — Data Processing
type: practice-questions
tags: [ml-associate, practice-questions, data-processing, eda, imputation, one-hot-encoding]
status: published
---

# Practice Questions — Data Processing (Section 2)

15 questions added for the re-issued exam guide, covering **Section 2: Data Processing (19 %)** — summary statistics, outlier removal, visualising and comparing features, imputation, one-hot encoding, and log transforms. Study material: [Data Processing](../../02-data-processing/README.md).

[← Back to Practice Questions](./README.md) | [Next: Model Development →](./07-model-development.md)

---

## Question 1: summary() vs describe() *(2026 guide)*

**Question** *(Easy)*: Which statistics does `df.summary()` return by default that `df.describe()` does not?

A) Approximate 25 %, 50 %, and 75 % percentiles  
B) The number of null values per column  
C) The mode of each column  
D) The skewness and kurtosis of each column  

> [!success]- Answer
> **Correct Answer: A**
>
> With no arguments, `summary()` computes count, mean, stddev, min, approximate quartiles (25 %, 50 %, 75 %), and max; `describe()` returns count, mean, stddev, min, and max only.
>
> Neither returns null counts, mode, skewness, or kurtosis by default; `summary()` also accepts arbitrary percentiles such as `"10%"`.

---

## Question 2: Databricks Data Summaries *(2026 guide)*

**Question** *(Easy)*: In a Databricks notebook, which call displays summary statistics (including histograms for numeric columns) for a Spark DataFrame `df`?

A) `dbutils.fs.summarize(df)`  
B) `df.profile()`  
C) `dbutils.data.summarize(df)`  
D) `spark.summary(df)`  

> [!success]- Answer
> **Correct Answer: C**
>
> `dbutils.data.summarize(df)` "calculates and displays summary statistics of an Apache Spark DataFrame or pandas DataFrame." It is the "dbutils data summaries" named in the exam guide.
>
> `dbutils.fs` is for files, and `df.profile()` and `spark.summary()` do not exist.

---

## Question 3: The precise Parameter *(2026 guide)*

**Question** *(Medium)*: What does `dbutils.data.summarize(df, precise=True)` change compared with the default?

A) It samples 1 % of the rows to run faster  
B) Statistics are computed with higher precision; with the default (`False`) some statistics are approximations  
C) It writes the summary to a Delta table  
D) It only summarises numeric columns  

> [!success]- Answer
> **Correct Answer: B**
>
> The default `precise=False` uses approximations for some statistics to reduce run time; `precise=True` computes them with higher precision (all except histograms and percentiles for numeric columns become exact).
>
> The command still analyses the complete DataFrame, writes nothing to a table, and covers all column types.

---

## Question 4: IQR Fences *(2026 guide)*

**Question** *(Medium)*: For a feature, Q1 = 20 and Q3 = 50. Using the 1.5 × IQR rule, what are the lower and upper fences outside which values are treated as outliers?

A) 5 and 65  
B) 20 and 50  
C) −10 and 80  
D) −25 and 95  

> [!success]- Answer
> **Correct Answer: D**
>
> IQR = Q3 − Q1 = 30, so the fences are Q1 − 1.5 × 30 = −25 and Q3 + 1.5 × 30 = 95. Rows outside [−25, 95] are removed (or capped).
>
> In Spark: `q1, q3 = df.approxQuantile("x", [0.25, 0.75], 0.01)` and then `df.filter(F.col("x").between(lower, upper))`.

---

## Question 5: Standard-Deviation Rule *(2026 guide)*

**Question** *(Medium)*: A roughly normal feature `x` has mean `mu` and standard deviation `sigma`. Which filter keeps only values within three standard deviations of the mean?

A) `df.filter(F.abs(F.col("x") - mu) <= 3 * sigma)`  
B) `df.filter(F.col("x") <= mu + 3)`  
C) `df.filter(F.col("x") / sigma <= 3)`  
D) `df.filter(F.abs(F.col("x")) <= 3 * mu)`  

> [!success]- Answer
> **Correct Answer: A**
>
> The z-score rule keeps rows where |x − μ| ≤ k·σ (k = 3 here), i.e. values in [μ − 3σ, μ + 3σ].
>
> The other filters ignore the mean, the standard deviation, or both.

---

## Question 6: Choosing an Outlier Rule for Skewed Data *(2026 guide)*

**Question** *(Hard)*: A `price` column is strongly right-skewed with a few extreme listings. Why are IQR fences usually preferred over a 3-standard-deviation rule here?

A) The IQR rule removes more rows, which always improves models  
B) Standard deviation cannot be computed in Spark  
C) Quartiles barely move when extreme values are present, while the mean and standard deviation are inflated by the very outliers being detected  
D) The IQR rule only works on normally distributed data  

> [!success]- Answer
> **Correct Answer: C**
>
> The z-score rule assumes a roughly symmetric distribution; extreme values pull the mean and inflate σ, widening the bounds so outliers can hide. Quartiles are robust to extremes, so IQR fences suit skewed features.
>
> Removing more rows is not automatically better, Spark computes stddev easily, and IQR is the rule that does *not* need normality.

---

## Question 7: Visualising a Categorical Feature *(2026 guide)*

**Question** *(Easy)*: A data scientist wants to see how often each of the 6 values of `payment_method` occurs. Which visualisation is most appropriate?

A) A scatter plot  
B) A bar chart of counts per category  
C) A line chart over row index  
D) A histogram with 50 numeric bins  

> [!success]- Answer
> **Correct Answer: B**
>
> Categorical features are summarised by frequency per level — a bar (count) chart. Histograms, box plots, and density plots are for **continuous** features; scatter plots compare two continuous features.

---

## Question 8: Comparing Two Continuous Features *(2026 guide)*

**Question** *(Medium)*: What is the appropriate way to examine the relationship between two continuous features, `sqft` and `price`?

A) A scatter plot plus a correlation coefficient (Pearson, or Spearman for monotonic/skewed relationships)  
B) A contingency table and a chi-square test  
C) A bar chart of the counts of each `sqft` value  
D) One-hot encode both features and compare the vectors  

> [!success]- Answer
> **Correct Answer: A**
>
> Two continuous features are compared with a scatter plot and a correlation measure — `df.stat.corr("sqft", "price")` (Pearson) or `pyspark.ml.stat.Correlation.corr(..., method="spearman")`.
>
> Contingency tables and chi-square tests are for two **categorical** features.

---

## Question 9: Comparing Two Categorical Features *(2026 guide)*

**Question** *(Medium)*: A data scientist wants to know whether `plan_type` and `region` (both categorical) are related. Which method is appropriate?

A) Pearson correlation of the raw strings  
B) A scatter plot of the two columns  
C) A box plot of `plan_type` per `region`  
D) A contingency table (`df.stat.crosstab("plan_type", "region")`) and a chi-square test of independence  

> [!success]- Answer
> **Correct Answer: D**
>
> For two categorical variables, a cross-tabulation of counts shows the joint distribution, and a chi-square test (e.g. `pyspark.ml.stat.ChiSquareTest` on indexed columns) tests whether they are independent. A grouped/stacked bar chart visualises it.
>
> Correlation and scatter plots need numeric values; box plots compare a continuous feature across categories.

---

## Question 10: Mean vs Median Imputation *(2026 guide)*

**Question** *(Medium)*: `annual_income` is right-skewed with a handful of extremely high earners, and 8 % of its values are missing. Which imputation is most appropriate?

A) Mean, because it uses every value  
B) Median, because it is robust to the skew and outliers  
C) Mode, because income is continuous  
D) Zero, because missing income means no income  

> [!success]- Answer
> **Correct Answer: B**
>
> Extreme earners pull the mean upward, so mean imputation would assign unrealistically high incomes. The median is robust to skew and outliers. Mean suits roughly symmetric continuous data; mode suits categorical or discrete data.
>
> Filling zero invents information that is probably wrong. In Spark: `Imputer(strategy="median")`, fitted on the training split.

---

## Question 11: Imputing a String Category *(2026 guide)*

**Question** *(Easy)*: The string column `preferred_channel` (email / sms / app) has missing values. Which imputation strategy fits this feature?

A) Mode — fill with the most frequent category  
B) Mean of the column  
C) Median of the column  
D) Linear interpolation between neighbouring rows  

> [!success]- Answer
> **Correct Answer: A**
>
> For a categorical feature, the most frequent value (mode) is the standard simple imputation; mean and median are undefined for strings.
>
> Note that Spark's `Imputer` only accepts numeric columns, so for a string column compute the most frequent value and use `fillna({"preferred_channel": value})` (or add an explicit "unknown" level).

---

## Question 12: Spark Imputer Strategies *(2026 guide)*

**Question** *(Easy)*: Which values does `pyspark.ml.feature.Imputer` accept for `strategy`?

A) `"mean"` and `"median"` only  
B) `"mean"`, `"median"`, and `"constant"`  
C) `"mean"` (default), `"median"`, and `"mode"`  
D) `"ffill"` and `"bfill"`  

> [!success]- Answer
> **Correct Answer: C**
>
> `Imputer` supports `mean` (the default), `median`, and `mode`, computed after filtering out missing values; nulls (and `NaN` by default) are treated as missing. Input columns must be numeric.
>
> `constant` is a scikit-learn `SimpleImputer` strategy; forward/backward fill are pandas methods.

---

## Question 13: One-Hot Encoding a High-Cardinality Feature *(2026 guide)*

**Question** *(Medium)*: A logistic regression model will use `zip_code`, which has about 40,000 distinct values. Why is one-hot encoding a poor choice here?

A) `OneHotEncoder` cannot process more than 100 categories  
B) It creates a huge, very sparse feature space that adds memory cost and overfitting risk; target/frequency encoding or hashing is usually better  
C) Logistic regression cannot use binary features  
D) One-hot encoding makes `zip_code` ordinal  

> [!success]- Answer
> **Correct Answer: B**
>
> One column per level means ~40,000 sparse columns with few observations each — expensive and prone to overfitting. High-cardinality features are better handled with target or frequency encoding (fitted on training data only), hashing, or grouping rare levels.
>
> There is no 100-category limit, linear models use binary indicators routinely, and one-hot encoding removes order rather than adding it.

---

## Question 14: When One-Hot Encoding Is Appropriate *(2026 guide)*

**Question** *(Medium)*: In which situation is one-hot encoding most appropriate?

A) A nominal feature with 5 unordered levels feeding a linear regression model  
B) An ordinal feature (`small` < `medium` < `large`) whose order matters  
C) A `user_id` column with 2 million distinct values  
D) A continuous `temperature` feature  

> [!success]- Answer
> **Correct Answer: A**
>
> Linear and distance-based models treat numbers as magnitudes, so a nominal feature with a few levels should become indicator columns (`StringIndexer` → `OneHotEncoder`).
>
> Ordinal features keep their order with an ordinal mapping, very high-cardinality IDs need other encodings, and continuous features are not one-hot encoded. Tree-based models often do not need one-hot encoding at all.

---

## Question 15: Log Transform with Zeros *(2026 guide)*

**Question** *(Medium)*: `num_reviews` is right-skewed, spans several orders of magnitude, and contains many zeros. Which transformation compresses the tail without failing on zeros?

A) `F.log("num_reviews")`  
B) `F.sqrt(F.col("num_reviews") * -1)`  
C) `F.log1p("num_reviews")`, i.e. log(1 + x)  
D) Min-max scaling to [0, 1]  

> [!success]- Answer
> **Correct Answer: C**
>
> A log transform suits positive, right-skewed values spanning orders of magnitude, but log(0) is undefined. `log1p` computes log(1 + x), so zeros map to 0 while large values are still compressed.
>
> The square root of a negative number is invalid, and min-max scaling rescales the range without reducing skew. If you log-transform a **target**, exponentiate the predictions (`expm1` after `log1p`) before reporting metrics.

---

**[← Previous: Unity Catalog, MLOps & MLflow Client](./05-unity-catalog-mlops.md) | [↑ Back to Practice Questions — ML Associate](./README.md) | [Next: Model Development →](./07-model-development.md)**
