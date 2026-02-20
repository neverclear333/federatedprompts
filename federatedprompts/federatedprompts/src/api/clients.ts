/**
 * Client Management API
 * Handles CRUD operations for real estate clients/leads
 */

import type { Client, ClientSegment } from '../types/realEstate';
import { initializeCampaign, resetCampaign } from '../utils/campaignLogic';
import { v4 as uuidv4 } from 'crypto';

// In-memory storage (ready for D1 database upgrade)
const clientDatabase = new Map<string, Client>();

/**
 * Create a new client
 */
export function createClient(data: {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address?: string;
	city?: string;
	zipcode?: string;
	state?: string;
	segment: ClientSegment;
	source: string;
	sourceDetails?: string;
	notes?: string;
}): Client {
	// Validate required fields
	if (!data.firstName || !data.lastName || !data.email || !data.phone) {
		throw new Error('Missing required fields: firstName, lastName, email, phone');
	}

	// Validate email format
	if (!isValidEmail(data.email)) {
		throw new Error('Invalid email format');
	}

	const clientId = generateId();
	const now = new Date().toISOString();

	// Create client with campaign initialized
	const client: Client = {
		id: clientId,
		firstName: data.firstName,
		lastName: data.lastName,
		email: data.email,
		phone: data.phone,
		address: data.address,
		city: data.city,
		zipcode: data.zipcode,
		state: data.state,
		segment: data.segment,
		customSegmentTags: [],
		campaignStatus: {
			segmentTag: data.segment,
			currentEmailNumber: 1,
			campaignStartDate: now,
			nextEmailDate: now,
		},
		source: data.source,
		sourceDetails: data.sourceDetails,
		notes: data.notes || '',
		doNotContact: false,
		createdAt: now,
		updatedAt: now,
	};

	clientDatabase.set(clientId, client);
	return client;
}

/**
 * Get a single client by ID
 */
export function getClient(clientId: string): Client | null {
	return clientDatabase.get(clientId) || null;
}

/**
 * List all clients with optional filtering
 */
export function listClients(filters?: {
	segment?: ClientSegment;
	search?: string;
	limit?: number;
	offset?: number;
}): { clients: Client[]; total: number } {
	let clients = Array.from(clientDatabase.values());

	// Filter by segment
	if (filters?.segment) {
		clients = clients.filter((c) => c.segment === filters.segment);
	}

	// Filter by search term (name, email, phone)
	if (filters?.search) {
		const search = filters.search.toLowerCase();
		clients = clients.filter(
			(c) =>
				c.firstName.toLowerCase().includes(search) ||
				c.lastName.toLowerCase().includes(search) ||
				c.email.toLowerCase().includes(search) ||
				c.phone.includes(search)
		);
	}

	const total = clients.length;

	// Apply pagination
	if (filters?.offset !== undefined) {
		clients = clients.slice(filters.offset);
	}
	if (filters?.limit !== undefined) {
		clients = clients.slice(0, filters.limit);
	}

	return { clients, total };
}

/**
 * Update a client
 */
export function updateClient(
	clientId: string,
	updates: Partial<Client>
): Client {
	const client = clientDatabase.get(clientId);
	if (!client) {
		throw new Error(`Client ${clientId} not found`);
	}

	// Don't allow modifying certain fields
	const { id, createdAt, campaignStatus, ...allowedUpdates } = updates;

	const updated: Client = {
		...client,
		...allowedUpdates,
		id: client.id,
		createdAt: client.createdAt,
		campaignStatus: client.campaignStatus,
		updatedAt: new Date().toISOString(),
	};

	clientDatabase.set(clientId, updated);
	return updated;
}

/**
 * Update client segment (triggers campaign reset)
 */
export function updateClientSegment(
	clientId: string,
	newSegment: ClientSegment
): Client {
	const client = clientDatabase.get(clientId);
	if (!client) {
		throw new Error(`Client ${clientId} not found`);
	}

	// Reset campaign to start of new segment
	const updated = resetCampaign({
		...client,
		segment: newSegment,
	});

	clientDatabase.set(clientId, updated);
	return updated;
}

/**
 * Delete a client
 */
export function deleteClient(clientId: string): boolean {
	return clientDatabase.delete(clientId);
}

/**
 * Get client count by segment
 */
export function getClientCountBySegment(): Record<ClientSegment, number> {
	const counts: Record<ClientSegment, number> = {
		hotbuyer: 0,
		hotseller: 0,
		investor: 0,
		referral: 0,
	};

	clientDatabase.forEach((client) => {
		counts[client.segment]++;
	});

	return counts;
}

/**
 * Get dashboard statistics
 */
export function getDashboardStats(): {
	totalClients: number;
	hotbuyerCount: number;
	hotsellerCount: number;
	investorCount: number;
	referralCount: number;
} {
	const counts = getClientCountBySegment();

	return {
		totalClients: clientDatabase.size,
		hotbuyerCount: counts.hotbuyer,
		hotsellerCount: counts.hotseller,
		investorCount: counts.investor,
		referralCount: counts.referral,
	};
}

// ===== Helper Functions =====

/**
 * Generate unique ID for client
 */
function generateId(): string {
	return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Handle client API requests
 */
export async function handleClientsRequest(
	request: Request,
	url: URL
): Promise<Response> {
	try {
		const pathname = url.pathname;

		// POST /api/clients/create
		if (pathname === '/api/clients/create' && request.method === 'POST') {
			const data = (await request.json()) as any;
			const client = createClient(data);
			return new Response(JSON.stringify({ success: true, client }), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/clients/list
		if (pathname === '/api/clients/list' && request.method === 'GET') {
			const segment = url.searchParams.get('segment') as ClientSegment | null;
			const search = url.searchParams.get('search');
			const limit = url.searchParams.get('limit')
				? parseInt(url.searchParams.get('limit')!, 10)
				: undefined;
			const offset = url.searchParams.get('offset')
				? parseInt(url.searchParams.get('offset')!, 10)
				: undefined;

			const result = listClients({ segment: segment || undefined, search: search || undefined, limit, offset });

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/clients/stats
		if (pathname === '/api/clients/stats' && request.method === 'GET') {
			const stats = getDashboardStats();
			return new Response(JSON.stringify({ success: true, stats }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/clients/:id
		const clientIdMatch = pathname.match(/^\/api\/clients\/([^/]+)$/);
		if (clientIdMatch && request.method === 'GET') {
			const clientId = clientIdMatch[1];
			const client = getClient(clientId);

			if (!client) {
				return new Response(JSON.stringify({ error: 'Client not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ success: true, client }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// PUT /api/clients/:id
		if (clientIdMatch && request.method === 'PUT') {
			const clientId = clientIdMatch[1];
			const updates = (await request.json()) as any;
			const client = updateClient(clientId, updates);

			return new Response(JSON.stringify({ success: true, client }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// PUT /api/clients/:id/segment
		const segmentMatch = pathname.match(/^\/api\/clients\/([^/]+)\/segment$/);
		if (segmentMatch && request.method === 'PUT') {
			const clientId = segmentMatch[1];
			const { segment } = (await request.json()) as any;

			if (!['hotbuyer', 'hotseller', 'investor', 'referral'].includes(segment)) {
				return new Response(JSON.stringify({ error: 'Invalid segment' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const client = updateClientSegment(clientId, segment);

			return new Response(JSON.stringify({ success: true, client }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// DELETE /api/clients/:id
		if (clientIdMatch && request.method === 'DELETE') {
			const clientId = clientIdMatch[1];
			const success = deleteClient(clientId);

			if (!success) {
				return new Response(JSON.stringify({ error: 'Client not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Not found
		return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
			status: 404,
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return new Response(JSON.stringify({ error: message }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
