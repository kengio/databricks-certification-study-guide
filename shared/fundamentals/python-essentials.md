---
tags:
  - databricks
  - python
  - fundamentals
aliases:
  - Python Essentials
  - Python Essentials Part 1
---

# Python Essentials — Part 1

Core Python language mechanics for data engineers: collection types, strings, control flow,
functions, type hints, and object-oriented programming. For exceptions, file I/O, the standard
library, common pitfalls, and practice questions, see
[Python Essentials — Part 2](python-essentials-2.md).

## Data Types and Structures

Python's built-in collection types each serve a different purpose.

| Type | Mutable | Ordered | Duplicates | Typical DE Use |
| --- | --- | --- | --- | --- |
| `list` | Yes | Yes | Yes | Ordered sequences, batches of records |
| `dict` | Yes | Yes (3.7+) | Keys: No | Configs, schemas, row representation |
| `tuple` | No | Yes | Yes | Immutable pairs, function return values |
| `set` | Yes | No | No | Deduplication, membership testing |
| `frozenset` | No | No | No | Dict key, immutable set |

### Lists

A `list` is Python's most versatile ordered, mutable sequence — use it for batches of records, result sets, and anywhere insertion order matters. [Docs](https://docs.python.org/3/tutorial/datastructures.html#more-on-lists)

```python
# Create and modify
items = [1, 2, 3]
items.append(4)          # [1, 2, 3, 4]
items.extend([5, 6])     # [1, 2, 3, 4, 5, 6]
items.insert(0, 0)       # [0, 1, 2, 3, 4, 5, 6]
items.remove(3)          # removes first occurrence of 3
popped = items.pop()     # removes and returns last element

# Slicing: list[start:stop:step]
first_three = items[:3]
every_other = items[::2]
reversed_list = items[::-1]

# Sort in-place vs sorted() returning a new list
items.sort()                        # mutates in place
sorted_copy = sorted(items, reverse=True)
```

### Dicts

A `dict` maps unique keys to values and preserves insertion order (Python 3.7+). In data engineering, dicts are the standard container for pipeline configs, JSON records, and schema definitions. [Docs](https://docs.python.org/3/tutorial/datastructures.html#dictionaries)

```python
config = {"env": "prod", "retries": 3, "timeout": 30}

# Safe access
env = config.get("env", "dev")          # default if key missing
config.setdefault("batch_size", 1000)   # set only if key absent

# Merge dicts (Python 3.9+)
overrides = {"retries": 5}
merged = config | overrides             # new dict
config |= overrides                     # in-place merge
```

### Sets

A `set` stores unique, unordered values with O(1) membership testing — the fastest built-in way to deduplicate a sequence or check whether an element exists. [Docs](https://docs.python.org/3/tutorial/datastructures.html#sets)

```python
ids = {1, 2, 3, 4}
new_ids = {3, 4, 5, 6}

unique = ids | new_ids        # union:        {1, 2, 3, 4, 5, 6}
common = ids & new_ids        # intersection: {3, 4}
only_ids = ids - new_ids      # difference:   {1, 2}
```

## String Manipulation

Strings are immutable sequences — every method returns a new string rather than modifying in place. [Docs](https://docs.python.org/3/library/stdtypes.html#string-methods)

### Common `str` Methods

```python
path = "  /data/landing/orders_2025-01.csv  "

path.strip()                      # remove leading/trailing whitespace
path.lstrip("/")                  # strip leading slashes
"orders_2025-01".replace("-", "_")   # "orders_2025_01"
"a,b,c".split(",")               # ["a", "b", "c"]
",".join(["a", "b", "c"])        # "a,b,c"
"orders".startswith("ord")       # True
"orders".upper()                  # "ORDERS"
"ORDERS".lower()                  # "orders"
"orders".find("der")             # 1 (index), -1 if not found
```

### f-Strings and Formatting

f-strings (PEP 498) embed expressions directly in string literals — they are faster and more readable than `.format()` or `%` formatting and support format specifiers for padding, precision, and number formatting. [Docs](https://docs.python.org/3/reference/lexical_analysis.html#formatted-string-literals)

```python
table = "orders"
partition = "2025-01"

# f-string (preferred)
msg = f"Loading {table} partition {partition}"

# Padding and precision
row_count = 1_234_567
print(f"Rows loaded: {row_count:,}")      # "Rows loaded: 1,234,567"
print(f"Ratio: {0.9876:.2%}")             # "Ratio: 98.76%"
```

### Regex with `re`

Regular expressions match and extract text patterns. The `re` module provides `search` (find anywhere in string), `match` (match at start), `findall` (return all matches), `sub` (replace), and `compile` (pre-compile a pattern for reuse). [Docs](https://docs.python.org/3/library/re.html)

```python
import re

filename = "orders_2025-01-15_v3.parquet"

# Search: returns a Match object or None
match = re.search(r"\d{4}-\d{2}-\d{2}", filename)
if match:
    date_str = match.group()    # "2025-01-15"

# Find all matches
versions = re.findall(r"v\d+", filename)   # ["v3"]

# Substitute
clean = re.sub(r"[^a-z0-9_]", "_", "My Table Name!".lower())
# "my_table_name_"

# Compile for reuse in loops
date_pattern = re.compile(r"\d{4}-\d{2}-\d{2}")
dates = [date_pattern.search(f).group() for f in filenames if date_pattern.search(f)]
```

**DE use cases:** parse partition dates from filenames, sanitize column names before writing to Delta, extract schema version from file paths.

## Control Flow

```python
# if / elif / else
status = "active"
if status == "active":
    process()
elif status == "pending":
    queue()
else:
    skip()

# Ternary expression
label = "pass" if score >= 70 else "fail"

# match / case (Python 3.10+) — useful for config dispatch
match env:
    case "prod":
        db = "prod_catalog"
    case "staging":
        db = "staging_catalog"
    case _:
        db = "dev_catalog"
```

**Truthiness:** empty collections (`[]`, `{}`, `set()`, `""`) and `None` evaluate to `False`. Prefer `if items:` over `if len(items) > 0:`.

**Short-circuit evaluation:** `a and b` stops at `a` if `a` is falsy. Use for safe defaults: `value = config.get("key") or "default"`.

## Loops and Iteration

```python
records = [{"id": 1}, {"id": 2}, {"id": 3}]

# enumerate — index + value
for i, record in enumerate(records, start=1):
    print(f"Row {i}: {record}")

# zip — pair two sequences
keys = ["id", "name", "env"]
vals = [42, "orders", "prod"]
config = dict(zip(keys, vals))   # {"id": 42, "name": "orders", "env": "prod"}

# while with break
page = 1
while True:
    data = fetch_page(page)
    if not data:
        break
    process(data)
    page += 1
```

### Comprehensions

```python
# List comprehension
squares = [x ** 2 for x in range(10)]

# Filtered comprehension
evens = [x for x in range(20) if x % 2 == 0]

# Dict comprehension — invert a mapping
col_map = {"first_name": "firstName", "last_name": "lastName"}
inverted = {v: k for k, v in col_map.items()}

# Set comprehension — unique extensions
extensions = {f.split(".")[-1] for f in filenames}

# Generator expression — lazy, O(1) memory
total = sum(len(line) for line in open("large.txt"))
```

Prefer comprehensions for simple transforms. Use explicit `for` loops when the body has side effects or spans multiple lines.

## Functions

A function encapsulates reusable logic under a name. Python functions support default arguments, keyword-only arguments (after a bare `*`), `*args` for extra positional inputs, and `**kwargs` for extra keyword inputs — making them flexible for both simple helpers and variadic pipeline APIs. [Docs](https://docs.python.org/3/tutorial/controlflow.html#defining-functions)

```python
from typing import Any

def load_table(
    table_name: str,
    limit: int = 100,
    *,                        # forces keyword-only after this
    dry_run: bool = False,
) -> list[dict[str, Any]]:
    """Load records from a table. Returns empty list on dry run."""
    if dry_run:
        return []
    return fetch(table_name, limit)


# *args collects extra positional args into a tuple
def log_event(event: str, *tags: str) -> None:
    print(f"[{', '.join(tags)}] {event}")

log_event("start", "pipeline", "orders")


# **kwargs collects extra keyword args into a dict
def create_table(name: str, **options: Any) -> None:
    print(f"Creating {name} with options: {options}")

create_table("orders", format="delta", partitioned_by="date")
```

### Lambda and functools

`lambda` creates an anonymous, single-expression function — use it only for short callbacks like a sort key. `functools` provides higher-order tools: `partial` bakes in fixed arguments to create specialised callables; `reduce` folds a sequence into a single accumulated value. [Docs](https://docs.python.org/3/library/functools.html)

```python
import functools

# Lambda: use only for simple, single-expression callbacks
tables = ["silver_orders", "bronze_events", "gold_metrics"]
tables.sort(key=lambda t: t.split("_")[0])   # sort by layer prefix

# functools.partial — fix arguments for reuse
def write_table(df, mode, table):
    df.write.mode(mode).saveAsTable(table)

append_table = functools.partial(write_table, mode="append")
append_table(df, "catalog.schema.orders")
```

## Type Hints

Type hints document intent, improve IDE support, and catch errors early in pipelines.

```python
from __future__ import annotations   # enables forward references in all Python 3.7+

from typing import Any, Optional, Union, Callable
from pathlib import Path

def read_config(path: Path) -> dict[str, Any]:
    ...

def transform(
    data: list[dict[str, Any]],
    filter_fn: Optional[Callable[[dict], bool]] = None,
) -> list[dict[str, Any]]:
    ...

# Union type (Python 3.10+ shorthand)
def parse_value(v: str | int | None) -> str:
    return str(v) if v is not None else ""
```

Type hints are **not enforced at runtime**. Use `mypy` or `pyright` for static checking. Databricks supports type-annotated PySpark UDFs via `@udf` with return type annotation.

## Object-Oriented Programming

OOP organises code into classes — blueprints that bundle data (attributes) and behaviour (methods). Use classes when multiple operations share state or when you need to model domain objects like data sources, configs, or pipeline readers. [Docs](https://docs.python.org/3/tutorial/classes.html)

### Classes and Dunder Methods

Dunder (double-underscore) methods hook into Python's built-in operations. `__init__` runs at construction; `__repr__` controls how the object appears in the REPL and logs; `__eq__` controls `==` comparison.

```python
class DataSource:
    def __init__(self, name: str, path: str) -> None:
        self.name = name
        self.path = path

    def __repr__(self) -> str:
        return f"DataSource(name={self.name!r}, path={self.path!r})"

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, DataSource):
            return NotImplemented
        return self.name == other.name and self.path == other.path
```

### Inheritance

Inheritance lets a child class reuse and extend a parent's attributes and methods. Always call `super().__init__()` first so parent attributes are set before child-specific ones are added. [Docs](https://docs.python.org/3/tutorial/classes.html#inheritance)

```python
class BaseReader:
    def __init__(self, path: str) -> None:
        self.path = path

    def validate(self) -> bool:
        return bool(self.path)

    def read(self) -> list[dict]:
        raise NotImplementedError


class JsonReader(BaseReader):
    def __init__(self, path: str, encoding: str = "utf-8") -> None:
        super().__init__(path)      # call parent __init__
        self.encoding = encoding

    def read(self) -> list[dict]:
        import json
        with open(self.path, encoding=self.encoding) as f:
            return json.load(f)


# isinstance and issubclass
reader = JsonReader("/data/records.json")
isinstance(reader, BaseReader)      # True — checks instance against class or hierarchy
issubclass(JsonReader, BaseReader)  # True — checks class relationships
```

**Mixin pattern:** Mixins add behaviour to a class without being a standalone base.

```python
class LoggingMixin:
    def log(self, msg: str) -> None:
        import logging
        logging.getLogger(self.__class__.__name__).info(msg)


class CsvReader(LoggingMixin, BaseReader):
    def read(self) -> list[dict]:
        self.log(f"Reading {self.path}")
        import csv
        with open(self.path) as f:
            return list(csv.DictReader(f))
```

### Dataclasses

`@dataclass` auto-generates `__init__`, `__repr__`, and `__eq__` from type-annotated fields — eliminating boilerplate for config and value objects. Use `frozen=True` for immutable instances and `field(default_factory=...)` for mutable defaults. [Docs](https://docs.python.org/3/library/dataclasses.html)

```python
from dataclasses import dataclass, field, asdict

@dataclass
class PipelineConfig:
    source_path: str
    target_table: str
    batch_size: int = 1_000
    tags: list[str] = field(default_factory=list)   # mutable default

@dataclass(frozen=True)          # immutable — safe as dict key or set member
class TableRef:
    catalog: str
    schema: str
    table: str

    def fqn(self) -> str:
        return f"{self.catalog}.{self.schema}.{self.table}"


# Dataclass inheritance
@dataclass
class StreamingConfig(PipelineConfig):
    checkpoint_path: str = ""
    trigger_interval: str = "30 seconds"


config = PipelineConfig(source_path="/landing/orders", target_table="bronze.orders")
asdict(config)   # convert to plain dict for JSON serialisation
```

For abstract base classes and the template method pattern, see [Python for Production Data Engineering](../interview-prep/09-python-code-quality.md) Question 4.

## Referenced By

- [Data Engineer Associate](../../certifications/data-engineer-associate/README.md)
- [Data Engineer Professional](../../certifications/data-engineer-professional/README.md)
- [ML Associate](../../certifications/ml-associate/README.md)
- [ML Professional](../../certifications/ml-professional/README.md)
- [GenAI Engineer Associate](../../certifications/genai-engineer-associate/README.md)

---

> [!info] Continue to Part 2
>
> This file covers data types through OOP. **[Python Essentials — Part 2](python-essentials-2.md)**
> covers exceptions, CSV/JSON helpers, the standard library, common pitfalls, and practice questions.
