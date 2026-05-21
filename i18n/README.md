---
title: Translations Index
type: index
tags:
  - i18n
  - translations
status: published
---

# Translations Index

The English repo at the root of this project is the canonical source. This page tracks every translation — both the in-tree Thai translation and community forks for other languages.

For policy and contributor process, see [`TRANSLATING.md`](../TRANSLATING.md).

## In-tree translations

| Language | Path | Lead | Status |
| :--- | :--- | :--- | :--- |
| **English** (source) | repo root | maintainer | ✅ Complete |
| **ภาษาไทย (Thai)** | [`th/`](./th/README.md) | maintainer | 🔄 In progress — see [`th/STATUS.md`](./th/STATUS.md) |

The Thai translation lives in-tree because the repo maintainer reads Thai natively and can review Thai PRs for accuracy.

## Community translation forks

Other languages live in community-maintained forks. Each fork has its own maintainer who vouches for accuracy and keeps it in sync with the English upstream on their own cadence.

| Language | Fork URL | What's translated | Last upstream sync | Maintainer |
| :--- | :--- | :--- | :--- | :--- |
| _none yet — be the first!_ | | | | |

## How to register a community fork

When your fork has at least one full cert track translated and is publishable, [open a PR](../TRANSLATING.md#submitting-a-non-thai-community-fork-to-i18nreadmemd) adding a row to the table above.

## Why no Japanese / Korean / Chinese / Spanish / Portuguese in-tree?

See [TRANSLATING.md → Why Thai in-tree, others as forks?](../TRANSLATING.md#why-thai-in-tree-others-as-forks).

The short version: the maintainer can't review what they don't read, and in-tree N-language sync multiplies the maintenance load. Forks are sustainable; in-tree everything-language is not. If a non-Thai language gains a long-term maintainer willing to own it, we can promote that language in-tree.

## What this index does NOT do

- We don't translate ourselves (beyond Thai)
- We don't endorse the accuracy of community forks — every fork is the work of its translators
- We don't gate fork registration on quality — anyone can register a fork. Quality is the fork maintainer's responsibility.

---

**[← Back to repo root](../README.md)** | **[Translation policy →](../TRANSLATING.md)**
