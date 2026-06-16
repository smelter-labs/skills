# RTMP client output

Streams composed video and audio from Smelter to an RTMP server.

**Availability:** Node.js, Browser (Client)

Supported codecs: video `H.264`, plus `VP8` and `VP9` (E-RTMP only — destination must support E-RTMP); audio `AAC`, plus `Opus` (E-RTMP only).

The connection is configured by URL: `rtmp[s]://<host>[:<port>]/<app>/<stream_key>`. Port defaults to `1935` for RTMP and `443` for RTMPS.

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";
import { View } from "@swmansion/smelter";

const smelter = new Smelter();
await smelter.init();
await smelter.registerOutput("example", <View />, {
  type: "rtmp_client",
  url: "rtmp://example.com/rtmp",
  video: {
    encoder: { type: "ffmpeg_h264", preset: "ultrafast" },
    resolution: { width: 1920, height: 1080 },
  },
  audio: {
    channels: "stereo",
    encoder: { type: "aac" },
  },
});
```

## Type

```tsx
type RegisterRtmpClientOutput = {
  type: "rtmp_client";
  url: string;
  video?: VideoOptions;
  audio?: AudioOptions;
};

type VideoOptions = {
  resolution: { width: number; height: number };
  sendEosWhen?: OutputEndCondition;
  encoder: VideoEncoderOptions;
  // { type: "ffmpeg_h264" } | { type: "ffmpeg_vp8" } | { type: "ffmpeg_vp9" } | { type: "vulkan_h264" }
};

type AudioOptions = {
  channels?: "mono" | "stereo";
  mixingStrategy?: "sum_clip" | "sum_scale";
  sendEosWhen?: OutputEndCondition;
  encoder: AudioEncoderOptions; // { type: "aac" } | { type: "opus" }
};

type OutputEndCondition =
  | { anyOf: string[] }
  | { allOf: string[] }
  | { anyInput: boolean }
  | { allInputs: boolean };
```

## Properties

### url
RTMP endpoint URL.
- **Type:** `string`

---

### video
Video track configuration. See [VideoOptions](#videooptions).
- **Type:** `VideoOptions`

---

### audio
Audio track configuration. See [AudioOptions](#audiooptions).
- **Type:** `AudioOptions`

## VideoOptions

- **resolution** — `{ width: number; height: number }`. Output resolution in pixels.
- **sendEosWhen** — `OutputEndCondition`. When to terminate based on input stream states (EOS sent per track if both audio and video present).
- **encoder** — `VideoEncoderOptions`. Required. See [Video encoder options](#video-encoder-options).

## AudioOptions

- **channels** — `"mono" | "stereo"`. Default `"stereo"`.
- **mixingStrategy** — `"sum_clip" | "sum_scale"`. Default `"sum_clip"`. `sum_clip`: sum then clip to i16 PCM range. `sum_scale`: sum then scale down to fit i16 PCM range.
- **sendEosWhen** — `OutputEndCondition`.
- **encoder** — `AudioEncoderOptions`. Required. See [Audio encoder options](#audio-encoder-options).

## OutputEndCondition

Defines when the output stream ends based on input stream states. Set exactly one field. By default an input is considered ended when its TCP connection drops/closes, an RTCP BYE is received, an MP4 track ends, or the input was already/never registered.

- **anyOf** — `string[]`. Terminate when any input in the list finishes.
- **allOf** — `string[]`. Terminate when all inputs in the list finish.
- **anyInput** — `boolean`. Terminate when any input ends (incl. inputs added after registration); does not terminate if no inputs were ever connected.
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

- **bitrate** — `number | { averageBitrate; maxBitrate }`. Bits/sec. Bare number sets `averageBitrate`; `maxBitrate` becomes 1.25x. Default: **libx264** constant quality (crf 23); **libopenh264** / **h264_videotoolbox** computed from framerate and resolution (30 FPS 1080p ≈ 5000 kb/s avg, 6250 kb/s max).
  - **averageBitrate** — `number`. **maxBitrate** — `number`.
- **keyframeIntervalMs** — `number`. Default `5000`.
- **preset** — listed preset. Default `"fast"`. Encoder must support it.
- **pixelFormat** — `"yuv420p" | "yuv422p" | "yuv444p"`. Default `"yuv420p"`. libx264 supports all three; libopenh264 / h264_videotoolbox only `yuv420p`.
- **ffmpegOptions** — `Record<string, string>`. Raw FFmpeg encoder options.

### { type: "ffmpeg_vp8" }

E-RTMP only.

```tsx
type FfmpegVp8EncoderOptions = {
  type: "ffmpeg_vp8";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;
  ffmpegOptions?: Record<string, string>;
};
```

- **bitrate** — `number | { averageBitrate; maxBitrate }`. Bare number sets `averageBitrate`; `maxBitrate` becomes 1.25x. Default computed from framerate and resolution (30 FPS 1080p ≈ 5000 kb/s avg, 6250 kb/s max).
  - **averageBitrate** — `number`. **maxBitrate** — `number`.
- **keyframeIntervalMs** — `number`. Default `5000`.
- **ffmpegOptions** — `Record<string, string>`.

### { type: "ffmpeg_vp9" }

E-RTMP only.

```tsx
type FfmpegVp9EncoderOptions = {
  type: "ffmpeg_vp9";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;
  pixelFormat?: "yuv420p" | "yuv422p" | "yuv444p";
  ffmpegOptions?: Record<string, string>;
};
```

- **bitrate** — `number | { averageBitrate; maxBitrate }`. Bare number sets `averageBitrate`; `maxBitrate` becomes 1.25x. Default: constant quality mode with `crf` based on resolution.
  - **averageBitrate** — `number`. **maxBitrate** — `number`.
- **keyframeIntervalMs** — `number`. Default `5000`.
- **pixelFormat** — `"yuv420p" | "yuv422p" | "yuv444p"`. Default `"yuv420p"`.
- **ffmpegOptions** — `Record<string, string>`.

### { type: "vulkan_h264" }

Hardware encoder. Requires a GPU supporting Vulkan Video encoding (`gpu-video` build).

```tsx
type VulkanH264EncoderOptions = {
  type: "vulkan_h264";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;
};
```

- **bitrate** — `number | { averageBitrate; maxBitrate }`. Bare number sets `averageBitrate`; `maxBitrate` becomes 1.25x. Default computed from framerate and resolution (30 FPS 1080p ≈ 5000 kb/s avg, 6250 kb/s max).
  - **averageBitrate** — `number`. **maxBitrate** — `number`.
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

### { type: "opus" }

E-RTMP only.

```tsx
type OpusEncoderOptions = {
  type: "opus";
  preset?: "quality" | "voip" | "lowest_latency";
  sampleRate?: number;
  forwardErrorCorrection?: boolean;
  expectedPacketLoss?: number;
};
```

- **preset** — `"quality" | "voip" | "lowest_latency"`. Default `"voip"`. `quality`: broadcast / high-fidelity. `voip`: VoIP and videoconferencing, prioritizes speech intelligibility. `lowest_latency`: only when minimal latency is paramount.
- **sampleRate** — `number`. Default `48000`. Supported: `8000`, `16000`, `24000`, `48000`.
- **forwardErrorCorrection** — `boolean`. Default `false`. Adds in-band FEC to protect against packet loss.
- **expectedPacketLoss** — `number`. Default `0`. Expected packet loss percentage (0–100); controls FEC redundancy (only when FEC enabled).
