/**
 * SegmentSelector Component
 * Select client segment with preview of campaign
 */

import React from 'react';
import type { ClientSegment } from '../types/realEstate';

interface SegmentSelectorProps {
	value: ClientSegment;
	onChange: (segment: ClientSegment) => void;
}

const SEGMENTS: Array<{
	value: ClientSegment;
	label: string;
	emoji: string;
	description: string;
	color: string;
}> = [
	{
		value: 'hotbuyer',
		label: 'Hot Buyer',
		emoji: '🔥',
		description: 'Open house attendee - active buyer interest',
		color: '#3b82f6',
	},
	{
		value: 'hotseller',
		label: 'Hot Seller',
		emoji: '🏠',
		description: 'Expressed interest in selling their home',
		color: '#ef4444',
	},
	{
		value: 'investor',
		label: 'Investor',
		emoji: '💰',
		description: 'Real estate investment opportunity interest',
		color: '#8b5cf6',
	},
	{
		value: 'referral',
		label: 'Referral',
		emoji: '🤝',
		description: 'Referred by existing client or network',
		color: '#10b981',
	},
];

export const SegmentSelector: React.FC<SegmentSelectorProps> = ({ value, onChange }) => {
	return (
		<div className="segment-selector">
			<h3>Select Client Segment</h3>
			<p className="segment-help">
				This determines which automated drip campaign will be triggered
			</p>

			<div className="segment-grid">
				{SEGMENTS.map((segment) => (
					<button
						key={segment.value}
						className={`segment-card ${value === segment.value ? 'selected' : ''}`}
						onClick={() => onChange(segment.value)}
						style={{
							borderColor: value === segment.value ? segment.color : 'transparent',
							backgroundColor:
								value === segment.value
									? `${segment.color}10`
									: 'transparent',
						}}
					>
						<div className="segment-emoji">{segment.emoji}</div>
						<h4>{segment.label}</h4>
						<p>{segment.description}</p>
					</button>
				))}
			</div>

			<div className="segment-info">
				<p>
					✉️ Selected segment will receive a personalized automated email sequence designed to nurture the relationship and move the prospect forward.
				</p>
			</div>
		</div>
	);
};

export default SegmentSelector;
