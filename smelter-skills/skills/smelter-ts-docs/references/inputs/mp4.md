# MP4 input

Reads a static MP4 file. Supports `h264` video tracks and `AAC` audio tracks. If the file has multiple audio or video tracks, only the first of each is used; the rest are ignored.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

> **Note:** Exactly one of `url` or `serverPath` must be defined.

> ⚠️ **Caution:** The Browser (WASM) runtime (`@swmansion/smelter-web-wasm`) does not currently support audio from MP4 files.

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", {
  type: "mp4",
  serverPath: "./input.mp4",
});
```

## Type

```tsx
type RegisterMp4Input = {
  type: "mp4";
  url?: string;
  serverPath?: string;
  loop?: boolean;
  required?: boolean;
  offsetMs?: number;
  seekMs?: number;
  decoderMap?: DecoderMap;
  sideChannel?: SideChannel;
};
```

## Properties

### url
URL of the MP4 file.
- **Type**: `string`
- **Availability**: Node.js · Browser (WASM)

---

### serverPath
Path to the MP4 file on the server where Smelter is deployed.
- **Type**: `string`
- **Availability**: Node.js

---

### loop
Play the input in a loop.
- **Type**: `boolean`
- **Default**: `false`
- **Availability**: Node.js

---

### required
If true and the stream is delayed, Smelter postpones output frames until the stream is received.
- **Type**: `boolean`
- **Default**: `false`
- **Availability**: Node.js

---

### offsetMs
Offset in milliseconds relative to the pipeline start. If unset, the stream synchronizes based on delivery time of initial frames.
- **Type**: `number`
- **Availability**: Node.js

---

### seekMs
Start playing from a specific timestamp (ms). With `loop`, subsequent iterations restart from the beginning. The input can also be seeked at runtime via the handle returned from `registerInput`.
- **Type**: `number`
- **Availability**: Node.js

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
