/**
 * useRealEstateDashboard Hook
 * Manages real estate dashboard state, client data, tasks, and campaigns
 */

import { useState, useCallback, useEffect } from 'react';
import type {
	Client,
	ClientSegment,
	FollowUpTask,
	DashboardFilters,
	DashboardState,
	ClientCampaignStatus,
	CreateClientRequest,
	CreateTaskRequest,
} from '../types/realEstate';

const CACHE_KEY = 'realEstateDashboard_clients';
const TASKS_CACHE_KEY = 'realEstateDashboard_tasks';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate unique ID
 */
function generateId(): string {
	return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get campaign sequence for a segment
 */
function getCampaignSequence(segment: ClientSegment): { totalEmails: number } {
	const sequences: Record<ClientSegment, number> = {
		hotbuyer: 5,
		hotseller: 5,
		investor: 3,
		referral: 3,
	};
	return { totalEmails: sequences[segment] || 5 };
}

/**
 * Main hook
 */
export function useRealEstateDashboard() {
	const [state, setState] = useState<DashboardState>(() => {
		// Load from cache if available
		const cachedClients = localStorage.getItem(CACHE_KEY);
		const cachedTasks = localStorage.getItem(TASKS_CACHE_KEY);

		let clients: Client[] = [];
		let tasks: FollowUpTask[] = [];

		if (cachedClients) {
			try {
				const cached = JSON.parse(cachedClients);
				if (cached.timestamp && Date.now() - cached.timestamp < CACHE_DURATION) {
					clients = cached.data;
				}
			} catch (e) {
				console.error('Failed to load clients cache:', e);
			}
		}

		if (cachedTasks) {
			try {
				const cached = JSON.parse(cachedTasks);
				if (cached.timestamp && Date.now() - cached.timestamp < CACHE_DURATION) {
					tasks = cached.data;
				}
			} catch (e) {
				console.error('Failed to load tasks cache:', e);
			}
		}

		return {
			clients,
			tasks,
			filters: {},
			loading: false,
		};
	});

	/**
	 * Save clients to cache
	 */
	const saveClientsToCache = useCallback(() => {
		localStorage.setItem(
			CACHE_KEY,
			JSON.stringify({
				data: state.clients,
				timestamp: Date.now(),
			})
		);
	}, [state.clients]);

	/**
	 * Save tasks to cache
	 */
	const saveTasksToCache = useCallback(() => {
		localStorage.setItem(
			TASKS_CACHE_KEY,
			JSON.stringify({
				data: state.tasks,
				timestamp: Date.now(),
			})
		);
	}, [state.tasks]);

	/**
	 * Auto-save to cache when state changes
	 */
	useEffect(() => {
		saveClientsToCache();
	}, [state.clients, saveClientsToCache]);

	useEffect(() => {
		saveTasksToCache();
	}, [state.tasks, saveTasksToCache]);

	/**
	 * Create new client
	 */
	const createClient = useCallback(
		(data: CreateClientRequest): Client => {
			const newClient: Client = {
				id: generateId(),
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				phone: data.phone,
				segment: data.segment,
				address: data.address,
				city: data.city,
				zipcode: data.zipcode,
				state: data.state,
				source: data.source || 'manual',
				sourceDetails: data.sourceDetails,
				notes: data.notes || '',
				campaignStatus: {
					segmentTag: data.segment,
					currentEmailNumber: 1,
					campaignStartDate: new Date().toISOString(),
				},
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			setState((prev) => ({
				...prev,
				clients: [...prev.clients, newClient],
			}));

			return newClient;
		},
		[]
	);

	/**
	 * Get client by ID
	 */
	const getClient = useCallback(
		(clientId: string): Client | undefined => {
			return state.clients.find((c) => c.id === clientId);
		},
		[state.clients]
	);

	/**
	 * Update client
	 */
	const updateClient = useCallback((clientId: string, updates: Partial<Client>) => {
		setState((prev) => ({
			...prev,
			clients: prev.clients.map((c) =>
				c.id === clientId
					? {
							...c,
							...updates,
							id: c.id, // Prevent ID override
							createdAt: c.createdAt, // Prevent creation date override
							updatedAt: new Date().toISOString(),
						}
					: c
			),
		}));
	}, []);

	/**
	 * Delete client
	 */
	const deleteClient = useCallback((clientId: string) => {
		setState((prev) => ({
			...prev,
			clients: prev.clients.filter((c) => c.id !== clientId),
			tasks: prev.tasks.filter((t) => t.clientId !== clientId),
		}));
	}, []);

	/**
	 * Update client segment (triggers campaign change)
	 */
	const updateClientSegment = useCallback((clientId: string, newSegment: ClientSegment) => {
		setState((prev) => ({
			...prev,
			clients: prev.clients.map((c) =>
				c.id === clientId
					? {
							...c,
							segment: newSegment,
							campaignStatus: {
								segmentTag: newSegment,
								currentEmailNumber: 1,
								campaignStartDate: new Date().toISOString(),
							},
							updatedAt: new Date().toISOString(),
						}
					: c
			),
		}));
	}, []);

	/**
	 * Get campaign status for client
	 */
	const getCampaignStatus = useCallback(
		(clientId: string): ClientCampaignStatus | undefined => {
			const client = getClient(clientId);
			if (!client) return undefined;

			const sequence = getCampaignSequence(client.segment);
			return {
				segmentTag: client.segment,
				currentEmailNumber: client.campaignStatus.currentEmailNumber,
				totalEmailsInSequence: sequence.totalEmails,
				campaignStartDate: client.campaignStatus.campaignStartDate,
				nextEmailDate: client.campaignStatus.nextEmailDate,
				campaignProgress: Math.round(
					(client.campaignStatus.currentEmailNumber / sequence.totalEmails) * 100
				),
			};
		},
		[getClient]
	);

	/**
	 * Advance client to next email
	 */
	const advanceCampaign = useCallback((clientId: string) => {
		setState((prev) => ({
			...prev,
			clients: prev.clients.map((c) => {
				if (c.id !== clientId) return c;

				const sequence = getCampaignSequence(c.segment);
				const nextEmailNumber = Math.min(
					c.campaignStatus.currentEmailNumber + 1,
					sequence.totalEmails
				);

				return {
					...c,
					campaignStatus: {
						...c.campaignStatus,
						currentEmailNumber: nextEmailNumber,
					},
					updatedAt: new Date().toISOString(),
				};
			}),
		}));
	}, []);

	/**
	 * Filter clients
	 */
	const filterClients = useCallback(
		(filters: DashboardFilters): Client[] => {
			return state.clients.filter((client) => {
				if (filters.segment && client.segment !== filters.segment) {
					return false;
				}

				if (filters.searchTerm) {
					const searchLower = filters.searchTerm.toLowerCase();
					const matchesName =
						client.firstName.toLowerCase().includes(searchLower) ||
						client.lastName.toLowerCase().includes(searchLower);
					const matchesEmail = client.email.toLowerCase().includes(searchLower);
					const matchesPhone = client.phone.includes(filters.searchTerm);

					if (!matchesName && !matchesEmail && !matchesPhone) {
						return false;
					}
				}

				return true;
			});
		},
		[state.clients]
	);

	/**
	 * Update filters
	 */
	const setFilters = useCallback((filters: DashboardFilters) => {
		setState((prev) => ({
			...prev,
			filters,
		}));
	}, []);

	/**
	 * Create follow-up task
	 */
	const createTask = useCallback((data: CreateTaskRequest): FollowUpTask => {
		const newTask: FollowUpTask = {
			id: generateId(),
			clientId: data.clientId,
			title: data.title,
			description: data.description,
			dueDate: data.dueDate,
			completed: false,
			priority: data.priority,
			taskType: data.taskType,
			createdAt: new Date().toISOString(),
		};

		setState((prev) => ({
			...prev,
			tasks: [...prev.tasks, newTask],
		}));

		return newTask;
	}, []);

	/**
	 * Get tasks for client
	 */
	const getClientTasks = useCallback(
		(clientId: string): FollowUpTask[] => {
			return state.tasks.filter((t) => t.clientId === clientId);
		},
		[state.tasks]
	);

	/**
	 * Update task
	 */
	const updateTask = useCallback((taskId: string, updates: Partial<FollowUpTask>) => {
		setState((prev) => ({
			...prev,
			tasks: prev.tasks.map((t) =>
				t.id === taskId
					? {
							...t,
							...updates,
							id: t.id,
							createdAt: t.createdAt,
						}
					: t
			),
		}));
	}, []);

	/**
	 * Delete task
	 */
	const deleteTask = useCallback((taskId: string) => {
		setState((prev) => ({
			...prev,
			tasks: prev.tasks.filter((t) => t.id !== taskId),
		}));
	}, []);

	/**
	 * Complete task
	 */
	const completeTask = useCallback((taskId: string) => {
		updateTask(taskId, { completed: true });
	}, [updateTask]);

	/**
	 * Get upcoming tasks
	 */
	const getUpcomingTasks = useCallback((): FollowUpTask[] => {
		const now = new Date();
		return state.tasks
			.filter((t) => !t.completed && new Date(t.dueDate) >= now)
			.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
	}, [state.tasks]);

	/**
	 * Get overdue tasks
	 */
	const getOverdueTasks = useCallback((): FollowUpTask[] => {
		const now = new Date();
		return state.tasks
			.filter((t) => !t.completed && new Date(t.dueDate) < now)
			.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
	}, [state.tasks]);

	/**
	 * Get client count by segment
	 */
	const getSegmentCount = useCallback(
		(segment: ClientSegment): number => {
			return state.clients.filter((c) => c.segment === segment).length;
		},
		[state.clients]
	);

	/**
	 * Get dashboard statistics
	 */
	const getDashboardStats = useCallback(() => {
		return {
			totalClients: state.clients.length,
			hotbuyerCount: getSegmentCount('hotbuyer'),
			hotsellerCount: getSegmentCount('hotseller'),
			investorCount: getSegmentCount('investor'),
			referralCount: getSegmentCount('referral'),
			totalTasks: state.tasks.length,
			completedTasks: state.tasks.filter((t) => t.completed).length,
			pendingTasks: state.tasks.filter((t) => !t.completed).length,
			overdueTasks: getOverdueTasks().length,
			upcomingTasks: getUpcomingTasks().length,
		};
	}, [state.clients, state.tasks, getSegmentCount, getOverdueTasks, getUpcomingTasks]);

	return {
		state,
		// Client operations
		createClient,
		getClient,
		updateClient,
		deleteClient,
		updateClientSegment,
		filterClients,
		setFilters,
		// Campaign operations
		getCampaignStatus,
		advanceCampaign,
		getCampaignSequence,
		// Task operations
		createTask,
		getClientTasks,
		updateTask,
		deleteTask,
		completeTask,
		getUpcomingTasks,
		getOverdueTasks,
		// Stats
		getSegmentCount,
		getDashboardStats,
	};
}

export type UseRealEstateDashboardReturn = ReturnType<typeof useRealEstateDashboard>;
