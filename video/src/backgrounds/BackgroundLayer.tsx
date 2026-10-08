import React from 'react';
import { useCurrentFrame } from 'remotion';

interface BackgroundLayerProps {
	theme?: 'paper' | 'night' | 'accent' | 'apple-music-blur';
}

export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({ theme = 'night' }) => {
	const frame = useCurrentFrame();

	if (theme === 'apple-music-blur') {
		const angle = (frame * 0.5) % 360;
		return (
			<div
				style={{
					position: 'absolute',
					inset: 0,
					background: `radial-gradient(circle at 30% 40%, #501d36 0%, #170d2b 45%, #08060c 100%)`,
					filter: 'blur(30px)',
					zIndex: 0,
					transform: 'scale(1.1)',
				}}
			>
				{/* Secondary animated color orb */}
				<div
					style={{
						position: 'absolute',
						width: '700px',
						height: '700px',
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(160, 40, 110, 0.45) 0%, transparent 70%)',
						top: `${40 + Math.sin(frame * 0.02) * 15}%`,
						left: `${50 + Math.cos(frame * 0.02) * 20}%`,
						filter: 'blur(60px)',
					}}
				/>
			</div>
		);
	}

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
