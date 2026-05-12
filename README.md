# r-markdown-cli

Rich Markdown (`rmd`) is a toolchain and core engine for parsing, validating, previewing, and building `.rmd` files. It provides a standard way to process rich text content, featuring a local preview server and multiple built-in themes.

## 📖 Documentation

For a deep dive into the project's design philosophy and roadmap, please refer to the documents in the [docs](./docs) folder:
- **[VISION.md](./docs/VISION.md)**: The core vision and design philosophy of Rich Markdown.
- **[GETTING-STARTED.md](./docs/GETTING-STARTED.md)**: A comprehensive guide for new users.

## 🚀 Examples & Showcase

We provide a comprehensive showcase of Rich Markdown's capabilities. You can explore the source files and the rendered output:
- **Source**: [examples/v0.2-showcase.rmd](./examples/v0.2-showcase.rmd) — Explore the syntax of various components (Timelines, Grids, Charts, etc.).
- **Live Preview**: [examples/v0.2-showcase.html](./examples/v0.2-showcase.html) — View the rendered output to see the visual effects of different themes and layouts.


## Installation

We recommend installing the CLI tool globally via npm:

```bash
npm install -g r-markdown-cli
```

## Usage

Once installed, you can use the `rmd` command directly in your terminal. Here is an overview of the core commands:

### Preview & Build

- **Start Local Preview**: Launches a local development server to preview `.rmd` files in real-time.
  ```bash
  rmd open example.rmd --port 3000
  ```

- **Compile to HTML**: Statically compiles `.rmd` files into HTML with support for themes and bundling modes.
  ```bash
  # Available themes: default, notion-like, paper, tech-dark
  # Available modes: self-contained, cdn, split
  rmd build example.rmd --mode self-contained --theme tech-dark --out dist/demo.html
  ```

### Parse & Validate

- **Output AST**: Parses the file and outputs the Abstract Syntax Tree (AST) in JSON format.
  ```bash
  rmd parse example.rmd
  ```

- **Validate Structure**: Validates the `.rmd` file against the built-in schema to ensure compliance.
  ```bash
  rmd validate example.rmd
  ```

### AI Integration

- **Initialize AI Skill**: Installs Rich Markdown processing skills for your AI assistants (e.g., Codex, Claude).
  ```bash
  rmd init --ai claude
  rmd init --ai all
  ```

## More Options

To see all available commands and flags:

```bash
rmd --help
```

## Obsidian Plugin (Manual Install)

If you want to use Rich Markdown inside Obsidian:

1. **Build the plugin**:
   ```bash
   npm run obsidian:build
   ```
2. **Install to your vault**:
   Create a folder at `<your-vault>/.obsidian/plugins/rich-markdown` and copy all files from `packages/obsidian-plugin/dist/` into it.
3. **Enable**:
   Restart Obsidian or refresh the plugin list, then enable "Rich Markdown" in Community Plugins settings.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
