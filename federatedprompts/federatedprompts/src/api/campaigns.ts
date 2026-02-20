/**
 * Campaign Management API
 * Handles campaign sequences, email previews, and campaign operations
 */

import type { ClientSegment } from '../types/realEstate';
import {
	getCampaignSequence,
	getCampaignEmail,
	getEmailCountForSegment,
	generateEmailHTML,
} from '../utils/emailTemplates';
import { getClient, updateClient } from './clients';
import { advanceCampaignEmail } from '../utils/campaignLogic';

/**
 * Get all campaign types
 */
export function listCampaigns(): {
	campaigns: Array<{ segment: ClientSegment; emailCount: number }>;
} {
	return {
		campaigns: [
			{ segment: 'hotbuyer', emailCount: getEmailCountForSegment('hotbuyer') },
			{ segment: 'hotseller', emailCount: getEmailCountForSegment('hotseller') },
			{ segment: 'investor', emailCount: getEmailCountForSegment('investor') },
			{ segment: 'referral', emailCount: getEmailCountForSegment('referral') },
		],
	};
}

/**
 * Get campaign sequence for a segment
 */
export function getCampaign(segment: ClientSegment): {
	segment: ClientSegment;
	emailCount: number;
	emails: Array<{
		number: number;
		subject: string;
		previewText: string;
		contentType: string;
		sendDelayDays: number;
	}>;
} {
	const sequence = getCampaignSequence(segment);
	return {
		segment: sequence.segmentTag,
		emailCount: sequence.emailCount,
		emails: sequence.emails,
	};
}

/**
 * Get specific email from campaign
 */
export function getCampaignEmailPreview(
	segment: ClientSegment,
	emailNumber: number
): {
	number: number;
	subject: string;
	previewText: string;
	contentType: string;
	sendDelayDays: number;
	htmlContent?: string;
} | null {
	const email = getCampaignEmail(segment, emailNumber);
	if (!email) return null;

	return {
		...email,
		htmlContent: generateEmailHTML(segment, emailNumber),
	};
}

/**
 * Advance client to next email in campaign
 */
export function advanceClientCampaign(clientId: string): {
	success: boolean;
	client?: any;
	message: string;
} {
	const client = getClient(clientId);
	if (!client) {
		return { success: false, message: 'Client not found' };
	}

	const updated = advanceCampaignEmail(client);
	updateClient(clientId, updated);

	return {
		success: true,
		client: updated,
		message: `Advanced to email ${updated.campaignStatus.currentEmailNumber}`,
	};
}

/**
 * Send campaign email to client (simulation)
 * In production, this would integrate with email service (SendGrid, Mailchimp, etc)
 */
export function sendCampaignEmail(clientId: string): {
	success: boolean;
	message: string;
	emailDetails?: {
		to: string;
		subject: string;
		emailNumber: number;
		segment: ClientSegment;
	};
} {
	const client = getClient(clientId);
	if (!client) {
		return { success: false, message: 'Client not found' };
	}

	const { currentEmailNumber } = client.campaignStatus;
	const emailPreview = getCampaignEmailPreview(client.segment, currentEmailNumber);

	if (!emailPreview) {
		return { success: false, message: 'Email not found in campaign sequence' };
	}

	// In production, send actual email here
	// For now, just advance the campaign
	const updated = advanceCampaignEmail(client);
	updateClient(clientId, updated);

	return {
		success: true,
		message: `Email ${currentEmailNumber} sent to ${client.email}`,
		emailDetails: {
			to: client.email,
			subject: emailPreview.subject,
			emailNumber: currentEmailNumber,
			segment: client.segment,
		},
	};
}

/**
 * Get next scheduled email for client
 */
export function getClientNextEmail(clientId: string): {
	success: boolean;
	emailData?: any;
	message: string;
} {
	const client = getClient(clientId);
	if (!client) {
		return { success: false, message: 'Client not found' };
	}

	const { currentEmailNumber } = client.campaignStatus;
	const emailCount = getEmailCountForSegment(client.segment);

	if (currentEmailNumber > emailCount) {
		return {
			success: false,
			message: `Client has completed all ${emailCount} emails in ${client.segment} campaign`,
		};
	}

	const emailPreview = getCampaignEmailPreview(client.segment, currentEmailNumber);

	if (!emailPreview) {
		return { success: false, message: 'Email not found' };
	}

	return {
		success: true,
		emailData: {
			emailNumber: currentEmailNumber,
			totalEmails: emailCount,
			progressPercent: Math.round((currentEmailNumber / emailCount) * 100),
			...emailPreview,
		},
		message: `Next email ready for ${client.firstName} ${client.lastName}`,
	};
}

/**
 * Handle campaign API requests
 */
export async function handleCampaignsRequest(
	request: Request,
	url: URL
): Promise<Response> {
	try {
		const pathname = url.pathname;

		// GET /api/campaigns/list
		if (pathname === '/api/campaigns/list' && request.method === 'GET') {
			const result = listCampaigns();
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/campaigns/:segment
		const segmentMatch = pathname.match(/^\/api\/campaigns\/([^/]+)$/);
		if (segmentMatch && request.method === 'GET') {
			const segment = segmentMatch[1] as ClientSegment;

			if (!['hotbuyer', 'hotseller', 'investor', 'referral'].includes(segment)) {
				return new Response(JSON.stringify({ error: 'Invalid segment' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			const campaign = getCampaign(segment);
			return new Response(JSON.stringify({ success: true, campaign }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/campaigns/:segment/:emailNumber
		const emailMatch = pathname.match(/^\/api\/campaigns\/([^/]+)\/(\d+)$/);
		if (emailMatch && request.method === 'GET') {
			const segment = emailMatch[1] as ClientSegment;
			const emailNumber = parseInt(emailMatch[2], 10);

			const email = getCampaignEmailPreview(segment, emailNumber);
			if (!email) {
				return new Response(JSON.stringify({ error: 'Email not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ success: true, email }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// POST /api/campaigns/advance/:clientId
		const advanceMatch = pathname.match(/^\/api\/campaigns\/advance\/([^/]+)$/);
		if (advanceMatch && request.method === 'POST') {
			const clientId = advanceMatch[1];
			const result = advanceClientCampaign(clientId);

			return new Response(JSON.stringify(result), {
				status: result.success ? 200 : 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// POST /api/campaigns/send/:clientId
		const sendMatch = pathname.match(/^\/api\/campaigns\/send\/([^/]+)$/);
		if (sendMatch && request.method === 'POST') {
			const clientId = sendMatch[1];
			const result = sendCampaignEmail(clientId);

			return new Response(JSON.stringify(result), {
				status: result.success ? 200 : 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/campaigns/client/:clientId/next
		const nextMatch = pathname.match(/^\/api\/campaigns\/client\/([^/]+)\/next$/);
		if (nextMatch && request.method === 'GET') {
			const clientId = nextMatch[1];
			const result = getClientNextEmail(clientId);

			return new Response(JSON.stringify(result), {
				status: result.success ? 200 : 400,
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
