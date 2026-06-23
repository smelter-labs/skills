---
name: smelter-http-api-docs
description: >
  Drive a Smelter server over its HTTP API to compose video and audio. Use this whenever
  configuring, composing, mixing, layouting, streaming, or recording video/audio with a
  Smelter server through HTTP requests (JSON request bodies, snake_case fields) —
  registering inputs (MP4, RTP, HLS, WHIP, WHEP, RTMP, DeckLink, V4L2), outputs (MP4, RTP,
  HLS, WHIP, WHEP, RTMP), building scenes from components (View, Tiles, Rescaler, Text,
  Image, InputStream, Shader, WebView), configuring encoders and resources, handling
  WebSocket events, or side-channel processing. Reach for this skill instead of guessing
  the Smelter HTTP API or its route paths, JSON field names, defaults, and enum values — it
  is the complete reference, so you don't need to browse smelter.dev. Targets Smelter server
  v0.6.0. (If you're instead driving Smelter from React/TypeScript code with the
  `@swmansion/smelter` packages, a separate `smelter-ts-docs` skill covers that SDK.)
---

# Smelter HTTP API

Smelter is a video/audio composition framework. The **HTTP API** is the most direct way to
configure and manage a Smelter server: you send HTTP requests with JSON bodies to register
inputs, outputs, and resources, and to describe what each output renders. Requests use
snake_case field names and Rust-flavored type spellings (`f32`, `f64`, `u32`, `bool`); a
scene is a plain JSON component tree, not code.

> This skill documents the server's HTTP API directly. If you're driving Smelter from
> React/TypeScript code (the `@swmansion/smelter` packages) instead of calling the server
> yourself, that's a different interface with its own `smelter-ts-docs` skill.

## Version & compatibility

This reference targets Smelter server **v0.6.0**. If you hit responses that look like
version drift — an unknown field, a 404 route, an unexpected type — read
`references/versioning.md`.

## Mental model

1. **Run a Smelter server** (Docker or binary). The API is served on port **8081** by
   default (`references/deployment.md`).
2. **Register outputs** (`POST /api/output/:id/register`) — each output declares its
   protocol, video/audio encoder, resolution, and an **initial scene**. Register **inputs**
   (`POST /api/input/:id/register`) and **resources** (images, shaders, web renderers,
   fonts).
3. **`POST /api/start`** — all registered outputs begin producing frames. Timestamps and
   offsets are relative to this call. You can keep registering/unregistering inputs and
   outputs afterwards.
4. **Update scenes** at runtime with `POST /api/output/:id/update` (set `video.root` and
   `audio.inputs`). For MP4 output, `unregister` to flush the file.

A **scene** is a JSON **component tree** assigned to an output's `video.root`. Each
component is an object with a `type` discriminant (`"view"`, `"input_stream"`, …). Audio is
mixed separately via the output's `audio.inputs`, not via components. See
`references/overview.md` for the full model and the layout sizing rules.

Minimal flow:

```http
POST: /api/output/output_1/register
Content-Type: application/json

{
  "type": "rtmp_client",
  "url": "rtmp://127.0.0.1:8002",
  "video": {
    "resolution": { "width": 1280, "height": 720 },
    "encoder": { "type": "ffmpeg_h264" },
    "initial": { "root": { "type": "view" } }
  },
  "audio": { "channels": "stereo", "encoder": { "type": "aac" }, "initial": { "inputs": [] } }
}
```
```http
POST: /api/start

{}
```
```http
POST: /api/input/input_1/register

{ "type": "mp4", "url": "https://example.com/video.mp4" }
```
```http
POST: /api/output/output_1/update

{
  "video": { "root": { "type": "input_stream", "input_id": "input_1" } },
  "audio": { "inputs": [{ "input_id": "input_1" }] }
}
```

## Routes & events

- `references/routes.md` — **every HTTP route**: start, reset, register/unregister/update
  inputs & outputs, request keyframe, register/unregister images/shaders/web-renderers,
  register fonts, `GET /status`, `GET /ws`. The central request reference.
- `references/events.md` — **every WebSocket event** delivered over `GET /ws` (input
  delivered/playing/paused/EOS for video & audio, `OUTPUT_DONE`, `OUTPUT_ERROR`).

## Components

Build scenes from these (`{ "type": ... }` objects in `video.root`). Details:
`references/components/<name>.md`.

**Layout** — structure the scene:

| `type` | Use when |
|---|---|
| `view` | General container, like a `<div>`: rows/columns, absolute positioning, background, padding. The default building block. |
| `tiles` | Auto-sized grid of children. Default for showing several inputs at once (call/conference layout). |
| `rescaler` | Fit or fill a single child into an area, preserving aspect ratio. |

**Media & utility:**

| `type` | Use when |
|---|---|
| `input_stream` | Display a registered input (by `input_id`). |
| `image` | Static image / logo / overlay (registered image resource). |
| `text` | On-screen text — lower thirds, captions, labels. |
| `shader` | Custom WGSL GPU effect — chroma key, color grading, transitions. |
| `web_view` | Embed a live website rendered via Chromium (needs web rendering enabled). |

## Inputs

Register with `POST /api/input/:id/register`, then display via an `input_stream` component.
Details: `references/inputs/<type>.md`.

| `type` | Use for |
|---|---|
| `mp4` | Play a local/remote MP4 file (h264 video, AAC audio). |
| `rtp_stream` | Receive RTP over UDP/TCP. |
| `hls` | Consume an HLS playlist. |
| `whip_server` | Accept a WebRTC stream via WHIP. |
| `whep_client` | Pull from a WHEP server. |
| `rtmp_server` | Accept an RTMP stream (OBS, FFmpeg). |
| `decklink` | Blackmagic DeckLink capture card (experimental). |
| `v4l2` | Linux video device, Video4Linux2 (experimental). |

Server-side inputs support `side_channel` (decoded RGBA/PCM over a Unix socket) — see
`references/side-channel.md`.

## Outputs

Register with `POST /api/output/:id/register` (with an initial scene). Details:
`references/outputs/<type>.md`.

| `type` | Use for | Video encoders | Audio encoders |
|---|---|---|---|
| `mp4` | Record to an MP4 file. | `ffmpeg_h264`, `vulkan_h264` | `aac` |
| `rtp_stream` | Stream over RTP. | `ffmpeg_h264`, `ffmpeg_vp8`, `ffmpeg_vp9`, `vulkan_h264` | `opus` |
| `hls` | Serve via HLS. | `ffmpeg_h264`, `vulkan_h264` | `aac` |
| `whip_client` | Push via WebRTC WHIP (uses `encoder_preferences`). | `ffmpeg_h264`, `ffmpeg_vp8`, `ffmpeg_vp9`, `vulkan_h264`, `any` | `opus` |
| `whep_server` | Serve via WebRTC WHEP to viewers. | `ffmpeg_h264`, `ffmpeg_vp8`, `ffmpeg_vp9`, `vulkan_h264` | `opus` |
| `rtmp_client` | Push to an RTMP server (YouTube, Twitch). | `ffmpeg_h264`, `ffmpeg_vp8`, `ffmpeg_vp9`, `vulkan_h264` | `aac`, `opus` |

## Encoders

Selected via an output's `video.encoder` / `audio.encoder` (`{ "type": ... }`). Full option
tables: `references/outputs/encoders/<name>.md`.

| `type` | Kind | Notes |
|---|---|---|
| `ffmpeg_h264` | video | Software H.264 (FFmpeg). Default for most outputs. |
| `vulkan_h264` | video | Hardware H.264. Requires the `gpu-video` build feature. |
| `ffmpeg_vp8` | video | Software VP8 (FFmpeg). |
| `ffmpeg_vp9` | video | Software VP9 (FFmpeg). |
| `aac` | audio | AAC. |
| `opus` | audio | Opus. |

## Resources

Register before use; each is referenced by the matching component. Details:
`references/resources/<name>.md`.

| Resource | Register with | Used by |
|---|---|---|
| Image | `POST /api/image/:id/register` | `image` component |
| Shader | `POST /api/shader/:id/register` | `shader` component |
| Web renderer | `POST /api/web-renderer/:id/register` | `web_view` component (needs `SMELTER_WEB_RENDERER_ENABLE=true`) |
| Font | `POST /api/font/register` (multipart) | `text` component |

## How to use this reference

Open the file that matches your task — one file per API item, so you load only what you
need. Each file documents the **full** API surface for its item (every field, default, enum
value). If an option isn't listed, the server doesn't support it.

**Concepts & recipes** (open when relevant — the essentials are above):
- `references/overview.md` — the scene/component model, the **layout sizing rules** (open
  before non-trivial layout work), live vs offline, the glossary, and the shader concept.
- `references/patterns.md` — copy-pasteable request sequences: basic flow, side-by-side,
  grid, picture-in-picture, overlays, transitions, runtime updates, audio mixing, web
  rendering.

**Operations & integration:**
- `references/side-channel.md` — exposing decoded frames/audio over a Unix socket for
  external processing (e.g. ML).
- `references/side-channel-python.md` — the Python `smelter-sdk` consumer API.
- `references/deployment.md` — running the server (Docker, GPU, binaries) and the full
  `SMELTER_*` environment-variable reference.
