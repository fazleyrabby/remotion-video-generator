"""
Rhubarb Lip Sync wrapper.
Usage: python generate_lipsync.py <wav_file> <output_json> [transcript_txt]

Falls back to silence-only visemes if Rhubarb is not installed or fails.
"""

import subprocess
import sys
import json
import os


RHUBARB_PATHS = [
    "/Users/rabbi/.local/Rhubarb-Lip-Sync-1.14.0-macOS/rhubarb",
    "/usr/local/bin/rhubarb",
    "/opt/homebrew/bin/rhubarb",
    "rhubarb",
]

def _find_rhubarb() -> str:
    import shutil
    for p in RHUBARB_PATHS:
        if shutil.which(p) or (p != "rhubarb" and os.path.isfile(p)):
            return p
    return "rhubarb"  # let it fail with a clear error

def generate_visemes(wav_file: str, output_json: str, transcript_file: str | None = None) -> bool:
    cmd = [_find_rhubarb(), "-o", output_json, "-f", "json"]
    if transcript_file and os.path.exists(transcript_file):
        cmd += ["-d", transcript_file]
    cmd.append(wav_file)

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        if result.returncode != 0:
            print(f"Rhubarb error: {result.stderr}", file=sys.stderr)
            return False
        return True
    except subprocess.TimeoutExpired:
        print("Rhubarb timed out after 180s", file=sys.stderr)
        return False
    except FileNotFoundError:
        print("rhubarb binary not found. Install: brew install rhubarb-lip-sync", file=sys.stderr)
        return False


def generate_silence_visemes(output_json: str, duration_seconds: float = 3.0) -> None:
    """Write a silence-only viseme file as fallback."""
    data = {
        "metadata": {"soundFile": "", "duration": duration_seconds},
        "mouthCues": [{"start": 0.0, "end": duration_seconds, "value": "X"}],
    }
    with open(output_json, "w") as f:
        json.dump(data, f)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_lipsync.py <wav_file> <output_json> [transcript_txt]")
        sys.exit(1)

    wav_file = sys.argv[1]
    output_json = sys.argv[2]
    transcript_file = sys.argv[3] if len(sys.argv) > 3 else None

    success = generate_visemes(wav_file, output_json, transcript_file)
    if not success:
        print("Falling back to silence-only visemes.", file=sys.stderr)
        generate_silence_visemes(output_json)
