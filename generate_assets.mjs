import fs from "fs/promises";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execAsync = util.promisify(exec);

async function generateAllAudio() {
  const generatorDir = process.cwd();
  const publicDir = path.join(generatorDir, "public");
  const cliDataFile = process.argv[2];
  const dataFile = cliDataFile
    ? path.resolve(generatorDir, cliDataFile)
    : path.join(generatorDir, "sample-data.json");
  const pythonScript = path.join(generatorDir, "generate_audio.py");
  const pythonExe = path.join(generatorDir, "venv", "bin", "python");

  console.log(`Loading scenes from ${dataFile}...`);
  const rawData = await fs.readFile(dataFile, "utf-8");
  const config = JSON.parse(rawData);
  const scenes = config.scenes;

  console.log(`Starting TTS synthesis for ${scenes.length} scenes using Edge TTS (en-US-BrianNeural)...`);
  
  // Make sure public directory exists
  await fs.mkdir(publicDir, { recursive: true });

  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    console.log(`Processing scene ${i + 1}/${scenes.length}: "${scene.text.replace(/\n/g, " ")}"`);

    const tempTextFile = path.join(generatorDir, `temp_scene_${i}.txt`);
    const audioFilename = scene.audioFile || `scene_${i}.mp3`;
    const outputAudioFile = path.join(publicDir, audioFilename);

    // Write text to temp file
    await fs.writeFile(tempTextFile, scene.voice, "utf-8");

    // Execute generation command
    const voiceName = config.voiceName || "en-US-BrianNeural";
    const engine = config.voiceEngine || "edge";
    const cmd = `"${pythonExe}" "${pythonScript}" "${voiceName}" "${tempTextFile}" "${outputAudioFile}" --engine ${engine}`;
    
    try {
      await execAsync(cmd);
      // Clean up temp file
      await fs.unlink(tempTextFile).catch(() => {});
      console.log(`  Successfully generated: public/${audioFilename}`);
    } catch (e) {
      console.error(`  Error generating audio for scene ${i}:`, e.message);
      await fs.unlink(tempTextFile).catch(() => {});
      process.exit(1);
    }
  }

  console.log("All TTS voiceovers generated successfully!");
}

generateAllAudio().catch(console.error);
