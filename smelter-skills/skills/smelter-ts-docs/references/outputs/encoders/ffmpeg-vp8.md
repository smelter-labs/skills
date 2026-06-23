# FFmpeg VP8

Software VP8 video encoder (FFmpeg). Selected via an output's `video.encoder` as `{ type: "ffmpeg_vp8", ... }`. Note that some outputs only accept VP8 under specific conditions (e.g. RTMP requires E-RTMP).

## Type

```tsx
type FfmpegVp8EncoderOptions = {
  type: "ffmpeg_vp8";
  bitrate?:
    | number
    | {
        averageBitrate: number;
        maxBitrate: number;
      };
  keyframeIntervalMs?: number;
  ffmpegOptions?: Record<string, string>;
};
```

## Properties

### bitrate
Desired bitrate of the output stream, in bits per second. If only a number is specified it sets `averageBitrate`, and `maxBitrate` becomes 1.25x that value.

- **Type**: `number | { averageBitrate: number; maxBitrate: number }`
- **Default**: Calculated based on framerate and resolution. E.g. for 30 FPS in 1080p the `averageBitrate` would be 5000 kb/s and `maxBitrate` 6250 kb/s.

The object form has two fields:
- **averageBitrate** (`number`): Average bitrate in bits per second. The encoder tries to keep the bitrate around this average, but may temporarily increase it up to `maxBitrate`.
- **maxBitrate** (`number`): Max bitrate in bits per second.

---

### keyframeIntervalMs
Maximal interval between 2 consecutive keyframes, in milliseconds.

- **Type**: `number`
- **Default**: `5000`

---

### ffmpegOptions
Raw FFmpeg encoder options, passed directly to the codec.

- **Type**: `Record<string, string>`
