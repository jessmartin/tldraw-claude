# tldraw-claude

A Claude Code plugin that gives Claude a shared [tldraw](https://tldraw.dev) canvas. Draw diagrams, flowcharts, and sketches together in real time.

## How it works

```
Claude Code ←stdio→ MCP Server ←WebSocket→ tldraw widget (browser)
```

Claude manipulates shapes on a tldraw canvas running in your browser. You both see the same canvas — Claude draws, you can edit, and vice versa.

## Quick start

```bash
git clone https://github.com/sociotechnica-org/tldraw-claude.git
cd tldraw-claude
./setup
```

### 1. Start the canvas

```bash
./bin/tldraw-claude start
```

This starts the tldraw widget (http://localhost:5173) and a WebSocket relay (ws://localhost:4000), then opens your browser.

### 2. Configure Claude Code

Add the MCP server to your project's `.claude/settings.json`:

```json
{
  "mcpServers": {
    "tldraw": {
      "command": "bun",
      "args": ["run", "/path/to/tldraw-claude/src/mcp-server.ts"]
    }
  }
}
```

Or install as a Claude Code plugin:

```bash
claude plugin marketplace add /path/to/tldraw-claude --scope project
claude plugin install tldraw-claude@sociotechnica --scope project
```

### 3. Draw together

Ask Claude to draw something:

> "Draw a flowchart showing the request lifecycle in our app"

> "Sketch the architecture of our microservices"

> "Create a diagram of the database schema"

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
./bin/tldraw-claude start    # Start widget + WS relay
./bin/tldraw-claude stop     # Stop background processes
./bin/tldraw-claude status   # Check if services are running
```

## License

MIT
