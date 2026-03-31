import Smelter from "@swmansion/smelter-node";
import { View, InputStream, Rescaler } from "@swmansion/smelter";

async function main() {
  const smelter = new Smelter();
  await smelter.init();

  const OUTPUT_WIDTH = 1920;
  const OUTPUT_HEIGHT = 1080;

  // Register two RTMP input streams (OBS sends to these ports)
  await smelter.registerInput("camera_1", {
    type: "rtp_stream",
    transportProtocol: "tcp_server",
    port: 9001,
    video: {
      decoder: "ffmpeg_h264",
    },
    audio: {
      decoder: "opus",
    },
  });

  await smelter.registerInput("camera_2", {
    type: "rtp_stream",
    transportProtocol: "tcp_server",
    port: 9002,
    video: {
      decoder: "ffmpeg_h264",
    },
    audio: {
      decoder: "opus",
    },
  });

  // Register YouTube Live RTMP output
  const YOUTUBE_RTMP_URL = "rtmp://a.rtmp.youtube.com/live2";
  const YOUTUBE_STREAM_KEY = process.env.YOUTUBE_STREAM_KEY || "YOUR_STREAM_KEY";

  await smelter.registerOutput("youtube_output", {
    type: "rtp_stream",
    transportProtocol: "tcp_server",
    port: 9003,
    video: {
      resolution: { width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT },
      encoder: {
        type: "ffmpeg_h264",
        preset: "medium",
      },
      initial: {
        root: (
          <View style={{ direction: "row", width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT }}>
            <Rescaler style={{ width: OUTPUT_WIDTH / 2, height: OUTPUT_HEIGHT }}>
              <InputStream inputId="camera_1" />
            </Rescaler>
            <Rescaler style={{ width: OUTPUT_WIDTH / 2, height: OUTPUT_HEIGHT }}>
              <InputStream inputId="camera_2" />
            </Rescaler>
          </View>
        ),
      },
    },
    audio: {
      encoder: {
        type: "opus",
        channels: "stereo",
      },
      initial: {
        inputs: [
          { inputId: "camera_1" },
          { inputId: "camera_2", volume: 0.5 },
        ],
      },
    },
  });

  console.log("Smelter is running!");
  console.log("Send RTMP streams from OBS to ports 9001 and 9002.");
  console.log("The combined output is available on port 9003.");
  console.log("Use FFmpeg to forward port 9003 to YouTube RTMP if needed:");
  console.log(
    `  ffmpeg -i tcp://127.0.0.1:9003 -c copy -f flv ${YOUTUBE_RTMP_URL}/${YOUTUBE_STREAM_KEY}`
  );
}

main().catch(console.error);
