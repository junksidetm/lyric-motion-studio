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
	animationType: 'kinetic-punch' | 'line-morph' | 'cascade-reveal' | 'shatter-reassemble' | 'camera-push';
	backgroundTheme: 'paper' | 'night' | 'accent';
	intensity: number;
}

export interface VideoProps {
	audioSrc: string;
	screenplay: ScreenplayScene[];
	words: WordTimestamp[];
	fps: number;
}
