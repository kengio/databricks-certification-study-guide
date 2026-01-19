# Databricks Platform Architecture

Databricks uses a split architecture model that separates the management layer (control plane) from the compute and storage layer (data plane). Understanding this architecture is essential for security, networking, and compliance decisions.

## Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONTROL PLANE                                        │
│                    (Databricks Cloud Account)                                │
│                                                                              │
│   ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│   │  Web UI   │ │  REST     │ │  Cluster  │ │   Job     │ │  Unity    │   │
│   │           │ │  APIs     │ │  Manager  │ │ Scheduler │ │  Catalog  │   │
│   └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS (TLS 1.2+)
                                    │ Secure Cluster Connectivity
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA PLANE                                         │
│                    (Customer Cloud Account)                                  │
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │                    VPC / VNet / VPC                                │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐               │    │
│   │  │  Clusters   │  │    SQL      │  │   Model     │               │    │
│   │  │  (Driver +  │  │  Warehouses │  │  Serving    │               │    │
│   │  │   Workers)  │  │             │  │  Endpoints  │               │    │
│   │  └─────────────┘  └─────────────┘  └─────────────┘               │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────┐    │
│   │              Cloud Storage (S3 / ADLS / GCS)                      │    │
│   │              Your data stays in YOUR cloud account                │    │
│   └───────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Control Plane

The control plane is the management layer hosted and managed by Databricks in their cloud account.

### What It Does

- Hosts the web application (UI)
- Manages authentication and authorization
- Orchestrates cluster lifecycle
- Schedules and monitors jobs
- Stores workspace metadata
- Provides REST APIs

### Control Plane Components

| Component | Description |
|-----------|-------------|
| **Web Application** | Browser-based UI for notebooks, jobs, clusters |
| **REST APIs** | Programmatic access to all Databricks features |
| **Cluster Manager** | Provisions and terminates compute resources |
| **Job Scheduler** | Manages workflow execution and scheduling |
| **Unity Catalog** | Metadata store for data governance (account-level) |
| **Identity Management** | SSO, SCIM provisioning, authentication |
| **Audit Logging** | Tracks user activities and API calls |

### What the Control Plane Stores

| Stored | Not Stored |
|--------|------------|
| Notebook code | Customer data |
| Job definitions | Query results |
| Cluster configurations | Processed data |
| User permissions | Cloud credentials (encrypted) |
| Workspace metadata | Raw data files |

## Data Plane

The data plane is where your compute resources run and your data is processed. It can be deployed in two models.

### Classic Data Plane (Customer-Managed)

In the classic deployment, compute resources run in your cloud account.

```text
Your Cloud Account (AWS/Azure/GCP)
├── VPC/VNet (created by Databricks or customer)
│   ├── Subnets (public/private)
│   ├── Security Groups / NSGs
│   └── NAT Gateway (for outbound)
├── Compute Resources
│   ├── All-Purpose Clusters
│   ├── Job Clusters
│   ├── SQL Warehouses (Classic/Pro)
│   └── Instance Pools
└── Storage
    ├── DBFS root storage
    └── Customer data lakes
```

**Benefits:**

- Data never leaves your cloud account
- Full network control
- Use existing security policies
- Customer-managed encryption keys

### Serverless Data Plane (Databricks-Managed)

In serverless deployment, Databricks manages the compute infrastructure.

```text
Databricks Cloud Account
├── Serverless SQL Warehouses
├── Serverless Compute (notebooks/jobs)
├── Model Serving Endpoints
└── Vector Search (preview)

Your Cloud Account
└── Cloud Storage (data still in your account)
```

**Benefits:**

- No infrastructure management
- Instant startup times
- Automatic scaling
- Pay only for usage

### Classic vs Serverless Comparison

| Aspect | Classic | Serverless |
|--------|---------|------------|
| Compute Location | Your cloud account | Databricks cloud |
| Startup Time | Minutes | Seconds |
| Network Control | Full control | Managed |
| Data Processing | Your VPC/VNet | Databricks VPC |
| Data Storage | Your account | Your account |
| Scaling | Manual/Autoscale | Automatic |
| Management | You manage | Databricks manages |

## Control Plane and Data Plane Interaction

### Communication Flow

```text
┌────────────────────┐                    ┌────────────────────┐
│   Control Plane    │                    │    Data Plane      │
├────────────────────┤                    ├────────────────────┤
│                    │ ──── HTTPS ────▶   │                    │
│  1. User submits   │     (Port 443)     │  2. Cluster starts │
│     job via UI     │                    │                    │
│                    │ ◀─── Status ────   │  3. Runs code      │
│  4. Shows results  │      Updates       │                    │
│                    │                    │  (Data stays here) │
└────────────────────┘                    └────────────────────┘
```

### Secure Cluster Connectivity (SCC)

With SCC enabled, clusters have no public IP addresses. All communication initiates from the data plane to the control plane.

```text
Control Plane ◀──── Outbound only ──── Data Plane (No public IPs)
```

**Benefits:**

- Reduced attack surface
- No inbound firewall rules needed
- Clusters not directly accessible from internet

### Data Flow

Your actual data never passes through the control plane:

```text
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Source    │ ──▶  │   Cluster   │ ──▶  │   Target    │
│   (S3/ADLS) │      │ (Data Plane)│      │   (S3/ADLS) │
└─────────────┘      └─────────────┘      └─────────────┘
                           │
                     Data never goes
                     to Control Plane
```

## Cloud Provider Deployments

### AWS

```text
AWS Account
├── VPC (Databricks-managed or customer-managed)
│   ├── Private Subnets (clusters)
│   ├── Public Subnets (NAT gateway)
│   └── Security Groups
├── S3 Buckets
│   ├── DBFS root (workspace storage)
│   └── Unity Catalog managed storage
├── IAM Roles
│   └── Cross-account role for Databricks
└── Optional: PrivateLink endpoints
```

### Azure

```text
Azure Subscription
├── Resource Group
├── VNet (Databricks-managed or injected)
│   ├── Private Subnet (clusters)
│   ├── Public Subnet (control plane connectivity)
│   └── NSGs
├── Storage Accounts
│   ├── DBFS root (Azure Blob)
│   └── Unity Catalog (ADLS Gen2)
├── Service Principal or Managed Identity
└── Optional: Private Link
```

### GCP

```text
GCP Project
├── VPC (Databricks-managed or customer-managed)
│   ├── Subnets
│   └── Firewall rules
├── GCS Buckets
│   ├── DBFS root
│   └── Unity Catalog managed storage
├── Service Account
└── Optional: Private Google Access
```

### Cloud Comparison

| Feature | AWS | Azure | GCP |
|---------|-----|-------|-----|
| Network | VPC | VNet | VPC |
| Private Connectivity | PrivateLink | Private Link | Private Google Access |
| Storage | S3 | ADLS Gen2 / Blob | GCS |
| Identity | IAM Roles | Service Principal / Managed Identity | Service Account |
| Encryption | KMS | Key Vault | Cloud KMS |

## Network Architecture

### Network Connectivity Options

```text
┌──────────────────────────────────────────────────────────────────┐
│                     Connectivity Options                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Default (Public)          2. Private Link                    │
│  ┌───────────┐                ┌───────────┐                      │
│  │ Control   │◀── Internet ──▶│ Control   │◀── Private ─┐       │
│  │ Plane     │                │ Plane     │    Endpoint  │       │
│  └───────────┘                └───────────┘              │       │
│       │                                                   │       │
│       ▼                                                   │       │
│  ┌───────────┐                ┌───────────┐              │       │
│  │ Data      │                │ Data      │◀─────────────┘       │
│  │ Plane     │                │ Plane     │                      │
│  └───────────┘                └───────────┘                      │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Private Link / Private Endpoints

Connect to Databricks without traversing the public internet.

| Type | Purpose |
|------|---------|
| **Front-end Private Link** | Web UI and REST API access |
| **Back-end Private Link** | Control plane to data plane communication |

### IP Access Lists

Restrict which IP addresses can access the workspace.

```text
Allow List:
├── 10.0.0.0/8      (Corporate network)
├── 192.168.1.0/24  (VPN range)
└── 203.0.113.50    (Specific IP)
```

### VPC/VNet Peering

Connect your data plane to other resources in your cloud.

```text
┌─────────────────┐          ┌─────────────────┐
│  Databricks     │          │  Your Other     │
│  VPC/VNet       │◀─ Peer ─▶│  VPC/VNet       │
│  (Data Plane)   │          │  (Databases,    │
│                 │          │   Services)     │
└─────────────────┘          └─────────────────┘
```

## Security Implications

### Encryption

| Layer | Method |
|-------|--------|
| **In Transit** | TLS 1.2+ for all communication |
| **At Rest (Control Plane)** | Databricks-managed encryption |
| **At Rest (Data Plane)** | Cloud provider encryption (S3/ADLS/GCS) |
| **Customer-Managed Keys** | Optional: Use your own KMS keys |

### Data Residency

| Component | Location |
|-----------|----------|
| Notebook code | Control plane (Databricks region) |
| Job definitions | Control plane |
| Actual data | Your cloud account (your chosen region) |
| Query results | Data plane (your account) |

### Network Security Best Practices

1. **Enable Secure Cluster Connectivity** - No public IPs on clusters
2. **Use Private Link** - Eliminate public internet exposure
3. **Configure IP Access Lists** - Restrict workspace access
4. **Use Customer-Managed VPC/VNet** - Full network control
5. **Enable Audit Logging** - Track all access and changes

## Use Cases

| Use Case | Architecture Consideration |
|----------|---------------------------|
| **Regulated Industries** | Private Link, customer-managed keys, audit logging |
| **Data Sovereignty** | Deploy data plane in required region, verify control plane location |
| **Low Latency** | Co-locate data plane with data sources |
| **Cost Optimization** | Serverless for variable workloads |
| **Security-First** | Customer-managed VPC, SCC, Private Link |
| **Rapid Development** | Serverless for fast iteration |

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Cluster fails to start | Subnet exhaustion | Use larger CIDR ranges |
| Cannot reach external service | Missing NAT gateway or firewall rules | Configure egress routes |
| Slow cluster startup | Network configuration issues | Check VPC/VNet peering, DNS |
| API timeout | IP access list blocking | Add your IP to allow list |
| Cannot access Unity Catalog | Network isolation | Configure Private Link for UC |
| Cross-region latency | Data plane far from storage | Co-locate in same region |

## Related Topics

- [Databricks Workspace](databricks-workspace.md) - UI and workspace features
- [Unity Catalog Basics](unity-catalog-basics.md) - Data governance architecture
- [Security & Governance](../../certifications/data-engineer-professional/04-security-governance/README.md) - Advanced security topics

## Official Documentation

- [Databricks Architecture Overview](https://docs.databricks.com/getting-started/overview.html)
- [Secure Cluster Connectivity](https://docs.databricks.com/security/network/classic/secure-cluster-connectivity.html)
- [Private Link](https://docs.databricks.com/security/network/classic/privatelink.html)
- [AWS Deployment](https://docs.databricks.com/administration-guide/cloud-configurations/aws/index.html)
- [Azure Deployment](https://docs.databricks.com/administration-guide/cloud-configurations/azure/index.html)
- [GCP Deployment](https://docs.databricks.com/administration-guide/cloud-configurations/gcp/index.html)
