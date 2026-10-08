import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface AppleMusicLyricsProps {
	currentPhrase: string;
	previousPhrase?: string;
	nextPhrase?: string;
	heroWord?: string;
}

export const AppleMusicLyrics: React.FC<AppleMusicLyricsProps> = ({
	currentPhrase,
	previousPhrase,
	nextPhrase,
	heroWord,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Smooth text arrival spring
	const enterSpring = spring({
		frame,
		fps,
		config: {
			damping: 15,
			mass: 0.9,
			stiffness: 120,
		},
	});

	const translateY = interpolate(enterSpring, [0, 1], [30, 0]);
	const activeScale = interpolate(enterSpring, [0, 1], [0.96, 1]);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				padding: '0 80px',
				position: 'relative',
				zIndex: 10,
				fontFamily: '-apple-system, BlinkMacSystemFont, "DM Sans", sans-serif',
				boxSizing: 'border-box',
			}}
		>
			{/* Previous Muted Line */}
			{previousPhrase && (
				<div
					style={{
						fontSize: '48px',
						fontWeight: 600,
						color: 'rgba(255, 255, 255, 0.28)',
						marginBottom: '40px',
						lineHeight: 1.3,
						filter: 'blur(1.5px)',
						transition: 'opacity 0.3s ease',
					}}
				>
					{previousPhrase}
				</div>
			)}

			{/* Active Current Line with Apple Music Luminous Glow */}
			<div
				style={{
					fontSize: '66px',
					fontWeight: 800,
					color: '#ffffff',
					lineHeight: 1.25,
					letterSpacing: '-0.02em',
					textShadow: '0 4px 30px rgba(255, 255, 255, 0.35)',
					transform: `translateY(${translateY}px) scale(${activeScale})`,
					transformOrigin: 'left center',
					marginBottom: '40px',
				}}
			>
				{currentPhrase}
			</div>

			{/* Next Preview Line */}
			{nextPhrase && (
				<div
					style={{
						fontSize: '48px',
						fontWeight: 600,
						color: 'rgba(255, 255, 255, 0.28)',
						lineHeight: 1.3,
						filter: 'blur(1.5px)',
					}}
				>
					{nextPhrase}
				</div>
			)}
		</div>
	);
};
