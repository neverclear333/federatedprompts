/**
 * Real Estate CRM Dashboard Types
 * Interfaces for client management, campaigns, and tasks
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
 * Follow-Up Task
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
	segmentTag: ClientSegment;
	currentEmailNumber: number;
	totalEmailsInSequence: number;
	campaignStartDate: string;
	nextEmailDate?: string;
	campaignProgress: number; // 0-100 percentage
}

/**
 * Dashboard Filter Options
 */
export interface DashboardFilters {
	segment?: ClientSegment;
	searchTerm?: string;
	taskPriority?: 'low' | 'medium' | 'high';
	taskStatus?: 'completed' | 'pending';
	dateRange?: {
		start: string;
		end: string;
	};
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
 * API Request/Response Types
 */

export interface CreateClientRequest {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	segment: ClientSegment;
	address?: string;
	city?: string;
	zipcode?: string;
	state?: string;
	source?: string;
	sourceDetails?: string;
	notes?: string;
}

export interface CreateClientResponse {
	success: boolean;
	client?: Client;
	error?: string;
}

export interface ListClientsResponse {
	success: boolean;
	clients: Client[];
	count: number;
	filters?: DashboardFilters;
}

export interface GetClientResponse {
	success: boolean;
	client?: Client;
	campaignStatus?: ClientCampaignStatus;
	error?: string;
}

export interface UpdateClientRequest {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	segment?: ClientSegment;
	address?: string;
	city?: string;
	zipcode?: string;
	state?: string;
	notes?: string;
	doNotContact?: boolean;
}

export interface UpdateClientResponse {
	success: boolean;
	client?: Client;
	error?: string;
}

export interface CreateTaskRequest {
	clientId: string;
	title: string;
	description?: string;
	dueDate: string;
	priority: 'low' | 'medium' | 'high';
	taskType: 'call' | 'email' | 'meeting' | 'follow-up' | 'other';
}

export interface CreateTaskResponse {
	success: boolean;
	task?: FollowUpTask;
	error?: string;
}

export interface ListTasksResponse {
	success: boolean;
	tasks: FollowUpTask[];
	count: number;
}

export interface GetCampaignSequenceResponse {
	success: boolean;
	emails: CampaignEmail[];
	segment: ClientSegment;
	totalEmails: number;
}

export interface GetCampaignEmailResponse {
	success: boolean;
	email?: CampaignEmail;
	error?: string;
}
