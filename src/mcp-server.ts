#!/usr/bin/env bun
/**
 * tldraw-claude MCP server.
 *
 * Speaks MCP over stdio and bridges tool calls to a tldraw widget
 * running in the browser via a WebSocket relay on port 4000.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'

const WS_URL = 'ws://localhost:4000'
const CONNECT_TIMEOUT = 5_000
const COMMAND_TIMEOUT = 10_000

// ── WebSocket bridge ─────────────────────────────────────────────────────

let ws: WebSocket | null = null
let requestCounter = 0
const pending = new Map<string, {
	resolve: (value: Record<string, unknown>) => void
	reject: (reason: Error) => void
	timer: ReturnType<typeof setTimeout>
}>()

async function ensureConnection(): Promise<WebSocket> {
	if (ws && ws.readyState === WebSocket.OPEN) return ws

	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error(
				'Could not connect to tldraw widget. Make sure the widget is running:\n' +
				'  cd widget && bun run dev\n' +
				'  # in another terminal:\n' +
				'  bun widget/ws-server.ts'
			))
		}, CONNECT_TIMEOUT)

		const socket = new WebSocket(WS_URL)

		socket.onopen = () => {
			clearTimeout(timer)
			ws = socket
			resolve(socket)
		}

		socket.onerror = () => {
			clearTimeout(timer)
			reject(new Error(
				'Could not connect to tldraw widget on ws://localhost:4000.\n' +
				'Start the widget first with: tldraw-claude start'
			))
		}

		socket.onmessage = (event) => {
			try {
				const data = JSON.parse(String(event.data))
				const requestId = data.requestId as string
				const entry = pending.get(requestId)
				if (entry) {
					clearTimeout(entry.timer)
					pending.delete(requestId)
					entry.resolve(data)
				}
			} catch {
				// ignore malformed messages
			}
		}

		socket.onclose = () => {
			ws = null
			// Reject all pending requests
			for (const [id, entry] of pending) {
				clearTimeout(entry.timer)
				entry.reject(new Error('WebSocket connection closed'))
				pending.delete(id)
			}
		}
	})
}

async function sendCommand(
	type: string,
	params: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
	const socket = await ensureConnection()
	const requestId = String(++requestCounter)

	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			pending.delete(requestId)
			reject(new Error(`Command "${type}" timed out after ${COMMAND_TIMEOUT}ms`))
		}, COMMAND_TIMEOUT)

		pending.set(requestId, { resolve, reject, timer })
		socket.send(JSON.stringify({ type, requestId, ...params }))
	})
}

// ── Tool definitions ─────────────────────────────────────────────────────

const TOOLS = [
	{
		name: 'create_shape',
		description:
			'Create a shape on the tldraw canvas. Supported shape types: geo (rectangle, ellipse, triangle, diamond, pentagon, hexagon, star, cloud, heart), text, note.',
		inputSchema: {
			type: 'object' as const,
			properties: {
				shapeType: {
					type: 'string',
					enum: ['geo', 'text', 'note'],
					description: 'The type of shape to create',
					default: 'geo',
				},
				x: { type: 'number', description: 'X position', default: 0 },
				y: { type: 'number', description: 'Y position', default: 0 },
				w: { type: 'number', description: 'Width (geo shapes)', default: 200 },
				h: { type: 'number', description: 'Height (geo shapes)', default: 200 },
				geo: {
					type: 'string',
					enum: [
						'rectangle', 'ellipse', 'triangle', 'diamond',
						'pentagon', 'hexagon', 'star', 'cloud', 'heart',
					],
					description: 'Geo sub-type (only for shapeType=geo)',
					default: 'rectangle',
				},
				text: { type: 'string', description: 'Text content' },
				color: {
					type: 'string',
					enum: ['black', 'grey', 'light-violet', 'violet', 'blue', 'light-blue', 'yellow', 'orange', 'green', 'light-green', 'light-red', 'red', 'white'],
					description: 'Shape color',
				},
				fill: {
					type: 'string',
					enum: ['none', 'semi', 'solid', 'pattern'],
					description: 'Fill style',
				},
				size: {
					type: 'string',
					enum: ['s', 'm', 'l', 'xl'],
					description: 'Text size (text/note shapes)',
				},
			},
		},
	},
	{
		name: 'update_shape',
		description: 'Update properties of an existing shape by its ID.',
		inputSchema: {
			type: 'object' as const,
			properties: {
				id: { type: 'string', description: 'Shape ID to update' },
				x: { type: 'number', description: 'New X position' },
				y: { type: 'number', description: 'New Y position' },
				w: { type: 'number', description: 'New width' },
				h: { type: 'number', description: 'New height' },
				text: { type: 'string', description: 'New text content' },
				color: { type: 'string', description: 'New color' },
				fill: { type: 'string', description: 'New fill style' },
				geo: { type: 'string', description: 'New geo sub-type' },
			},
			required: ['id'],
		},
	},
	{
		name: 'delete_shapes',
		description: 'Delete one or more shapes by their IDs.',
		inputSchema: {
			type: 'object' as const,
			properties: {
				ids: {
					type: 'array',
					items: { type: 'string' },
					description: 'Array of shape IDs to delete',
				},
			},
			required: ['ids'],
		},
	},
	{
		name: 'connect_shapes',
		description:
			'Draw an arrow connecting two shapes. Optionally add a label to the arrow.',
		inputSchema: {
			type: 'object' as const,
			properties: {
				fromId: { type: 'string', description: 'Source shape ID' },
				toId: { type: 'string', description: 'Target shape ID' },
				label: { type: 'string', description: 'Arrow label text' },
				color: { type: 'string', description: 'Arrow color' },
			},
			required: ['fromId', 'toId'],
		},
	},
	{
		name: 'get_snapshot',
		description:
			'Get a snapshot of all shapes currently on the canvas. Returns shape IDs, types, positions, and properties.',
		inputSchema: {
			type: 'object' as const,
			properties: {},
		},
	},
	{
		name: 'clear_canvas',
		description: 'Delete all shapes from the canvas.',
		inputSchema: {
			type: 'object' as const,
			properties: {},
		},
	},
]

// ── MCP server ───────────────────────────────────────────────────────────

const server = new Server(
	{ name: 'tldraw-claude', version: '0.1.0' },
	{ capabilities: { tools: {} } },
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
	tools: TOOLS,
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params

	try {
		const result = await sendCommand(name, (args ?? {}) as Record<string, unknown>)

		if (result.error) {
			return {
				content: [{ type: 'text', text: `Error: ${result.error}` }],
				isError: true,
			}
		}

		// Format snapshot results as readable text
		if (name === 'get_snapshot' && Array.isArray(result.shapes)) {
			if (result.shapes.length === 0) {
				return { content: [{ type: 'text', text: 'Canvas is empty.' }] }
			}
			const lines = (result.shapes as Record<string, unknown>[]).map((s) => {
				let desc = `- ${s.id}: ${s.type}`
				if (s.geo) desc += ` (${s.geo})`
				desc += ` at (${s.x}, ${s.y})`
				if (s.w && s.h) desc += ` ${s.w}x${s.h}`
				if (s.text) desc += ` "${s.text}"`
				if (s.color) desc += ` [${s.color}]`
				return desc
			})
			return {
				content: [{ type: 'text', text: lines.join('\n') }],
			}
		}

		return {
			content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
		}
	} catch (err) {
		return {
			content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
			isError: true,
		}
	}
})

// Start
const transport = new StdioServerTransport()
await server.connect(transport)
