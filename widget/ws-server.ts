/**
 * WebSocket relay server.
 *
 * Runs on port 4000 and broadcasts every message to all other connected
 * clients. The MCP server and the browser widget are both clients — this
 * relay simply passes messages between them.
 */

const WS_PORT = 4000

const server = Bun.serve({
	port: WS_PORT,
	fetch(req, server) {
		if (server.upgrade(req)) return
		return new Response('WebSocket relay for tldraw-claude', { status: 200 })
	},
	websocket: {
		open(ws) {
			ws.subscribe('relay')
			console.log(`[ws-relay] Client connected (${server.subscriberCount('relay')} total)`)
		},
		message(ws, message) {
			// Broadcast to all OTHER clients
			ws.publish('relay', message)
		},
		close(ws) {
			ws.unsubscribe('relay')
			console.log(`[ws-relay] Client disconnected`)
		},
	},
})

console.log(`[ws-relay] Listening on ws://localhost:${WS_PORT}`)
