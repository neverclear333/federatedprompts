/**
 * Federated Configuration Schema
 * Defines the single source of truth for all valid variables, options, and configurations
 * This ensures 100% API validation across all endpoints and frontend components
 */

export interface VariableOption {
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
	options?: VariableOption[];
	defaultValue?: string | string[];
	validation?: {
		minLength?: number;
		maxLength?: number;
		pattern?: string;
	};
	dependencies?: string[];
}

export interface FederatedConfigSchema {
	version: string;
	lastUpdated: string;
	umlArtifacts: VariableOption[];
	promptStyles: VariableOption[];
	variables: Record<string, VariableDefinition>;
	techStack: VariableOption[];
	teamRoles: VariableOption[];
	integrationPoints: VariableOption[];
	projectDomains: VariableOption[];
	gherkinPatterns: {
		given: string[];
		when: string[];
		then: string[];
	};
}

/**
 * Define the complete federated configuration
 * This is the single source of truth for all valid values
 */
export const federatedConfig: FederatedConfigSchema = {
	version: '1.0.0',
	lastUpdated: new Date().toISOString(),

	// UML Artifact Types
	umlArtifacts: [
		{
			value: 'use-case',
			label: 'Use Case Diagram',
			description: 'Visualize actors, use cases, and system interactions',
			tags: ['behavioral', 'requirements'],
		},
		{
			value: 'class',
			label: 'Class Diagram',
			description: 'Show classes, attributes, methods, and relationships',
			tags: ['structural', 'design'],
		},
		{
			value: 'sequence',
			label: 'Sequence Diagram',
			description: 'Illustrate interactions between objects over time',
			tags: ['behavioral', 'interaction'],
		},
		{
			value: 'activity',
			label: 'Activity Diagram',
			description: 'Model workflows and processes',
			tags: ['behavioral', 'process'],
		},
		{
			value: 'component',
			label: 'Component Diagram',
			description: 'Show system components and dependencies',
			tags: ['structural', 'architecture'],
		},
		{
			value: 'deployment',
			label: 'Deployment Diagram',
			description: 'Visualize hardware and software deployment',
			tags: ['structural', 'infrastructure'],
		},
		{
			value: 'state',
			label: 'State Diagram',
			description: 'Show state transitions and state machines',
			tags: ['behavioral', 'stateful'],
		},
		{
			value: 'entity-relationship',
			label: 'Entity Relationship (ER) Diagram',
			description: 'Model database schema and relationships',
			tags: ['data', 'database'],
		},
	],

	// Prompt Styles
	promptStyles: [
		{
			value: 'gherkin',
			label: 'Gherkin (BDD)',
			description: 'Given/When/Then format for behavior-driven development',
			compatibleWith: ['use-case', 'activity', 'sequence'],
		},
		{
			value: 'jira',
			label: 'Jira User Story',
			description: 'As a / I want / So that format with acceptance criteria',
			compatibleWith: ['use-case', 'class', 'component'],
		},
		{
			value: 'technical-spec',
			label: 'Technical Specification',
			description: 'Detailed technical requirements and architecture',
			compatibleWith: ['class', 'component', 'deployment', 'entity-relationship'],
		},
		{
			value: 'project-plan',
			label: 'Project Plan',
			description: 'Structured project roadmap with phases and timeline',
			compatibleWith: ['use-case', 'class', 'component', 'deployment', 'sequence'],
		},
	],

	// Technology Stack Options
	techStack: [
		{
			value: 'react',
			label: 'React',
			description: 'UI library (JavaScript/TypeScript)',
			tags: ['frontend', 'javascript'],
		},
		{
			value: 'vue',
			label: 'Vue.js',
			description: 'Progressive JavaScript framework',
			tags: ['frontend', 'javascript'],
		},
		{
			value: 'angular',
			label: 'Angular',
			description: 'Full-featured framework',
			tags: ['frontend', 'typescript'],
		},
		{
			value: 'svelte',
			label: 'Svelte',
			description: 'Compiler-based framework',
			tags: ['frontend', 'javascript'],
		},
		{
			value: 'nodejs',
			label: 'Node.js',
			description: 'JavaScript runtime for backend',
			tags: ['backend', 'javascript'],
		},
		{
			value: 'python',
			label: 'Python',
			description: 'Versatile backend language',
			tags: ['backend'],
		},
		{
			value: 'java',
			label: 'Java',
			description: 'Enterprise backend language',
			tags: ['backend'],
		},
		{
			value: 'typescript',
			label: 'TypeScript',
			description: 'Typed superset of JavaScript',
			tags: ['language', 'typed'],
		},
		{
			value: 'postgresql',
			label: 'PostgreSQL',
			description: 'Relational database',
			tags: ['database', 'sql'],
		},
		{
			value: 'mongodb',
			label: 'MongoDB',
			description: 'NoSQL document database',
			tags: ['database', 'nosql'],
		},
		{
			value: 'graphql',
			label: 'GraphQL',
			description: 'Query language for APIs',
			tags: ['api', 'query-language'],
		},
		{
			value: 'rest',
			label: 'REST',
			description: 'RESTful API architecture',
			tags: ['api', 'architecture'],
		},
	],

	// Team Roles
	teamRoles: [
		{
			value: 'frontend-dev',
			label: 'Frontend Developer',
			description: 'Builds user interfaces',
		},
		{
			value: 'backend-dev',
			label: 'Backend Developer',
			description: 'Develops server-side logic',
		},
		{
			value: 'full-stack-dev',
			label: 'Full Stack Developer',
			description: 'Works on both frontend and backend',
		},
		{
			value: 'qa-engineer',
			label: 'QA Engineer',
			description: 'Tests and validates functionality',
		},
		{
			value: 'devops-engineer',
			label: 'DevOps Engineer',
			description: 'Manages deployment and infrastructure',
		},
		{
			value: 'architect',
			label: 'Software Architect',
			description: 'Designs system architecture',
		},
		{
			value: 'product-manager',
			label: 'Product Manager',
			description: 'Defines product requirements',
		},
		{
			value: 'ux-designer',
			label: 'UX Designer',
			description: 'Designs user experience',
		},
	],

	// Integration Points
	integrationPoints: [
		{
			value: 'rest-api',
			label: 'REST API',
			description: 'HTTP-based API integration',
		},
		{
			value: 'graphql-api',
			label: 'GraphQL API',
			description: 'GraphQL endpoint integration',
		},
		{
			value: 'database',
			label: 'Database',
			description: 'Direct database connection',
		},
		{
			value: 'message-queue',
			label: 'Message Queue',
			description: 'Async messaging (RabbitMQ, Kafka, etc.)',
		},
		{
			value: 'cache',
			label: 'Cache Layer',
			description: 'Redis or similar caching',
		},
		{
			value: 'file-storage',
			label: 'File Storage',
			description: 'S3, GCS, or similar storage',
		},
		{
			value: 'external-service',
			label: 'External Service',
			description: 'Third-party service integration',
		},
		{
			value: 'webhook',
			label: 'Webhook',
			description: 'Event-driven HTTP callbacks',
		},
	],

	// Project Domains
	projectDomains: [
		{
			value: 'ecommerce',
			label: 'E-Commerce',
			description: 'Online shopping and retail',
		},
		{
			value: 'fintech',
			label: 'FinTech',
			description: 'Financial technology and services',
		},
		{
			value: 'healthcare',
			label: 'Healthcare',
			description: 'Medical and health-related systems',
		},
		{
			value: 'education',
			label: 'Education',
			description: 'Learning and educational platforms',
		},
		{
			value: 'social',
			label: 'Social Network',
			description: 'Social media and community platforms',
		},
		{
			value: 'saas',
			label: 'SaaS',
			description: 'Software as a Service platforms',
		},
		{
			value: 'iot',
			label: 'IoT',
			description: 'Internet of Things systems',
		},
		{
			value: 'gaming',
			label: 'Gaming',
			description: 'Game development and platforms',
		},
		{
			value: 'enterprise',
			label: 'Enterprise',
			description: 'Large-scale business systems',
		},
		{
			value: 'other',
			label: 'Other',
			description: 'Other domain',
		},
	],

	// Gherkin Patterns
	gherkinPatterns: {
		given: [
			'a user with valid credentials',
			'a database with existing records',
			'a system in a certain state',
			'valid input parameters',
			'an authenticated user',
			'a precondition is met',
		],
		when: [
			'the user submits a form',
			'the user clicks a button',
			'an API request is made',
			'a system event occurs',
			'the user navigates to a page',
			'an action is performed',
		],
		then: [
			'the result is displayed',
			'an error message appears',
			'the system updates the state',
			'a notification is sent',
			'the data is persisted',
			'the expected outcome occurs',
		],
	},

	// Variable Definitions for Project Context
	variables: {
		projectName: {
			name: 'projectName',
			type: 'text',
			label: 'Project Name',
			description: 'Name of your project',
			required: true,
			validation: {
				minLength: 3,
				maxLength: 100,
			},
		},
		projectDescription: {
			name: 'projectDescription',
			type: 'text',
			label: 'Project Description',
			description: 'Brief description of what the project does',
			required: true,
			validation: {
				minLength: 10,
				maxLength: 500,
			},
		},
		projectDomain: {
			name: 'projectDomain',
			type: 'select',
			label: 'Project Domain',
			description: 'What industry or domain is this project for?',
			required: true,
			dependencies: [],
		},
		techStackSelection: {
			name: 'techStackSelection',
			type: 'multiselect',
			label: 'Technology Stack',
			description: 'Select the technologies you are using',
			required: true,
			dependencies: [],
		},
		teamRolesSelection: {
			name: 'teamRolesSelection',
			type: 'multiselect',
			label: 'Team Roles',
			description: 'Who are the people working on this project?',
			required: true,
			dependencies: [],
		},
		integrationPointsSelection: {
			name: 'integrationPointsSelection',
			type: 'multiselect',
			label: 'Integration Points',
			description: 'What systems will this integrate with?',
			required: false,
			dependencies: [],
		},
		successCriteria: {
			name: 'successCriteria',
			type: 'text',
			label: 'Success Criteria',
			description: 'How will you measure success?',
			required: false,
			validation: {
				minLength: 0,
				maxLength: 500,
			},
		},
	},
};

/**
 * Validation utilities
 */
export function validateVariable(
	variableName: string,
	value: any,
	config: FederatedConfigSchema = federatedConfig
): {
	valid: boolean;
	errors: string[];
} {
	const variable = config.variables[variableName];
	if (!variable) {
		return {
			valid: false,
			errors: [`Variable "${variableName}" does not exist in configuration`],
		};
	}

	const errors: string[] = [];

	// Check required
	if (variable.required && (!value || (Array.isArray(value) && value.length === 0))) {
		errors.push(`${variable.label} is required`);
	}

	// Check type
	if (variable.type === 'select' || variable.type === 'multiselect') {
		const validOptions = variable.options?.map((opt) => opt.value) || [];
		const valuesToCheck = Array.isArray(value) ? value : [value];

		for (const v of valuesToCheck) {
			if (!validOptions.includes(v)) {
				errors.push(
					`"${v}" is not a valid option for ${variable.label}. Valid options: ${validOptions.join(', ')}`
				);
			}
		}
	}

	// Check text validation
	if (variable.type === 'text' && typeof value === 'string') {
		if (variable.validation?.minLength && value.length < variable.validation.minLength) {
			errors.push(
				`${variable.label} must be at least ${variable.validation.minLength} characters`
			);
		}
		if (variable.validation?.maxLength && value.length > variable.validation.maxLength) {
			errors.push(
				`${variable.label} must be at most ${variable.validation.maxLength} characters`
			);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Validate a complete config object
 */
export function validateConfig(
	config: any,
	federalConfig: FederatedConfigSchema = federatedConfig
): {
	valid: boolean;
	errors: Array<{
		field: string;
		message: string;
		suggestion?: string;
	}>;
} {
	const errors: Array<{
		field: string;
		message: string;
		suggestion?: string;
	}> = [];

	// Validate required variables
	for (const [key, variable] of Object.entries(federalConfig.variables)) {
		if (variable.required && !config[key]) {
			errors.push({
				field: key,
				message: `${variable.label} is required`,
				suggestion: `Please provide a value for ${variable.label}`,
			});
		}
	}

	// Validate each variable
	for (const [key, value] of Object.entries(config)) {
		if (federalConfig.variables[key]) {
			const validation = validateVariable(key, value, federalConfig);
			if (!validation.valid) {
				for (const error of validation.errors) {
					errors.push({
						field: key,
						message: error,
					});
				}
			}
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

/**
 * Get variable options for a specific variable
 */
export function getVariableOptions(
	variableName: string,
	config: FederatedConfigSchema = federatedConfig
): VariableOption[] {
	const variable = config.variables[variableName];

	if (!variable || !variable.options) {
		// Check if it maps to a top-level array in config
		const key = variableName.replace('Selection', '');
		if (key === 'techStack') return config.techStack;
		if (key === 'teamRoles') return config.teamRoles;
		if (key === 'integrationPoints') return config.integrationPoints;
		if (key === 'projectDomain') return config.projectDomains;
		return [];
	}

	return variable.options;
}

export default federatedConfig;
