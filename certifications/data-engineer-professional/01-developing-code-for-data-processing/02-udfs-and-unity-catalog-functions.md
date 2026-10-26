---
title: UDFs and Unity Catalog Functions
type: study-material
tags:
  - data-engineer-professional
  - udf
  - unity-catalog
  - pandas
status: published
---

# UDFs and Unity Catalog Functions

## Overview

User-defined functions (UDFs) extend Spark when built-in functions can't express the logic. On Databricks you choose along two axes: **language and execution model** (SQL, row-at-a-time Python, Arrow-optimized Python, vectorized pandas, batch, table functions) and **scope** (session-scoped in a notebook or job, or governed and shared as a Unity Catalog function).

> [!abstract]
>
> - Built-in functions and SQL UDFs are the most efficient options; Python UDFs pay serialization cost, and pandas UDFs reduce it with Apache Arrow (up to 100x faster than row-at-a-time Python UDFs).
> - Session-scoped UDFs (`@udf`, `@pandas_udf`, `applyInPandas`, `@udtf`, `CREATE TEMPORARY FUNCTION`) live only in the current SparkSession.
> - Unity Catalog functions (`CREATE FUNCTION catalog.schema.fn ... LANGUAGE SQL | PYTHON`) are persisted, governed with `EXECUTE`, discoverable, and callable from notebooks, jobs, pipelines, and pro/serverless SQL warehouses.
> - Batch Unity Catalog Python UDFs (`PARAMETER STYLE PANDAS` + `HANDLER`) and Unity Catalog Python UDTFs bring vectorized and table-returning logic under governance.

> [!tip] What the Exam Tests
>
> - "Develop User-Defined Functions (UDFs) using Pandas, Python, and SQL, including Unity Catalog functions for the given constraints."
> - Picking the UDF type that satisfies a stated constraint: performance, governance and reuse, SQL warehouse or serverless support, external libraries, one-to-many output.
> - Writing correct `CREATE FUNCTION` syntax for SQL and Python UDFs, and granting `EXECUTE`.
> - Recognizing compute and access-mode limits (DBR versions, serverless memory limit, classic SQL warehouse restriction).

---

## Built-in Functions First

Use UDFs for logic that's hard to express with built-in Spark functions; common examples are encryption, decryption, hashing, JSON parsing, and validation. Databricks recommends UDFs for ad hoc queries, manual data cleaning, exploratory analysis, and small-to-medium datasets, and recommends built-in Spark functions and methods for large datasets and for workloads that run regularly or continuously, such as ETL jobs and streaming.

| Option | Relative performance | Why |
| :--- | :--- | :--- |
| Built-in functions, SQL UDFs | Fastest | Run inside the engine with no Python serialization |
| Scala UDFs | Faster than Python | Avoid (or reduce) moving data out of the JVM |
| pandas UDFs | Up to 100x faster than Python UDFs | Apache Arrow transfers data in columnar batches |
| Row-at-a-time Python UDFs | Slowest | Each row is serialized to the Python worker |

---

## Session-Scoped vs Unity Catalog Governed

| Consideration | Unity Catalog governed UDFs | Session-scoped UDFs |
| :--- | :--- | :--- |
| Best for | Sharing functions securely across teams, notebooks, jobs, and pro/serverless SQL warehouses | Quick, iterative development within one notebook or job |
| Languages | SQL, Python, Scala, Java | SQL, Python, Scala |
| Governance | Unity Catalog permissions (`EXECUTE`), discoverable in Catalog Explorer | None; scoped to the current SparkSession |
| Persistence | Persisted in Unity Catalog, reusable across sessions | Exist only for the current session |
| Reach | Every workspace attached to the same metastore (unless the catalog is bound to specific workspaces) | The session that defined it |

---

## Session-Scoped Python UDFs

### Scalar Python UDF

A scalar UDF receives one row's values and returns one value. The default return type is `StringType`, so declare it explicitly.

```python
from pyspark.sql.functions import col, udf
from pyspark.sql.types import StringType


@udf(returnType=StringType())
def format_phone(phone):
    if phone and len(phone) == 10:
        return f"({phone[:3]}) {phone[3:6]}-{phone[6:]}"
    return phone


df_out = df.withColumn("formatted_phone", format_phone(col("phone")))
```

Register the same function for SQL with `spark.udf.register`:

```python
from pyspark.sql.types import LongType


def squared(s):
    return s * s


spark.udf.register("squaredWithPython", squared, LongType())
spark.sql("SELECT id, squaredWithPython(id) AS id_squared FROM test")
```

### Arrow-optimized Python UDFs

An Arrow Python UDF still runs row by row, but uses Apache Arrow for batch transfer and serialization, which also gives more consistent type coercion than pickled UDFs.

```python
@udf(returnType="int", useArrow=True)   # Arrow-optimized
def arrow_slen(s):
    return len(s)
```

Enable it for the whole session with `spark.sql.execution.pythonUDF.arrow.enabled=true`; the config applies only when `useArrow` is unset or `None`. In open-source Apache Spark 4.2, Arrow optimization is the default for regular Python UDFs.

### Evaluation order and null handling

Spark SQL doesn't guarantee the order in which subexpressions are evaluated, and `AND` / `OR` don't short-circuit. A `WHERE s IS NOT NULL AND my_udf(s) > 1` filter can still pass `NULL` into the UDF.

```python
spark.udf.register("strlen_nullsafe", lambda s: len(s) if s is not None else -1, "int")
spark.sql("SELECT s FROM test1 WHERE s IS NOT NULL AND strlen_nullsafe(s) > 1")   # ok
spark.sql("SELECT s FROM test1 WHERE if(s IS NOT NULL, strlen(s), null) > 1")     # ok
```

Make the UDF null-aware, or guard the call with `IF` / `CASE WHEN`. UDFs are deterministic by default; mark random or time-dependent ones with `.asNondeterministic()`.

### PySpark UDF limitations

- **Serverless memory:** each PySpark UDF is limited to 1 GB; exceeding it raises `UDF_PYSPARK_USER_CODE_ERROR.MEMORY_LIMIT_SERVERLESS`. On standard access mode the limit follows the instance's available memory (`UDF_PYSPARK_USER_CODE_ERROR.MEMORY_LIMIT`).
- **Broadcast variables and instance profiles** aren't supported in PySpark UDFs on standard access mode or serverless.
- **File access:** on DBR 14.2 and below, PySpark UDFs on shared (standard) clusters can't access Git folders, workspace files, or volumes.
- **Hive UDFs** aren't supported on standard access mode, and serverless doesn't support `CREATE FUNCTION (External)`. Use Unity Catalog functions instead.

---

## pandas UDFs (Vectorized)

A pandas UDF uses Apache Arrow to transfer data and pandas to process it in batches. You define it with `@pandas_udf` and Python type hints; the hints determine the UDF type.

### Series to Series

```python
import pandas as pd
from pyspark.sql.functions import col, pandas_udf


@pandas_udf("double")
def calculate_discount(amount: pd.Series, rate: pd.Series) -> pd.Series:
    return amount * (1 - rate)


df_out = df.withColumn("discounted", calculate_discount(col("amount"), col("rate")))
```

The function must return a Series of the same length as its input. Spark splits each partition into Arrow batches, calls the function per batch, and concatenates the results.

### Iterator of Series to Iterator of Series

Use this when each executor must do expensive one-time setup, such as loading a model, before processing batches.

```python
from typing import Iterator

import pandas as pd
from pyspark.sql.functions import pandas_udf


@pandas_udf("long")
def plus_offset(batch_iter: Iterator[pd.Series]) -> Iterator[pd.Series]:
    offset = 1                      # one-time setup, e.g. load a model, before any batch
    try:
        for batch in batch_iter:
            yield batch + offset
    finally:
        pass                        # release resources here
```

For several input columns, the hint is `Iterator[Tuple[pd.Series, ...]] -> Iterator[pd.Series]`.

### Series to scalar (grouped aggregate)

```python
@pandas_udf("double")
def mean_udf(v: pd.Series) -> float:
    return v.mean()


df.groupBy("id").agg(mean_udf(df["v"]))
```

A Series-to-scalar UDF works with `select`, `groupBy().agg()`, and windows. It doesn't support partial aggregation; all data for each group is loaded into memory.

### pandas function APIs

pandas function APIs apply a native Python function to a whole DataFrame or group. Type hints are optional.

```python
def subtract_mean(pdf: pd.DataFrame) -> pd.DataFrame:
    return pdf.assign(v=pdf.v - pdf.v.mean())


result = df.groupBy("id").applyInPandas(subtract_mean, schema="id long, v double")
```

| API | Input → output | Typical use |
| :--- | :--- | :--- |
| `groupBy().applyInPandas(func, schema)` | Each group as a `pandas.DataFrame` → `pandas.DataFrame` | Split-apply-combine: per-customer model fit, per-group normalization |
| `mapInPandas(func, schema)` | Iterator of `pandas.DataFrame` → iterator of `pandas.DataFrame` | Row filtering or transformation that may change row count |
| `groupBy().cogroup(other.groupBy()).applyInPandas(...)` | Two co-grouped DataFrames → `pandas.DataFrame` | As-of joins between two datasets by key |

All rows of a group are loaded into memory before the function runs, and `spark.sql.execution.arrow.maxRecordsPerBatch` doesn't apply to groups, so skewed groups can cause out-of-memory errors. On classic compute `maxRecordsPerBatch` (default 10,000) limits Arrow batch size for pandas UDFs; on serverless the platform manages batch sizing and the setting has no effect.

| pandas UDF type | Type hint | Rows out |
| :--- | :--- | :--- |
| Series to Series | `pd.Series, ... -> pd.Series` | Same as input |
| Iterator of Series | `Iterator[pd.Series] -> Iterator[pd.Series]` | Same as input |
| Iterator of multiple Series | `Iterator[Tuple[pd.Series, ...]] -> Iterator[pd.Series]` | Same as input |
| Series to scalar | `pd.Series, ... -> scalar` | One per group |

---

## SQL UDFs

### Scalar SQL UDF

```sql
CREATE OR REPLACE FUNCTION main.analytics.calculate_bmi(weight DOUBLE, height DOUBLE)
RETURNS DOUBLE
LANGUAGE SQL
DETERMINISTIC
COMMENT 'BMI from kilograms and metres'
RETURN weight / (height * height);

SELECT person_id, main.analytics.calculate_bmi(weight_kg, height_m) AS bmi
FROM main.analytics.person_data;
```

- `RETURNS` is optional for SQL UDFs; the type is derived from the body.
- The `RETURN` body is an expression or a query. It can't contain aggregate, window, or ranking functions, or row-producing functions such as `explode`.
- `DEFAULT` values on parameters are supported for `LANGUAGE SQL` only; once one parameter has a default, all following parameters need one.
- SQL and Python UDFs support named parameter invocation (`fn(num_sides => 10, num_dice => 3)`).
- Mark functions such as `rand()`-based ones `NOT DETERMINISTIC`.

### SQL table function

```sql
CREATE OR REPLACE FUNCTION main.hr.getemps(deptno INT)
RETURNS TABLE (name STRING)
RETURN SELECT name FROM main.hr.employee e WHERE e.deptno = getemps.deptno;

SELECT * FROM main.hr.getemps(10);
```

### Temporary (session-scoped) functions

`CREATE TEMPORARY FUNCTION` creates a function that is visible only in the current session, with no catalog entry. It works with `LANGUAGE SQL` and `LANGUAGE PYTHON`.

---

## Unity Catalog Python UDFs

### Create and call

```sql
CREATE OR REPLACE FUNCTION main.analytics.mask_email(email STRING)
RETURNS STRING
LANGUAGE PYTHON
DETERMINISTIC
AS $$
parts = email.split('@', 1)
if len(parts) != 2:
    return None
username, domain = parts
return f"{username[0]}{'*' * (len(username) - 2)}{username[-1]}@{domain}"
$$;
```

```python
from pyspark.sql.functions import expr

masked = df.withColumn("masked_email", expr("main.analytics.mask_email(email)"))
```

- The Python body sits between `$$` delimiters and must return a value matching `RETURNS`.
- Python UDFs in Unity Catalog need a serverless or pro SQL warehouse, serverless compute, or a cluster on DBR 13.3 LTS or above.
- A view that uses a Unity Catalog Python UDF fails on **classic** SQL warehouses.
- Python UDFs run in an isolated environment without access to file systems or internal services, must handle `NULL` themselves, and follow Databricks SQL type mappings.
- If you omit the catalog and schema, the function is registered in the current schema.

To upgrade a session `@udf` to a governed function, move the body into `CREATE FUNCTION ... LANGUAGE PYTHON AS $$ ... $$`; the syntax and semantics differ from session UDFs.

### External libraries: the `ENVIRONMENT` clause

```sql
CREATE OR REPLACE FUNCTION main.analytics.mixed_process(data STRING)
RETURNS STRING
LANGUAGE PYTHON
ENVIRONMENT (
  dependencies = '["simplejson==3.19.3", "/Volumes/main/libs/pkgs/custom_package-1.0.0-py3-none-any.whl"]',
  environment_version = '6'
)
AS $$
import simplejson as json
import custom_package
return json.dumps(custom_package.process(data))
$$;
```

- `dependencies` is a JSON array string of pip requirement lines: PyPI packages, wheels in Unity Catalog volumes, or HTTPS URLs to wheels.
- `environment_version` is required whenever `ENVIRONMENT` is present. Values are a version of 3 or above, or `'None'` for the default Python environment.
- Supported on serverless notebooks and jobs, pro and serverless SQL warehouses, and classic compute on DBR 16.2+. On DBR 16.2–18.1 only `'None'` is allowed; other values need DBR 18.2+.
- The creator needs `READ VOLUME` on any source volume. With `environment_version` 6+, callers need only `EXECUTE`; with an older or `'None'` version, callers also need `READ VOLUME`.
- Serverless can run on `aarch64` or `x86_64`; a native wheel built for one architecture fails with `ISOLATION_ENVIRONMENT_USER_ERROR.GENERIC`. Ship both variants with `platform_machine` markers.

### Features that need an explicit environment version

On serverless compute and pro/serverless SQL warehouses, these require `environment_version = '6'` or above in the function definition (classic compute instead needs the listed runtime):

| Feature | Classic compute requirement |
| :--- | :--- |
| Named `HANDLER` for a scalar Python UDF | DBR 18.1+ |
| `CREDENTIALS` (service credentials) in a scalar Python UDF | DBR 18.1+ |
| `SECRETS` (Unity Catalog secrets) in scalar or batch UDFs | DBR 19+, standard access mode |
| More than five UDF calls in one query | DBR 18.1+ |
| PySpark-compatible `TIMESTAMP` input (timezone-naive UTC) | DBR 18.1+ |

### Isolation and determinism

- On DBR 18.1+, Unity Catalog Python UDFs with the same owner and session can share an isolation environment. Add `STRICT ISOLATION` for UDFs that run `eval()` / `exec()`, write local files, modify global or system state, or read environment variables.
- Add `DETERMINISTIC` when the same inputs always produce the same output, so the optimizer can use it. Batch Unity Catalog Python UDFs are treated as non-deterministic unless you declare otherwise.

---

## Batch Unity Catalog Python UDFs

Batch UDFs process an iterator of `pandas.Series` batches instead of one row at a time, while keeping 1:1 input/output row parity. They are generally available and need DBR 16.3+ on classic compute, or serverless compute, or a pro/serverless SQL warehouse.

```sql
CREATE OR REPLACE FUNCTION main.analytics.calculate_bmi_pandas(weight_kg DOUBLE, height_m DOUBLE)
RETURNS DOUBLE
LANGUAGE PYTHON
DETERMINISTIC
PARAMETER STYLE PANDAS
HANDLER 'handler_function'
AS $$
import pandas as pd
from typing import Iterator, Tuple

model_factor = 1.0   # expensive setup goes here: runs once, outside the per-batch loop

def handler_function(batch_iter: Iterator[Tuple[pd.Series, pd.Series]]) -> Iterator[pd.Series]:
    for weight, height in batch_iter:
        yield weight / (height ** 2) * model_factor
$$;
```

- `PARAMETER STYLE PANDAS` declares batch processing; `HANDLER` names the generator function.
- The handler must yield a Series with the same length as each input batch.
- Put expensive setup outside the handler so it runs once, not per batch.
- Batch UDFs receive timestamps inside `pandas.Series` objects.

---

## User-Defined Table Functions (UDTFs)

A UDTF returns zero or more rows (and possibly several columns) per input and is called in the `FROM` clause.

```sql
CREATE OR REPLACE FUNCTION main.analytics.square_numbers(start INT, end INT)
RETURNS TABLE (num INT, squared INT)
LANGUAGE PYTHON
HANDLER 'SquareNumbers'
DETERMINISTIC
AS $$
class SquareNumbers:
    def eval(self, start: int, end: int):
        for num in range(start, end + 1):
            yield (num, num * num)
$$;

SELECT * FROM main.analytics.square_numbers(1, 5);
```

```python
from pyspark.sql.functions import lit, udtf


@udtf(returnType="sum: int, diff: int")
class GetSumDiff:
    def eval(self, x: int, y: int):
        yield x + y, x - y


GetSumDiff(lit(1), lit(2)).show()
spark.udtf.register("get_sum_diff", GetSumDiff)   # make it callable from SQL
```

- The class has a mandatory `eval` method that yields rows. With `TABLE` arguments (DBR 17.2+), `eval` runs once per input row and the optional `terminate` method runs once at the end of each partition, which is where aggregations or cleanup go.
- Unity Catalog Python UDTFs run on serverless, standard access mode on DBR 17.1+, and pro/serverless SQL warehouses. They became generally available in DBR 18 on July 28, 2026.
- Session-scoped Python UDTFs are in Public Preview on DBR 14.3 LTS+. If a UDTF receives little input but emits a large table, set `useArrow=True` on `@udtf`.

---

## Governance: Privileges and Sharing

| Action | Required privileges |
| :--- | :--- |
| Create a function | `USE CATALOG` + `USE SCHEMA`, `CREATE FUNCTION` on the schema; `SELECT` on referenced tables/views; `EXECUTE` on referenced functions; `READ VOLUME` on referenced volumes |
| Replace with `CREATE OR REPLACE` | Ownership or `MANAGE` on the function, or on its schema or catalog |
| Call a function | `EXECUTE` on the function, plus `USE CATALOG` and `USE SCHEMA` |

```sql
GRANT EXECUTE ON FUNCTION main.analytics.calculate_bmi TO `data-analysts`;
REVOKE EXECUTE ON FUNCTION main.analytics.calculate_bmi FROM `contractor@example.com`;
```

- Grants in a metastore apply in every workspace attached to that metastore, and a catalog is reachable from all of them unless it's bound to specific workspaces. That's what makes Unity Catalog functions reusable across workspaces.
- SQL and Python UDFs are the building blocks for row filters and column masks; see [Access Control](../06-ensuring-data-security-and-compliance/01-access-control.md).
- Databricks recommends a dedicated catalog and schema for shared UDFs, and a docstring with version, changelog, parameters, return value, and an example.

---

## Compute Support

| UDF type | Serverless notebooks/jobs | Classic (standard access) | SQL warehouse | Lakeflow Pipelines |
| :--- | :--- | :--- | :--- | :--- |
| Unity Catalog Python UDF | Yes | DBR 13.3 LTS+ | Pro, serverless | Classic and serverless |
| Batch Unity Catalog Python UDF | Yes | DBR 16.3+ | Pro, serverless | Not listed |
| Unity Catalog Python UDTF | Yes | DBR 17.1+ | Pro, serverless | Not listed |
| Session Python scalar UDF | Yes | DBR 13.3 LTS+ | n/a (PySpark API) | Classic and serverless |
| Session pandas UDF / `applyInPandas` / `mapInPandas` / UDTF | Yes | DBR 14.3 LTS+ | n/a (PySpark API) | Classic and serverless |

SQL UDFs (`LANGUAGE SQL`) apply to both Databricks SQL and Databricks Runtime.

---

## Which UDF for Which Constraint

| Constraint in the scenario | Choose | Why |
| :--- | :--- | :--- |
| Logic expressible in SQL; best performance | Built-in function or SQL UDF | No Python serialization |
| Governed, discoverable, reused across teams and workspaces | Unity Catalog function (`CREATE FUNCTION catalog.schema.fn`) | Persisted, `EXECUTE` privilege, metastore-wide |
| Python logic called from dashboards or a SQL warehouse | Unity Catalog Python UDF on a pro/serverless warehouse | Session UDFs don't exist there; classic warehouses fail on views using them |
| Numeric/vectorizable Python over large data in a notebook or job | pandas UDF (Series to Series) | Arrow batches, up to 100x faster than row-at-a-time |
| Same, but governed | Batch Unity Catalog Python UDF | `PARAMETER STYLE PANDAS` + `HANDLER` |
| Expensive one-time setup (load a model) | Iterator pandas UDF, or batch UDF with setup outside the handler | Setup runs once per task, not per row |
| Custom logic per group, needs the whole group | `groupBy().applyInPandas()` | Group arrives as one `pandas.DataFrame` |
| One input row produces many rows | UDTF (session `@udtf` or Unity Catalog `RETURNS TABLE`) | Called in `FROM`, yields rows |
| Needs an external PyPI library in a governed function | Unity Catalog Python UDF with `ENVIRONMENT (dependencies = ...)` | Dependencies are declared with the function |
| Row filter or column mask | SQL UDF in Unity Catalog | Filters and masks are defined with Unity Catalog UDFs, and SQL UDFs are the most efficient kind |
| Quick exploration in one notebook | Session-scoped `@udf` / `@pandas_udf` | No catalog object to manage |

## Use Cases

- **PII masking for BI users**: A Unity Catalog SQL or Python function such as `mask_email` is granted with `EXECUTE` to an analyst group and used in a view queried from a serverless SQL warehouse.
- **Batch inference in ETL**: An iterator pandas UDF loads a model once per task and scores each Arrow batch, avoiding per-row model loads.
- **Exploding nested API payloads**: A Unity Catalog Python UDTF turns one JSON document per row into one row per line item, callable from SQL.

## Common Issues & Errors

### UDF receives NULL despite a `WHERE ... IS NOT NULL` filter

**Scenario:** `TypeError` inside a UDF on rows that the filter should have removed.

**Fix:** Spark doesn't guarantee evaluation order; handle `None` inside the UDF or wrap the call in `IF` / `CASE WHEN`.

### `UDF_PYSPARK_USER_CODE_ERROR.MEMORY_LIMIT_SERVERLESS`

**Scenario:** A PySpark UDF holds a large lookup in memory on serverless.

**Fix:** Stay under the 1 GB per-UDF limit: replace the lookup with a join or use built-in functions.

### View works in a notebook but fails on a SQL warehouse

**Scenario:** The view calls a Unity Catalog Python UDF and is queried from a classic SQL warehouse.

**Fix:** Use a pro or serverless SQL warehouse.

### Out-of-memory in `applyInPandas`

**Scenario:** One key has millions of rows.

**Fix:** The whole group is loaded into memory and `maxRecordsPerBatch` doesn't split it; salt or pre-aggregate the skewed key.

### Permission denied calling a function

**Scenario:** A user can see the table but gets an error calling `main.analytics.mask_email`.

**Fix:** Grant `EXECUTE` on the function and `USE CATALOG` / `USE SCHEMA` on its parents.

## Exam Tips

> [!tip]
>
> - Prefer built-in functions; if a UDF is needed, SQL UDF > pandas UDF > row-at-a-time Python UDF for performance.
> - Governed and shared across teams or SQL warehouses → **Unity Catalog function**; quick notebook logic → session-scoped UDF.
> - Running a UDF needs **`EXECUTE`** (plus `USE CATALOG` / `USE SCHEMA`); creating needs **`CREATE FUNCTION`** on the schema.
> - `PARAMETER STYLE PANDAS` + `HANDLER` = **Batch Unity Catalog Python UDF**; `RETURNS TABLE` + class with `eval` = **UDTF**.
> - Python UDF libraries in a governed function go in the **`ENVIRONMENT`** clause (`dependencies`, `environment_version`).
> - `applyInPandas` loads each whole group into memory; Series-to-scalar pandas UDFs don't do partial aggregation.
> - Serverless: 1 GB memory per PySpark UDF, no broadcast variables, no `CREATE FUNCTION (External)` / Hive UDFs.

## Key Takeaways

- **Scope**: session-scoped UDFs disappear with the SparkSession; Unity Catalog functions are persisted securables governed by `EXECUTE` and visible across workspaces on the same metastore.
- **pandas UDF types**: Series to Series, Iterator of Series, Iterator of multiple Series, and Series to scalar; pandas function APIs are `applyInPandas`, `mapInPandas`, and cogrouped `applyInPandas`.
- **Arrow-optimized Python UDFs**: `useArrow=True` or `spark.sql.execution.pythonUDF.arrow.enabled`; still row-at-a-time logic but Arrow serialization.
- **SQL UDF syntax**: `CREATE [OR REPLACE] [TEMPORARY] FUNCTION name(params) RETURNS type RETURN expr`; `RETURNS TABLE (...) RETURN SELECT ...` for table functions; `DEFAULT` parameters for SQL only.
- **Unity Catalog Python UDF**: `LANGUAGE PYTHON AS $$ ... $$`; DBR 13.3 LTS+ or pro/serverless SQL warehouse; views using it fail on classic SQL warehouses.
- **Batch UDF**: `PARAMETER STYLE PANDAS` + `HANDLER`, same row count out as in, DBR 16.3+ on classic.
- **UDTF**: Python class with `eval` (and optional `terminate`), `RETURNS TABLE`, called in `FROM`; Unity Catalog Python UDTFs GA in DBR 18.
- **Environment version 6** unlocks named handlers, secrets, service credentials, more than five UDF calls per query, and caller access to volume dependencies without `READ VOLUME`.

## Related Topics

- [Python Project Structure and Dependencies](./01-python-project-structure-and-dependencies.md) - Packaging shared code and dependency troubleshooting
- [Batch ETL Pipelines — Part 1](../03-data-manipulation/01-batch-etl-pipelines-part1.md) - DataFrame transformations that usually replace UDFs
- [Access Control](../06-ensuring-data-security-and-compliance/01-access-control.md) - Row filters and column masks built on UDFs
- [Unity Catalog](../07-data-governance/01-unity-catalog.md) - Securables and privilege inheritance

## Official Documentation

- [What are user-defined functions (UDFs)?](https://docs.databricks.com/aws/en/udf/)
- [Python scalar user-defined functions (UDFs)](https://docs.databricks.com/aws/en/udf/python)
- [pandas user-defined functions](https://docs.databricks.com/aws/en/udf/pandas)
- [pandas function APIs](https://docs.databricks.com/aws/en/pandas/pandas-function-apis)
- [SQL and Python user-defined functions (UDFs) in Unity Catalog](https://docs.databricks.com/aws/en/udf/unity-catalog)
- [Batch Python user-defined functions (UDFs) in Unity Catalog](https://docs.databricks.com/aws/en/udf/python-batch-udf)
- [Python user-defined table functions (UDTFs) in Unity Catalog](https://docs.databricks.com/aws/en/udf/udtf-unity-catalog)
- [Python user-defined table functions (UDTFs)](https://docs.databricks.com/aws/en/udf/python-udtf)
- [CREATE FUNCTION (SQL, Python, Scala, and Java)](https://docs.databricks.com/aws/en/sql/language-manual/sql-ref-syntax-ddl-create-sql-function)
- [Serverless compute limitations](https://docs.databricks.com/aws/en/compute/serverless/limitations)
- [Standard compute requirements and limitations](https://docs.databricks.com/aws/en/compute/standard-limitations)
- [Securable objects in Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/securable-objects)
- [Apache Spark: Arrow in PySpark (Arrow Python UDFs)](https://spark.apache.org/docs/latest/api/python/tutorial/sql/arrow_pandas.html)

---

**[← Previous: Python Project Structure and Dependencies](./01-python-project-structure-and-dependencies.md) | [↑ Back to Section](./README.md) | [Next: Incremental Processing →](./03-incremental-processing.md)**
