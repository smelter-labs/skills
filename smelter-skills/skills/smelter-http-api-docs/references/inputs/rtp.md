# RTP

An input type that allows streaming video and audio to the Smelter server over RTP. It supports both streaming over UDP and TCP (Smelter works as a TCP server).

## Usage

```http
POST: /api/input/:input_id/register
Content-Type: application/json

{
  "type": "rtp_stream",
  "transport_protocol": "tcp_server",
  "port": 9001,
  "video": {
    "decoder": "ffmpeg_h264"
  },
  "audio": {
    "decoder": "opus"
  }
}
```

See `routes.md` for more about managing inputs.

> **Note:** At least one of `video` and `audio` has to be defined.

## Type

```tsx
type RtpInput = {
  type: "rtp_stream";
  port: string | u16;
  transport_protocol?: "udp" | "tcp_server";
  video?: InputRtpVideoOptions;
  audio?: InputRtpAudioOptions;
  required?: bool;
  offset_ms?: f64;
  buffer_size_ms?: f64;
  side_channel?: SideChannel;
}
```

## Properties

### port
A port number or a port range in format `START:END`. If a range is specified, a port from that range will be returned from the register-input request (see `routes.md`).
- **Type**: `string | u16`

---

### transport_protocol
Transport protocol.
- **Type**: `"udp" | "tcp_server"`
- **Values**:
  - `udp` - UDP protocol.
  - `tcp_server` - TCP protocol where Smelter is the server side of the connection.

---

### video
Parameters of a video included in the RTP stream.
- **Type**: `InputRtpVideoOptions`

---

### audio
Parameters of an audio source included in the RTP stream.
- **Type**: `InputRtpAudioOptions`

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

### buffer_size_ms
Size of the jitter buffer in milliseconds. Controls how long packets are held to absorb network jitter and reorder out-of-order packets. Higher values increase latency but improve resilience to packet loss and reordering.
- **Type**: `f64`

---

### side_channel
Enable side channel publishing for this input. The external consumer reads decoded frames / audio from a Unix socket created under `SMELTER_SIDE_CHANNEL_SOCKET_DIR`. See `side-channel.md`.
- **Type**: `SideChannel`

## InputRtpVideoOptions

```tsx
type InputRtpVideoOptions = {
  decoder: "ffmpeg_h264" | "vulkan_h264" | "ffmpeg_vp8" | "ffmpeg_vp9";
}
```

### decoder
Video decoder.
- **Type**: `"ffmpeg_h264" | "vulkan_h264" | "ffmpeg_vp8" | "ffmpeg_vp9"`
- **Values**:
  - `"ffmpeg_h264"` - Use the software H264 decoder based on FFmpeg.
  - `"vulkan_h264"` - Hardware decoder. Requires GPU that supports Vulkan Video decoding. Requires the `gpu-video` build feature.
  - `"ffmpeg_vp8"` - Use the software VP8 decoder based on FFmpeg.
  - `"ffmpeg_vp9"` - Use the software VP9 decoder based on FFmpeg.

## InputRtpAudioOptions

```tsx
type InputRtpAudioOptions =
  | {
      decoder: "opus";
    }
  | {
      decoder: "aac";
      audio_specific_config: string;
      rtp_mode?: "low_bitrate" | "high_bitrate";
    }
```

### decoder
Audio decoder. Selects which variant of the type applies.
- **Type**: `"opus" | "aac"`

### audio_specific_config
(Only for `decoder: "aac"`.) Configuration encoded in the format described in RFC 3640 (section 4.1).
- **Type**: `string`

Where to find the AAC Specific Config (ASC) by source:
- **FFmpeg streaming**: in the SDP file. Use the `-sdp_file FILENAME` option when streaming to Smelter to generate an SDP file containing the ASC.
- **MP4 files**: inside the `esds` box (the ASC is part of the box, not the entire box). Applies to regular MP4 and fragmented MP4s (used in HLS playlists with MP4 files).
- **FLV files / RTMP**: inside the `AACAUDIODATA` tag.

The following command prints the SDP file used for connection to stdout:
```
ffmpeg -v 0 -i <INPUT_FILE> -t 0 -vn -c:a copy \
  -sdp_file /dev/stdout -f rtp 'rtp://127.0.0.1:1111'
```
To find the value for `audio_specific_config`, search for `config=<HEX_STRING>`. The `HEX_STRING` is the required config.

### rtp_mode
(Only for `decoder: "aac"`.) Specifies the RFC 3640 mode that should be used when depacketizing this stream (see RFC 3640 section 3.3.1).
- **Type**: `"low_bitrate" | "high_bitrate"`
- **Default**: `"high_bitrate"`

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
