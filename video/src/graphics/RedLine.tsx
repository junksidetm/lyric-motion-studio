import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface RedLineProps {
	width?: number | string;
	progress?: number; // 0 to 1
	isClockHand?: boolean;
	angle?: number;
}

export const RedLine: React.FC<RedLineProps> = ({
	width = '80%',
	progress = 1,
	isClockHand = false,
	angle = 0,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const glow = interpolate(frame % 30, [0, 15, 30], [8, 16, 8], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	if (isClockHand) {
		return (
			<div
				style={{
					position: 'absolute',
					width: '4px',
					height: '240px',
					background: '#ff2d45',
					boxShadow: `0 0 ${glow}px #ff2d45`,
					transformOrigin: 'bottom center',
					transform: `rotate(${angle}deg)`,
					borderRadius: '2px',
				}}
			/>
		);
	}

	return (
		<div
			style={{
				width,
				height: '4px',
				background: '#ff2d45',
				borderRadius: '2px',
				boxShadow: `0 0 ${glow}px #ff2d45`,
				transform: `scaleX(${progress})`,
				transformOrigin: 'left center',
				transition: 'transform 0.1s ease-out',
			}}
		/>
	);
};
