---
title: Anki Deck Source Format
type: reference
tags:
  - anki
  - format-spec
status: published
---

# Anki Deck Source Format

The exact markdown contract that [`build.py`](./build.py) parses. Stick to this and the build will work; deviate and you'll see warnings or skipped cards.

## File-level structure

```markdown
---
deck: Databricks::DE Associate::Delta Lake
tags:
  - delta-lake
  - de-associate
  - de-professional
---

# Deck Title (Topic — Anki Deck)

Optional preamble. Anything before the first H2 heading is ignored by the
builder, so use it for an intro callout, source citations, scope notes, etc.

## Card title (front context)

The card's question or scenario lives here. One or more paragraphs. Use
`code spans`, **bold**, *italics* as needed.

> [!success]- Answer
> The answer body. The `> ` blockquote prefix is stripped by the builder
> before the answer is written to Anki. The fold-out callout (`-` after
> `[!success]`) lets readers in Obsidian / GitHub use the source file as
> a quiz directly.

## Next card title

Another question...

> [!success]- Answer
> Another answer.
```

## Required frontmatter fields

| Field | Purpose | Example |
| :--- | :--- | :--- |
| `deck` | Anki deck path. Use `::` for hierarchy. | `Databricks::DE Associate::Delta Lake` |
| `tags` | YAML list of Anki tags. No spaces (use `-` or `_`). | `[delta-lake, de-associate]` |

## Card boundaries

- **H2 heading** (`##` followed by a space) = start of a new card. The heading text becomes the bolded title at the top of the front.
- **`> [!success]- Answer`** (or `> [!success]-` without the word "Answer") = start of the back.
- The back continues until either the next H2 heading or a non-blockquote line.

## What gets ignored

- The H1 title (`#` followed by a space) and everything before the first H2 — preamble only.
- Comments (HTML or YAML `#` style) — passed through to Anki as-is, so avoid.
- Multiple blank lines between cards — the builder is whitespace-tolerant.

## Lint behaviour

The builder warns (and skips the card) when:

- An H2 heading has no `> [!success]-` callout below it
- The front or back is empty after stripping whitespace

Run `python3 anki/build.py --check` to validate without writing output.

## Markdown features that work in Anki

Anki imports cards as HTML, and the builder converts source newlines to `<br>`. So:

| Source markdown | Renders in Anki as |
| :--- | :--- |
| `**bold**` | bold |
| `*italic*` | italic |
| `` `code` `` | inline code |
| Blank line between paragraphs | line break |
| Triple-backtick code fences | rendered inline as-is — works but not styled |

## Markdown features that DON'T survive

- Mermaid diagrams (Anki has no Mermaid renderer)
- Embedded images (the builder doesn't copy assets — keep cards text-only for now)
- Cross-file `[text](path)` links (Anki has no concept of repo-relative paths)
- Tables — they render as raw HTML, which Anki can show but is ugly; avoid tables in card bodies

## TSV output format (for reference)

The build output is tab-separated with these special header lines Anki recognises (`[TAB]` below denotes a literal tab character):

```text
#separator:tab
#html:true
#deck:Databricks::DE Associate::Delta Lake
#columns:Front[TAB]Back[TAB]Tags
<front HTML>[TAB]<back HTML>[TAB]<space-separated tags>
<front HTML>[TAB]<back HTML>[TAB]<space-separated tags>
…
```

When you re-import an updated deck, Anki uses the **front** as the note key for deduplication. Keep front titles stable across edits so reviews carry over instead of resetting.

## Tag conventions

- Use kebab-case (no spaces): `delta-lake`, `de-associate`, `unity-catalog`
- Include both the **topic** tag (`delta-lake`) and at least one **certification** tag (`de-associate`, `de-professional`, etc.) so learners can filter by cert when studying
- Add `deprecated` if a card references something the current blueprint has phased out (useful for renewal candidates)

## Example: a complete, well-formed card

```markdown
## Z-ordering vs Liquid Clustering — when to use which?

Both co-locate related rows on disk to speed up filtered reads. Given a new
Delta table on Databricks Runtime 14+, which do you pick for a column that
will be the dominant filter predicate in 90 % of queries?

> [!success]- Answer
> **Liquid Clustering** (`CLUSTER BY <col>`). Reasons:
>
> - Incremental — clusters new data automatically, no rerun needed
> - Single command, no `OPTIMIZE ZORDER BY` chore
> - Works for both clustering keys and merge-on-read predicate pushdown
>
> Use Z-ordering only for legacy tables where you can't migrate to Liquid
> Clustering, or where DBR < 14.0 is in play.
```

This is the kind of card that's worth flashcarding — it's a *decisional* question with a precise, defensible answer.

---

**[← Back to Anki index](./README.md)**
