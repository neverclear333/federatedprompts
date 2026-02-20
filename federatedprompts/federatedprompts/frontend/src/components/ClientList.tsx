/**
 * ClientList Component
 * Displays filterable client grid/table with segment tags
 */

import React, { useState, useMemo } from 'react';
import type { Client, ClientSegment } from '../types/realEstate';

interface ClientListProps {
	clients: Client[];
	selectedClientId?: string;
	onSelectClient: (clientId: string) => void;
	onNewClient: () => void;
	loading?: boolean;
}

const SEGMENT_COLORS: Record<ClientSegment, string> = {
	hotbuyer: '#3b82f6', // blue
	hotseller: '#ef4444', // red
	investor: '#8b5cf6', // purple
	referral: '#10b981', // green
};

const SEGMENT_LABELS: Record<ClientSegment, string> = {
	hotbuyer: '🔥 Hot Buyer',
	hotseller: '🏠 Hot Seller',
	investor: '💰 Investor',
	referral: '🤝 Referral',
};

export const ClientList: React.FC<ClientListProps> = ({
	clients,
	selectedClientId,
	onSelectClient,
	onNewClient,
	loading = false,
}) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [segmentFilter, setSegmentFilter] = useState<ClientSegment | 'all'>('all');

	// Filter clients
	const filteredClients = useMemo(() => {
		return clients.filter((client) => {
			// Filter by segment
			if (segmentFilter !== 'all' && client.segment !== segmentFilter) {
				return false;
			}

			// Filter by search term
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				const matchesName =
					client.firstName.toLowerCase().includes(searchLower) ||
					client.lastName.toLowerCase().includes(searchLower);
				const matchesEmail = client.email.toLowerCase().includes(searchLower);
				const matchesPhone = client.phone.includes(searchTerm);

				if (!matchesName && !matchesEmail && !matchesPhone) {
					return false;
				}
			}

			return true;
		});
	}, [clients, searchTerm, segmentFilter]);

	// Count clients by segment
	const segmentCounts = useMemo(() => {
		return {
			hotbuyer: clients.filter((c) => c.segment === 'hotbuyer').length,
			hotseller: clients.filter((c) => c.segment === 'hotseller').length,
			investor: clients.filter((c) => c.segment === 'investor').length,
			referral: clients.filter((c) => c.segment === 'referral').length,
		};
	}, [clients]);

	if (loading) {
		return (
			<div className="client-list-container loading">
				<div className="spinner">⟳</div>
				<p>Loading clients...</p>
			</div>
		);
	}

	return (
		<div className="client-list-container">
			{/* Header */}
			<div className="client-list-header">
				<h2>Clients ({filteredClients.length})</h2>
				<button onClick={onNewClient} className="btn btn-primary">
					+ New Client
				</button>
			</div>

			{/* Search and Filters */}
			<div className="client-list-controls">
				<div className="search-group">
					<input
						type="text"
						placeholder="Search by name, email, or phone..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="search-input"
					/>
					<span className="search-icon">🔍</span>
				</div>

				<div className="filter-tabs">
					<button
						className={`filter-tab ${segmentFilter === 'all' ? 'active' : ''}`}
						onClick={() => setSegmentFilter('all')}
					>
						All ({clients.length})
					</button>
					<button
						className={`filter-tab ${segmentFilter === 'hotbuyer' ? 'active' : ''}`}
						onClick={() => setSegmentFilter('hotbuyer')}
						style={{
							borderLeftColor: SEGMENT_COLORS.hotbuyer,
						}}
					>
						🔥 Buyers ({segmentCounts.hotbuyer})
					</button>
					<button
						className={`filter-tab ${segmentFilter === 'hotseller' ? 'active' : ''}`}
						onClick={() => setSegmentFilter('hotseller')}
						style={{
							borderLeftColor: SEGMENT_COLORS.hotseller,
						}}
					>
						🏠 Sellers ({segmentCounts.hotseller})
					</button>
					<button
						className={`filter-tab ${segmentFilter === 'investor' ? 'active' : ''}`}
						onClick={() => setSegmentFilter('investor')}
						style={{
							borderLeftColor: SEGMENT_COLORS.investor,
						}}
					>
						💰 Investors ({segmentCounts.investor})
					</button>
					<button
						className={`filter-tab ${segmentFilter === 'referral' ? 'active' : ''}`}
						onClick={() => setSegmentFilter('referral')}
						style={{
							borderLeftColor: SEGMENT_COLORS.referral,
						}}
					>
						🤝 Referrals ({segmentCounts.referral})
					</button>
				</div>
			</div>

			{/* Client Grid */}
			{filteredClients.length === 0 ? (
				<div className="empty-state">
					<p>No clients found</p>
					<p className="empty-state-hint">Create a new client to get started</p>
					<button onClick={onNewClient} className="btn btn-secondary btn-small">
						+ Add First Client
					</button>
				</div>
			) : (
				<div className="client-grid">
					{filteredClients.map((client) => (
						<div
							key={client.id}
							className={`client-card ${
								selectedClientId === client.id ? 'selected' : ''
							}`}
							onClick={() => onSelectClient(client.id)}
						>
							{/* Segment Badge */}
							<div className="client-card-header">
								<span
									className="segment-badge"
									style={{ backgroundColor: SEGMENT_COLORS[client.segment] }}
									title={SEGMENT_LABELS[client.segment]}
								>
									{SEGMENT_LABELS[client.segment]}
								</span>
								<span className="campaign-status">
									Email {client.campaignStatus.currentEmailNumber}
								</span>
							</div>

							{/* Client Name */}
							<h3 className="client-name">
								{client.firstName} {client.lastName}
							</h3>

							{/* Contact Info */}
							<div className="client-contact">
								<div className="contact-item">
									<span className="contact-label">📧</span>
									<span className="contact-value">{client.email}</span>
								</div>
								<div className="contact-item">
									<span className="contact-label">📱</span>
									<span className="contact-value">{client.phone}</span>
								</div>
							</div>

							{/* Address */}
							{client.address && (
								<div className="client-address">
									📍 {client.address}
									{client.city && `, ${client.city}`}
									{client.zipcode && ` ${client.zipcode}`}
								</div>
							)}

							{/* Source Badge */}
							{client.source && (
								<div className="client-source">
									Source: <span className="source-badge">{client.source}</span>
								</div>
							)}

							{/* Created Date */}
							<div className="client-meta">
								Joined{' '}
								{new Date(client.createdAt).toLocaleDateString(undefined, {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
								})}
							</div>

							{/* Selection Indicator */}
							<div className="client-card-indicator">›</div>
						</div>
					))}
				</div>
			)}

			{/* Statistics Footer */}
			<div className="client-list-footer">
				<div className="stat">
					<span className="stat-label">Total Clients</span>
					<span className="stat-value">{clients.length}</span>
				</div>
				<div className="stat">
					<span className="stat-label">Hot Buyers</span>
					<span className="stat-value">{segmentCounts.hotbuyer}</span>
				</div>
				<div className="stat">
					<span className="stat-label">Hot Sellers</span>
					<span className="stat-value">{segmentCounts.hotseller}</span>
				</div>
				<div className="stat">
					<span className="stat-label">Investors</span>
					<span className="stat-value">{segmentCounts.investor}</span>
				</div>
				<div className="stat">
					<span className="stat-label">Referrals</span>
					<span className="stat-value">{segmentCounts.referral}</span>
				</div>
			</div>
		</div>
	);
};

export default ClientList;
