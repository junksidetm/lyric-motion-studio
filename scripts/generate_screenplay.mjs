#!/usr/bin/env node
/**
 * Automated Visual Screenplay Generator using Google Gemini 2.5 Flash / 1.5 Pro.
 * Ingests word timestamps and phrases, then generates an art-directed motion screenplay.
 * Supports styles: 'case-file', 'kinetic-dark', 'cyber-beat', 'minimal-mono', and 'apple-music'.
 */

import fs from 'fs';
import path from 'path';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
	console.error('ERROR: GEMINI_API_KEY environment variable is not set.');
	process.exit(1);
}

const phrasesPath = process.env.PHRASES_PATH || 'src/data/phrases.json';
const outPath = process.env.SCREENPLAY_PATH || 'src/data/visual-screenplay.json';
const stylePreset = process.env.STYLE_PRESET || 'case-file';

if (!fs.existsSync(phrasesPath)) {
	console.error(`ERROR: Phrases file not found at ${phrasesPath}`);
	process.exit(1);
}

const phrases = JSON.parse(fs.readFileSync(phrasesPath, 'utf8'));
console.log(`Loaded ${phrases.length} phrases for screenplay generation. Style: ${stylePreset}`);

let styleInstructions = '';
if (stylePreset === 'apple-music') {
	styleInstructions = `STYLE: Apple Music Dynamic Player & Synced Lyrics.
- Sequence starts with the iconic Apple Music Now-Playing interface (3D floating album cover, frosted glass scrubber, volume controls).
- Smooth horizontal Bezier slide transitions across album artworks.
- Seamless shape morph: the player interface transforms smoothly into the Apple Music dynamic live lyrics view.
- Active lyric glows in white against an ambient colorful blurred background.
- animationType MUST choose from: ['apple-music-slide', 'apple-music-morph', 'kinetic-punch'].
- backgroundTheme MUST be 'apple-music-blur'.`;
} else {
	styleInstructions = `STYLE: ${stylePreset}.
- Objects from Scene A should motivate or transform into Scene B (continuous visual storytelling).
- animationType MUST choose from: ['kinetic-punch', 'line-morph', 'cascade-reveal', 'shatter-reassemble', 'camera-push'].
- backgroundTheme MUST choose from: ['paper', 'night', 'accent'].`;
}

const systemPrompt = `You are a world-class senior motion graphics art director and creative developer specializing in Remotion, kinetic typography, Apple Music UI motion graphics, and high-end vertical (9:16) music videos.
Your job is to transform lyrical phrases and their timestamps into an art-directed visual screenplay.

STRICT PRINCIPLE: The meaning of the lyric drives the visual. Do not simply cycle through generic slide/zoom/glitch effects.
${styleInstructions}
For each lyrical line:
- Identify the hero word (most impactful word in the bar).
- Devise a semantic visual metaphor.
- Assign an intensity (1 to 10).`;

const userPrompt = `Generate a complete motion-design screenplay for these lyrical phrases:
${JSON.stringify(phrases, null, 2)}

Return a JSON array of scene objects. Each object MUST have this schema:
{
  "sequenceId": number,
  "line": number,
  "start": number,
  "end": number,
  "lyrics": string,
  "heroWord": string,
  "visualConcept": string,
  "semanticMetaphor": string,
  "animationType": string,
  "backgroundTheme": string,
  "intensity": number
}`;

async function runGemini() {
	const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

	const requestBody = {
		contents: [
			{
				role: "user",
				parts: [
					{ text: systemPrompt + "\n\n" + userPrompt }
				]
			}
		],
		generationConfig: {
			temperature: 0.4,
			responseMimeType: "application/json"
		}
	};

	console.log("Calling Google Gemini 2.5 Flash API...");
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(requestBody)
	});

	if (!response.ok) {
		const errText = await response.text();
		throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
	}

	const data = await response.json();
	const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
	if (!rawText) {
		throw new Error("Empty response from Gemini API.");
	}

	let screenplay;
	try {
		screenplay = JSON.parse(rawText);
	} catch (e) {
		console.warn("JSON parse warning, attempting regex recovery...");
		const match = rawText.match(/\[[\s\S]*\]/);
		if (match) screenplay = JSON.parse(match[0]);
		else throw e;
	}

	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, JSON.stringify(screenplay, null, 2), 'utf8');
	console.log(`Successfully generated screenplay with ${screenplay.length} sequences.`);
	console.log(`Saved to: ${outPath}`);
}

runGemini().catch((err) => {
	console.error("Screenplay generation failed:", err.message);
	// Fallback deterministic screenplay so render does not hard-fail
	console.log("Generating fallback deterministic screenplay...");
	const fallback = phrases.map((p, idx) => ({
		sequenceId: idx + 1,
		line: p.line,
		start: p.start,
		end: p.end,
		lyrics: p.text,
		heroWord: p.words?.[0]?.word || "Lyric",
		visualConcept: stylePreset === 'apple-music' ? "Apple Music 3D sliding album artwork with dynamic lyrics morph" : "High-contrast kinetic typography with dynamic spring inertia",
		semanticMetaphor: stylePreset === 'apple-music' ? "Apple Music Now-Playing UI with frosted glass" : "Editorial layout with animated continuous line",
		animationType: stylePreset === 'apple-music' ? (idx > 1 ? "apple-music-morph" : "apple-music-slide") : (idx % 2 === 0 ? "kinetic-punch" : "line-morph"),
		backgroundTheme: stylePreset === 'apple-music' ? "apple-music-blur" : (idx % 3 === 0 ? "paper" : "night"),
		intensity: 7
	}));
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, JSON.stringify(fallback, null, 2), 'utf8');
	console.log(`Saved fallback screenplay to: ${outPath}`);
});
