---
title: Unit Testing — Part 2
type: topic
tags:
  - data-engineering
  - testing
  - unit-test
  - pytest
status: published
---

# Unit Testing — Part 2

This part covers testing patterns for Delta Lake and streaming, CI/CD integration, best practices, common issues, and exam tips for unit testing in Databricks.

> For pytest fundamentals, chispa comparisons, mocking, and the Nutter framework, see [Part 1](./04-unit-testing-part1.md).

## Testing Patterns

### Testing Delta Lake Operations

```python
# tests/unit/test_delta_operations.py

import pytest
from delta import DeltaTable
from pyspark.sql import SparkSession
import tempfile
import shutil

class TestDeltaOperations:

    @pytest.fixture
    def delta_path(self):
        """Create temp directory for Delta table."""
        path = tempfile.mkdtemp()
        yield path
        shutil.rmtree(path)

    @pytest.fixture
    def spark(self):
        return (SparkSession.builder
            .master("local[*]")
            .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
            .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")
            .getOrCreate())

    def test_merge_upserts_correctly(self, spark, delta_path):
        """Test MERGE operation updates and inserts."""
        # Arrange - Create target table
        target_data = [(1, "old_value"), (2, "keep")]
        target_df = spark.createDataFrame(target_data, ["id", "value"])
        target_df.write.format("delta").save(delta_path)

        # Source data with update and insert
        source_data = [(1, "new_value"), (3, "insert")]
        source_df = spark.createDataFrame(source_data, ["id", "value"])

        # Act - Perform merge
        delta_table = DeltaTable.forPath(spark, delta_path)
        (delta_table.alias("target")
            .merge(source_df.alias("source"), "target.id = source.id")
            .whenMatchedUpdateAll()
            .whenNotMatchedInsertAll()
            .execute())

        # Assert
        result = spark.read.format("delta").load(delta_path)
        assert result.count() == 3

        updated_row = result.filter("id = 1").collect()[0]
        assert updated_row.value == "new_value"
```

### Testing Streaming

```python
# tests/unit/test_streaming.py

import pytest
from pyspark.sql import SparkSession
from pyspark.sql.types import StructType, StructField, StringType, TimestampType
import tempfile
import time

class TestStreaming:

    @pytest.fixture
    def spark(self):
        return (SparkSession.builder
            .master("local[*]")
            .getOrCreate())

    def test_streaming_aggregation(self, spark, tmp_path):
        """Test streaming aggregation logic."""
        # Arrange
        input_path = str(tmp_path / "input")
        output_path = str(tmp_path / "output")
        checkpoint_path = str(tmp_path / "checkpoint")

        # Create test data
        data = [
            ("user1", "2024-01-01 00:00:00"),
            ("user1", "2024-01-01 00:01:00"),
            ("user2", "2024-01-01 00:00:00")
        ]
        df = spark.createDataFrame(data, ["user_id", "timestamp"])
        df.write.format("json").save(input_path)

        # Act - Run streaming query in batch mode for testing
        stream_df = (spark.readStream.format("json")
            .schema(df.schema)
            .load(input_path))

        agg_df = stream_df.groupBy("user_id").count()

        query = (agg_df.writeStream
            .format("delta")
            .outputMode("complete")
            .option("checkpointLocation", checkpoint_path)
            .start(output_path))

        query.processAllAvailable()
        query.stop()

        # Assert
        result = spark.read.format("delta").load(output_path)
        user1_count = result.filter("user_id = 'user1'").collect()[0]["count"]
        assert user1_count == 2
```

### Testing with Fixtures

```python
# tests/conftest.py

import pytest
from pyspark.sql import SparkSession

@pytest.fixture(scope="session")
def spark():
    """Session-scoped SparkSession."""
    spark = (SparkSession.builder
        .master("local[*]")
        .appName("test")
        .getOrCreate())
    yield spark
    spark.stop()

@pytest.fixture
def sample_orders(spark):
    """Sample orders DataFrame for testing."""
    data = [
        (1, "2024-01-01", 100.00, "A"),
        (2, "2024-01-02", 200.00, "B"),
        (3, "2024-01-02", 150.00, "A"),
    ]
    return spark.createDataFrame(
        data,
        ["order_id", "order_date", "amount", "category"]
    )

@pytest.fixture
def sample_customers(spark):
    """Sample customers DataFrame for testing."""
    data = [
        (1, "Alice", "alice@email.com"),
        (2, "Bob", "bob@email.com"),
    ]
    return spark.createDataFrame(
        data,
        ["customer_id", "name", "email"]
    )
```

## CI/CD Integration

### GitHub Actions Test Workflow

```yaml
# .github/workflows/test.yml

name: Run Tests

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: |
          pip install -r requirements-dev.txt
          pip install pytest pytest-cov

      - name: Run unit tests
        run: |
          pytest tests/unit/ \
            --cov=src \
            --cov-report=xml \
            --cov-report=html \
            --junitxml=test-results.xml \
            -v

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: coverage.xml

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: |
            test-results.xml
            htmlcov/

  nutter-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4

      - uses: databricks/setup-cli@main

      - name: Run Nutter tests
        run: |
          nutter run /Workspace/Shared/project/tests/ \
            --cluster_id ${{ secrets.TEST_CLUSTER_ID }} \
            --recursive \
            --junit_report nutter-results.xml
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}

      - name: Upload Nutter results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: nutter-results
          path: nutter-results.xml
```

### Test Environments

```yaml
# databricks.yml - Test environment target

targets:
  test:
    mode: development
    variables:
      catalog: test_catalog
      schema: test_${workspace.current_user.userName}
    resources:
      jobs:
        test_runner:
          name: "Test Runner"
          tasks:
            - task_key: run_tests
              notebook_task:
                notebook_path: ../tests/run_all_tests
              new_cluster:
                spark_version: "14.3.x-scala2.12"
                node_type_id: "Standard_DS3_v2"
                num_workers: 0
```

## Best Practices

### Test Organization

```text
tests/
├── conftest.py              # Shared fixtures
├── unit/                    # Unit tests (no external deps)
│   ├── test_transformations.py
│   ├── test_validations.py
│   └── test_utils.py
├── integration/             # Integration tests (real Spark)
│   ├── test_bronze_layer.py
│   ├── test_silver_layer.py
│   └── test_gold_layer.py
└── e2e/                     # End-to-end tests
    └── test_full_pipeline.py
```

### Naming Conventions

```python
# Good test names - descriptive and specific

def test_remove_nulls_removes_rows_with_null_values():
    pass

def test_calculate_totals_returns_zero_for_empty_input():
    pass

def test_merge_updates_existing_records_when_key_matches():
    pass

# Bad test names - vague

def test_function():
    pass

def test_it_works():
    pass
```

### Test Isolation

```python
# Each test should be independent

class TestTransformations:

    def test_transformation_a(self, spark):
        """Test A - creates its own data."""
        df = spark.createDataFrame([(1,)], ["id"])
        # ... test logic

    def test_transformation_b(self, spark):
        """Test B - doesn't depend on Test A."""
        df = spark.createDataFrame([(2,)], ["id"])
        # ... test logic
```

## Use Cases

- **Ensuring Transformation Correctness**: Writing PyTest tests with Chispa to verify that a complex custom PySpark aggregation function outputs the exact expected DataFrame before the code allows for merging.
- **Validating Delta Lake Operations**: Using an isolated local temporary directory to test that a PySpark `MERGE` statement correctly applies updates and inserts without accidentally mutating real development tables.

## Common Issues & Errors

### SparkSession Not Available

**Scenario:** Tests fail because SparkSession is None.

**Fix:** Use proper fixture scope:

```python
@pytest.fixture(scope="session")  # Not "function"
def spark():
    return SparkSession.builder.master("local[*]").getOrCreate()
```

### Tests Interfere with Each Other

**Scenario:** Tests pass individually but fail together.

**Fix:** Ensure test isolation:

```python
@pytest.fixture
def clean_table(spark):
    """Drop and recreate test table."""
    spark.sql("DROP TABLE IF EXISTS test_table")
    yield
    spark.sql("DROP TABLE IF EXISTS test_table")
```

### Slow Test Execution

**Scenario:** Tests take too long.

**Fix:** Optimize Spark configuration:

```python
spark = (SparkSession.builder
    .master("local[*]")
    .config("spark.sql.shuffle.partitions", "1")
    .config("spark.default.parallelism", "1")
    .config("spark.executor.memory", "1g")
    .getOrCreate())
```

### Delta Lake Not Available

**Scenario:** Delta operations fail in tests.

**Fix:** Include Delta dependencies:

```python
spark = (SparkSession.builder
    .config("spark.jars.packages", "io.delta:delta-core_2.12:2.4.0")
    .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
    .getOrCreate())
```

## Exam Tips

1. **pytest basics** - Fixtures, assertions, parametrize
2. **Nutter framework** - before/run/assertion pattern
3. **Mocking** - Mock dbutils, external services
4. **Test isolation** - Each test independent
5. **DataFrame comparison** - Use chispa for equality
6. **CI integration** - JUnit reports, coverage
7. **Test environments** - Separate catalogs/schemas
8. **Fixture scopes** - session, module, function
9. **Naming conventions** - Descriptive test names
10. **Testing pyramid** - Unit → Integration → E2E

## Related Topics

- [Asset Bundles](01-asset-bundles-part1.md) - Test deployment
- [CI/CD Integration](02-cicd-integration-part1.md) - Pipeline testing
- [Git Folders](03-git-folders.md) - Test versioning

## Official Documentation

- [Testing Notebooks](https://docs.databricks.com/notebooks/testing.html)
- [Nutter Framework](https://github.com/microsoft/nutter)
- [pytest Documentation](https://docs.pytest.org/)
- [chispa Library](https://github.com/MrPowers/chispa)

---

**[← Previous: Unit Testing — Part 1](./04-unit-testing-part1.md) | [↑ Back to Testing & Deployment](./README.md) | [Next: Bundle Deployment Strategies — Part 1 (Bundle Patterns & CI/CD Pipelines)](./05-bundle-deployment-strategies-part1.md) →**
