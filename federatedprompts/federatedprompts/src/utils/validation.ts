/**
 * Validation utilities for prompt configuration
 * Ensures all prompts are 100% validated against federated schema
 */

import { federatedConfig, validateVariable, validateConfig } from './federatedConfig';

export interface ValidationError {
	field: string;
	message: string;
	suggestion?: string;
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
	warnings: string[];
}

/**
 * Validate a prompt configuration
 */
export function validatePromptConfig(config: any): ValidationResult {
	const errors: ValidationError[] = [];
	const warnings: string[] = [];

	// Validate basic structure
	if (!config || typeof config !== 'object') {
		errors.push({
			field: 'root',
			message: 'Configuration must be an object',
		});
		return { valid: false, errors, warnings };
	}

	// Validate projectContext
	if (!config.projectContext) {
		errors.push({
			field: 'projectContext',
			message: 'projectContext is required',
			suggestion: 'Please provide a projectContext object with required fields',
		});
	} else {
		const contextErrors = validateProjectContext(config.projectContext);
		errors.push(...contextErrors);
	}

	// Validate umlArtifacts
	if (!config.umlArtifacts || !Array.isArray(config.umlArtifacts)) {
		errors.push({
			field: 'umlArtifacts',
			message: 'umlArtifacts must be an array',
		});
	} else if (config.umlArtifacts.length === 0) {
		errors.push({
			field: 'umlArtifacts',
			message: 'At least one UML artifact must be selected',
			suggestion: `Valid options: ${federatedConfig.umlArtifacts.map((a) => a.label).join(', ')}`,
		});
	} else {
		for (const artifact of config.umlArtifacts) {
			if (!federatedConfig.umlArtifacts.some((a) => a.value === artifact)) {
				errors.push({
					field: 'umlArtifacts',
					message: `"${artifact}" is not a valid UML artifact`,
					suggestion: `Valid options: ${federatedConfig.umlArtifacts.map((a) => a.value).join(', ')}`,
				});
			}
		}
	}

	// Validate promptStyle
	if (!config.promptStyle) {
		errors.push({
			field: 'promptStyle',
			message: 'promptStyle is required',
		});
	} else if (!federatedConfig.promptStyles.some((s) => s.value === config.promptStyle)) {
		errors.push({
			field: 'promptStyle',
			message: `"${config.promptStyle}" is not a valid prompt style`,
			suggestion: `Valid options: ${federatedConfig.promptStyles.map((s) => s.value).join(', ')}`,
		});
	}

	// Validate selectedVariables
	if (!config.selectedVariables || typeof config.selectedVariables !== 'object') {
		errors.push({
			field: 'selectedVariables',
			message: 'selectedVariables must be an object',
		});
	} else {
		const varErrors = validateVariables(config.selectedVariables);
		errors.push(...varErrors);
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings,
	};
}

/**
 * Validate project context
 */
function validateProjectContext(context: any): ValidationError[] {
	const errors: ValidationError[] = [];

	if (!context || typeof context !== 'object') {
		errors.push({
			field: 'projectContext',
			message: 'projectContext must be an object',
		});
		return errors;
	}

	// Validate required fields
	if (!context.name || typeof context.name !== 'string') {
		errors.push({
			field: 'projectContext.name',
			message: 'Project name is required',
		});
	} else if (context.name.length < 3 || context.name.length > 100) {
		errors.push({
			field: 'projectContext.name',
			message: 'Project name must be between 3 and 100 characters',
		});
	}

	if (!context.description || typeof context.description !== 'string') {
		errors.push({
			field: 'projectContext.description',
			message: 'Project description is required',
		});
	} else if (context.description.length < 10) {
		errors.push({
			field: 'projectContext.description',
			message: 'Project description must be at least 10 characters',
		});
	}

	if (!context.domain) {
		errors.push({
			field: 'projectContext.domain',
			message: 'Project domain is required',
			suggestion: `Valid domains: ${federatedConfig.projectDomains.map((d) => d.value).join(', ')}`,
		});
	} else if (!federatedConfig.projectDomains.some((d) => d.value === context.domain)) {
		errors.push({
			field: 'projectContext.domain',
			message: `"${context.domain}" is not a valid domain`,
			suggestion: `Valid options: ${federatedConfig.projectDomains.map((d) => d.value).join(', ')}`,
		});
	}

	// Validate techStack
	if (!Array.isArray(context.techStack) || context.techStack.length === 0) {
		errors.push({
			field: 'projectContext.techStack',
			message: 'At least one technology must be selected',
		});
	} else {
		const validTechs = federatedConfig.techStack.map((t) => t.value);
		for (const tech of context.techStack) {
			if (!validTechs.includes(tech)) {
				errors.push({
					field: 'projectContext.techStack',
					message: `"${tech}" is not a valid technology`,
				});
			}
		}
	}

	// Validate teamRoles
	if (!Array.isArray(context.teamRoles) || context.teamRoles.length === 0) {
		errors.push({
			field: 'projectContext.teamRoles',
			message: 'At least one team role must be selected',
		});
	} else {
		const validRoles = federatedConfig.teamRoles.map((r) => r.value);
		for (const role of context.teamRoles) {
			if (!validRoles.includes(role)) {
				errors.push({
					field: 'projectContext.teamRoles',
					message: `"${role}" is not a valid team role`,
				});
			}
		}
	}

	return errors;
}

/**
 * Validate selected variables
 */
function validateVariables(variables: Record<string, any>): ValidationError[] {
	const errors: ValidationError[] = [];

	for (const [key, value] of Object.entries(variables)) {
		const validation = validateVariable(key, value, federatedConfig);
		if (!validation.valid) {
			for (const error of validation.errors) {
				errors.push({
					field: `selectedVariables.${key}`,
					message: error,
				});
			}
		}
	}

	return errors;
}

/**
 * Check if two UML artifacts are compatible
 */
export function checkArtifactCompatibility(
	artifacts: string[],
	promptStyle: string
): { compatible: boolean; incompatible: string[] } {
	const promptStyleObj = federatedConfig.promptStyles.find((s) => s.value === promptStyle);

	if (!promptStyleObj || !promptStyleObj.compatibleWith) {
		return { compatible: true, incompatible: [] };
	}

	const incompatible = artifacts.filter((a) => !promptStyleObj.compatibleWith?.includes(a));

	return {
		compatible: incompatible.length === 0,
		incompatible,
	};
}

/**
 * Format validation errors for response
 */
export function formatValidationResponse(result: ValidationResult): {
	valid: boolean;
	errors?: Array<{
		field: string;
		message: string;
		suggestion?: string;
	}>;
	warnings?: string[];
} {
	const response: any = { valid: result.valid };

	if (result.errors.length > 0) {
		response.errors = result.errors;
	}

	if (result.warnings.length > 0) {
		response.warnings = result.warnings;
	}

	return response;
}
