---
name: smelter-ts-docs
description: >
  Build video and audio applications with the Smelter TypeScript SDK
  (`@swmansion/smelter` and its runtime packages `@swmansion/smelter-node`,
  `@swmansion/smelter-web-client`, `@swmansion/smelter-web-wasm`). Use this whenever
  composing, mixing, layouting, streaming, or recording video/audio with Smelter's
  React-like component API — registering inputs (MP4, RTMP, RTP, HLS, WHIP, WHEP,
  camera, screen capture), outputs (MP4, RTMP, HLS, WHIP, WHEP, canvas), components
  (View, Tiles, Rescaler, Text, Image, Mp4, InputStream, Shader, WebView, Show,
  SlideShow), hooks, encoders, shaders, or side-channel processing. Reach for this
  skill instead of guessing Smelter's API or its prop names, defaults, and
  runtime availability — it is the complete reference, so you don't need to browse
  smelter.dev. Targets SDK v0.4.0.
---

# Smelter TypeScript SDK

Smelter is a video/audio composition framework. The TypeScript SDK lets you describe
a live or offline composition with **React components** — you build a component tree
the way you'd build a UI, and Smelter renders it to a video/audio stream. Standard DOM
elements (`<div>`, `<img>`) do **not** work; you use Smelter components (`View`,
`Text`, `InputStream`, …) instead.

## Version & compatibility

This reference targets SDK **v0.4.0** (Smelter server **v0.6.0**, React **18.3.1**
recommended).

If you hit errors that look like version drift — a documented field missing or renamed,
an unexpected type, a deprecated option — read `references/versioning.md`.

## Pick a runtime

The SDK ships as three packages, one per environment. They share the same component
API; they differ in where your React code runs and where media is processed.

- **`@swmansion/smelter-node`** — Node.js. Your React code runs in Node; a Smelter
  **server** does the media processing. By default the server is spawned locally on
  the same machine; you can also connect to one you deployed. Most full-featured
  option. Use for backend pipelines, live streaming, recording, offline rendering.
- **`@swmansion/smelter-web-client`** — Browser, server-backed. React runs in the
  browser and drives a remote Smelter server over HTTP. There's no local server, so
  you must point it at a deployed instance.
- **`@swmansion/smelter-web-wasm`** — Browser, no server. The whole engine runs in
  the browser via WebAssembly in a Web Worker. No server to deploy, but a reduced
  feature set (e.g. browser-only inputs/outputs, limited MP4).

When you don't need a server and want everything client-side, use `web-wasm`. When
you need the full pipeline or backend control, use `node`. See `references/runtimes/`
for the lifecycle and per-runtime input/output support, and `references/overview.md`
for the trade-offs in depth.

## Mental model

1. Create a Smelter instance and `init()` it (spawns or connects to the engine).
2. Register **inputs** (sources: MP4, RTMP, camera, …), **outputs** (destinations:
   MP4, RTMP, HLS, canvas, …), and **resources** (images, shaders, web renderers).
   Each output is given a **React component tree** that defines what it shows.
3. Call `start()` (live) — outputs begin producing frames. You can keep
   registering/unregistering inputs and outputs afterwards, and update the scene by
   re-rendering React. For offline, call `render(...)` instead, which runs to
   completion.
4. `terminate()` when done (also needed to finalize MP4 files correctly).

Minimal live example (Node.js):

```tsx
import Smelter from "@swmansion/smelter-node";
import { Tiles, InputStream } from "@swmansion/smelter";

function Scene() {
  return (
    <Tiles>
      <InputStream inputId="cam" />
    </Tiles>
  );
}

async function run() {
  const smelter = new Smelter();
  await smelter.init();

  await smelter.registerOutput("out", <Scene />, {
    type: "rtmp_client",
    url: "rtmp://127.0.0.1:8002",
    video: {
      resolution: { width: 1280, height: 720 },
      encoder: { type: "ffmpeg_h264" },
    },
    audio: { channels: "stereo", encoder: { type: "aac" } },
  });

  await smelter.registerInput("cam", { type: "mp4", serverPath: "input.mp4" });
  await smelter.start();
}
void run();
```

## Choosing a component

All components import from `@swmansion/smelter`; standard DOM elements (`<div>`,
`<img>`) don't work.

**Layout** — structure the scene:

| Component | Use when |
|---|---|
| `View` | General container, like a `<div>`: rows/columns, absolute positioning, background, padding. The default building block. |
| `Tiles` | Auto-sized grid of children. Default choice for showing several inputs at once (e.g. a conference/call layout) when no specific layout is requested. |
| `Rescaler` | Fit or fill a single child into a fixed area, preserving aspect ratio. |

**Media** — bring content in:

| Component | Use when |
|---|---|
| `InputStream` | Display a registered input (camera, RTMP, WHIP, RTP, …). |
| `Mp4` | Play an MP4 directly — no separate registration. |
| `Image` | Static image, logo, or overlay (URL or registered asset). |
| `Shader` | Custom GPU (WGSL) effect — chroma key, color grading, transitions. |
| `WebView` | Embed a live website rendered via Chromium. |

**Utility:**

| Component | Use when |
|---|---|
| `Text` | Any on-screen text — lower thirds, captions, labels, titles. |
| `Show` | Show/hide children based on a timestamp (offline scheduling). |
| `SlideShow` | Play `<Slide>` children in sequence (intros/outros). |

For runtime package selection, see "Pick a runtime" above.

## Hooks

Import from `@swmansion/smelter` (standard React hooks work too).

| Hook | What it does |
|---|---|
| `useInputStreams()` | State of all registered inputs (e.g. ready / playing / finished) — render conditionally on stream status. |
| `useAudioInput(id, { volume })` | Control an input's audio (volume `0`–`2`) without rendering it visually. |
| `useAfterTimestamp(ms)` | Returns `true` once a timestamp passes — for time-based changes in offline processing. |
| `useBlockingTask(fn)` | Run an async task, blocking offline rendering until it resolves (e.g. fetch data before rendering). |

Details: `references/hooks/<name>.md`.

## Inputs

Register with `smelter.registerInput(id, options)`, then display via `<InputStream inputId="id" />`.

| `type` | Runtime | Use for |
|---|---|---|
| `mp4` | Node · Web Client · WASM | Play a local/remote MP4 file. |
| `rtmp_server` | Node · Web Client | Accept an RTMP stream (OBS, FFmpeg). |
| `rtp_stream` | Node · Web Client | Receive RTP over UDP/TCP. |
| `hls` | Node | Consume an HLS playlist. |
| `whip_server` | Node · Web Client | Accept a WebRTC stream via WHIP. |
| `whep_client` | Node · Web Client | Pull from a WHEP server. |
| `v4l2` | Node · Web Client | Linux video device (experimental). |
| `camera` | WASM | Browser camera (`getUserMedia`). |
| `screen_capture` | WASM | Browser screen capture. |
| `stream` | WASM | Any `MediaStream`. |
| `whep_client` (wasm) | WASM | Pull from a WHEP server in-browser. |

Details: `references/inputs/<type>.md`.

## Outputs

Register with `smelter.registerOutput(id, <Scene/>, options)`.

| `type` | Runtime | Use for |
|---|---|---|
| `mp4` | Node · Web Client | Record to an MP4 file. |
| `rtmp_client` | Node · Web Client | Push to an RTMP server (YouTube, Twitch). |
| `rtp_stream` | Node · Web Client | Stream over RTP. |
| `hls` | Node · Web Client | Serve via HLS (you host the segments). |
| `whip_client` | Node · Web Client | Push via WebRTC WHIP. |
| `whep_server` | Node · Web Client | Serve via WebRTC WHEP to viewers. |
| `canvas` | WASM | Render to an `HTMLCanvasElement`. |
| `stream` | WASM | Return a `MediaStream`. |
| `whip_client` (wasm) | WASM | Push via WHIP from the browser. |

Encoder options are documented inline in each output file. Details: `references/outputs/<type>.md`.

## Resources

Register before use; each is referenced by the matching component.

| Resource | Register with | Used by |
|---|---|---|
| Image | `registerImage(id, opts)` | `<Image imageId="id" />` |
| Shader | `registerShader(id, opts)` | `<Shader shaderId="id" />` |
| Web renderer | `registerWebRenderer(id, opts)` | `<WebView instanceId="id" />` |
| Font | `registerFont(source)` | `<Text>` |

Details: `references/resources/<name>.md`.

## How to use this reference

Open the file that matches your task. There's one file per API item, so you load only
what you need. Each file is self-contained and documents the **full** API surface for
its item — every prop, default, and runtime availability. If an option isn't listed,
the SDK doesn't support it.

**Concepts & recipes** (open when relevant — the essentials are already above)
- `references/overview.md` — the deeper conceptual model: the layout/positioning
  **sizing rules** (the non-obvious part — open this before non-trivial layout work),
  offline vs live, the glossary, the shader concept, and runtime trade-offs.
- `references/patterns.md` — reusable recipes for common tasks: side-by-side/grid
  layouts, overlays, transitions, adding/removing inputs at runtime, web rendering.

**API reference** — the index tables above name every component, hook, input, output,
and resource; open the matching file at `references/<category>/<name>.md` for its full
API. Runtime classes and the init/start/terminate lifecycle live in
`references/runtimes/{nodejs,web-client,web-wasm}.md`. Component style props are inlined
per component; output encoders are inlined per output.

**Operations & integration**
- `references/side-channel.md` — feeding external data (e.g. ML results) into a
  composition from the TypeScript side.
- `references/side-channel-python.md` — the companion Python side-channel API,
  usable alongside the TS SDK.
- `references/deployment.md` — running and deploying the Smelter server binary
  (Docker, binaries, requirements) for `node` / `web-client` setups.
