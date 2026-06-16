# RTMP server input

Exposes an RTMP server endpoint that Smelter listens on after the input is registered. Publishers push a stream to it using any RTMP client (OBS, FFmpeg, etc.).

**Availability:** Node.js · Browser (Client)

Supported codecs:
- **Video**: `H.264`, `VP8`\*, `VP9`\*
- **Audio**: `AAC`, `Opus`\*

(\* E-RTMP feature.)

Connection parameters:
- Smelter server address.
- RTMP port — defaults to `1935`, configurable via `SMELTER_RTMP_SERVER_PORT`.
- The input id (used as the RTMP application name).
- The registered `streamKey`.

Most RTMP clients accept these as a URL: `rtmp[s]://<smelter_ip>:<port>/<input_id>/<stream_key>`

For RTMPS (RTMP over TLS), set `SMELTER_RTMP_TLS_CERT_FILE` (cert path) and `SMELTER_RTMP_TLS_KEY_FILE` (private key path).

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", {
  type: "rtmp_server",
  streamKey: "mykey",
});
// Stream to rtmp://127.0.0.1:1935/example/mykey
```

## Type

```tsx
type RegisterRtmpServerInput = {
  type: "rtmp_server";
  streamKey: string;
  required?: boolean;
  decoderMap?: DecoderMap;
  sideChannel?: SideChannel;
};
```

## Properties

### streamKey
The RTMP stream key a publisher must use to connect to this input.
- **Type**: `string`

---

### required
If true and the stream is delayed, Smelter postpones output frames until the stream is received.
- **Type**: `boolean`
- **Default**: `false`

---

### decoderMap
Assigns which decoder to use per codec. Currently more than one decoder is supported only for H264.
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
  - `"ffmpeg_h264"` — software decoder based on FFmpeg.
  - `"vulkan_h264"` — hardware-accelerated decoder (requires `gpu-video` feature and a GPU supporting Vulkan Video decoding).

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
