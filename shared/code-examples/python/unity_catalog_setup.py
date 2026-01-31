# Unity Catalog Setup - Python Examples
# Run these examples in a Databricks notebook
# Note: Many operations require admin privileges

# ============================================================
# 1. CREATE CATALOG AND SCHEMA
# ============================================================

# Create a catalog
spark.sql("CREATE CATALOG IF NOT EXISTS dev")

# Set a comment
spark.sql("COMMENT ON CATALOG dev IS 'Development environment catalog'")

# Create a schema within the catalog
spark.sql("CREATE SCHEMA IF NOT EXISTS dev.bronze")
spark.sql("CREATE SCHEMA IF NOT EXISTS dev.silver")
spark.sql("CREATE SCHEMA IF NOT EXISTS dev.gold")

# Set default catalog and schema for the session
spark.sql("USE CATALOG dev")
spark.sql("USE SCHEMA bronze")


# ============================================================
# 2. CREATE MANAGED TABLES
# ============================================================

# Managed table (Unity Catalog manages storage)
spark.sql("""
    CREATE TABLE IF NOT EXISTS dev.bronze.raw_events (
        event_id BIGINT,
        event_type STRING,
        user_id BIGINT,
        event_time TIMESTAMP,
        payload STRING
    )
    USING DELTA
    COMMENT 'Raw event data from source systems'
""")

# Create table from DataFrame
from pyspark.sql.types import StructType, StructField, StringType, IntegerType

schema = StructType([
    StructField("id", IntegerType(), False),
    StructField("name", StringType(), True),
    StructField("region", StringType(), True)
])

data = [(1, "Acme Corp", "US"), (2, "Global Inc", "EU")]
df = spark.createDataFrame(data, schema)

df.write.format("delta").saveAsTable("dev.bronze.customers")


# ============================================================
# 3. CREATE EXTERNAL TABLES
# ============================================================

# Create storage credential (admin operation)
spark.sql("""
    CREATE STORAGE CREDENTIAL IF NOT EXISTS my_s3_credential
    WITH (AWS_IAM_ROLE = 'arn:aws:iam::123456789012:role/unity-catalog-role')
    COMMENT 'S3 access for external data'
""")

# Create external location
spark.sql("""
    CREATE EXTERNAL LOCATION IF NOT EXISTS raw_data_location
    URL 's3://my-bucket/raw-data/'
    WITH (STORAGE CREDENTIAL my_s3_credential)
    COMMENT 'Landing zone for raw data'
""")

# Create external table
spark.sql("""
    CREATE TABLE IF NOT EXISTS dev.bronze.external_logs (
        log_id BIGINT,
        message STRING,
        level STRING,
        created_at TIMESTAMP
    )
    USING DELTA
    LOCATION 's3://my-bucket/raw-data/logs/'
""")


# ============================================================
# 4. GRANT PERMISSIONS
# ============================================================

# Grant catalog-level access
spark.sql("GRANT USE CATALOG ON CATALOG dev TO `data-analysts`")

# Grant schema-level access
spark.sql("GRANT USE SCHEMA ON SCHEMA dev.gold TO `data-analysts`")

# Grant table-level read access
spark.sql("GRANT SELECT ON SCHEMA dev.gold TO `data-analysts`")

# Grant write access to a specific table
spark.sql("GRANT MODIFY ON TABLE dev.silver.events TO `data-engineers`")

# Grant full schema access to engineers
spark.sql("GRANT ALL PRIVILEGES ON SCHEMA dev.bronze TO `data-engineers`")
spark.sql("GRANT ALL PRIVILEGES ON SCHEMA dev.silver TO `data-engineers`")

# View current grants
grants = spark.sql("SHOW GRANTS ON SCHEMA dev.gold")
grants.show(truncate=False)


# ============================================================
# 5. INSPECT METADATA
# ============================================================

# List catalogs
spark.sql("SHOW CATALOGS").show()

# List schemas in a catalog
spark.sql("SHOW SCHEMAS IN dev").show()

# List tables in a schema
spark.sql("SHOW TABLES IN dev.bronze").show()

# Describe table details
spark.sql("DESCRIBE EXTENDED dev.bronze.raw_events").show(truncate=False)

# View table properties
spark.sql("SHOW TBLPROPERTIES dev.bronze.raw_events").show(truncate=False)


# ============================================================
# 6. VIEWS
# ============================================================

# Standard view
spark.sql("""
    CREATE OR REPLACE VIEW dev.gold.active_customers AS
    SELECT id, name, region
    FROM dev.bronze.customers
    WHERE region IS NOT NULL
""")

# Dynamic view with row-level security
spark.sql("""
    CREATE OR REPLACE VIEW dev.gold.regional_customers AS
    SELECT *
    FROM dev.bronze.customers
    WHERE
        (is_account_group_member('us-analysts') AND region = 'US')
        OR (is_account_group_member('eu-analysts') AND region = 'EU')
        OR is_account_group_member('admin')
""")


# ============================================================
# 7. DATA LINEAGE (Querying via System Tables)
# ============================================================

# View table lineage (requires system tables access)
# lineage = spark.sql("""
#     SELECT *
#     FROM system.access.table_lineage
#     WHERE target_table_full_name = 'dev.gold.active_customers'
#     ORDER BY event_time DESC
#     LIMIT 10
# """)
# lineage.show(truncate=False)


# ============================================================
# 8. CLEANUP
# ============================================================

# Drop table (managed: deletes data; external: metadata only)
# spark.sql("DROP TABLE IF EXISTS dev.bronze.raw_events")

# Drop schema (must be empty or use CASCADE)
# spark.sql("DROP SCHEMA IF EXISTS dev.bronze CASCADE")

# Drop catalog (must be empty or use CASCADE)
# spark.sql("DROP CATALOG IF EXISTS dev CASCADE")
