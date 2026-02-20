/**
 * ProjectPlanBuilder Component
 * Provides interface for project plan generation configuration
 */

import React, { useState } from 'react';
import type { FederatedConfig } from '../types/prompt';
import '../styles/promptEngineer.css';

interface ProjectPlanBuilderProps {
	config: FederatedConfig | null;
	umlArtifacts: string[];
	teamRoles: string[];
	customTeamRoles: string[];
	projectName: string;
	onGenerate: () => void;
	loading: boolean;
}

export const ProjectPlanBuilder: React.FC<ProjectPlanBuilderProps> = ({
	config,
	umlArtifacts,
	teamRoles,
	customTeamRoles,
	projectName,
	onGenerate,
	loading,
}) => {
	const [phaseCount, setPhaseCount] = useState<number>(4);
	const [includeTimeline, setIncludeTimeline] = useState<boolean>(true);
	const [includeRiskAssessment, setIncludeRiskAssessment] = useState<boolean>(true);

	if (!config) {
		return <div className="loading">Loading project plan builder...</div>;
	}

	const allRoles = [...teamRoles, ...customTeamRoles];

	return (
		<div className="builder-container project-plan-builder">
			<h3>Project Plan Configuration</h3>
			<p className="builder-description">
				Configure your project plan with phases, timelines, and team assignments
			</p>

			<div className="builder-content">
				{/* Project Overview */}
				<div className="section">
					<h4>📋 Project Overview</h4>
					<div className="info-box">
						<p>
							<strong>Project:</strong> {projectName || 'Your Project'}
						</p>
						<p>
							<strong>UML Artifacts:</strong> {umlArtifacts.length} selected
						</p>
						<p>
							<strong>Team Size:</strong> {allRoles.length} roles
						</p>
					</div>
				</div>

				{/* Plan Options */}
				<div className="section">
					<h4>⚙️ Plan Configuration</h4>

					{/* Phase Count */}
					<div className="form-group">
						<label htmlFor="phaseCount">
							Number of Phases <span className="required">*</span>
						</label>
						<div className="phase-selector">
							{[3, 4, 5].map((count) => (
								<button
									key={count}
									type="button"
									className={`phase-button ${phaseCount === count ? 'active' : ''}`}
									onClick={() => setPhaseCount(count)}
									disabled={loading}
								>
									{count} Phases
								</button>
							))}
						</div>
						<span className="help-text">
							Break your project into {phaseCount} phases: Planning, Design, Development,
							Testing, {phaseCount === 5 ? 'and Deployment' : 'and Deployment'}
						</span>
					</div>

					{/* Include Timeline */}
					<div className="form-group checkbox-group">
						<label>
							<input
								type="checkbox"
								checked={includeTimeline}
								onChange={(e) => setIncludeTimeline(e.target.checked)}
								disabled={loading}
							/>
							Include detailed timeline with estimated duration per phase
						</label>
						<span className="help-text">
							Automatically calculates timeline based on {umlArtifacts.length} UML artifacts
						</span>
					</div>

					{/* Include Risk Assessment */}
					<div className="form-group checkbox-group">
						<label>
							<input
								type="checkbox"
								checked={includeRiskAssessment}
								onChange={(e) => setIncludeRiskAssessment(e.target.checked)}
								disabled={loading}
							/>
							Include risk mitigation strategies
						</label>
						<span className="help-text">
							Identifies technical and team risks with mitigation approaches
						</span>
					</div>
				</div>

				{/* Team Assignment Preview */}
				<div className="section">
					<h4>👥 Team Assignments</h4>
					<p className="section-help">
						Your plan will assign these {allRoles.length} roles across project phases:
					</p>
					<div className="roles-preview">
						{teamRoles.map((role) => (
							<span key={role} className="role-badge predefined">
								{role}
							</span>
						))}
						{customTeamRoles.map((role) => (
							<span key={role} className="role-badge custom">
								{role}
							</span>
						))}
					</div>
				</div>

				{/* UML Artifacts Summary */}
				<div className="section">
					<h4>📐 UML Artifacts to Cover</h4>
					<p className="section-help">
						Your plan will include phases for creating these artifacts:
					</p>
					<div className="artifacts-preview">
						{umlArtifacts.map((artifact) => {
							const artifactLabel =
								config.umlArtifacts.find((a) => a.value === artifact)?.label || artifact;
							return (
								<span key={artifact} className="artifact-badge">
									{artifactLabel}
								</span>
							);
						})}
					</div>
				</div>

				{/* Plan Format Info */}
				<div className="section">
					<h4>📄 Plan Format</h4>
					<div className="info-box">
						<p>Your project plan will include:</p>
						<ul className="feature-list">
							<li>Executive summary</li>
							<li>Phase breakdown with deliverables</li>
							<li>Team member assignments</li>
							<li>Success criteria for each phase</li>
							{includeTimeline && <li>Estimated timeline and duration</li>}
							{includeRiskAssessment && (
								<li>Risk identification and mitigation strategies</li>
							)}
							<li>Dependencies and critical path</li>
							<li>Resource requirements</li>
						</ul>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="form-actions">
					<button
						type="button"
						onClick={onGenerate}
						disabled={loading}
						className="btn btn-primary"
					>
						{loading ? 'Generating Plan...' : 'Generate Project Plan'}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ProjectPlanBuilder;
