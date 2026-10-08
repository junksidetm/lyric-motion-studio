# 🎬 Lyric Motion Studio

> **Remote-first AI Lyric Video Generation platform powered by Remotion, torchaudio MMS_FA, and Google Gemini API.**  
> Completely zero local machine overhead — everything is scheduled and rendered in the cloud on GitHub Actions.

---

## 🌟 Key Features

- **Zero Local Footprint:** Zero local compilation, zero local builds, and no local rendering. The entire pipeline executes remotely on GitHub Actions.
- **Modern Minimalist UI:** Styled using the dark surface aesthetic from `vector-drawable-nextjs` (`#1f1f1f` background, translucent cards, 24px border radii, DM Sans typography, electric blue `#269bff` accents).
- **Audio-to-Lyric Forced Alignment:** Uses Meta's `torchaudio` MMS_FA + speech bandpass filtering to extract accurate word-level timestamps directly from mixed audio tracks in under 30 seconds.
- **AI Semantic Screenplay:** Google Gemini 2.5 Flash interprets cultural slang, emotional cues, and bar-by-bar lyrics to construct an art-directed motion screenplay.
- **Remotion Kinetic Engine:** Renders 1080×1920 @ 30 FPS vertical video (Reels / Shorts ready) with grapheme-safe Devanagari/multilingual typography and continuous vector line transitions.
- **IssueOps Cloud Trigger:** Users can dispatch render jobs straight from GitHub Pages without exposing client-side API keys.

---

## 🚀 How It Works (Cloud Architecture)

```
[User on GitHub Pages]
       │
       ▼ (Submits URL & Lyrics)
┌──────────────────────────────────────────────┐
│  GitHub Pages (Web UI)                       │
│  • Input: YouTube URL or Audio Source        │
│  • Input: Canonical Lyrics Text              │
│  • Style: Case File / Kinetic Dark / Cyber   │
└──────────────────────────────────────────────┘
       │
       ▼ (IssueOps / Workflow Dispatch)
┌──────────────────────────────────────────────┐
│  GitHub Actions Ubuntu Runner                │
│  1. yt-dlp fetches audio in cloud            │
│  2. torchaudio MMS_FA aligns words           │
│  3. Gemini 2.5 Flash generates screenplay    │
│  4. Remotion renders 1080x1920 MP4 video     │
└──────────────────────────────────────────────┘
       │
       ▼ (Automatic Distribution)
┌──────────────────────────────────────────────┐
│  GitHub Releases                             │
│  • Downloadable final.mp4                    │
│  • Instant notification on Issue             │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Setup & Secrets

1. Add your Google AI Studio API key as a GitHub Repository Secret:
   - Secret Name: `GEMINI_API_KEY`
2. Enable GitHub Pages:
   - **Settings** $\rightarrow$ **Pages** $\rightarrow$ **Source: GitHub Actions**.
3. Push to `main` branch to deploy the Web Studio!

---

## 📜 Version History
All updates and architectural audit logs are tracked strictly in [Version.md](file:///D:/code/lyric-motion-studio/Version.md).
