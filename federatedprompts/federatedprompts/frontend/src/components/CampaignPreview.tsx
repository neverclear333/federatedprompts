/**
 * CampaignPreview Component
 * Shows email template preview with personalization
 */

import React from 'react';
import type { ClientSegment, ClientCampaignStatus } from '../types/realEstate';

interface CampaignPreviewProps {
	segment: ClientSegment;
	campaignStatus?: ClientCampaignStatus;
	clientName?: string;
}

const CAMPAIGN_EMAILS: Record<ClientSegment, Array<{
	number: number;
	subject: string;
	preview: string;
	type: string;
}>> = {
	hotbuyer: [
		{
			number: 1,
			subject: "Thanks for visiting our open house!",
			preview: "Welcome + Buckhead Market Snapshot",
			type: "Market Update"
		},
		{
			number: 2,
			subject: "5 Tips for First-Time Homebuyers in Atlanta",
			preview: "Essential buying tips for Atlanta market",
			type: "Homeowner Tip"
		},
		{
			number: 3,
			subject: "Understanding Atlanta Mortgage Rates & Your Buying Power",
			preview: "Mortgage insights specific to your situation",
			type: "Mortgage Insight"
		},
		{
			number: 4,
			subject: "Featured Buckhead Listings for You",
			preview: "Curated properties matching your criteria",
			type: "Listing Feature"
		},
		{
			number: 5,
			subject: "Buckhead Market Update - February 2026",
			preview: "Latest market trends and opportunities",
			type: "Market Update"
		},
	],
	hotseller: [
		{
			number: 1,
			subject: "Considering selling your Buckhead home?",
			preview: "Offer for free home valuation",
			type: "Main Content"
		},
		{
			number: 2,
			subject: "7 Tips to Get Top Dollar for Your Buckhead Home",
			preview: "Proven strategies to maximize your sale price",
			type: "Homeowner Tip"
		},
		{
			number: 3,
			subject: "Why Now is a Great Time to Sell in Buckhead",
			preview: "Market conditions favor sellers right now",
			type: "Market Update"
		},
		{
			number: 4,
			subject: "Home Equity & Reinvestment Options",
			preview: "Maximize your proceeds and opportunities",
			type: "Mortgage Insight"
		},
		{
			number: 5,
			subject: "Recent Buckhead Success Stories",
			preview: "See what we achieved for other sellers",
			type: "Social Proof"
		},
	],
	investor: [
		{
			number: 1,
			subject: "Buckhead Investment Opportunities",
			preview: "High-yield investment properties available",
			type: "Main Content"
		},
		{
			number: 2,
			subject: "Atlanta Rental Market Analysis",
			preview: "Data-driven rental income insights",
			type: "Market Update"
		},
		{
			number: 3,
			subject: "Free ROI Calculator & Market Analysis",
			preview: "Tools to evaluate investment opportunities",
			type: "Mortgage Insight"
		},
	],
	referral: [
		{
			number: 1,
			subject: "Thank you for the referral!",
			preview: "Gratitude and relationship strengthening",
			type: "Main Content"
		},
		{
			number: 2,
			subject: "Recent Transaction Success Story",
			preview: "Showcase of successful transaction",
			type: "Social Proof"
		},
		{
			number: 3,
			subject: "Exclusive Opportunities for Your Network",
			preview: "Special deals for trusted connections",
			type: "Main Content"
		},
	],
};

export const CampaignPreview: React.FC<CampaignPreviewProps> = ({
	segment,
	campaignStatus,
	clientName,
}) => {
	const emails = CAMPAIGN_EMAILS[segment];
	const currentEmail = campaignStatus?.currentEmailNumber || 1;

	return (
		<div className="campaign-preview-container">
			<h3>Campaign: {segment === 'hotbuyer' ? '🔥 Buyer' : segment === 'hotseller' ? '🏠 Seller' : segment === 'investor' ? '💰 Investor' : '🤝 Referral'} Drip</h3>

			{campaignStatus && (
				<div className="campaign-progress">
					<div className="progress-bar">
						<div
							className="progress-fill"
							style={{
								width: `${campaignStatus.campaignProgress}%`,
							}}
						/>
					</div>
					<p className="progress-text">
						Email {campaignStatus.currentEmailNumber} of {campaignStatus.totalEmailsInSequence}
					</p>
				</div>
			)}

			<div className="email-sequence">
				{emails.map((email, idx) => {
					const isActive = email.number === currentEmail;
					const isCompleted = email.number < currentEmail;
					const isPending = email.number > currentEmail;

					return (
						<div
							key={email.number}
							className={`email-card ${
								isActive ? 'active' : ''
							} ${isCompleted ? 'completed' : ''} ${
								isPending ? 'pending' : ''
							}`}
						>
							<div className="email-number">
								{isCompleted ? '✅' : isActive ? '📧' : '○'} {email.number}
							</div>
							<div className="email-content">
								<h4>{email.subject}</h4>
								<p>{email.preview}</p>
								<span className="email-type">{email.type}</span>
							</div>
						</div>
					);
				})}
			</div>

			<div className="campaign-info-box">
				<p>
					<strong>📬 Campaign Type:</strong> Automated drip sequence
				</p>
				<p>
					<strong>⏰ Frequency:</strong> Emails sent every 2-7 days
				</p>
				<p>
					<strong>✉️ Personalization:</strong> Each email is customized with client name and property details
				</p>
			</div>
		</div>
	);
};

export default CampaignPreview;
