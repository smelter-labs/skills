# Eval Execution Transcript

## Eval Prompt
"I need to build a Node.js app that takes two RTMP streams (from OBS) and arranges them side by side in a grid, then streams the combined output to YouTube Live via RTMP. Write the full working code."

## Skill
- Path: /home/jbrs/Documents/code/work/smelter/skills/smelter-skills/skills/smelter-ts-docs-workspace/eval-0/with_skill/skill/
- Name: smelter-ts-docs

## Execution

### Step 1: Read SKILL.md
**Action**: Read the top-level SKILL.md to understand the skill's structure, available components, inputs, outputs, and references.
**Result**: Identified that the skill documents the Smelter TypeScript SDK. Key elements for this task: `Tiles` component for side-by-side layout, `InputStream` for displaying streams, `rtmp_server` input type for receiving OBS streams, `rtmp_client` output type for pushing to YouTube, and `@swmansion/smelter-node` as the Node.js runtime.

### Step 2: Read Node.js Runtime Reference
**Action**: Read `references/runtimes/nodejs.md` for the Smelter Node.js lifecycle and API.
**Result**: Confirmed the lifecycle: `new Smelter()` -> `init()` -> register inputs/outputs -> `start()`. Default import is `Smelter` from `@swmansion/smelter-node`. The runtime supports `rtmp_server` inputs and `rtmp_client` outputs.

### Step 3: Read Inputs Reference
**Action**: Read `references/inputs.md` for RTMP server input registration.
**Result**: Found `rtmp_server` input type. Each input starts a separate RTMP server. Configuration: `{ type: "rtmp_server", url: "rtmp://127.0.0.1:<port>" }`. Also supports `required`, `offsetMs`, and `decoderMap` options.

### Step 4: Read Outputs Reference
**Action**: Read `references/outputs.md` for RTMP client output registration.
**Result**: Found `rtmp_client` output type: `{ type: "rtmp_client", url: string, video?: VideoOptions, audio?: AudioOptions }`. Video encoder must be `ffmpeg_h264` (or `vulkan_h264`). Audio encoder for RTMP is AAC only.

### Step 5: Read Tiles Component Reference
**Action**: Read `references/components/Tiles.md` for the side-by-side layout.
**Result**: `Tiles` arranges children in equal-sized non-overlapping tiles. Automatically calculates rows/columns. Non-layout children (like InputStream) scale proportionally to fit, centered. Default tile aspect ratio is 16:9.

### Step 6: Read InputStream Component Reference
**Action**: Read `references/components/InputStream.md` for displaying registered inputs.
**Result**: `<InputStream inputId="..." />` displays a registered input. Does NOT have a style prop. Requires pre-registration via `smelter.registerInput()`.

### Step 7: Read useInputStreams Hook Reference
**Action**: Read `references/hooks/useInputStreams.md` for reactive stream state.
**Result**: `useInputStreams()` returns a record of all inputs with their state (`ready`, `playing`, `finished`). Used to conditionally render placeholder text while waiting for streams to connect.

### Step 8: Write the Code
**Action**: Combined all documentation knowledge to write a complete Smelter Node.js application.
**Result**: Wrote `answer.tsx` with:
- Two `rtmp_server` inputs on ports 1935 and 1936 for OBS
- A `Scene` component using `Tiles` for side-by-side layout with two `InputStream` children
- Conditional rendering with `useInputStreams` to show "Waiting..." text before streams connect
- An `rtmp_client` output configured for YouTube Live with 1920x1080 resolution, H264 video, and AAC stereo audio

## Final Result
```tsx
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

  await smelter.registerInput("obs_1", {
    type: "rtmp_server",
    url: "rtmp://127.0.0.1:1935",
  });

  await smelter.registerInput("obs_2", {
    type: "rtmp_server",
    url: "rtmp://127.0.0.1:1936",
  });

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
```

## Issues
None
