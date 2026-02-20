/**
 * Frontend TypeScript Types for Prompt Engineer
 * Mirrors backend types but optimized for React components
 */

// Configuration loaded from API
export interface FederatedConfig {
	umlArtifacts: OptionItem[];
	promptStyles: OptionItem[];
	variables: Record<string, VariableDefinition>;
	techStack: OptionItem[];
	teamRoles: OptionItem[];
	integrationPoints: OptionItem[];
	projectDomains: OptionItem[];
	gherkinPatterns: {
		given: string[];
		when: string[];
		then: string[];
	};
}

export interface OptionItem {
	value: string;
	label: string;
	description?: string;
	compatibleWith?: string[];
	tags?: string[];
}

export interface VariableDefinition {
	name: string;
	type: 'select' | 'multiselect' | 'text' | 'number' | 'checkbox';
	label: string;
	description: string;
	required: boolean;
	options?: OptionItem[];
	defaultValue?: string | string[];
	validation?: {
		minLength?: number;
		maxLength?: number;
		pattern?: string;
	};
	dependencies?: string[];
}

// Project context form data
export interface ProjectContext {
	name: string;
	description: string;
	domain: string;
	techStack: string[];
	teamRoles: string[];
	customTeamRoles?: string[];
}

// Prompt configuration
export interface PromptConfig {
	projectContext: ProjectContext;
	umlArtifacts: string[];
	promptStyle: 'gherkin' | 'jira' | 'technical-spec' | 'project-plan';
	selectedVariables: Record<string, any>;
	validatedAt?: string;
}

// Generated prompt
export interface GeneratedPrompt {
	title: string;
	content: string;
	metadata: {
		style: string;
		artifacts: string[];
		variables: Record<string, any>;
		generatedAt: string;
	};
}

// Stored prompt
export interface StoredPrompt extends GeneratedPrompt {
	id: string;
	createdAt: string;
	updatedAt: string;
	config: PromptConfig;
}

// API responses
export interface ValidationResponse {
	valid: boolean;
	errors?: ValidationError[];
	warnings?: string[];
}

export interface ValidationError {
	field: string;
	message: string;
	suggestion?: string;
}

export interface GeneratePromptResponse {
	success: boolean;
	prompt?: GeneratedPrompt;
	error?: string;
	metadata?: {
		generatedAt: string;
		validationMs: number;
		generationMs: number;
	};
}

export interface SavePromptResponse {
	success: boolean;
	id?: string;
	prompt?: StoredPrompt;
	error?: string;
	metadata?: {
		savedAt: string;
	};
}

export interface ListPromptsResponse {
	success: boolean;
	prompts: Array<{
		id: string;
		title: string;
		style: string;
		artifacts: string[];
		createdAt: string;
	}>;
	count: number;
}

export interface GetPromptResponse {
	success: boolean;
	prompt?: StoredPrompt;
	error?: string;
}

// Builder state
export interface BuilderState {
	step: 'setup' | 'artifacts' | 'builder' | 'preview' | 'save';
	projectContext: ProjectContext;
	umlArtifacts: string[];
	promptStyle: 'gherkin' | 'jira' | 'technical-spec' | 'project-plan' | '';
	selectedVariables: Record<string, any>;
	generatedPrompt: GeneratedPrompt | null;
	savedPrompts: StoredPrompt[];
	loading: boolean;
	error: string | null;
	validationErrors: ValidationError[];
	customTeamRoles: string[];
}

// Hook return type
export interface UsePromptBuilderReturn {
	state: BuilderState;
	config: FederatedConfig | null;
	loadConfig: () => Promise<void>;
	updateProjectContext: (context: Partial<ProjectContext>) => void;
	updateArtifacts: (artifacts: string[]) => void;
	updatePromptStyle: (style: 'gherkin' | 'jira' | 'technical-spec' | 'project-plan') => void;
	updateVariable: (name: string, value: any) => void;
	updateCustomRoles: (roles: string[]) => void;
	validateConfig: () => Promise<boolean>;
	generatePrompt: () => Promise<void>;
	savePrompt: () => Promise<void>;
	loadPrompt: (id: string) => Promise<void>;
	deletePrompt: (id: string) => Promise<void>;
	loadSavedPrompts: () => Promise<void>;
	nextStep: () => void;
	prevStep: () => void;
	reset: () => void;
}

// Cache structure for localStorage
export interface PromptCache {
	projectContext: ProjectContext | null;
	umlArtifacts: string[];
	promptStyle: 'gherkin' | 'jira' | 'technical-spec' | 'project-plan' | '';
	selectedVariables: Record<string, any>;
	federatedConfig: FederatedConfig | null;
	lastUpdated: string;
}
