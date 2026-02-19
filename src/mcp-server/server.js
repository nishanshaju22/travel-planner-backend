import express from 'express'
import crypto from 'crypto'
import { z } from 'zod'

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { TripTools } from './src/tools/trip_tools.js'

export async function initMCPServer() {
	const app = express()
	app.use(express.json())

	const mcp = new McpServer({
		name: 'travel-planner-mcp-server',
		version: '1.0.0',
	})

	mcp.registerTool(
		'hello',
		{
			title: 'Hello',
			description: 'Say hello to a user',
			inputSchema: {
				type: 'object',
				properties: {
					name: { type: 'string' },
				},
				required: ['name'],
			},
		},
		async({ name }) => {
			return {
				content: [
					{
						type: 'text',
						text: `Hello, ${name}!`,
					},
				],
			}
		},
	)


	new TripTools(mcp)

	const transport = new StreamableHTTPServerTransport({
		sessionIdGenerator: () => crypto.randomUUID(),
	})

	await mcp.connect(transport)

	app.post('/mcp', async(req, res) => {
		await transport.handleRequest(req, res, req.body)
	})

	app.get('/mcp', async(req, res) => {
		await transport.handleRequest(req, res)
	})

	const PORT = 8000

	app.listen(PORT, () => {
		console.log(`MCP Server running on http://localhost:${PORT}/mcp`)
	})

	return mcp
}
