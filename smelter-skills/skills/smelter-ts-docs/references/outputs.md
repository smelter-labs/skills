# Outputs Reference

Outputs are registered via `smelter.registerOutput(id, reactRoot, options)`. The `reactRoot` is the React element that defines the visual scene for this output.

## Table of Contents

- [MP4](#mp4) — Node.js, Web Client
- [RTP](#rtp) — Node.js, Web Client
- [HLS](#hls) — Node.js, Web Client
- [WHIP Client](#whip-client) — Node.js, Web Client
- [WHEP Server](#whep-server) — Node.js, Web Client
- [RTMP Client](#rtmp-client) — Node.js, Web Client
- [Canvas (WASM)](#canvas-wasm) — Web WASM only
- [MediaStream (WASM)](#mediastream-wasm) — Web WASM only
- [WHIP Client (WASM)](#whip-client-wasm) — Web WASM only

---

## MP4

Records video and/or audio to an MP4 file on the server.

```tsx
type RegisterMp4Output = {
  type: "mp4";
  serverPath: string;
  video?: VideoOptions;
  audio?: AudioOptions;
  ffmpegOptions?: Record<string, string>;
}
```

**VideoOptions**: `{ resolution: { width, height }; sendEosWhen?: OutputEndCondition; encoder: VideoEncoderOptions }`

**Video Encoders**: `ffmpeg_h264`, `vulkan_h264` only (MP4 cannot carry VP8/VP9); see [Video Encoders](#video-encoders).

**AudioOptions**: `{ channels?: "mono"|"stereo"; mixingStrategy?: "sum_clip"|"sum_scale"; sendEosWhen?; encoder: AudioEncoderOptions }`. `aac` only; see [Audio Encoders](#audio-encoders).

---

## RTP

Streams video/audio over RTP (UDP or TCP).

```tsx
type RegisterRtpOutput = {
  type: "rtp_stream";
  port: string | number;
  ip?: string;          // for UDP
  transportProtocol?: "udp" | "tcp_server";  // default: "udp"
  video?: VideoOptions;
  audio?: AudioOptions;
}
```

**Video Encoders**: `ffmpeg_h264`, `ffmpeg_vp8`, `ffmpeg_vp9`, `vulkan_h264` — see [Video Encoders](#video-encoders).

**Audio Encoder**: `opus` — see [Audio Encoders](#audio-encoders).

---

## HLS

Writes HLS playlist to disk. Serving the files is your responsibility.

```tsx
type RegisterHlsOutput = {
  type: "hls";
  serverPath: string;        // path to .m3u8 playlist
  maxPlaylistSize?: number;  // max segments kept; oldest removed when exceeded
  video?: VideoOptions;
  audio?: AudioOptions;
}
```

Same video/audio options as MP4 output.

---

## WHIP Client

Sends stream to a WHIP server endpoint via WebRTC.

```tsx
type RegisterWhipClientOutput = {
  type: "whip_client";
  endpointUrl: string;
  bearerToken?: string;
  video?: {
    resolution: { width, height };
    sendEosWhen?: OutputEndCondition;
    encoderPreferences?: VideoEncoderOptions[];  // default: [{ type: "any" }]
  };
  audio?: true | {
    channels?; mixingStrategy?; sendEosWhen?;
    encoderPreferences?: ({ type: "opus"; ... } | { type: "any" })[];
  };
}
```

Setting `audio: true` auto-negotiates audio settings.

---

## WHEP Server

Provides a WHEP server endpoint for multiple viewer clients. Returns `{ endpointRoute }` from `registerOutput`.

```tsx
type RegisterWhepServerOutput = {
  type: "whep_server";
  bearerToken?: string;
  video?: VideoOptions;
  audio?: AudioOptions;
}
```

Video encoders: `ffmpeg_h264`, `ffmpeg_vp8`, `ffmpeg_vp9`, `vulkan_h264`. Audio encoder: `opus` only.

Smelter exposes endpoint at `http://HOST:9000/whep/<outputId>`.

---

## RTMP Client

Streams to an RTMP server (e.g., YouTube Live, Twitch).

URL format: `rtmp[s]://<host>[:<port>]/<app>/<stream_key>`. Port defaults to `1935` for RTMP and `443` for RTMPS.

```tsx
type RegisterRtmpClientOutput = {
  type: "rtmp_client";
  url: string;
  video?: VideoOptions;
  audio?: AudioOptions;
}
```

Video encoders: `ffmpeg_h264`, plus `ffmpeg_vp8` / `ffmpeg_vp9` / `vulkan_h264`. Audio encoders: `aac`, plus `opus`. VP8, VP9, and Opus require the destination server to support **E-RTMP**; use H.264 + AAC for plain RTMP targets (YouTube, Twitch).

---

## Canvas (WASM)

Renders video to an `HTMLCanvasElement` and plays audio in the browser tab.

```tsx
type RegisterCanvasOutput = {
  type: "canvas";
  video?: { canvas: HTMLCanvasElement; resolution: { width: number; height: number } };
  audio?: boolean;  // plays in browser tab, default: false
}
```

---

## MediaStream (WASM)

Returns a `MediaStream` object for use with WebRTC, canvas, or other browser APIs.

```tsx
type RegisterStreamOutput = {
  type: "stream";
  video?: { resolution: { width: number; height: number } };
  audio?: boolean;  // include audio track, default: false
}
```

Returns `MediaStream` from `registerOutput`.

---

## WHIP Client (WASM)

Sends stream via WHIP protocol (WebRTC).

```tsx
type RegisterWhipClientOutput = {
  type: "whip_client";
  endpointUrl: string;
  bearerToken?: string;
  iceServers?: RTCConfiguration['iceServers'];  // default: Google STUN
  video: { resolution: { width, height }; maxBitrate?: number };
  audio?: boolean;
}
```

---

## OutputEndCondition

Defines when an output stream should end based on input stream states. Only one field may be set.

```tsx
type OutputEndCondition =
  | { anyOf: string[] }    // end when any of these inputs finish
  | { allOf: string[] }    // end when all of these inputs finish
  | { anyInput: boolean }  // end when any registered input finishes
  | { allInputs: boolean } // end when all inputs finish
```

Inputs are "finished" when: TCP connection drops, RTCP BYE received, MP4 track ended, or input was unregistered.

---

## Video Encoders

All FFmpeg encoders share `bitrate` (number or `{ averageBitrate, maxBitrate }`; max defaults to 1.25× average), `keyframeIntervalMs` (default `5000`), and `ffmpegOptions` (raw FFmpeg `Record<string, string>`).

### ffmpeg_h264

```tsx
type FfmpegH264EncoderOptions = {
  type: "ffmpeg_h264";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;
  preset?: "ultrafast" | "superfast" | "veryfast" | "faster" | "fast"
         | "medium" | "slow" | "slower" | "veryslow" | "placebo";  // default "fast"
  pixelFormat?: "yuv420p" | "yuv422p" | "yuv444p";  // default "yuv420p"
  ffmpegOptions?: Record<string, string>;
};
```

Bitrate default depends on the underlying encoder: libx264 uses CRF 23; libopenh264 / h264_videotoolbox compute the average from framerate and resolution (≈5000 kb/s at 1080p30). Pixel-format support is also encoder-dependent (libopenh264 / h264_videotoolbox only support `yuv420p`).

### ffmpeg_vp8

```tsx
type FfmpegVp8EncoderOptions = {
  type: "ffmpeg_vp8";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;
  ffmpegOptions?: Record<string, string>;
};
```

Default bitrate is computed from framerate and resolution.

### ffmpeg_vp9

```tsx
type FfmpegVp9EncoderOptions = {
  type: "ffmpeg_vp9";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;
  pixelFormat?: "yuv420p" | "yuv422p" | "yuv444p";  // default "yuv420p"
  ffmpegOptions?: Record<string, string>;
};
```

Default bitrate uses constant-quality CRF derived from resolution.

### vulkan_h264 (Required feature: `vk-video`)

Hardware encoder. Requires a GPU supporting Vulkan Video encoding.

```tsx
type VulkanH264EncoderOptions = {
  type: "vulkan_h264";
  bitrate?: number | { averageBitrate: number; maxBitrate: number };
  keyframeIntervalMs?: number;  // default 5000
};
```

Default bitrate is computed from framerate and resolution (≈5000 kb/s average / 6250 kb/s max at 1080p30).

### Quick Reference

| Encoder | Runtimes | Notes |
|---|---|---|
| `ffmpeg_h264` | All | Software. Preset controls quality/speed tradeoff. |
| `ffmpeg_vp8` | Node, Web Client | Software VP8. |
| `ffmpeg_vp9` | Node, Web Client | Software VP9. |
| `vulkan_h264` | Node, Web Client | Hardware. Requires Vulkan Video GPU + `vk-video` feature. |

## Audio Encoders

### aac

```tsx
type AacEncoderOptions = {
  type: "aac";
  sampleRate?: number;  // default 44100; one of 8000, 16000, 24000, 44100, 48000
};
```

### opus

```tsx
type OpusEncoderOptions = {
  type: "opus";
  preset?: "quality" | "voip" | "lowest_latency";  // default "voip"
  sampleRate?: number;                              // default 48000; one of 8000, 16000, 24000, 48000
  forwardErrorCorrection?: boolean;                 // default false; see RFC 6716 §2.1.7, §4.2.5
  expectedPacketLoss?: number;                      // 0-100, default 0; only used when FEC enabled
};
```

### Quick Reference

| Encoder | Runtimes | Notes |
|---|---|---|
| `aac` | Node, Web Client | Use for MP4, HLS, RTMP. |
| `opus` | Node, Web Client | Use for RTP, WHIP, WHEP, and RTMP over E-RTMP. |
