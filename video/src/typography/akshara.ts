/**
 * Grapheme cluster (Akshara) segmentation utility.
 * Essential for Devanagari and non-Latin scripts to prevent matras and half-letters from breaking.
 */

export function splitIntoAksharas(text: string): string[] {
	if (!text) return [];
	if (typeof Intl !== 'undefined' && Intl.Segmenter) {
		const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
		return Array.from(segmenter.segment(text), s => s.segment);
	}
	// Fallback to array split (standard Latin)
	return Array.from(text);
}
