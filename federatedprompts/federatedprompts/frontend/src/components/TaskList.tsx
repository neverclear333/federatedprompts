/**
 * TaskList Component
 * Manages follow-up tasks with filtering and completion tracking
 */

import React, { useState, useMemo } from 'react';
import type { FollowUpTask, CreateTaskRequest } from '../types/realEstate';

interface TaskListProps {
	tasks: FollowUpTask[];
	onCreateTask: (task: CreateTaskRequest) => void;
	onUpdateTask: (taskId: string, updates: Partial<FollowUpTask>) => void;
	onDeleteTask: (taskId: string) => void;
	clientId?: string;
	compact?: boolean;
}

const PRIORITY_COLORS: Record<'low' | 'medium' | 'high', string> = {
	low: '#10b981',
	medium: '#f59e0b',
	high: '#ef4444',
};

const TASK_TYPE_ICONS: Record<string, string> = {
	call: '📞',
	email: '📧',
	meeting: '👥',
	'follow-up': '↩️',
	other: '✓',
};

export const TaskList: React.FC<TaskListProps> = ({
	tasks,
	onCreateTask,
	onUpdateTask,
	onDeleteTask,
	clientId,
	compact = false,
}) => {
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		dueDate: new Date().toISOString().split('T')[0],
		priority: 'medium' as const,
		taskType: 'follow-up' as const,
	});

	// Filter tasks for this client if clientId provided
	const filteredTasks = useMemo(() => {
		const clientTasks = clientId ? tasks.filter((t) => t.clientId === clientId) : tasks;

		// Group by status
		const overdue = clientTasks.filter(
			(t) => !t.completed && new Date(t.dueDate) < new Date()
		);
		const upcoming = clientTasks.filter(
			(t) => !t.completed && new Date(t.dueDate) >= new Date()
		);
		const completed = clientTasks.filter((t) => t.completed);

		return { overdue, upcoming, completed, all: clientTasks };
	}, [tasks, clientId]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!clientId || !formData.title.trim()) return;

		onCreateTask({
			clientId,
			title: formData.title,
			description: formData.description || undefined,
			dueDate: formData.dueDate,
			priority: formData.priority,
			taskType: formData.taskType,
		});

		setFormData({
			title: '',
			description: '',
			dueDate: new Date().toISOString().split('T')[0],
			priority: 'medium',
			taskType: 'follow-up',
		});
		setShowForm(false);
	};

	const renderTask = (task: FollowUpTask) => (
		<div key={task.id} className="task-item">
			<div className="task-header">
				<div className="task-checkbox-wrapper">
					<input
						type="checkbox"
						checked={task.completed}
						onChange={(e) =>
							onUpdateTask(task.id, { completed: e.target.checked })
						}
						className="task-checkbox"
					/>
				</div>

				<div className="task-title-section">
					<h4 className={task.completed ? 'completed' : ''}>
						{TASK_TYPE_ICONS[task.taskType] || '✓'} {task.title}
					</h4>
					{task.description && (
						<p className="task-description">{task.description}</p>
					)}
				</div>

				<button
					onClick={() => onDeleteTask(task.id)}
					className="task-delete"
					title="Delete task"
				>
					🗑️
				</button>
			</div>

			<div className="task-footer">
				<span
					className="priority-badge"
					style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
				>
					{task.priority}
				</span>
				<span className="due-date">
					📅{' '}
					{new Date(task.dueDate).toLocaleDateString(undefined, {
						month: 'short',
						day: 'numeric',
					})}
				</span>
			</div>
		</div>
	);

	if (compact && filteredTasks.all.length === 0) {
		return <div className="no-tasks">No tasks</div>;
	}

	return (
		<div className="task-list-container">
			<div className="task-list-header">
				<h3>
					Tasks ({filteredTasks.all.length})
					{filteredTasks.overdue.length > 0 && (
						<span className="overdue-badge"> ⚠️ {filteredTasks.overdue.length} overdue</span>
					)}
				</h3>
				{clientId && !showForm && (
					<button
						onClick={() => setShowForm(true)}
						className="btn btn-secondary btn-small"
					>
						+ Add Task
					</button>
				)}
			</div>

			{/* New Task Form */}
			{clientId && showForm && (
				<form onSubmit={handleSubmit} className="task-form">
					<input
						type="text"
						placeholder="Task title..."
						value={formData.title}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, title: e.target.value }))
						}
						required
					/>
					<textarea
						placeholder="Description (optional)..."
						value={formData.description}
						onChange={(e) =>
							setFormData((prev) => ({ ...prev, description: e.target.value }))
						}
						rows={2}
					/>
					<div className="task-form-row">
						<input
							type="date"
							value={formData.dueDate}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
							}
						/>
						<select
							value={formData.priority}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									priority: e.target.value as any,
								}))
							}
						>
							<option value="low">Low Priority</option>
							<option value="medium">Medium Priority</option>
							<option value="high">High Priority</option>
						</select>
						<select
							value={formData.taskType}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									taskType: e.target.value as any,
								}))
							}
						>
							<option value="call">Call</option>
							<option value="email">Email</option>
							<option value="meeting">Meeting</option>
							<option value="follow-up">Follow-up</option>
							<option value="other">Other</option>
						</select>
					</div>
					<div className="form-actions">
						<button
							type="button"
							onClick={() => setShowForm(false)}
							className="btn btn-secondary btn-small"
						>
							Cancel
						</button>
						<button type="submit" className="btn btn-primary btn-small">
							Add Task
						</button>
					</div>
				</form>
			)}

			{/* Overdue Tasks */}
			{filteredTasks.overdue.length > 0 && (
				<div className="task-section">
					<h4 className="task-section-title overdue">⚠️ Overdue</h4>
					<div className="task-list">
						{filteredTasks.overdue.map(renderTask)}
					</div>
				</div>
			)}

			{/* Upcoming Tasks */}
			{filteredTasks.upcoming.length > 0 && (
				<div className="task-section">
					<h4 className="task-section-title">📋 Upcoming</h4>
					<div className="task-list">
						{filteredTasks.upcoming.map(renderTask)}
					</div>
				</div>
			)}

			{/* Completed Tasks */}
			{filteredTasks.completed.length > 0 && (
				<div className="task-section">
					<h4 className="task-section-title">✅ Completed</h4>
					<div className="task-list completed">
						{filteredTasks.completed.map(renderTask)}
					</div>
				</div>
			)}

			{/* Empty State */}
			{filteredTasks.all.length === 0 && (
				<div className="empty-state">
					<p>No tasks yet</p>
					{clientId && (
						<button
							onClick={() => setShowForm(true)}
							className="btn btn-secondary btn-small"
						>
							+ Create first task
						</button>
					)}
				</div>
			)}
		</div>
	);
};

export default TaskList;
