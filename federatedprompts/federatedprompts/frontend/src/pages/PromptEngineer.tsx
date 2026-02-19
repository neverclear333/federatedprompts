/**
 * PromptEngineer Page
 * Main page for the UML Prompt Engineering Tool
 * Orchestrates all components and manages the multi-step workflow
 */

import React, { useEffect } from 'react';
import { usePromptBuilder } from '../hooks/usePromptBuilder';
import ProjectSetup from '../components/ProjectSetup';
import UMLModelSelector from '../components/UMLModelSelector';
import GherkinPromptBuilder from '../components/GherkinPromptBuilder';
import JiraPromptBuilder from '../components/JiraPromptBuilder';
import PromptPreview from '../components/PromptPreview';
import '../styles/promptEngineer.css';

export const PromptEngineer: React.FC = () => {
	const {
		state,
		config,
		updateProjectContext,
		updateArtifacts,
		updatePromptStyle,
		updateVariable,
		validateConfig,
		generatePrompt,
		savePrompt,
		loadSavedPrompts,
		nextStep,
		prevStep,
		reset,
	} = usePromptBuilder();

	// Load saved prompts on mount
	useEffect(() => {
		loadSavedPrompts();
	}, [loadSavedPrompts]);

	const handleGenerate = async () => {
		const isValid = await validateConfig();
		if (isValid) {
			await generatePrompt();
			nextStep();
		}
	};

	const handleSavePrompt = async () => {
		await savePrompt();
	};

	return (
		<div className="prompt-engineer-page">
			{/* Header */}
			<div className="page-header">
				<div className="header-content">
					<h1>🚀 UML Prompt Engineer</h1>
					<p>Generate structured prompts for UML-driven development</p>
				</div>
				<button onClick={reset} className="btn btn-secondary btn-small" title="Reset form">
					⟲ Reset
				</button>
			</div>

			{/* Progress Bar */}
			<div className="progress-container">
				<div className="progress-bar">
					<div
						className="progress-fill"
						style={{
							width: `${((state.step === 'setup' ? 1 : state.step === 'artifacts' ? 2 : state.step === 'builder' ? 3 : state.step === 'preview' ? 4 : 5) / 5) * 100}%`,
						}}
					/>
				</div>
				<div className="progress-steps">
					<Step
						number={1}
						label="Setup"
						active={state.step === 'setup'}
						completed={['artifacts', 'builder', 'preview', 'save'].includes(state.step)}
					/>
					<Step
						number={2}
						label="Artifacts"
						active={state.step === 'artifacts'}
						completed={['builder', 'preview', 'save'].includes(state.step)}
					/>
					<Step
						number={3}
						label="Builder"
						active={state.step === 'builder'}
						completed={['preview', 'save'].includes(state.step)}
					/>
					<Step
						number={4}
						label="Preview"
						active={state.step === 'preview'}
						completed={state.step === 'save'}
					/>
					<Step
						number={5}
						label="Save"
						active={state.step === 'save'}
						completed={false}
					/>
				</div>
			</div>

			{/* Error Display */}
			{state.error && (
				<div className="error-banner">
					<span className="error-icon">⚠️</span>
					<div className="error-content">
						<p>{state.error}</p>
					</div>
					<button
						onClick={() => {}}
						className="btn-close"
						aria-label="Close error"
					>
						×
					</button>
				</div>
			)}

			{/* Main Content */}
			<div className="main-content">
				{/* Step: Project Setup */}
				{state.step === 'setup' && (
					<ProjectSetup
						projectContext={state.projectContext}
						config={config}
						onContextChange={updateProjectContext}
						onNext={nextStep}
						errors={state.validationErrors}
						loading={state.loading}
					/>
				)}

				{/* Step: UML Model Selection */}
				{state.step === 'artifacts' && (
					<UMLModelSelector
						selectedArtifacts={state.umlArtifacts}
						config={config}
						onArtifactChange={updateArtifacts}
						onNext={nextStep}
						onPrev={prevStep}
						errors={state.validationErrors}
					/>
				)}

				{/* Step: Prompt Builder */}
				{state.step === 'builder' && (
					<div className="builder-step">
						<div className="builder-selector">
							<h2>Step 3: Choose Prompt Style</h2>
							<p className="step-description">
								Select how you want your prompts formatted
							</p>

							<div className="style-selector">
								<StyleCard
									title="Gherkin (BDD)"
									description="Given/When/Then format for behavior-driven development"
									icon="📋"
									selected={state.promptStyle === 'gherkin'}
									onClick={() => updatePromptStyle('gherkin')}
								/>
								<StyleCard
									title="Jira User Story"
									description="As a / I want / So that format with acceptance criteria"
									icon="🎯"
									selected={state.promptStyle === 'jira'}
									onClick={() => updatePromptStyle('jira')}
								/>
								<StyleCard
									title="Technical Specification"
									description="Detailed technical requirements and architecture"
									icon="📐"
									selected={state.promptStyle === 'technical-spec'}
									onClick={() => updatePromptStyle('technical-spec')}
								/>
							</div>
						</div>

						{/* Builder Component */}
						{state.promptStyle && (
							<div className="builder-section">
								{state.promptStyle === 'gherkin' && (
									<GherkinPromptBuilder
										config={config}
										selectedVariables={state.selectedVariables}
										onVariableChange={updateVariable}
										onGenerate={handleGenerate}
										loading={state.loading}
									/>
								)}

								{state.promptStyle === 'jira' && (
									<JiraPromptBuilder
										config={config}
										selectedVariables={state.selectedVariables}
										onVariableChange={updateVariable}
										onGenerate={handleGenerate}
										loading={state.loading}
									/>
								)}

								{state.promptStyle === 'technical-spec' && (
									<div className="builder-container">
										<h3>Technical Specification Configuration</h3>
										<p className="builder-description">
											Your technical specification will include architecture, components,
											and implementation guidance.
										</p>
										<div className="info-box">
											<p>
												Technical specifications are auto-generated with optimal formatting
												for documentation and team communication.
											</p>
										</div>
										<div className="builder-actions">
											<button
												onClick={handleGenerate}
												disabled={state.loading}
												className="btn btn-primary btn-large"
											>
												{state.loading
													? '⟳ Generating Spec...'
													: '✨ Generate Technical Spec'}
											</button>
										</div>
									</div>
								)}
							</div>
						)}

						{/* Navigation */}
						{state.promptStyle && (
							<div className="form-actions">
								<button onClick={prevStep} className="btn btn-secondary">
									← Back to Artifacts
								</button>
							</div>
						)}
					</div>
				)}

				{/* Step: Preview & Save */}
				{(state.step === 'preview' || state.step === 'save') && (
					<div className="preview-step">
						<PromptPreview
							prompt={state.generatedPrompt}
							loading={state.loading}
							onSave={handleSavePrompt}
							onCopy={() => {}}
							savingPrompt={state.loading}
						/>

						<div className="form-actions">
							<button onClick={prevStep} className="btn btn-secondary">
								← Back
							</button>
							<button onClick={() => nextStep()} className="btn btn-primary">
								View History →
							</button>
						</div>
					</div>
				)}

				{/* Step: History */}
				{state.step === 'save' && (
					<div className="history-step">
						<h2>📚 Saved Prompts</h2>
						{state.savedPrompts.length === 0 ? (
							<div className="empty-state">
								<p>No saved prompts yet. Generate and save a prompt to get started!</p>
								<button onClick={() => reset()} className="btn btn-primary">
									Create New Prompt
								</button>
							</div>
						) : (
							<div className="prompts-list">
								{state.savedPrompts.map((prompt) => (
									<div key={prompt.id} className="prompt-item">
										<div className="prompt-header">
											<h3>{prompt.title}</h3>
											<div className="badges">
												<span className="badge">{prompt.style}</span>
												<span className="badge">
													{prompt.artifacts.length} artifact
													{prompt.artifacts.length !== 1 ? 's' : ''}
												</span>
											</div>
										</div>
										<p className="timestamp">
											Created: {new Date(prompt.createdAt).toLocaleDateString()}
										</p>
										<div className="actions">
											<button className="btn btn-small btn-secondary">
												View
											</button>
											<button className="btn btn-small btn-secondary">
												Export
											</button>
										</div>
									</div>
								))}
							</div>
						)}

						<div className="form-actions">
							<button onClick={() => reset()} className="btn btn-primary">
								+ Create New Prompt
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

/**
 * Progress Step Component
 */
interface StepProps {
	number: number;
	label: string;
	active: boolean;
	completed: boolean;
}

const Step: React.FC<StepProps> = ({ number, label, active, completed }) => (
	<div className={`progress-step ${active ? 'active' : ''} ${completed ? 'completed' : ''}`}>
		<div className="step-circle">
			{completed ? '✓' : number}
		</div>
		<span className="step-label">{label}</span>
	</div>
);

/**
 * Style Card Component
 */
interface StyleCardProps {
	title: string;
	description: string;
	icon: string;
	selected: boolean;
	onClick: () => void;
}

const StyleCard: React.FC<StyleCardProps> = ({
	title,
	description,
	icon,
	selected,
	onClick,
}) => (
	<div
		className={`style-card ${selected ? 'selected' : ''}`}
		onClick={onClick}
		role="radio"
		aria-checked={selected}
		tabIndex={0}
		onKeyDown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				onClick();
				e.preventDefault();
			}
		}}
	>
		<div className="card-icon">{icon}</div>
		<h3>{title}</h3>
		<p>{description}</p>
		{selected && <div className="selected-indicator">✓</div>}
	</div>
);

export default PromptEngineer;
