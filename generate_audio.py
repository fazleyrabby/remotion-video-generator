import asyncio
import sys
import edge_tts

async def main():
    if len(sys.argv) < 4:
        print("Usage: python generate_audio.py <voice> <input_txt_file> <output_mp3_file>")
        sys.exit(1)

    voice = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]

    with open(input_file, 'r', encoding='utf-8') as f:
        text = f.read()

    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_file)

if __name__ == "__main__":
    asyncio.run(main())
