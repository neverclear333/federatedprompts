/**
 * Configuration API endpoints
 * Serves the federated configuration to frontend for populating dropdowns
 * and validating all inputs against the single source of truth
 */

import type { Env } from '../env';
import { federatedConfig, FederatedConfigSchema } from '../utils/federatedConfig';

export async function handleConfigRequest(request: Request, env: Env, url: URL): Promise<Response> {
	const pathname = url.pathname;

	// GET /api/config/all - Return complete configuration
	if (pathname === '/api/config/all') {
		return new Response(JSON.stringify(federatedConfig), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /api/config/uml-artifacts
	if (pathname === '/api/config/uml-artifacts') {
		return new Response(JSON.stringify(federatedConfig.umlArtifacts), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /api/config/prompt-styles
	if (pathname === '/api/config/prompt-styles') {
		return new Response(JSON.stringify(federatedConfig.promptStyles), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /api/config/tech-stack
	if (pathname === '/api/config/tech-stack') {
		return new Response(JSON.stringify(federatedConfig.techStack), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /api/config/team-roles
	if (pathname === '/api/config/team-roles') {
		return new Response(JSON.stringify(federatedConfig.teamRoles), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /api/config/integration-points
	if (pathname === '/api/config/integration-points') {
		return new Response(JSON.stringify(federatedConfig.integrationPoints), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /api/config/project-domains
	if (pathname === '/api/config/project-domains') {
		return new Response(JSON.stringify(federatedConfig.projectDomains), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /api/config/gherkin-patterns
	if (pathname === '/api/config/gherkin-patterns') {
		return new Response(JSON.stringify(federatedConfig.gherkinPatterns), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	// GET /api/config/variables - Get all variable definitions
	if (pathname === '/api/config/variables') {
		return new Response(JSON.stringify(federatedConfig.variables), {
			status: 200,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	return new Response(JSON.stringify({ error: 'Config endpoint not found' }), {
		status: 404,
		headers: { 'Content-Type': 'application/json' },
	});
}
