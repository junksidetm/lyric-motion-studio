import React from 'react';
import { Composition } from 'remotion';
import { MainLyricComposition } from './Composition';
import defaultScreenplay from './data/defaultScreenplay.json';
import { VideoProps, ScreenplayScene } from './types';

export const RemotionRoot: React.FC = () => {
	const fps = 30;

	return (
		<>
			<Composition
				id="LyricVideo"
				component={MainLyricComposition}
				durationInFrames={300}
				fps={fps}
				width={1080}
				height={1920}
				calculateMetadata={async ({ props }) => {
					const scenes = (props.screenplay || defaultScreenplay) as ScreenplayScene[];
					const lastScene = scenes[scenes.length - 1];
					const totalDurationSeconds = lastScene ? lastScene.end : 10;
					const durationInFrames = Math.max(90, Math.round(totalDurationSeconds * fps));
					return {
						durationInFrames,
						props: {
							...props,
							screenplay: scenes,
						},
					};
				}}
				defaultProps={{
					audioSrc: 'song.mp3',
					screenplay: defaultScreenplay as any,
					words: [],
					fps,
					stylePreset: 'case-file',
				}}
			/>
		</>
	);
};
