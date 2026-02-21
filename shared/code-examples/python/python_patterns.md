---
tags:
  - databricks
  - code-examples
  - python
---

# Python Patterns — Code Examples

Copy-paste reference for core Python patterns used in data engineering. For conceptual
explanations see [Python Essentials](../../fundamentals/python-essentials.md).

## Data Structures — Quick Reference

```python
# ── Lists ──────────────────────────────────────────────────────────────
items = [3, 1, 4, 1, 5, 9]
items.append(2)                        # add to end
items.extend([6, 5])                   # add multiple
items.insert(0, 0)                     # insert at index
items.remove(1)                        # remove first occurrence
items.sort()                           # in-place ascending
items.sort(reverse=True)               # in-place descending
top3 = sorted(items, key=abs)[:3]      # sorted copy by key function
items[1:4]                             # slice [start:stop]
items[::-1]                            # reversed copy

# ── Dicts ──────────────────────────────────────────────────────────────
cfg = {"env": "prod", "retries": 3}
cfg.get("timeout", 30)                 # safe access with default
cfg.setdefault("batch_size", 1000)     # set only if absent
{k: v for k, v in cfg.items() if v}   # filter out falsy values
base = {"env": "dev", "retries": 1}
merged = base | cfg                    # merge (right wins); Python 3.9+
base |= cfg                            # in-place merge

# ── Sets ───────────────────────────────────────────────────────────────
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}
a | b        # union        → {1, 2, 3, 4, 5, 6}
a & b        # intersection → {3, 4}
a - b        # difference   → {1, 2}
a ^ b        # symmetric difference → {1, 2, 5, 6}
3 in a       # membership test O(1)

# ── Tuples ─────────────────────────────────────────────────────────────
point = (10, 20)
x, y = point                           # unpacking
first, *rest = [1, 2, 3, 4]           # splat unpacking → first=1, rest=[2,3,4]
```

## Comprehensions

```python
numbers = range(10)

# List comprehension
squares = [x ** 2 for x in numbers]

# Filtered list comprehension
evens = [x for x in numbers if x % 2 == 0]

# Dict comprehension — build lookup from two lists
keys = ["id", "name", "env"]
vals = [42, "orders", "prod"]
lookup = {k: v for k, v in zip(keys, vals)}

# Dict comprehension — invert a mapping
col_map = {"first_name": "firstName", "last_name": "lastName"}
inverted = {v: k for k, v in col_map.items()}

# Set comprehension — unique file extensions
filenames = ["orders.csv", "events.json", "meta.csv"]
extensions = {f.rsplit(".", 1)[-1] for f in filenames}  # {"csv", "json"}

# Nested comprehension — flatten list of lists
batches = [[1, 2], [3, 4], [5]]
flat = [item for batch in batches for item in batch]  # [1, 2, 3, 4, 5]

# Generator expression — lazy, avoids building full list in memory
total_chars = sum(len(line) for line in open("data.txt"))
```

## Functions — Args, Kwargs, and Functools

```python
import functools
from typing import Any

# Mixed signature: positional, default, keyword-only (*), **kwargs
def load(table: str, limit: int = 100, *, dry_run: bool = False, **opts: Any) -> list:
    if dry_run:
        return []
    return fetch(table, limit, **opts)

load("orders", 500, dry_run=False, timeout=30)


# *args — extra positional args as a tuple
def tag(*labels: str) -> str:
    return "[" + ", ".join(labels) + "]"

tag("pipeline", "orders", "prod")   # "[pipeline, orders, prod]"


# **kwargs — extra keyword args as a dict
def create_table(name: str, **options: Any) -> None:
    print(f"CREATE TABLE {name} WITH {options}")

create_table("orders", format="delta", partitioned_by="date")


# Lambda with sorted
tables = ["silver_orders", "bronze_events", "gold_kpis"]
tables.sort(key=lambda t: t.split("_")[0])   # sort by medallion layer


# functools.partial — bake in fixed arguments
def write(df, mode: str, table: str) -> None:
    df.write.mode(mode).saveAsTable(table)

append = functools.partial(write, mode="append")
append(df, "catalog.schema.orders")


# functools.reduce — fold a sequence into a single value
from functools import reduce
product = reduce(lambda acc, x: acc * x, [1, 2, 3, 4, 5])   # 120
```

## Generators and Iterators

```python
import itertools
from typing import Generator

# Generator function — yields one item at a time (O(1) memory)
def read_pages(url: str) -> Generator[dict, None, None]:
    page = 1
    while True:
        data = fetch_page(url, page)
        if not data:
            break
        for record in data:
            yield record
        page += 1


# Generator expression
gen = (x ** 2 for x in range(1_000_000))  # no list built until iterated


# itertools.islice — take first N without exhausting the generator
import itertools
first_100 = list(itertools.islice(read_pages(url), 100))


# itertools.chain — flatten multiple iterables lazily
combined = itertools.chain(read_pages(url1), read_pages(url2))


# itertools.product — cartesian product (e.g., parameter grid)
envs = ["dev", "prod"]
tables = ["orders", "events"]
combos = list(itertools.product(envs, tables))
# [("dev", "orders"), ("dev", "events"), ("prod", "orders"), ("prod", "events")]
```

For a full paginated-API generator pipeline with composition and error handling, see
[Python for Production Data Engineering](../../interview-prep/09-python-code-quality.md) Question 1.

## Dataclasses

```python
from dataclasses import dataclass, field, asdict, astuple

@dataclass
class PipelineConfig:
    source_path: str
    target_table: str
    batch_size: int = 1_000
    tags: list[str] = field(default_factory=list)   # mutable default


# Post-init validation
@dataclass
class PartitionedConfig(PipelineConfig):
    partition_col: str = "date"

    def __post_init__(self) -> None:
        if not self.source_path.startswith("/"):
            raise ValueError(f"source_path must be absolute: {self.source_path}")


# Frozen dataclass — immutable, hashable (usable as dict key or set member)
@dataclass(frozen=True)
class TableRef:
    catalog: str
    schema: str
    table: str

    def fqn(self) -> str:
        return f"{self.catalog}.{self.schema}.{self.table}"


# Serialise to dict / tuple
cfg = PipelineConfig(source_path="/landing/orders", target_table="bronze.orders")
as_dict = asdict(cfg)       # {"source_path": "/landing/orders", ...}
as_tuple = astuple(cfg)     # ("/landing/orders", "bronze.orders", 1000, [])
```

## Context Managers

```python
import time
import logging
from contextlib import contextmanager

logger = logging.getLogger(__name__)


# Timer context manager — wrap any block to measure elapsed time
@contextmanager
def timer(label: str):
    start = time.perf_counter()
    try:
        yield
    finally:
        elapsed = time.perf_counter() - start
        logger.info("%s completed in %.3fs", label, elapsed)


with timer("ingest_orders"):
    ingest_orders()


# Class-based context manager
class TempDirectory:
    def __init__(self, prefix: str = "tmp_") -> None:
        self.prefix = prefix
        self.path = None

    def __enter__(self) -> str:
        import tempfile
        self.path = tempfile.mkdtemp(prefix=self.prefix)
        return self.path

    def __exit__(self, exc_type, exc_val, exc_tb) -> bool:
        import shutil
        if self.path:
            shutil.rmtree(self.path, ignore_errors=True)
        return False   # False = re-raise any exception


with TempDirectory("pipeline_") as tmp:
    process_files(tmp)
# Directory deleted automatically, even if process_files raises
```

For the JDBC connection context manager and `__exit__` returning `True` semantics, see
[Python for Production Data Engineering](../../interview-prep/09-python-code-quality.md) Question 3.

## String Manipulation

```python
import re

# Common str methods
filename = "  Orders_2025-01-15_v3.parquet  "
filename.strip()                              # remove surrounding whitespace
filename.strip().lower()                      # "orders_2025-01-15_v3.parquet"
"a,b,,c".split(",")                          # ["a", "b", "", "c"]
"a,b,,c".split(",", maxsplit=2)              # ["a", "b", ",c"]  — limit splits
"|".join(["col_a", "col_b", "col_c"])        # "col_a|col_b|col_c"
"orders_2025".replace("_", "-")             # "orders-2025"
"report".startswith("rep")                   # True
"report".endswith(".csv")                    # False
"report".find("port")                        # 2  (-1 if not found)

# f-strings
table, count = "orders", 1_234_567
f"Table: {table!r}"                          # "Table: 'orders'"
f"Rows: {count:,}"                           # "Rows: 1,234,567"
f"Rate: {0.987:.1%}"                         # "Rate: 98.7%"

# Regex — sanitize a column name for Delta
raw_col = "First Name (2025)"
safe_col = re.sub(r"[^a-z0-9_]", "_", raw_col.lower())  # "first_name__2025_"
safe_col = re.sub(r"_+", "_", safe_col).strip("_")       # "first_name_2025"

# Extract a date from a filename
match = re.search(r"\d{4}-\d{2}-\d{2}", "orders_2025-01-15.csv")
date_str = match.group() if match else None   # "2025-01-15"

# Find all version tags
versions = re.findall(r"v\d+", "schema_v2_patch_v3.json")   # ["v2", "v3"]

# Compile for reuse in loops
date_pattern = re.compile(r"\d{4}-\d{2}-\d{2}")
```

## Inheritance Patterns

```python
# Single inheritance with super().__init__()
class BaseWriter:
    def __init__(self, target: str) -> None:
        self.target = target

    def write(self, data: list) -> None:
        raise NotImplementedError


class DeltaWriter(BaseWriter):
    def __init__(self, target: str, mode: str = "append") -> None:
        super().__init__(target)    # initialise parent attributes first
        self.mode = mode

    def write(self, data: list) -> None:
        print(f"Writing {len(data)} rows to {self.target} (mode={self.mode})")


# isinstance / issubclass
w = DeltaWriter("catalog.schema.orders")
isinstance(w, BaseWriter)         # True
issubclass(DeltaWriter, BaseWriter)  # True


# Mixin — adds behaviour without being a full base class
class LoggingMixin:
    def log(self, msg: str) -> None:
        import logging
        logging.getLogger(self.__class__.__name__).info(msg)


class AuditedDeltaWriter(LoggingMixin, DeltaWriter):
    def write(self, data: list) -> None:
        self.log(f"Starting write to {self.target}")
        super().write(data)
        self.log("Write complete")


# Dataclass inheritance
from dataclasses import dataclass

@dataclass
class BaseConfig:
    source_path: str
    target_table: str

@dataclass
class StreamingConfig(BaseConfig):
    checkpoint_path: str = ""
    trigger_interval: str = "30 seconds"
```

## Error Handling Patterns

```python
import logging

logger = logging.getLogger(__name__)


# Custom exception hierarchy
class PipelineError(Exception):
    """Base for all pipeline exceptions."""

class ValidationError(PipelineError):
    def __init__(self, field: str, reason: str) -> None:
        self.field = field
        super().__init__(f"Validation failed on '{field}': {reason}")

class IngestError(PipelineError):
    """Raised when source data cannot be read."""


# Full try / except / else / finally skeleton
def run_pipeline(table: str) -> list:
    try:
        data = fetch(table)
    except IngestError as e:
        logger.error("Ingest failed for %s: %s", table, e)
        raise
    except Exception:
        logger.exception("Unexpected error during fetch")
        raise
    else:
        logger.info("Fetched %d records from %s", len(data), table)
        return data
    finally:
        cleanup_temp_files()    # always runs


# Exception chaining — preserve original cause
def safe_fetch(url: str) -> dict:
    try:
        return requests.get(url, timeout=5).json()
    except ConnectionError as e:
        raise IngestError(f"Cannot reach {url}") from e   # __cause__ preserved
```

## Working with JSON

```python
import json
from pathlib import Path
from typing import Any


def read_json_file(path: str | Path) -> dict[str, Any]:
    """Read a JSON file and return its contents as a dict or list."""
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def write_json_file(
    data: dict[str, Any] | list,
    path: str | Path,
    indent: int = 2,
) -> None:
    """Write data to a JSON file; creates parent directories if needed."""
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=indent, default=str)   # default=str handles dates


def flatten_nested_json(
    d: dict[str, Any],
    sep: str = ".",
    _prefix: str = "",
) -> dict[str, Any]:
    """Flatten nested dict: {"a": {"b": 1}} → {"a.b": 1}."""
    result: dict[str, Any] = {}
    for key, val in d.items():
        full_key = f"{_prefix}{sep}{key}" if _prefix else key
        if isinstance(val, dict):
            result.update(flatten_nested_json(val, sep, full_key))
        else:
            result[full_key] = val
    return result


# Usage
config = read_json_file("/config/pipeline.json")
write_json_file({"status": "ok", "rows": 1000}, "/output/result.json")
flat = flatten_nested_json({"user": {"id": 1, "name": "alice"}, "env": "prod"})
# {"user.id": 1, "user.name": "alice", "env": "prod"}
```

## Working with CSV

```python
import csv
from pathlib import Path
from typing import Any


def read_csv_to_dicts(path: str | Path, encoding: str = "utf-8") -> list[dict[str, str]]:
    """Read a CSV file; each row returned as a dict keyed by header."""
    with open(path, newline="", encoding=encoding) as f:
        return list(csv.DictReader(f))


def write_dicts_to_csv(
    records: list[dict[str, Any]],
    path: str | Path,
    fieldnames: list[str] | None = None,
) -> None:
    """Write a list of dicts to a CSV file; creates parent directories."""
    if not records:
        return
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    fields = fieldnames or list(records[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(records)


def load_all_csvs(directory: str | Path) -> list[dict[str, str]]:
    """Concatenate all *.csv files in a directory into a single list."""
    return [
        row
        for csv_path in sorted(Path(directory).glob("*.csv"))
        for row in read_csv_to_dicts(csv_path)
    ]


# Usage
rows = read_csv_to_dicts("/data/landing/orders.csv")
write_dicts_to_csv(rows, "/output/orders_clean.csv", fieldnames=["id", "amount", "date"])
all_rows = load_all_csvs("/data/landing/orders/")
```

## Datetime and Logging

```python
from datetime import datetime, timezone, timedelta

# Current UTC time (always use timezone-aware datetimes in pipelines)
now = datetime.now(timezone.utc)

# Format and parse
formatted = now.strftime("%Y-%m-%d %H:%M:%S")            # "2025-01-15 08:30:00"
parsed = datetime.strptime("2025-01-15", "%Y-%m-%d")

# Arithmetic
yesterday = now - timedelta(days=1)
next_week = now + timedelta(weeks=1)
delta = now - parsed.replace(tzinfo=timezone.utc)        # timedelta object
delta.days                                               # number of whole days

# ISO format (round-trips perfectly)
iso = now.isoformat()                   # "2025-01-15T08:30:00+00:00"
back = datetime.fromisoformat(iso)


# ── Logging ────────────────────────────────────────────────────────────
import logging

# Configure once at the entry point (notebook cell 1 or main.py)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
)

# Module-level logger — use __name__ so logs show the originating module
logger = logging.getLogger(__name__)

logger.debug("Skipped in INFO mode")
logger.info("Pipeline started for table: %s", table_name)   # lazy %-formatting
logger.warning("Row count %d below threshold %d", count, threshold)
logger.error("Write failed: %s", error_msg)
logger.exception("Unexpected error")   # auto-includes current traceback
```
