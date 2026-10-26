---
title: Ownership, Fine-Grained Access & PII
type: study-material
tags:
  - data-analyst-associate
  - unity-catalog
  - ownership
  - row-filters
  - column-masks
  - pii
  - volumes
---

# Ownership, Fine-Grained Access & PII

## Overview

Section 9 of the October 2025 exam guide asks you to "use Unity Catalog roles and sharing settings to ensure workspace objects are secure", to "understand how the 3-level namespace (Catalog / Schema / Tables or Volumes) works in the Unity Catalog", and to "apply best practices for storage and management to ensure data security, including table ownership and PII protection".

> [!abstract]
>
> - Admin roles: account admin and workspace admin (required), metastore admin (optional)
> - Every object has an **owner** with all privileges; `MANAGE` delegates control without ownership
> - Namespace: `catalog.schema.table|view|volume|function`; volume files at `/Volumes/<catalog>/<schema>/<volume>/...`
> - PII: tag it, mask it (column masks), filter it (row filters), and never rely on hiding columns in a tool

> [!tip] What the Exam Tests
>
> - Which role or privilege allows an action
> - Transferring ownership to a group
> - Choosing between row filters, column masks, ABAC policies, and dynamic views

---

## Unity Catalog Roles

| Role | Scope | Required? |
| :--- | :--- | :--- |
| Account admin | Account: metastores, workspaces, admin roles | Yes |
| Workspace admin | One workspace: users, groups, workspace objects | Yes |
| Metastore admin | One metastore: data access, ownership, top-level objects | **Optional** (needed for some tasks, such as changing ownership of objects you don't own) |
| Object owner | One securable and its children | Every object has one |

Databricks recommends assigning the metastore admin role to a **group**.

## Ownership and MANAGE

- Owners have **all privileges** on the object, including granting privileges to others.
- Transfer ownership in Catalog Explorer (**Owner** field) or with SQL:

```sql
ALTER TABLE main.finance.ledger OWNER TO `finance-owners`;
ALTER SCHEMA main.finance OWNER TO `finance-owners`;
```

- Who can transfer: the current owner, a metastore admin, the owner of the parent container, or a user with `MANAGE`.
- `MANAGE` lets a user manage privileges, transfer ownership, and delete an object without owning it. `ALL PRIVILEGES` does **not** include `MANAGE`.
- Best practice: production tables owned by **groups**, not individuals, so access does not break when someone leaves.

## Privileges in Brief

| Privilege | Allows |
| :--- | :--- |
| `BROWSE` | See objects and metadata, view lineage, request access — without reading data |
| `USE CATALOG`, `USE SCHEMA` | Needed on the parents of anything you use |
| `SELECT` | Read a table or view |
| `MODIFY` | Insert, update, delete |
| `CREATE TABLE` | Create tables in a schema (grant at schema level) |
| `READ VOLUME`, `WRITE VOLUME` | Read or write files in a volume |
| `APPLY TAG` | Tag an object |

Privileges on a catalog or schema apply to all **current and future** children. Unity Catalog has **no `DENY` statement** (it exists only for the legacy `hive_metastore`); remove access with `REVOKE`.

## The Three-Level Namespace

```text
metastore (one per region)
└── catalog            main
    └── schema         main.sales
        ├── table      main.sales.orders
        ├── view       main.sales.orders_v
        ├── volume     main.sales.landing   →  /Volumes/main/sales/landing/2026/10/orders.csv
        └── function   main.sales.mask_email
```

- **Volumes** govern non-tabular files of any format. Managed volumes use Databricks-managed storage; external volumes add governance to existing cloud paths (dropping one leaves the data).
- `USE CATALOG main; USE SCHEMA sales;` lets you write `orders` instead of `main.sales.orders`.

## Row Filters, Column Masks, ABAC, and Dynamic Views

```sql
-- Row filter: reps see only their region
CREATE FUNCTION main.sales.region_filter(region STRING) RETURNS BOOLEAN
RETURN is_account_group_member('sales_admins') OR is_account_group_member(CONCAT('sales_', region));

ALTER TABLE main.sales.orders SET ROW FILTER main.sales.region_filter ON (region);

-- Column mask: only HR admins see full SSNs
CREATE FUNCTION main.hr.mask_ssn(ssn STRING) RETURNS STRING
RETURN CASE WHEN is_account_group_member('hr_admins') THEN ssn ELSE '***-**-****' END;

ALTER TABLE main.hr.employees ALTER COLUMN ssn SET MASK main.hr.mask_ssn;
```

| Tool | Use for |
| :--- | :--- |
| **Row filter / column mask** | Table-specific rules, enforced on every query of that table (one mask per column) |
| **ABAC policy** | One rule applied across many tables based on governed tags (Databricks' recommendation for consistent rules at scale) |
| **Dynamic view** | Sharing a curated or transformed version of the data |

- Use `is_account_group_member()` in Unity Catalog; `is_member()` checks only workspace groups and is for Hive metastore compatibility.
- You cannot attach row filters or column masks to a view, and time travel is not supported on tables that have them.
- When you use a dynamic view, do not grant users access to the underlying tables.

## PII Protection Checklist

1. **Find and tag** PII columns (for example `'pii' = 'ssn'`) — see [Discovering, Tagging & Cleaning Data](../06-managing-data/02-discovering-tagging-and-cleaning-data.md).
2. **Mask** them with column masks or ABAC policies; **filter** rows with row filters.
3. **Grant to groups**, with the least privilege needed; prefer views or masked tables for broad audiences.
4. **Own with groups** and review grants (`SHOW GRANTS`).
5. **Keep files governed** in volumes or external locations, not in ungoverned storage paths.
6. **Do not rely on tools to hide data**: hiding a column in a dashboard or Genie Agent only removes it from that tool.

## Use Cases

- **Regional access**: A row filter shows each sales team only its region in every dashboard and Genie Agent.
- **HR data**: A column mask shows SSNs only to HR admins.
- **Leaver process**: Ownership of production tables moves to a group.

## Common Issues & Errors

### Owner left the company

**Scenario:** Nobody can change grants on a table owned by a former employee.
**Fix:** A metastore admin (or the parent's owner, or a user with `MANAGE`) transfers ownership to a group.

### Mask has no effect for a user

**Scenario:** A user still sees raw values.
**Fix:** Check the function's group logic and that the user is not in the privileged account group; remember `is_member()` does not see account groups.

## Exam Tips

- Metastore admin is the optional role
- Owner = all privileges; `MANAGE` = manage without owning
- Volumes are the third level for files: `/Volumes/catalog/schema/volume/...`
- Row filter = which rows; column mask = which values; no `DENY` in Unity Catalog

## Key Takeaways

- Secure data with privileges, ownership, and fine-grained controls in Unity Catalog
- Secure workspace objects with ACLs and careful sharing settings
- PII: tag → mask/filter → grant to groups → review

## Related Topics

- [Access Control & Security](./01-access-control.md)
- [Sharing & Collaboration](../02-creating-dashboards-and-visualizations/04-sharing-collaboration.md) - Dashboard sharing settings
- [Unity Catalog](../05-understanding-databricks-platform/01-unity-catalog.md)

## Official Documentation

- [Admin privileges in Unity Catalog](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/admin-privileges)
- [Manage Unity Catalog object ownership](https://docs.databricks.com/aws/en/data-governance/unity-catalog/manage-privileges/ownership)
- [Row filters and column masks](https://docs.databricks.com/aws/en/data-governance/unity-catalog/filters-and-masks/)
- [What are Unity Catalog volumes?](https://docs.databricks.com/aws/en/volumes/)

---

**[← Previous: Access Control & Security](./01-access-control.md) | [↑ Back to Section](./README.md)**
