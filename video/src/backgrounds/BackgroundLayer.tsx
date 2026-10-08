import React from 'react';

interface BackgroundLayerProps {
	theme?: 'paper' | 'night' | 'accent';
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ theme = 'night' }) => {
	if (theme === 'paper') {
		return (
			<div
				style={{
					position: 'absolute',
					inset: 0,
					backgroundColor: '#ece5db',
					backgroundImage: 'radial-gradient(rgba(0,0,0,0.06) 1px, transparent 0)',
					backgroundSize: '24px 24px',
					zIndex: 0,
				}}
			/>
		);
	}

	if (theme === 'accent') {
		return (
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: 'radial-gradient(circle at center, #2e080c 0%, #0d0103 100%)',
					zIndex: 0,
				}}
			/>
		);
	}

	// Default: Night with ambient warm glow
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				background: 'radial-gradient(circle at center, #18181c 0%, #0a0a0c 100%)',
				zIndex: 0,
			}}
		/>
	);
};
