# tldraw-claude

A Claude Code plugin that gives Claude a shared [tldraw](https://tldraw.dev) canvas. Draw diagrams, flowcharts, and sketches together in real time.

## How it works

```
Claude Code ←stdio→ MCP Server ←WebSocket→ tldraw widget (browser)
```

Claude manipulates shapes on a tldraw canvas running in your browser. You both see the same canvas — Claude draws, you can edit, and vice versa.

## Install

### Option A: Clone (recommended — easy to update)

```bash
git clone https://github.com/sociotechnica-org/tldraw-claude.git ~/.tldraw-claude
cd ~/.tldraw-claude
./setup
```

### Option B: Install anywhere

```bash
git clone https://github.com/sociotechnica-org/tldraw-claude.git /path/to/tldraw-claude
cd /path/to/tldraw-claude
./setup
```

### Prerequisites

- [Bun](https://bun.sh) runtime
- [Claude Code](https://claude.ai/code) CLI

### Configure Claude Code

Add the MCP server to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "tldraw": {
      "command": "bun",
      "args": ["/path/to/tldraw-claude/src/mcp-server.ts"]
    }
  }
}
```

Replace `/path/to/tldraw-claude` with the actual install path (e.g., `~/.tldraw-claude`).

Or register as a Claude Code plugin:

```bash
claude plugin marketplace add /path/to/tldraw-claude --scope project
claude plugin install tldraw-claude@sociotechnica --scope project
```

## Usage

### 1. Start the canvas

```bash
~/.tldraw-claude/bin/tldraw-claude start
```

This starts the tldraw widget (http://localhost:5173) and a WebSocket relay (ws://localhost:4000), then opens your browser.

### 2. Draw together

Ask Claude to draw something:

> "Draw a flowchart showing the request lifecycle in our app"

> "Sketch the architecture of our microservices"

> "Create a diagram of the database schema"

## Updating

Since tldraw-claude is installed via git clone, updating is a pull:

```bash
cd ~/.tldraw-claude   # or wherever you cloned it
git pull
./setup               # reinstall deps if they changed
```

To pin a specific version:

```bash
git checkout v0.1.0
./setup
```

## Tools

| Tool | Description |
|------|-------------|
| `create_shape` | Create geo shapes, text, or notes |
| `update_shape` | Modify position, size, color, text |
| `delete_shapes` | Remove shapes by ID |
| `connect_shapes` | Draw arrows between shapes |
| `get_snapshot` | List all shapes on canvas |
| `clear_canvas` | Wipe the canvas |

## CLI

```bash
tldraw-claude start    # Start widget + WS relay
tldraw-claude stop     # Stop background processes
tldraw-claude status   # Check if services are running
```

## License

MIT
