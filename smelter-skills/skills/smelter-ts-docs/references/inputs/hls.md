# HLS input

Consumes an HLS playlist.

**Availability:** Node.js

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", {
  type: "hls",
  url: "https://example.com/playlist.m3u8",
});
```

## Type

```tsx
type RegisterHlsInput = {
  type: "hls";
  url: string;
  required?: boolean;
  offsetMs?: number;
  decoderMap?: DecoderMap;
  sideChannel?: SideChannel;
};
```

## Properties

### url
URL of the HLS playlist.
- **Type**: `string`

---

### required
If true and the stream is delayed, Smelter postpones output frames until the stream is received.
- **Type**: `boolean`
- **Default**: `false`

---

### offsetMs
Offset in milliseconds relative to the pipeline start. If unset, the stream synchronizes based on delivery time of initial frames.
- **Type**: `number`

---

### decoderMap
Assigns which decoder to use per codec.
- **Type**: `DecoderMap` (see below)

---

### sideChannel
Enable side channel publishing for this input. The external consumer reads decoded frames/audio from a Unix socket under `SMELTER_SIDE_CHANNEL_SOCKET_DIR`.
- **Type**: `SideChannel` (see below)
- **Availability**: Node.js

## DecoderMap

Maps codecs to decoders.

```tsx
type DecoderMap = {
  h264?: "ffmpeg_h264" | "vulkan_h264";
};
```

### h264
H264 decoder selection.
- **Type**: `"ffmpeg_h264" | "vulkan_h264"`
- **Default**: `vulkan_h264` if available, otherwise `ffmpeg_h264`
- **Values**:
  - `"ffmpeg_h264"` — software H264 decoder based on FFmpeg.
  - `"vulkan_h264"` — hardware decoder (requires `gpu-video` feature and a GPU supporting Vulkan Video decoding).

## SideChannel

Per-track side channel configuration. Controls how decoded data is exposed for external consumption.

```tsx
type SideChannel = {
  video?: boolean;
  audio?: boolean;
  delayMs?: number;
};
```

### video
Publish decoded RGBA video frames for this input on the side channel.
- **Type**: `boolean`
- **Default**: `false`

### audio
Publish decoded PCM audio batches for this input on the side channel.
- **Type**: `boolean`
- **Default**: `false`

### delayMs
Side channel delay in ms. Frames are buffered this far ahead of when the queue consumes them, so the subscriber receives them early and has roughly this much time to process before the frame is due.
- **Type**: `number`
- **Default**: `0`
