/**
 * RealEstateDashboard Page
 * Main dashboard for real estate CRM
 */

import React, { useState, useEffect } from 'react';
import { useRealEstateDashboard } from '../hooks/useRealEstateDashboard';
import ClientList from '../components/ClientList';
import ClientDetail from '../components/ClientDetail';
import ClientForm from '../components/ClientForm';
import '../styles/realEstateDashboard.css';

export const RealEstateDashboard: React.FC = () => {
	const dashboard = useRealEstateDashboard();
	const [showClientForm, setShowClientForm] = useState(false);
	const [editingClient, setEditingClient] = useState<string | null>(null);

	// Get selected client
	const selectedClient = dashboard.state.selectedClientId
		? dashboard.getClient(dashboard.state.selectedClientId)
		: null;

	// Get campaign status for selected client
	const selectedCampaignStatus = selectedClient
		? dashboard.getCampaignStatus(selectedClient.id)
		: undefined;

	// Get tasks for selected client
	const selectedClientTasks = selectedClient
		? dashboard.getClientTasks(selectedClient.id)
		: [];

	// Get stats
	const stats = dashboard.getDashboardStats();

	/**
	 * Handle new client creation
	 */
	const handleCreateClient = (data: any) => {
		const newClient = dashboard.createClient(data);
		dashboard.state.clients; // Re-render
		setShowClientForm(false);
	};

	/**
	 * Handle client update
	 */
	const handleUpdateClient = (data: any) => {
		if (editingClient) {
			dashboard.updateClient(editingClient, data);
			setEditingClient(null);
		}
	};

	/**
	 * Handle segment change
	 */
	const handleSegmentChange = (clientId: string, newSegment: any) => {
		dashboard.updateClientSegment(clientId, newSegment);
	};

	return (
		<div className="dashboard-page">
			{/* Page Header */}
			<div className="page-header">
				<div className="header-content">
					<h1>🏠 Real Estate CRM Dashboard</h1>
					<p>Manage leads and automated drip campaigns for Buckhead market</p>
				</div>
				<div className="header-stats">
					<div className="stat-badge">
						<span className="stat-count">{stats.totalClients}</span>
						<span className="stat-label">Total Clients</span>
					</div>
					<div className="stat-badge">
						<span className="stat-count">{stats.pendingTasks}</span>
						<span className="stat-label">Active Tasks</span>
					</div>
				</div>
			</div>

			{/* Dashboard Layout */}
			<div className="dashboard-layout">
				{/* Main Content */}
				<div className="dashboard-main">
					<ClientList
						clients={dashboard.state.clients}
						selectedClientId={dashboard.state.selectedClientId}
						onSelectClient={(clientId) =>
							dashboard.state.selectedClientId !== clientId && (
								dashboard.state.selectedClientId = clientId
							)
						}
						onNewClient={() => setShowClientForm(true)}
						loading={dashboard.state.loading}
					/>
				</div>

				{/* Sidebar */}
				<div className="dashboard-sidebar">
					{selectedClient ? (
						<ClientDetail
							client={selectedClient}
							campaignStatus={selectedCampaignStatus}
							tasks={selectedClientTasks}
							onUpdate={(updates) =>
								dashboard.updateClient(selectedClient.id, updates)
							}
							onCreateTask={(data) => {
								data.clientId = selectedClient.id;
								dashboard.createTask(data);
							}}
							onUpdateTask={dashboard.updateTask}
							onDeleteTask={dashboard.deleteTask}
							onClose={() =>
								(dashboard.state.selectedClientId = undefined)
							}
						/>
					) : (
						<div className="sidebar-placeholder">
							<h3>Select a client</h3>
							<p>Click on a client in the list to view details and manage tasks</p>
							<button
								onClick={() => setShowClientForm(true)}
								className="btn btn-primary"
							>
								+ Add First Client
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Client Form Modal */}
			{showClientForm && (
				<ClientForm
					onSubmit={handleCreateClient}
					onCancel={() => setShowClientForm(false)}
					loading={dashboard.state.loading}
				/>
			)}

			{/* Footer Stats */}
			<div className="dashboard-footer">
				<div className="footer-stat">
					<span>🔥 Buyers:</span>
					<strong>{stats.hotbuyerCount}</strong>
				</div>
				<div className="footer-stat">
					<span>🏠 Sellers:</span>
					<strong>{stats.hotsellerCount}</strong>
				</div>
				<div className="footer-stat">
					<span>💰 Investors:</span>
					<strong>{stats.investorCount}</strong>
				</div>
				<div className="footer-stat">
					<span>🤝 Referrals:</span>
					<strong>{stats.referralCount}</strong>
				</div>
				<div className="footer-stat">
					<span>✅ Completed Tasks:</span>
					<strong>{stats.completedTasks}</strong>
				</div>
				<div className="footer-stat">
					<span>⚠️ Overdue:</span>
					<strong>{stats.overdueTasks}</strong>
				</div>
			</div>
		</div>
	);
};

export default RealEstateDashboard;
