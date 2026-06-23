# FFmpeg H264

Software H.264 video encoder (FFmpeg). The default video encoder for most outputs. Referenced from an output's `VideoEncoderOptions` via `{ "type": "ffmpeg_h264", ... }`.

## Type

```tsx
type FfmpegH264EncoderOptions = {
  type: "ffmpeg_h264";
  bitrate?:
    | number
    | {
      average_bitrate: number;
      max_bitrate: number;
    };
  keyframe_interval_ms?: number;
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
  pixel_format?: "yuv420p" | "yuv422p" | "yuv444p";
  ffmpeg_options?: Record<string, string>;
};
```

## Properties

### bitrate
Desired bitrate of the output stream, in bits per second. If only a number is specified then it defines the `average_bitrate`, and `max_bitrate` is set to 1.25x this value.

- **Type**: `number | { average_bitrate: number; max_bitrate: number; }`
- **Default value**: Dependent on the encoder used:
  - **libx264**: Constant quality mode with the `crf` equal to 23.
  - **libopenh264**, **h264_videotoolbox**: Calculated based on framerate and resolution. E.g. for 30 FPS in 1080p the `average_bitrate` would be 5000 kb/s and `max_bitrate` 6250 kb/s.

The object form has two fields:
- **average_bitrate** (`number`): Average bitrate measured in bits per second. The encoder will try to keep the bitrate around the provided average, but may temporarily increase it to the max bitrate.
- **max_bitrate** (`number`): Max bitrate measured in bits per second.

---

### keyframe_interval_ms
Maximal interval between 2 consecutive keyframes, in milliseconds.

- **Type**: `number`
- **Default value**: `5000`

---

### preset
Video output encoder preset. Make sure your encoder supports the chosen preset before setting it.

- **Type**: `"ultrafast" | "superfast" | "veryfast" | "faster" | "fast" | "medium" | "slow" | "slower" | "veryslow" | "placebo"`
- **Default value**: `fast`
- **Supported values**: `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`, `placebo`

---

### pixel_format
Encoder pixel format.

- **Type**: `"yuv420p" | "yuv422p" | "yuv444p"`
- **Default value**: `yuv420p`
- **Supported values**: Dependent on the encoder used:
  - **libx264**: `yuv420p`, `yuv422p`, `yuv444p`
  - **libopenh264**: `yuv420p`
  - **h264_videotoolbox**: `yuv420p`

---

### ffmpeg_options
Raw FFmpeg encoder options (passed directly to the codec).

- **Type**: `Record<string, string>`
