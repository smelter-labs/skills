# FFmpeg VP9

Software VP9 video encoder (FFmpeg). Selected via an output's `video.encoder` as `{ type: "ffmpeg_vp9", ... }`. Note that some outputs only accept VP9 under specific conditions (e.g. RTMP requires E-RTMP).

## Type

```tsx
type FfmpegVp9EncoderOptions = {
  type: "ffmpeg_vp9";
  bitrate?:
    | number
    | {
        averageBitrate: number;
        maxBitrate: number;
      };
  keyframeIntervalMs?: number;
  pixelFormat?: "yuv420p" | "yuv422p" | "yuv444p";
  ffmpegOptions?: Record<string, string>;
};
```

## Properties

### bitrate
Desired bitrate of the output stream, in bits per second. If only a number is specified it sets `averageBitrate`, and `maxBitrate` becomes 1.25x that value.

- **Type**: `number | { averageBitrate: number; maxBitrate: number }`
- **Default**: Constant quality mode with a `crf` value based on resolution.

The object form has two fields:
- **averageBitrate** (`number`): Average bitrate in bits per second. The encoder tries to keep the bitrate around this average, but may temporarily increase it up to `maxBitrate`.
- **maxBitrate** (`number`): Max bitrate in bits per second.

---

### keyframeIntervalMs
Maximal interval between 2 consecutive keyframes, in milliseconds.

- **Type**: `number`
- **Default**: `5000`

---

### pixelFormat
Encoder pixel format.

- **Type**: `"yuv420p" | "yuv422p" | "yuv444p"`
- **Default**: `"yuv420p"`
- **Values**: `yuv420p`, `yuv422p`, `yuv444p`

---

### ffmpegOptions
Raw FFmpeg encoder options, passed directly to the codec.

- **Type**: `Record<string, string>`
