# WHEP client

An input that lets you connect to a WHEP server endpoint to receive video and audio from it.

> **Note:** This input complies with the WHEP specification described in draft-ietf-wish-whep-02.

## Usage

```http
POST: /api/input/:input_id/register
Content-Type: application/json

{
  "type": "whep_client",
  "endpoint_url": "https://example.com/whep",
  "bearer_token": "<TOKEN>",
  "video": {
    "decoder_preferences": ["ffmpeg_h264", "any"]
  }
}
```

> **Note:**
> - There are no decoder preferences for audio. Opus is the only supported audio codec and is always negotiated.
> - If no video decoder preferences are provided, Smelter automatically negotiates and uses one of the supported decoders (`ffmpeg_vp9`, `ffmpeg_vp8`, `ffmpeg_h264`, `vulkan_h264`).

## Type

```tsx
type WhepClient = {
  type: "whep_client";
  endpoint_url: string;
  bearer_token?: string;
  video?: VideoOptions;
  required?: bool;
  buffer_size_ms?: f64;
  side_channel?: SideChannel;
};
```

## Properties

### endpoint_url
WHEP endpoint URL from which to receive the media stream.
- **Type**: `string`

---

### bearer_token
Bearer token used for authentication with the WHEP endpoint.
- **Type**: `string`

---

### video
Parameters of a video included in the WHEP stream.
- **Type**: `VideoOptions`

---

### required
Determines if the input stream is essential for output frame production. If set to true and the stream is delayed, Smelter will postpone output frames until the stream is received.
- **Type**: `bool`
- **Default**: `false`

---

### buffer_size_ms
Minimum and starting size of the jitter buffer in milliseconds. The buffer adapts dynamically based on observed network jitter but will not shrink below this value. Higher values trade latency for resilience.
- **Type**: `f64`

---

### side_channel
Enable side channel publishing for this input. The external consumer reads decoded frames / audio from a Unix socket created under `SMELTER_SIDE_CHANNEL_SOCKET_DIR`. See `side-channel.md`.
- **Type**: `SideChannel`

## VideoOptions
Parameters of a video source included in the WHEP stream.

```tsx
type VideoOptions = {
  decoder_preferences?: VideoDecoder[];
};
```

### decoder_preferences
An ordered list of preferred video decoders. The first element in the list has the highest priority during WHEP negotiation.
- **Type**: `VideoDecoder[]`
- **Default**: `[ "any" ]`

Behavior:
- If the list ends with `"any"`:
  - Smelter will first try the decoders explicitly listed (in order) and use the first one that is supported and negotiated in WHEP signaling.
  - If none of the listed decoders are supported, Smelter will fall back to any supported codec from the negotiated list that wasn't already in the preferences.
- If `"any"` is not included:
  - Only the decoders listed will be considered.
  - If none are supported, no fallback will occur.

## VideoDecoder
Video decoder type.

```tsx
type VideoDecoder =
  | "ffmpeg_h264"
  | "ffmpeg_vp8"
  | "ffmpeg_vp9"
  | "vulkan_h264"
  | "any";
```

- **Values**:
  - `"ffmpeg_h264"` - Software H264 decoder based on FFmpeg.
  - `"vulkan_h264"` - Hardware decoder. Requires GPU that supports Vulkan Video decoding. Requires the `gpu-video` build feature.
  - `"ffmpeg_vp8"` - Software VP8 decoder based on FFmpeg.
  - `"ffmpeg_vp9"` - Software VP9 decoder based on FFmpeg.
  - `"any"` - Automatically selects any video decoder supported by Smelter.

## SideChannel
Per-track side channel configuration. See `side-channel.md` for details on how decoded data is exposed and consumed.

```tsx
type SideChannel = {
  video?: bool;
  audio?: bool;
  delay_ms?: f64;
};
```

### video
Publish decoded RGBA video frames for this input on the side channel.
- **Type**: `bool`
- **Default**: `false`

### audio
Publish decoded PCM audio batches for this input on the side channel.
- **Type**: `bool`
- **Default**: `false`

### delay_ms
Side channel delay in milliseconds. Frames are buffered for this duration ahead of when the queue consumes them, so the side-channel subscriber receives them early and has roughly this much time to process before the frame is due.
- **Type**: `f64`
- **Default**: `0`
