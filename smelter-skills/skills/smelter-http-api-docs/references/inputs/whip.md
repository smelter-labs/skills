# WHIP server

An input type that provides a WHIP server endpoint. It allows you to stream media to Smelter.

Smelter exposes the WHIP endpoint on port 9000 under the `/whip/:input_id` route. A different port can be configured with `SMELTER_WHIP_WHEP_SERVER_PORT`.

To connect a new input, register it first with a register-input request (see `routes.md`) and then establish the WHIP connection. The bearer token is returned in the response to the input registration.

## Usage

```http
POST: /api/input/:input_id/register
Content-Type: application/json

{
  "type": "whip_server",
  "video": {
    "decoder_preferences": ["ffmpeg_h264", "any"]
  }
}
```

> **Note:** Both audio and video are used if the source provides them. A minimal registration is valid:
> ```http
> POST: /api/input/:input_id/register
> Content-Type: application/json
>
> {
>   "type": "whip_server"
> }
> ```

## Type

```tsx
type WhipServer = {
  type: "whip_server";
  video?: VideoOptions;
  bearer_token?: string;
  required?: bool;
  buffer_size_ms?: f64;
  side_channel?: SideChannel;
};
```

## Properties

### video
Parameters of a video source included in the WHIP stream.
- **Type**: `VideoOptions`

---

### bearer_token
Authentication token. If not provided, a random token will be generated and returned in the response body.
- **Type**: `string`

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
Parameters of a video source included in the WHIP stream.

```tsx
type VideoOptions = {
  decoder_preferences?: VideoDecoder[];
};
```

### decoder_preferences
An ordered list of preferred video decoders. The first element in the list has the highest priority during WHIP negotiation.
- **Type**: `VideoDecoder[]`
- **Default**: `[ "any" ]`

Behavior:
- If the list ends with `"any"`:
  - Smelter will first try the decoders explicitly listed (in order) and use the first one that is supported and negotiated in WHIP signaling.
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
