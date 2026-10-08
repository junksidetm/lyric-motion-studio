import React from 'react';
import { Audio, Sequence, useVideoConfig } from 'remotion';
import { BackgroundLayer } from './backgrounds/BackgroundLayer';
import { CameraRig } from './camera/CameraRig';
import { KineticWord } from './typography/KineticWord';
import { RedLine } from './graphics/RedLine';
import { AppleMusicPlayer } from './components/AppleMusicPlayer';
import { AppleMusicLyrics } from './components/AppleMusicLyrics';
import { VideoProps, ScreenplayScene } from './types';

export const MainLyricComposition: React.FC<VideoProps> = ({
	audioSrc,
	screenplay,
	fps,
	stylePreset = 'case-file',
	songTitle = 'Lyric Motion',
	artistName = 'Artist',
}) => {
	const { width, height } = useVideoConfig();

	const isAppleMusic = stylePreset === 'apple-music';

	return (
		<div
			style={{
				width,
				height,
				position: 'relative',
				overflow: 'hidden',
				fontFamily: isAppleMusic
					? '-apple-system, BlinkMacSystemFont, "DM Sans", sans-serif'
					: '"DM Sans", "Anek Devanagari", sans-serif',
			}}
		>
			{/* Original Audio Track */}
			{audioSrc && <Audio src={audioSrc} />}

			{/* Render Sequences based on Screenplay */}
			{screenplay.map((scene: ScreenplayScene, index: number) => {
				const startFrame = Math.round(scene.start * fps);
				const durationFrames = Math.max(15, Math.round((scene.end - scene.start) * fps));

				const prevScene = screenplay[index - 1];
				const nextScene = screenplay[index + 1];

				const isAppleMusicSlide = isAppleMusic || scene.animationType === 'apple-music-slide';
				const isAppleMusicMorph = scene.animationType === 'apple-music-morph';

				return (
					<Sequence
						key={scene.sequenceId || index}
						from={startFrame}
						durationInFrames={durationFrames}
					>
						<BackgroundLayer theme={isAppleMusic ? 'apple-music-blur' : scene.backgroundTheme} />

						{isAppleMusic ? (
							isAppleMusicMorph ? (
								/* Morph / Lyric State */
								<AppleMusicLyrics
									currentPhrase={scene.lyrics}
									previousPhrase={prevScene?.lyrics}
									nextPhrase={nextScene?.lyrics}
									heroWord={scene.heroWord}
								/>
							) : (
								/* Player State with Sliding Art */
								<AppleMusicPlayer
									songTitle={scene.songTitle || songTitle}
									artistName={scene.artistName || artistName}
									albumArtUrl={scene.albumArtUrl}
									progressPercent={index / Math.max(1, screenplay.length)}
								/>
							)
						) : (
							/* Case File / Kinetic Standard Architecture */
							<CameraRig intensity={scene.intensity}>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										alignItems: 'center',
										justifyContent: 'center',
										gap: '24px',
										padding: '0 60px',
										textAlign: 'center',
										zIndex: 10,
										width: '100%',
									}}
								>
									{/* Hero Word */}
									<KineticWord
										word={scene.heroWord || scene.lyrics}
										isHero={true}
										animationType={scene.animationType as any}
										intensity={scene.intensity}
									/>

									{/* Signature Red Line Motif */}
									<RedLine progress={1} />

									{/* Context Phrase */}
									<div
										style={{
											fontSize: '34px',
											color: scene.backgroundTheme === 'paper' ? '#222' : 'rgba(255,255,255,0.6)',
											maxWidth: '850px',
											lineHeight: 1.4,
											fontWeight: 500,
										}}
									>
										{scene.lyrics}
									</div>
								</div>
							</CameraRig>
						)}
					</Sequence>
				);
			})}
		</div>
	);
};
