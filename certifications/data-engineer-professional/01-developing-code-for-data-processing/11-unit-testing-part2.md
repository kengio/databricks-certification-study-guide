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

This part covers testing patterns for Delta Lake and streaming, integration tests, unit testing Lakeflow Pipelines (Beta), CI/CD integration, best practices, common issues, and exam tips for unit testing in Databricks.

> For pytest fundamentals, `assertDataFrameEqual` / `assertSchemaEqual`, `DataFrame.transform`, chispa comparisons, mocking, and the Nutter framework, see [Part 1](./11-unit-testing-part1.md).

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

## Integration Tests

Unit tests run pure transformations against a local SparkSession. Integration tests check that the pieces work together against Databricks compute, Unity Catalog tables, and workspace files. Run them against non-production data: create fake data as close as possible to production, especially for functions that add, remove, or change data.

| Approach | How it runs | Use for |
| :--- | :--- | :--- |
| `pytest` + Databricks Connect | Local `pytest` process; Spark code executes on a Databricks cluster or serverless compute | Fast feedback from an IDE or CI runner against real catalog objects |
| `pytest` inside the workspace | A notebook or job task calls `pytest.main()` on test files stored next to the code | Tests that need workspace files, volumes, or secrets |
| Workspace **Tests** pane | Discovers `test_*.py` / `*_test.py` files and `test`-prefixed functions; run with inline glyphs | Interactive development in bundles, Git folders, and pipelines |
| Bundle-deployed test job | `databricks bundle deploy -t staging` then `databricks bundle run <test_job>` | CI gate before promoting to production |

```python
# tests/conftest.py for integration tests with Databricks Connect
import pytest
from databricks.connect import DatabricksSession


@pytest.fixture(scope="session")
def spark():
    # Uses the DEFAULT configuration profile when run from a terminal
    return DatabricksSession.builder.getOrCreate()
```

- Databricks Connect and PySpark are mutually exclusive in one Python environment; install only `databricks-connect` for these tests.
- From a terminal, `pytest` with Databricks Connect uses only the `DEFAULT` configuration profile, which must name the cluster or serverless compute to use.

Running `pytest` from a notebook or job task in the workspace:

```python
import sys

import pytest

# Skip writing .pyc files on a read-only file system.
sys.dont_write_bytecode = True

retcode = pytest.main([".", "-v", "-p", "no:cacheprovider"])

# Fail the cell (and the job task) if any test fails.
assert retcode == 0, "The pytest invocation failed. See the log for details."
```

## Unit Testing Lakeflow Pipelines (Beta)

> [!note] Platform update (Oct 2026)
> Unit testing for pipelines is in **Beta** (released July 26, 2026). You write Python tests in the Lakeflow Pipelines Editor and run Python or SQL pipeline logic against mock data, including AUTO CDC flows, streaming tables, expectations, and append flows. Source: [July 2026 release notes](https://docs.databricks.com/aws/en/release-notes/product/2026/july)

The framework gives tests a SparkSession (`test_spark`) that redirects table reads and writes **by name** to a temporary schema (`redirecting_<id>`) in the pipeline's default catalog, then drops it when the run ends.

```python
import pytest
from pyspark.pipelines.testing import TestPipeline, test_spark
from pyspark.testing import assertDataFrameEqual

test_pipeline = TestPipeline.active()


def mock_users(session):
    session.sql("""
        CREATE TABLE catalog.schema.wanderbricks_users AS
        SELECT * FROM VALUES
            (1, 'alice@example.com', 'Alice', 'admin'),
            (2, NULL, 'Bob', 'user')
        AS t(user_id, email, name, user_type)
    """)


def test_counts(test_spark):
    mock_users(test_spark)
    status = test_pipeline.run(test_spark, set(["catalog.schema.users", "catalog.schema.counts"]))
    assert status.is_success
    expected = test_spark.createDataFrame(
        [("admin", 1, 1), ("user", 1, 0)],
        schema=["user_type", "total_count", "count_valid_emails"],
    )
    assertDataFrameEqual(test_spark.table("catalog.schema.counts"), expected)
```

| API | Purpose |
| :--- | :--- |
| `TestPipeline.active()` | The pipeline currently open in the editor (source, configuration, default catalog/schema) |
| `test_pipeline.run(test_spark, set([...]))` | Synchronous selective refresh of the named tables (all tables if none given); returns a `TestUpdateStatus` |
| `status.is_success`, `status.error_message`, `status.error_class` | Outcome of the update |
| `status.event_log` / `test_pipeline.event_log` | Event log for this run / all runs in the test, as a DataFrame (can be `None`) |
| `status.flow_info` | Per-flow `records_written`, `duration`, `recompute_type` |

Requirements and limits to remember:

- You must be the pipeline **owner** (`CAN MANAGE` isn't enough) and have `USE CATALOG` and `CREATE SCHEMA` on the default catalog.
- The pipeline must be **triggered** (not continuous) and run on DBR 18.1+. Spark Connect isn't supported. Tests run from the Lakeflow Pipelines Editor only, must be written in Python, and are billed as pipeline updates.
- Isolation covers name-based table operations only. Reading or writing by path, Auto Loader, Kafka, governance statements (`GRANT`, tags, policies), and `CREATE CATALOG` / `CREATE SCHEMA` reach real production systems.
- Only selective refresh is available (no full refresh), and you shouldn't run a test while the pipeline runs an update.

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

## Use Cases

- **Ensuring Transformation Correctness**: Writing PyTest tests with Chispa to verify that a complex custom PySpark aggregation function outputs the exact expected DataFrame before the code allows for merging.
- **Testing composed transformations**: Each silver-layer step is a `DataFrame -> DataFrame` function chained with `DataFrame.transform`; `pytest` tests compare each step's output with `assertDataFrameEqual` and pin the final contract with `assertSchemaEqual`.
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

## Exam Tips

> [!tip]
>
> - `pyspark.testing.assertDataFrameEqual(actual, expected)` compares schema and data; row order is ignored unless `checkRowOrder=True`; floats use `rtol` (1e-5) / `atol` (1e-8).
> - `assertSchemaEqual` takes **schemas** (`df.schema`), not DataFrames.
> - Write steps as `DataFrame -> DataFrame` functions and chain them with `DataFrame.transform(func, *args, **kwargs)` so each is unit-testable.
> - Use a `scope="session"` `spark` fixture in `conftest.py`; integration tests can use `DatabricksSession` (never install PySpark next to Databricks Connect).
> - Pipeline unit testing (Beta): `TestPipeline.active()`, `test_pipeline.run(test_spark, ...)`, owner permission, triggered mode, DBR 18.1+, isolation by table name only.
> - Nutter and chispa are third-party; the exam names PySpark's built-in utilities.
> - Test isolation, JUnit reports (`--junitxml`), and separate test catalogs/schemas still apply.

## Key Takeaways

- **Built-in assertions**: `assertDataFrameEqual` (data + schema, tolerances, optional row order) and `assertSchemaEqual` (schemas only) are in `pyspark.testing` since Spark 3.5 and work in any framework.
- **Testable structure**: pure transformation functions composed with `DataFrame.transform` keep I/O out of unit tests; integration tests cover the entry points against real compute.
- **Pipeline unit testing (Beta)**: tests run in the Lakeflow Pipelines Editor with a `test_spark` session that redirects name-based table operations to a temporary schema.
- **Fixture scopes matter**: Use `scope="session"` for the SparkSession fixture to create it once for all tests; function-scoped fixtures recreate it per test and dramatically slow down the test suite.
- **Test isolation**: Each test must create its own data and clean up after itself — tests that depend on shared state or a specific execution order are fragile and unreliable in CI.
- **Delta in local tests**: To test Delta Lake operations locally, add `io.delta:delta-core_2.12:<version>` to `spark.jars.packages` and enable the Delta extension in the SparkSession configuration.
- **Chispa for DataFrame equality**: Use `chispa.assert_df_equality()` to compare two DataFrames with proper null and order handling, rather than converting to Python lists for comparison.
- **Nutter pattern**: Nutter notebook tests follow a `before` / `run_<name>` / `assertion_<name>` naming convention and are discovered automatically by the Nutter runner.
- **Streaming test trick**: Use `query.processAllAvailable()` followed by `query.stop()` to run a streaming query to completion in a test environment without setting up a continuous trigger.
- **JUnit reports**: Output test results with `--junitxml=test-results.xml` so CI platforms like GitHub Actions can parse and display per-test pass/fail results.
- **Low parallelism for speed**: Set `spark.sql.shuffle.partitions=1` and `spark.default.parallelism=1` in local test SparkSessions to dramatically reduce test execution time.

## Related Topics

- [Unit Testing — Part 1](./11-unit-testing-part1.md) - Built-in assertions and `DataFrame.transform`
- [Python Project Structure and Dependencies](./01-python-project-structure-and-dependencies.md) - Where tests live in a bundle
- [Advanced Testing & Operations — Part 1](./12-advanced-testing-operations-part1.md) - Property-based and data quality testing
- [Declarative Automation Bundles](../08-debugging-and-deploying/03-declarative-automation-bundles-part1.md) - Test deployment
- [CI/CD Integration](../08-debugging-and-deploying/05-cicd-integration-part1.md) - Pipeline testing
- [Git Folders](../08-debugging-and-deploying/06-git-folders.md) - Test versioning

## Official Documentation

- [pyspark.testing.assertDataFrameEqual](https://spark.apache.org/docs/latest/api/python/reference/api/pyspark.testing.assertDataFrameEqual.html)
- [pyspark.testing.assertSchemaEqual](https://spark.apache.org/docs/latest/api/python/reference/api/pyspark.testing.assertSchemaEqual.html)
- [DataFrame.transform](https://spark.apache.org/docs/latest/api/python/reference/pyspark.sql/api/pyspark.sql.DataFrame.transform.html)
- [Testing PySpark](https://spark.apache.org/docs/latest/api/python/getting_started/testing_pyspark.html)
- [Unit testing for Databricks notebooks](https://docs.databricks.com/aws/en/notebooks/testing)
- [Python unit testing in the workspace](https://docs.databricks.com/aws/en/files/python-unit-tests)
- [Testing for Databricks Connect for Python](https://docs.databricks.com/aws/en/dev-tools/databricks-connect/python/testing)
- [Unit testing for pipelines (Beta)](https://docs.databricks.com/aws/en/ldp/unit-testing)
- [Testing Notebooks](https://docs.databricks.com/notebooks/testing.html)
- [Nutter Framework](https://github.com/microsoft/nutter)
- [pytest Documentation](https://docs.pytest.org/)
- [chispa Library](https://github.com/MrPowers/chispa)

---

**[← Previous: Unit Testing — Part 1](./11-unit-testing-part1.md) | [↑ Back to Section](./README.md) | [Next: Advanced Testing & Operations — Part 1 →](./12-advanced-testing-operations-part1.md)**
