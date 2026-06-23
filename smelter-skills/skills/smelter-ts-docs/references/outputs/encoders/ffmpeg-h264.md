# FFmpeg H264

Software H.264 video encoder (FFmpeg). The default video encoder for most outputs. Selected via an output's `video.encoder` as `{ type: "ffmpeg_h264", ... }`.

## Type

```tsx
type FfmpegH264EncoderOptions = {
  type: "ffmpeg_h264";
  bitrate?:
    | number
    | {
        averageBitrate: number;
        maxBitrate: number;
      };
  keyframeIntervalMs?: number;
  preset?:
    | "ultrafast"
    | "superfast"
    | "veryfast"
    | "faster"
    | "fast"
    | "medium"
    | "slow"
    | "slower"
    | "veryslow"
    | "placebo";
  pixelFormat?: "yuv420p" | "yuv422p" | "yuv444p";
  ffmpegOptions?: Record<string, string>;
};
```

## Properties

### bitrate
Desired bitrate of the output stream, in bits per second. If only a number is specified it sets `averageBitrate`, and `maxBitrate` becomes 1.25x that value.

- **Type**: `number | { averageBitrate: number; maxBitrate: number }`
- **Default**: Dependent on the encoder used:
  - **libx264**: Constant quality mode with `crf` equal to 23.
  - **libopenh264**, **h264_videotoolbox**: Calculated based on framerate and resolution. E.g. for 30 FPS in 1080p the `averageBitrate` would be 5000 kb/s and `maxBitrate` 6250 kb/s.

The object form has two fields:
- **averageBitrate** (`number`): Average bitrate in bits per second. The encoder tries to keep the bitrate around this average, but may temporarily increase it up to `maxBitrate`.
- **maxBitrate** (`number`): Max bitrate in bits per second.

---

### keyframeIntervalMs
Maximal interval between 2 consecutive keyframes, in milliseconds.

- **Type**: `number`
- **Default**: `5000`

---

### preset
Video output encoder preset. Make sure your encoder supports the chosen preset before setting it.

- **Type**: `"ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium" | "slow" | "slower" | "veryslow" | "placebo"`
- **Default**: `"fast"`
- **Values**: `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `placebo` (ordered fastest/lowest-quality to slowest/highest-quality).

---

### pixelFormat
Encoder pixel format.

- **Type**: `"yuv420p" | "yuv422p" | "yuv444p"`
- **Default**: `"yuv420p"`
- **Values**: Dependent on the encoder used:
  - **libx264**: `yuv420p`, `yuv422p`, `yuv444p`
  - **libopenh264**: `yuv420p`
  - **h264_videotoolbox**: `yuv420p`

---

### ffmpegOptions
Raw FFmpeg encoder options, passed directly to the codec.

- **Type**: `Record<string, string>`
