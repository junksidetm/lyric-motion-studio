#!/usr/bin/env python3
"""
Robust audio fetcher for Lyric Motion Studio.
Handles direct URLs, Catbox/file links, and YouTube URLs with
automatic player_client fallbacks, stream validation via ffprobe,
and graceful harmonic ambient fallback when cloud IPs are rate-limited.
"""

import os
import re
import subprocess
import sys
import urllib.request

def is_valid_audio(file_path):
    """Verifies that the target file exists, is non-empty, and contains a valid audio stream."""
    if not os.path.exists(file_path) or os.path.getsize(file_path) < 1000:
        return False
    
    # Check if the file is accidentally an HTML error page
    try:
        with open(file_path, "rb") as f:
            header = f.read(512).lower()
            if b"<!doctype" in header or b"<html" in header or b"<body" in header:
                print(f"Validation failed: {file_path} contains HTML markup instead of audio.")
                return False
    except Exception as e:
        print(f"Header check notice: {e}")

    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-select_streams", "a:0",
            "-show_entries", "stream=codec_type",
            "-of", "default=noprint_wrappers=1:nokey=1",
            file_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=10)
        valid = (res.returncode == 0 and b"audio" in res.stdout.lower())
        if not valid:
            print(f"ffprobe reported invalid stream for {file_path}: {res.stderr.decode('utf-8', errors='ignore')}")
        return valid
    except Exception as e:
        print(f"ffprobe validation skipped ({e}). Relying on header check.")
        return True

def download_direct(url, out_path):
    print(f"Attempting direct HTTP download from: {url}")
    # Reject known streaming video sites from direct HTTP download
    if any(domain in url.lower() for domain in ["youtube.com", "youtu.be", "vimeo.com"]):
        print("Skipping direct HTTP download for streaming video URL.")
        return False

    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        )
        with urllib.request.urlopen(req, timeout=30) as response, open(out_path, "wb") as out_file:
            content_type = response.headers.get("Content-Type", "")
            if "text/html" in content_type:
                print(f"Server returned HTML ({content_type}) rather than audio.")
                return False
            out_file.write(response.read())

        if is_valid_audio(out_path):
            print(f"Direct download succeeded and verified: {out_path} ({os.path.getsize(out_path)} bytes)")
            return True
        else:
            if os.path.exists(out_path):
                os.remove(out_path)
            return False
    except Exception as e:
        print(f"Direct download error: {e}")
        if os.path.exists(out_path):
            os.remove(out_path)
        return False

def download_youtube(url, out_path):
    print(f"Attempting yt-dlp download for: {url}")
    
    # Try various player clients supported by modern yt-dlp
    clients = [
        "default,-tv,web_safari,web_embedded",
        "web_creator",
        "mweb,android",
        "ios",
        "android",
        "web"
    ]
    
    for client in clients:
        cmd = [
            "yt-dlp",
            "--js-runtimes", "node",
            "--extractor-args", f"youtube:player_client={client}",
            "--no-check-certificates",
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "-o", out_path,
            url
        ]
        print(f"Running yt-dlp with player_client={client}...")
        try:
            res = subprocess.run(cmd, timeout=90)
            if res.returncode == 0 and is_valid_audio(out_path):
                print(f"yt-dlp succeeded with client={client}!")
                return True
        except subprocess.TimeoutExpired:
            print(f"yt-dlp timed out with client={client}")
        except Exception as e:
            print(f"yt-dlp error: {e}")

        if os.path.exists(out_path) and not is_valid_audio(out_path):
            try:
                os.remove(out_path)
            except OSError:
                pass
        print(f"yt-dlp with client={client} did not yield valid audio. Trying next client...")

    return False

def determine_audio_duration(lyrics_file="lyrics.txt"):
    """Estimates or extracts needed duration in seconds from lyrics LRC or text."""
    duration = 180.0
    if not os.path.exists(lyrics_file):
        return duration

    try:
        with open(lyrics_file, "r", encoding="utf-8") as f:
            content = f.read().replace("\\n", "\n")

        # Check for LRC timestamps
        lrc_matches = re.findall(r"\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]", content)
        if lrc_matches:
            max_sec = 0.0
            for mins, secs in lrc_matches:
                t = float(mins) * 60 + float(secs)
                if t > max_sec:
                    max_sec = t
            if max_sec > 5:
                duration = max_sec + 6.0
                print(f"Detected LRC maximum timestamp: {max_sec:.2f}s. Target audio duration: {duration:.2f}s")
                return round(duration, 2)

        # Fallback to line count estimate
        lines = [l.strip() for l in content.splitlines() if l.strip()]
        if lines:
            duration = min(300.0, max(45.0, len(lines) * 4.2))
            print(f"Estimated duration from {len(lines)} lines: {duration:.2f}s")
    except Exception as e:
        print(f"Error reading lyrics duration: {e}")

    return round(duration, 2)

def generate_fallback_harmonic_track(out_path, duration=180.0):
    print("----------------------------------------------------------------------")
    print("NOTICE: YouTube datacenter protection blocked direct cloud stream extraction.")
    print("Generating timing-synchronized harmonic reference audio track.")
    print(f"Duration: {duration:.2f}s | Target: {out_path}")
    print("----------------------------------------------------------------------")

    # Generate a rich, soft harmonic drone (low A 110Hz + E 165Hz) with subtle tremolo
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"sine=frequency=110:duration={duration}[a];sine=frequency=165:duration={duration}[b];[a][b]amix=inputs=2[mix];[mix]volume=0.08[out]",
        "-map", "[out]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        out_path
    ]
    try:
        subprocess.run(cmd, check=True)
        if is_valid_audio(out_path):
            print(f"Successfully generated harmonic audio track: {out_path} ({os.path.getsize(out_path)} bytes)")
            return True
    except Exception as e:
        print(f"Harmonic generation error: {e}. Trying simple tone...")
        cmd_simple = [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", f"sine=frequency=220:duration={duration}",
            "-af", "volume=0.05",
            "-c:a", "libmp3lame",
            out_path
        ]
        subprocess.run(cmd_simple, check=True)
        return is_valid_audio(out_path)

    return False

def main():
    if len(sys.argv) < 3:
        print("Usage: python scripts/fetch_audio.py <URL> <OUTPUT_PATH> [LYRICS_PATH]")
        sys.exit(1)

    url = sys.argv[1].strip()
    out_path = sys.argv[2].strip()
    lyrics_path = sys.argv[3].strip() if len(sys.argv) > 3 else "lyrics.txt"
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)

    is_fallback = False

    # 1. Direct audio file detection (.mp3, .wav, .m4a, catbox, etc.)
    is_direct = any(url.lower().endswith(ext) for ext in [".mp3", ".wav", ".m4a", ".ogg", ".flac"]) or "catbox.moe" in url or "tmpfiles.org" in url
    if is_direct:
        if download_direct(url, out_path):
            print("Audio acquisition finished via direct download.")
            return

    # 2. YouTube or general streaming extractor via yt-dlp
    if not is_direct and url.startswith("http"):
        if download_youtube(url, out_path):
            print("Audio acquisition finished via yt-dlp.")
            return

    # 3. Direct download attempt for non-YouTube URLs
    if not any(d in url.lower() for d in ["youtube.com", "youtu.be"]):
        if download_direct(url, out_path):
            print("Audio acquisition finished via generic download.")
            return

    # 4. Fallback generation to guarantee rendering never crashes
    is_fallback = True
    target_duration = determine_audio_duration(lyrics_path)
    generate_fallback_harmonic_track(out_path, duration=target_duration)

    # Set GitHub Actions output if in workflow environment
    gh_output = os.environ.get("GITHUB_OUTPUT")
    if gh_output and os.path.exists(gh_output):
        with open(gh_output, "a", encoding="utf-8") as f:
            f.write(f"audio_fallback={'true' if is_fallback else 'false'}\n")

if __name__ == "__main__":
    main()
