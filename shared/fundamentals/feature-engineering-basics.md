---
tags:
  - feature-engineering
  - machine-learning
  - spark-ml
  - fundamentals
  - ml-associate
  - ml-professional
aliases:
  - Feature Engineering
  - Feature Store
---

# Feature Engineering Basics

Feature engineering is the process of transforming raw data into numerical representations (features) that machine learning models can learn from effectively.

## What is Feature Engineering?

Raw data (text, timestamps, categorical values, nested JSON) must be converted to numerical form before most ML algorithms can use it. Feature engineering includes:

- **Transformations** — encode categories, scale numerics, extract date parts
- **Aggregations** — rolling averages, counts, ratios
- **Interactions** — combinations of existing features
- **Embeddings** — dense representations of high-cardinality categories

Good features often matter more than model choice. A simple model with good features consistently outperforms a complex model with poor features.

## Feature Engineering Pipeline

```mermaid
flowchart LR
    subgraph Raw["Raw Data"]
        Nums[Numeric]
        Cats[Categorical]
        Text[Text]
        Dates[Timestamps]
    end

    subgraph Transform["Transformations"]
        Scale[Scaling<br>StandardScaler<br>MinMaxScaler]
        Encode[Encoding<br>OneHot, Ordinal]
        Extract[Extraction<br>TF-IDF, Embeddings]
        DateF[Date Features<br>day, hour, weekend]
    end

    subgraph Output["Feature Vector"]
        Vec[Dense/Sparse<br>Numeric Vector]
    end

    Raw --> Transform --> Output
```text

## Numeric Feature Transformations

### Scaling

Many ML algorithms (linear models, SVMs, neural networks) are sensitive to feature scale.

```python
from pyspark.ml.feature import StandardScaler, MinMaxScaler
from pyspark.ml.feature import VectorAssembler

# Assemble numeric columns into a vector first
assembler = VectorAssembler(
    inputCols=["age", "income", "num_purchases"],
    outputCol="features_raw"
)

# StandardScaler: zero mean, unit variance
scaler = StandardScaler(
    inputCol="features_raw",
    outputCol="features_scaled",
    withMean=True,
    withStd=True
)

# MinMaxScaler: scale to [0, 1]
minmax = MinMaxScaler(
    inputCol="features_raw",
    outputCol="features_scaled",
    min=0.0,
    max=1.0
)
```text

### Binning / Bucketization

```python
from pyspark.ml.feature import Bucketizer, QuantileDiscretizer

# Fixed splits
bucketizer = Bucketizer(
    splits=[0, 18, 35, 55, 65, float("inf")],
    inputCol="age",
    outputCol="age_bucket"
)

# Automatic quantile-based buckets
quantile = QuantileDiscretizer(
    numBuckets=4,
    inputCol="income",
    outputCol="income_quartile"
)
```text

## Categorical Feature Encoding

### String Indexing + One-Hot Encoding

```python
from pyspark.ml.feature import StringIndexer, OneHotEncoder

# Step 1: Convert string categories to numeric indices
indexer = StringIndexer(
    inputCol="country",
    outputCol="country_index",
    handleInvalid="keep"  # handle unseen categories at predict time
)

# Step 2: One-hot encode the indices
encoder = OneHotEncoder(
    inputCols=["country_index"],
    outputCols=["country_ohe"],
    dropLast=True  # avoid multicollinearity
)
```text

### When to Use Each Encoding

| Encoding | Algorithm | Notes |
| :--- | :--- | :--- |
| **One-Hot** | Linear models, neural nets | No ordinal relationship implied |
| **Ordinal / Index** | Tree-based models (RF, XGBoost) | Trees handle integers directly |
| **Target encoding** | Any | Use mean of target per category; risk of leakage |
| **Hashing** | High-cardinality categories | Fixed-size output, some collisions |

## Text Feature Extraction

```python
from pyspark.ml.feature import Tokenizer, HashingTF, IDF, Word2Vec

# Classic TF-IDF pipeline
tokenizer = Tokenizer(inputCol="review_text", outputCol="words")

hashing_tf = HashingTF(
    inputCol="words",
    outputCol="raw_features",
    numFeatures=10000
)

idf = IDF(inputCol="raw_features", outputCol="tfidf_features")

# Word2Vec embeddings
word2vec = Word2Vec(
    vectorSize=100,
    inputCol="words",
    outputCol="w2v_features"
)
```text

## Date and Time Features

```python
from pyspark.sql.functions import (
    hour, dayofweek, month, year,
    datediff, unix_timestamp
)

df = (
    df
    .withColumn("hour_of_day", hour("event_timestamp"))
    .withColumn("day_of_week", dayofweek("event_timestamp"))  # 1=Sun, 7=Sat
    .withColumn("month", month("event_timestamp"))
    .withColumn("is_weekend", (dayofweek("event_timestamp").isin([1, 7])).cast("int"))
    .withColumn(
        "days_since_signup",
        datediff("event_timestamp", "signup_date")
    )
)
```text

## Aggregated / Computed Features

Window functions are powerful for computing historical features:

```python
from pyspark.sql.functions import avg, count, col
from pyspark.sql import Window

# 7-day rolling average spend per user
window_7d = (
    Window
    .partitionBy("user_id")
    .orderBy("event_date")
    .rowsBetween(-6, 0)
)

df = (
    df
    .withColumn("avg_spend_7d", avg("purchase_amount").over(window_7d))
    .withColumn("purchase_count_7d", count("purchase_id").over(window_7d))
)
```text

## ML Pipelines

Spark ML's `Pipeline` API chains transformers and estimators for reproducible preprocessing:

```python
from pyspark.ml import Pipeline
from pyspark.ml.classification import RandomForestClassifier

pipeline = Pipeline(stages=[
    assembler,    # VectorAssembler
    scaler,       # StandardScaler
    indexer,      # StringIndexer
    encoder,      # OneHotEncoder
    RandomForestClassifier(
        featuresCol="features_scaled",
        labelCol="label",
        numTrees=100
    )
])

# Fit on training data
pipeline_model = pipeline.fit(train_df)

# Transform test data (applies same preprocessing)
predictions = pipeline_model.transform(test_df)
```text

**Key benefit:** The fitted pipeline stores all transformation statistics (mean, std dev, category mappings) from the training set and applies them consistently to new data.

## Databricks Feature Store

The Databricks Feature Store is a centralized repository for computed features that enables feature reuse across teams and models.

```mermaid
flowchart LR
    subgraph Compute["Feature Computation"]
        Notebook[Spark Notebook<br>or Job]
        DLT[DLT Pipeline]
    end

    subgraph Store["Feature Store"]
        FS[(Feature Tables<br>Delta Tables)]
        Registry[Feature Registry<br>Metadata + Lineage]
    end

    subgraph Training["Model Training"]
        Lookup[Feature Lookup<br>at Training Time]
        MLflow[MLflow Model<br>with Feature Metadata]
    end

    subgraph Serving["Inference"]
        Online[Online Feature<br>Lookup]
        Batch[Batch Feature<br>Join]
    end

    Compute --> Store
    Store --> Training
    Training --> MLflow
    MLflow --> Serving
```text

```python
from databricks.feature_engineering import FeatureEngineeringClient

fe = FeatureEngineeringClient()

# Create a feature table
fe.create_table(
    name="prod_catalog.features.user_behavior",
    primary_keys=["user_id"],
    schema=feature_df.schema,
    description="7-day and 30-day behavioral features per user"
)

# Write features
fe.write_table(
    name="prod_catalog.features.user_behavior",
    df=feature_df,
    mode="merge"
)
```text

## Use Cases

| Use Case | Features Needed |
| :--- | :--- |
| Fraud detection | Time-since-last-transaction, rolling spend, geo-distance |
| Churn prediction | Days since login, support tickets, usage trend |
| Recommendation | User embedding, item embedding, interaction history |
| Demand forecasting | Day of week, holiday flag, price, promotions |

## Common Exam Pitfalls

1. **Training/serving skew** — Features computed differently at training vs serving time cause silent model degradation. Feature Store solves this.
2. **Data leakage** — Including features that encode future information into training (e.g., using post-event data to predict the event)
3. **StringIndexer `handleInvalid`** — Default is `"error"`; set to `"keep"` or `"skip"` to handle unseen categories at prediction time
4. **Pipeline vs manual transforms** — Always use `Pipeline` so that fit-time statistics (scaling params, index mappings) are stored and applied consistently
5. **Target encoding leakage** — If computing target encoding on the full dataset before splitting, you leak label information into the features

## Related Topics

- [ML Associate Certification](../../certifications/ml-associate/README.md)
- [ML Professional Certification](../../certifications/ml-professional/README.md)
- [MLflow Basics](mlflow-basics.md)
- [Python Essentials](python-essentials.md)
- [Spark Fundamentals](spark-fundamentals.md)
