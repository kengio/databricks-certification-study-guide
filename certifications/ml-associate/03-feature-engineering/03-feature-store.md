---
title: Databricks Feature Store
type: study-material
tags:
  - feature-store
  - feature-discovery
  - feature-serving
  - feature-lineage
---

# Databricks Feature Store

## Overview

Databricks Feature Store is a centralized repository for storing, discovering, and reusing machine learning features. It enables consistent feature serving between training and inference while providing reproducibility and governance.

## Feature Store Architecture

```mermaid
flowchart TB
    subgraph Data Sources["Data Sources"]
        DB[(Databases)]
        Delta[(Delta Lake)]
        Stream[Streaming]
    end

    subgraph FS["Feature Store"]
        FT1["Feature Tables"]
        Catalog["Metadata Catalog"]
        Lineage["Feature Lineage"]
    end

    subgraph Consumers["ML Consumers"]
        Train["Training"]
        Batch["Batch Inference"]
        Real["Real-time Serving"]
    end

    Data Sources -->|Compute & Store| FT1
    FT1 --> Catalog
    FT1 --> Lineage
    FT1 --> Train
    FT1 --> Batch
    FT1 --> Real

    style FS fill:#e1f5ff
    style Consumers fill:#f3e5f5
```

## Core Concepts

### **Feature Tables**

Feature tables store pre-computed features accessible across projects.

```python
from databricks.feature_store import FeatureStoreClient

fs_client = FeatureStoreClient()

# Create feature table

database_name = "ml_features"
table_name = "customer_features"

# Prepare feature data

features_df = (spark.read.table("silver.customers")
    .select(
        "customer_id",
        (F.col("age") / F.col("age").mean()).alias("age_scaled"),
        F.col("tenure").alias("customer_lifetime_days"),
        (F.col("total_spent") / (F.col("months_active") + 1)).alias("avg_monthly_spend"),
        F.current_timestamp().alias("created_at")
    ))

# Write to feature store

fs_client.create_table(
    name=f"{database_name}.{table_name}",
    primary_keys=["customer_id"],
    timestamp_keys=["created_at"],
    df=features_df,
    description="Customer aggregated features"
)

# Features now available for:
# - Training (reproducible features)
# - Batch inference (same logic)
# - Real-time serving (pre-computed values)

```

### **Feature Lookups**

Combine features from multiple tables during training.

```python
from databricks.feature_store import FeatureStoreClient

fs_client = FeatureStoreClient()

# Define training data

training_set = (spark.read.table("raw.transactions")
    .select(
        "transaction_id",
        "customer_id",
        "purchased_product",
        F.col("purchase_amount").alias("label")
    ))

# Lookup features from feature store
# Look for matching customer_id

with fs_client.create_training_set(
    df=training_set,
    label="label",
    exclude_columns=["transaction_id"],
    feature_lookups=[
        # Join customer features by customer_id
        fs_client.FeatureLookup(
            table_name="ml_features.customer_features",
            lookup_key="customer_id"
        ),
        # Join product features by product_id
        fs_client.FeatureLookup(
            table_name="ml_features.product_features",
            lookup_key="purchased_product"
        )
    ]
) as training_set_obj:
    training_set_df = training_set_obj.load_df().toPandas()

# Result: DataFrame with all features joined for training

print(training_set_df.head())
```

## Creating and Managing Features

### **Feature Table Workflow**

```python
%python
from databricks.feature_store import FeatureStoreClient
from pyspark.sql import functions as F

fs_client = FeatureStoreClient()

# Step 1: Compute features from source data

print("Computing features...")
source_data = spark.read.table("silver.raw_transactions")

features = (source_data
    .groupBy("customer_id")
    .agg(
        F.count("*").alias("transaction_count"),
        F.sum("transaction_amount").alias("total_spent"),
        F.avg("transaction_amount").alias("avg_transaction"),
        F.max("transaction_date").alias("last_transaction_date"),
        F.datediff(F.current_date(), F.max("transaction_date")).alias("days_since_purchase")
    )
    .withColumn("created_at", F.current_timestamp())
)

# Step 2: Write to feature store

print("Writing to feature store...")
fs_client.write_table(
    name="ml_features.customer_transaction_features",
    df=features,
    mode="overwrite"  # or "merge" for incremental updates
)

# Step 3: Update feature table description

feature_table = fs_client.get_table("ml_features.customer_transaction_features")
print(f"Features created: {feature_table.name}")
print(f"Last updated: {feature_table.last_updated_timestamp}")
```

### **Incremental Updates (Merge)**

```python

# Update only new/changed records for efficiency
# Instead of recomputing all features

new_features = spark.read.table("compute.new_customer_features")

fs_client.write_table(
    name="ml_features.customer_transaction_features",
    df=new_features,
    mode="merge",  # Only update changed records
    merge_exprs="new.customer_id = old.customer_id"
)
```

## Feature Discovery & Governance

### **Searching for Features**

```python
from databricks.feature_store import FeatureStoreClient

fs_client = FeatureStoreClient()

# Search for features by name

search_results = fs_client.search_tables(max_results=10)

for table in search_results:
    print(f"Table: {table.name}")
    print(f"  Description: {table.description}")
    print(f"  Created: {table.created_timestamp}")
    print(f"  Last Updated: {table.last_updated_timestamp}")

# Get specific table

table = fs_client.get_table("ml_features.customer_features")
print(f"\nTable: {table.name}")
print(f"Primary Keys: {table.primary_keys}")
print(f"Timestamp Keys: {table.timestamp_keys}")
```

### **Feature Lineage**

```python

# Track which models use which features

# Example: Register model with feature lineage

import mlflow
from databricks.feature_store import FeatureStoreClient

fs_client = FeatureStoreClient()

# When logging model with feature store features

with mlflow.start_run() as run:
    # Use FeatureStore for training
    with fs_client.create_training_set(...) as training_set:
        df = training_set.load_df()

        # Train model
        model = train_model(df)

        # Log model WITH feature store context
        fs_client.log_model(
            model=model,
            artifact_path="model",
            flavor=mlflow.sklearn,
            training_set=training_set,
            input_example=df.head(1)
        )

# MLflow tracks:
# - Which features were used
# - Where features came from
# - Model inputs match feature schema

```

## Real-Time Feature Serving

### **Online Feature Store**

```python

# For real-time predictions, features need fast lookup

from databricks.feature_store import FeatureStoreClient

# Publish feature table for serving

fs_client.create_online_table(
    table_name="ml_features.customer_features",
    online_store="online_store_name",  # Requires online store setup
    primary_keys=["customer_id"]
)

# Now can serve features in real-time:
# Send customer_id to serving endpoint
# Online store looks up pre-computed features
# Return features for immediate inference

```

### **Batch Inference with Features**

```python

# Use feature store for consistent batch predictions

fs_client = FeatureStoreClient()

# Load scoring data

scoring_data = spark.read.table("new_customers")

# Create scoring set (similar to training set)

with fs_client.create_training_set(
    df=scoring_data,
    feature_lookups=[
        fs_client.FeatureLookup(
            table_name="ml_features.customer_features",
            lookup_key="customer_id"
        )
    ]
) as scoring_set:
    # Load features
    scoring_df = scoring_set.load_df()

# Load model trained with same features

import mlflow
model = mlflow.sklearn.load_model("models:/my_model/production")

# Predict using consistent features

predictions = model.predict(scoring_df[feature_columns])
```

## Complete ML Workflow with Feature Store

```python
%python
from databricks.feature_store import FeatureStoreClient
import mlflow

fs_client = FeatureStoreClient()

# ============= FEATURE ENGINEERING =============

# Compute customer features

customer_features = (spark.read.table("raw.customers")
    .groupBy("customer_id")
    .agg(
        F.count("*").alias("purchase_count"),
        F.sum("purchase_amount").alias("lifetime_value"),
        F.max("purchase_date").alias("last_purchase")
    )
)

# Write to feature store

fs_client.write_table(
    "ml_features.customer_features",
    df=customer_features,
    mode="overwrite"
)

# Compute product features

product_features = (spark.read.table("raw.products")
    .select(
        "product_id",
        "category",
        F.col("price").alias("product_price"),
        F.col("review_rating").alias("product_rating")
    )
)

fs_client.write_table(
    "ml_features.product_features",
    df=product_features,
    mode="overwrite"
)

# ============= TRAINING WITH FEATURE STORE =============

# Create training set with feature lookups

training_data = spark.read.table("raw.transactions").select(
    "transaction_id", "customer_id", "product_id", "purchase_amount"
)

with fs_client.create_training_set(
    df=training_data,
    label="purchase_amount",
    exclude_columns=["transaction_id"],
    feature_lookups=[
        fs_client.FeatureLookup(
            table_name="ml_features.customer_features",
            lookup_key="customer_id"
        ),
        fs_client.FeatureLookup(
            table_name="ml_features.product_features",
            lookup_key="product_id"
        )
    ]
) as training_set:
    df = training_set.load_df().toPandas()

    # Train model
    from sklearn.ensemble import RandomForestRegressor
    model = RandomForestRegressor()
    model.fit(df.drop("purchase_amount", axis=1), df["purchase_amount"])

    # Log model with feature lineage
    with mlflow.start_run():
        mlflow.sklearn.log_model(model, "model")
        fs_client.log_model(
            model=model,
            artifact_path="model",
            flavor=mlflow.sklearn,
            training_set=training_set
        )

# ============= BATCH SCORING WITH FEATURES =============

# Score new customers using same features

new_transactions = spark.read.table("new_transactions")

with fs_client.create_training_set(
    df=new_transactions,
    feature_lookups=[
        fs_client.FeatureLookup(
            table_name="ml_features.customer_features",
            lookup_key="customer_id"
        ),
        fs_client.FeatureLookup(
            table_name="ml_features.product_features",
            lookup_key="product_id"
        )
    ]
) as scoring_set:
    df_scored = scoring_set.load_df().toPandas()
    predictions = model.predict(df_scored.drop("purchase_amount", axis=1))

# Save predictions

results = spark.createDataFrame(
    [(t_id, pred) for t_id, pred in zip(new_transactions.select("transaction_id"), predictions)],
    ["transaction_id", "predicted_amount"]
)
results.write.mode("overwrite").saveAsTable("predictions.purchase_amount_predictions")
```

## Feature Store Best Practices

### **Naming Conventions**

```python
# Clear, hierarchical naming

naming_guidelines = {
    "database": "ml_features",  # or specific domain
    "table_pattern": "{domain}_{entity}_{feature_type}",
    "examples": [
        "customer_activity_aggregates",  # Historical aggregations
        "customer_demographics_encoded",  # Encoded features
        "transaction_temporal_features",  # Time-based features
        "product_text_embeddings"        # Embedding features
    ]
}

# Clear column names

column_naming = {
    "raw": "raw_feature_name",
    "scaled": "feature_name_scaled",
    "encoded": "feature_name_encoded",
    "aggregated": "feature_name_sum_7d"  # Include aggregation window
}
```

### **Documentation**

```python
# Document features for discovery

fs_client.create_table(
    name="ml_features.customer_features",
    df=features_df,
    primary_keys=["customer_id"],
    description="Customer aggregated features for churn prediction",
    tags={
        "owner": "data_science_team",
        "domain": "customer_analytics",
        "use_cases": ["churn", "scoring"],
        "frequency": "daily",
        "sla": "2_hours_lag"
    }
)
```

### **Refresh Schedules**

```python

# Automate feature computation

# Use Databricks Jobs to schedule feature updates

job_config = {
    "job_name": "customer_features_daily_refresh",
    "schedule": "0 2 * * *",  # 2 AM daily
    "task": "compute_and_write_features()",
    "retry_policy": {
        "max_retries": 2,
        "timeout": 3600
    }
}
```

## Comparison: Feature Store vs Manual Feature Management

| Aspect | Feature Store | Manual |
|--------|---|---|
| **Consistency** | Guaranteed (same features train/serve) | Risk of train/serve skew |
| **Reusability** | Share across projects | Individual copies |
| **Lineage** | Automatic tracking | Manual tracking |
| **Discovery** | Searchable catalog | Scattered notebooks |
| **Versioning** | Built-in | Manual version control |
| **Serving** | Optimized for real-time | Custom implementation |
| **Governance** | Metadata, ownership, tags | Uncontrolled |
| **Scaling** | Production-ready | Ad-hoc |

## Use Cases

- **End-to-End MLOps Pipeline**: Tying model training, evaluation, and registry together to establish a reproducible lifecycle.
- **Eliminating Train-Serve Skew**: Centralizing feature computation in the Feature Store so that training and inference use identical feature logic, preventing subtle bugs from duplicated transformation code.

## Common Issues & Errors

### Artifact Access Denied

**Scenario:** Models fail to load from MLflow registry during serving.
**Fix:** Check Unity Catalog permissions or traditional workspace access controls on the underlying storage.

### Feature Lookup Returns NULL Values

**Scenario:** `FeatureLookup` returns nulls for some rows at inference time.
**Fix:** The lookup key values in the inference request don't match any rows in the feature table. Verify key column types match and check for missing entries in the feature table.

## Exam Tips

- ✅ Understand Feature Store prevents train/serve skew
- ✅ Know feature lookups join features during training
- ✅ Recognize feature lineage tracking
- ✅ Understand online vs batch serving
- ✅ Know feature discovery enables reuse
- ✅ Remember Feature Store integrates with MLflow

## Key Takeaways

- Feature Store centralizes feature computation and discovery
- Eliminates train/serve skew through consistent feature serving
- Feature lookups enable reproducible training with multiple sources
- Automatic lineage tracking provides governance
- Real-time serving enables low-latency predictions
- Batch scoring uses same features as training for consistency
- Feature discovery enables team collaboration and feature reuse

## Related Topics

- [Spark ML Pipelines](01-spark-ml-pipelines.md)
- [Feature Engineering Techniques](02-feature-engineering-techniques.md)
- [MLflow Tracking](../02-ml-workflows/01-mlflow-tracking.md)

## Official Documentation

- [Databricks Feature Store](https://docs.databricks.com/machine-learning/feature-store/index.html)
- [Feature Engineering Guide](https://docs.databricks.com/machine-learning/feature-engineering/index.html)

---

**[← Previous: Feature Engineering Techniques](./02-feature-engineering-techniques.md) | [↑ Back to Feature Engineering](./README.md)**
