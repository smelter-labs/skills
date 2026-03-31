import Smelter from "@swmansion/smelter-node";
import { View, Text, InputStream, Rescaler } from "@swmansion/smelter";

/**
 * Lower-Third Text Overlay with Semi-Transparent Background
 *
 * This example shows how to render a lower-third text overlay on top of a
 * live video stream using Smelter's Node.js SDK. The overlay features a
 * semi-transparent dark background with white text, positioned at the
 * bottom of the frame.
 */

// 1. Define the scene as a React-like component
function LowerThirdScene() {
  return (
    <View style={{ width: 1920, height: 1080 }}>
      {/* Base layer: the live input stream, scaled to fill the output */}
      <Rescaler style={{ width: 1920, height: 1080 }}>
        <InputStream inputId="live_stream" />
      </Rescaler>

      {/* Lower-third overlay, positioned at the bottom */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: 1920,
          height: 120,
          backgroundColor: "#000000AA", // semi-transparent dark background
          paddingLeft: 40,
          paddingTop: 20,
        }}
      >
        <Text
          style={{
            fontSize: 36,
            fontFamily: "Arial",
            color: "#FFFFFF",
            fontWeight: "bold",
          }}
        >
          John Smith - Senior Engineer
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontFamily: "Arial",
            color: "#CCCCCC",
          }}
        >
          Software Mansion | Live Interview
        </Text>
      </View>
    </View>
  );
}

// 2. Initialize Smelter and set up the pipeline
async function main() {
  const smelter = new Smelter();

  // Initialize the Smelter engine (downloads runtime if needed)
  await smelter.init();

  // Register the live input stream (e.g. an RTP stream)
  await smelter.registerInput("live_stream", {
    type: "rtp_stream",
    port: 9001,
    transportProtocol: "udp",
    video: {
      decoder: "ffmpeg_h264",
    },
    audio: {
      decoder: "opus",
    },
  });

  // Register the output — this is where the composited result goes
  await smelter.registerOutput("program_output", {
    type: "rtp_stream",
    port: 9002,
    ip: "127.0.0.1",
    transportProtocol: "udp",
    video: {
      encoder: {
        type: "ffmpeg_h264",
        preset: "ultrafast",
      },
      resolution: { width: 1920, height: 1080 },
      sendEosWhen: { allInputs: "disconnected" },
    },
    audio: {
      encoder: {
        type: "opus",
        channels: "stereo",
      },
      sendEosWhen: { allInputs: "disconnected" },
    },
  });

  // Update the output scene to use our lower-third overlay
  await smelter.registerOutput("program_output", {
    type: "rtp_stream",
    port: 9002,
    ip: "127.0.0.1",
    transportProtocol: "udp",
    video: {
      encoder: {
        type: "ffmpeg_h264",
        preset: "ultrafast",
      },
      resolution: { width: 1920, height: 1080 },
      root: <LowerThirdScene />,
      sendEosWhen: { allInputs: "disconnected" },
    },
    audio: {
      encoder: {
        type: "opus",
        channels: "stereo",
      },
      sendEosWhen: { allInputs: "disconnected" },
    },
  });

  console.log("Smelter is running with lower-third overlay.");
  console.log("Send an RTP stream to port 9001, output on port 9002.");

  // Keep the process alive
  await new Promise(() => {});
}

main().catch(console.error);
