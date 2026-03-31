import { OfflineSmelter } from "@swmansion/smelter-node";
import { View, Text, Mp4, SlideShow, Slide } from "@swmansion/smelter";

function TitleCard() {
  return (
    <View style={{ width: 1920, height: 1080, backgroundColor: "#000000FF" }}>
      <View
        style={{
          width: 1920,
          height: 1080,
          direction: "column",
          top: 0,
          left: 0,
        }}
      >
        <View style={{ width: 1920, height: 1080 }}>
          <Text
            style={{
              fontSize: 72,
              color: "#FFFFFFFF",
              fontWeight: "bold",
              width: 1920,
              height: 1080,
              align: "center",
              wrap: "word",
            }}
          >
            My Video Title
          </Text>
        </View>
      </View>
    </View>
  );
}

function Scene() {
  return (
    <SlideShow>
      <Slide durationMs={3000}>
        <TitleCard />
      </Slide>
      <Slide>
        <Mp4 source="./input.mp4" />
      </Slide>
    </SlideShow>
  );
}

async function main() {
  const smelter = new OfflineSmelter();
  await smelter.init();

  await smelter.render(<Scene />, {
    type: "mp4",
    serverPath: "./output.mp4",
    video: {
      encoder: { type: "ffmpeg_h264" },
      resolution: { width: 1920, height: 1080 },
    },
    audio: {
      channels: "stereo",
      encoder: { type: "aac" },
    },
  });
}

void main();
