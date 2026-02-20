/**
 * FederatedPrompts - Cloudflare Worker entry point
 * Routes requests to appropriate API handlers and serves frontend SPA
 */

import { handleConfigRequest } from './api/config';
import { handlePromptRequest } from './api/prompts';
import { handleClientsRequest } from './api/clients';
import { handleCampaignsRequest } from './api/campaigns';
import { handleTasksRequest } from './api/tasks';

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

		// Try to serve static assets (CSS, JS, images, etc.)
		const assetResponse = await env.ASSETS.fetch(request.clone());

		// If asset exists, return it
		if (assetResponse.status !== 404) {
			return assetResponse;
		}

		// For SPA routing: if not an API request and not a static asset, serve index.html
		// This allows React Router to handle the path
		const indexResponse = await env.ASSETS.fetch(new Request(new URL('/index.html', request.url), {
			method: 'GET',
		}));

		// Return index.html with appropriate status
		return indexResponse.status === 404
			? new Response(JSON.stringify({ error: 'Not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				})
			: new Response(indexResponse.body, {
					status: 200,
					headers: new Headers(indexResponse.headers),
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

	// Route to clients API
	if (pathname.startsWith('/api/clients')) {
		return handleClientsRequest(request, url);
	}

	// Route to campaigns API
	if (pathname.startsWith('/api/campaigns')) {
		return handleCampaignsRequest(request, url);
	}

	// Route to tasks API
	if (pathname.startsWith('/api/tasks')) {
		return handleTasksRequest(request, url);
	}

	// Default API 404
	return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
		status: 404,
		headers: { 'Content-Type': 'application/json' },
	});
}
