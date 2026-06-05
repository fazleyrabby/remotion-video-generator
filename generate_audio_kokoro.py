"""
Kokoro TTS generation.
Usage: python generate_audio_kokoro.py <voice_id> <input_txt> <output_file> [--wav]

Voice IDs: af_heart, am_adam, bf_emma, bm_george, etc.
Install: pip install kokoro soundfile && brew install espeak-ng
"""

import sys
import argparse
import os
import subprocess
import tempfile


def generate(voice_id: str, text: str, output_file: str, wav: bool = False) -> None:
    try:
        from kokoro import KPipeline  # type: ignore
        import soundfile as sf  # type: ignore
        import numpy as np
    except ImportError:
        print(
            "Kokoro not installed. Run: pip install kokoro soundfile && brew install espeak-ng",
            file=sys.stderr,
        )
        sys.exit(1)

    lang = "b" if voice_id.startswith("b") else "a"
    pipeline = KPipeline(lang_code=lang)

    chunks = []
    sample_rate = 24000
    for _, _, audio in pipeline(text, voice=voice_id, speed=1.0):
        chunks.append(audio)

    if not chunks:
        print("Kokoro generated no audio", file=sys.stderr)
        sys.exit(1)

    combined = np.concatenate(chunks)

    if wav or output_file.endswith(".wav"):
        sf.write(output_file, combined, sample_rate)
    else:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            sf.write(tmp_path, combined, sample_rate)
            subprocess.run(
                ["ffmpeg", "-y", "-i", tmp_path, output_file],
                check=True,
                capture_output=True,
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("voice")
    parser.add_argument("input_file")
    parser.add_argument("output_file")
    parser.add_argument("--wav", action="store_true")
    args = parser.parse_args()

    with open(args.input_file, "r", encoding="utf-8") as f:
        text = f.read()

    generate(args.voice, text, args.output_file, wav=args.wav)
