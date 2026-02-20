/**
 * ClientDetail Component
 * Shows full client profile, campaign status, and actions
 */

import React from 'react';
import type { Client, ClientCampaignStatus, FollowUpTask } from '../types/realEstate';
import TaskList from './TaskList';
import CampaignPreview from './CampaignPreview';

interface ClientDetailProps {
	client: Client;
	campaignStatus?: ClientCampaignStatus;
	tasks: FollowUpTask[];
	onUpdate: (updates: Partial<Client>) => void;
	onCreateTask: (task: any) => void;
	onUpdateTask: (taskId: string, updates: Partial<FollowUpTask>) => void;
	onDeleteTask: (taskId: string) => void;
	onClose: () => void;
}

const SEGMENT_LABELS: Record<string, string> = {
	hotbuyer: '🔥 Hot Buyer',
	hotseller: '🏠 Hot Seller',
	investor: '💰 Investor',
	referral: '🤝 Referral',
};

const SEGMENT_COLORS: Record<string, string> = {
	hotbuyer: '#3b82f6',
	hotseller: '#ef4444',
	investor: '#8b5cf6',
	referral: '#10b981',
};

export const ClientDetail: React.FC<ClientDetailProps> = ({
	client,
	campaignStatus,
	tasks,
	onUpdate,
	onCreateTask,
	onUpdateTask,
	onDeleteTask,
	onClose,
}) => {
	const clientTasks = tasks.filter((t) => t.clientId === client.id);
	const activeTasks = clientTasks.filter((t) => !t.completed);

	return (
		<div className="client-detail-container">
			{/* Header */}
			<div className="detail-header">
				<div className="client-title-section">
					<h2>
						{client.firstName} {client.lastName}
					</h2>
					<span
						className="segment-badge-large"
						style={{ backgroundColor: SEGMENT_COLORS[client.segment] }}
					>
						{SEGMENT_LABELS[client.segment]}
					</span>
				</div>
				<button className="close-button" onClick={onClose}>
					✕
				</button>
			</div>

			{/* Two-Column Layout */}
			<div className="detail-content">
				{/* Left Column: Client Info */}
				<div className="detail-left">
					{/* Contact Section */}
					<div className="detail-section">
						<h3>Contact Information</h3>
						<div className="info-row">
							<span className="info-label">Email</span>
							<span className="info-value">{client.email}</span>
						</div>
						<div className="info-row">
							<span className="info-label">Phone</span>
							<span className="info-value">{client.phone}</span>
						</div>
						{client.address && (
							<div className="info-row">
								<span className="info-label">Address</span>
								<span className="info-value">
									{client.address}
									{client.city && `, ${client.city}`}
									{client.zipcode && ` ${client.zipcode}`}
								</span>
							</div>
						)}
					</div>

					{/* Source Section */}
					<div className="detail-section">
						<h3>Lead Source</h3>
						<div className="info-row">
							<span className="info-label">Source</span>
							<span className="info-value">{client.source}</span>
						</div>
						{client.sourceDetails && (
							<div className="info-row">
								<span className="info-label">Details</span>
								<span className="info-value">{client.sourceDetails}</span>
							</div>
						)}
					</div>

					{/* Notes Section */}
					{client.notes && (
						<div className="detail-section">
							<h3>Notes</h3>
							<div className="notes-box">{client.notes}</div>
						</div>
					)}

					{/* Activity Section */}
					<div className="detail-section">
						<h3>Activity</h3>
						<div className="info-row">
							<span className="info-label">Joined</span>
							<span className="info-value">
								{new Date(client.createdAt).toLocaleDateString()}
							</span>
						</div>
						{client.lastEmailSent && (
							<div className="info-row">
								<span className="info-label">Last Email Sent</span>
								<span className="info-value">
									{new Date(client.lastEmailSent).toLocaleDateString()}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Right Column: Campaign & Tasks */}
				<div className="detail-right">
					{/* Campaign Preview */}
					<div className="detail-section">
						<CampaignPreview
							segment={client.segment}
							campaignStatus={campaignStatus}
							clientName={`${client.firstName} ${client.lastName}`}
						/>
					</div>

					{/* Active Tasks Counter */}
					{activeTasks.length > 0 && (
						<div className="active-tasks-badge">
							⚠️ {activeTasks.length} active task{activeTasks.length !== 1 ? 's' : ''}
						</div>
					)}

					{/* Task List */}
					<div className="detail-section">
						<TaskList
							tasks={tasks}
							clientId={client.id}
							onCreateTask={onCreateTask}
							onUpdateTask={onUpdateTask}
							onDeleteTask={onDeleteTask}
						/>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="detail-actions">
				<button className="btn btn-secondary">📧 Send Email</button>
				<button className="btn btn-secondary">💬 Send SMS</button>
				<button className="btn btn-secondary">📞 Log Call</button>
				<button className="btn btn-secondary">✏️ Edit Client</button>
			</div>
		</div>
	);
};

export default ClientDetail;
