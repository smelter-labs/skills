import Smelter from "@swmansion/smelter-node";
import { View, Text, Tiles, InputStream, useInputStreams } from "@swmansion/smelter";

const YOUTUBE_RTMP_URL = "rtmp://a.rtmp.youtube.com/live2/YOUR_STREAM_KEY";

function Scene() {
  const inputs = useInputStreams();
  const obs1 = inputs["obs_1"];
  const obs2 = inputs["obs_2"];

  return (
    <Tiles style={{ width: 1920, height: 1080 }}>
      {obs1?.videoState === "playing" ? (
        <InputStream inputId="obs_1" />
      ) : (
        <View>
          <Text style={{ fontSize: 48, color: "#ffffff" }}>
            Waiting for OBS Stream 1...
          </Text>
        </View>
      )}
      {obs2?.videoState === "playing" ? (
        <InputStream inputId="obs_2" />
      ) : (
        <View>
          <Text style={{ fontSize: 48, color: "#ffffff" }}>
            Waiting for OBS Stream 2...
          </Text>
        </View>
      )}
    </Tiles>
  );
}

async function main() {
  const smelter = new Smelter();
  await smelter.init();

  // Register two RTMP server inputs for receiving OBS streams.
  // OBS should be configured to push to these URLs.
  await smelter.registerInput("obs_1", {
    type: "rtmp_server",
    url: "rtmp://127.0.0.1:1935",
  });

  await smelter.registerInput("obs_2", {
    type: "rtmp_server",
    url: "rtmp://127.0.0.1:1936",
  });

  // Register the output that streams to YouTube Live via RTMP.
  await smelter.registerOutput("youtube", <Scene />, {
    type: "rtmp_client",
    url: YOUTUBE_RTMP_URL,
    video: {
      encoder: { type: "ffmpeg_h264", preset: "fast" },
      resolution: { width: 1920, height: 1080 },
    },
    audio: {
      channels: "stereo",
      encoder: { type: "aac" },
    },
  });

  await smelter.start();

  console.log("Smelter is running.");
  console.log("OBS Stream 1 -> rtmp://127.0.0.1:1935");
  console.log("OBS Stream 2 -> rtmp://127.0.0.1:1936");
  console.log("Output -> YouTube Live RTMP");
}

void main();
