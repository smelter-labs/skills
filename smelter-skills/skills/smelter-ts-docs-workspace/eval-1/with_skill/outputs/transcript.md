# Eval Execution Transcript

## Eval Prompt
"How do I render a lower-third text overlay with a semi-transparent dark background on top of a live video stream in Smelter? I'm using Node.js."

## Skill
- Path: /home/jbrs/Documents/code/work/smelter/skills/smelter-skills/skills/smelter-ts-docs-workspace/eval-1/with_skill/skill/
- Name: smelter-ts-docs

## Execution

### Step 1: Read SKILL.md
**Action**: Read the skill's main documentation file to understand the overall API surface and identify which reference files are relevant.
**Result**: Identified the key components needed: `View` (layout container with `ViewStyleProps` including `backgroundColor` in `#RRGGBBAA` format), `Text` (text rendering with `TextStyleProps`), `InputStream` (displays registered input), and `Rescaler` (fits content preserving aspect ratio). Also identified the Node.js runtime package `@swmansion/smelter-node`.

### Step 2: Read component references
**Action**: Read `View.md`, `Text.md`, `InputStream.md`, `Rescaler.md`, `ViewStyleProps.md`, and `TextStyleProps.md` to understand exact props and type definitions.
**Result**: Confirmed:
- `View` supports absolute positioning via `top`/`left`/`bottom`/`right`, `backgroundColor` in `#RRGGBBAA` format, `direction`, `padding*`, and `borderRadius`.
- `Text` requires `fontSize` in `TextStyleProps`, supports `color`, `fontWeight`, `width`.
- `InputStream` takes `inputId` (required) and does NOT have a `style` prop -- must be wrapped in `Rescaler` or placed inside a `View` for sizing.
- `Rescaler` wraps a single child to fit a given area while preserving aspect ratio.

### Step 3: Read runtime and I/O references
**Action**: Read `nodejs.md`, `inputs.md`, and `outputs.md` to understand the Node.js lifecycle and how to wire up RTMP input/output.
**Result**: Confirmed lifecycle: `new Smelter()` -> `init()` -> `registerInput()` -> `registerOutput()` -> `start()`. Used `rtmp_server` input type and `rtmp_client` output type for the live streaming scenario.

### Step 4: Write the answer
**Action**: Composed a complete working example that:
1. Creates a 1920x1080 scene with a full-frame `Rescaler` + `InputStream` for the live video
2. Overlays an absolutely-positioned `View` near the bottom-left with `backgroundColor: "#000000BB"` (semi-transparent black)
3. Places two `Text` components inside (name + title) with appropriate styling
4. Wires it up with `@swmansion/smelter-node` lifecycle using RTMP input and output

**Result**: Complete, runnable TSX file written to `answer.tsx`.

### Step 5: Verify API correctness
**Action**: Cross-checked all props against the reference docs.
**Result**: All props match documented types:
- `ViewStyleProps`: `width`, `height`, `bottom`, `left`, `backgroundColor` (#RRGGBBAA), `borderRadius`, `direction`, `paddingHorizontal`, `paddingVertical` -- all valid.
- `TextStyleProps`: `fontSize` (required, present), `fontWeight`, `color` (#RRGGBBAA), `width` -- all valid.
- `RescalerProps`: `style` with `width`/`height` -- valid.
- `InputStream`: only `inputId` used -- valid (no `style` prop attempted).
- Node.js runtime: `registerInput` with `rtmp_server` type, `registerOutput` with `rtmp_client` type -- both valid for Node.js.

## Final Result

```tsx
import Smelter from "@swmansion/smelter-node";
import { View, Text, InputStream, Rescaler } from "@swmansion/smelter";

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

  await smelter.registerInput("live_stream", {
    type: "rtmp_server",
    url: "rtmp://127.0.0.1:1935",
  });

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
}

void run();
```

## Issues
None
