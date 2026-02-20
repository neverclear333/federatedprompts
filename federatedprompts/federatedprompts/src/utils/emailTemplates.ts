/**
 * Email Templates for Real Estate CRM Drip Campaigns
 * Pre-built campaign sequences for each client segment
 */

import type { ClientSegment } from '../types/realEstate';

export interface CampaignSequence {
	segmentTag: ClientSegment;
	emailCount: number;
	emails: Array<{
		number: number;
		subject: string;
		previewText: string;
		contentType: string;
		sendDelayDays: number;
	}>;
}

/**
 * Email sequences for each segment
 * hotbuyer: 5-email buyer nurture sequence
 * hotseller: 5-email seller nurture sequence
 * investor: 3-email investor opportunity sequence
 * referral: 3-email relationship nurture sequence
 */
export const campaignSequences: Record<ClientSegment, CampaignSequence> = {
	hotbuyer: {
		segmentTag: 'hotbuyer',
		emailCount: 5,
		emails: [
			{
				number: 1,
				subject: "Welcome to Buckhead's Premier Real Estate Experience! 🏠",
				previewText: 'Exclusive market insights and buyer resources tailored for you',
				contentType: 'market-update',
				sendDelayDays: 0,
			},
			{
				number: 2,
				subject: '5 Pro Tips for First-Time Homebuyers in Atlanta',
				previewText: 'Essential tips from a Buckhead specialist to maximize your investment',
				contentType: 'homeowner-tip',
				sendDelayDays: 2,
			},
			{
				number: 3,
				subject: 'Understanding Atlanta Mortgage Rates & Your Buying Power',
				previewText: 'Learn how to leverage current rates to your advantage',
				contentType: 'mortgage-insight',
				sendDelayDays: 5,
			},
			{
				number: 4,
				subject: 'Exclusive Buckhead Listings Matching Your Criteria',
				previewText: 'Hand-selected properties that match your investment goals',
				contentType: 'listing-feature',
				sendDelayDays: 7,
			},
			{
				number: 5,
				subject: 'February Buckhead Real Estate Market Update',
				previewText: 'Trends, insights, and opportunities in your target market',
				contentType: 'market-update',
				sendDelayDays: 14,
			},
		],
	},

	hotseller: {
		segmentTag: 'hotseller',
		emailCount: 5,
		emails: [
			{
				number: 1,
				subject: 'Ready to Sell? Get Your Free Buckhead Home Valuation 🎯',
				previewText: 'Discover what your home is worth in today\'s market',
				contentType: 'main-content',
				sendDelayDays: 0,
			},
			{
				number: 2,
				subject: '7 Proven Ways to Get Top Dollar for Your Buckhead Home',
				previewText: 'Expert strategies from a local Buckhead specialist',
				contentType: 'homeowner-tip',
				sendDelayDays: 2,
			},
			{
				number: 3,
				subject: 'Why Now is the Perfect Time to Sell in Buckhead',
				previewText: 'Market conditions and inventory data favoring sellers',
				contentType: 'market-update',
				sendDelayDays: 5,
			},
			{
				number: 4,
				subject: 'Home Equity & Reinvestment Opportunities for Sellers',
				previewText: 'Maximize your proceeds and plan your next move',
				contentType: 'mortgage-insight',
				sendDelayDays: 7,
			},
			{
				number: 5,
				subject: 'Recent Buckhead Sales & Success Stories',
				previewText: 'See the amazing results we\'ve achieved for sellers like you',
				contentType: 'social-proof',
				sendDelayDays: 14,
			},
		],
	},

	investor: {
		segmentTag: 'investor',
		emailCount: 3,
		emails: [
			{
				number: 1,
				subject: 'Buckhead Investment Opportunities - Strong ROI Potential',
				previewText: 'Premium investment properties with excellent cash flow potential',
				contentType: 'listing-feature',
				sendDelayDays: 0,
			},
			{
				number: 2,
				subject: 'Atlanta Rental Market Analysis & Investment Trends',
				previewText: 'Data-driven insights for smart investment decisions',
				contentType: 'market-update',
				sendDelayDays: 3,
			},
			{
				number: 3,
				subject: 'Free Investment Property Analysis & ROI Calculator',
				previewText: 'Tools to evaluate deals and maximize your returns',
				contentType: 'homeowner-tip',
				sendDelayDays: 7,
			},
		],
	},

	referral: {
		segmentTag: 'referral',
		emailCount: 3,
		emails: [
			{
				number: 1,
				subject: 'Thank You for the Referral! 🙏',
				previewText: 'We truly appreciate your trust and support',
				contentType: 'main-content',
				sendDelayDays: 0,
			},
			{
				number: 2,
				subject: 'Exclusive Opportunities for Our Trusted Network',
				previewText: 'Special deals reserved for our referral partners',
				contentType: 'listing-feature',
				sendDelayDays: 7,
			},
			{
				number: 3,
				subject: 'Recent Success Stories from Our Community',
				previewText: 'How we\'ve helped members of our network achieve their goals',
				contentType: 'social-proof',
				sendDelayDays: 14,
			},
		],
	},
};

/**
 * Get campaign sequence for a segment
 */
export function getCampaignSequence(segment: ClientSegment): CampaignSequence {
	return campaignSequences[segment];
}

/**
 * Get specific email from a campaign sequence
 */
export function getCampaignEmail(
	segment: ClientSegment,
	emailNumber: number
): (CampaignSequence['emails'][0]) | null {
	const sequence = getCampaignSequence(segment);
	const email = sequence.emails.find((e) => e.number === emailNumber);
	return email || null;
}

/**
 * Get total email count for a segment
 */
export function getEmailCountForSegment(segment: ClientSegment): number {
	return getCampaignSequence(segment).emailCount;
}

/**
 * Generate HTML email content for a campaign email
 * This is a template generator - in production, these would be more sophisticated
 */
export function generateEmailHTML(
	segment: ClientSegment,
	emailNumber: number,
	clientName?: string
): string {
	const email = getCampaignEmail(segment, emailNumber);
	if (!email) {
		return '<p>Email not found</p>';
	}

	const greeting = clientName ? `Hi ${clientName}!` : 'Hello!';

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
		.container { max-width: 600px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
		.header h1 { margin: 0; font-size: 28px; }
		.content { background: white; padding: 30px 20px; border: 1px solid #eee; }
		.footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
		.cta { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
		.property-card { background: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
		.tip { background: #e8f4f8; padding: 15px; margin: 15px 0; border-radius: 4px; }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<h1>🏠 Buckhead Real Estate</h1>
			<p>${segment === 'hotbuyer' ? '🔥 Buyer Resources' : segment === 'hotseller' ? '🏡 Seller Insights' : segment === 'investor' ? '💰 Investment Opportunities' : '🤝 Referral Network'}</p>
		</div>
		<div class="content">
			<p>${greeting}</p>
			<h2>${email.subject}</h2>
			<p>${email.previewText}</p>

			${
				email.contentType === 'homeowner-tip'
					? `<div class="tip">
				<strong>💡 Tip of the Day:</strong>
				<p>When ${segment === 'hotbuyer' ? 'buying' : 'selling'} in Buckhead, location and timing are everything. Our expertise in this exclusive market ensures you make the best decision.</p>
			</div>`
					: ''
			}

			${
				email.contentType === 'market-update'
					? `<div class="property-card">
				<strong>📊 Market Snapshot:</strong>
				<p><strong>Median Price:</strong> $850,000</p>
				<p><strong>Days on Market:</strong> 32</p>
				<p><strong>Inventory Level:</strong> Moderate</p>
				<p><strong>Buyer Demand:</strong> Strong</p>
			</div>`
					: ''
			}

			${
				email.contentType === 'listing-feature'
					? `<div class="property-card">
				<strong>✨ Featured Property:</strong>
				<p><strong>Address:</strong> Exclusive Buckhead Estate</p>
				<p><strong>Price:</strong> $2.5M - $3.2M</p>
				<p><strong>Beds/Baths:</strong> 5 BR / 5.5 BA</p>
				<p><strong>Highlights:</strong> Gated community, smart home, resort-style pool</p>
			</div>`
					: ''
			}

			<p style="text-align: center; margin: 30px 0;">
				<a href="https://federatedprompts.federated-prompt-account.workers.dev" class="cta">View More Details →</a>
			</p>

			<p>Best regards,<br><strong>Your Buckhead Real Estate Specialist</strong></p>
		</div>
		<div class="footer">
			<p>You're receiving this because you expressed interest in ${segment === 'hotbuyer' ? 'buying' : segment === 'hotseller' ? 'selling' : 'investing in'} real estate in Buckhead.</p>
			<p><a href="#" style="color: #667eea;">Unsubscribe</a> | <a href="#" style="color: #667eea;">Update Preferences</a></p>
			<p>&copy; 2026 Buckhead Real Estate. All rights reserved.</p>
		</div>
	</div>
</body>
</html>
	`.trim();
}

/**
 * Get next email in sequence
 * Returns null if client has completed all emails in campaign
 */
export function getNextEmail(
	segment: ClientSegment,
	currentEmailNumber: number
): (CampaignSequence['emails'][0]) | null {
	const sequence = getCampaignSequence(segment);
	const nextNumber = currentEmailNumber + 1;

	if (nextNumber > sequence.emailCount) {
		return null; // Campaign complete
	}

	return getCampaignEmail(segment, nextNumber) || null;
}

/**
 * Calculate days until next email should be sent
 */
export function getDaysUntilNextEmail(
	segment: ClientSegment,
	currentEmailNumber: number
): number | null {
	const nextEmail = getNextEmail(segment, currentEmailNumber);
	return nextEmail ? nextEmail.sendDelayDays : null;
}
