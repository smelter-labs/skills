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

`video.encoder` is one of (see the encoder file for the full option list):

- `{ type: "ffmpeg_h264" }` — software H.264, the default. See `outputs/encoders/ffmpeg-h264.md`.
- `{ type: "vulkan_h264" }` — hardware H.264, requires the `gpu-video` build. See `outputs/encoders/vulkan-h264.md`.

## Audio encoder options

`audio.encoder` is one of:

- `{ type: "aac" }` — see `outputs/encoders/aac.md`.
