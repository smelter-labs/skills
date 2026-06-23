# HLS

An input type that allows Smelter to consume HLS playlists.

## Usage

```http
POST: /api/input/:input_id/register
Content-Type: application/json

{
  "type": "hls",
  "url": "https://example.com/playlist.m3u8"
}
```

See `routes.md` for more about managing inputs.

## Type

```tsx
type HlsInput = {
  type: "hls";
  url: string;
  required?: bool;
  offset_ms?: f64;
  decoder_map?: DecoderMap;
  side_channel?: SideChannel;
}
```

## Properties

### url
URL of the HLS playlist.
- **Type**: `string`

---

### required
Determines if the input stream is essential for output frame production. If set to true and the stream is delayed, Smelter will postpone output frames until the stream is received.
- **Type**: `bool`
- **Default**: `false`

---

### offset_ms
Offset in milliseconds relative to the pipeline start (start request). If unspecified, the stream synchronizes based on the delivery time of the initial frames.
- **Type**: `f64`

---

### decoder_map
Assigns which decoder should be used for media encoded with a specific codec.
- **Type**: `DecoderMap`

---

### side_channel
Enable side channel publishing for this input. The external consumer reads decoded frames / audio from a Unix socket created under `SMELTER_SIDE_CHANNEL_SOCKET_DIR`. See `side-channel.md`.
- **Type**: `SideChannel`

## DecoderMap
Maps codecs to the provided decoders.

```tsx
type DecoderMap = {
  h264?: 'ffmpeg_h264' | 'vulkan_h264';
};
```

### h264
H264 decoder configuration.
- **Type**: `'ffmpeg_h264' | 'vulkan_h264'`
- **Default**: If available `vulkan_h264` will be used, otherwise `ffmpeg_h264`
- **Values**:
  - `"ffmpeg_h264"` - Software H264 decoder based on FFmpeg.
  - `"vulkan_h264"` - Hardware decoder. Requires GPU that supports Vulkan Video decoding. Requires the `gpu-video` build feature.

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
