---
title: Advanced Feature Techniques
type: study-material
tags:
  - feature-engineering
  - advanced-techniques
  - optimization
  - production-patterns
---

# Advanced Feature Techniques

## Overview

Production-grade feature engineering techniques including feature selection, scaling, interaction terms, embeddings, and optimization for distributed computing.

## Feature Selection Techniques

### **Statistical Feature Selection**

```python
from pyspark.ml.feature import ChiSqSelector, UnivariateFeatureSelector
from pyspark.ml.linalg import VectorAssembler
from pyspark.ml import Pipeline

# Chi-squared test for categorical features

chi_sq_selector = ChiSqSelector(
    numTopFeatures=50,
    featuresCol="features",
    outputCol="selected_features",
    labelCol="target"
)

# Univariate feature selection (regression/classification)

univariate_selector = UnivariateFeatureSelector(
    selectionThreshold=10.0,  # Chi-squared statistic threshold
    featuresCol="features",
    outputCol="selected_features",
    labelCol="target"
)

# RFormula for automatic feature selection

from pyspark.ml.feature import RFormula

rformula = RFormula(
    formula="target ~ f1 + f2 + f3 + f1:f2",  # Interaction terms
    featuresCol="features",
    labelCol="target"
)
```

### **Tree-Based Feature Importance**

```python
from pyspark.ml.classification import GBTClassifier
from pyspark.ml.feature import VectorAssembler

# Train GBT for feature importance

assembler = VectorAssembler(
    inputCols=feature_columns,
    outputCol="features"
)

gbt = GBTClassifier(
    numIterations=100,
    maxDepth=5,
    seed=42
)

pipeline = Pipeline(stages=[assembler, gbt])
model = pipeline.fit(training_df)

# Extract feature importance

gbt_model = model.stages[-1]
feature_importance = gbt_model.featureImportances
feature_names = feature_columns

# Convert to DataFrame for analysis

importance_df = spark.createDataFrame(
    [(name, float(value)) for name, value in zip(feature_names, feature_importance)],
    ["feature", "importance"]
).sort("importance", ascending=False)

print(importance_df.show())
```

### **Correlation and Multicollinearity Analysis**

```python
from pyspark.ml.stat import Correlation
from pyspark.ml.feature import VectorAssembler

# Compute correlation matrix

assembler = VectorAssembler(inputCols=feature_columns, outputCol="features")
correlation_matrix = Correlation.corr(
    assembler.transform(df),
    "features",
    method="pearson"
).collect()[0][0].toArray()

# Identify highly correlated features

import numpy as np

corr_df = pd.DataFrame(
    correlation_matrix,
    columns=feature_columns,
    index=feature_columns
)

# Detect multicollinearity (VIF > 10)

def calculate_vif(features):
    from sklearn.preprocessing import StandardScaler
    from statsmodels.stats.outliers_influence import variance_inflation_factor
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)
    
    vif = [variance_inflation_factor(X_scaled, i) for i in range(X_scaled.shape[1])]
    return vif
```

## Feature Scaling and Normalization

```python
from pyspark.ml.feature import StandardScaler, MinMaxScaler, Normalizer

# StandardScaler: (x - mean) / std

standard_scaler = StandardScaler(
    inputCol="features",
    outputCol="scaled_features",
    withMean=True,
    withStd=True
)

# MinMaxScaler: (x - min) / (max - min)

min_max_scaler = MinMaxScaler(
    inputCol="features",
    outputCol="scaled_features",
    min=0.0,
    max=1.0
)

# Normalizer: L2 norm normalization (useful for distance-based algorithms)

normalizer = Normalizer(
    inputCol="features",
    outputCol="normalized_features",
    p=2.0  # L2 norm
)

# Pipeline for scaling

scale_pipeline = Pipeline(stages=[
    VectorAssembler(inputCols=feature_cols, outputCol="features"),
    StandardScaler(inputCol="features", outputCol="scaled_features")
])

scaled_model = scale_pipeline.fit(df)
scaled_df = scaled_model.transform(df)
```

## Advanced Feature Engineering Patterns

### Pattern 1: Interaction Terms

```python
from pyspark.ml.feature import PolynomialExpansion, VectorAssembler
from pyspark.sql.functions import col

# Polynomial expansion for interaction terms

poly_expansion = PolynomialExpansion(
    degree=2,
    inputCol="features",
    outputCol="poly_features"
)

# Manual interaction creation

def create_interactions(df, feature_pairs):
    """Create interaction terms manually"""
    result = df
    for f1, f2 in feature_pairs:
        result = result.withColumn(
            f"{f1}_x_{f2}",
            col(f1) * col(f2)
        )
    return result

# Example: interaction between price and quantity

interactions_df = create_interactions(
    df,
    [("price", "quantity"), ("user_age", "product_price")]
)
```

### Pattern 2: Temporal Features

```python
from pyspark.sql.functions import (
    col, year, month, dayofweek, hour, dayofyear,
    quarter, weekofyear, unix_timestamp, lag, datediff
)
from pyspark.sql.window import Window

# Time decomposition

temporal_features = df.select(
    col("timestamp"),
    year(col("timestamp")).alias("year"),
    month(col("timestamp")).alias("month"),
    dayofweek(col("timestamp")).alias("day_of_week"),
    hour(col("timestamp")).alias("hour"),
    quarter(col("timestamp")).alias("quarter"),
    dayofyear(col("timestamp")).alias("day_of_year"),
    weekofyear(col("timestamp")).alias("week_of_year")
)

# Cyclical encoding for cyclical features

import math

def cyclical_encode(df, column, max_value):
    """Convert cyclical feature to sin/cos representation"""
    return (
        df
        .withColumn(
            f"{column}_sin",
            math.sin(2 * math.pi * col(column) / max_value)
        )
        .withColumn(
            f"{column}_cos",
            math.cos(2 * math.pi * col(column) / max_value)
        )
    )

# Apply cyclical encoding to month (12 months)

temporal_features = cyclical_encode(temporal_features, "month", 12)

# Lag features (previous values)

window_spec = Window.partitionBy("user_id").orderBy("date")

lagged_features = df.withColumn(
    "prev_day_value",
    lag(col("value")).over(window_spec)
).withColumn(
    "prev_week_value",
    lag(col("value"), 7).over(window_spec)
)
```

### Pattern 3: Text and Categorical Features

```python
from pyspark.ml.feature import (
    OneHotEncoder, StringIndexer, VectorAssembler,
    CountVectorizer, TfidfVectorizer
)

# StringIndexer + OneHotEncoder pipeline for categorical

categorical_cols = ["category", "region", "product_type"]

indexers = [
    StringIndexer(inputCol=col, outputCol=f"{col}_idx")
    for col in categorical_cols
]

encoders = [
    OneHotEncoder(inputCol=f"{col}_idx", outputCol=f"{col}_enc")
    for col in categorical_cols
]

# TF-IDF for text features

tfidf = TfidfVectorizer(
    inputCol="review_text",
    outputCol="tfidf_features",
    vocabSize=1000,
    minDF=2,
    maxDF=0.8
)

# Count vectorizer for frequency

count_vec = CountVectorizer(
    inputCol="review_text",
    outputCol="word_count_features",
    vocabSize=500
)

pipeline = Pipeline(stages=indexers + encoders + [tfidf, count_vec])
```

### Pattern 4: Embeddings as Features

```python
# Using pre-trained embeddings

from pyspark.ml.feature import Word2Vec

# Word2Vec for text embeddings

word2vec = Word2Vec(
    vectorSize=100,
    windowSize=5,
    numPartitions=4,
    inputCol="words",
    outputCol="word2vec_features"
)

# Example: user embedding from historical behavior

def create_user_embeddings(interactions_df, embedding_dim=50):
    """Create user embeddings from interaction history"""
    from pyspark.ml.recommendation import ALS
    
    als = ALS(
        rank=embedding_dim,
        maxIter=10,
        userCol="user_id",
        itemCol="product_id",
        ratingCol="rating"
    )
    
    model = als.fit(interactions_df)
    user_embeddings = model.userFactors.select(
        "id",
        "features"
    ).withColumnRenamed("id", "user_id").withColumnRenamed("features", "user_embedding")
    
    return user_embeddings
```

## Feature Engineering at Scale

### Distributed Computation Pattern

```python
from pyspark.sql.functions import col, sum, avg, when, count

def compute_user_features_at_scale(spark, events_path: str, output_path: str):
    """Compute features efficiently for millions of users"""
    
    # Read in batches to manage memory
    events = spark.read.parquet(events_path)
    
    # Aggregate user features with proper partitioning
    user_features = (
        events
        .repartition(200, "user_id")  # Optimal parallelism
        .groupBy("user_id")
        .agg(
            count("*").alias("total_events"),
            avg("value").alias("avg_value"),
            sum(when(col("event_type") == "click", 1).otherwise(0)).alias("click_count"),
            sum(when(col("event_type") == "purchase", 1).otherwise(0)).alias("purchase_count")
        )
        .persist()  # Cache for multiple downstream uses
    )
    
    # Apply transformations
    enriched_features = (
        user_features
        .withColumn(
            "click_to_purchase_ratio",
            col("click_count") / (col("purchase_count") + 1)
        )
    )
    
    # Write optimized parquet with bucketing
    enriched_features.coalesce(50).write.parquet(
        output_path,
        mode="overwrite",
        compression="snappy"
    )
    
    return enriched_features

# Usage

user_features = compute_user_features_at_scale(
    spark,
    "/data/events",
    "/data/features/user_features"
)
```

## Feature Validation Framework

```python
from pyspark.sql.functions import col, isnan, isnull, count
from pyspark.sql.types import DoubleType

class FeatureValidator:
    """Validate feature quality"""
    
    @staticmethod
    def validate_null_rate(df, column, threshold=0.05):
        """Ensure null rate is below threshold"""
        null_count = df.filter(isnull(col(column))).count()
        total_count = df.count()
        null_rate = null_count / total_count
        
        if null_rate > threshold:
            raise ValueError(
                f"{column} null rate {null_rate:.2%} exceeds threshold {threshold:.2%}"
            )
        return null_rate
    
    @staticmethod
    def validate_value_range(df, column, min_val, max_val):
        """Ensure numeric values are within expected range"""
        out_of_range = df.filter(
            (col(column) < min_val) | (col(column) > max_val)
        ).count()
        
        if out_of_range > 0:
            print(f"WARNING: {out_of_range} values outside [{min_val}, {max_val}]")
        
        return out_of_range
    
    @staticmethod
    def validate_uniqueness(df, column, expected_cardinality):
        """Verify feature has expected cardinality"""
        actual_cardinality = df.select(column).distinct().count()
        
        if actual_cardinality < expected_cardinality * 0.9:
            raise ValueError(
                f"Cardinality {actual_cardinality} below expected {expected_cardinality}"
            )


# Validation rules

validation_rules = {
    "total_spending": {"min": 0, "max": 1000000, "null_threshold": 0.01},
    "transaction_count": {"min": 0, "max": 100000, "null_threshold": 0.01},
    "user_age": {"min": 0, "max": 150, "null_threshold": 0.05}
}

for feature, rules in validation_rules.items():
    FeatureValidator.validate_value_range(
        features_df,
        feature,
        rules["min"],
        rules["max"]
    )
```

## Enterprise Feature Engineering Scenarios

### Scenario: Real-time Recommendation Features

```python
# Stream processing for real-time features

from pyspark.sql.functions import window, col

# Sliding window on stream

streaming_df = (
    spark.readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "localhost:9092")
    .option("subscribe", "events")
    .load()
)

# Compute windowed features every minute

windowed_features = (
    streaming_df
    .withColumn("user_event", from_json(col("value").cast("string"), event_schema))
    .select("user_event.*")
    .withWatermark("timestamp", "10 minutes")
    .groupBy(
        window(col("timestamp"), "5 minutes", "1 minute"),
        col("user_id")
    )
    .agg(
        count("*").alias("event_count_5m"),
        avg("value").alias("avg_value_5m")
    )
)

# Write to streaming feature store

query = (
    windowed_features
    .writeStream
    .format("delta")
    .option("checkpointLocation", "/tmp/checkpoint")
    .option("path", "/data/features/stream")
    .outputMode("append")
    .start()
)
```

## Key Takeaways

- Feature selection reduces dimensionality and improves model interpretability
- Scaling and normalization essential before distance-based algorithms
- Distributed computation with repartitioning for large-scale features
- Interaction terms capture non-linear relationships
- Temporal features require proper cyclical encoding
- Feature validation ensures quality and consistency

## Practice Questions

> [!success]- Question 1: Feature Selection
> Which technique is best for selecting the most important features from 1000+ features?
>
> **Answer: Tree-based feature importance (GBT/Random Forest)**
>
> - Captures non-linear relationships
>
> - Handles categorical and numerical features
>
> - Fast computation on large feature sets
>
> [!success]- Question 2: Cyclical Feature Encoding
> How should the "month" feature be encoded in time-series models?
>
> **Answer: Sin/Cos cyclical encoding**
>
> - Preserves cyclical nature (December→January)
>
> - One-hot encoding would treat December and January as unrelated
>
> - Creates two continuous features that capture periodicity

## Use Cases

- **Cyclical Time Feature Engineering**: Encoding day-of-week and month-of-year as sine/cosine pairs so that gradient-boosted models capture the periodicity of retail sales patterns without treating December and January as maximally distant categories.
- **Automated Feature Generation for High-Cardinality Data**: Using target encoding and embedding lookups to convert categorical columns with millions of unique values (e.g., product IDs, ZIP codes) into dense numeric representations suitable for tree-based and neural models.

## Common Issues & Errors

### Artifact Access Denied

**Scenario:** Models fail to load from MLflow registry during serving.
**Fix:** Check Unity Catalog permissions or traditional workspace access controls on the underlying storage.

### Feature Skew Between Training and Inference

**Scenario:** A model trained on batch-computed window aggregates (e.g., 30-day rolling average) performs well offline but poorly in production because the serving pipeline computes the same aggregate with a slightly different window boundary or data freshness.
**Fix:** Centralise the feature computation logic in the Feature Store so both training and serving read from the same table. For real-time features, publish the identical Spark transformation as a streaming job that writes to the online store, ensuring parity.

## Related Topics

- [Feature Store Fundamentals](01-feature-store-fundamentals.md)
- [Databricks Feature Store](02-databricks-feature-store.md)
- [Feature Store Production](04-feature-store-production.md)

---

**[← Previous: Databricks Feature Store](./02-databricks-feature-store.md) | [↑ Back to Advanced Feature Engineering](./README.md) | [Next: Feature Store Production Patterns](./04-feature-store-production.md) →**
