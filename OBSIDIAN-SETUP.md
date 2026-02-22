---
title: Obsidian Setup Guide
type: guide
tags:
  - obsidian
  - setup
  - configuration
---

# Obsidian Setup Guide

To ensure the best experience when working with this study guide in Obsidian, we recommend the following configuration and plugins.

## Core Configuration

The `.obsidian/app.json` has been pre-configured with:

- **Strict Line Numbers**: Enabled for easier code referencing.
- **Tab Size**: Set to 4 spaces, standard for Python and Data Engineering code.
- **Use Spaces**: Hard tabs are disabled to ensure consistent rendering across GitHub and different editors.
- **Inline Title**: Disabled to remove redundant filename display at the top of notes.

## Recommended Plugins

Since Obsidian plugins must be installed manually (or via sync), here are the recommended community plugins to install:

### 1. Obsidian Git

*Essential for version control.*

- **Why**: Allows you to back up your notes to this GitHub repository directly from Obsidian.
- **Setup**:
  - Install **Obsidian Git**.
  - Configure the backup interval (e.g., every 15 minutes) or use Command Palette to commit manually.

### 2. Linter

*Essential for consistency.*

- **Why**: Automatically formats Markdown to adhere to strict standards (e.g., proper spacing between headers, consistent bullet points). This ensures that what you see in Obsidian looks exactly the same on GitHub.
- **Setup**:
  - Install **Linter**.
  - Enable "Lint on save".
  - In settings, enable "Insert newline around block elements" and "Properly formatted headers".

### 3. Advanced Tables

*Quality of Life.*

- **Why**: Markdown tables are notoriously difficult to edit by hand. This plugin auto-formats them as you type.

### 4. Better CodeBlock

*Essential for studying code.*

- **Why**: Adds line numbers, title bars, and copy buttons to code blocks.
- **Search for**: "Better CodeBlock" or "Codeblock Customizer" in Community Plugins.

### 5. Paste URL into selection

*Quality of Life.*

- **Why**: Allows you to highlight text and paste a URL to automatically create a `[text](url)` link.

### 6. Copilot

*AI chat inside Obsidian.*

- **Why**: Chat with AI models (Claude, GPT-4o, Gemini, local Ollama) directly inside Obsidian. The **Vault QA** mode indexes your entire vault so the AI answers questions using your actual notes as context — ideal for active recall, summarising topics, and generating practice questions from your study material.
- **Search for**: "Copilot" by logancyang in Community Plugins.

#### Setup Steps

1. Install **Copilot** and enable it.
2. Open **Settings → Copilot → Model Providers** and add an API key:
   - **Anthropic** (Claude) — recommended; best for long-context study sessions.
   - **OpenAI** (GPT-4o) — widely supported alternative.
   - **Ollama** — free, runs locally; good for offline study (no API key needed).
3. Set your **Default Chat Model** (e.g., `claude-sonnet-4-5` or `gpt-4o`).
4. Open the chat panel: `Cmd + P` → **Copilot: Open Copilot Chat**.

#### Vault QA (Index Your Notes)

Vault QA mode lets the AI retrieve relevant notes automatically so answers are grounded in your study material.

1. In **Settings → Copilot → Copilot Plus**, enable **Index vault on startup**.
2. Choose an embedding model (`text-embedding-3-small` for OpenAI, or a local Ollama model).
3. Click **Rebuild Index** after adding new notes.
4. In the chat panel, switch the mode toggle from **Chat** to **Vault QA**.

#### Useful Study Prompts

```text
Summarise the key concepts from my notes on Delta Lake.
Generate 5 practice questions from my notes on Unity Catalog.
What are the differences between streaming and batch processing based on my notes?
Quiz me on the Medallion Architecture.
Explain Change Data Capture as if I am preparing for a Databricks exam.
```

#### Tips

- Use `@filename` in the chat to pin a specific note into context.
- Click the **paperclip icon** to attach the currently open note to the conversation.
- Notes are only sent to the AI when you explicitly include them — nothing is uploaded automatically.

## Installation Instructions

1. Open Obsidian Settings (`Cmd + ,`).
2. Go to **Community Plugins**.
3. Turn off **Restricted mode** (enable community plugins).
4. Click **Browse** and search for the plugin names listed above.
5. Click **Install** and then **Enable**.
