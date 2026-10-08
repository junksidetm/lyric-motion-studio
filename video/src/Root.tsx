import React from 'react';
import { Composition } from 'remotion';
import { MainLyricComposition } from './Composition';
import defaultScreenplay from './data/defaultScreenplay.json';
import { VideoProps } from './types';

export const RemotionRoot: React.FC = () => {
	const lastScene = defaultScreenplay[defaultScreenplay.length - 1];
	const totalDurationSeconds = lastScene ? lastScene.end : 10;
	const fps = 30;
	const durationInFrames = Math.max(90, Math.round(totalDurationSeconds * fps));

	return (
		<>
			<Composition
				id="LyricVideo"
				component={MainLyricComposition}
				durationInFrames={durationInFrames}
				fps={fps}
				width={1080}
				height={1920}
				defaultProps={{
					audioSrc: '',
					screenplay: defaultScreenplay as any,
					words: [],
					fps,
				}}
			/>
		</>
	);
};
