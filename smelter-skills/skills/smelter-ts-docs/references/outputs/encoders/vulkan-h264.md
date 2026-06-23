# Vulkan H264

Hardware H.264 video encoder. Selected via an output's `video.encoder` as `{ type: "vulkan_h264", ... }`. Requires a GPU that supports Vulkan Video encoding (the `gpu-video` build of Smelter).

## Type

```tsx
type VulkanH264EncoderOptions = {
  type: "vulkan_h264";
  bitrate?:
    | number
    | {
        averageBitrate: number;
        maxBitrate: number;
      };
  keyframeIntervalMs?: number;
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
Interval between 2 consecutive keyframes, in milliseconds.

- **Type**: `number`
- **Default**: `5000`
