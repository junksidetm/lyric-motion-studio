import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { splitIntoAksharas } from './akshara';

interface KineticWordProps {
	word: string;
	isHero?: boolean;
	animationType?: 'kinetic-punch' | 'line-morph' | 'cascade-reveal' | 'shatter-reassemble' | 'camera-push';
	intensity?: number;
}

export const KineticWord: React.FC<KineticWordProps> = ({
	word,
	isHero = false,
	animationType = 'kinetic-punch',
	intensity = 7,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	// Physics spring entry
	const entrance = spring({
		frame,
		fps,
		config: {
			damping: 12,
			mass: isHero ? 1.5 : 0.8,
			stiffness: 140,
		},
	});

	const scale = interpolate(entrance, [0, 1], [isHero ? 2.2 : 0.5, 1]);
	const opacity = interpolate(entrance, [0, 0.4, 1], [0, 0.8, 1]);

	// Aksharas
	const aksharas = splitIntoAksharas(word);

	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				transform: `scale(${scale})`,
				opacity,
				fontWeight: isHero ? 900 : 700,
				fontSize: isHero ? '92px' : '58px',
				letterSpacing: isHero ? '-0.03em' : '-0.01em',
				color: isHero ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
				textShadow: isHero ? '0 10px 40px rgba(0,0,0,0.8)' : 'none',
				lineHeight: 1.1,
			}}
		>
			{aksharas.map((ak, idx) => {
				const charStagger = spring({
					frame: Math.max(0, frame - idx * 2),
					fps,
					config: { damping: 14, stiffness: 160 },
				});
				const yOffset = interpolate(charStagger, [0, 1], [18, 0]);

				return (
					<span
						key={idx}
						style={{
							display: 'inline-block',
							transform: `translateY(${yOffset}px)`,
						}}
					>
						{ak}
					</span>
				);
			})}
		</div>
	);
};
