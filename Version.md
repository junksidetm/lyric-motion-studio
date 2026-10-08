# Version History (Version.md)

This file tracks every version, dependency, and structural change in **Lyric Motion Studio**.
Adheres strictly to the immutable append-only pattern.

---

### [v0.1.0] - 2026-10-08 20:25:00 IST
- **Status:** Initialized (100%)
- **Author:** junksidetm <331540275+junksidetm@users.noreply.github.com>
- **Commit Signing:** SSH key `id_ed25519_junksidetm`
- **Architecture Overview:**
  - Remote-first AI Lyric Video Generation platform powered by GitHub Actions, Remotion, torchaudio MMS_FA, and Google Gemini 2.5 Flash / 1.5 Pro.
  - Zero local CPU/RAM footprint on host machine.
  - Frontend styled with the `vector-drawable-nextjs` modern dark-surface design system (`#1f1f1f` background, translucent cards, 24px border radii, DM Sans typography, electric blue `#269bff` accents).
  - IssueOps trigger mechanism: enables seamless generation on GitHub Pages without requiring client-side API secrets.
- **Files Created:**
  - `Version.md`: Project audit ledger and version tracking.
  - `README.md`: System documentation, architecture diagram, and usage guide.
  - `index.html`: Responsive GitHub Pages web application.
  - `styles/globals.css`: Vector-drawable-nextjs design token stylesheet.
  - `src/app.js`: Client-side logic, YouTube URL validator, akshara/word counter, and IssueOps dispatcher.
  - `scripts/align_mms.py`: Python forced alignment script utilizing Torchaudio MMS_FA with bandpass vocal filtering.
  - `scripts/generate_screenplay.mjs`: Node.js screenplay generator using Google Gemini 2.5 Flash / 1.5 Pro with structured schema output.
  - `video/`: Remotion React/TypeScript motion graphics engine.
  - `.github/workflows/render-video.yml`: Remote GitHub Actions rendering workflow with yt-dlp, forced alignment, Gemini screenplay generation, Remotion headless render, and GitHub Releases distribution.
  - `.github/workflows/deploy-pages.yml`: Automated deployment to GitHub Pages.
- **Libraries & Tools:**
  - `remotion`: ^4.0.0
  - `@remotion/cli`: ^4.0.0
  - `react`: ^18.3.1
  - `react-dom`: ^18.3.1
  - `typescript`: ^5.4.0
  - `@google/genai`: ^0.1.1
  - `torchaudio`: MMS_FA (Meta Massively Multilingual Speech)
  - `yt-dlp`: latest
  - `ffmpeg`: Ubuntu system utility
