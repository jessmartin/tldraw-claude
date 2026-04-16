<p align="center">
  <img src="docs/logo.png" alt="tldraw-buddy logo" width="400">
</p>

# tldraw-buddy

A shared [tldraw](https://tldraw.dev) canvas for AI agents. Draw diagrams, flowcharts, and sketches together with your AI — in real time.

## What does it do?

You and your AI agent draw on the same canvas. You open a tldraw board in your browser, the agent gets a CLI to create shapes, connect them with arrows, and read what's on the canvas. You can both add and edit — it's a live, shared whiteboard.

Great for sketching architecture diagrams, flowcharts, database schemas, or just thinking visually together.

Works with any AI agent that can run shell commands — Claude Code, Codex, Cowork, Cursor, or anything else with a terminal.

![tldraw-buddy — drawing together on a shared canvas](docs/hero.png)

## How it works

```
AI agent ←shell→ CLI ←WebSocket→ tldraw widget (browser)
```

No MCP server needed. The agent calls the CLI via shell, the CLI sends commands to the tldraw widget over WebSocket, and prints the result. Each command is stateless — connect, send, receive, exit.

## Install

### Option A: Paste this into your agent chat

Copy this prompt and paste it into Claude Code, Codex, Cowork, or any AI agent with shell access:

```
Go to https://github.com/jessmartin/tldraw-buddy and follow the manual
install instructions to clone the repo, run setup, and configure the
tldraw skill so I can draw on a shared canvas with you.
```

### Option B: Claude Code plugin

```bash
claude plugin marketplace add jessmartin/tldraw-buddy --scope user
claude plugin install tldraw-buddy@jessmartin --scope user
```

### Option C: Manual install

```bash
git clone https://github.com/jessmartin/tldraw-buddy.git ~/.tldraw-buddy
cd ~/.tldraw-buddy
./setup
```

For Claude Code, `./setup` registers the plugin automatically. For other agent harnesses, point your agent's skill/prompt config at `~/.tldraw-buddy/skills/tldraw.md` — it teaches the agent how to use the canvas CLI.

### Prerequisites

- [Bun](https://bun.sh) runtime

## Usage

### 1. Start the canvas

```bash
~/.tldraw-buddy/bin/tldraw-buddy start
```

This starts the tldraw widget (http://localhost:5173) and a WebSocket relay (ws://localhost:4000), then opens your browser.

### 2. Draw together

Ask your agent to draw something:

> "Draw a flowchart showing the request lifecycle in our app"

> "Sketch the architecture of our microservices"

> "Create a diagram of the database schema"

## Persistence

Your canvas is automatically saved in the browser (IndexedDB) — close the tab, reopen it, everything's still there.

You can also save to disk as a `.tldr` file:

```bash
tldraw-buddy save diagram.tldr    # Save canvas to file
tldraw-buddy load diagram.tldr    # Restore canvas from file
```

This means you can commit drawings to git, share `.tldr` files with teammates, or restore a canvas on a different machine.

## Updating

```bash
cd ~/.tldraw-buddy
git pull
./setup
```

## CLI

```bash
tldraw-buddy start                # Start widget + WS relay
tldraw-buddy stop                 # Stop services
tldraw-buddy status               # Check service status
tldraw-buddy snapshot             # List all shapes on canvas
tldraw-buddy create --type geo    # Create a shape
tldraw-buddy update --id <id>     # Update a shape
tldraw-buddy delete <id> [id ...] # Delete shapes
tldraw-buddy connect --from --to  # Draw arrow between shapes
tldraw-buddy clear                # Clear the canvas
tldraw-buddy save [file.tldr]     # Save canvas to disk
tldraw-buddy load <file.tldr>     # Load canvas from disk
tldraw-buddy help                 # Show all options
```

## License

MIT
