---
tags: [cheat-sheet, sql, data-engineering, data-analyst]
---

# SQL Functions Cheat Sheet

## String Functions

| Function                       | Description           | Example                                    |
| ------------------------------ | --------------------- | ------------------------------------------ |
| `CONCAT(s1, s2, ...)`          | Concatenate strings   | `CONCAT('Hello', ' ', 'World')`            |
| `CONCAT_WS(sep, s1, s2, ...)`  | Concat with separator | `CONCAT_WS(',', 'a', 'b', 'c')`            |
| `LOWER(s)`                     | Lowercase             | `LOWER('HELLO')` → 'hello'                 |
| `UPPER(s)`                     | Uppercase             | `UPPER('hello')` → 'HELLO'                 |
| `TRIM(s)`                      | Remove whitespace     | `TRIM('  hello  ')`                        |
| `LTRIM(s)` / `RTRIM(s)`        | Left/right trim       | `LTRIM('  hello')`                         |
| `LENGTH(s)`                    | String length         | `LENGTH('hello')` → 5                      |
| `SUBSTRING(s, pos, len)`       | Extract substring     | `SUBSTRING('hello', 1, 3)` → 'hel'         |
| `REPLACE(s, old, new)`         | Replace string        | `REPLACE('hello', 'l', 'L')`               |
| `SPLIT(s, pattern)`            | Split to array        | `SPLIT('a,b,c', ',')`                      |
| `REGEXP_REPLACE(s, pat, rep)`  | Regex replace         | `REGEXP_REPLACE('a1b2', '[0-9]', '')`      |
| `REGEXP_EXTRACT(s, pat, idx)`  | Regex extract         | `REGEXP_EXTRACT('abc123', '([0-9]+)', 1)`  |

## Date & Time Functions

| Function                                  | Description        | Example                                     |
| ----------------------------------------- | ------------------ | ------------------------------------------- |
| `CURRENT_DATE()`                          | Today's date       | `2024-01-15`                                |
| `CURRENT_TIMESTAMP()`                     | Now                | `2024-01-15 10:30:00`                       |
| `DATE(ts)`                                | Extract date       | `DATE('2024-01-15 10:30:00')`               |
| `YEAR(d)` / `MONTH(d)` / `DAY(d)`         | Extract parts      | `YEAR('2024-01-15')` → 2024                 |
| `HOUR(ts)` / `MINUTE(ts)` / `SECOND(ts)`  | Time parts         | `HOUR('10:30:45')` → 10                     |
| `DATE_ADD(d, n)`                          | Add days           | `DATE_ADD('2024-01-15', 7)`                 |
| `DATE_SUB(d, n)`                          | Subtract days      | `DATE_SUB('2024-01-15', 7)`                 |
| `DATEDIFF(d1, d2)`                        | Days between       | `DATEDIFF('2024-01-15', '2024-01-01')`      |
| `DATE_TRUNC(fmt, ts)`                     | Truncate to unit   | `DATE_TRUNC('month', ts)`                   |
| `DATE_FORMAT(d, fmt)`                     | Format date        | `DATE_FORMAT(d, 'yyyy-MM-dd')`              |
| `TO_DATE(s, fmt)`                         | Parse string       | `TO_DATE('15/01/2024', 'dd/MM/yyyy')`      |
| `TO_TIMESTAMP(s, fmt)`                    | Parse timestamp    | `TO_TIMESTAMP('2024-01-15', 'yyyy-MM-dd')` |
| `UNIX_TIMESTAMP()`                        | Current epoch      | Seconds since 1970                          |
| `FROM_UNIXTIME(epoch)`                    | Epoch to timestamp | `FROM_UNIXTIME(1705320000)`                 |

## Numeric Functions

| Function                       | Description       | Example                                     |
| ------------------------------ | ----------------- | ------------------------------------------- |
| `ROUND(n, d)`                  | Round to decimals | `ROUND(3.14159, 2)` → 3.14                  |
| `FLOOR(n)`                     | Round down        | `FLOOR(3.7)` → 3                            |
| `CEIL(n)` / `CEILING(n)`       | Round up          | `CEIL(3.2)` → 4                             |
| `ABS(n)`                       | Absolute value    | `ABS(-5)` → 5                               |
| `MOD(n, d)`                    | Modulo            | `MOD(10, 3)` → 1                            |
| `POWER(n, p)`                  | Exponent          | `POWER(2, 3)` → 8                           |
| `SQRT(n)`                      | Square root       | `SQRT(16)` → 4                              |
| `LOG(n)` / `LN(n)`             | Natural log       | `LOG(2.718)` → 1                            |
| `LOG10(n)`                     | Log base 10       | `LOG10(100)` → 2                            |

## Aggregate Functions

| Function                      | Description      | Example                                     |
| ----------------------------- | ---------------- | ------------------------------------------- |
| `COUNT(*)`                    | Row count        | `COUNT(*)`                                  |
| `COUNT(col)`                  | Non-null count   | `COUNT(email)`                              |
| `COUNT(DISTINCT col)`         | Unique count     | `COUNT(DISTINCT user_id)`                   |
| `SUM(col)`                    | Sum              | `SUM(amount)`                               |
| `AVG(col)`                    | Average          | `AVG(price)`                                |
| `MIN(col)` / `MAX(col)`       | Min/Max          | `MIN(date)`, `MAX(amount)`                  |
| `FIRST(col)` / `LAST(col)`    | First/Last value | `FIRST(name)`                               |
| `COLLECT_LIST(col)`           | Collect to array | `COLLECT_LIST(item)`                        |
| `COLLECT_SET(col)`            | Collect unique   | `COLLECT_SET(category)`                     |
| `ARRAY_AGG(col)`              | Array aggregate  | `ARRAY_AGG(value)`                          |

## Window Functions

```sql
-- Syntax
function() OVER (
  PARTITION BY col1
  ORDER BY col2
  ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)
```

| Function              | Description           |
| --------------------- | --------------------- |
| `ROW_NUMBER()`        | Sequential row number |
| `RANK()`              | Rank with gaps        |
| `DENSE_RANK()`        | Rank without gaps     |
| `NTILE(n)`            | Distribute into n buckets |
| `LAG(col, n)`         | Previous row value    |
| `LEAD(col, n)`        | Next row value        |
| `FIRST_VALUE(col)`    | First in window       |
| `LAST_VALUE(col)`     | Last in window        |
| `SUM(col) OVER (...)` | Running sum           |

```sql
-- Example: Running total
SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date) as running_total
FROM sales;

-- Example: Rank within partition
SELECT
  department,
  employee,
  salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;
```

## Array Functions

| Function                       | Description       | Example                                     |
| ------------------------------ | ----------------- | ------------------------------------------- |
| `ARRAY(e1, e2, ...)`           | Create array      | `ARRAY(1, 2, 3)`                            |
| `SIZE(arr)`                    | Array length      | `SIZE(ARRAY(1,2,3))` → 3                    |
| `EXPLODE(arr)`                 | Array to rows     | `SELECT EXPLODE(arr)`                       |
| `ARRAY_CONTAINS(arr, v)`       | Check contains    | `ARRAY_CONTAINS(arr, 5)`                    |
| `ARRAY_DISTINCT(arr)`          | Remove duplicates | `ARRAY_DISTINCT(arr)`                       |
| `ARRAY_UNION(a1, a2)`          | Merge arrays      | `ARRAY_UNION(a1, a2)`                       |
| `ARRAY_INTERSECT(a1, a2)`      | Common elements   | `ARRAY_INTERSECT(a1, a2)`                   |
| `FLATTEN(arr)`                 | Flatten nested    | `FLATTEN(nested_arr)`                       |
| `TRANSFORM(arr, x -> expr)`    | Transform elements| `TRANSFORM(arr, x -> x * 2)`                |
| `FILTER(arr, x -> cond)`       | Filter elements   | `FILTER(arr, x -> x > 0)`                   |

## JSON Functions

| Function                       | Description       | Example                                     |
| ------------------------------ | ----------------- | ------------------------------------------- |
| `GET_JSON_OBJECT(json, path)`  | Extract by path   | `GET_JSON_OBJECT(j, '$.name')`              |
| `JSON_TUPLE(json, k1, k2)`     | Multiple keys     | `JSON_TUPLE(j, 'a', 'b')`                   |
| `FROM_JSON(json, schema)`      | Parse to struct   | `FROM_JSON(j, 'a INT, b STRING')`           |
| `TO_JSON(struct)`              | Struct to JSON    | `TO_JSON(named_struct(...))`                |
| `SCHEMA_OF_JSON(json)`         | Infer schema      | `SCHEMA_OF_JSON('[{"a":1}]')`               |

```sql
-- Parse JSON column
SELECT FROM_JSON(json_col, 'struct<name:string, age:int>') as parsed
FROM table;

-- Access nested JSON
SELECT json_col:name, json_col:address:city
FROM table;
```

## Conditional Functions

| Function                       | Description       | Example                                     |
| ------------------------------ | ----------------- | ------------------------------------------- |
| `CASE WHEN ... THEN ... END`   | Conditional       | See below                                   |
| `IF(cond, true_val, false_val)`| Inline if         | `IF(x > 0, 'pos', 'neg')`                   |
| `COALESCE(v1, v2, ...)`        | First non-null    | `COALESCE(col, 'default')`                  |
| `NULLIF(v1, v2)`               | Null if equal     | `NULLIF(x, 0)`                              |
| `NVL(v1, v2)`                  | Replace null      | `NVL(col, 0)`                               |
| `NVL2(v, not_null, is_null)`   | Null branch       | `NVL2(col, 'yes', 'no')`                    |

```sql
-- CASE expression
SELECT
  CASE
    WHEN amount < 100 THEN 'small'
    WHEN amount < 1000 THEN 'medium'
    ELSE 'large'
  END as size_category
FROM orders;
```

## Type Conversion

| Function             | Description     |
| -------------------- | --------------- |
| `CAST(v AS type)`    | Type conversion |
| `v::type`            | Shorthand cast  |
| `TRY_CAST(v AS type)`| Cast or null    |

```sql
CAST('123' AS INT)
CAST(date_col AS STRING)
'123'::INT
TRY_CAST('abc' AS INT)  -- Returns NULL
```
