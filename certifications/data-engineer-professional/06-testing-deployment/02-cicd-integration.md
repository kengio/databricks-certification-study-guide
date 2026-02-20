---
title: CI/CD Integration — Part 1 (Platforms & Configuration)
type: topic
tags:
  - data-engineering
  - cicd
  - devops
  - automation
status: published
---

# CI/CD Integration — Part 1: Platforms & Configuration

Continuous Integration and Continuous Deployment (CI/CD) practices are essential for maintaining quality and reliability in data engineering projects. This part covers authentication and CI/CD platform configuration; for testing strategies, secret management, and deployment patterns see Part 2.

## Overview

```mermaid
flowchart TB
    subgraph Development["Development"]
        Code[Code Changes]
        PR[Pull Request]
    end

    subgraph CI["Continuous Integration"]
        Lint[Lint & Format]
        Validate[Bundle Validate]
        UnitTest[Unit Tests]
        Build[Build Artifacts]
    end

    subgraph CD["Continuous Deployment"]
        DeployDev[Deploy Dev]
        IntTest[Integration Tests]
        DeployStaging[Deploy Staging]
        DeployProd[Deploy Production]
    end

    Code --> PR
    PR --> Lint
    Lint --> Validate
    Validate --> UnitTest
    UnitTest --> Build
    Build --> DeployDev
    DeployDev --> IntTest
    IntTest --> DeployStaging
    DeployStaging --> DeployProd
```text

## Authentication Methods

### Service Principal Authentication

```bash
# Environment variables for service principal
export DATABRICKS_HOST="https://adb-1234567890.1.azuredatabricks.net"
export DATABRICKS_CLIENT_ID="00000000-0000-0000-0000-000000000000"
export DATABRICKS_CLIENT_SECRET="your-client-secret"

# Or using OAuth token
export DATABRICKS_HOST="https://adb-1234567890.1.azuredatabricks.net"
export DATABRICKS_TOKEN="your-oauth-token"
```text

### Azure Service Principal Setup

```bash
# Create service principal
az ad sp create-for-rbac --name "databricks-cicd-sp" --role Contributor \
    --scopes /subscriptions/{subscription-id}/resourceGroups/{resource-group}

# Grant Databricks workspace access
# In Databricks Admin Console:
# 1. Add service principal to workspace
# 2. Grant appropriate permissions (workspace admin or specific ACLs)
```text

### AWS Authentication

```bash
# Using instance profile (recommended for EC2/EKS)
export DATABRICKS_HOST="https://my-workspace.cloud.databricks.com"
# Instance profile attached to runner handles auth

# Using access keys (less recommended)
export DATABRICKS_HOST="https://my-workspace.cloud.databricks.com"
export DATABRICKS_TOKEN="dapi..."
```text

## GitHub Actions

### Complete Workflow Example

```yaml
# .github/workflows/databricks-cicd.yml
name: Databricks CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  PYTHON_VERSION: '3.10'

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: ${{ env.PYTHON_VERSION }}

      - name: Install dependencies
        run: |
          pip install -r requirements-dev.txt
          pip install ruff pytest

      - name: Lint with ruff
        run: ruff check src/

      - name: Run unit tests
        run: pytest tests/unit/ -v --junitxml=test-results.xml

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results.xml

  validate-bundle:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4

      - name: Setup Databricks CLI
        uses: databricks/setup-cli@main

      - name: Validate bundle
        run: databricks bundle validate
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}

  deploy-dev:
    runs-on: ubuntu-latest
    needs: validate-bundle
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    environment: development
    steps:
      - uses: actions/checkout@v4

      - uses: databricks/setup-cli@main

      - name: Deploy to development
        run: databricks bundle deploy -t dev
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}

  deploy-staging:
    runs-on: ubuntu-latest
    needs: validate-bundle
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - uses: databricks/setup-cli@main

      - name: Deploy to staging
        run: databricks bundle deploy -t staging
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}

      - name: Run integration tests
        run: |
          databricks bundle run integration_test_job -t staging
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4

      - uses: databricks/setup-cli@main

      - name: Deploy to production
        run: databricks bundle deploy -t prod
        env:
          DATABRICKS_HOST: ${{ secrets.PROD_DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.PROD_DATABRICKS_TOKEN }}
```text

### Reusable Workflow

```yaml
# .github/workflows/deploy-template.yml
name: Deploy Template

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
      target:
        required: true
        type: string
    secrets:
      DATABRICKS_HOST:
        required: true
      DATABRICKS_TOKEN:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4

      - uses: databricks/setup-cli@main

      - name: Deploy bundle
        run: databricks bundle deploy -t ${{ inputs.target }}
        env:
          DATABRICKS_HOST: ${{ secrets.DATABRICKS_HOST }}
          DATABRICKS_TOKEN: ${{ secrets.DATABRICKS_TOKEN }}
```text

```yaml
# .github/workflows/main.yml - Using the template
name: Main Pipeline

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    uses: ./.github/workflows/deploy-template.yml
    with:
      environment: staging
      target: staging
    secrets:
      DATABRICKS_HOST: ${{ secrets.STAGING_HOST }}
      DATABRICKS_TOKEN: ${{ secrets.STAGING_TOKEN }}

  deploy-prod:
    needs: deploy-staging
    uses: ./.github/workflows/deploy-template.yml
    with:
      environment: production
      target: prod
    secrets:
      DATABRICKS_HOST: ${{ secrets.PROD_HOST }}
      DATABRICKS_TOKEN: ${{ secrets.PROD_TOKEN }}
```text

## Azure DevOps

### Pipeline Configuration

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main
      - develop

pr:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  pythonVersion: '3.10'

stages:
  - stage: Build
    displayName: 'Build and Test'
    jobs:
      - job: BuildAndTest
        steps:
          - task: UsePythonVersion@0
            inputs:
              versionSpec: '$(pythonVersion)'

          - script: |
              pip install -r requirements-dev.txt
              pip install pytest ruff
            displayName: 'Install dependencies'

          - script: ruff check src/
            displayName: 'Lint code'

          - script: pytest tests/unit/ --junitxml=test-results.xml
            displayName: 'Run unit tests'

          - task: PublishTestResults@2
            inputs:
              testResultsFiles: 'test-results.xml'
              testRunTitle: 'Unit Tests'

  - stage: ValidateBundle
    displayName: 'Validate Bundle'
    dependsOn: Build
    jobs:
      - job: Validate
        steps:
          - script: |
              curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
            displayName: 'Install Databricks CLI'

          - script: databricks bundle validate
            displayName: 'Validate bundle'
            env:
              DATABRICKS_HOST: $(DATABRICKS_HOST)
              DATABRICKS_TOKEN: $(DATABRICKS_TOKEN)

  - stage: DeployDev
    displayName: 'Deploy to Development'
    dependsOn: ValidateBundle
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    jobs:
      - deployment: DeployDev
        environment: development
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self

                - script: |
                    curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
                  displayName: 'Install Databricks CLI'

                - script: databricks bundle deploy -t dev
                  displayName: 'Deploy to dev'
                  env:
                    DATABRICKS_HOST: $(DEV_DATABRICKS_HOST)
                    DATABRICKS_TOKEN: $(DEV_DATABRICKS_TOKEN)

  - stage: DeployStaging
    displayName: 'Deploy to Staging'
    dependsOn: ValidateBundle
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
    jobs:
      - deployment: DeployStaging
        environment: staging
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self

                - script: |
                    curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
                  displayName: 'Install Databricks CLI'

                - script: databricks bundle deploy -t staging
                  displayName: 'Deploy to staging'
                  env:
                    DATABRICKS_HOST: $(STAGING_DATABRICKS_HOST)
                    DATABRICKS_TOKEN: $(STAGING_DATABRICKS_TOKEN)

  - stage: DeployProd
    displayName: 'Deploy to Production'
    dependsOn: DeployStaging
    condition: succeeded()
    jobs:
      - deployment: DeployProd
        environment: production
        strategy:
          runOnce:
            deploy:
              steps:
                - checkout: self

                - script: |
                    curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
                  displayName: 'Install Databricks CLI'

                - script: databricks bundle deploy -t prod
                  displayName: 'Deploy to production'
                  env:
                    DATABRICKS_HOST: $(PROD_DATABRICKS_HOST)
                    DATABRICKS_TOKEN: $(PROD_DATABRICKS_TOKEN)
```text

### Variable Groups

```yaml
# Reference variable groups in pipeline
variables:
  - group: databricks-dev-credentials
  - group: databricks-prod-credentials

# Variable group contents (configured in Azure DevOps):
# databricks-dev-credentials:
#   - DEV_DATABRICKS_HOST
#   - DEV_DATABRICKS_TOKEN
```text

## GitLab CI/CD

### Pipeline Configuration

```yaml
# .gitlab-ci.yml
stages:
  - test
  - validate
  - deploy-dev
  - deploy-staging
  - deploy-prod

variables:
  PYTHON_VERSION: "3.10"

.databricks_setup: &databricks_setup
  before_script:
    - curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
    - export PATH="$HOME/.databricks:$PATH"

test:
  stage: test
  image: python:${PYTHON_VERSION}
  script:
    - pip install -r requirements-dev.txt
    - ruff check src/
    - pytest tests/unit/ --junitxml=report.xml
  artifacts:
    reports:
      junit: report.xml

validate:
  stage: validate
  image: python:${PYTHON_VERSION}
  <<: *databricks_setup
  script:
    - databricks bundle validate
  variables:
    DATABRICKS_HOST: $DATABRICKS_HOST
    DATABRICKS_TOKEN: $DATABRICKS_TOKEN

deploy-dev:
  stage: deploy-dev
  image: python:${PYTHON_VERSION}
  <<: *databricks_setup
  script:
    - databricks bundle deploy -t dev
  environment:
    name: development
  only:
    - develop
  variables:
    DATABRICKS_HOST: $DEV_DATABRICKS_HOST
    DATABRICKS_TOKEN: $DEV_DATABRICKS_TOKEN

deploy-staging:
  stage: deploy-staging
  image: python:${PYTHON_VERSION}
  <<: *databricks_setup
  script:
    - databricks bundle deploy -t staging
    - databricks bundle run integration_tests -t staging
  environment:
    name: staging
  only:
    - main
  variables:
    DATABRICKS_HOST: $STAGING_DATABRICKS_HOST
    DATABRICKS_TOKEN: $STAGING_DATABRICKS_TOKEN

deploy-prod:
  stage: deploy-prod
  image: python:${PYTHON_VERSION}
  <<: *databricks_setup
  script:
    - databricks bundle deploy -t prod
  environment:
    name: production
  when: manual
  only:
    - main
  variables:
    DATABRICKS_HOST: $PROD_DATABRICKS_HOST
    DATABRICKS_TOKEN: $PROD_DATABRICKS_TOKEN
```text

## Jenkins

### Jenkinsfile

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        PYTHON_VERSION = '3.10'
    }

    stages {
        stage('Setup') {
            steps {
                sh '''
                    curl -fsSL https://raw.githubusercontent.com/databricks/setup-cli/main/install.sh | sh
                    pip install -r requirements-dev.txt
                '''
            }
        }

        stage('Test') {
            steps {
                sh 'ruff check src/'
                sh 'pytest tests/unit/ --junitxml=test-results.xml'
            }
            post {
                always {
                    junit 'test-results.xml'
                }
            }
        }

        stage('Validate') {
            steps {
                withCredentials([
                    string(credentialsId: 'databricks-host', variable: 'DATABRICKS_HOST'),
                    string(credentialsId: 'databricks-token', variable: 'DATABRICKS_TOKEN')
                ]) {
                    sh 'databricks bundle validate'
                }
            }
        }

        stage('Deploy Staging') {
            when {
                branch 'main'
            }
            steps {
                withCredentials([
                    string(credentialsId: 'staging-host', variable: 'DATABRICKS_HOST'),
                    string(credentialsId: 'staging-token', variable: 'DATABRICKS_TOKEN')
                ]) {
                    sh 'databricks bundle deploy -t staging'
                }
            }
        }

        stage('Deploy Production') {
            when {
                branch 'main'
            }
            input {
                message "Deploy to production?"
                ok "Deploy"
            }
            steps {
                withCredentials([
                    string(credentialsId: 'prod-host', variable: 'DATABRICKS_HOST'),
                    string(credentialsId: 'prod-token', variable: 'DATABRICKS_TOKEN')
                ]) {
                    sh 'databricks bundle deploy -t prod'
                }
            }
        }
    }

    post {
        failure {
            mail to: 'team@company.com',
                 subject: "Pipeline Failed: ${currentBuild.fullDisplayName}",
                 body: "Check console output at ${env.BUILD_URL}"
        }
    }
}
```text

> **Continue reading:** [Part 2 — Testing, Secrets & Monitoring](./08-cicd-integration-part2.md)
