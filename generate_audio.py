import asyncio
import sys
import argparse
import os
import subprocess
import tempfile
import edge_tts


CARTOON_PRESETS = {
    "cartoon-chipmunk": {"base": "am_puck", "pitch": 1.40, "tempo": 1.10},
    "cartoon-gravel":   {"base": "am_fenrir", "pitch": 0.72, "tempo": 0.95},
    "cartoon-nasal":    {"base": "am_michael", "pitch": 1.18, "tempo": 1.00},
}


def resolve_kokoro_python():
    p = os.environ.get("KOKORO_PYTHON", os.path.expanduser("~/miniconda3/envs/kokoro/bin/python"))
    return p if os.path.exists(p) else sys.executable


def run_cartoon(voice_id, input_file, output_file):
    preset = CARTOON_PRESETS[voice_id]
    kokoro_script = os.path.join(os.path.dirname(__file__), "generate_audio_kokoro.py")
    kokoro_python = resolve_kokoro_python()
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_wav = tmp.name
    try:
        cmd = [kokoro_python, kokoro_script, preset["base"], input_file, tmp_wav, "--wav"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Cartoon base (kokoro) failed: {result.stderr}", file=sys.stderr)
            sys.exit(1)
        sr = 24000
        p = preset["pitch"]
        t = preset["tempo"]
        atempo = (1.0 / p) * t
        filter_chain = f"asetrate={sr}*{p},aresample={sr},atempo={atempo}"
        subprocess.run(
            ["ffmpeg", "-y", "-i", tmp_wav, "-af", filter_chain, output_file],
            check=True, capture_output=True,
        )
    finally:
        if os.path.exists(tmp_wav):
            os.unlink(tmp_wav)


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("voice")
    parser.add_argument("input_file")
    parser.add_argument("output_file")
    parser.add_argument("--engine", choices=["edge", "kokoro"], default="edge")
    parser.add_argument("--wav", action="store_true", help="Output WAV instead of MP3")
    parser.add_argument("--voice-rate", default=None, help="e.g. +5%% or -3%%")
    parser.add_argument("--voice-pitch", default=None, help="e.g. +10Hz or -5Hz")
    args = parser.parse_args()

    if args.voice in CARTOON_PRESETS:
        run_cartoon(args.voice, args.input_file, args.output_file)
        return

    with open(args.input_file, "r", encoding="utf-8") as f:
        text = f.read()

    if args.engine == "kokoro":
        kokoro_script = os.path.join(os.path.dirname(__file__), "generate_audio_kokoro.py")
        kokoro_python = resolve_kokoro_python()
        cmd = [kokoro_python, kokoro_script, args.voice, args.input_file, args.output_file]
        if args.wav:
            cmd.append("--wav")
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return
        print(f"Kokoro failed, falling back to Edge TTS. Error: {result.stderr}", file=sys.stderr)
        args.engine = "edge"
        args.voice = "en-US-BrianNeural"

    kwargs = {}
    if args.voice_rate:
        kwargs["rate"] = args.voice_rate
    if args.voice_pitch:
        kwargs["pitch"] = args.voice_pitch

    communicate = edge_tts.Communicate(text, args.voice, **kwargs)

    if args.wav:
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            await communicate.save(tmp_path)
            subprocess.run(
                ["ffmpeg", "-y", "-i", tmp_path, args.output_file],
                check=True,
                capture_output=True,
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    else:
        await communicate.save(args.output_file)


if __name__ == "__main__":
    asyncio.run(main())
