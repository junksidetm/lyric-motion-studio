#!/usr/bin/env python3
"""
Fast Multilingual Forced Aligner for Lyric Motion Studio.
Uses torchaudio MMS_FA (Meta Massively Multilingual Speech) + bandpass filtering.
Runs fast on CPU without needing heavy stem-separation deep networks.
"""

import argparse
import json
import os
import re
import sys
import torch
import torchaudio
import torchaudio.functional as F

def parse_args():
    parser = argparse.ArgumentParser(description="Forced Alignment using torchaudio MMS_FA")
    parser.add_argument("--audio", required=True, help="Path to input audio (mp3/wav)")
    parser.add_argument("--lyrics", required=True, help="Path to lyrics file or raw lyrics string")
    parser.add_argument("--out-words", default="src/data/word-timestamps.json", help="Output path for word timestamps")
    parser.add_argument("--out-phrases", default="src/data/phrases.json", help="Output path for phrases")
    return parser.parse_args()

def load_lyrics(lyrics_arg):
    if os.path.isfile(lyrics_arg):
        with open(lyrics_arg, "r", encoding="utf-8") as f:
            raw = f.read()
    else:
        raw = lyrics_arg
    # Automatically strip LRC timestamps like [00:13.58]
    raw = re.sub(r"\[\d{1,2}:\d{2}(?:\.\d{1,3})?\]", "", raw)
    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    return lines

def clean_word(w):
    return re.sub(r"[^\w\u0900-\u097F]", "", w)

def fallback_equal_alignment(lines, duration):
    """Fallback if audio alignment model fails or fails on fast unvoiced segments."""
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
        p_start = cur_time
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
    lines = load_lyrics(args.lyrics)
    print(f"Loaded {len(lines)} lyric lines for alignment.")

    # 1. Load audio
    print(f"Loading audio from {args.audio}...")
    waveform, sample_rate = torchaudio.load(args.audio)
    duration = waveform.shape[1] / sample_rate
    print(f"Audio duration: {duration:.2f}s, sample rate: {sample_rate}Hz")

    # 2. Resample & vocal bandpass filter (300 Hz - 3400 Hz) to isolate vocal formants on CPU
    if waveform.shape[0] > 1:
        waveform = torch.mean(waveform, dim=0, keepdim=True)
    
    bundle = torchaudio.pipelines.MMS_FA
    target_sr = bundle.sample_rate
    if sample_rate != target_sr:
        waveform = torchaudio.transforms.Resample(sample_rate, target_sr)(waveform)

    # Apply bandpass filter
    try:
        filtered_waveform = F.bandpass_biquad(waveform, target_sr, central_freq=1800.0, Q=0.7)
    except Exception as e:
        print(f"Notice: Bandpass filter skipped ({e}), using raw waveform.")
        filtered_waveform = waveform

    # 3. Model alignment
    try:
        model = bundle.get_model()
        tokenizer = bundle.get_tokenizer()
        aligner = bundle.get_aligner()

        print("Generating emission matrix via MMS_FA...")
        with torch.inference_mode():
            emission, _ = model(filtered_waveform)

        # Build clean word list
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
        token_idx = 0

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
        print(f"Alignment successful. Total aligned words: {len(word_timestamps)}")

    except Exception as e:
        print(f"Warning: Model alignment encountered issue ({e}). Using proportional timing fallback.")
        word_timestamps, phrases = fallback_equal_alignment(lines, duration)

    # 4. Save results
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
