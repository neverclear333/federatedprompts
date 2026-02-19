/**
 * PromptPreview Component
 * Displays generated prompts with syntax highlighting and export options
 */

import React, { useState } from 'react';
import type { GeneratedPrompt } from '../types/prompt';
import '../styles/promptEngineer.css';

interface PromptPreviewProps {
	prompt: GeneratedPrompt | null;
	loading: boolean;
	onSave: () => void;
	onCopy: () => void;
	onExport?: (format: 'markdown' | 'json' | 'text') => void;
	savingPrompt?: boolean;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
	prompt,
	loading,
	onSave,
	onCopy,
	onExport,
	savingPrompt = false,
}) => {
	const [copiedToClipboard, setCopiedToClipboard] = useState(false);
	const [exportFormat, setExportFormat] = useState<'markdown' | 'json' | 'text'>('markdown');

	const handleCopy = async () => {
		if (!prompt) return;

		try {
			await navigator.clipboard.writeText(prompt.content);
			setCopiedToClipboard(true);
			onCopy();
			setTimeout(() => setCopiedToClipboard(false), 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
		}
	};

	const handleExport = () => {
		if (onExport) {
			onExport(exportFormat);
		} else {
			// Fallback: download as text file
			const element = document.createElement('a');
			element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(prompt?.content || '')}`);
			element.setAttribute('download', `prompt-${prompt?.metadata.style}.txt`);
			element.style.display = 'none';
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		}
	};

	if (loading) {
		return (
			<div className="prompt-preview-container loading">
				<div className="spinner">⟳</div>
				<p>Generating prompt...</p>
			</div>
		);
	}

	if (!prompt) {
		return (
			<div className="prompt-preview-container empty">
				<p>No prompt generated yet. Configure your project and select artifacts to get started.</p>
			</div>
		);
	}

	return (
		<div className="prompt-preview-container">
			{/* Header */}
			<div className="preview-header">
				<div className="prompt-meta">
					<h3>{prompt.title}</h3>
					<div className="meta-info">
						<span className="badge style-badge">{prompt.metadata.style}</span>
						<span className="badge artifacts-badge">
							{prompt.metadata.artifacts.length} artifact
							{prompt.metadata.artifacts.length !== 1 ? 's' : ''}
						</span>
						<span className="timestamp">
							Generated: {new Date(prompt.metadata.generatedAt).toLocaleTimeString()}
						</span>
					</div>
				</div>
			</div>

			{/* Preview Content */}
			<div className="preview-content">
				<pre className="prompt-text">{prompt.content}</pre>
			</div>

			{/* Actions */}
			<div className="preview-actions">
				<button onClick={handleCopy} className="btn btn-secondary" title="Copy to clipboard">
					{copiedToClipboard ? '✓ Copied!' : '📋 Copy'}
				</button>

				<div className="export-group">
					<select
						value={exportFormat}
						onChange={(e) => setExportFormat(e.target.value as any)}
						className="export-select"
					>
						<option value="markdown">Export as Markdown</option>
						<option value="json">Export as JSON</option>
						<option value="text">Export as Text</option>
					</select>
					<button onClick={handleExport} className="btn btn-secondary">
						📥 Export
					</button>
				</div>

				<button
					onClick={onSave}
					disabled={savingPrompt}
					className="btn btn-primary"
					title="Save prompt to history"
				>
					{savingPrompt ? '💾 Saving...' : '💾 Save Prompt'}
				</button>
			</div>

			{/* Artifacts Info */}
			<div className="artifacts-info">
				<h4>UML Artifacts Included:</h4>
				<ul>
					{prompt.metadata.artifacts.map((artifact) => (
						<li key={artifact}>{formatArtifactName(artifact)}</li>
					))}
				</ul>
			</div>

			{/* Tips */}
			<div className="tips-box">
				<h4>💡 Tips</h4>
				<ul>
					<li>Copy this prompt and paste it into Claude to generate implementation code</li>
					<li>The prompt is formatted for optimal AI understanding and response</li>
					<li>Save prompts to your history for future reference and refinement</li>
					<li>Export to share with team members or documentation systems</li>
				</ul>
			</div>
		</div>
	);
};

function formatArtifactName(artifact: string): string {
	const names: Record<string, string> = {
		'use-case': 'Use Case Diagram',
		class: 'Class Diagram',
		sequence: 'Sequence Diagram',
		activity: 'Activity Diagram',
		component: 'Component Diagram',
		deployment: 'Deployment Diagram',
		state: 'State Diagram',
		'entity-relationship': 'Entity Relationship Diagram',
	};
	return names[artifact] || artifact;
}

export default PromptPreview;
