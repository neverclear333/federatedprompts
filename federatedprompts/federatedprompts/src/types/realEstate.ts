/**
 * Real Estate CRM Dashboard Types
 * Backend type definitions for client management, campaigns, and tasks
 */

export type ClientSegment = 'hotbuyer' | 'hotseller' | 'investor' | 'referral';

/**
 * Client/Lead Entity
 */
export interface Client {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;

	address?: string; // Property address
	city?: string;
	zipcode?: string;
	state?: string;

	segment: ClientSegment; // #hotbuyer, #hotseller, #investor, #referral
	customSegmentTags?: string[];

	campaignStatus: {
		segmentTag: string; // Which campaign active
		currentEmailNumber: number; // Email 1, 2, 3, etc. in drip sequence
		campaignStartDate: string;
		nextEmailDate?: string;
	};

	source: string; // "open-house", "website", "qr-code", "referral", "csv-import"
	sourceDetails?: string; // which open house, referrer name, etc.

	notes: string;
	doNotContact?: boolean;

	lastEmailSent?: string;
	lastActivity?: string;

	createdAt: string;
	updatedAt: string;
}

/**
 * Campaign Email Entity
 */
export interface CampaignEmail {
	id: string;
	segmentTag: ClientSegment;
	emailNumber: number; // 1st, 2nd, 3rd email in drip
	subject: string;
	htmlContent: string; // Beautiful HTML email template

	contentBlocks: {
		greeting: string;
		mainContent: string;
		cta?: string; // Call-to-action
		signature: string;
		contentTypes: ('homeowner-tip' | 'mortgage-insight' | 'market-update' | 'listing-feature')[];
	};

	sendDelay: number; // days after previous email (0 = send immediately)
	personalizationVars: string[]; // {{firstName}}, {{propertyAddress}}, etc.

	createdAt: string;
	updatedAt: string;
}

/**
 * Follow-up Task Entity
 */
export interface FollowUpTask {
	id: string;
	clientId: string;
	title: string;
	description?: string;
	dueDate: string;
	completed: boolean;
	priority: 'low' | 'medium' | 'high';
	taskType: 'call' | 'email' | 'meeting' | 'follow-up' | 'other';
	createdAt: string;
}

/**
 * Campaign Status for a Client
 */
export interface ClientCampaignStatus {
	emailsSent: number;
	totalEmails: number;
	progressPercent: number;
	isComplete: boolean;
	readyToSend: boolean;
	nextSendDate?: string;
}

/**
 * Dashboard Filters
 */
export interface DashboardFilters {
	segment?: ClientSegment;
	search?: string;
	dateRange?: { from: string; to: string };
	status?: 'active' | 'completed' | 'all';
}

/**
 * Dashboard State
 */
export interface DashboardState {
	clients: Client[];
	selectedClientId?: string;
	tasks: FollowUpTask[];
	filters: DashboardFilters;
	loading: boolean;
	error?: string;
	lastUpdated?: string;
}

/**
 * API Request Types
 */
export interface CreateClientRequest {
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
}

export interface UpdateClientRequest {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	address?: string;
	city?: string;
	zipcode?: string;
	state?: string;
	notes?: string;
	doNotContact?: boolean;
}

export interface CreateTaskRequest {
	clientId: string;
	title: string;
	description?: string;
	dueDate: string;
	priority: 'low' | 'medium' | 'high';
	taskType: 'call' | 'email' | 'meeting' | 'follow-up' | 'other';
}

export interface UpdateTaskRequest {
	title?: string;
	description?: string;
	dueDate?: string;
	completed?: boolean;
	priority?: 'low' | 'medium' | 'high';
	taskType?: 'call' | 'email' | 'meeting' | 'follow-up' | 'other';
}

/**
 * API Response Types
 */
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	error?: string;
	message?: string;
}

export interface ListResponse<T> {
	items: T[];
	total: number;
	limit?: number;
	offset?: number;
}
