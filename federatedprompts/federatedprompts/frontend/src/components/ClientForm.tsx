/**
 * ClientForm Component
 * Modal form for creating and editing clients
 */

import React, { useState, useEffect } from 'react';
import type { Client, ClientSegment, CreateClientRequest } from '../types/realEstate';

interface ClientFormProps {
	client?: Client; // If provided, edit mode; otherwise create mode
	onSubmit: (data: CreateClientRequest | Partial<Client>) => void;
	onCancel: () => void;
	loading?: boolean;
}

const SEGMENT_OPTIONS: Array<{ value: ClientSegment; label: string; emoji: string }> = [
	{ value: 'hotbuyer', label: 'Hot Buyer (Open House)', emoji: '🔥' },
	{ value: 'hotseller', label: 'Hot Seller (Selling Interest)', emoji: '🏠' },
	{ value: 'investor', label: 'Investor (Investment Interest)', emoji: '💰' },
	{ value: 'referral', label: 'Referral (Network)', emoji: '🤝' },
];

const SOURCE_OPTIONS = [
	'open-house',
	'website',
	'qr-code',
	'referral',
	'csv-import',
	'cold-call',
	'social-media',
];

export const ClientForm: React.FC<ClientFormProps> = ({
	client,
	onSubmit,
	onCancel,
	loading = false,
}) => {
	const isEditMode = !!client;

	const [formData, setFormData] = useState({
		firstName: client?.firstName || '',
		lastName: client?.lastName || '',
		email: client?.email || '',
		phone: client?.phone || '',
		segment: client?.segment || ('hotbuyer' as ClientSegment),
		address: client?.address || '',
		city: client?.city || '',
		zipcode: client?.zipcode || '',
		state: client?.state || 'GA',
		source: client?.source || 'open-house',
		sourceDetails: client?.sourceDetails || '',
		notes: client?.notes || '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	/**
	 * Validate form
	 */
	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.firstName.trim()) {
			newErrors.firstName = 'First name is required';
		}
		if (!formData.lastName.trim()) {
			newErrors.lastName = 'Last name is required';
		}
		if (!formData.email.trim()) {
			newErrors.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Invalid email format';
		}
		if (!formData.phone.trim()) {
			newErrors.phone = 'Phone is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	/**
	 * Handle submit
	 */
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		if (isEditMode && client) {
			onSubmit({
				...formData,
			});
		} else {
			onSubmit(formData);
		}
	};

	/**
	 * Handle input change
	 */
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		// Clear error for this field
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	return (
		<div className="modal-overlay">
			<div className="modal-content client-form-modal">
				{/* Header */}
				<div className="modal-header">
					<h2>{isEditMode ? 'Edit Client' : 'Add New Client'}</h2>
					<button className="modal-close" onClick={onCancel}>
						×
					</button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit} className="client-form">
					{/* Name Section */}
					<div className="form-section">
						<h3>Contact Information</h3>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="firstName">First Name *</label>
								<input
									id="firstName"
									type="text"
									name="firstName"
									value={formData.firstName}
									onChange={handleChange}
									placeholder="First name"
									disabled={loading}
									className={errors.firstName ? 'error' : ''}
								/>
								{errors.firstName && (
									<span className="error-message">{errors.firstName}</span>
								)}
							</div>

							<div className="form-group">
								<label htmlFor="lastName">Last Name *</label>
								<input
									id="lastName"
									type="text"
									name="lastName"
									value={formData.lastName}
									onChange={handleChange}
									placeholder="Last name"
									disabled={loading}
									className={errors.lastName ? 'error' : ''}
								/>
								{errors.lastName && (
									<span className="error-message">{errors.lastName}</span>
								)}
							</div>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="email">Email *</label>
								<input
									id="email"
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="email@example.com"
									disabled={loading}
									className={errors.email ? 'error' : ''}
								/>
								{errors.email && (
									<span className="error-message">{errors.email}</span>
								)}
							</div>

							<div className="form-group">
								<label htmlFor="phone">Phone *</label>
								<input
									id="phone"
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleChange}
									placeholder="(555) 123-4567"
									disabled={loading}
									className={errors.phone ? 'error' : ''}
								/>
								{errors.phone && (
									<span className="error-message">{errors.phone}</span>
								)}
							</div>
						</div>
					</div>

					{/* Address Section */}
					<div className="form-section">
						<h3>Address (Optional)</h3>

						<div className="form-group">
							<label htmlFor="address">Street Address</label>
							<input
								id="address"
								type="text"
								name="address"
								value={formData.address}
								onChange={handleChange}
								placeholder="123 Main St"
								disabled={loading}
							/>
						</div>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="city">City</label>
								<input
									id="city"
									type="text"
									name="city"
									value={formData.city}
									onChange={handleChange}
									placeholder="Atlanta"
									disabled={loading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="zipcode">Zipcode</label>
								<input
									id="zipcode"
									type="text"
									name="zipcode"
									value={formData.zipcode}
									onChange={handleChange}
									placeholder="30305"
									disabled={loading}
								/>
							</div>

							<div className="form-group">
								<label htmlFor="state">State</label>
								<input
									id="state"
									type="text"
									name="state"
									value={formData.state}
									onChange={handleChange}
									placeholder="GA"
									disabled={loading}
									maxLength={2}
								/>
							</div>
						</div>
					</div>

					{/* Segment Section */}
					<div className="form-section">
						<h3>Client Segment *</h3>

						<div className="form-group">
							<label htmlFor="segment">Segment</label>
							<select
								id="segment"
								name="segment"
								value={formData.segment}
								onChange={handleChange}
								disabled={loading}
							>
								{SEGMENT_OPTIONS.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.emoji} {opt.label}
									</option>
								))}
							</select>
							<p className="help-text">
								This determines which drip campaign will be triggered
							</p>
						</div>
					</div>

					{/* Source Section */}
					<div className="form-section">
						<h3>Lead Source</h3>

						<div className="form-row">
							<div className="form-group">
								<label htmlFor="source">Source</label>
								<select
									id="source"
									name="source"
									value={formData.source}
									onChange={handleChange}
									disabled={loading}
								>
									{SOURCE_OPTIONS.map((opt) => (
										<option key={opt} value={opt}>
											{opt.replace('-', ' ')}
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor="sourceDetails">Details</label>
								<input
									id="sourceDetails"
									type="text"
									name="sourceDetails"
									value={formData.sourceDetails}
									onChange={handleChange}
									placeholder="e.g., which open house, referrer name, etc."
									disabled={loading}
								/>
							</div>
						</div>
					</div>

					{/* Notes Section */}
					<div className="form-section">
						<h3>Notes</h3>

						<div className="form-group">
							<label htmlFor="notes">Client Notes</label>
							<textarea
								id="notes"
								name="notes"
								value={formData.notes}
								onChange={handleChange}
								placeholder="Add any notes about this client..."
								rows={4}
								disabled={loading}
							/>
							<p className="help-text">Max 1000 characters</p>
						</div>
					</div>

					{/* Actions */}
					<div className="form-actions">
						<button
							type="button"
							onClick={onCancel}
							disabled={loading}
							className="btn btn-secondary"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="btn btn-primary"
						>
							{loading
								? 'Saving...'
								: isEditMode
									? 'Update Client'
									: 'Add Client'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ClientForm;
