#!/usr/bin/env python3
"""
High-Speed Multilingual Aligner for Lyric Motion Studio.
1. Fast LRC Parser: If lyrics contain LRC timestamps ([mm:ss.xx]), parses them instantly in <10ms.
2. FFmpeg PCM conversion: Converts MP3 to 16kHz mono WAV to avoid torchcodec / codec missing errors.
3. MMS_FA Aligner: Runs Meta multilingual forced alignment.
4. Robust Fallback: Never crashes; always produces valid word-timestamps.json and phrases.json.
"""

import argparse
import json
import os
import re
import subprocess
import sys

def parse_args():
    parser = argparse.ArgumentParser(description="Forced Alignment for Lyric Motion Studio")
    parser.add_argument("--audio", required=True, help="Path to input audio (mp3/wav)")
    parser.add_argument("--lyrics", required=True, help="Path to lyrics file or raw lyrics string")
    parser.add_argument("--out-words", default="src/data/word-timestamps.json", help="Output path for word timestamps")
    parser.add_argument("--out-phrases", default="src/data/phrases.json", help="Output path for phrases")
    return parser.parse_args()

def get_audio_duration(audio_path):
    try:
        cmd = [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            audio_path
        ]
        out = subprocess.check_output(cmd, universal_newlines=True).strip()
        return float(out)
    except Exception as e:
        print(f"Notice: ffprobe duration check skipped ({e}), defaulting to 200.0s")
        return 200.0

def clean_word(w):
    return re.sub(r"[^\w\u0900-\u097F]", "", w)

def try_parse_lrc(raw_text, duration):
    """Detects and parses LRC timestamped lyrics like [01:23.45] text."""
    lrc_regex = re.compile(r"\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\](.*)")
    entries = []
    
    for line in raw_text.splitlines():
        line = line.strip()
        match = lrc_regex.match(line)
        if match:
            mins = float(match.group(1))
            secs = float(match.group(2))
            timestamp = round(mins * 60 + secs, 3)
            lyric_text = match.group(3).strip()
            # Ignore metadata tags like [00:00.00]Artist - Title if empty text
            if lyric_text:
                entries.append((timestamp, lyric_text))

    if len(entries) < 3:
        # Not enough LRC tags to consider a valid LRC file
        return None, None

    print(f"Detected valid LRC timestamps! Parsed {len(entries)} timed phrases.")
    
    all_words = []
    phrases = []

    for i in range(len(entries)):
        start_time, text = entries[i]
        if i + 1 < len(entries):
            end_time = entries[i + 1][0]
        else:
            end_time = min(duration, start_time + 4.0)

        # Sanity check duration of line
        line_duration = max(0.5, end_time - start_time)
        line_words = [clean_word(w) for w in text.split() if clean_word(w)]

        phrase_items = []
        if line_words:
            time_per_word = line_duration / len(line_words)
            cur_w_time = start_time
            for w in line_words:
                w_start = round(cur_w_time, 3)
                w_end = round(cur_w_time + time_per_word, 3)
                cur_w_time += time_per_word
                item = {"word": w, "start": w_start, "end": w_end}
                all_words.append(item)
                phrase_items.append(item)

        phrases.append({
            "line": i + 1,
            "text": text,
            "start": start_time,
            "end": end_time,
            "words": phrase_items
        })

    return all_words, phrases

def fallback_equal_alignment(lines, duration):
    total_words = []
    phrases = []
    all_words = []
    for l in lines:
        ws = [clean_word(w) for w in l.split() if clean_word(w)]
        if ws:
            all_words.append((l, ws))
    
    total_word_count = sum(len(ws) for _, ws in all_words)
    if total_word_count == 0:
        return [], []
    
    time_per_word = duration / max(total_word_count, 1)
    cur_time = 0.0

    for line_idx, (orig_line, ws) in enumerate(all_words):
        phrase_words = []
        p_start = round(cur_time, 3)
        for w in ws:
            w_start = round(cur_time, 3)
            cur_time += time_per_word
            w_end = round(cur_time, 3)
            item = {"word": w, "start": w_start, "end": w_end}
            total_words.append(item)
            phrase_words.append(item)
        phrases.append({
            "line": line_idx + 1,
            "text": orig_line,
            "start": p_start,
            "end": round(cur_time, 3),
            "words": phrase_words
        })
    return total_words, phrases

def align():
    args = parse_args()
    
    # 1. Read raw lyrics
    if os.path.isfile(args.lyrics):
        with open(args.lyrics, "r", encoding="utf-8") as f:
            raw_lyrics = f.read()
    else:
        raw_lyrics = args.lyrics

    duration = get_audio_duration(args.audio)
    print(f"Total audio duration: {duration:.2f}s")

    # 2. Check for LRC timestamp tags first
    lrc_words, lrc_phrases = try_parse_lrc(raw_lyrics, duration)
    if lrc_words is not None and len(lrc_words) > 0:
        word_timestamps = lrc_words
        phrases = lrc_phrases
        print(f"LRC extraction complete! {len(word_timestamps)} words mapped.")
    else:
        # Strip any stray brackets
        clean_raw = re.sub(r"\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]", "", raw_lyrics)
        lines = [l.strip() for l in clean_raw.splitlines() if l.strip()]
        print(f"Running forced alignment on {len(lines)} raw lines...")

        # 3. Convert MP3 to 16kHz PCM WAV via FFmpeg to bypass torchcodec
        wav_path = "/tmp/audio_16k.wav"
        try:
            subprocess.run([
                "ffmpeg", "-y", "-i", args.audio,
                "-ar", "16000", "-ac", "1",
                "-c:a", "pcm_s16le",
                wav_path
            ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            audio_source = wav_path
        except Exception as e:
            print(f"FFmpeg PCM conversion notice: {e}, using original audio path.")
            audio_source = args.audio

        # 4. Attempt MMS_FA Alignment
        try:
            import torch
            import torchaudio

            bundle = torchaudio.pipelines.MMS_FA
            waveform, sr = torchaudio.load(audio_source)
            if sr != bundle.sample_rate:
                waveform = torchaudio.transforms.Resample(sr, bundle.sample_rate)(waveform)

            model = bundle.get_model()
            tokenizer = bundle.get_tokenizer()
            aligner = bundle.get_aligner()

            with torch.inference_mode():
                emission, _ = model(waveform)

            all_words = []
            for l in lines:
                for w in l.split():
                    c = clean_word(w)
                    if c:
                        all_words.append(c)

            transcript = " ".join(all_words).lower()
            tokens = tokenizer(transcript)
            token_spans = aligner(emission[0], tokens)

            num_frames = emission.size(1)
            time_per_frame = duration / num_frames

            word_timestamps = []
            phrases = []
            cur_word_idx = 0

            for line_idx, line in enumerate(lines):
                line_words = [clean_word(w) for w in line.split() if clean_word(w)]
                phrase_items = []
                for w in line_words:
                    if cur_word_idx < len(token_spans):
                        span = token_spans[cur_word_idx]
                        w_start = round(span[0].start * time_per_frame, 3)
                        w_end = round(span[-1].end * time_per_frame, 3)
                    else:
                        w_start = round(cur_word_idx * (duration / len(all_words)), 3)
                        w_end = round(w_start + 0.4, 3)

                    item = {"word": w, "start": w_start, "end": w_end}
                    word_timestamps.append(item)
                    phrase_items.append(item)
                    cur_word_idx += 1

                if phrase_items:
                    phrases.append({
                        "line": line_idx + 1,
                        "text": line,
                        "start": phrase_items[0]["start"],
                        "end": phrase_items[-1]["end"],
                        "words": phrase_items
                    })
            print(f"MMS_FA Alignment completed with {len(word_timestamps)} words.")

        except Exception as e:
            print(f"MMS_FA aligner notice ({e}). Using proportional timing fallback.")
            word_timestamps, phrases = fallback_equal_alignment(lines, duration)

    # 5. Output JSON files
    os.makedirs(os.path.dirname(os.path.abspath(args.out_words)), exist_ok=True)
    os.makedirs(os.path.dirname(os.path.abspath(args.out_phrases)), exist_ok=True)

    with open(args.out_words, "w", encoding="utf-8") as f:
        json.dump(word_timestamps, f, indent=2, ensure_ascii=False)
    print(f"Saved word timestamps to: {args.out_words}")

    with open(args.out_phrases, "w", encoding="utf-8") as f:
        json.dump(phrases, f, indent=2, ensure_ascii=False)
    print(f"Saved phrases to: {args.out_phrases}")

if __name__ == "__main__":
    align()
