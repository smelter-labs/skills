# WHEP client input

Connects to a WHEP server endpoint to receive video and audio. Complies with the WHEP spec (draft-ietf-wish-whep-02).

**Availability:** Node.js · Browser (Client)

Audio: Opus is the only supported codec and is always negotiated (no audio decoder preferences). For video, if no preferences are given, Smelter negotiates one of the supported decoders (`ffmpeg_vp9`, `ffmpeg_vp8`, `ffmpeg_h264`, `vulkan_h264`).

> For the WASM (browser) variant of this input, see `wasm-whep.md`.

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", {
  type: "whep_client",
  endpointUrl: "https://example.com/whep",
  bearerToken: "<TOKEN>",
  video: {
    decoderPreferences: ["ffmpeg_h264", "any"],
  },
});
```

## Type

```tsx
type RegisterWhepClientInput = {
  type: "whep_client";
  endpointUrl: string;
  bearerToken?: string;
  video?: VideoOptions;
  required?: boolean;
  bufferSizeMs?: number;
  sideChannel?: SideChannel;
};
```

## Properties

### endpointUrl
WHEP endpoint URL from which to receive the media stream.
- **Type**: `string`

---

### bearerToken
Bearer token for authentication with the WHEP endpoint.
- **Type**: `string`

---

### video
Video source parameters.
- **Type**: `VideoOptions` (see below)

---

### required
If true and the stream is delayed, Smelter postpones output frames until the stream is received.
- **Type**: `boolean`
- **Default**: `false`

---

### bufferSizeMs
Minimum and starting size of the jitter buffer in ms. The buffer adapts dynamically based on observed network jitter but will not shrink below this value. Higher values trade latency for resilience.
- **Type**: `number`

---

### sideChannel
Enable side channel publishing for this input. The external consumer reads decoded frames/audio from a Unix socket under `SMELTER_SIDE_CHANNEL_SOCKET_DIR`.
- **Type**: `SideChannel` (see below)
- **Availability**: Node.js

## VideoOptions

```tsx
type VideoOptions = {
  decoderPreferences?: VideoDecoder[];
};
```

### decoderPreferences
Ordered list of preferred video decoders; the first element has the highest priority during WHEP negotiation.
- **Type**: `VideoDecoder[]` (see below)
- **Default**: `["any"]`

Behavior:
- If the list ends with `"any"`: Smelter tries the listed decoders in order, using the first supported and negotiated one; if none are supported, it falls back to any supported negotiated codec not already listed.
- If `"any"` is not included: only the listed decoders are considered; if none are supported, no fallback occurs.

## VideoDecoder

```tsx
type VideoDecoder =
  | "ffmpeg_h264"
  | "vulkan_h264"
  | "ffmpeg_vp8"
  | "ffmpeg_vp9"
  | "any";
```

- `"ffmpeg_h264"` — software H264 decoder (FFmpeg).
- `"vulkan_h264"` — hardware decoder (requires `gpu-video` feature and a GPU supporting Vulkan Video decoding).
- `"ffmpeg_vp8"` — software VP8 decoder (FFmpeg).
- `"ffmpeg_vp9"` — software VP9 decoder (FFmpeg).
- `"any"` — automatically selects any decoder supported by Smelter.

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
