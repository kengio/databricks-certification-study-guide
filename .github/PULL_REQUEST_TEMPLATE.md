<!--
Thanks for contributing to the Databricks Certification Study Guide.

This template helps keep the guide trustworthy as people prepare for a real exam.
Skip irrelevant sections (typo PRs don't need a sources block, etc.).
-->

## Summary

<!-- One or two sentences: what changed and why. -->

## Type of change

- [ ] Typo / link fix
- [ ] Factual correction
- [ ] New practice question
- [ ] New mock-exam question
- [ ] Topic-file expansion or rewrite
- [ ] New cheat sheet, code example, or interview-prep entry
- [ ] Blueprint refresh (Databricks updated the exam guide for a cert)
- [ ] Tooling / repo housekeeping (CI, templates, etc.)

## Which certification(s) does this touch?

- [ ] Data Engineer Associate
- [ ] Data Engineer Professional
- [ ] Data Analyst Associate
- [ ] ML Associate
- [ ] ML Professional
- [ ] GenAI Engineer Associate
- [ ] Shared content (fundamentals / cheat-sheets / appendix / code-examples / interview-prep)
- [ ] Repo-wide (README, tooling, etc.)

## Blueprint / source alignment

<!--
For factual corrections, new questions, or topic edits — link the supporting Databricks source.
This is required for content changes. See CONTRIBUTING.md "Ground rules".
-->

- Databricks source (exam-guide PDF, docs page, blog):
- Blueprint bullet this maps to (paste the exact text, if applicable):
- Exam-guide version date this targets:

## Same fact in other files?

<!-- Mark any other files that contain the same fact pattern (so reviewers can sanity-check consistency). -->

- [ ] Topic file
- [ ] Cheat sheet (`shared/cheat-sheets/`)
- [ ] Practice question
- [ ] Mock exam
- [ ] Interview prep (`shared/interview-prep/`)
- [ ] Appendix
- [ ] N/A

## README & CLAUDE.md sync

This guide requires that `README.md` and `CLAUDE.md` stay in sync with content changes. See [CONTRIBUTING.md → README & CLAUDE.md sync rule](../CONTRIBUTING.md#readme--claudemd-sync-rule).

- [ ] My change does not need a README or CLAUDE.md update, **or**
- [ ] I updated the top-level `README.md` where it described the changed content
- [ ] I updated `CLAUDE.md` where it described the changed content
- [ ] I updated the affected cert's `README.md` (Exam Overview / Study Topics / What's New callout)
- [ ] I added an entry to `CHANGELOG.md`

## 3-round self-review

Per [CONTRIBUTING.md → 3-round review workflow](../CONTRIBUTING.md#3-round-review-workflow), every PR is reviewed in three distinct passes before squash-merge. Check each round only after it actually ran:

- [ ] **Round 1 — Technical correctness**: every link resolves, every code block is valid, `markdownlint` passes on every modified file
- [ ] **Round 2 — Factual / blueprint accuracy**: every factual change cites a Databricks source; new questions map to a current blueprint bullet
- [ ] **Round 3 — Style & conventions**: topic-file ordering, callout types, terminal sections, A/B/C/D formatting, foldable `> [!success]-` answers all follow `CLAUDE.md`

## Verification

- [ ] Ran `markdownlint` on every modified file
- [ ] Verified all internal links resolve
- [ ] Followed the conventions in [CLAUDE.md](../CLAUDE.md) (topic-file structure, callout types, terminal sections)
- [ ] For new questions: A/B/C/D on separate lines, foldable `> [!success]- Answer`, explanation teaches the why
- [ ] For blueprint refreshes: also updated the "What's New" callout, the cert's README, the top-level README, and `CHANGELOG.md`

## Anything reviewers should know

<!-- Open questions, alternatives you considered, follow-ups deferred to later PRs. -->
