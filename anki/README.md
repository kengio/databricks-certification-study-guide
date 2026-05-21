---
title: Anki Decks
type: index
tags:
  - anki
  - spaced-repetition
  - flashcards
status: published
---

# Anki Decks

Spaced-repetition flashcards distilled from the cheat sheets, fundamentals, and key-takeaway sections of this guide. Use these the last 2–4 weeks before your exam to lock in high-frequency facts.

## How the system works

The repo stores deck **source** as markdown (human-readable, Obsidian-friendly, version-controlled). A small Python script converts each source file into an Anki-importable **TSV** under `anki/build/` which is `.gitignored`. The TSV is what you actually import into the Anki desktop app.

```text
anki/
├── README.md                          # this file
├── format.md                          # deck source format spec
├── build.py                           # Python stdlib-only converter
├── decks/                             # source decks (committed)
│   └── shared/
│       ├── delta-lake.md              # Delta Lake — 27 cards
│       └── unity-catalog.md           # Unity Catalog — 22 cards
└── build/                             # generated output (gitignored)
    └── shared/
        ├── delta-lake.txt
        └── unity-catalog.txt
```

## Available decks

| Deck | Source | Cards | Best for |
| :--- | :--- | :---: | :--- |
| Delta Lake | [`decks/shared/delta-lake.md`](./decks/shared/delta-lake.md) | 27 | DE Associate, DE Professional |
| Unity Catalog | [`decks/shared/unity-catalog.md`](./decks/shared/unity-catalog.md) | 22 | every cert |

More decks coming as the community contributes — see [Contributing a new deck](#contributing-a-new-deck) below.

## Workflow — for learners

1. **Install [Anki](https://apps.ankiweb.net/)** (free, desktop, all platforms)
2. **Clone this repo** locally
3. **Build the TSV files**:

   ```bash
   python3 anki/build.py
   ```

   No `pip install` needed — Python 3.9+ standard library only.

4. **Import into Anki**: open Anki → `File` → `Import` → select each `.txt` file under `anki/build/`. Anki reads the `#deck:` line at the top of each file, so each deck lands in the right hierarchy (`Databricks::DE Associate::Delta Lake`, etc.).
5. **Study daily**. Anki's default settings (new: 20/day, review: unlimited) work fine for cert prep.

> [!tip]
> If you change a deck source file and re-run `python3 anki/build.py`, Anki's import dialog will offer to **update** existing notes rather than duplicate them. Pick that option.

## Workflow — for the curious (no Anki)

If you don't want to install Anki, the source markdown files are usable as quiz material directly:

- In **Obsidian**: the `> [!success]- Answer` callout is foldable — read the question, think, then click to reveal the answer.
- In **GitHub**: the callout renders as an open block, so just scroll past the answer to skip ahead.

The Anki workflow is just the higher-leverage option because spaced repetition genuinely beats one-pass reading for memorising lookups like "default VACUUM retention" or "Z-order vs Liquid Clustering."

## Contributing a new deck

PRs welcome. Process:

1. Pick a topic that maps to an existing cheat sheet (e.g., `shared/cheat-sheets/mlflow-quick-ref.md` → `anki/decks/shared/mlflow.md`) — concentrated reference content is what makes the best flashcards.
2. Follow the [format spec](./format.md). Each card has a clear front (one question or scenario) and a precise back (the answer, with citation/qualifier where appropriate).
3. Aim for **20–35 cards per deck** — large enough to be useful, small enough to ship a quality deck per PR.
4. Run `python3 anki/build.py --check` to validate the format.
5. Run `python3 anki/build.py` to generate output and spot-check a few cards in Anki before opening the PR.
6. Add a row to the "Available decks" table above.
7. Submit your PR.

## Card-writing principles

- **One fact per card.** "What is X?" beats "What are the five properties of X?" — split the second into five cards.
- **Front is the *question*, not the topic.** "Define ACID" → bad. "Which Delta Lake guarantee ensures all-or-nothing transaction visibility?" → good.
- **Back is *just the answer*, not a re-statement of the question.** Anki shows the front above the back; redundancy wastes brain time.
- **Be specific in the back.** "Use `OPTIMIZE`" → not enough. "`OPTIMIZE <table>` — coalesces small files into the table's `delta.targetFileSize` (default 1 GB)." → enough.
- **Code in code spans.** Use backticks for SQL, Python, file paths, and config keys. The builder preserves them.
- **Avoid trivia.** Skip cards about exact API parameter names that change every release. Focus on conceptual + decisional questions ("when to use X vs Y", "what does X guarantee", "what's the default for Y").
- **Mark deprecated content explicitly.** If a card references something current as of the May 2026 / Nov 2025 / Mar 2026 blueprint, name the cutoff in the answer.

## What this isn't

- Not a replacement for the topic files — flashcards lock in *facts*, not *understanding*. Read the topic file first.
- Not a substitute for mock exams — flashcards train recall, not exam pacing or distractor-elimination. Use both.
- Not a full deck per cert (yet). Contributions wanted.

## License

Same as the rest of the repo: [MIT](../LICENSE). Cards are released under the same terms; you're free to import them into your own Anki and use them however.

---

**[← Back to repo root](../README.md)** | **[Deck format spec →](./format.md)**
