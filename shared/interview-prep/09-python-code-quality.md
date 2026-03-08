---
tags: [interview-prep, python, code-quality]
---

# Interview Questions — Python for Production Data Engineering

---

## Question 1: Generators vs Lists for Large-Scale Data Processing

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
You're writing a Python function to read 50 million records from a paginated REST API and process each record through a transformation pipeline. A colleague accumulates all records in a list before processing. What is the problem, and how would you fix it?

> [!success]- Answer Framework
>
> **Short Answer**: A list materializes all records in memory before any processing begins — with 50 million records this risks OOM and delays work until all pages are fetched; a generator function using `yield` produces one record (or one page) at a time in O(1) memory, allowing the pipeline to process each page as it arrives without holding the full dataset in RAM.
>
> ### Key Points to Cover
>
> - List: eager evaluation — all records in memory before processing starts; O(n) memory
> - Generator: lazy evaluation — one item at a time via `yield`; O(1) memory
> - Generators are iterables, not replayable — iterate once then exhausted
> - Real-world uses: paginated API reads, large file processing, lazy transformation pipelines
> - `itertools.islice` for taking the first N items from a generator
>
> ### Example Answer
>
> **The list approach (problematic)**:
>
> ```python
> def fetch_all_records(base_url: str) -> list:
>     all_records = []
>     page = 1
>     while True:
>         response = requests.get(f"{base_url}?page={page}")
>         data = response.json()
>         if not data:
>             break
>         all_records.extend(data)  # accumulates everything in memory
>         page += 1
>     return all_records  # 50M records in RAM before processing starts
>
> for record in fetch_all_records(url):  # processing starts only after all pages fetched
>     process(record)
> ```
>
> **The generator approach (memory-efficient)**:
>
> ```python
> from typing import Generator
>
> def stream_records(base_url: str) -> Generator[dict, None, None]:
>     page = 1
>     while True:
>         response = requests.get(f"{base_url}?page={page}")
>         data = response.json()
>         if not data:
>             break
>         for record in data:
>             yield record  # caller processes each record as it arrives
>         page += 1
>
> for record in stream_records(url):  # processing starts immediately, O(1) memory
>     process(record)
> ```
>
> **Composing generator pipelines**:
>
> ```python
> import itertools
>
> def parse(records):
>     for r in records:
>         yield {**r, "parsed_at": datetime.utcnow()}
>
> def filter_active(records):
>     for r in records:
>         if r.get("status") == "active":
>             yield r
>
> # Lazy pipeline — no data in memory until consumed
> pipeline = filter_active(parse(stream_records(url)))
>
> # Process first 1000 without fetching everything
> for record in itertools.islice(pipeline, 1000):
>     write_to_delta(record)
> ```
>
> **Key trade-off**: Generators cannot be iterated twice — once exhausted, you must re-create them. If you need to iterate the same dataset multiple times (e.g., compute stats then process), materialize to a list or use Delta Lake as the intermediate store.
>
> ### Follow-up Questions
>
> - A generator function raises an exception mid-iteration. Does the caller get a partial result or an error? How do you handle this?
> - What is a generator expression and how does it differ from a list comprehension syntactically?
> - You need to process records in parallel. Can you pass a generator to `concurrent.futures.ThreadPoolExecutor`? What is the risk?

---

## Question 2: Decorators for Retry Logic and Logging in Pipelines

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Your pipeline steps fail intermittently due to transient API errors (429 rate limiting, 503 timeouts). You want a reusable `@retry` decorator that wraps any function with up to N retries and exponential backoff. Walk through your implementation.

> [!success]- Answer Framework
>
> **Short Answer**: Write a decorator factory (`def retry(max_attempts, backoff_factor)` returning a decorator) that wraps the target function in a try/except loop — on failure it waits `backoff_factor ** attempt` seconds and retries up to `max_attempts` times, using `functools.wraps` to preserve the original function's name and docstring so stack traces and introspection remain correct.
>
> ### Key Points to Cover
>
> - Decorator factory pattern: outer function takes config args, returns a decorator
> - `functools.wraps(func)` preserves `__name__`, `__doc__`, `__module__` — critical for debugging
> - `*args, **kwargs` passthrough so the decorator is generic
> - Exponential backoff: `time.sleep(backoff_factor ** attempt)`
> - Log each retry attempt for observability
> - Production alternative: `tenacity` library (feature-rich, battle-tested)
>
> ### Example Answer
>
> ```python
> import time
> import logging
> import functools
> from typing import Callable, TypeVar, Tuple, Type
>
> logger = logging.getLogger(__name__)
> F = TypeVar("F", bound=Callable)
>
>
> def retry(
>     max_attempts: int = 3,
>     backoff_factor: float = 2.0,
>     exceptions: Tuple[Type[Exception], ...] = (Exception,)
> ):
>     """Decorator factory: retry on specified exceptions with exponential backoff."""
>
>     def decorator(func: F) -> F:
>         @functools.wraps(func)  # preserves func.__name__, __doc__, etc.
>         def wrapper(*args, **kwargs):
>             last_exc = None
>             for attempt in range(max_attempts):
>                 try:
>                     return func(*args, **kwargs)
>                 except exceptions as exc:
>                     last_exc = exc
>                     wait = backoff_factor ** attempt
>                     logger.warning(
>                         "Attempt %d/%d failed for %s: %s. Retrying in %.1fs",
>                         attempt + 1, max_attempts, func.__name__, exc, wait
>                     )
>                     time.sleep(wait)
>             raise last_exc  # re-raise after all attempts exhausted
>         return wrapper
>
>     return decorator
>
>
> # Usage: apply to any pipeline step
> @retry(max_attempts=3, backoff_factor=2.0, exceptions=(ConnectionError, TimeoutError))
> def ingest_from_api(endpoint: str, params: dict) -> list:
>     response = requests.get(endpoint, params=params, timeout=10)
>     response.raise_for_status()
>     return response.json()
> ```
>
> **Why `functools.wraps` matters**:
>
> ```python
> # Without functools.wraps:
> ingest_from_api.__name__  # returns "wrapper" — useless in logs and stack traces
>
> # With functools.wraps:
> ingest_from_api.__name__  # returns "ingest_from_api" — correct
> ```
>
> **Production alternative — `tenacity`**:
>
> ```python
> from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
>
> @retry(
>     stop=stop_after_attempt(3),
>     wait=wait_exponential(multiplier=2, min=1, max=30),
>     retry=retry_if_exception_type((ConnectionError, TimeoutError))
> )
> def ingest_from_api(endpoint, params):
>     ...
> ```
>
> `tenacity` handles jitter, custom callbacks on retry, and structured logging out of the box.
>
> ### Follow-up Questions
>
> - How do you write a decorator that logs the execution time of any function?
> - If the decorated function returns a value, does the decorator correctly pass it through? Show where this happens in your implementation.
> - How do you test a function decorated with `@retry` — specifically, how do you simulate a transient failure in a unit test?

---

## Question 3: Context Managers for Resource and Transaction Management

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
You're writing code that opens a JDBC connection, writes a batch of records, and must close the connection even if the write fails. How do you handle this cleanly in Python without scattering try/finally blocks at every call site?

> [!success]- Answer Framework
>
> **Short Answer**: Implement a context manager using either `__enter__`/`__exit__` on a class or `@contextlib.contextmanager` with `try/yield/finally` so the `with` block guarantees cleanup runs even on exception — the connection closes whether the write succeeds or raises, without repeating try/finally boilerplate at every call site.
>
> ### Key Points to Cover
>
> - `with` statement calls `__enter__` on entry and `__exit__` on exit (even on exception)
> - Class-based: `__enter__` returns the resource; `__exit__(exc_type, exc_val, tb)` handles cleanup
> - `@contextlib.contextmanager`: simpler — `yield` separates setup from teardown in one function
> - Use cases: DB connections, file handles, Spark sessions, timer benchmarks, transactions
> - `__exit__` returning `True` suppresses the exception; returning `None`/`False` re-raises it
>
> ### Example Answer
>
> **Approach 1 — Class-based context manager**:
>
> ```python
> class JDBCConnection:
>     def __init__(self, url: str, properties: dict):
>         self.url = url
>         self.properties = properties
>         self.conn = None
>
>     def __enter__(self):
>         self.conn = create_jdbc_connection(self.url, self.properties)
>         return self.conn
>
>     def __exit__(self, exc_type, exc_val, exc_tb):
>         if self.conn:
>             self.conn.close()
>         return False  # let exceptions propagate
>
>
> # Connection closes automatically on success OR failure
> with JDBCConnection(url, props) as conn:
>     conn.write(df)
> ```
>
> **Approach 2 — `@contextlib.contextmanager` (simpler for functions)**:
>
> ```python
> from contextlib import contextmanager
> import logging
>
> logger = logging.getLogger(__name__)
>
>
> @contextmanager
> def managed_jdbc(url: str, properties: dict):
>     conn = create_jdbc_connection(url, properties)
>     try:
>         yield conn          # caller code runs here
>     except Exception as e:
>         logger.error("Write failed, rolling back: %s", e)
>         conn.rollback()
>         raise               # re-raise so caller knows it failed
>     finally:
>         conn.close()        # always runs, even if exception was raised
>
>
> with managed_jdbc(url, props) as conn:
>     conn.write(df)
> ```
>
> **Timer context manager (common pattern)**:
>
> ```python
> @contextmanager
> def timer(label: str):
>     import time
>     start = time.perf_counter()
>     yield
>     elapsed = time.perf_counter() - start
>     logger.info("%s completed in %.2fs", label, elapsed)
>
>
> with timer("ingest_orders"):
>     ingest_orders()
> ```
>
> **Key rule**: Put cleanup in `finally`, not in `except` — `finally` runs whether an exception was raised, caught, or never occurred. `except` alone does not run if no exception is raised.
>
> ### Follow-up Questions
>
> - Can you nest `with` statements? Show the syntax for opening two resources in the same `with` block.
> - Your `__exit__` method returns `True`. What happens to an exception raised inside the `with` block?
> - How does a Spark session relate to the context manager pattern? When would you use `SparkSession.builder.getOrCreate()` vs a context manager?

---

## Question 4: OOP Abstractions for Reusable Pipeline Code

**Level**: Professional
**Type**: Deep Dive

**Scenario / Question**:
Your team maintains 20 ingestion pipelines that all follow the same structure: read from source → validate → transform → write to Delta. Each pipeline differs only in configuration and transformation logic. How would you design a shared Python abstraction to eliminate the orchestration boilerplate?

> [!success]- Answer Framework
>
> **Short Answer**: Define an abstract base class `BasePipeline` using `ABC` and `@abstractmethod` for `extract`, `validate`, `transform`, and `load`, with a concrete `run()` method that calls them in order — each of the 20 pipelines inherits `BasePipeline` and overrides only the abstract methods it needs to change, eliminating orchestration boilerplate and making each pipeline independently testable.
>
> ### Key Points to Cover
>
> - `ABC` and `@abstractmethod` enforce the interface contract at instantiation time
> - Concrete `run()` implements the template method pattern — structure is fixed, steps are customizable
> - `dataclass` for typed config objects (cleaner than raw dicts)
> - Dependency injection: pass SparkSession and config at construction (not as globals)
> - Each concrete class is independently unit-testable by mocking just one step
>
> ### Example Answer
>
> ```python
> from abc import ABC, abstractmethod
> from dataclasses import dataclass
> from pyspark.sql import SparkSession, DataFrame
> import logging
>
> logger = logging.getLogger(__name__)
>
>
> @dataclass
> class PipelineConfig:
>     source_path: str
>     target_table: str
>     checkpoint_path: str
>     batch_size: int = 10_000
>
>
> class BasePipeline(ABC):
>     """Template for all ingestion pipelines. Override extract, validate, transform, load."""
>
>     def __init__(self, spark: SparkSession, config: PipelineConfig):
>         self.spark = spark
>         self.config = config
>
>     @abstractmethod
>     def extract(self) -> DataFrame:
>         """Read raw data from source."""
>
>     @abstractmethod
>     def transform(self, df: DataFrame) -> DataFrame:
>         """Apply business logic transformations."""
>
>     def validate(self, df: DataFrame) -> DataFrame:
>         """Validate data quality — override in subclass for custom rules."""
>         null_count = df.filter(df["id"].isNull()).count()
>         if null_count > 0:
>             raise ValueError(f"Found {null_count} rows with null id")
>         return df
>
>     def load(self, df: DataFrame) -> None:
>         """Write to Delta table — override for custom write options."""
>         (df.write
>             .format("delta")
>             .mode("append")
>             .saveAsTable(self.config.target_table))
>
>     def run(self) -> None:
>         """Template method — orchestration is fixed; steps are customizable."""
>         logger.info("Starting pipeline: %s", self.__class__.__name__)
>         raw = self.extract()
>         validated = self.validate(raw)
>         transformed = self.transform(validated)
>         self.load(transformed)
>         logger.info("Pipeline complete: %s", self.__class__.__name__)
>
>
> # Concrete implementation — only override what's different
> class OrdersPipeline(BasePipeline):
>     def extract(self) -> DataFrame:
>         return (self.spark.read
>             .format("json")
>             .load(self.config.source_path))
>
>     def transform(self, df: DataFrame) -> DataFrame:
>         from pyspark.sql.functions import col, current_timestamp
>         return (df
>             .select("order_id", "customer_id", "amount")
>             .withColumn("_ingestion_ts", current_timestamp()))
>
>
> # Usage
> config = PipelineConfig(
>     source_path="/mnt/landing/orders/",
>     target_table="bronze.orders",
>     checkpoint_path="/checkpoints/orders"
> )
> OrdersPipeline(spark, config).run()
> ```
>
> **What `@abstractmethod` enforces**: If you instantiate `BasePipeline` directly or a subclass that does not implement all abstract methods, Python raises `TypeError` at instantiation — not at runtime when the method is called.
>
> ### Follow-up Questions
>
> - What is the difference between `ABC` and `Protocol` in Python? When would you use `Protocol` instead of `ABC`?
> - Your `validate` method has a default implementation. How do you make it optional to override (non-abstract) vs required to override (abstract)?
> - How do you test `OrdersPipeline.transform()` in isolation without running the full pipeline?

---

## Question 5: Unit Testing PySpark Transformations with pytest

**Level**: Both
**Type**: Deep Dive

**Scenario / Question**:
Write a unit test for a PySpark function `deduplicate_orders(df)` that removes duplicate `order_id` rows, keeping the most recent by `updated_at`. Walk through your test structure, how you create test data, and how you assert the result.

> [!success]- Answer Framework
>
> **Short Answer**: Create a session-scoped `SparkSession` pytest fixture to avoid recreating a session for each test, build small input DataFrames with `spark.createDataFrame`, call the transformation function, and use `chispa`'s `assert_df_equality(actual, expected, ignore_row_order=True)` to compare output — test edge cases (duplicate, null, empty) as separate cases with 5–10 rows each.
>
> ### Key Points to Cover
>
> - `pytest` fixture with `scope="session"` for SparkSession (expensive to create per test)
> - `spark.createDataFrame(data, schema)` for small, readable test datasets
> - `chispa.assert_df_equality(actual, expected, ignore_row_order=True)` — handles row order and schema
> - Test schema separately from data
> - Test edge cases as separate functions or parametrized cases
> - Avoid `collect()` + `assertEqual` on full DataFrames (order-sensitive, verbose diffs)
>
> ### Example Answer
>
> **The function under test:**
>
> ```python
> # pipelines/transforms.py
> from pyspark.sql import DataFrame, Window
> from pyspark.sql.functions import row_number, desc, col
>
>
> def deduplicate_orders(df: DataFrame) -> DataFrame:
>     """Keep one row per order_id — the most recent by updated_at."""
>     window = Window.partitionBy("order_id").orderBy(desc("updated_at"))
>     return (df
>         .withColumn("_rn", row_number().over(window))
>         .filter(col("_rn") == 1)
>         .drop("_rn"))
> ```
>
> **Test file:**
>
> ```python
> # tests/test_transforms.py
> import pytest
> from pyspark.sql import SparkSession
> from pyspark.sql.types import StructType, StructField, LongType, StringType
> from chispa import assert_df_equality
> from pipelines.transforms import deduplicate_orders
>
>
> @pytest.fixture(scope="session")
> def spark():
>     """Session-scoped SparkSession — created once for all tests."""
>     return (SparkSession.builder
>         .master("local[2]")
>         .appName("unit-tests")
>         .getOrCreate())
>
>
> SCHEMA = StructType([
>     StructField("order_id", LongType()),
>     StructField("customer_id", LongType()),
>     StructField("updated_at", StringType()),
> ])
>
>
> def test_deduplicate_keeps_most_recent(spark):
>     """Duplicate order_id rows: keep the row with the latest updated_at."""
>     input_data = [
>         (1, 100, "2025-01-10"),  # older
>         (1, 100, "2025-01-15"),  # most recent — should be kept
>         (2, 200, "2025-01-12"),  # no duplicate
>     ]
>     expected_data = [
>         (1, 100, "2025-01-15"),
>         (2, 200, "2025-01-12"),
>     ]
>
>     input_df = spark.createDataFrame(input_data, SCHEMA)
>     expected_df = spark.createDataFrame(expected_data, SCHEMA)
>
>     actual_df = deduplicate_orders(input_df)
>
>     assert_df_equality(actual_df, expected_df, ignore_row_order=True)
>
>
> def test_deduplicate_empty_dataframe(spark):
>     """Empty input should return empty output with the same schema."""
>     input_df = spark.createDataFrame([], SCHEMA)
>     actual_df = deduplicate_orders(input_df)
>     assert actual_df.count() == 0
>     assert actual_df.schema == SCHEMA
>
>
> def test_deduplicate_no_duplicates(spark):
>     """No duplicates — all rows should be preserved."""
>     input_data = [(1, 100, "2025-01-10"), (2, 200, "2025-01-12")]
>     input_df = spark.createDataFrame(input_data, SCHEMA)
>     actual_df = deduplicate_orders(input_df)
>     assert actual_df.count() == 2
> ```
>
> **Why `chispa` over manual `collect()` comparison**:
>
> - `assert_df_equality(..., ignore_row_order=True)` — Spark does not guarantee row order; manual comparison requires sorting both sides
> - On failure, `chispa` prints a readable diff showing which rows differ and which match
> - `assert actual.collect() == expected.collect()` is order-sensitive and prints raw tuples on failure
>
> ### Follow-up Questions
>
> - How do you mock an external API call inside a PySpark transformation using `monkeypatch`?
> - If a transformation reads from a Delta table, how do you isolate the test from the real table?
> - Your test suite uses `scope="session"` for SparkSession. If one test modifies a shared DataFrame, can it affect another test?

---

**[← Previous: PySpark & SQL Patterns](./08-pyspark-sql-patterns.md) | [↑ Back to Interview Prep](./README.md) | [Next: Governance & Security →](./10-governance-security.md)**
