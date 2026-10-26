---
title: Exploratory Data Analysis for ML
type: study-material
tags:
  - ml-associate
  - data-processing
  - eda
  - summary-statistics
  - outliers
status: published
---

# Exploratory Data Analysis for ML

## Overview

Before a single feature is encoded, you need to know what the data looks like: its distributions, its gaps, its extreme values, and how features relate to each other. Section 2 of the exam guide (**Data Processing, 19 %**) starts with exactly these skills — summary statistics, outlier removal, visualising features, and comparing pairs of features.

> [!abstract]
>
> - `df.summary()` / `df.describe()` give count, mean, stddev, min/max (and quartiles for `summary`); `dbutils.data.summarize(df)` renders an interactive profile
> - Outliers are removed by **standard deviation** (e.g. beyond ±3σ) or **IQR** fences (Q1 − 1.5·IQR, Q3 + 1.5·IQR)
> - Categorical features → bar/count charts; continuous features → histograms, box plots, density plots
> - Two continuous features → scatter plot + correlation; two categorical features → contingency table + chi-square test

> [!tip] What the Exam Tests
>
> - *Compute summary statistics on a Spark DataFrame using `.summary()` or dbutils data summaries*
> - *Remove outliers based on standard deviation or IQR* — know the formulas and the Spark calls
> - *Create visualizations for categorical or continuous features* and *compare two categorical or two continuous features using the appropriate method*

---

## Summary Statistics

### **`DataFrame.summary()` and `describe()`**

```python
df = spark.read.table("ml_dev.housing.listings")

# Default: count, mean, stddev, min, 25%, 50%, 75%, max (approximate percentiles)
display(df.summary())

# Pick specific statistics, including arbitrary percentiles
display(df.select("price", "sqft").summary("count", "min", "10%", "50%", "90%", "max"))

# describe(): count, mean, stddev, min, max — no percentiles
display(df.describe("price", "sqft"))
```

| Method | Statistics | Notes |
| :--- | :--- | :--- |
| `df.summary()` | count, mean, stddev, min, **25 % / 50 % / 75 %**, max | Pass names (`"count"`, `"10%"`, …) to choose; percentiles are approximate |
| `df.describe()` | count, mean, stddev, min, max | Quick numeric overview without quartiles |
| `dbutils.data.summarize(df)` | Per-column summary statistics, including histograms and percentiles for numeric columns | Rendered output in the notebook; works on Spark or pandas DataFrames |

Source: [PySpark `DataFrame.summary`](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.summary.html).

### **`dbutils.data.summarize`**

```python
dbutils.data.summarize(df)                 # approximate statistics (default, faster)
dbutils.data.summarize(df, precise=True)   # exact statistics except histograms/percentiles
```

- "Calculates and displays summary statistics of an Apache Spark DataFrame or pandas DataFrame"
- It "analyzes the complete contents of the DataFrame," so it can be expensive on very large data
- `precise` (Databricks Runtime 10.4 LTS and above) trades speed for precision; with `precise=False` some statistics are approximations
- The data utility is documented as **Public Preview**

Source: [Databricks Utilities — data utility](https://docs.databricks.com/aws/en/dev-tools/databricks-utils).

### **Missing values at a glance**

```python
from pyspark.sql import functions as F

null_counts = df.select([
    F.sum(F.col(c).isNull().cast("int")).alias(c) for c in df.columns
])
display(null_counts)
```

## Removing Outliers

### **Standard-deviation (z-score) rule**

Keep values within *k* standard deviations of the mean (k = 3 is common; 2 is stricter). Best when the feature is roughly **normal** — the mean and stddev are themselves pulled by extreme values.

```python
from pyspark.sql import functions as F

stats = df.select(F.mean("price").alias("mu"), F.stddev("price").alias("sigma")).first()
k = 3
lower, upper = stats["mu"] - k * stats["sigma"], stats["mu"] + k * stats["sigma"]

df_no_outliers = df.filter((F.col("price") >= lower) & (F.col("price") <= upper))
```

### **IQR (Tukey fences) rule**

Keep values inside **[Q1 − 1.5·IQR, Q3 + 1.5·IQR]**, where IQR = Q3 − Q1. Robust for **skewed** data because quartiles barely move when extremes are present.

```python
q1, q3 = df.approxQuantile("price", [0.25, 0.75], 0.01)   # relativeError=0.01
iqr = q3 - q1
lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr

df_no_outliers = df.filter(F.col("price").between(lower, upper))
```

| Rule | Bounds | Use when | Watch out |
| :--- | :--- | :--- | :--- |
| **Std-dev (z-score)** | μ ± k·σ | Roughly symmetric / normal features | Outliers inflate σ and can hide themselves |
| **IQR** | Q1 − 1.5·IQR … Q3 + 1.5·IQR | Skewed features, unknown distribution | Very long tails can still flag many valid points |

> [!warning] Common Mistake
> Compute the bounds on the **training** split only, then apply the same bounds to validation/test data. Also decide whether an extreme value is an *error* (remove or fix) or a *rare but real* case (keep, cap, or log-transform).

## Visualising Features

| Feature type | Good plots | What you look for |
| :--- | :--- | :--- |
| **Categorical** | Bar chart / count plot of value frequencies | Rare levels, dominant levels, cardinality, class imbalance in the label |
| **Continuous** | Histogram, density (KDE), box plot | Skew, multiple modes, outliers, impossible values |
| **Continuous by category** | Box plot or violin plot per category | Whether the distribution shifts between groups |

```python
# Built-in: display(df) → "+" → Visualization (bar, histogram, box, scatter, ...)
display(df.groupBy("property_type").count().orderBy("count", ascending=False))

# matplotlib / seaborn on a pandas sample
import matplotlib.pyplot as plt
import seaborn as sns

pdf = df.select("price", "sqft", "property_type").sample(fraction=0.1, seed=42).toPandas()

fig, axes = plt.subplots(1, 3, figsize=(15, 4))
sns.histplot(pdf["price"], bins=50, ax=axes[0])          # continuous: histogram
sns.boxplot(x=pdf["sqft"], ax=axes[1])                   # continuous: box plot (outliers)
sns.countplot(x=pdf["property_type"], ax=axes[2])        # categorical: counts
display(fig)
```

## Comparing Two Features

### **Two continuous features → scatter plot + correlation**

```python
# Pearson correlation between two columns
print(df.stat.corr("sqft", "price"))          # DataFrame.stat.corr supports Pearson

# Correlation matrix (Pearson or Spearman) over a vector column
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.stat import Correlation

vec = VectorAssembler(inputCols=["sqft", "bedrooms", "price"], outputCol="v").transform(df)
spearman = Correlation.corr(vec, "v", method="spearman").head()[0]
print(spearman.toArray())

sns.scatterplot(data=pdf, x="sqft", y="price")
```

- **Pearson** measures *linear* association; **Spearman** measures *monotonic* (rank) association and is less sensitive to outliers and skew
- Correlation near ±1 between two *features* signals redundancy (multicollinearity) for linear models

### **Two categorical features → contingency table + chi-square**

```python
# Contingency (cross) table of counts
display(df.stat.crosstab("property_type", "neighbourhood_group"))

# Chi-square test of independence of indexed categorical features vs a categorical label
from pyspark.ml.feature import StringIndexer
from pyspark.ml.stat import ChiSquareTest

idx = StringIndexer(inputCols=["property_type", "room_type"],
                    outputCols=["property_type_idx", "room_type_idx"]).fit(df).transform(df)
vec = VectorAssembler(inputCols=["property_type_idx"], outputCol="cat_features").transform(idx)

result = ChiSquareTest.test(vec, "cat_features", "room_type_idx").head()
print(result.pValues, result.statistics)
```

- A small p-value means the two categorical variables are **not independent**
- Visualise with a stacked/grouped bar chart or a heat map of the cross-tab

| Pair of features | Numeric summary | Plot |
| :--- | :--- | :--- |
| Continuous × continuous | Pearson / Spearman correlation | Scatter plot |
| Categorical × categorical | Contingency table, chi-square test (or Cramér's V) | Grouped / stacked bar chart, heat map |
| Categorical × continuous | Group means/medians | Box plot per category |

## Use Cases

- **Data Quality Gate Before Training**: Running `df.summary()` and null counts on a new Unity Catalog table to catch impossible values (negative prices) before feature engineering.
- **Choosing an Outlier Strategy**: A right-skewed `price` column is filtered with IQR fences instead of a 3σ rule because the extreme listings inflate the standard deviation.

## Common Issues & Errors

### `dbutils.data.summarize` Is Slow on a Large Table

**Scenario:** The summary of a multi-billion-row table takes a long time.
**Fix:** It scans the complete DataFrame — summarise a sample (`df.sample(0.01)`), keep `precise=False`, or use `df.summary()` on selected columns.

### Outlier Filter Removes Too Many Rows

**Scenario:** A z-score filter on a heavily skewed feature drops a large share of valid rows.
**Fix:** Inspect the histogram first; for skewed data use IQR fences or log-transform before applying a z-score rule.

## Exam Tips

- ✅ `summary()` adds quartiles (25 %/50 %/75 %) that `describe()` does not show
- ✅ `dbutils.data.summarize(df)` is the "dbutils data summaries" in the exam guide
- ✅ Std-dev rule: μ ± 3σ (assumes roughly normal); IQR rule: Q1 − 1.5·IQR to Q3 + 1.5·IQR (robust to skew)
- ✅ Two continuous → correlation + scatter; two categorical → cross-tab + chi-square
- ✅ Bar charts for categorical frequencies; histograms/box plots for continuous distributions

## Key Takeaways

- EDA decides every later choice: imputation strategy, outlier handling, encoding, and transformations
- `summary()` and `dbutils.data.summarize()` are the fastest way to profile a Spark DataFrame
- Choose the outlier rule that matches the distribution: z-score for symmetric, IQR for skewed
- Match the comparison method to the feature types

## Related Topics

- [Feature Engineering Techniques](./02-feature-engineering-techniques.md) — imputation, one-hot encoding, log transforms
- [Model Evaluation & Metrics](../03-model-development/03-model-evaluation.md)
- [Feature Engineering Basics (shared)](../../../shared/fundamentals/feature-engineering-basics.md)
- [PySpark API cheat sheet (shared)](../../../shared/cheat-sheets/pyspark-api-quick-ref.md)

## Official Documentation

- [Databricks Utilities — data utility (`dbutils.data`)](https://docs.databricks.com/aws/en/dev-tools/databricks-utils)
- [PySpark `DataFrame.summary`](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.summary.html)
- [Spark ML basic statistics (Correlation, ChiSquareTest)](https://spark.apache.org/docs/latest/ml-statistics.html)
- [Visualizations in Databricks notebooks](https://docs.databricks.com/aws/en/visualizations/)

---

**[↑ Back to Section](./README.md) | [Next: Feature Engineering Techniques →](./02-feature-engineering-techniques.md)**
