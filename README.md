# Markdown to Halo

An Obsidian plugin that publishes Markdown notes to a [Halo](https://www.halo.run/) blog.

![Logo](https://img.shields.io/badge/Platform-Obsidian-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- 📝 **Publish Markdown to Halo** — converts Markdown → HTML and posts via Halo API
- 🏷️ **YAML frontmatter support** — reads `title` and `tags`, writes back `halo_post_name` and `halo_link` for future updates
- 🖼️ **Auto image upload** — uploads local images to [EasyImage2](https://github.com/icret/EasyImages2.0) image hosting, replaces links in HTML
- 🔁 **Update existing posts** — if `halo_post_name` exists in YAML, updates instead of creating a new post
- 📱 **Desktop & Mobile** — works on both platforms

## Installation

### Option A: Via BRAT (Recommended)

1. Install the [BRAT](https://github.com/TfTHacker/obsidian42-brat) plugin from Obsidian's community plugins
2. Open BRAT settings → "Add Beta Plugin"
3. Enter this repo URL: `https://github.com/yakumo2/md_to_halo_obsidian_plugin`
4. Enable the plugin in Obsidian settings

### Option B: Manual Install

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest [GitHub Release](https://github.com/yakumo2/md_to_halo_obsidian_plugin/releases)
2. Place them in your vault's `.obsidian/plugins/md-to-halo/` folder
3. Enable in Obsidian → Settings → Community plugins

## Setup

1. Enable the plugin in Obsidian settings
2. Configure the following in the plugin settings:

| Setting | Description | Example |
|---------|-------------|---------|
| **Halo Base URL** | Your Halo blog URL | `https://halo.example.com` |
| **Halo Token** | Halo Personal Access Token | `pat_xxxxxx` |
| **Halo Owner** | Halo username for article ownership | `admin` |
| **Halo Template** | Theme/template name (optional, leave blank for default) | `default` |
| **Halo Categories** | Category metadata.name, comma-separated | `tech,life` |
| **Image URL** | EasyImage2 API endpoint | `https://image.example.com/api/index.php` |
| **Image Token** | EasyImage2 API token | `your_token` |

## Usage

1. Open a Markdown note in Obsidian
2. Click the **Publish to Halo** ribbon icon (☁️ upload icon) or use the command palette: "Publish current note to Halo"
3. The plugin will:
   - Parse YAML frontmatter (if present) for `title` and `tags`
   - Upload local images to your EasyImage2 instance
   - Convert Markdown → HTML and publish to Halo
   - Write `halo_post_name` and `halo_link` back to the note's YAML

## YAML Format

```yaml
---
title: Your Title
tags:
  - tag1
  - tag2
halo_post_name: f5b036d1-8290-41da-a928-220c0ee0ffe4
halo_link: https://halo.example.com/archives/f5b036d1-8290-41da-a928-220c0ee0ffe4
---
```

- If `halo_post_name` exists, the plugin **updates** the existing Halo post
- If absent, the plugin **creates** a new post and writes the ID back

### Resetting

To re-publish as a new article (or to a different Halo instance), delete `halo_post_name` and `halo_link` from the YAML.

## Requirements

- [Halo Blog](https://www.halo.run/) (v2.x)
- [EasyImage2](https://github.com/icret/EasyImages2.0) for image hosting (optional, but images won't be uploaded without it)

## Development

```bash
git clone https://github.com/yakumo2/md_to_halo_obsidian_plugin.git
cd md_to_halo_obsidian_plugin
pnpm install
pnpm run dev      # watch mode
pnpm run build    # production build
```

## License

MIT
