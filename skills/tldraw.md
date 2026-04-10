---
name: tldraw
description: Draw on a shared tldraw canvas with the user. Create diagrams, flowcharts, sketches, and visual artifacts.
---

# tldraw Canvas

You have access to a shared tldraw canvas that the user can see in their browser. Use the MCP tools to create and manipulate shapes on the canvas.

## Before drawing

1. Make sure the tldraw widget is running. If the user hasn't started it, tell them to run: `tldraw-claude start`
2. Use `get_snapshot` to see what's already on the canvas before making changes.

## Available tools

- **create_shape** — Create geo shapes (rectangle, ellipse, triangle, diamond, star, cloud, heart, etc.), text, or notes at specific positions
- **update_shape** — Move, resize, recolor, or change text of existing shapes
- **delete_shapes** — Remove shapes by ID
- **connect_shapes** — Draw arrows between shapes (great for flowcharts)
- **get_snapshot** — See all shapes on the canvas (always do this first)
- **clear_canvas** — Wipe the canvas clean

## Layout tips

- The canvas coordinate system starts at (0, 0) in the top-left
- Default shape size is 200x200. Use consistent sizes for clean layouts.
- For flowcharts: space nodes ~300px apart vertically, center horizontally
- For diagrams: use a grid layout with ~250px spacing
- Use colors to group related concepts: blue for inputs, green for outputs, violet for processing
- Add text labels to shapes to make them self-documenting
- Use `connect_shapes` with labels for relationship arrows

## Workflow

1. `get_snapshot` — understand current state
2. `clear_canvas` if starting fresh (ask user first)
3. Create shapes with meaningful positions and labels
4. Connect related shapes with arrows
5. `get_snapshot` to verify the result looks right

## Shape colors

Available colors: black, grey, light-violet, violet, blue, light-blue, yellow, orange, green, light-green, light-red, red, white

## Shape types

- **geo**: rectangle, ellipse, triangle, diamond, pentagon, hexagon, star, cloud, heart
- **text**: standalone text labels
- **note**: sticky note style shapes
