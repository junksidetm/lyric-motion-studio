import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface AppleMusicPlayerProps {
	songTitle?: string;
	artistName?: string;
	albumArtUrl?: string;
	morphProgress?: number; // 0 = Player State, 1 = Full Lyrics State
	progressPercent?: number; // 0 to 1
}

export const AppleMusicPlayer: React.FC<AppleMusicPlayerProps> = ({
	songTitle = 'WAVY',
	artistName = 'Karan Aujla',
	albumArtUrl,
	morphProgress = 0,
	progressPercent = 0.35,
}) => {
	const frame = useCurrentFrame();
	const { fps, width, height } = useVideoConfig();

	// Smooth subtle album artwork floating animation
	const floatOffset = Math.sin((frame / fps) * 2) * 6;
	const perspectiveTilt = Math.sin((frame / fps) * 1.5) * 2;

	// Scale & fade during morph into lyrics
	const artworkScale = interpolate(morphProgress, [0, 1], [1, 0.45], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const artworkOpacity = interpolate(morphProgress, [0, 0.8, 1], [1, 0.5, 0.2], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const uiOpacity = interpolate(morphProgress, [0, 0.6], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'space-between',
				padding: '90px 48px 100px 48px',
				position: 'relative',
				zIndex: 5,
				boxSizing: 'border-box',
			}}
		>
			{/* Top Bar / Grabber */}
			<div
				style={{
					width: '60px',
					height: '6px',
					backgroundColor: 'rgba(255, 255, 255, 0.3)',
					borderRadius: '3px',
					opacity: uiOpacity,
				}}
			/>

			{/* Center: 3D Floating Album Artwork */}
			<div
				style={{
					perspective: '1200px',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					margin: 'auto 0',
					transform: `scale(${artworkScale})`,
					transition: 'transform 0.2s ease',
					opacity: artworkOpacity,
				}}
			>
				<div
					style={{
						width: '740px',
						height: '740px',
						borderRadius: '36px',
						overflow: 'hidden',
						boxShadow: '0 30px 90px rgba(0, 0, 0, 0.7), 0 10px 30px rgba(0, 0, 0, 0.5)',
						border: '1px solid rgba(255, 255, 255, 0.12)',
						transform: `translateY(${floatOffset}px) rotateY(${perspectiveTilt}deg)`,
						backgroundColor: '#1c1c1e',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						position: 'relative',
					}}
				>
					{albumArtUrl ? (
						<img
							src={albumArtUrl}
							alt={songTitle}
							style={{ width: '100%', height: '100%', objectFit: 'cover' }}
						/>
					) : (
						/* Sleek Procedural Cover Artwork Fallback */
						<div
							style={{
								width: '100%',
								height: '100%',
								background: 'linear-gradient(135deg, #1f1f23 0%, #0d0d0f 50%, #291b26 100%)',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								padding: '40px',
								textAlign: 'center',
							}}
						>
							<div style={{ fontSize: '72px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
								{songTitle}
							</div>
							<div style={{ fontSize: '32px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '16px' }}>
								{artistName}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Bottom Controls Panel */}
			<div
				style={{
					width: '100%',
					maxWidth: '820px',
					display: 'flex',
					flexDirection: 'column',
					gap: '28px',
					opacity: uiOpacity,
				}}
			>
				{/* Song Meta */}
				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div>
						<div style={{ fontSize: '44px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
							{songTitle}
						</div>
						<div style={{ fontSize: '32px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.55)', marginTop: '6px' }}>
							{artistName}
						</div>
					</div>
					<div
						style={{
							width: '54px',
							height: '54px',
							borderRadius: '50%',
							background: 'rgba(255, 255, 255, 0.1)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							color: '#fff',
							fontSize: '24px',
						}}
					>
						•••
					</div>
				</div>

				{/* Apple Music Progress Scrubber */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<div
						style={{
							width: '100%',
							height: '8px',
							backgroundColor: 'rgba(255, 255, 255, 0.2)',
							borderRadius: '4px',
							overflow: 'hidden',
							position: 'relative',
						}}
					>
						<div
							style={{
								width: `${progressPercent * 100}%`,
								height: '100%',
								backgroundColor: '#ffffff',
								borderRadius: '4px',
							}}
						/>
					</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '22px', color: 'rgba(255, 255, 255, 0.45)', fontFamily: 'system-ui' }}>
						<span>0:42</span>
						<span>-2:54</span>
					</div>
				</div>

				{/* Playback Controls */}
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '10px 0' }}>
					{/* Previous */}
					<svg width="44" height="44" viewBox="0 0 24 24" fill="#ffffff"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="#ffffff" strokeWidth="2.5"/></svg>
					{/* Play / Pause */}
					<div style={{ width: '84px', height: '84px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<svg width="42" height="42" viewBox="0 0 24 24" fill="#ffffff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
					</div>
					{/* Next */}
					<svg width="44" height="44" viewBox="0 0 24 24" fill="#ffffff"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19" stroke="#ffffff" strokeWidth="2.5"/></svg>
				</div>

				{/* Volume Slider */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '0 10px' }}>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.4)"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/></svg>
					<div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '3px' }}>
						<div style={{ width: '70%', height: '100%', background: '#ffffff', borderRadius: '3px' }} />
					</div>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="rgba(255, 255, 255, 0.4)"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
				</div>
			</div>
		</div>
	);
};
