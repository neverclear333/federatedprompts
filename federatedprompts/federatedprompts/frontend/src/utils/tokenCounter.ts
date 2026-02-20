/**
 * Token Counter Utility
 * Estimates token counts for prompts using simple character-based approximation
 * Based on OpenAI's token estimation: ~4 characters per token average
 */

/**
 * Estimate token count from text
 * Uses character-to-token ratio approximation (1 token ≈ 4 characters)
 */
export function estimateTokens(text: string): number {
	if (!text) return 0;

	// Remove extra whitespace
	const cleaned = text.trim();

	// Approximate: 1 token ≈ 4 characters (OpenAI baseline)
	// But also count words as rough validation
	const charEstimate = Math.ceil(cleaned.length / 4);
	const words = cleaned.split(/\s+/).length;
	const wordEstimate = Math.ceil(words * 1.3); // Average word ≈ 1.3 tokens

	// Use the average of both methods for better accuracy
	return Math.max(charEstimate, wordEstimate);
}

/**
 * Calculate prompt tokens (the user's input to the model)
 * Includes the prompt content and metadata
 */
export function calculatePromptTokens(promptContent: string): number {
	// The actual prompt that would be sent
	return estimateTokens(promptContent);
}

/**
 * Estimate execution tokens (model's response)
 * Based on prompt complexity and typical response patterns
 */
export function estimateExecutionTokens(promptContent: string, style: string): number {
	const baseTokens = estimateTokens(promptContent);

	// Style-based multiplier for expected response length
	const styleMultiplier: Record<string, number> = {
		gherkin: 1.5, // Scenarios can be lengthy
		jira: 1.3, // Story format is concise
		'technical-spec': 2.0, // Technical specs are comprehensive
		'project-plan': 1.8, // Plans are detailed
	};

	const multiplier = styleMultiplier[style] || 1.5;

	// Estimate response will be 1.5-2x the prompt length
	const estimatedResponse = Math.ceil(baseTokens * multiplier);

	// Add buffer for model's thinking and formatting
	return estimatedResponse + Math.ceil(estimatedResponse * 0.1);
}

/**
 * Format token count for display
 */
export function formatTokens(count: number): string {
	if (count >= 1000) {
		return `${(count / 1000).toFixed(1)}k`;
	}
	return count.toString();
}

/**
 * Get token info object
 */
export function getTokenInfo(promptContent: string, style: string = 'gherkin') {
	const promptTokens = calculatePromptTokens(promptContent);
	const executionTokens = estimateExecutionTokens(promptContent, style);
	const totalTokens = promptTokens + executionTokens;

	return {
		promptTokens,
		executionTokens,
		totalTokens,
		promptTokensFormatted: formatTokens(promptTokens),
		executionTokensFormatted: formatTokens(executionTokens),
		totalTokensFormatted: formatTokens(totalTokens),
	};
}
