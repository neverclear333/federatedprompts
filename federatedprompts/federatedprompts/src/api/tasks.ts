/**
 * Task Management API
 * Handles follow-up tasks for clients
 */

import type { FollowUpTask } from '../types/realEstate';

// In-memory storage (ready for D1 database upgrade)
const taskDatabase = new Map<string, FollowUpTask>();

/**
 * Create a new task
 */
export function createTask(data: {
	clientId: string;
	title: string;
	description?: string;
	dueDate: string;
	priority: 'low' | 'medium' | 'high';
	taskType: 'call' | 'email' | 'meeting' | 'follow-up' | 'other';
}): FollowUpTask {
	// Validate required fields
	if (!data.clientId || !data.title || !data.dueDate) {
		throw new Error('Missing required fields: clientId, title, dueDate');
	}

	// Validate priority
	if (!['low', 'medium', 'high'].includes(data.priority)) {
		throw new Error('Invalid priority level');
	}

	// Validate task type
	const validTaskTypes = ['call', 'email', 'meeting', 'follow-up', 'other'];
	if (!validTaskTypes.includes(data.taskType)) {
		throw new Error('Invalid task type');
	}

	const taskId = generateId();
	const now = new Date().toISOString();

	const task: FollowUpTask = {
		id: taskId,
		clientId: data.clientId,
		title: data.title,
		description: data.description || '',
		dueDate: data.dueDate,
		completed: false,
		priority: data.priority,
		taskType: data.taskType,
		createdAt: now,
	};

	taskDatabase.set(taskId, task);
	return task;
}

/**
 * Get a single task by ID
 */
export function getTask(taskId: string): FollowUpTask | null {
	return taskDatabase.get(taskId) || null;
}

/**
 * List all tasks with optional filtering
 */
export function listTasks(filters?: {
	clientId?: string;
	completed?: boolean;
	priority?: string;
	dueDate?: { from: string; to: string };
	limit?: number;
	offset?: number;
}): { tasks: FollowUpTask[]; total: number } {
	let tasks = Array.from(taskDatabase.values());

	// Filter by client
	if (filters?.clientId) {
		tasks = tasks.filter((t) => t.clientId === filters.clientId);
	}

	// Filter by completion status
	if (filters?.completed !== undefined) {
		tasks = tasks.filter((t) => t.completed === filters.completed);
	}

	// Filter by priority
	if (filters?.priority) {
		tasks = tasks.filter((t) => t.priority === filters.priority);
	}

	// Filter by due date range
	if (filters?.dueDate) {
		const from = new Date(filters.dueDate.from);
		const to = new Date(filters.dueDate.to);
		tasks = tasks.filter((t) => {
			const dueDate = new Date(t.dueDate);
			return dueDate >= from && dueDate <= to;
		});
	}

	// Sort by due date
	tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

	const total = tasks.length;

	// Apply pagination
	if (filters?.offset !== undefined) {
		tasks = tasks.slice(filters.offset);
	}
	if (filters?.limit !== undefined) {
		tasks = tasks.slice(0, filters.limit);
	}

	return { tasks, total };
}

/**
 * Update a task
 */
export function updateTask(
	taskId: string,
	updates: Partial<FollowUpTask>
): FollowUpTask {
	const task = taskDatabase.get(taskId);
	if (!task) {
		throw new Error(`Task ${taskId} not found`);
	}

	// Don't allow modifying certain fields
	const { id, clientId, createdAt, ...allowedUpdates } = updates;

	const updated: FollowUpTask = {
		...task,
		...allowedUpdates,
		id: task.id,
		clientId: task.clientId,
		createdAt: task.createdAt,
	};

	taskDatabase.set(taskId, updated);
	return updated;
}

/**
 * Mark task as complete
 */
export function completeTask(taskId: string): FollowUpTask {
	return updateTask(taskId, { completed: true });
}

/**
 * Delete a task
 */
export function deleteTask(taskId: string): boolean {
	return taskDatabase.delete(taskId);
}

/**
 * Get all tasks for a client
 */
export function getClientTasks(clientId: string): FollowUpTask[] {
	return Array.from(taskDatabase.values())
		.filter((t) => t.clientId === clientId)
		.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

/**
 * Get overdue tasks
 */
export function getOverdueTasks(): FollowUpTask[] {
	const now = new Date();
	return Array.from(taskDatabase.values())
		.filter((t) => !t.completed && new Date(t.dueDate) < now)
		.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

/**
 * Get upcoming tasks (due in next 7 days)
 */
export function getUpcomingTasks(): FollowUpTask[] {
	const now = new Date();
	const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

	return Array.from(taskDatabase.values())
		.filter((t) => !t.completed && new Date(t.dueDate) >= now && new Date(t.dueDate) <= weekFromNow)
		.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

/**
 * Get task statistics
 */
export function getTaskStats(): {
	total: number;
	completed: number;
	pending: number;
	overdue: number;
} {
	const all = Array.from(taskDatabase.values());
	const completed = all.filter((t) => t.completed).length;
	const overdue = getOverdueTasks().length;

	return {
		total: all.length,
		completed,
		pending: all.length - completed,
		overdue,
	};
}

// ===== Helper Functions =====

/**
 * Generate unique ID for task
 */
function generateId(): string {
	return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Handle task API requests
 */
export async function handleTasksRequest(
	request: Request,
	url: URL
): Promise<Response> {
	try {
		const pathname = url.pathname;

		// POST /api/tasks/create
		if (pathname === '/api/tasks/create' && request.method === 'POST') {
			const data = (await request.json()) as any;
			const task = createTask(data);
			return new Response(JSON.stringify({ success: true, task }), {
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/tasks/list
		if (pathname === '/api/tasks/list' && request.method === 'GET') {
			const clientId = url.searchParams.get('clientId');
			const completed = url.searchParams.get('completed')
				? url.searchParams.get('completed') === 'true'
				: undefined;
			const priority = url.searchParams.get('priority');
			const limit = url.searchParams.get('limit')
				? parseInt(url.searchParams.get('limit')!, 10)
				: undefined;
			const offset = url.searchParams.get('offset')
				? parseInt(url.searchParams.get('offset')!, 10)
				: undefined;

			const result = listTasks({
				clientId: clientId || undefined,
				completed,
				priority: priority || undefined,
				limit,
				offset,
			});

			return new Response(JSON.stringify(result), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/tasks/stats
		if (pathname === '/api/tasks/stats' && request.method === 'GET') {
			const stats = getTaskStats();
			return new Response(JSON.stringify({ success: true, stats }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/tasks/overdue
		if (pathname === '/api/tasks/overdue' && request.method === 'GET') {
			const tasks = getOverdueTasks();
			return new Response(JSON.stringify({ success: true, tasks, count: tasks.length }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/tasks/upcoming
		if (pathname === '/api/tasks/upcoming' && request.method === 'GET') {
			const tasks = getUpcomingTasks();
			return new Response(JSON.stringify({ success: true, tasks, count: tasks.length }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/tasks/client/:clientId
		const clientTasksMatch = pathname.match(/^\/api\/tasks\/client\/([^/]+)$/);
		if (clientTasksMatch && request.method === 'GET') {
			const clientId = clientTasksMatch[1];
			const tasks = getClientTasks(clientId);

			return new Response(JSON.stringify({ success: true, tasks }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// GET /api/tasks/:id
		const taskIdMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
		if (taskIdMatch && request.method === 'GET') {
			const taskId = taskIdMatch[1];
			const task = getTask(taskId);

			if (!task) {
				return new Response(JSON.stringify({ error: 'Task not found' }), {
					status: 404,
					headers: { 'Content-Type': 'application/json' },
				});
			}

			return new Response(JSON.stringify({ success: true, task }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// PUT /api/tasks/:id
		if (taskIdMatch && request.method === 'PUT') {
			const taskId = taskIdMatch[1];
			const updates = (await request.json()) as any;
			const task = updateTask(taskId, updates);

			return new Response(JSON.stringify({ success: true, task }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// POST /api/tasks/:id/complete
		const completeMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/complete$/);
		if (completeMatch && request.method === 'POST') {
			const taskId = completeMatch[1];
			const task = completeTask(taskId);

			return new Response(JSON.stringify({ success: true, task }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// DELETE /api/tasks/:id
		if (taskIdMatch && request.method === 'DELETE') {
			const taskId = taskIdMatch[1];
			const success = deleteTask(taskId);

			if (!success) {
				return new Response(JSON.stringify({ error: 'Task not found' }), {
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
