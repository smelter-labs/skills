import Smelter from "@swmansion/smelter-node";
import { View, Text, InputStream, Rescaler } from "@swmansion/smelter";

/**
 * Lower-third overlay on top of a live video stream.
 *
 * Layout (1920x1080):
 * - Full-frame live video via InputStream (wrapped in Rescaler)
 * - Absolutely-positioned lower-third bar near the bottom with a
 *   semi-transparent dark background containing styled text
 */

const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = 1080;

function LowerThirdOverlay() {
  return (
    <View style={{ width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT }}>
      {/* Full-frame live video stream */}
      <Rescaler style={{ width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT }}>
        <InputStream inputId="live_stream" />
      </Rescaler>

      {/* Lower-third bar: absolutely positioned near the bottom */}
      <View
        style={{
          bottom: 80,
          left: 100,
          width: 700,
          height: 120,
          backgroundColor: "#000000BB",
          borderRadius: 8,
          direction: "column",
          paddingHorizontal: 24,
          paddingVertical: 16,
        }}
      >
        <Text
          style={{
            fontSize: 36,
            fontWeight: "bold",
            color: "#FFFFFFFF",
            width: 652,
          }}
        >
          Jane Doe
        </Text>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "normal",
            color: "#CCCCCCFF",
            width: 652,
          }}
        >
          Senior Software Engineer
        </Text>
      </View>
    </View>
  );
}

async function run() {
  const smelter = new Smelter();
  await smelter.init();

  // Register the live video input.
  // Using RTMP server as an example -- push from OBS/FFmpeg to this address.
  await smelter.registerInput("live_stream", {
    type: "rtmp_server",
    url: "rtmp://127.0.0.1:1935",
  });

  // Register output that streams the composed scene via RTMP.
  await smelter.registerOutput("main_output", <LowerThirdOverlay />, {
    type: "rtmp_client",
    url: "rtmp://example.com/app/stream_key",
    video: {
      encoder: { type: "ffmpeg_h264" },
      resolution: { width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT },
    },
    audio: {
      channels: "stereo",
      encoder: { type: "aac" },
    },
  });

  await smelter.start();
  console.log("Smelter is running. Push your live stream to rtmp://127.0.0.1:1935");
}

void run();
