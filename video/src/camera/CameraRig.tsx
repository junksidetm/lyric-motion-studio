import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

interface CameraRigProps {
	children: React.ReactNode;
	intensity?: number;
}

export const CameraRig: React.FC<CameraRigProps> = ({ children, intensity = 5 }) => {
	const frame = useCurrentFrame();

	// Subtle continuous camera drift
	const zoom = interpolate(frame, [0, 90], [1, 1.05], {
		extrapolateRight: 'clamp',
	});

	const rotate = interpolate(frame, [0, 90], [0, intensity > 6 ? 0.8 : 0.3], {
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				transform: `scale(${zoom}) rotate(${rotate}deg)`,
				transformOrigin: 'center center',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{children}
		</div>
	);
};
