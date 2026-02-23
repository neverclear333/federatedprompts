/**
 * Cloudflare Worker environment type definitions
 */

export interface Env {
	ASSETS: {
		fetch(request: Request): Promise<Response>;
	};
	// Add other bindings here as needed (D1, KV, etc.)
}
