import { bundle } from "@remotion/bundler";
import { getCompositions, renderMedia } from "@remotion/renderer";
import path from "path";
import fs from "fs";

// Get input JSON file from args, or use a default test object
const args = process.argv.slice(2);
const inputFile = args[0];

let inputProps = {
  title: "My First Local Video!",
  content: "This video was rendered completely on your local hardware using Remotion.",
  author: "SignalStack CLI"
};

if (inputFile) {
  try {
    const rawData = fs.readFileSync(inputFile, "utf-8");
    inputProps = JSON.parse(rawData);
    console.log(`Loaded props from ${inputFile}`);
  } catch (e) {
    console.error(`Failed to load props from ${inputFile}`, e);
    process.exit(1);
  }
}

const renderPulse = async () => {
  const compositionId = "PulseVideo";
  console.log("Bundling Remotion project...");
  
  // 1. Bundle the project
  const bundleLocation = await bundle({
    entryPoint: path.resolve("./src/index.ts"),
    webpackOverride: (config) => config,
  });

  // 2. Extract compositions
  console.log("Extracting compositions...");
  const compositions = await getCompositions(bundleLocation, {
    inputProps,
  });

  const composition = compositions.find((c) => c.id === compositionId);

  if (!composition) {
    throw new Error(`No composition with the ID ${compositionId} found`);
  }

  // 3. Render video
  const outputLocation = path.resolve(`./out/pulse-${Date.now()}.mp4`);
  console.log(`Rendering video to ${outputLocation}...`);

  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: "h264",
    outputLocation,
    inputProps,
    onProgress: ({ progress }) => {
      console.log(`Rendering progress: ${Math.round(progress * 100)}%`);
    },
  });

  console.log("Render done!");
};

renderPulse().catch((err) => {
  console.error(err);
  process.exit(1);
});
