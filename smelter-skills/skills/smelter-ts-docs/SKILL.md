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

**Version:** this reference tracks SDK **v0.4.0**. React **18.3.1** is recommended.

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

## How to use this reference

Open the file that matches your task. There's one file per API item, so you load only
what you need. Each file is self-contained and documents the **full** API surface for
its item — every prop, default, and runtime availability. If an option isn't listed,
the SDK doesn't support it.

**Start here**
- `references/overview.md` — core concepts: the layout/positioning model, scenes,
  offline vs live, glossary, choosing a runtime. Read first if you're new to Smelter.
- `references/patterns.md` — reusable recipes for common tasks: side-by-side/grid
  layouts, overlays, transitions, adding/removing inputs at runtime, web rendering.

**API reference**
- `references/runtimes/{nodejs,web-client,web-wasm}.md` — `Smelter` /
  `OfflineSmelter`, instance managers (spawned vs existing server), the
  init/start/terminate lifecycle, and which inputs/outputs the runtime supports.
- `references/components/<name>.md` — one file per component (`view`, `tiles`,
  `rescaler`, `text`, `image`, `mp4`, `input-stream`, `shader`, `web-view`, `show`,
  `slide-show`). Each component's style props are documented inline in its file.
- `references/hooks/<name>.md` — `use-input-streams`, `use-audio-input`,
  `use-after-timestamp`, `use-blocking-task`.
- `references/inputs/<type>.md` — one file per input source (`mp4`, `rtmp`, `rtp`,
  `hls`, `whip`, `whep`, `v4l2`, and the browser `wasm-*` inputs).
- `references/outputs/<type>.md` — one file per output destination (`mp4`, `rtmp`,
  `rtp`, `hls`, `whip`, `whep`, and the browser `wasm-*` outputs). Each output's
  supported video/audio **encoders** are documented inline.
- `references/resources/<name>.md` — registerable resources: `image`, `shader`,
  `web-renderer`.

**Operations & integration**
- `references/side-channel.md` — feeding external data (e.g. ML results) into a
  composition from the TypeScript side.
- `references/side-channel-python.md` — the companion Python side-channel API,
  usable alongside the TS SDK.
- `references/deployment.md` — running and deploying the Smelter server binary
  (Docker, binaries, requirements) for `node` / `web-client` setups.
