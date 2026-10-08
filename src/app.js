document.addEventListener('DOMContentLoaded', () => {
	const audioUrlInput = document.getElementById('audioUrl');
	const lyricsTextInput = document.getElementById('lyricsText');
	const counterStats = document.getElementById('counterStats');
	const styleChips = document.querySelectorAll('.vd-chip');
	const btnGenerate = document.getElementById('btnGenerate');
	const btnFillDemo = document.getElementById('btnFillDemo');
	const previewWord = document.getElementById('previewWord');

	let selectedStyle = 'case-file';

	// Grapheme/Akshara counter using Intl.Segmenter
	function updateCounters() {
		const text = lyricsTextInput.value.trim();
		if (!text) {
			counterStats.textContent = '0 lines · 0 words · 0 aksharas';
			return;
		}

		const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
		const words = text.split(/\s+/).filter(w => w.length > 0);
		
		let aksharasCount = 0;
		if (typeof Intl !== 'undefined' && Intl.Segmenter) {
			const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
			aksharasCount = Array.from(segmenter.segment(text.replace(/\s+/g, ''))).length;
		} else {
			aksharasCount = text.replace(/\s+/g, '').length;
		}

		counterStats.textContent = `${lines.length} lines · ${words.length} words · ${aksharasCount} aksharas`;

		// Update preview word with a random word from lyrics
		if (words.length > 0) {
			const sample = words[Math.min(words.length - 1, 5)] || words[0];
			previewWord.textContent = sample;
		}
	}

	lyricsTextInput.addEventListener('input', updateCounters);

	// Style selection
	styleChips.forEach(chip => {
		chip.addEventListener('click', () => {
			styleChips.forEach(c => c.classList.remove('active'));
			chip.classList.add('active');
			selectedStyle = chip.getAttribute('data-style');
			const previewSubtitle = document.getElementById('previewSubtitle');
			if (previewSubtitle) {
				if (selectedStyle === 'apple-music') {
					previewSubtitle.textContent = 'Apple Music Dynamic UI · 60 FPS';
				} else if (selectedStyle === 'kinetic-dark') {
					previewSubtitle.textContent = 'Kinetic Dark High-Contrast · 30 FPS';
				} else if (selectedStyle === 'cyber-beat') {
					previewSubtitle.textContent = 'Cyber Beat Audio-Reactive · 30 FPS';
				} else {
					previewSubtitle.textContent = '1080 × 1920 · 30 FPS Vertical';
				}
			}
		});
	});

	// Load Demo
	btnFillDemo.addEventListener('click', () => {
		audioUrlInput.value = 'https://www.youtube.com/watch?v=wXm7-e5U38c';
		lyricsTextInput.value = `जो चुभती है तुझको, है जैसे मेरा काम और ये मूँछ
सवाल पूछ मुझसे, मैं दूंगा जवाब
मैं तो दीवाना हूँ
ये दुनिया समझ ना पाई
इश्क़ की अदालत में पेशी है आज`;
		updateCounters();
		previewWord.textContent = 'मूँछ';
	});

	// Generate Video Trigger
	btnGenerate.addEventListener('click', () => {
		const audioUrl = audioUrlInput.value.trim();
		const lyrics = lyricsTextInput.value.trim();

		if (!audioUrl) {
			alert('Please provide a YouTube or direct audio URL.');
			audioUrlInput.focus();
			return;
		}

		if (!lyrics) {
			alert('Please provide the canonical lyrics text.');
			lyricsTextInput.focus();
			return;
		}

		// Prepare IssueOps dispatch payload
		const issueTitle = `[Render Job] ${new Date().toISOString().slice(0, 19).replace('T', ' ')}`;
		const issueBody = `### Lyric Motion Studio - Render Job Request

\`\`\`yaml
audio_url: "${audioUrl}"
style: "${selectedStyle}"
\`\`\`

### Canonical Lyrics
\`\`\`text
${lyrics}
\`\`\`

<!-- AUTOMATED_LYRIC_JOB_PAYLOAD -->
`;

		const targetRepo = 'junksidetm/lyric-motion-studio';
		const issueUrl = `https://github.com/${targetRepo}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=lyric-job`;

		const openWindow = confirm(`Ready to dispatch your render job to GitHub Actions!\n\nThis will open a prefilled GitHub Issue on ${targetRepo}.\nSimply click "Submit new issue" to start the automated cloud rendering.\n\nProceed?`);
		if (openWindow) {
			window.open(issueUrl, '_blank', 'noopener,noreferrer');
		}
	});
});
