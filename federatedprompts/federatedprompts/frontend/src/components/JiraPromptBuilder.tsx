/**
 * JiraPromptBuilder Component
 * Provides interface for Jira-style user story prompt configuration
 */

import React from 'react';
import type { FederatedConfig } from '../types/prompt';
import '../styles/promptEngineer.css';

interface JiraPromptBuilderProps {
	config: FederatedConfig | null;
	selectedVariables: Record<string, any>;
	onVariableChange: (name: string, value: any) => void;
	onGenerate: () => void;
	loading: boolean;
}

export const JiraPromptBuilder: React.FC<JiraPromptBuilderProps> = ({
	config,
	selectedVariables,
	onVariableChange,
	onGenerate,
	loading,
}) => {
	if (!config) {
		return <div className="loading">Loading Jira builder...</div>;
	}

	return (
		<div className="builder-container jira-builder">
			<h3>Jira User Story Configuration</h3>
			<p className="builder-description">
				Create structured Jira user stories with acceptance criteria
			</p>

			<div className="builder-content">
				{/* Story Components */}
				<div className="section">
					<h4>📋 User Story Elements</h4>
					<p className="section-help">
						Your story will automatically include these elements:
					</p>

					<div className="elements-list">
						<div className="element">
							<span className="label">Summary:</span>
							<span className="value">Project name + UML artifact focus</span>
						</div>
						<div className="element">
							<span className="label">Description:</span>
							<span className="value">
								As a [role] / I want / So that (from your project context)
							</span>
						</div>
						<div className="element">
							<span className="label">Context:</span>
							<span className="value">Project, domain, tech stack, team info</span>
						</div>
						<div className="element">
							<span className="label">Acceptance Criteria:</span>
							<span className="value">Auto-generated based on UML artifacts</span>
						</div>
						<div className="element">
							<span className="label">Definition of Done:</span>
							<span className="value">Review, documentation, testing checklist</span>
						</div>
					</div>
				</div>

				{/* Advanced Options */}
				<div className="section">
					<h4>⚙️ Story Configuration</h4>

					<div className="form-group">
						<label htmlFor="storyType">Story Type:</label>
						<select
							id="storyType"
							value={selectedVariables.storyType ?? 'story'}
							onChange={(e) => onVariableChange('storyType', e.target.value)}
							className="form-control"
						>
							<option value="story">User Story</option>
							<option value="task">Task</option>
							<option value="epic">Epic</option>
							<option value="subtask">Subtask</option>
						</select>
					</div>

					<div className="form-group">
						<label htmlFor="priority">Priority:</label>
						<select
							id="priority"
							value={selectedVariables.priority ?? 'high'}
							onChange={(e) => onVariableChange('priority', e.target.value)}
							className="form-control"
						>
							<option value="low">Low</option>
							<option value="medium">Medium</option>
							<option value="high">High</option>
							<option value="critical">Critical</option>
						</select>
					</div>

					<div className="form-group">
						<label>
							<input
								type="checkbox"
								checked={selectedVariables.includeAC ?? true}
								onChange={(e) => onVariableChange('includeAC', e.target.checked)}
							/>
							Include detailed acceptance criteria
						</label>
						<span className="help-text">
							Provides specific, testable acceptance criteria for each artifact
						</span>
					</div>

					<div className="form-group">
						<label>
							<input
								type="checkbox"
								checked={selectedVariables.includeDoD ?? true}
								onChange={(e) => onVariableChange('includeDoD', e.target.checked)}
							/>
							Include Definition of Done
						</label>
						<span className="help-text">
							Standard quality gates before story completion
						</span>
					</div>

					<div className="form-group">
						<label htmlFor="estimatedPoints">Estimated Story Points:</label>
						<select
							id="estimatedPoints"
							value={selectedVariables.estimatedPoints ?? 'auto'}
							onChange={(e) => onVariableChange('estimatedPoints', e.target.value)}
							className="form-control"
						>
							<option value="auto">Auto-calculate from artifacts</option>
							<option value="1">1 point</option>
							<option value="2">2 points</option>
							<option value="3">3 points</option>
							<option value="5">5 points</option>
							<option value="8">8 points</option>
							<option value="13">13 points</option>
							<option value="21">21 points</option>
						</select>
					</div>
				</div>

				{/* Format Info */}
				<div className="info-box">
					<h4>📝 Story Format</h4>
					<p>Your generated story will include:</p>
					<ul>
						<li>✓ Clear user story summary and description</li>
						<li>✓ Complete project context</li>
						<li>✓ Specific, measurable acceptance criteria</li>
						<li>✓ Definition of Done checklist</li>
						<li>✓ Estimated story points</li>
						<li>✓ Related artifacts and components</li>
					</ul>
				</div>

				{/* Example */}
				<div className="example-box">
					<h4>💡 Example Output</h4>
					<pre className="example-code">{`# US: E-Commerce Platform - Class Diagram

## Summary
Design and document the Class Diagram for the E-Commerce Platform project

## Description
As a Software Architect
I want to create a comprehensive Class Diagram
So that the team understands the system structure and can implement accordingly

## Acceptance Criteria
- [ ] The Class Diagram is created and accurately represents the system
- [ ] All classes are clearly labeled with attributes and methods
- [ ] Relationships (inheritance, composition, association) are shown
- [ ] The diagram follows UML standards and conventions
- [ ] Integration points with other systems are identified

## Definition of Done
- All acceptance criteria met
- Code/diagrams reviewed by team lead
- Documentation updated
- Ready for next phase

## Story Points Estimate
8 points`}</pre>
				</div>
			</div>

			{/* Generate Button */}
			<div className="builder-actions">
				<button
					onClick={onGenerate}
					disabled={loading}
					className="btn btn-primary btn-large"
				>
					{loading ? '⟳ Generating Jira Story...' : '✨ Generate Jira Story'}
				</button>
			</div>
		</div>
	);
};

export default JiraPromptBuilder;
