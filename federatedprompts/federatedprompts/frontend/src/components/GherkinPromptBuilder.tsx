/**
 * GherkinPromptBuilder Component
 * Provides interface for Gherkin-style prompt configuration
 */

import React from 'react';
import type { FederatedConfig } from '../types/prompt';
import '../styles/promptEngineer.css';

interface GherkinPromptBuilderProps {
	config: FederatedConfig | null;
	selectedVariables: Record<string, any>;
	onVariableChange: (name: string, value: any) => void;
	onGenerate: () => void;
	loading: boolean;
}

export const GherkinPromptBuilder: React.FC<GherkinPromptBuilderProps> = ({
	config,
	selectedVariables,
	onVariableChange,
	onGenerate,
	loading,
}) => {
	if (!config) {
		return <div className="loading">Loading Gherkin builder...</div>;
	}

	return (
		<div className="builder-container gherkin-builder">
			<h3>Gherkin Prompt Configuration</h3>
			<p className="builder-description">
				Configure your Gherkin-style (BDD) prompts with Given/When/Then format
			</p>

			<div className="builder-content">
				{/* Pattern Suggestions */}
				<div className="section">
					<h4>📋 Suggested Patterns</h4>
					<p className="section-help">
						These patterns are automatically included in your generated prompts:
					</p>

					<div className="patterns-grid">
						<div className="pattern-section">
							<h5>Given Patterns</h5>
							<ul className="pattern-list">
								{config.gherkinPatterns.given.slice(0, 3).map((pattern, i) => (
									<li key={i}>
										<code>Given {pattern}</code>
									</li>
								))}
							</ul>
						</div>

						<div className="pattern-section">
							<h5>When Patterns</h5>
							<ul className="pattern-list">
								{config.gherkinPatterns.when.slice(0, 3).map((pattern, i) => (
									<li key={i}>
										<code>When {pattern}</code>
									</li>
								))}
							</ul>
						</div>

						<div className="pattern-section">
							<h5>Then Patterns</h5>
							<ul className="pattern-list">
								{config.gherkinPatterns.then.slice(0, 3).map((pattern, i) => (
									<li key={i}>
										<code>Then {pattern}</code>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				{/* Advanced Options */}
				<div className="section">
					<h4>⚙️ Advanced Options</h4>

					<div className="form-group">
						<label>
							<input
								type="checkbox"
								checked={selectedVariables.includeBackground ?? true}
								onChange={(e) => onVariableChange('includeBackground', e.target.checked)}
							/>
							Include Background section (recommended)
						</label>
						<span className="help-text">
							The Background section sets up preconditions for all scenarios
						</span>
					</div>

					<div className="form-group">
						<label>
							<input
								type="checkbox"
								checked={selectedVariables.multipleScenarios ?? true}
								onChange={(e) => onVariableChange('multipleScenarios', e.target.checked)}
							/>
							Generate multiple scenarios
						</label>
						<span className="help-text">
							Creates comprehensive feature files with 3+ scenarios per artifact
						</span>
					</div>

					<div className="form-group">
						<label htmlFor="scenarioCount">Number of scenarios per artifact:</label>
						<input
							id="scenarioCount"
							type="number"
							min="1"
							max="10"
							value={selectedVariables.scenarioCount ?? 3}
							onChange={(e) => onVariableChange('scenarioCount', parseInt(e.target.value))}
							className="number-input"
						/>
					</div>
				</div>

				{/* Format Info */}
				<div className="info-box">
					<h4>📝 Gherkin Format</h4>
					<p>Your generated prompt will include:</p>
					<ul>
						<li>✓ Feature file header with user story context</li>
						<li>✓ Background section with project details</li>
						<li>✓ Multiple scenarios with Given/When/Then steps</li>
						<li>✓ Clear examples and expected outcomes</li>
						<li>✓ Integration points and dependencies</li>
					</ul>
				</div>

				{/* Example */}
				<div className="example-box">
					<h4>💡 Example Output</h4>
					<pre className="example-code">{`# Feature: User Authentication - Use Case Diagram

As a Frontend Developer
I want to implement secure user authentication
So that users can access the system safely

## Background
Given the project is called "E-Commerce Platform"
And the technology stack includes: React, Node.js, PostgreSQL

## Scenario 1: Create the Use Case Diagram
When the architect reviews the requirements
And they identify the key actors and interactions
Then they create a Use Case Diagram that shows:
  - All actors (User, Admin, System)
  - Primary use cases
  - System boundaries
And the diagram is validated`}</pre>
				</div>
			</div>

			{/* Generate Button */}
			<div className="builder-actions">
				<button
					onClick={onGenerate}
					disabled={loading}
					className="btn btn-primary btn-large"
				>
					{loading ? '⟳ Generating Gherkin Prompt...' : '✨ Generate Gherkin Prompt'}
				</button>
			</div>
		</div>
	);
};

export default GherkinPromptBuilder;
