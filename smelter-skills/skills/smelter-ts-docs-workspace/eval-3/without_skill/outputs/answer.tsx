import Smelter from "@swmansion/smelter";
import { View, Text, InputStream, Rescaler } from "@swmansion/smelter";
import { useState, useEffect } from "react";

/**
 * Adds a title card (first 3 seconds) before playing an MP4 video,
 * then outputs the combined result to a new MP4 file.
 *
 * Usage:
 *   npx ts-node answer.tsx
 *
 * Adjust INPUT_FILE, OUTPUT_FILE, and TITLE_TEXT as needed.
 */

const INPUT_FILE = "input.mp4";
const OUTPUT_FILE = "output.mp4";
const TITLE_TEXT = "My Video Title";
const TITLE_DURATION_MS = 3000;
const WIDTH = 1920;
const HEIGHT = 1080;

function TitleCard(props: { title: string; show: boolean }) {
  if (!props.show) {
    return null;
  }

  return (
    <View style={{ width: WIDTH, height: HEIGHT, backgroundColor: "#000000" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 72, color: "#FFFFFF", fontWeight: "bold" }}>
          {props.title}
        </Text>
      </View>
    </View>
  );
}

function Scene(props: { inputId: string }) {
  const [showTitle, setShowTitle] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTitle(false);
    }, TITLE_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ width: WIDTH, height: HEIGHT, backgroundColor: "#000000" }}>
      {showTitle ? (
        <TitleCard title={TITLE_TEXT} show={true} />
      ) : (
        <Rescaler style={{ width: WIDTH, height: HEIGHT }}>
          <InputStream inputId={props.inputId} />
        </Rescaler>
      )}
    </View>
  );
}

async function main() {
  const smelter = new Smelter();
  await smelter.init();

  const inputId = "video_input";

  await smelter.registerInput(inputId, {
    type: "mp4",
    serverPath: INPUT_FILE,
  });

  await smelter.registerOutput("output", {
    type: "mp4",
    serverPath: OUTPUT_FILE,
    video: {
      width: WIDTH,
      height: HEIGHT,
      root: <Scene inputId={inputId} />,
    },
    audio: {
      initial: {
        inputs: [{ inputId: inputId }],
      },
    },
  });

  // Wait for the input stream to finish, plus the title card duration,
  // then close the smelter.
  // In practice you would listen for an "end of input" event or similar.
  // For a simple approach, we wait a generous amount of time or
  // handle it via input stream end callbacks if available.

  smelter.start();

  // The smelter will process until we close it.
  // You can integrate more precise end-detection logic as needed.
  console.log(
    `Processing: ${TITLE_DURATION_MS / 1000}s title card + video from ${INPUT_FILE}`
  );
  console.log(`Output will be written to ${OUTPUT_FILE}`);
}

main().catch(console.error);
