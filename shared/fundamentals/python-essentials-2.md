---
tags:
  - databricks
  - python
  - fundamentals
aliases:
  - Python Essentials Part 2
---

# Python Essentials — Part 2

Continuation of [Python Essentials](python-essentials.md). This file covers exception handling,
file I/O helpers (CSV and JSON), the standard library, and common pitfalls for data engineers.

## Exceptions

### Exception Hierarchy

```text
BaseException
└── Exception
    ├── ValueError       — invalid value (wrong format, out of range)
    ├── TypeError        — wrong type passed
    ├── KeyError         — dict key missing
    ├── FileNotFoundError
    ├── IOError
    └── RuntimeError
```

### try / except / else / finally

Each clause has a distinct role: `except` handles specific errors; `else` runs only when no exception was raised; `finally` always runs for cleanup even if an exception propagates uncaught. [Docs](https://docs.python.org/3/tutorial/errors.html#handling-exceptions)

```python
try:
    result = risky_operation()
except (ValueError, KeyError) as e:
    # handle specific exceptions
    logger.error("Validation failed: %s", e)
    raise
except Exception as e:
    # catch-all — log and re-raise; never silently swallow
    logger.exception("Unexpected error")
    raise
else:
    # runs only if no exception was raised
    logger.info("Operation succeeded: %s", result)
finally:
    # always runs — use for cleanup (close connections, flush buffers)
    cleanup()
```

### Custom Exception Hierarchy

Custom exceptions give callers a precise type to catch. Building a hierarchy (base class → subclasses) lets orchestration code catch all pipeline errors at the base level while individual steps catch specific subtypes. [Docs](https://docs.python.org/3/tutorial/errors.html#user-defined-exceptions)

```python
class PipelineError(Exception):
    """Base for all pipeline exceptions."""

class ValidationError(PipelineError):
    """Raised when data quality checks fail."""
    def __init__(self, field: str, reason: str) -> None:
        self.field = field
        self.reason = reason
        super().__init__(f"Validation failed on '{field}': {reason}")

class IngestError(PipelineError):
    """Raised when source data cannot be read."""


# Chaining exceptions — preserve original cause
try:
    raw = fetch_from_api()
except ConnectionError as e:
    raise IngestError("API unreachable") from e    # original traceback preserved
```

Catch `PipelineError` at the orchestration layer to handle all pipeline-specific failures in one place.

## Working with CSV and JSON

### JSON Helper Functions

Python's `json` module reads and writes JSON — the standard format for pipeline configs, API responses, and metadata files. `pathlib.Path` handles cross-platform paths cleanly, including automatic creation of parent directories. [Docs](https://docs.python.org/3/library/json.html)

```python
import json
from pathlib import Path
from typing import Any


def read_json_file(path: str | Path) -> dict[str, Any]:
    """Read a JSON file and return its contents as a dict."""
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_json_file(
    data: dict[str, Any] | list,
    path: str | Path,
    indent: int = 2,
) -> None:
    """Write data to a JSON file with pretty-printing."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=indent, default=str)


def flatten_nested_json(
    d: dict[str, Any],
    sep: str = ".",
    _prefix: str = "",
) -> dict[str, Any]:
    """Flatten a nested dict to a single-level dict with compound keys."""
    result: dict[str, Any] = {}
    for key, val in d.items():
        full_key = f"{_prefix}{sep}{key}" if _prefix else key
        if isinstance(val, dict):
            result.update(flatten_nested_json(val, sep, full_key))
        else:
            result[full_key] = val
    return result


# Example
nested = {"user": {"id": 1, "name": "alice"}, "env": "prod"}
flatten_nested_json(nested)
# {"user.id": 1, "user.name": "alice", "env": "prod"}
```

### CSV Helper Functions

Python's `csv` module handles quoting and escaping that naive `str.split(",")` gets wrong. `csv.DictReader` maps each row to a dict keyed by the header row, making column access by name instead of index. [Docs](https://docs.python.org/3/library/csv.html)

```python
import csv
from pathlib import Path


def read_csv_to_dicts(path: str | Path, encoding: str = "utf-8") -> list[dict[str, str]]:
    """Read a CSV file and return each row as a dict keyed by header."""
    with open(path, newline="", encoding=encoding) as f:
        return list(csv.DictReader(f))


def write_dicts_to_csv(
    records: list[dict[str, Any]],
    path: str | Path,
    fieldnames: list[str] | None = None,
) -> None:
    """Write a list of dicts to a CSV file."""
    if not records:
        return
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    fields = fieldnames or list(records[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)


# Scan a directory and load all CSVs
def load_all_csvs(directory: str | Path) -> list[dict[str, str]]:
    """Concatenate all CSV files in a directory into a single list of dicts."""
    return [
        row
        for csv_path in sorted(Path(directory).glob("*.csv"))
        for row in read_csv_to_dicts(csv_path)
    ]
```

## Standard Library Extras

### Datetime

```python
from datetime import datetime, timezone, timedelta

now_utc = datetime.now(timezone.utc)
formatted = now_utc.strftime("%Y-%m-%d %H:%M:%S")   # "2025-01-15 08:30:00"
parsed = datetime.strptime("2025-01-15", "%Y-%m-%d")

yesterday = now_utc - timedelta(days=1)
week_ago = now_utc - timedelta(weeks=1)
```

Always use timezone-aware datetimes in pipelines to avoid ambiguous offsets at DST boundaries.

### Logging

Prefer `logging` over `print()` in pipelines — it adds timestamps, log levels, and module names automatically, and output can be redirected to files or monitoring systems without changing code. [Docs](https://docs.python.org/3/library/logging.html)

```python
import logging

# Configure once at entry point (notebook cell 1 or main.py)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)

# Use module-level logger everywhere else
logger = logging.getLogger(__name__)

logger.debug("Detailed diagnostic info")
logger.info("Pipeline started: %s", table_name)   # lazy formatting — no f-string
logger.warning("Row count below threshold: %d", count)
logger.error("Write failed for partition %s", partition)
logger.exception("Unexpected error")   # includes traceback automatically
```

### Environment Config

Use `os.environ` to read configuration from environment variables — the standard way to pass secrets and settings to pipelines without hardcoding them. Databricks jobs and notebooks expose secrets as environment variables via Databricks Secrets. [Docs](https://docs.python.org/3/library/os.html#os.environ)

```python
import os

env = os.environ.get("ENV", "dev")          # safe — returns default if key absent
token = os.environ["DATABRICKS_TOKEN"]      # raises KeyError if missing
```

## Common Pitfalls

| Pitfall | Problem | Fix |
| --- | --- | --- |
| Mutable default arg | `def f(data=[])` shares the same list across calls | Use `data=None` then `data = data or []` inside |
| `is` vs `==` | `is` checks identity, `==` checks value | Use `==` for value comparison; `is` only for `None` checks |
| Shallow copy | `b = a` and `b = a.copy()` still share nested objects | Use `copy.deepcopy(a)` for nested structures |
| Late binding closure | Lambda in loop captures variable by reference, not value | Use default arg: `lambda x=x: x * 2` |
| `None` comparison | `if value == None` works but is not idiomatic | Use `if value is None` |

## Practice Questions

### Question 1: Mutable Default Argument

**Question**: What does this function print on the second call?

```python
def add_item(item, data=[]):
    data.append(item)
    return data

print(add_item("a"))
print(add_item("b"))
```

A) `["a"]` then `["b"]`
B) `["a"]` then `["a", "b"]`
C) `["b"]` then `["a", "b"]`
D) `TypeError`

> [!success]- Answer
> **Correct Answer: B**
>
> The default `data=[]` is created once when the function is defined, not on each call.
> Both calls share the same list, so the second call appends `"b"` to the list that
> already contains `"a"`.
>
> Fix: use `data=None` and set `data = data or []` inside the function body.

---

### Question 2: Deduplication

**Question**: You need to deduplicate a list of partition IDs quickly. Which is the best Python type to use?

A) `list` — remove duplicates with a loop
B) `dict` — use IDs as keys
C) `set` — inherently stores only unique values
D) `tuple` — immutable so no duplicates can be added

> [!success]- Answer
> **Correct Answer: C**
>
> A `set` is the correct tool: it stores only unique values and membership testing
> (`x in s`) is O(1). Converting a list to a set is a one-liner: `unique_ids = set(ids)`.
> A `dict` works but is more verbose and intended for key-value pairs.

---

### Question 3: Inheritance and `super()`

**Question**: A `CsvReader` inherits from `BaseReader`. `CsvReader.__init__` calls `super().__init__(path)`. What does `super()` refer to?

A) The `object` base class
B) The `CsvReader` class itself
C) The next class in the MRO (`BaseReader`)
D) Any class that `CsvReader` inherits from, chosen at runtime

> [!success]- Answer
> **Correct Answer: C**
>
> `super()` follows the Method Resolution Order (MRO). For `CsvReader(BaseReader)`,
> the MRO is `[CsvReader, BaseReader, object]`, so `super()` inside `CsvReader`
> refers to `BaseReader`. This ensures `BaseReader.__init__` sets `self.path` before
> `CsvReader` adds its own attributes.

---

### Question 4: Exception Hierarchy

**Question**: Your code does `raise IngestError("API unreachable") from e`. What is the effect of the `from e` clause?

A) It replaces the original exception with the new one, discarding the original traceback
B) It attaches the original exception as `__cause__`, preserving both tracebacks
C) It suppresses the original exception silently
D) It re-raises the original exception without changes

> [!success]- Answer
> **Correct Answer: B**
>
> `raise X from Y` sets `X.__cause__ = Y`, creating an explicit exception chain.
> Both tracebacks appear in the output, clearly showing the original cause. This is
> preferred over bare `raise IngestError(...)` inside an `except` block because it
> preserves full diagnostic context.

---

### Question 5: JSON Helper Output

**Question**: What does `flatten_nested_json({"a": {"b": 1, "c": 2}, "d": 3})` return?

A) `{"a": {"b": 1, "c": 2}, "d": 3}`
B) `{"a.b": 1, "a.c": 2, "d": 3}`
C) `{"b": 1, "c": 2, "d": 3}`
D) `[{"a.b": 1}, {"a.c": 2}, {"d": 3}]`

> [!success]- Answer
> **Correct Answer: B**
>
> `flatten_nested_json` recursively descends into nested dicts and builds compound
> keys using the separator (default `"."`). `"a"` is a nested dict so its children
> become `"a.b"` and `"a.c"`. `"d"` is a scalar so it stays as-is.

## Referenced By

- [Data Engineer Associate](../../certifications/data-engineer-associate/README.md)
- [Data Engineer Professional](../../certifications/data-engineer-professional/README.md)
- [ML Associate](../../certifications/ml-associate/README.md)
- [ML Professional](../../certifications/ml-professional/README.md)
- [GenAI Engineer Associate](../../certifications/genai-engineer-associate/README.md)

## Related Topics

- [Python Essentials — Part 1](python-essentials.md) — data types, strings, control flow, functions, OOP
- [Spark Fundamentals](spark-fundamentals.md)
- [Python Patterns — Code Examples](../code-examples/python/python_patterns.md)
- [Python for Production Data Engineering](../interview-prep/09-python-code-quality.md) — generators, decorators, context managers, ABC, pytest

## Official Documentation

- [Python Data Structures Tutorial](https://docs.python.org/3/tutorial/datastructures.html)
- [Exceptions — Python Tutorial](https://docs.python.org/3/tutorial/errors.html)
- [Type Hints — PEP 484](https://peps.python.org/pep-0484/)
- [dataclasses module](https://docs.python.org/3/library/dataclasses.html)
- [pathlib module](https://docs.python.org/3/library/pathlib.html)
- [csv module](https://docs.python.org/3/library/csv.html)
- [json module](https://docs.python.org/3/library/json.html)
- [re module](https://docs.python.org/3/library/re.html)
- [logging module](https://docs.python.org/3/library/logging.html)
