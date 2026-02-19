/**
 * usePromptBuilder Hook
 * Manages state for the prompt engineering tool
 * Handles API calls, validation, and localStorage sync
 */

import { useState, useEffect, useCallback } from 'react';
import type {
	BuilderState,
	UsePromptBuilderReturn,
	ProjectContext,
	PromptConfig,
	FederatedConfig,
	GeneratedPrompt,
	StoredPrompt,
	ValidationError,
	PromptCache,
} from '../types/prompt';

const CACHE_KEY = 'federatedprompts_builder_cache';
const CONFIG_CACHE_KEY = 'federatedprompts_config_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const initialState: BuilderState = {
	step: 'setup',
	projectContext: {
		name: '',
		description: '',
		domain: '',
		techStack: [],
		teamRoles: [],
	},
	umlArtifacts: [],
	promptStyle: '',
	selectedVariables: {},
	generatedPrompt: null,
	savedPrompts: [],
	loading: false,
	error: null,
	validationErrors: [],
};

export function usePromptBuilder(): UsePromptBuilderReturn {
	const [state, setState] = useState<BuilderState>(initialState);
	const [config, setConfig] = useState<FederatedConfig | null>(null);

	// Load federated config from API
	const loadConfig = useCallback(async () => {
		setState((prev) => ({ ...prev, loading: true }));

		try {
			// Check cache first
			const cached = localStorage.getItem(CONFIG_CACHE_KEY);
			if (cached) {
				const { data, timestamp } = JSON.parse(cached);
				if (Date.now() - timestamp < CACHE_DURATION) {
					setConfig(data);
					setState((prev) => ({ ...prev, loading: false }));
					return;
				}
			}

			// Fetch from API
			const response = await fetch('/api/config/all');
			if (!response.ok) throw new Error('Failed to load configuration');

			const data = await response.json();
			setConfig(data);

			// Cache the config
			localStorage.setItem(
				CONFIG_CACHE_KEY,
				JSON.stringify({
					data,
					timestamp: Date.now(),
				})
			);

			setState((prev) => ({ ...prev, loading: false }));
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Failed to load configuration';
			setState((prev) => ({
				...prev,
				error: message,
				loading: false,
			}));
		}
	}, []);

	// Load persisted state from localStorage
	useEffect(() => {
		const cached = localStorage.getItem(CACHE_KEY);
		if (cached) {
			try {
				const cache: PromptCache = JSON.parse(cached);
				setState((prev) => ({
					...prev,
					projectContext: cache.projectContext || prev.projectContext,
					umlArtifacts: cache.umlArtifacts,
					promptStyle: cache.promptStyle,
					selectedVariables: cache.selectedVariables,
				}));
			} catch (error) {
				console.error('Failed to load cache:', error);
			}
		}

		// Load config
		loadConfig();
	}, [loadConfig]);

	// Save state to localStorage
	const saveToCache = useCallback(() => {
		const cache: PromptCache = {
			projectContext: state.projectContext,
			umlArtifacts: state.umlArtifacts,
			promptStyle: state.promptStyle,
			selectedVariables: state.selectedVariables,
			federatedConfig: config,
			lastUpdated: new Date().toISOString(),
		};
		localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
	}, [state, config]);

	// Update project context
	const updateProjectContext = useCallback((context: Partial<ProjectContext>) => {
		setState((prev) => ({
			...prev,
			projectContext: {
				...prev.projectContext,
				...context,
			},
		}));
	}, []);

	// Update UML artifacts
	const updateArtifacts = useCallback((artifacts: string[]) => {
		setState((prev) => ({
			...prev,
			umlArtifacts: artifacts,
			validationErrors: [],
		}));
	}, []);

	// Update prompt style
	const updatePromptStyle = useCallback(
		(style: 'gherkin' | 'jira' | 'technical-spec') => {
			setState((prev) => ({
				...prev,
				promptStyle: style,
				validationErrors: [],
			}));
		},
		[]
	);

	// Update selected variable
	const updateVariable = useCallback((name: string, value: any) => {
		setState((prev) => ({
			...prev,
			selectedVariables: {
				...prev.selectedVariables,
				[name]: value,
			},
		}));
	}, []);

	// Validate current configuration
	const validateConfig = useCallback(async (): Promise<boolean> => {
		setState((prev) => ({ ...prev, loading: true, validationErrors: [] }));

		try {
			const promptConfig: PromptConfig = {
				projectContext: state.projectContext,
				umlArtifacts: state.umlArtifacts,
				promptStyle: state.promptStyle as 'gherkin' | 'jira' | 'technical-spec',
				selectedVariables: state.selectedVariables,
			};

			const response = await fetch('/api/prompts/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ config: promptConfig }),
			});

			const result = await response.json();

			if (!result.valid) {
				setState((prev) => ({
					...prev,
					validationErrors: result.errors || [],
					loading: false,
				}));
				return false;
			}

			setState((prev) => ({ ...prev, loading: false }));
			return true;
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Validation failed';
			setState((prev) => ({
				...prev,
				error: message,
				loading: false,
			}));
			return false;
		}
	}, [state]);

	// Generate prompt
	const generatePrompt = useCallback(async () => {
		const isValid = await validateConfig();
		if (!isValid) return;

		setState((prev) => ({ ...prev, loading: true }));

		try {
			const promptConfig: PromptConfig = {
				projectContext: state.projectContext,
				umlArtifacts: state.umlArtifacts,
				promptStyle: state.promptStyle as 'gherkin' | 'jira' | 'technical-spec',
				selectedVariables: state.selectedVariables,
			};

			const response = await fetch('/api/prompts/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ config: promptConfig }),
			});

			if (!response.ok) {
				throw new Error('Failed to generate prompt');
			}

			const result = await response.json();

			setState((prev) => ({
				...prev,
				generatedPrompt: result.prompt,
				loading: false,
			}));

			saveToCache();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Generation failed';
			setState((prev) => ({
				...prev,
				error: message,
				loading: false,
			}));
		}
	}, [state, validateConfig, saveToCache]);

	// Save prompt
	const savePrompt = useCallback(async () => {
		if (!state.generatedPrompt) {
			setState((prev) => ({
				...prev,
				error: 'No prompt to save',
			}));
			return;
		}

		setState((prev) => ({ ...prev, loading: true }));

		try {
			const promptConfig: PromptConfig = {
				projectContext: state.projectContext,
				umlArtifacts: state.umlArtifacts,
				promptStyle: state.promptStyle as 'gherkin' | 'jira' | 'technical-spec',
				selectedVariables: state.selectedVariables,
			};

			const response = await fetch('/api/prompts/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					prompt: state.generatedPrompt,
					config: promptConfig,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to save prompt');
			}

			await loadSavedPrompts();
			setState((prev) => ({
				...prev,
				error: null,
				loading: false,
			}));
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Save failed';
			setState((prev) => ({
				...prev,
				error: message,
				loading: false,
			}));
		}
	}, [state]);

	// Load saved prompts
	const loadSavedPrompts = useCallback(async () => {
		try {
			const response = await fetch('/api/prompts/list');
			if (!response.ok) throw new Error('Failed to load prompts');

			const result = await response.json();
			setState((prev) => ({
				...prev,
				savedPrompts: result.prompts || [],
			}));
		} catch (error) {
			console.error('Failed to load saved prompts:', error);
		}
	}, []);

	// Load specific prompt
	const loadPrompt = useCallback(async (id: string) => {
		setState((prev) => ({ ...prev, loading: true }));

		try {
			const response = await fetch(`/api/prompts/${id}`);
			if (!response.ok) throw new Error('Failed to load prompt');

			const result = await response.json();
			const prompt = result.prompt;

			setState((prev) => ({
				...prev,
				projectContext: prompt.config.projectContext,
				umlArtifacts: prompt.config.umlArtifacts,
				promptStyle: prompt.config.promptStyle,
				selectedVariables: prompt.config.selectedVariables,
				generatedPrompt: {
					title: prompt.title,
					content: prompt.content,
					metadata: prompt.metadata,
				},
				loading: false,
			}));

			saveToCache();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Load failed';
			setState((prev) => ({
				...prev,
				error: message,
				loading: false,
			}));
		}
	}, [saveToCache]);

	// Delete prompt
	const deletePrompt = useCallback(async (id: string) => {
		try {
			const response = await fetch(`/api/prompts/${id}`, {
				method: 'DELETE',
			});

			if (!response.ok) throw new Error('Failed to delete prompt');

			await loadSavedPrompts();
		} catch (error) {
			const message = error instanceof Error ? error.message : 'Delete failed';
			setState((prev) => ({
				...prev,
				error: message,
			}));
		}
	}, [loadSavedPrompts]);

	// Navigation
	const nextStep = useCallback(() => {
		setState((prev) => {
			const steps: Array<BuilderState['step']> = [
				'setup',
				'artifacts',
				'builder',
				'preview',
				'save',
			];
			const currentIndex = steps.indexOf(prev.step);
			if (currentIndex < steps.length - 1) {
				return { ...prev, step: steps[currentIndex + 1] };
			}
			return prev;
		});
	}, []);

	const prevStep = useCallback(() => {
		setState((prev) => {
			const steps: Array<BuilderState['step']> = [
				'setup',
				'artifacts',
				'builder',
				'preview',
				'save',
			];
			const currentIndex = steps.indexOf(prev.step);
			if (currentIndex > 0) {
				return { ...prev, step: steps[currentIndex - 1] };
			}
			return prev;
		});
	}, []);

	const reset = useCallback(() => {
		setState(initialState);
		localStorage.removeItem(CACHE_KEY);
	}, []);

	// Save to cache whenever state changes
	useEffect(() => {
		if (config) {
			saveToCache();
		}
	}, [state, config, saveToCache]);

	return {
		state,
		config,
		loadConfig,
		updateProjectContext,
		updateArtifacts,
		updatePromptStyle,
		updateVariable,
		validateConfig,
		generatePrompt,
		savePrompt,
		loadPrompt,
		deletePrompt,
		loadSavedPrompts,
		nextStep,
		prevStep,
		reset,
	};
}
