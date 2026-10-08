export interface WordTimestamp {
	word: string;
	start: number;
	end: number;
}

export interface Phrase {
	line: number;
	text: string;
	start: number;
	end: number;
	words: WordTimestamp[];
}

export interface ScreenplayScene {
	sequenceId: number;
	line: number;
	start: number;
	end: number;
	lyrics: string;
	heroWord: string;
	visualConcept: string;
	semanticMetaphor: string;
	animationType: 'kinetic-punch' | 'line-morph' | 'cascade-reveal' | 'shatter-reassemble' | 'camera-push' | 'apple-music-slide' | 'apple-music-morph';
	backgroundTheme: 'paper' | 'night' | 'accent' | 'apple-music-blur';
	intensity: number;
	albumArtUrl?: string;
	songTitle?: string;
	artistName?: string;
}

export interface VideoProps {
	audioSrc: string;
	screenplay: ScreenplayScene[];
	words: WordTimestamp[];
	fps: number;
	stylePreset?: string;
	songTitle?: string;
	artistName?: string;
}
