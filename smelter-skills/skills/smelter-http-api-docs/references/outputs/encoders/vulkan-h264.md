# Vulkan H264

Hardware H.264 video encoder. Requires a GPU that supports Vulkan Video encoding, and the `gpu-video` build feature. Referenced from an output's `VideoEncoderOptions` via `{ "type": "vulkan_h264", ... }`.

> **Note:** Requires the `gpu-video` build feature.

## Type

```tsx
type VulkanH264EncoderOptions = {
  type: "vulkan_h264";
  bitrate?:
    | number
    | {
      average_bitrate: number;
      max_bitrate: number;
    };
  keyframe_interval_ms?: number;
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
Interval between 2 consecutive keyframes, in milliseconds.

- **Type**: `number`
- **Default value**: `5000`
