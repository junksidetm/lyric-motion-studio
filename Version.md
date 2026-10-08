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

---

### [v0.2.0] - 2026-10-08 21:23:00 IST
- **Status:** Apple Music Animation Style Integration (100%)
- **Author:** junksidetm <331540275+junksidetm@users.noreply.github.com>
- **Commit Signing:** SSH key `id_ed25519_junksidetm`
- **Influence & Source:**
  - Ingested and parsed `Apple music animation.pdf` (Aryan Uppal creator guide, Claude Opus 5.5 motion reference).
  - Preserved influence assets in `influence/` directory:
    - `Apple music animation.pdf`
    - `Apple-music-animation-Extracted.txt` (full ASCII85 + FlateDecode extracted text)
    - `Lyric-Video-Process-Guide.pdf`
    - `Lyric-Video-Process-Guide-Extracted.txt`
- **Features & Enhancements:**
  - Added new motion engine components in Remotion:
    - `video/src/components/AppleMusicPlayer.tsx`: Now-Playing interface featuring 3D floating album cover artwork, frosted glass scrubber, dynamic progress bar, volume controls, and horizontal sliding transitions.
    - `video/src/components/AppleMusicLyrics.tsx`: Dynamic karaoke lyrics screen with active luminous text glow, smooth vertical scrolling, and translucent context lines.
    - Updated `video/src/backgrounds/BackgroundLayer.tsx` with animated ambient colorful radial blur (`apple-music-blur`).
    - Updated `video/src/Composition.tsx` to conditionally render Apple Music player or lyrics states based on screenplay tags.
  - Enhanced `scripts/generate_screenplay.mjs`:
    - Added dedicated prompt conditioning for `apple-music` style preset, mapping sequences to `apple-music-slide` and `apple-music-morph`.
  - Updated Web Studio UI:
    - Added `Apple Music UI` style preset chip in `index.html`.
    - Integrated responsive mockup preview subtitle updating in `src/app.js`.

---

### [v0.2.1] - 2026-10-08 21:40:00 IST
- **Status:** Workflow Trigger Resilience & LRC Parsing Fix (100%)
- **Author:** junksidetm <331540275+junksidetm@users.noreply.github.com>
- **Commit Signing:** SSH key `id_ed25519_junksidetm`
- **Fixes & Enhancements:**
  - Created missing `lyric-job` label on GitHub repository.
  - Hardened `.github/workflows/render-video.yml`:
    - Broadened job execution condition to match `[Render Job]` title, `AUTOMATED_LYRIC_JOB_PAYLOAD`, or `lyric-job` label.
    - Added `labeled` event trigger in addition to `opened` and `edited`.
    - Switched `npm ci` to `npm install` in video build step to ensure seamless dependency resolution.
    - Passed dynamic style preset props to Remotion render CLI.
  - Enhanced `scripts/align_mms.py`:
    - Added regex preprocessor to automatically clean standard LRC timestamp tags (e.g. `[00:13.58]`) from user-pasted lyrics.

---

### [v0.2.2] - 2026-10-08 21:44:00 IST
- **Status:** Cloud Audio Extraction Hardening (100%)
- **Author:** junksidetm <331540275+junksidetm@users.noreply.github.com>
- **Commit Signing:** SSH key `id_ed25519_junksidetm`
- **Fixes & Enhancements:**
  - Resolved cloud datacenter IP blocking on YouTube by creating `scripts/fetch_audio.py`.
  - Added multi-client rotation: `--extractor-args "youtube:player_client=android"`, `ios`, and `mweb`.
  - Added Node.js runtime flag (`--js-runtimes node`) to satisfy yt-dlp n-sig challenges.
  - Added automatic direct HTTP download support for `.mp3`, `.wav`, and Catbox/temporary file hosting links.
  - Added fallback ambient audio generation to ensure CI pipeline resilience under strict IP rate-limits.

---

### [v0.2.3] - 2026-10-08 22:13:00 IST
- **Status:** Alignment Pipeline Optimization & TorchCodec Decoupling (100%)
- **Author:** junksidetm <331540275+junksidetm@users.noreply.github.com>
- **Commit Signing:** SSH key `id_ed25519_junksidetm`
- **Fixes & Enhancements:**
  - Resolved `ImportError: TorchCodec is required for load_with_torchcodec` on modern torchaudio by converting audio to 16kHz PCM WAV via FFmpeg before tensor loading.
  - Implemented high-speed LRC parser in `scripts/align_mms.py`: lines with `[mm:ss.xx]` tags are parsed directly in <10ms with frame-accurate timing.
  - Accelerated Step 2 in `.github/workflows/render-video.yml`: switched PyTorch download to `--index-url https://download.pytorch.org/whl/cpu` (reduces download from ~2 GB / 18 min to ~150 MB / 20 sec).
  - Added `@remotion/bundler` to `video/package.json` for reliable headless rendering.

---

### [v0.2.4] - 2026-10-08 22:17:00 IST
- **Status:** Remotion TypeScript Engine Configuration (100%)
- **Author:** junksidetm <331540275+junksidetm@users.noreply.github.com>
- **Commit Signing:** SSH key `id_ed25519_junksidetm`
- **Fixes & Enhancements:**
  - Added `video/tsconfig.json` configuring ES2022 / React JSX compilation for Remotion bundler.
  - Implemented dynamic `calculateMetadata` in `video/src/Root.tsx`: video length adapts to song duration in real-time.
  - Verified and confirmed full pipeline stability through Step 1 (Audio Fetch), Step 2 (Forced Alignment), and Step 3 (Gemini 2.5 Screenplay).
---

### [v0.2.5] - 2026-10-08 22:32:00 IST
- **Status:** Remotion Static Asset Resolution & Audio Stream Integrity Hardening (100%)
- **Author:** junksidetm <331540275+junksidetm@users.noreply.github.com>
- **Commit Signing:** SSH key `id_ed25519_junksidetm`
- **Fixes & Enhancements:**
  - Resolved Remotion HTTP 404 on `song.mp3` by routing audio assets through Remotion's native `staticFile()` resolver in `video/src/Composition.tsx`.
  - Configured `Config.setPublicDir(path.resolve(__dirname, 'public'))` in `video/remotion.config.ts` and passed `--public-dir=public` to the CLI runner.
  - Tracked `video/public/.gitkeep` to guarantee asset directory presence on all runner checkouts.
  - Added stream validation (`ffprobe` and HTML-header detection) in `scripts/fetch_audio.py` to prevent corrupt HTML pages from being treated as audio.
  - Implemented dynamic harmonic backing track generation matching exact lyrics duration when YouTube datacenter bot detection triggers.
  - Unescaped newline literals in `scripts/align_mms.py` for reliable multi-line LRC parsing across all dispatch interfaces.
  - Added transparent fallback notifications in GitHub Releases and IssueOps comments.
---

### [v0.3.0] - 2026-10-08 22:48:00 IST
- **Status:** First End-to-End Production Video Render Delivered via Cloud Pipeline (100%)
- **Author:** junksidetm <331540275+junksidetm@users.noreply.github.com>
- **Commit Signing:** SSH key `id_ed25519_junksidetm`
- **Milestone Deliverables:**
  - Successfully produced, rendered, and distributed the first full production kinetic lyric video (Run #37813679283).
  - Track: *The Weeknd — Blinding Lights*, rendered in the *Apple Music UI* visual preset with 3D floating artwork, frosted glass blur, and dynamic synced lyric morphs.
  - Render specs: 1080 × 1920 (9:16 vertical video), 30 FPS, ~200.0 seconds total running time (6,000 frames rendered in 13 minutes on cloud headless runner).
  - Remote verification: Binary video artifact `final.mp4` published under release tag `render-37813679283`.
  - IssueOps loop: Automated completion notification and direct download link posted to GitHub Issue #1, and issue closed successfully.
  - Zero local memory overhead achieved (0 bytes of rendering or local compilation on host machine).
