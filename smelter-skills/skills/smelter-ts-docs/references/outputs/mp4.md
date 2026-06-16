# MP4 output

Records composed video and audio to an MP4 file on the machine where Smelter runs.

**Availability:** Node.js, Browser (Client)

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";
import { View } from "@swmansion/smelter";

const smelter = new Smelter();
await smelter.init();
await smelter.registerOutput("example", <View />, {
  type: "mp4",
  serverPath: "./output.mp4",
  video: {
    encoder: { type: "ffmpeg_h264" },
    resolution: { width: 1920, height: 1080 },
  },
  audio: {
    encoder: { type: "aac" },
  },
});
```

## Type

```tsx
type RegisterMp4Output = {
  type: "mp4";
  serverPath: string;
  video?: VideoOptions;
  audio?: AudioOptions;
  ffmpegOptions?: Record<string, string>;
};

type VideoOptions = {
  resolution: { width: number; height: number };
  sendEosWhen?: OutputEndCondition;
  encoder: VideoEncoderOptions; // { type: "ffmpeg_h264" } | { type: "vulkan_h264" }
};

type AudioOptions = {
  channels?: "mono" | "stereo";
  mixingStrategy?: "sum_clip" | "sum_scale";
  sendEosWhen?: OutputEndCondition;
  encoder: AudioEncoderOptions; // { type: "aac" }
};

type OutputEndCondition =
  | { anyOf: string[] }
  | { allOf: string[] }
  | { anyInput: boolean }
  | { allInputs: boolean };
```

## Properties

### serverPath
Path to the MP4 file on the server where Smelter is deployed.
- **Type:** `string`

---

### video
Video track configuration. See [VideoOptions](#videooptions).
- **Type:** `VideoOptions`

---

### audio
Audio track configuration. See [AudioOptions](#audiooptions).
- **Type:** `AudioOptions`

---

### ffmpegOptions
Raw FFmpeg muxer options. For codec-specific options use `ffmpegOptions` inside the video encoder config instead.
- **Type:** `Record<string, string>`

## VideoOptions

- **resolution** — `{ width: number; height: number }`. Output resolution in pixels.
- **sendEosWhen** — `OutputEndCondition`. When to terminate the output based on input stream states. If the output has both audio and video, EOS must be sent for each.
- **encoder** — `VideoEncoderOptions`. Required. See [Video encoder options](#video-encoder-options).

## AudioOptions

- **channels** — `"mono" | "stereo"`. Default `"stereo"`. `mono` = single channel, `stereo` = two channels.
- **mixingStrategy** — `"sum_clip" | "sum_scale"`. Default `"sum_clip"`. `sum_clip`: sum input samples, clip if outside i16 PCM range. `sum_scale`: sum input samples, scale down to fit i16 PCM range if exceeded.
- **sendEosWhen** — `OutputEndCondition`.
- **encoder** — `AudioEncoderOptions`. Required. See [Audio encoder options](#audio-encoder-options).

## OutputEndCondition

Defines when the output stream ends based on input stream states. Set exactly one field. By default an input is considered ended when its TCP connection drops/closes, an RTCP BYE is received, an MP4 track ends, or the input was already/never registered.

- **anyOf** — `string[]`. Terminate when any input in the list finishes.
- **allOf** — `string[]`. Terminate when all inputs in the list finish.
- **anyInput** — `boolean`. Terminate when any input ends (including inputs added after registration); does not terminate if no inputs were ever connected.
- **allInputs** — `boolean`. Terminate when all inputs finish; terminates if no inputs were ever connected.

## Video encoder options

`video.encoder` is one of:

### { type: "ffmpeg_h264" }

```tsx
type FfmpegH264EncoderOptions = {
  type: "ffmpeg_h264";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;
  preset?:
    | "ultrafast" | "superfast" | "veryfast" | "faster" | "fast"
    | "medium" | "slow" | "slower" | "veryslow" | "placebo";
  pixelFormat?: "yuv420p" | "yuv422p" | "yuv444p";
  ffmpegOptions?: Record<string, string>;
};
```

- **bitrate** — `number | { averageBitrate: number; maxBitrate: number }`. Bits per second. A bare number sets `averageBitrate`, and `maxBitrate` becomes 1.25x that. Default depends on encoder: **libx264** uses constant quality (crf 23); **libopenh264** / **h264_videotoolbox** compute from framerate and resolution (e.g. 30 FPS 1080p ≈ 5000 kb/s average, 6250 kb/s max).
  - **averageBitrate** — `number`. Target average; encoder may temporarily rise to maxBitrate.
  - **maxBitrate** — `number`. Upper bound.
- **keyframeIntervalMs** — `number`. Default `5000`. Max interval between keyframes.
- **preset** — one of the listed presets. Default `"fast"`. Ensure your encoder supports the chosen preset.
- **pixelFormat** — `"yuv420p" | "yuv422p" | "yuv444p"`. Default `"yuv420p"`. Supported values depend on encoder: **libx264** all three; **libopenh264** / **h264_videotoolbox** only `yuv420p`.
- **ffmpegOptions** — `Record<string, string>`. Raw FFmpeg encoder options.

### { type: "vulkan_h264" }

Hardware encoder. Requires a GPU supporting Vulkan Video encoding (the `gpu-video` build).

```tsx
type VulkanH264EncoderOptions = {
  type: "vulkan_h264";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;
};
```

- **bitrate** — `number | { averageBitrate: number; maxBitrate: number }`. A bare number sets `averageBitrate`; `maxBitrate` becomes 1.25x. Default computed from framerate and resolution (30 FPS 1080p ≈ 5000 kb/s avg, 6250 kb/s max).
  - **averageBitrate** — `number`.
  - **maxBitrate** — `number`.
- **keyframeIntervalMs** — `number`. Default `5000`.

## Audio encoder options

`audio.encoder` is one of:

### { type: "aac" }

```tsx
type AacEncoderOptions = {
  type: "aac";
  sampleRate?: number;
};
```

- **sampleRate** — `number`. Default `44100`. Supported: `8000`, `16000`, `24000`, `44100`, `48000`.
