/**
 * UMLModelSelector Component - Step 2
 * Allows selection of UML artifacts to create prompts for
 */

import React from 'react';
import type { FederatedConfig } from '../types/prompt';
import '../styles/promptEngineer.css';

interface UMLModelSelectorProps {
	selectedArtifacts: string[];
	config: FederatedConfig | null;
	onArtifactChange: (artifacts: string[]) => void;
	onNext: () => void;
	onPrev: () => void;
	errors: Array<{ field: string; message: string }>;
}

export const UMLModelSelector: React.FC<UMLModelSelectorProps> = ({
	selectedArtifacts,
	config,
	onArtifactChange,
	onNext,
	onPrev,
	errors,
}) => {
	const handleArtifactToggle = (artifactValue: string) => {
		if (selectedArtifacts.includes(artifactValue)) {
			onArtifactChange(selectedArtifacts.filter((a) => a !== artifactValue));
		} else {
			onArtifactChange([...selectedArtifacts, artifactValue]);
		}
	};

	const hasError = errors.some((e) => e.field.includes('umlArtifacts'));

	if (!config) {
		return (
			<div className="step-container loading">
				<p>Loading configuration...</p>
			</div>
		);
	}

	return (
		<div className="step-container uml-selector">
			<h2>Step 2: Select UML Artifacts</h2>
			<p className="step-description">Choose which UML diagrams to create for your project</p>

			<div className={`artifacts-grid ${hasError ? 'error' : ''}`}>
				{config.umlArtifacts.map((artifact) => (
					<div
						key={artifact.value}
						className={`artifact-card ${selectedArtifacts.includes(artifact.value) ? 'selected' : ''}`}
						onClick={() => handleArtifactToggle(artifact.value)}
						role="checkbox"
						aria-checked={selectedArtifacts.includes(artifact.value)}
						tabIndex={0}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								handleArtifactToggle(artifact.value);
								e.preventDefault();
							}
						}}
					>
						<div className="artifact-icon">
							<ArtifactIcon type={artifact.value} />
						</div>
						<h3>{artifact.label}</h3>
						<p>{artifact.description}</p>
						{artifact.tags && (
							<div className="tags">
								{artifact.tags.map((tag) => (
									<span key={tag} className="tag">
										{tag}
									</span>
								))}
							</div>
						)}
						<div className="checkmark">✓</div>
					</div>
				))}
			</div>

			{hasError && (
				<div className="error-message">
					{errors.find((e) => e.field.includes('umlArtifacts'))?.message}
				</div>
			)}

			{/* Selected Count */}
			<div className="selection-info">
				<p>
					<strong>{selectedArtifacts.length}</strong> artifact
					{selectedArtifacts.length !== 1 ? 's' : ''} selected
				</p>
				{selectedArtifacts.length > 0 && (
					<div className="selected-list">
						{selectedArtifacts.map((artifactValue) => {
							const artifact = config.umlArtifacts.find((a) => a.value === artifactValue);
							return (
								<span key={artifactValue} className="selected-item">
									{artifact?.label}
									<button
										type="button"
										onClick={() => handleArtifactToggle(artifactValue)}
										className="remove-btn"
										aria-label={`Remove ${artifact?.label}`}
									>
										×
									</button>
								</span>
							);
						})}
					</div>
				)}
			</div>

			{/* Action Buttons */}
			<div className="form-actions">
				<button type="button" onClick={onPrev} className="btn btn-secondary">
					← Previous
				</button>
				<button type="button" onClick={onNext} disabled={selectedArtifacts.length === 0} className="btn btn-primary">
					Next: Choose Prompt Style →
				</button>
			</div>

			{/* Info Box */}
			<div className="info-box">
				<h4>📊 UML Artifacts</h4>
				<p>
					Select one or more UML diagrams. Each selection will generate a detailed prompt with
					Gherkin scenarios or Jira user stories to guide implementation.
				</p>
			</div>
		</div>
	);
};

/**
 * Simple artifact icon renderer
 */
const ArtifactIcon: React.FC<{ type: string }> = ({ type }) => {
	const icons: Record<string, string> = {
		'use-case': '👥',
		class: '📦',
		sequence: '📶',
		activity: '🔄',
		component: '🧩',
		deployment: '🚀',
		state: '🔀',
		'entity-relationship': '🗄️',
	};

	return <span className="icon">{icons[type] || '📋'}</span>;
};

export default UMLModelSelector;
