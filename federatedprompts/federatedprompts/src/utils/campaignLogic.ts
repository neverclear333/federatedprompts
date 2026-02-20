/**
 * Campaign Logic Utilities
 * Handles campaign automation, scheduling, and client progression
 */

import type { Client, ClientSegment } from '../types/realEstate';
import { getCampaignSequence, getEmailCountForSegment } from './emailTemplates';

/**
 * Initialize campaign for a client when segment is assigned
 */
export function initializeCampaign(
	client: Client,
	segment: ClientSegment
): Client {
	const now = new Date();
	const emailCount = getEmailCountForSegment(segment);

	return {
		...client,
		segment,
		campaignStatus: {
			segmentTag: segment,
			currentEmailNumber: 1,
			campaignStartDate: now.toISOString(),
			nextEmailDate: now.toISOString(), // Send first email immediately
		},
		lastEmailSent: undefined,
		updatedAt: now.toISOString(),
	};
}

/**
 * Advance client to next email in campaign
 */
export function advanceCampaignEmail(client: Client): Client {
	const sequence = getCampaignSequence(client.segment);
	const nextEmailNumber = client.campaignStatus.currentEmailNumber + 1;

	// Check if campaign is complete
	if (nextEmailNumber > sequence.emailCount) {
		return client; // Already completed all emails
	}

	// Get the next email to determine scheduling
	const nextEmail = sequence.emails.find((e) => e.number === nextEmailNumber);
	if (!nextEmail) {
		return client;
	}

	const now = new Date();
	const nextEmailDate = new Date(now.getTime() + nextEmail.sendDelayDays * 24 * 60 * 60 * 1000);

	return {
		...client,
		campaignStatus: {
			...client.campaignStatus,
			currentEmailNumber: nextEmailNumber,
			nextEmailDate: nextEmailDate.toISOString(),
		},
		lastEmailSent: now.toISOString(),
		updatedAt: now.toISOString(),
	};
}

/**
 * Calculate campaign progress percentage
 */
export function calculateCampaignProgress(client: Client): number {
	const totalEmails = getEmailCountForSegment(client.segment);
	const currentEmail = client.campaignStatus.currentEmailNumber;

	if (totalEmails === 0) return 0;
	return Math.round((currentEmail / totalEmails) * 100);
}

/**
 * Check if it's time to send the next email
 */
export function isTimeToSendNextEmail(client: Client): boolean {
	const nextEmailDate = client.campaignStatus.nextEmailDate;
	if (!nextEmailDate) return false;

	const now = new Date();
	const nextDate = new Date(nextEmailDate);

	return now >= nextDate;
}

/**
 * Check if campaign is complete for client
 */
export function isCampaignComplete(client: Client): boolean {
	const totalEmails = getEmailCountForSegment(client.segment);
	return client.campaignStatus.currentEmailNumber >= totalEmails;
}

/**
 * Get campaign summary for client
 */
export function getCampaignSummary(client: Client): {
	emailsSent: number;
	totalEmails: number;
	progressPercent: number;
	isComplete: boolean;
	readyToSend: boolean;
	nextSendDate?: string;
} {
	const totalEmails = getEmailCountForSegment(client.segment);
	const emailsSent = client.campaignStatus.currentEmailNumber - 1;
	const progressPercent = calculateCampaignProgress(client);
	const isComplete = isCampaignComplete(client);
	const readyToSend = isTimeToSendNextEmail(client) && !isComplete;

	return {
		emailsSent,
		totalEmails,
		progressPercent,
		isComplete,
		readyToSend,
		nextSendDate: client.campaignStatus.nextEmailDate,
	};
}

/**
 * Get all clients ready to receive their next campaign email
 */
export function getClientsReadyForNextEmail(clients: Client[]): Client[] {
	return clients.filter(
		(client) => isTimeToSendNextEmail(client) && !isCampaignComplete(client)
	);
}

/**
 * Reset campaign for a client (move to email 1)
 */
export function resetCampaign(client: Client): Client {
	const now = new Date();

	return {
		...client,
		campaignStatus: {
			segmentTag: client.segment,
			currentEmailNumber: 1,
			campaignStartDate: now.toISOString(),
			nextEmailDate: now.toISOString(),
		},
		lastEmailSent: undefined,
		updatedAt: now.toISOString(),
	};
}

/**
 * Manually advance client to specific email number
 */
export function setCurrentEmail(client: Client, emailNumber: number): Client {
	const totalEmails = getEmailCountForSegment(client.segment);

	// Validate email number
	if (emailNumber < 1 || emailNumber > totalEmails) {
		return client;
	}

	const now = new Date();

	return {
		...client,
		campaignStatus: {
			...client.campaignStatus,
			currentEmailNumber: emailNumber,
		},
		updatedAt: now.toISOString(),
	};
}
