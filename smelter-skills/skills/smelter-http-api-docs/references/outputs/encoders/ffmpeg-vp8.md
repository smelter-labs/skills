# FFmpeg VP8

Software VP8 video encoder (FFmpeg). Referenced from an output's `VideoEncoderOptions` via `{ "type": "ffmpeg_vp8", ... }`.

## Type

```tsx
type FfmpegVp8EncoderOptions = {
  type: "ffmpeg_vp8";
  bitrate?:
    | number
    | {
      average_bitrate: number;
      max_bitrate: number;
    };
  keyframe_interval_ms?: number;
  ffmpeg_options?: Record<string, string>;
};
```

## Properties

### bitrate
Desired bitrate of the output stream, in bits per second. If only a number is specified then it defines the `average_bitrate`, and `max_bitrate` is set to 1.25x this value.

- **Type**: `number | { average_bitrate: number; max_bitrate: number; }`
- **Default value**: Calculated based on framerate and resolution. E.g. for 30 FPS in 1080p the `average_bitrate` would be 5000 kb/s and `max_bitrate` 6250 kb/s.

The object form has two fields:
- **average_bitrate** (`number`): Average bitrate measured in bits per second. The encoder will try to keep the bitrate around the provided average, but may temporarily increase it to the max bitrate.
- **max_bitrate** (`number`): Max bitrate measured in bits per second.

---

### keyframe_interval_ms
Maximal interval between 2 consecutive keyframes, in milliseconds.

- **Type**: `number`
- **Default value**: `5000`

---

### ffmpeg_options
Raw FFmpeg encoder options (passed directly to the codec).

- **Type**: `Record<string, string>`
