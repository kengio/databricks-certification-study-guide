---
title: Renewal Guide
type: reference
tags:
  - databricks
  - reference
  - renewal
  - recertification
aliases:
  - Renewal Guide
  - Recertification Guide
  - Cert Renewal
status: published
---

# Databricks Certification Renewal Guide

A practical playbook for renewing a Databricks certification before its 2-year validity window expires.

> [!important]
> Databricks updates the recertification program periodically (cadence, exam length, cost, eligibility). Treat the per-cert table in this guide as a snapshot of the current public program; always verify the live state on the official [Databricks Academy](https://www.databricks.com/learn/certification) and your individual **[credential portal](https://credentials.databricks.com/)** before booking.

## Why renewal matters

- **All Databricks certifications expire 2 years after the pass date** — there is no automatic renewal
- After the expiry date, the credential no longer appears as "active" on your Credly / credential portal page and **cannot be displayed as a current certification on resumes / LinkedIn / role descriptions**
- For consultants, the active credential is often a hard requirement for partner-program tier eligibility (Databricks Partner Connect, SI tier badges) — letting it lapse can affect billing rates and project staffing
- The Databricks platform itself evolves quickly (Lakeflow Jobs replaced Workflows in 2025; Lakeflow Declarative Pipelines replaced DLT; UC Model Registry deprecated workspace stages) — renewal is also a structured forcing function to refresh your mental model

## The 2-year clock — when does it start?

Your 2-year window starts on the **date you passed the exam**, not the date you registered or the date the result was reviewed. The exact expiry date is visible:

1. On your [Databricks credential portal](https://credentials.databricks.com/) under "Expires on"
2. On the Credly badge for the credential ("Expires on: YYYY-MM-DD")
3. On your original pass-confirmation email from Databricks / the testing partner

Add the expiry date to your calendar **as soon as you pass** — that single 5-second step saves a lot of rushed last-week studying two years later.

## Renewal timeline checklist

Use this as a working calendar. Adjust day counts to fit your schedule; the discipline matters more than the exact numbers.

| When | Action |
| :--- | :--- |
| **Day −365 (12 months out)** | Mark the expiry on your calendar. Subscribe to the [Databricks blog](https://www.databricks.com/blog) and the official cert page's "What's new" section so you catch blueprint changes early. |
| **Day −180 (6 months out)** | Check whether Databricks Academy offers a dedicated recertification exam for your cert (see per-cert table below). If yes, decide: full retake vs. recert exam. |
| **Day −90 (3 months out)** | Skim the **current** exam guide PDF for your cert. Diff it mentally against the version you originally passed — note anything new (e.g., Lakeflow rebranding, Mosaic AI features, Genie Spaces). |
| **Day −60 (2 months out)** | Start active study. Focus on the *delta* since your last pass: new features, deprecated names, new domains. The repo's [`CHANGELOG.md`](../../CHANGELOG.md) and per-cert "What changed in the latest blueprint" callouts surface most of these. |
| **Day −30 (1 month out)** | Book the exam. Avoid leaving it for the last 7 days — testing-partner slots fill up fast in the EU and APAC time zones at the start/end of each quarter. |
| **Day −14 (2 weeks out)** | Take at least one full timed mock exam (per cert there are two in this repo under `resources/mock-exam/` and `resources/mock-exam-2/`). |
| **Day −7 (1 week out)** | Work through the per-cert `resources/final-review.md` cram scan. Re-read any topic file where you missed mock-exam questions. |
| **Day −1** | Light review only. Eat. Hydrate. Sleep. |
| **Day 0** | Take the exam. After passing, update your credential portal profile and Credly badge link. |
| **Day +1** | Add the **new** expiry date to your calendar. The cycle resets. |

> [!tip]
> If life intervenes and you miss the expiry by a few weeks, **the credential doesn't reactivate automatically when you pass a renewal exam afterward.** Treat it as a new pass — your new expiry is 2 years from the renewal-exam date.

## Two renewal paths

### Path A — Retake the full current exam

Always available. You sit the same exam new candidates take (current blueprint, full question count, full duration, full fee).

- Pros: works for every cert, no eligibility check needed, same scoring as new candidates
- Cons: longest, most expensive, requires preparation for the entire blueprint — not just the delta

### Path B — Recertification exam (where offered)

Some Databricks certifications offer a shorter, lower-cost recertification exam through **Databricks Academy** for credential holders within the renewal window. The recert exam typically focuses on what has changed since the previous blueprint and assumes you already passed the underlying material once.

- Pros: shorter, cheaper, focused on the delta
- Cons: not offered for every cert, eligibility usually requires the original credential to be either active or recently expired (rules vary by program iteration), program details (length, cost) change over time

**Always check**: the [Databricks Certification Hub](https://www.databricks.com/learn/certification) → your specific cert page → "Recertification" section, or your Academy dashboard.

## Per-certification renewal snapshot

> [!warning]
> Snapshot date: **May 2026.** Verify against the official cert page before booking. Where this guide says "recertification exam available", confirm the current cost / duration / question count on the Databricks Academy page for your cert — those parameters change between program revisions.

| Certification | Current blueprint | Recert exam offered? | If you're renewing, focus on… |
| :--- | :--- | :--- | :--- |
| **Data Engineer Associate** | May 2026 | Check Databricks Academy | The new **CI/CD and Monitoring** domain (added May 2026 refresh); **Lakeflow Jobs** terminology (formerly Databricks Workflows); **Lakeflow Declarative Pipelines** (formerly DLT) |
| **Data Engineer Professional** | Nov 30, 2025 | Check Databricks Academy | 10-domain restructure (Nov 30, 2025): new explicit domains for **Data Sharing & Federation**, **Data Modelling**, **Data Governance**; renamed **Lakeflow** product family throughout |
| **Data Analyst Associate** | Oct 2025 | Check Databricks Academy | **Genie Spaces** (new domain — natural-language analytics over UC); **9-domain blueprint** (up from 5); modernized **Databricks SQL** features (parameters, alerts, dashboard publishing) |
| **ML Associate** | Mar 1, 2025 | Check Databricks Academy | **Unity Catalog Model Registry** (workspace registry deprecated); **alias-based model lifecycle** (replacing Staging/Production/Archived stages); **Feature Engineering in Unity Catalog** |
| **ML Professional** | Sep 2025 | Check Databricks Academy | **Mosaic AI Model Serving** (route optimization, inference tables); **AI Gateway** for governed LLM access; modernized monitoring with **inference table-driven drift detection** |
| **GenAI Engineer Associate** | Mar 2026 | Check Databricks Academy | New **Governance** domain (March 2026 refresh — 6 domains total); **Mosaic AI Agent Framework** (`ResponsesAgent` / `ChatAgent` replacing deprecated `ChatModel`); **Vector Search + AI Gateway** integration; **Inference Tables** for agent telemetry |

> [!note]
> The "Check Databricks Academy" cells reflect that the recertification program's availability per cert is operationally managed by Databricks Academy and varies over time. The right way to confirm: log into your Academy account → "My Certifications" → click your cert. If the renewal option exists, you'll see a "Renew" or "Recertify" button. If it doesn't, you'll see the standard "Schedule exam" link, and Path A (full retake) applies.

## What to actually study for renewal

Whichever renewal path you take, your study time is best spent on the **delta** since you last passed.

### Step 1 — Pull both exam-guide PDFs

- Your **original** exam-guide PDF (the one current when you first passed). If you don't have it, the [Wayback Machine](https://web.archive.org/) usually has snapshots of older Databricks cert pages.
- The **current** exam-guide PDF (linked from each cert page on Databricks.com).

### Step 2 — Diff the domain lists + weights

- Identify any **new domains** in the current blueprint. These are the highest-yield study targets.
- Identify any **renamed or removed domains**.
- Note any **weight shifts** > 5 % — these tell you what Databricks now considers more important.

The repo's per-cert README has a "What changed in the latest blueprint" callout that summarizes this diff for the May 2026 / Nov 30 2025 / Oct 2025 / Mar 2026 refreshes.

### Step 3 — Prioritize the platform's renamed / new product lines

Across all certs, the highest-frequency "product renamed" deltas are:

| Old name | Current name | Where you'll see it |
| :--- | :--- | :--- |
| Delta Live Tables (DLT) | **Lakeflow Declarative Pipelines** | DE Associate, DE Professional |
| Databricks Workflows | **Lakeflow Jobs** | DE Associate, DE Professional, ML Associate |
| Workspace Model Registry stages (Staging / Production / Archived) | **UC Model Registry aliases** (Champion / Challenger / Production) | ML Associate, ML Professional |
| `ChatModel` (MLflow ≤ 2.x) | **`ResponsesAgent` / `ChatAgent`** + `databricks.agents.deploy()` | GenAI Engineer Associate |
| Classic / Pro SQL Warehouses (Pro tier) | **Serverless SQL Warehouses** (recommended) | Data Analyst Associate, DE Associate |

The `dlt` Python module name is preserved for back-compat; only the product brand changed. Code blocks using `@dlt.table` etc. are still current.

### Step 4 — Run the mock exams in this repo

Every cert in this guide ships **two full mocks** (`resources/mock-exam/` and `resources/mock-exam-2/`) plus per-question **debrief tables** mapping each missed question to its topic file + cheat sheet. Treat each mock as a triage tool: any miss → read the linked topic file, drill the corresponding cheat sheet, move on.

### Step 5 — Cram with the final-review file

Each cert has a [`resources/final-review.md`](../../certifications/) — a 20-minute exam-morning scan that consolidates the highest-frequency facts. Read it the morning of the exam, not days before.

## Cost considerations

| Item | Typical range (verify on Databricks Academy) |
| :--- | :--- |
| Full exam retake | Same as new-candidate exam fee for your cert (see the [top-level exam-at-a-glance table](../../README.md)) |
| Dedicated recertification exam (where offered) | Lower than the full exam fee; varies by cert and current program revision |
| Free voucher / discount events | Databricks runs periodic voucher promotions (Summit attendees, partner events, training-bundle purchases). Worth checking your inbox + your company's L&D portal before paying out of pocket. |
| Employer reimbursement | Most consulting firms and SI partners reimburse cert renewal as part of the partnership badge maintenance program. Ask your manager / L&D / finance before paying personally. |

> [!tip]
> If you have access to Databricks **Customer Academy** through your employer's Databricks subscription, recertification vouchers are sometimes available there at a discount or for free. This is separate from the public Databricks Academy.

## After you renew

1. **Update the credential portal**: your new expiry should appear within a few hours of passing. Re-share the Credly badge if you embed it on your CV / LinkedIn / Github profile — the URL is stable but the validity dates refresh.
2. **Calendar the next expiry**: 2 years from the renewal-pass date. Same drill, next time.
3. **Update the repo (if you used it)**: if anything was missing or felt outdated when you studied, [open a PR](../../CONTRIBUTING.md). The repo lives because past test-takers improve it for the next batch.
4. **Tell your network**: if you renewed via the recertification exam path, share what was on it (without violating the exam NDA — stick to *topic areas*, not specific questions). Other people renewing in your cohort will thank you.

## Frequently asked questions

### Q: I missed the expiry — am I locked out of renewal forever?

No. You can still take the renewal exam (or full retake) after expiry. The catch: the credential stays "expired" until you pass, and the recertification exam path may or may not still apply once outside the renewal window (depends on the current program rules). Check the official page.

### Q: Do I need to take the renewal exam in the same language as my original exam?

No. Renewal language eligibility follows the **current** language list for the cert (see [top-level README](../../README.md) for the latest). If the cert added or removed languages since you last took it, your options today reflect the current list.

### Q: Does the renewal exam appear on my credential as a separate badge?

No — it renews the **same** credential. The badge URL is unchanged; only the validity dates refresh.

### Q: I have two Databricks certs and both expire near each other. Can I renew them together?

Each cert is renewed independently. There is no bundled / multi-cert renewal exam. If both are near expiry, schedule them on separate days to avoid burnout and give yourself enough recovery time between exams.

### Q: I passed the Associate cert and have since passed the Professional cert. Does the Professional pass renew the Associate?

No — the two credentials are independent. Each follows its own 2-year clock from its own pass date. Many people who hold both choose to let the Associate lapse if they only display the Professional on their public profile, but be aware this is an active choice, not an automatic outcome.

### Q: What if Databricks retires my certification entirely?

Databricks has historically given long deprecation notices (months to a year+) and announces them on the [Certification Hub](https://www.databricks.com/learn/certification). If your cert is retired before your renewal date, you'll typically be offered:

1. A migration path to a successor cert (if one exists)
2. Or a final extension window during which the existing credential remains active

Watch the Databricks blog and your credential portal for these announcements.

## Official documentation

- **[Databricks Certification Hub](https://www.databricks.com/learn/certification)** — landing page for all six certifications; recertification program updates announced here
- **[Your credential portal](https://credentials.databricks.com/)** — your personal page; expiry dates live here
- **[Databricks Academy](https://www.databricks.com/learn/training)** — training + recertification exam booking
- **[Databricks Blog](https://www.databricks.com/blog)** — blueprint refresh announcements ("What's new in the [Cert Name] exam guide" posts)
- **[Databricks Documentation](https://docs.databricks.com/)** — the source of truth for product-feature changes; cross-reference against any cert guide that feels outdated

## Related Topics

- [`CHANGELOG.md`](../../CHANGELOG.md) — what's changed in this study guide since your last visit
- Per-cert [`README.md`](../../certifications/) "What changed in the latest blueprint" callouts
- Per-cert [`resources/final-review.md`](../../certifications/) — exam-morning cram scans
- [Learning Paths](../../learning-paths/README.md) — if you're adding a new cert during renewal season

---

**[← Back to Appendix](./README.md)** | **[↑ Back to repo root](../../README.md)**
