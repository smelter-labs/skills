# FFmpeg VP9

Software VP9 video encoder (FFmpeg). Referenced from an output's `VideoEncoderOptions` via `{ "type": "ffmpeg_vp9", ... }`.

## Type

```tsx
type FfmpegVp9EncoderOptions = {
  type: "ffmpeg_vp9";
  bitrate?:
    | number
    | {
      average_bitrate: number;
      max_bitrate: number;
    };
  keyframe_interval_ms?: number;
  pixel_format?: "yuv420p" | "yuv422p" | "yuv444p";
  ffmpeg_options?: Record<string, string>;
};
```

## Properties

### bitrate
Desired bitrate of the output stream, in bits per second. If only a number is specified then it defines the `average_bitrate`, and `max_bitrate` is set to 1.25x this value.

- **Type**: `number | { average_bitrate: number; max_bitrate: number; }`
- **Default value**: Constant quality mode with `crf` value based on resolution.

The object form has two fields:
- **average_bitrate** (`number`): Average bitrate measured in bits per second. The encoder will try to keep the bitrate around the provided average, but may temporarily increase it to the max bitrate.
- **max_bitrate** (`number`): Max bitrate measured in bits per second.

---

### keyframe_interval_ms
Maximal interval between 2 consecutive keyframes, in milliseconds.

- **Type**: `number`
- **Default value**: `5000`

---

### pixel_format
Encoder pixel format.

- **Type**: `"yuv420p" | "yuv422p" | "yuv444p"`
- **Default value**: `yuv420p`

---

### ffmpeg_options
Raw FFmpeg encoder options (passed directly to the codec).

- **Type**: `Record<string, string>`
