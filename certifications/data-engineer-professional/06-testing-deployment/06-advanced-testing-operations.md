---
title: Advanced Testing & Operations — Part 1
type: topic
tags:
  - data-engineering
  - testing
  - cicd
  - devops
status: published
---

# Advanced Testing & Operations — Part 1

This guide covers advanced testing strategies for Databricks — property-based testing, DLT testing, streaming pipeline testing, integration testing, and test isolation patterns.

> For deployment validation, GitOps patterns, and rollback strategies, see [Part 2: Advanced Operations & Deployment](./07-advanced-testing-operations-part2.md).

## Advanced Testing Strategies

### Test Pyramid for Data Engineering

```mermaid
flowchart TB
    subgraph Pyramid["Test Pyramid"]
        E2E["End-to-End Tests<br>Full pipeline runs<br>~5% of tests"]
        Integration["Integration Tests<br>Multi-component interaction<br>~15% of tests"]
        Unit["Unit Tests<br>Individual functions<br>~80% of tests"]
    end

    E2E --- Speed1["Slowest - Minutes to hours"]
    Integration --- Speed2["Medium - Seconds to minutes"]
    Unit --- Speed3["Fastest - Milliseconds"]

    style E2E fill:#ff6b6b
    style Integration fill:#feca57
    style Unit fill:#48dbfb
```text

| Test Level | Runs Where | Spark Required | Typical Duration | CI Stage |
| :--- | :--- | :--- | :--- | :--- |
| Unit | Local / CI runner | Local SparkSession | < 1 min | Every PR |
| Integration | Databricks workspace | Cluster-based | 5-30 min | Merge to main |
| End-to-End | Databricks workspace | Full cluster | 30-120 min | Pre-production |
| Data Quality | Databricks workspace | SQL Warehouse | 2-10 min | Post-deploy |

### Property-Based Testing with Hypothesis

Property-based testing generates random inputs to discover edge cases that example-based tests miss.

```python
# tests/unit/test_transforms_property.py
"""Property-based tests for data transformations."""
import pytest
from hypothesis import given, strategies as st, settings
from hypothesis.extra.pandas import columns, data_frames, column
from pyspark.sql import SparkSession
from src.transformations.cleaning import remove_nulls, deduplicate

@pytest.fixture(scope="module")
def spark():
    return SparkSession.builder.master("local[*]").getOrCreate()

class TestCleaningProperties:

    @given(
        num_rows=st.integers(min_value=0, max_value=100),
        null_fraction=st.floats(min_value=0.0, max_value=1.0)
    )
    @settings(max_examples=50, deadline=None)
    def test_remove_nulls_never_returns_nulls(
        self, spark, num_rows, null_fraction
    ):
        """Property: After remove_nulls, the column must have zero NULLs."""
        import random

        data = []
        for i in range(num_rows):
            name = None if random.random() < null_fraction else f"name_{i}"
            data.append((i, name))

        df = spark.createDataFrame(data, ["id", "name"])
        result = remove_nulls(df, "name")

        # Property assertion: no nulls should remain
        assert result.filter("name IS NULL").count() == 0

    @given(
        data=st.lists(
            st.tuples(
                st.integers(min_value=1, max_value=10),
                st.text(min_size=1, max_size=10)
            ),
            min_size=0, max_size=50
        )
    )
    @settings(max_examples=30, deadline=None)
    def test_deduplicate_reduces_or_preserves_count(self, spark, data):
        """Property: Deduplication must not increase row count."""
        if not data:
            return

        df = spark.createDataFrame(data, ["id", "value"])
        result = deduplicate(df, ["id"])

        assert result.count() <= df.count()

    @given(
        data=st.lists(
            st.tuples(
                st.integers(min_value=1, max_value=5),
                st.text(min_size=1, max_size=10)
            ),
            min_size=1, max_size=50
        )
    )
    @settings(max_examples=30, deadline=None)
    def test_deduplicate_produces_unique_keys(self, spark, data):
        """Property: After dedup, all key values must be unique."""
        df = spark.createDataFrame(data, ["id", "value"])
        result = deduplicate(df, ["id"])
        unique_ids = result.select("id").distinct().count()

        assert unique_ids == result.count()
```text

### Data Quality Testing with Great Expectations

```python
# tests/integration/test_data_quality_ge.py
"""Data quality tests using Great Expectations."""
import great_expectations as gx

def create_gx_context():
    """Create a GX context connected to Databricks."""
    context = gx.get_context()

    # Add Databricks data source
    datasource = context.data_sources.add_spark("databricks_source")
    return context, datasource

def test_bronze_events_quality():
    """Validate bronze events table data quality."""
    context, datasource = create_gx_context()

    # Define the data asset
    asset = datasource.add_dataframe_asset("bronze_events")
    batch = asset.add_batch_definition_whole_dataframe("full_table")

    # Create expectation suite
    suite = context.suites.add(
        gx.ExpectationSuite(name="bronze_events_suite")
    )

    # Define expectations
    suite.add_expectation(
        gx.expectations.ExpectColumnToExist(column="event_id")
    )
    suite.add_expectation(
        gx.expectations.ExpectColumnValuesToNotBeNull(column="event_id")
    )
    suite.add_expectation(
        gx.expectations.ExpectColumnValuesToBeUnique(column="event_id")
    )
    suite.add_expectation(
        gx.expectations.ExpectColumnValuesToBeInSet(
            column="event_type",
            value_set=["click", "view", "purchase", "signup"]
        )
    )
    suite.add_expectation(
        gx.expectations.ExpectColumnValuesToBeBetween(
            column="event_timestamp",
            min_value="2024-01-01",
            max_value="2026-12-31"
        )
    )

    # Run validation
    df = spark.table("prod_catalog.bronze.events")
    results = batch.validate(suite, dataframe=df)

    assert results.success, f"Data quality check failed: {results}"
```text

### Testing DLT Pipelines

DLT pipelines cannot be unit-tested directly because they rely on the DLT runtime. Instead, extract the transformation logic and test it separately.

```python
# src/pipelines/dlt_transforms.py
"""DLT transformation logic extracted for testability."""
from pyspark.sql import DataFrame
from pyspark.sql.functions import col, when, current_timestamp

def clean_events(df: DataFrame) -> DataFrame:
    """Clean raw events - logic used in DLT pipeline."""
    return (
        df
        .filter(col("event_id").isNotNull())
        .withColumn(
            "event_type",
            when(col("event_type").isNull(), "unknown")
            .otherwise(col("event_type"))
        )
        .withColumn("processed_at", current_timestamp())
        .dropDuplicates(["event_id"])
    )

def enrich_events(events_df: DataFrame, users_df: DataFrame) -> DataFrame:
    """Enrich events with user data - logic used in DLT pipeline."""
    return (
        events_df
        .join(users_df, events_df.user_id == users_df.user_id, "left")
        .select(
            events_df["*"],
            users_df["user_name"],
            users_df["user_segment"]
        )
    )
```text

```python
# src/pipelines/dlt_notebook.py (Databricks DLT notebook)
# This notebook uses DLT decorators but calls the testable functions

import dlt
from pyspark.sql.functions import col
from pipelines.dlt_transforms import clean_events, enrich_events

@dlt.table(
    comment="Cleaned events from raw source",
    table_properties={"quality": "silver"}
)
@dlt.expect_or_drop("valid_event_id", "event_id IS NOT NULL")
def silver_events():
    raw_df = dlt.read("bronze_events")
    return clean_events(raw_df)

@dlt.table(
    comment="Events enriched with user data",
    table_properties={"quality": "gold"}
)
def gold_enriched_events():
    events = dlt.read("silver_events")
    users = dlt.read("dim_users")
    return enrich_events(events, users)
```text

```python
# tests/unit/test_dlt_transforms.py
"""Unit tests for DLT transformation logic."""
import pytest
from pyspark.sql import SparkSession
from chispa import assert_df_equality
from src.pipelines.dlt_transforms import clean_events, enrich_events

@pytest.fixture(scope="module")
def spark():
    return SparkSession.builder.master("local[*]").getOrCreate()

class TestDLTTransforms:

    def test_clean_events_drops_null_event_id(self, spark):
        data = [(1, "click"), (None, "view"), (3, "purchase")]
        df = spark.createDataFrame(data, ["event_id", "event_type"])

        result = clean_events(df)

        assert result.count() == 2
        assert result.filter("event_id IS NULL").count() == 0

    def test_clean_events_replaces_null_event_type(self, spark):
        data = [(1, None), (2, "click")]
        df = spark.createDataFrame(data, ["event_id", "event_type"])

        result = clean_events(df)

        types = [row.event_type for row in result.collect()]
        assert "unknown" in types
        assert None not in types

    def test_clean_events_deduplicates(self, spark):
        data = [(1, "click"), (1, "click"), (2, "view")]
        df = spark.createDataFrame(data, ["event_id", "event_type"])

        result = clean_events(df)

        assert result.count() == 2

    def test_enrich_events_joins_user_data(self, spark):
        events = spark.createDataFrame(
            [(1, 100, "click"), (2, 200, "view")],
            ["event_id", "user_id", "event_type"]
        )
        users = spark.createDataFrame(
            [(100, "Alice", "premium"), (200, "Bob", "free")],
            ["user_id", "user_name", "user_segment"]
        )

        result = enrich_events(events, users)

        assert "user_name" in result.columns
        assert "user_segment" in result.columns
        alice = result.filter("event_id = 1").collect()[0]
        assert alice.user_name == "Alice"
```text

### Testing Streaming Pipelines

```python
# tests/unit/test_streaming_logic.py
"""Test streaming transformations using batch mode."""
import pytest
import os
import shutil
from pyspark.sql import SparkSession
from pyspark.sql.functions import window, count

@pytest.fixture(scope="module")
def spark():
    return (SparkSession.builder
        .master("local[*]")
        .config("spark.sql.shuffle.partitions", "1")
        .getOrCreate())

@pytest.fixture
def stream_paths(tmp_path):
    """Provide temp paths for stream input, output, and checkpoint."""
    paths = {
        "input": str(tmp_path / "input"),
        "output": str(tmp_path / "output"),
        "checkpoint": str(tmp_path / "checkpoint"),
    }
    os.makedirs(paths["input"], exist_ok=True)
    return paths

class TestStreamingAggregation:

    def test_windowed_count_produces_expected_windows(
        self, spark, stream_paths
    ):
        """Test that streaming windowed count works correctly."""
        # Arrange: write test data as JSON
        data = [
            {"user_id": "u1", "ts": "2025-01-01T00:00:00"},
            {"user_id": "u1", "ts": "2025-01-01T00:05:00"},
            {"user_id": "u2", "ts": "2025-01-01T00:02:00"},
            {"user_id": "u1", "ts": "2025-01-01T01:00:00"},
        ]
        import json
        with open(os.path.join(stream_paths["input"], "batch1.json"), "w") as f:
            for record in data:
                f.write(json.dumps(record) + "\n")

        # Act: read as stream, apply windowed count, write to output
        from pyspark.sql.types import (
            StructType, StructField, StringType, TimestampType
        )
        schema = StructType([
            StructField("user_id", StringType()),
            StructField("ts", TimestampType()),
        ])

        stream_df = (
            spark.readStream
            .schema(schema)
            .json(stream_paths["input"])
        )

        windowed = (
            stream_df
            .groupBy(
                window("ts", "1 hour"),
                "user_id"
            )
            .agg(count("*").alias("event_count"))
        )

        query = (
            windowed.writeStream
            .format("json")
            .outputMode("complete")
            .option("checkpointLocation", stream_paths["checkpoint"])
            .start(stream_paths["output"])
        )

        query.processAllAvailable()
        query.stop()

        # Assert
        result = spark.read.json(stream_paths["output"])
        assert result.count() > 0

        # user1 should have events in 2 windows (00:00 and 01:00)
        u1_windows = result.filter("user_id = 'u1'").count()
        assert u1_windows == 2
```text

### Mocking Databricks-Specific APIs

```python
# tests/conftest.py
"""Comprehensive mocks for Databricks-specific APIs."""
import pytest
from unittest.mock import MagicMock, patch, PropertyMock

@pytest.fixture
def mock_dbutils():
    """Full dbutils mock with all common methods."""
    dbutils = MagicMock()

    # Widgets
    widget_values = {
        "catalog": "test_catalog",
        "schema": "test_schema",
        "environment": "test",
    }
    dbutils.widgets.get.side_effect = lambda key: widget_values.get(key, "")
    dbutils.widgets.text = MagicMock()

    # Secrets
    secret_values = {
        ("scope1", "db-password"): "test_password",
        ("scope1", "api-key"): "test_api_key",
    }
    dbutils.secrets.get.side_effect = (
        lambda scope, key: secret_values.get((scope, key), "")
    )

    # Filesystem
    dbutils.fs.ls.return_value = [
        MagicMock(path="dbfs:/data/file1.parquet", name="file1.parquet",
                  size=1024, modificationTime=1700000000000),
        MagicMock(path="dbfs:/data/file2.parquet", name="file2.parquet",
                  size=2048, modificationTime=1700000001000),
    ]
    dbutils.fs.head.return_value = "sample file content"
    dbutils.fs.rm = MagicMock(return_value=True)
    dbutils.fs.mkdirs = MagicMock(return_value=True)
    dbutils.fs.cp = MagicMock(return_value=True)

    # Notebook context
    (dbutils.notebook.entry_point.getDbutils.return_value
        .notebook.return_value
        .getContext.return_value
        .tags.return_value
        .get).return_value = "interactive"

    # Notebook run
    dbutils.notebook.run.return_value = '{"status": "success"}'

    return dbutils

@pytest.fixture
def mock_spark_catalog():
    """Mock for spark.catalog operations."""
    catalog = MagicMock()
    catalog.tableExists.return_value = True
    catalog.listTables.return_value = [
        MagicMock(name="events", database="bronze", tableType="MANAGED"),
        MagicMock(name="sessions", database="silver", tableType="MANAGED"),
    ]
    return catalog
```text

### Code Coverage for PySpark

```ini
# pytest.ini - Coverage configuration
[pytest]
testpaths = tests
addopts =
    -v
    --tb=short
    --cov=src
    --cov-report=term-missing
    --cov-report=xml:coverage.xml
    --cov-report=html:htmlcov
    --cov-fail-under=80
```text

```yaml
# .github/workflows/coverage.yml
name: Coverage Check

on: [pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.10"
      - run: pip install -r requirements-dev.txt

      - name: Run tests with coverage
        run: |
          pytest tests/unit/ \
            --cov=src \
            --cov-report=xml \
            --cov-fail-under=80

      - name: Upload to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: coverage.xml
          fail_ci_if_error: true
```text

```text
# .coveragerc - Fine-tune what to measure
[run]
source = src
omit =
    src/notebooks/*
    src/*/__init__.py
    tests/*

[report]
exclude_lines =
    pragma: no cover
    def __repr__
    if __name__ == .__main__
    raise NotImplementedError
show_missing = True
fail_under = 80
```text

## Integration Testing Patterns

### Databricks Connect for Remote Testing

```python
# tests/integration/conftest.py
"""Integration test fixtures using Databricks Connect."""
import pytest
from databricks.connect import DatabricksSession

@pytest.fixture(scope="session")
def db_spark():
    """Create a Databricks Connect SparkSession."""
    spark = (DatabricksSession.builder
        .remote(
            host="https://adb-1234567890.1.azuredatabricks.net",
            token="dapi...",
            cluster_id="0123-456789-abcdef"
        )
        .getOrCreate())
    yield spark
    spark.stop()

@pytest.fixture
def test_schema(db_spark):
    """Create and drop an isolated test schema."""
    import uuid
    schema_name = f"test_{uuid.uuid4().hex[:8]}"
    full_name = f"test_catalog.{schema_name}"

    db_spark.sql(f"CREATE SCHEMA IF NOT EXISTS {full_name}")
    yield full_name
    db_spark.sql(f"DROP SCHEMA IF EXISTS {full_name} CASCADE")
```text

```python
# tests/integration/test_pipeline_integration.py
"""Integration tests running against a real Databricks workspace."""

class TestBronzeToSilverPipeline:

    def test_bronze_ingest_writes_to_delta(self, db_spark, test_schema):
        """Test that bronze ingestion creates a Delta table."""
        from src.pipelines.bronze import ingest_events

        ingest_events(
            db_spark,
            source_path="/Volumes/test_catalog/test/raw/events.json",
            target_table=f"{test_schema}.bronze_events"
        )

        result = db_spark.table(f"{test_schema}.bronze_events")
        assert result.count() > 0

    def test_silver_transform_cleans_data(self, db_spark, test_schema):
        """Test that silver transformation applies cleaning rules."""
        from src.pipelines.silver import transform_events

        # Setup: create bronze table with test data
        data = [(1, "click", None), (2, "view", "Chrome"), (None, "x", "FF")]
        df = db_spark.createDataFrame(data, ["id", "type", "browser"])
        df.write.format("delta").saveAsTable(f"{test_schema}.bronze_events")

        transform_events(
            db_spark,
            source_table=f"{test_schema}.bronze_events",
            target_table=f"{test_schema}.silver_events"
        )

        result = db_spark.table(f"{test_schema}.silver_events")
        # Null IDs should be filtered out
        assert result.filter("id IS NULL").count() == 0
```text

### Test Isolation Strategies

```mermaid
flowchart TB
    subgraph Isolation["Test Isolation Methods"]
        Schema[Unique Schema per Test Run]
        Prefix[Prefixed Table Names]
        Cleanup[Teardown Cleanup]
    end

    Schema --> Create["CREATE SCHEMA test_abc123"]
    Schema --> Run["Run tests against schema"]
    Schema --> Drop["DROP SCHEMA test_abc123 CASCADE"]

    Prefix --> PrefixCreate["test_run_42_bronze_events"]
    Cleanup --> After["after_each: DROP TABLE IF EXISTS"]
```text

```python
# tests/integration/test_isolation.py
"""Patterns for test isolation in Databricks."""
import pytest
import uuid
from datetime import datetime

@pytest.fixture(scope="session")
def test_run_id():
    """Generate unique ID for this test run."""
    return f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:6]}"

@pytest.fixture(scope="session")
def isolated_schema(db_spark, test_run_id):
    """Create an isolated schema for the entire test session."""
    schema = f"test_catalog.{test_run_id}"
    db_spark.sql(f"CREATE SCHEMA IF NOT EXISTS {schema}")
    print(f"Created test schema: {schema}")
    yield schema
    # Cleanup after all tests
    db_spark.sql(f"DROP SCHEMA IF EXISTS {schema} CASCADE")
    print(f"Dropped test schema: {schema}")

@pytest.fixture
def isolated_table(db_spark, isolated_schema):
    """Provide a unique table name and clean up after the test."""
    table_id = uuid.uuid4().hex[:8]
    table_name = f"{isolated_schema}.table_{table_id}"
    yield table_name
    db_spark.sql(f"DROP TABLE IF EXISTS {table_name}")
```text

### Cost Management for Test Clusters

| Strategy | Description | Savings |
| :--- | :--- | :--- |
| Single-node clusters | `num_workers: 0` for unit/integration tests | 60-80% |
| Auto-termination | Set 10-min idle timeout on test clusters | Variable |
| Instance pools | Pre-warm pools for faster test starts | 30-50% start time |
| Spot instances | Use spot/preemptible for test workloads | 60-90% |
| Shared test cluster | Reuse cluster across CI runs with concurrency | 40-60% |
| Serverless compute | Pay only for compute used during tests | Variable |

```yaml
# databricks.yml - Cost-optimized test target
targets:
  test:
    mode: development
    variables:
      catalog: test_catalog
    resources:
      jobs:
        integration_tests:
          name: "Integration Tests - ${workspace.current_user.userName}"
          tasks:
            - task_key: run_tests
              notebook_task:
                notebook_path: ../tests/integration/run_all
              new_cluster:
                spark_version: "15.4.x-scala2.12"
                node_type_id: "Standard_DS3_v2"
                num_workers: 0           # Single-node for tests
                spark_conf:
                  spark.master: "local[*]"
                  spark.databricks.cluster.profile: singleNode
                custom_tags:
                  ResourceClass: SingleNode
                  purpose: testing
                autotermination_minutes: 10
```text

---

> **Continue reading:** [Part 2 — Deployment Validation, GitOps, Practice Questions & Exam Tips](./07-advanced-testing-operations-part2.md)
