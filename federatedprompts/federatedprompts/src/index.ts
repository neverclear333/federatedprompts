/**
 * FederatedPrompts - Cloudflare Worker entry point
 * Routes requests to appropriate API handlers
 */

import { handleConfigRequest } from './api/config';
import { handlePromptRequest } from './api/prompts';

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Route API requests
		if (url.pathname.startsWith('/api/')) {
			return handleApiRequest(request, env, url);
		}

		// Health check endpoint
		if (url.pathname === '/health') {
			return new Response(
				JSON.stringify({
					status: 'ok',
					timestamp: new Date().toISOString(),
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Root endpoint
		if (url.pathname === '/' || url.pathname === '') {
			return new Response(
				JSON.stringify({
					name: 'FederatedPrompts API',
					version: '1.0.0',
					status: 'running',
				}),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			);
		}

		// Default 404
		return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	},
} satisfies ExportedHandler<Env>;

async function handleApiRequest(request: Request, env: Env, url: URL): Promise<Response> {
	const pathname = url.pathname;

	// Route to config API
	if (pathname.startsWith('/api/config/')) {
		return handleConfigRequest(url);
	}

	// Route to prompts API
	if (pathname.startsWith('/api/prompts')) {
		return handlePromptRequest(request, url);
	}

	// Default API 404
	return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
		status: 404,
		headers: { 'Content-Type': 'application/json' },
	});
}
