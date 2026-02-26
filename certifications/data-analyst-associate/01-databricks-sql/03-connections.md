---
title: Connections & Integrations
type: study-material
tags:
  - connections
  - integrations
  - external-tools
  - jdbc-odbc
---

# Connections & Integrations

## Overview

Databricks SQL warehouses connect to external tools and applications via JDBC, ODBC, REST API, and native integrations. This enables analysts to use their preferred tools while leveraging Databricks compute.

## Connection Methods

```mermaid
flowchart TD
    subgraph Tools["Client Tools"]
        Tableau["Tableau"]
        PowerBI["Power BI"]
        Excel["Excel"]
        Python["Python"]
        R["R"]
        Custom["Custom Apps"]
    end

    subgraph Protocols["Connection Protocols"]
        ODBC["ODBC Driver"]
        JDBC["JDBC Driver"]
        REST["REST API"]
        Native["Native Connectors"]
    end

    subgraph Auth["Authentication"]
        PAT["Personal Access Token"]
        AAD["Azure AD"]
        SAML["SAML"]
    end

    Tools --> Protocols
    Protocols --> Auth
    Auth --> Warehouse["SQL Warehouse"]
```

## JDBC Connection

JDBC (Java Database Connectivity) is used by Java applications and many tools.

### Download JDBC Driver

```bash

# Available from Databricks downloads page
# File: SimbaDriverforDatabricksSpark.jar
# Version varies by SQL version

# Add to classpath

export CLASSPATH="$CLASSPATH:/path/to/SimbaDriverforDatabricksSpark.jar"
```

### Connection String (JDBC URL)

```text
jdbc:databricks://dbc-abc123def456ghi.cloud.databricks.com:443/;
  httpPath=/sql/1.0/warehouses/abc123def456;
  AuthType=PATToken;
  User=token;
  Password=dapi1234567890abcdefghijklmnop;
  SSL=1;
  ThriftTransport=2
```

### Components

| Component | Example | Purpose |
|-----------|---------|---------|
| **Host** | dbc-abc123def456ghi.cloud.databricks.com | Databricks workspace URL |
| **Port** | 443 | HTTPS port |
| **HTTP Path** | /sql/1.0/warehouses/abc123 | Warehouse identifier |
| **AuthType** | PATToken | Authentication method |
| **User** | token | Username (fixed for PAT) |
| **Password** | dapi... | Personal Access Token |

### Java Connection Example

```java
import java.sql.*;

public class DatabricksConnection {
    public static void main(String[] args) {
        String url = "jdbc:databricks://dbc-abc123.cloud.databricks.com:443/;" +
                    "httpPath=/sql/1.0/warehouses/abc123;" +
                    "AuthType=PATToken;" +
                    "User=token;" +
                    "Password=dapi123abc";

        try {
            Connection conn = DriverManager.getConnection(url);

            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(
                "SELECT * FROM sales WHERE amount > 1000"
            );

            while (rs.next()) {
                System.out.println(rs.getInt("id") + " - " +
                                 rs.getString("customer_name"));
            }

            rs.close();
            stmt.close();
            conn.close();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
```

## ODBC Connection

ODBC (Open Database Connectivity) is used by BI tools, Excel, and many legacy applications.

### Install ODBC Driver

```bash
# macOS: Using Homebrew

brew install simba-spark-odbc

# Linux: RPM package

rpm -i SimbaSparkODBC*.rpm

# Windows: MSI installer
# Download from Databricks downloads page
# Run installer: SimbaSparkODBC-x64-*.msi

```

### ODBC Configuration (odbcinst.ini / odbc.ini)

**odbcinst.ini** - Driver definition:

```ini
[Simba Spark ODBC Driver]
Description=Simba Spark ODBC Driver
Driver=/opt/simba/spark/lib/64/libsparkodbc64.so
Setup=/opt/simba/spark/lib/64/libsparkodbc64setup.so
```

**odbc.ini** - Connection definition:

```ini
[databricks-prod]
Driver=Simba Spark ODBC Driver
Hostname=dbc-abc123.cloud.databricks.com
Port=443
HTTPPath=/sql/1.0/warehouses/abc123def456
AuthType=PATToken
User=token
Password=dapi1234567890abcdefghijklmnop
SSL=1
ThriftTransport=2
```

### Test ODBC Connection

```bash
# On Linux/macOS

isql -v databricks-prod

# When successful, shows:
# +---------------------------------------+
# | Connected!                            |
# | Driver: Simba Spark ODBC Driver       |
# | DSN: databricks-prod                  |
# +---------------------------------------+

```

## REST API Connection

For programmatic access and custom integrations.

### Authentication Headers

```bash
# Personal Access Token (PAT) Authentication

curl -X GET https://dbc-abc123.cloud.databricks.com/api/2.1/warehouses \
  -H "Authorization: Bearer dapi1234567890abcdefghijklm"
```

### Execute SQL Query via REST API

```bash
# Execute a query

curl -X POST \
  https://dbc-abc123.cloud.databricks.com/api/2.0/sql/statements \
  -H "Authorization: Bearer dapi..." \
  -H "Content-Type: application/json" \
  -d '{
    "warehouse_id": "abc123def456",
    "statement": "SELECT COUNT(*) as cnt FROM sales",
    "parameters": []
  }'

# Response (execution started):

{
  "statement_id": "xyz789",
  "state": "RUNNING",
  "statementType": "SELECT"
}
```

### Query Results via REST API

```bash
# Get execution result

curl -X GET \
  https://dbc-abc123.cloud.databricks.com/api/2.0/sql/statements/xyz789/result/chunks \
  -H "Authorization: Bearer dapi..." \
  -H "Content-Type: application/json"

# Response:

{
  "chunks": [
    {
      "rowOffset": 0,
      "rowCount": 1,
      "data": [[1250000]]
    }
  ]
}
```

## Python Connection

### Using Databricks SQL Connector

```python
from databricks import sql

# Connect to warehouse

connection = sql.connect(
    server_hostname="dbc-abc123.cloud.databricks.com",
    http_path="/sql/1.0/warehouses/abc123def456",
    catalog="main",
    schema="sales",
    auth_type="pat",
    token="dapi1234567890abcdefghijklm"
)

# Execute query

cursor = connection.cursor()
cursor.execute("SELECT * FROM sales WHERE amount > ?", [1000])

# Fetch results

results = cursor.fetchall()
for row in results:
    print(row)

# With DataFrame

import pandas as pd

df = pd.read_sql_query(
    "SELECT * FROM sales WHERE region = ?",
    connection,
    params=["US"]
)
print(df.head())
```

### Using SQLAlchemy (ORM)

```python
from sqlalchemy import create_engine, text
import pandas as pd

# Create engine

engine = create_engine(
    "databricks://token:dapi123@dbc-abc123.cloud.databricks.com/"
    "main/sales?"
    "http_path=/sql/1.0/warehouses/abc123"
)

# Execute query

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT customer_id, SUM(amount) as total
        FROM sales
        WHERE year = 2024
        GROUP BY customer_id
        ORDER BY total DESC
        LIMIT 10
    """))

    # Parse as DataFrame
    df = pd.DataFrame(result.fetchall(),
                     columns=result.keys())
    print(df)
```

## Authentication Methods

### Personal Access Token (PAT)

Most common for API and tool connections.

**Creating a PAT:**

```text
Account Settings → User Settings → Personal Access Tokens → Generate New Token
```

**Format:**

```text
dapi1234567890abcdefghijklmnopqrstu
```

### OAuth 2.0 / Azure Active Directory

For enterprise environments with SSO.

```python
# OAuth setup (Microsoft Azure example)

oauth_config = {
    "client_id": "abc123def456",
    "client_secret": "xyz789secret",
    "authority": "https://login.microsoftonline.com/tenant-id",
}

connection = sql.connect(
    server_hostname="dbc-abc123.cloud.databricks.com",
    http_path="/sql/1.0/warehouses/abc123",
    auth_type="oauth",
    **oauth_config
)
```

### M2M (Machine-to-Machine)

For service accounts and automation.

```python
# Service principal authentication

connection = sql.connect(
    server_hostname="dbc-abc123.cloud.databricks.com",
    http_path="/sql/1.0/warehouses/abc123",
    auth_type="service_principal",
    tenant_id="tenant-id",
    client_id="client-id",
    client_secret="client-secret"
)
```

## BI Tool Integrations

### Tableau Connection

```yaml
Tableau Server/Desktop:
  Connection Type: Databricks Spark SQL
  Server: dbc-abc123.cloud.databricks.com
  HTTP Path: /sql/1.0/warehouses/abc123
  Port: 443
  Username: token
  Password: dapi...
  SSL: Enabled

  Catalog: main
  Schema: sales
```

### Power BI Connection

```text
Power BI Desktop:
  Data Source: Spark (from Database)
  Server: dbc-abc123.cloud.databricks.com
  HTTP Path: /sql/1.0/warehouses/abc123
  User: token
  Password: dapi...
  Advanced:
    - SSL Enabled: True
```

### Excel Connection (Excel 365)

```text
Get Data → From Database → Spark
```

## Connection Pooling & Performance

### Connection Pool Configuration

```python
# Using SQLAlchemy connection pooling

from sqlalchemy.pool import NullPool, QueuePool

# For high-concurrency scenarios

engine = create_engine(
    "databricks://token:dapi@host/catalog/schema?...",
    poolclass=QueuePool,
    pool_size=10,              # Base connections
    max_overflow=20,           # Additional overflow
    pool_recycle=3600,         # Recycle every hour
    pool_pre_ping=True         # Test before using
)
```

### Best Practices

| Practice | Benefit | Example |
|----------|---------|---------|
| **Connection pooling** | Reuse connections, reduce overhead | QueuePool(pool_size=10) |
| **Batch queries** | Reduce round trips | executemany() |
| **Result streaming** | Memory efficiency | fetchmany() instead of fetchall() |
| **Query timeouts** | Prevent hanging queries | timeout=300 seconds |
| **Error handling** | Graceful failures | try/except/finally |

### Connection Error Handling

```python
import time
from sqlalchemy.exc import OperationalError

def execute_with_retry(connection, query, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = connection.execute(text(query))
            return result
        except OperationalError as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"Retry in {wait_time}s: {str(e)}")
                time.sleep(wait_time)
            else:
                raise
```

## Firewall & Network Configuration

### IP Whitelisting

```yaml
Allow outbound connections:
  - Databricks workspace: dbc-*.cloud.databricks.com:443
  - AWS S3 (data lake): *.s3.amazonaws.com:443
  - Azure Storage: *.blob.core.windows.net:443

Ports required:
  - 443: HTTPS (primary)
  - 32000-32010: Driver communication (JDBC/ODBC)
```

## Use Cases

- **BI Tool Integration**: Connecting Tableau, Power BI, or Excel to a SQL warehouse via JDBC/ODBC so analysts can build reports using their preferred tools.
- **Programmatic Data Access**: Using the Python SQL connector or REST API to extract query results into downstream applications or automated pipelines.

## Common Issues & Errors

### JDBC/ODBC Connection Drops

**Scenario:** BI tool loses connection to SQL warehouse after idle period.
**Fix:** SQL warehouses auto-suspend after inactivity. Configure the BI tool to reconnect automatically, or increase the warehouse auto-stop timeout.

## Exam Tips

- PAT (Personal Access Token) is the most common authentication method for tool integrations
- HTTP Path identifies the specific SQL warehouse a connection uses
- Databricks SQL connections use port 443 (HTTPS)
- Know the difference between JDBC (Java apps, Tableau) and ODBC (Excel, Power BI, legacy tools)

## Key Takeaways

- **JDBC**: Java applications and tools like Tableau, Qlik
- **ODBC**: Legacy tools, Excel, Power BI, SQL Server
- **REST API**: Custom integrations, programmatic access
- **Authentication**: PAT (most common), OAuth, M2M, AAD
- **Connection string**: Contains host, path, auth, SSL settings
- **Catalog/Schema**: Fully qualified table path for multi-workspace setups
- **Connection pooling**: Reuse connections for performance
- **HTTP Path**: Warehouse-specific, format: `/sql/1.0/warehouses/id`

## Related Topics

- [Databricks Workspace](../../../shared/fundamentals/databricks-workspace.md) - Understanding the workspace environment for connections
- [Unity Catalog Basics](../../../shared/fundamentals/unity-catalog-basics.md) - How catalog namespaces affect connection paths
- [PySpark API Quick Reference](../../../shared/cheat-sheets/pyspark-api-quick-ref.md) - Python API patterns for Databricks connections

## Official Documentation

- [Databricks SQL Drivers](https://docs.databricks.com/integrations/jdbc-odbc-bi.html)
- [Partner Connect](https://docs.databricks.com/integrations/partner-connect/index.html)

---

**[← Previous: Query Editor & Execution](./02-query-editor.md) | [↑ Back to Databricks SQL](./README.md)**
