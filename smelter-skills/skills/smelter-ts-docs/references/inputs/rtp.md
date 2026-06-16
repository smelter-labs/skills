# RTP input

Streams video and audio to the Smelter server over RTP. Supports both UDP and TCP (Smelter acts as the TCP server).

**Availability:** Node.js · Browser (Client)

> **Note:** At least one of `video` and `audio` must be defined.

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", {
  type: "rtp_stream",
  port: 8001,
  transportProtocol: "tcp_server",
  video: { decoder: "ffmpeg_h264" },
  audio: { decoder: "opus" },
});
// Now connect to TCP port 8001 and start sending RTP traffic
```

## Type

```tsx
type RegisterRtpInput = {
  type: "rtp_stream";
  port: string | number;
  transportProtocol?: "udp" | "tcp_server";
  video?: VideoOptions;
  audio?: AudioOptions;
  required?: boolean;
  offsetMs?: number;
  bufferSizeMs?: number;
  sideChannel?: SideChannel;
};
```

## Properties

### port
Port number, or a port range in `START:END` form. If a range is given, the chosen port is returned from `registerInput`.
- **Type**: `string | number`

---

### transportProtocol
Transport protocol.
- **Type**: `"udp" | "tcp_server"`
- **Values**:
  - `udp` — UDP protocol.
  - `tcp_server` — TCP protocol where Smelter is the server side.

---

### video
Video source parameters.
- **Type**: `VideoOptions` (see below)

---

### audio
Audio source parameters.
- **Type**: `AudioOptions` (see below)

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

### bufferSizeMs
Size of the jitter buffer in ms. Controls how long packets are held to absorb network jitter and reorder out-of-order packets. Higher values increase latency but improve resilience to packet loss and reordering.
- **Type**: `number`

---

### sideChannel
Enable side channel publishing for this input. The external consumer reads decoded frames/audio from a Unix socket under `SMELTER_SIDE_CHANNEL_SOCKET_DIR`.
- **Type**: `SideChannel` (see below)
- **Availability**: Node.js

## VideoOptions

```tsx
type VideoOptions = {
  decoder: "ffmpeg_h264" | "vulkan_h264" | "ffmpeg_vp8" | "ffmpeg_vp9";
};
```

### decoder
Video decoder.
- **Type**: `"ffmpeg_h264" | "vulkan_h264" | "ffmpeg_vp8" | "ffmpeg_vp9"`
- **Values**:
  - `"ffmpeg_h264"` — software H264 decoder (FFmpeg).
  - `"vulkan_h264"` — hardware decoder (requires `gpu-video` feature and a GPU supporting Vulkan Video decoding).
  - `"ffmpeg_vp8"` — software VP8 decoder (FFmpeg).
  - `"ffmpeg_vp9"` — software VP9 decoder (FFmpeg).

## AudioOptions

```tsx
type AudioOptions =
  | { decoder: "opus" }
  | {
      decoder: "aac";
      audioSpecificConfig: string;
      rtpMode?: "low_bitrate" | "high_bitrate";
    };
```

### decoder
Either `"opus"` (no further fields) or `"aac"` (requires `audioSpecificConfig`).

### audioSpecificConfig (AAC only)
AAC Specific Config encoded as a hex string, per RFC 3640 §4.1.
- **Type**: `string`

Where to find the ASC:
- **FFmpeg streaming**: use `-sdp_file FILENAME` when streaming; the ASC is in the SDP file.
- **MP4 files**: inside the `esds` box (regular and fragmented MP4).
- **FLV / RTMP**: inside the `AACAUDIODATA` tag.

To print the SDP to stdout:
```
ffmpeg -v 0 -i <INPUT_FILE> -t 0 -vn -c:a copy \
  -sdp_file /dev/stdout -f rtp 'rtp://127.0.0.1:1111'
```
The value is the `HEX_STRING` in `config=<HEX_STRING>`.

### rtpMode (AAC only)
RFC 3640 mode used when depacketizing the stream.
- **Type**: `"low_bitrate" | "high_bitrate"`
- **Default**: `"high_bitrate"`

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
