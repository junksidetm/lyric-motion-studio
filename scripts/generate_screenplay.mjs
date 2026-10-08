#!/usr/bin/env node
/**
 * Automated Visual Screenplay Generator using Google Gemini 2.5 Flash / 1.5 Pro.
 * Ingests word timestamps and phrases, then generates an art-directed motion screenplay.
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

const systemPrompt = `You are a world-class senior motion graphics art director and creative developer specializing in Remotion, kinetic typography, and high-end vertical (9:16) music videos.
Your job is to transform lyrical phrases and their timestamps into an art-directed visual screenplay.

STRICT PRINCIPLE: The meaning of the lyric drives the visual. Do not simply cycle through generic slide/zoom/glitch effects.
For each lyrical line:
- Identify the hero word (most impactful word in the bar).
- Devise a semantic visual metaphor (e.g. 'sharp' -> needles/spikes, 'time' -> clock hand / red line, 'alone' -> isolated word in vast negative space).
- Objects from Scene A should motivate or transform into Scene B (continuous visual storytelling).
- Assign an animation type from: ['kinetic-punch', 'line-morph', 'cascade-reveal', 'shatter-reassemble', 'camera-push'].
- Assign an intensity (1 to 10).
- Keep backgrounds and typography strictly aligned with the chosen style: ${stylePreset}.`;

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
  "animationType": "kinetic-punch" | "line-morph" | "cascade-reveal" | "shatter-reassemble" | "camera-push",
  "backgroundTheme": "paper" | "night" | "accent",
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
		visualConcept: "High-contrast kinetic typography with dynamic spring inertia",
		semanticMetaphor: "Editorial layout with animated continuous line",
		animationType: idx % 2 === 0 ? "kinetic-punch" : "line-morph",
		backgroundTheme: idx % 3 === 0 ? "paper" : "night",
		intensity: 7
	}));
	fs.mkdirSync(path.dirname(outPath), { recursive: true });
	fs.writeFileSync(outPath, JSON.stringify(fallback, null, 2), 'utf8');
	console.log(`Saved fallback screenplay to: ${outPath}`);
});
