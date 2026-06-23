# RTMP server

An input type that allows Smelter to receive streams over RTMP.

Smelter exposes an RTMP endpoint after you register the input by sending a register-input request (see `routes.md`).

Supported codecs:

| Media Type | Supported Codecs |
| :--- | :--- |
| **Video** | `H.264`, `VP8`\*, `VP9`\* |
| **Audio** | `AAC`, `Opus`\* |

_\* E-RTMP feature._

The RTMP connection is configured using:
- The Smelter server address
- The configured RTMP port — defaults to `1935`, configurable via `SMELTER_RTMP_SERVER_PORT`
- The id the input was registered under (used as the RTMP application name)
- The registered `stream_key`

Most RTMP clients accept connection parameters as a URL. Format: `rtmp[s]://<smelter_ip>:<port>/<input_id>/<stream_key>`

> **Note:** To enable RTMPS (RTMP over TLS/SSL), configure these environment variables:
> - `SMELTER_RTMP_TLS_CERT_FILE` — path to the TLS certificate file
> - `SMELTER_RTMP_TLS_KEY_FILE` — path to the TLS private key file

## Usage

```http
POST: /api/input/example/register
Content-Type: application/json

{
  "type": "rtmp_server",
  "stream_key": "mykey"
}
```

See `routes.md` for more about managing inputs. Once the RTMP server input is registered and Smelter is listening on the configured URL, push a stream using any RTMP client (e.g. OBS, FFmpeg) — for the example above, stream to `rtmp://127.0.0.1:1935/example/mykey`.

## Type

```tsx
type RtmpServerInput = {
  type: "rtmp_server";
  stream_key: string;
  required?: bool;
  decoder_map?: DecoderMap;
  side_channel?: SideChannel;
}
```

## Properties

### stream_key
The RTMP stream key a publisher must use to connect to this input.
- **Type**: `string`

---

### required
Determines if the input stream is essential for output frame production. If set to true and the stream is delayed, Smelter will postpone output frames until the stream is received.
- **Type**: `bool`
- **Default**: `false`

---

### decoder_map
Assigns which decoder should be used for media encoded with a specific codec. Currently, more than one decoder is supported only for `H264`.
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
  - `"ffmpeg_h264"` - Software decoder based on FFmpeg.
  - `"vulkan_h264"` - Hardware-accelerated decoder. Requires GPU that supports Vulkan Video decoding. Requires the `gpu-video` build feature.

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
