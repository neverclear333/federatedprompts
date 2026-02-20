/**
 * Prompt Generation Utilities
 * Generates Gherkin-style and Jira-style prompts from configuration
 */

import { federatedConfig } from './federatedConfig';

export interface PromptGenerationInput {
	projectContext: {
		name: string;
		description: string;
		domain: string;
		techStack: string[];
		teamRoles: string[];
		customTeamRoles?: string[];
	};
	umlArtifacts: string[];
	promptStyle: 'gherkin' | 'jira' | 'technical-spec' | 'project-plan';
	selectedVariables: Record<string, any>;
}

export interface GeneratedPromptOutput {
	title: string;
	content: string;
	metadata: {
		style: string;
		artifacts: string[];
		variables: Record<string, any>;
		generatedAt: string;
	};
}

/**
 * Main prompt generation dispatcher
 */
export function generatePrompt(input: PromptGenerationInput): GeneratedPromptOutput {
	const { projectContext, umlArtifacts, promptStyle, selectedVariables } = input;

	let content = '';
	let title = '';

	switch (promptStyle) {
		case 'gherkin':
			({ content, title } = generateGherkinPrompt(input));
			break;
		case 'jira':
			({ content, title } = generateJiraPrompt(input));
			break;
		case 'technical-spec':
			({ content, title } = generateTechnicalSpec(input));
			break;
		case 'project-plan':
			({ content, title } = generateProjectPlan(input));
			break;
		default:
			throw new Error(`Unknown prompt style: ${promptStyle}`);
	}

	return {
		title,
		content,
		metadata: {
			style: promptStyle,
			artifacts: umlArtifacts,
			variables: selectedVariables,
			generatedAt: new Date().toISOString(),
		},
	};
}

/**
 * Generate Gherkin-style prompts with multiple scenarios
 */
function generateGherkinPrompt(input: PromptGenerationInput): {
	content: string;
	title: string;
} {
	const { projectContext, umlArtifacts } = input;
	const artifactLabels = getArtifactLabels(umlArtifacts);

	const title = `Feature: ${projectContext.name} - ${artifactLabels[0]}`;

	let content = `# ${title}\n\n`;
	content += `As a ${getTeamRoleLabel(projectContext.teamRoles[0])}\n`;
	content += `I want to develop the ${artifactLabels.join(', ')} for the ${projectContext.name} project\n`;
	content += `So that we can effectively design the system architecture\n\n`;

	content += `## Background\n`;
	content += `Given the project is called "${projectContext.name}"\n`;
	content += `And the project description is: "${projectContext.description}"\n`;
	content += `And the project domain is "${getTechLabel(projectContext.domain)}"\n`;
	content += `And the technology stack includes: ${projectContext.techStack.map(getTechLabel).join(', ')}\n`;
	content += `And the team includes: ${projectContext.teamRoles.map(getTeamRoleLabel).join(', ')}\n\n`;

	// Generate multiple scenarios based on artifacts
	const scenarios = generateGherkinScenarios(input);
	content += scenarios;

	return { content, title };
}

/**
 * Generate Gherkin scenarios for selected artifacts
 */
function generateGherkinScenarios(input: PromptGenerationInput): string {
	const { projectContext, umlArtifacts } = input;
	let scenarios = '';

	// Scenario 1: Create the UML artifact
	const artifact = umlArtifacts[0];
	const artifactLabel = getArtifactLabel(artifact);

	scenarios += `## Scenario 1: Create the ${artifactLabel}\n`;
	scenarios += `When the architect reviews the ${projectContext.name} requirements\n`;
	scenarios += `And they identify the key entities and interactions\n`;
	scenarios += `Then they create a ${artifactLabel} that shows:\n`;
	scenarios += `  - All major components\n`;
	scenarios += `  - Clear relationships and dependencies\n`;
	scenarios += `  - Integration points with other systems\n`;
	scenarios += `And the diagram is validated against project requirements\n\n`;

	// Scenario 2: Document the implementation approach
	scenarios += `## Scenario 2: Document the implementation approach\n`;
	scenarios += `When the ${artifactLabel} is complete\n`;
	scenarios += `And the team reviews the design\n`;
	scenarios += `Then a comprehensive technical specification is created that includes:\n`;
	scenarios += `  - Component breakdown\n`;
	scenarios += `  - Technology stack mapping\n`;
	scenarios += `  - Integration strategy\n`;
	scenarios += `  - Development checklist\n`;
	scenarios += `And all team members understand their responsibilities\n\n`;

	// Scenario 3: Create implementation tasks
	scenarios += `## Scenario 3: Create implementation tasks\n`;
	scenarios += `When the specification is documented\n`;
	scenarios += `And the team is assigned\n`;
	scenarios += `Then detailed implementation tasks are created for each:\n`;
	scenarios += `  - ${projectContext.teamRoles.map(getTeamRoleLabel).join('\n  - ')}\n`;
	scenarios += `And each task includes acceptance criteria\n`;
	scenarios += `And the implementation is chunked into manageable increments\n\n`;

	return scenarios;
}

/**
 * Generate Jira-style user stories
 */
function generateJiraPrompt(input: PromptGenerationInput): {
	content: string;
	title: string;
} {
	const { projectContext, umlArtifacts } = input;
	const artifactLabels = getArtifactLabels(umlArtifacts);

	const title = `US: ${projectContext.name} - ${artifactLabels[0]}`;

	let content = `# ${title}\n\n`;

	content += `## Summary\n`;
	content += `Design and document the ${artifactLabels.join(' and ')} for the ${projectContext.name} project\n\n`;

	content += `## Description\n`;
	content += `As a ${getTeamRoleLabel(projectContext.teamRoles[0])}\n`;
	content += `I want to create a comprehensive ${artifactLabels[0]}\n`;
	content += `So that the team understands the system architecture and can implement accordingly\n\n`;

	content += `## Context\n`;
	content += `**Project:** ${projectContext.name}\n`;
	content += `**Domain:** ${getTechLabel(projectContext.domain)}\n`;
	content += `**Technology Stack:** ${projectContext.techStack.map(getTechLabel).join(', ')}\n`;
	content += `**Team Roles:** ${projectContext.teamRoles.map(getTeamRoleLabel).join(', ')}\n\n`;

	content += `**Detailed Description:**\n`;
	content += projectContext.description + '\n\n';

	content += `## Acceptance Criteria\n`;

	const criteria = generateAcceptanceCriteria(input);
	for (const criterion of criteria) {
		content += `- [ ] ${criterion}\n`;
	}

	content += `\n## Definition of Done\n`;
	content += `- All acceptance criteria met\n`;
	content += `- Code/diagrams reviewed by team lead\n`;
	content += `- Documentation updated\n`;
	content += `- Tests pass (if applicable)\n`;
	content += `- Ready for next phase\n\n`;

	content += `## Story Points Estimate\n`;
	content += `${umlArtifacts.length * 8} points\n\n`;

	return { content, title };
}

/**
 * Generate acceptance criteria for Jira stories
 */
function generateAcceptanceCriteria(input: PromptGenerationInput): string[] {
	const { projectContext, umlArtifacts } = input;
	const criteria: string[] = [];

	const artifactLabel = getArtifactLabel(umlArtifacts[0]);

	criteria.push(`The ${artifactLabel} is created and accurately represents the system`);
	criteria.push(`All components are clearly labeled and documented`);
	criteria.push(`Relationships and dependencies are clearly shown`);
	criteria.push(`The diagram follows UML standards`);
	criteria.push(`Integration points with other systems are identified`);
	criteria.push(
		`The design is reviewed and approved by ${getTeamRoleLabel(projectContext.teamRoles[0])}`
	);
	criteria.push(
		`Implementation approach is documented for the ${projectContext.techStack.map(getTechLabel).join(' and ')} stack`
	);
	criteria.push(`Team members have clarity on their assigned components`);

	return criteria;
}

/**
 * Generate technical specification
 */
function generateTechnicalSpec(input: PromptGenerationInput): {
	content: string;
	title: string;
} {
	const { projectContext, umlArtifacts } = input;
	const artifactLabels = getArtifactLabels(umlArtifacts);

	const title = `Technical Specification: ${projectContext.name}`;

	let content = `# ${title}\n\n`;

	content += `## 1. Executive Summary\n`;
	content += `This document outlines the technical architecture for ${projectContext.name}.\n`;
	content += `The system will include: ${artifactLabels.join(', ')}.\n\n`;

	content += `## 2. Project Overview\n`;
	content += `**Name:** ${projectContext.name}\n`;
	content += `**Domain:** ${getTechLabel(projectContext.domain)}\n`;
	content += `**Description:** ${projectContext.description}\n\n`;

	content += `## 3. Technology Stack\n`;
	for (const tech of projectContext.techStack) {
		content += `- ${getTechLabel(tech)}\n`;
	}
	content += `\n`;

	content += `## 4. UML Artifacts\n`;
	for (const artifact of umlArtifacts) {
		content += `- ${getArtifactLabel(artifact)}: Represents the ${artifact} structure\n`;
	}
	content += `\n`;

	content += `## 5. Team Roles & Responsibilities\n`;
	for (const role of projectContext.teamRoles) {
		const roleLabel = getTeamRoleLabel(role);
		content += `### ${roleLabel}\n`;
		content += `Responsible for:\n`;
		content += getResponsibilities(role) + '\n';
	}

	content += `## 6. Implementation Plan\n`;
	content += `This project will be implemented in the following phases:\n`;
	content += `1. Architecture Design and Review\n`;
	content += `2. Component Development\n`;
	content += `3. Integration Testing\n`;
	content += `4. Documentation and Knowledge Transfer\n\n`;

	content += `## 7. Success Criteria\n`;
	content += `- All UML diagrams completed and reviewed\n`;
	content += `- Technology stack decisions documented\n`;
	content += `- Team has clear understanding of architecture\n`;
	content += `- Implementation plan established\n`;
	content += `- Ready to begin development\n`;

	return { content, title };
}

/**
 * Helper: Get artifact label from value
 */
function getArtifactLabel(value: string): string {
	const artifact = federatedConfig.umlArtifacts.find((a) => a.value === value);
	return artifact?.label || value;
}

/**
 * Helper: Get multiple artifact labels
 */
function getArtifactLabels(values: string[]): string[] {
	return values.map(getArtifactLabel);
}

/**
 * Helper: Get tech label from value
 */
function getTechLabel(value: string): string {
	const tech = federatedConfig.techStack.find((t) => t.value === value);
	if (tech) return tech.label;

	const domain = federatedConfig.projectDomains.find((d) => d.value === value);
	if (domain) return domain.label;

	return value;
}

/**
 * Helper: Get team role label from value
 */
function getTeamRoleLabel(value: string): string {
	const role = federatedConfig.teamRoles.find((r) => r.value === value);
	return role?.label || value;
}

/**
 * Helper: Get responsibilities for a team role
 */
function getResponsibilities(role: string): string {
	const responsibilities: Record<string, string> = {
		'frontend-dev': `- Implementing UI components\n- Ensuring responsive design\n- API integration`,
		'backend-dev': `- Developing server logic\n- Database design\n- API endpoint creation`,
		'full-stack-dev': `- Full stack development\n- End-to-end feature implementation\n- Integration testing`,
		'qa-engineer': `- Test case creation\n- Quality assurance\n- Bug reporting and tracking`,
		'devops-engineer': `- Infrastructure setup\n- Deployment automation\n- Monitoring and logging`,
		architect: `- Architecture design\n- Technology decisions\n- System review and approval`,
		'product-manager': `- Requirements definition\n- Feature prioritization\n- Success metrics`,
		'ux-designer': `- UI/UX design\n- User research\n- Design system creation`,
	};

	return responsibilities[role] || `- Contributing to ${role}`;
}

/**
 * Generate project plan
 */
function generateProjectPlan(input: PromptGenerationInput): {
	content: string;
	title: string;
} {
	const { projectContext, umlArtifacts } = input;
	const artifactLabels = getArtifactLabels(umlArtifacts);
	const allRoles = [
		...projectContext.teamRoles.map(getTeamRoleLabel),
		...(projectContext.customTeamRoles || []),
	];

	const title = `Project Plan: ${projectContext.name}`;

	let content = `# ${title}\n\n`;

	content += `## Executive Summary\n`;
	content += `This document outlines the complete project plan for ${projectContext.name}, a ${getTechLabel(projectContext.domain)} project.\n`;
	content += `The project will create ${artifactLabels.length} UML artifact${artifactLabels.length !== 1 ? 's' : ''}: ${artifactLabels.join(', ')}.\n`;
	content += `The team consists of ${allRoles.length} members with the following roles: ${allRoles.join(', ')}.\n\n`;

	content += `## Project Overview\n`;
	content += `**Project Name:** ${projectContext.name}\n`;
	content += `**Domain:** ${getTechLabel(projectContext.domain)}\n`;
	content += `**Description:** ${projectContext.description}\n`;
	content += `**Technology Stack:** ${projectContext.techStack.map(getTechLabel).join(', ')}\n\n`;

	// Calculate timeline
	const weekPerArtifact = 2;
	const baselineWeeks = umlArtifacts.length * weekPerArtifact + 1; // +1 for planning
	const totalWeeks = baselineWeeks + 1; // +1 for deployment

	content += `## Timeline Overview\n`;
	content += `**Estimated Duration:** ${totalWeeks} weeks\n`;
	content += `**Start Date:** [Project Start Date]\n`;
	content += `**Target Completion:** [${totalWeeks} weeks from start]\n\n`;

	// Phase breakdown
	content += `## Phase Breakdown\n\n`;

	content += `### Phase 1: Planning & Requirements (Week 1)\n`;
	content += `**Deliverables:**\n`;
	content += `- Project requirements document\n`;
	content += `- Team alignment and kickoff\n`;
	content += `- Technology stack confirmation\n`;
	content += `- Success criteria definition\n\n`;
	content += `**Assigned Roles:** ${allRoles.slice(0, 2).join(', ')}\n\n`;

	const artifactWeeks = Math.ceil(umlArtifacts.length * weekPerArtifact / 2);
	content += `### Phase 2: Design & Architecture (Weeks 2-${1 + artifactWeeks})\n`;
	content += `**Deliverables:**\n`;
	for (const artifact of artifactLabels) {
		content += `- ${artifact}\n`;
	}
	content += `- Architecture documentation\n`;
	content += `- Design review and approval\n\n`;
	content += `**Assigned Roles:** ${allRoles.filter((_, i) => i % 2 === 0).join(', ')}\n\n`;

	const devStart = 2 + artifactWeeks;
	const devEnd = devStart + artifactWeeks;
	content += `### Phase 3: Development & Implementation (Weeks ${devStart}-${devEnd})\n`;
	content += `**Deliverables:**\n`;
	content += `- Component implementation\n`;
	content += `- Code reviews and quality assurance\n`;
	content += `- Unit and integration tests\n`;
	content += `- Implementation documentation\n\n`;
	content += `**Assigned Roles:** ${allRoles.join(', ')}\n\n`;

	const testStart = devEnd + 1;
	const testEnd = testStart + 1;
	content += `### Phase 4: Testing & Quality Assurance (Weeks ${testStart}-${testEnd})\n`;
	content += `**Deliverables:**\n`;
	content += `- Comprehensive test suite\n`;
	content += `- QA verification and sign-off\n`;
	content += `- Bug fixes and improvements\n`;
	content += `- Final documentation review\n\n`;
	content += `**Assigned Roles:** QA Engineers and ${allRoles[0]}\n\n`;

	content += `### Phase 5: Deployment & Handoff (Week ${totalWeeks})\n`;
	content += `**Deliverables:**\n`;
	content += `- Production deployment\n`;
	content += `- Knowledge transfer documentation\n`;
	content += `- Team training and support\n`;
	content += `- Project closure and retrospective\n\n`;
	content += `**Assigned Roles:** DevOps and Project Lead\n\n`;

	// Team assignments
	content += `## Team Assignments & Responsibilities\n\n`;
	for (const role of allRoles) {
		const responsibilities = getResponsibilities(
			projectContext.teamRoles.find((r) => getTeamRoleLabel(r) === role) || ''
		);
		content += `### ${role}\n`;
		content += `${responsibilities}\n\n`;
	}

	// Success criteria
	content += `## Success Criteria\n`;
	for (const artifact of artifactLabels) {
		content += `- ${artifact} created and documented\n`;
	}
	content += `- All team members trained and confident\n`;
	content += `- System deployed to production\n`;
	content += `- Performance targets met\n`;
	content += `- Project delivered on schedule\n`;
	content += `- All stakeholders satisfied\n\n`;

	// Risk assessment
	content += `## Risk Mitigation\n\n`;
	content += `### Technical Risks\n`;
	content += `- **Technology Integration:** Ensure compatibility testing of ${projectContext.techStack.map(getTechLabel).join(', ')} early\n`;
	content += `- **Artifact Complexity:** Start with simpler artifacts to build team confidence\n`;
	content += `- **Dependencies:** Identify cross-artifact dependencies upfront\n\n`;

	content += `### Team Risks\n`;
	content += `- **Skill Gaps:** Plan knowledge transfer sessions in advance\n`;
	content += `- **Resource Availability:** Establish backup roles for critical positions\n`;
	content += `- **Communication:** Implement daily standups and weekly planning sessions\n\n`;

	content += `### Timeline Risks\n`;
	content += `- **Buffer:** ${Math.ceil(totalWeeks * 0.1)} week buffer included in plan\n`;
	content += `- **Scope Creep:** Strict change control process\n`;
	content += `- **Dependencies:** Parallel workflows planned where possible\n\n`;

	content += `## Resource Requirements\n`;
	content += `- **Team Size:** ${allRoles.length} dedicated team members\n`;
	content += `- **Tools & Infrastructure:** ${projectContext.techStack.map(getTechLabel).join(', ')}\n`;
	content += `- **Duration:** ${totalWeeks} weeks\n`;
	content += `- **Budget Estimate:** Based on ${totalWeeks} weeks × ${allRoles.length} team members\n\n`;

	content += `## Next Steps\n`;
	content += `1. Finalize team assignments and confirm availability\n`;
	content += `2. Schedule project kickoff meeting\n`;
	content += `3. Establish communication protocols\n`;
	content += `4. Begin Phase 1: Planning & Requirements\n`;

	return { content, title };
}
