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

## Installation Instructions
1. Open Obsidian Settings (`Cmd + ,`).
2. Go to **Community Plugins**.
3. Turn on **Restricted mode** (if it's not already allowed).
4. Click **Browse** and search for the names listed above.
5. Click **Install** and then **Enable**.
