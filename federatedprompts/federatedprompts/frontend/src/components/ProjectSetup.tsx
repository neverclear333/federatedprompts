/**
 * ProjectSetup Component - Step 1
 * Collects basic project information and federated context
 */

import React from 'react';
import type { ProjectContext, FederatedConfig } from '../types/prompt';
import '../styles/promptEngineer.css';

interface ProjectSetupProps {
	projectContext: ProjectContext;
	config: FederatedConfig | null;
	onContextChange: (context: Partial<ProjectContext>) => void;
	onNext: () => void;
	errors: Array<{ field: string; message: string }>;
	loading: boolean;
}

export const ProjectSetup: React.FC<ProjectSetupProps> = ({
	projectContext,
	config,
	onContextChange,
	onNext,
	errors,
	loading,
}) => {
	const getErrorMessage = (field: string): string | undefined => {
		return errors.find((e) => e.field.includes(field))?.message;
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		onContextChange({ [name]: value });
	};

	const handleMultiSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, options } = e.target;
		const selected = Array.from(options)
			.filter((opt) => opt.selected)
			.map((opt) => opt.value);
		onContextChange({ [name]: selected });
	};

	if (!config) {
		return (
			<div className="step-container loading">
				<p>Loading configuration...</p>
			</div>
		);
	}

	return (
		<div className="step-container project-setup">
			<h2>Step 1: Project Setup</h2>
			<p className="step-description">Define your project context and team composition</p>

			<form className="form-section">
				{/* Project Name */}
				<div className="form-group">
					<label htmlFor="name">
						Project Name <span className="required">*</span>
					</label>
					<input
						id="name"
						name="name"
						type="text"
						placeholder="e.g., E-Commerce Platform"
						value={projectContext.name}
						onChange={handleInputChange}
						className={getErrorMessage('name') ? 'error' : ''}
						minLength={3}
						maxLength={100}
					/>
					{getErrorMessage('name') && (
						<span className="error-message">{getErrorMessage('name')}</span>
					)}
				</div>

				{/* Project Description */}
				<div className="form-group">
					<label htmlFor="description">
						Project Description <span className="required">*</span>
					</label>
					<textarea
						id="description"
						name="description"
						placeholder="Describe what this project does..."
						value={projectContext.description}
						onChange={handleInputChange}
						className={getErrorMessage('description') ? 'error' : ''}
						rows={4}
						minLength={10}
						maxLength={500}
					/>
					{getErrorMessage('description') && (
						<span className="error-message">{getErrorMessage('description')}</span>
					)}
				</div>

				{/* Project Domain */}
				<div className="form-group">
					<label htmlFor="domain">
						Project Domain <span className="required">*</span>
					</label>
					<select
						id="domain"
						name="domain"
						value={projectContext.domain}
						onChange={handleInputChange}
						className={getErrorMessage('domain') ? 'error' : ''}
					>
						<option value="">Select a domain...</option>
						{config.projectDomains.map((domain) => (
							<option key={domain.value} value={domain.value}>
								{domain.label}
							</option>
						))}
					</select>
					{getErrorMessage('domain') && (
						<span className="error-message">{getErrorMessage('domain')}</span>
					)}
				</div>

				{/* Technology Stack */}
				<div className="form-group">
					<label htmlFor="techStack">
						Technology Stack <span className="required">*</span>
					</label>
					<select
						id="techStack"
						name="techStack"
						multiple
						value={projectContext.techStack}
						onChange={handleMultiSelect}
						className={getErrorMessage('techStack') ? 'error' : ''}
						size={Math.min(6, config.techStack.length)}
					>
						{config.techStack.map((tech) => (
							<option key={tech.value} value={tech.value}>
								{tech.label}
							</option>
						))}
					</select>
					<span className="help-text">Hold Ctrl/Cmd to select multiple</span>
					{getErrorMessage('techStack') && (
						<span className="error-message">{getErrorMessage('techStack')}</span>
					)}
				</div>

				{/* Team Roles */}
				<div className="form-group">
					<label htmlFor="teamRoles">
						Team Roles <span className="required">*</span>
					</label>
					<select
						id="teamRoles"
						name="teamRoles"
						multiple
						value={projectContext.teamRoles}
						onChange={handleMultiSelect}
						className={getErrorMessage('teamRoles') ? 'error' : ''}
						size={Math.min(6, config.teamRoles.length)}
					>
						{config.teamRoles.map((role) => (
							<option key={role.value} value={role.value}>
								{role.label}
							</option>
						))}
					</select>
					<span className="help-text">Hold Ctrl/Cmd to select multiple</span>
					{getErrorMessage('teamRoles') && (
						<span className="error-message">{getErrorMessage('teamRoles')}</span>
					)}
				</div>

				{/* Action Button */}
				<div className="form-actions">
					<button
						type="button"
						onClick={onNext}
						disabled={loading}
						className="btn btn-primary"
					>
						{loading ? 'Validating...' : 'Next: Select UML Artifacts'}
					</button>
				</div>
			</form>

			{/* Info Box */}
			<div className="info-box">
				<h4>💡 What's Next?</h4>
				<p>
					After defining your project, you'll select the UML artifacts you want to create,
					then generate prompts in Gherkin or Jira format.
				</p>
			</div>
		</div>
	);
};

export default ProjectSetup;
