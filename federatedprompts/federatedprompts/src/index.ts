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

		// Static assets and SPA fallback handled by the platform via not_found_handling
		return env.ASSETS.fetch(request);
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
