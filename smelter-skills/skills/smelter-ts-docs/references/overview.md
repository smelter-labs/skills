# Smelter overview (read me first)

Conceptual foundation for the Smelter TypeScript SDK. Read this before the API
references. Component APIs live in `./components/*.md`, inputs in `./inputs/*.md`,
outputs in `./outputs/*.md`, resources in `./resources/*.md`, hooks in
`./hooks/*.md`, runtime entry points in `./runtimes/*.md`, and deployment in
`./deployment.md`.

## What Smelter is

Smelter is a toolkit for **real-time video processing**. With it you can:

- Combine multimedia from different sources into a single video or live stream.
- Enrich content with text, custom shaders, and embedded websites.
- Drive it all with React components (the TypeScript SDK) or directly over an HTTP API.

The TypeScript SDK is a set of libraries exposing **React components, hooks, and
utilities** that describe how Smelter composes video. You write a React tree; the
SDK translates every render into a scene update that the Smelter media engine
applies. Standard DOM elements (`<div>`, etc.) do **not** work — you use
Smelter-specific components (`View`, `Tiles`, `Rescaler`, `Text`, `Image`,
`InputStream`, `Mp4`, `Show`, `SlideShow`, `Shader`, `WebView`).

The split is fundamental: **your React code defines the layout, a separate media
engine does the actual decoding/rendering/encoding.** Depending on the runtime,
that engine is a native Smelter server process or a WASM module in a Web Worker.

Generate a starter project with:

```sh
npx create-smelter-app
```

## Offline vs live processing

Smelter runs in one of two modes; the distinction drives how inputs behave and how
timestamps advance.

- **Live processing** — operates on real-time inputs/outputs (RTMP, WHIP, cameras,
  live streams). Processing is synchronized to the wall clock: a 1-second segment
  of video takes ~1 second to process. Inputs that arrive too slowly cause the
  current timestamp to fall behind wall-clock time.
- **Offline processing** — operates only on non-real-time inputs/outputs (e.g.
  combining two MP4 files into one). Processing is decoupled from real time and runs
  as fast as hardware allows. A 5-minute file might finish in 2 minutes, but the
  final timestamp is still 5 minutes.

In the Node.js runtime these correspond to two entry classes — `Smelter` (live) and
`OfflineSmelter` (offline). See `./runtimes/nodejs.md`.

## Glossary

- **Input** — an entity registered (via `Smelter.registerInput`) before use; a
  source of frames. Examples: an incoming RTP/RTMP stream, an MP4 file, a camera.
  - **Offset** — a timestamp marking the start of the stream relative to queue
    start. If undefined, it's derived from the arrival time of the first packet.
  - **Required** — a required input forces Smelter to *block* until data for the
    current timestamp is available. Rule of thumb: in **offline** processing all
    inputs should be required; in **live** processing none should be. Mixing is
    occasionally useful but unusual.
- **Output** — an entity registered (via `Smelter.registerOutput`) before use; a
  destination for generated frames. Examples: an outgoing RTP stream, an MP4 file
  on disk.
- **Resource** — a registered entity that is neither an input nor an output:
  shader source, a font, or an image. See `./resources/*.md`.
- **Timestamp** — unless stated otherwise, all user-facing timestamps are in
  **milliseconds**, measured from queue start. "Time" here means time of the
  processed media streams, which may differ from wall-clock time (see live vs
  offline above).
- **Scene** — the current component tree for an output. Every React re-render
  produces a new scene that Smelter applies.
- **Queue** — the internal clock/buffer that orders frames by timestamp; "queue
  start" is the zero point for all timestamps.

## The layout model (essential)

Video layout is built from components, split into two groups:

- **Layout components** — `View`, `Tiles`, `Rescaler`. They position and size their
  children.
- **Non-layout components** — render something specific: `Image`, `Text`,
  `InputStream`, `Mp4`. They usually take no children. `Shader` and `WebView` are
  exceptions — they accept children.

`View` lays children out in a row or column (like a `<div>`); `Tiles` arranges
children in a grid; `Rescaler` scales a single child to fit. See the per-component
files for exact props.

### Sizing rules

If `width` and `height` are set explicitly, they win. Otherwise a layout
component's size depends on where it sits in the tree:

| Placement | Resulting size |
|---|---|
| Root of the component tree | Based on the output stream's declared resolution. |
| Child of a **non-layout** component (e.g. inside `Shader`/`WebView`) | Size **must** be defined explicitly (usually `width`/`height`). |
| **Statically** positioned child of a layout component | Based on the area its parent assigns it, unless explicitly defined. |
| **Absolutely** positioned child of a layout component | Same size as its parent. |

Practical consequences:

- A top-level `View` usually needs **no** size — the output resolution defines it.
- A child of `Shader` or `WebView` **must** have an explicit size.
- When nesting layouts, you often need no size, or at most one of `width`/`height`.

> Note: `Tiles` does not support all common sizing/positioning props. Where a layout
> component does support a given prop, behavior is consistent across components.

### Static vs absolute positioning

By default children are **statically** positioned — laid out in order by their
parent (row/column for `View`, grid for `Tiles`).

Setting any of these props switches a component to **absolute** positioning, where
it ignores the parent's normal flow:

- `top` — distance (px) from the parent's top edge to the child's top edge.
- `bottom` — distance (px) from the parent's bottom edge to the child's bottom edge.
- `left` — distance (px) from the parent's left edge to the child's left edge.
- `right` — distance (px) from the parent's right edge to the child's right edge.
- `rotation` — rotation in degrees (rotation of complex elements is not fully
  supported yet).

> Note: having these props doesn't make a component a layout component. Only layout
> components *respect* these values on their children — but a non-layout component
> can also carry them (to position itself within a layout parent).

### Styling and transitions

Most components accept a `style` prop — an object of visual properties, similar to
React inline styling. Animation-related options like `transition` are dedicated
props, not part of `style`. Supported style fields differ per component (despite
some names overlapping React Native) — check the specific component file. Shared
style/prop types are documented alongside the components.

## Shaders

Shaders are small GPU programs. **All** built-in Smelter transformations are
implemented with them, and you can supply your own for custom effects via the
`Shader` component (`./components`) and the registered `shader` resource
(`./resources/shader.md`).

Shaders are written in **WGSL** (Smelter is built on `wgpu`/WebGPU). Smelter uses
two types:

- **Vertex shaders** — manipulate vertex geometry. Videos are represented as two
  triangles filling the clip space `[-1, 1] × [-1, 1]`; each input texture gets its
  own rectangle. Most users won't write custom vertex shaders — layouts already
  handle positioning/resizing/cropping. A standard pass-through vertex shader covers
  most single-video transforms.
- **Fragment shaders** — compute the color of each output pixel. One instance runs
  per output pixel and must return a `vec4<f32>` (RGBA, each component `0.0`–`1.0`).
  The `Shader` component's children are exposed as textures sampled with
  `textureSample(texture, sampler_, coords)`.

Every user shader must include this header:

```wgsl
enable wgpu_binding_array;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) tex_coords: vec2<f32>,
}

struct BaseShaderParameters {
  plane_id: i32,
  time: f32,
  output_resolution: vec2<u32>,
  texture_count: u32,
}

@group(0) @binding(0) var textures: binding_array<texture_2d<f32>, 16>;
@group(2) @binding(0) var sampler_: sampler;

var<immediate> base_params: BaseShaderParameters;
```

Notes:

- `base_params.plane_id` is the index of the currently rendered plane (texture);
  `-1` when there are no input textures (a single rectangle is passed — useful for
  shaders that generate content in the fragment stage).
- **Custom parameters**: define a WGSL struct and bind it at
  `@group(1) @binding(0) var<uniform> custom_name: CustomStruct;`. Supply its value
  through the shader node's `shader_params` field.
- **Entry points**: vertex `fn vs_main(input: VertexInput) -> A`; fragment
  `fn fs_main(input: A) -> @location(0) vec4<f32>`, where `A` is the vertex output
  type.

Example fragment shader (negative/invert effect):

```wgsl
@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let color = textureSample(textures[0], sampler_, input.tex_coords);
  return vec4(vec3(1.0) - color, 1.0);
}
```

## Choosing a runtime

The SDK ships as three packages. The choice comes down to *where the React layout
code runs* and *where media is processed*.

### Node.js — `@swmansion/smelter-node`

React runs in a Node.js process; rendering/encoding happens in a separate native
Smelter server. On each React state change the SDK sends the scene update to the
server over HTTP. By default the SDK **downloads and launches the server locally**;
you can also point it at a server you deploy yourself. See `./runtimes/nodejs.md`.

- Most secure default — the Smelter API is never exposed to end users.
- You must use React for the *layout* (independent of your app's frontend framework).
- Only one process can manage a given Smelter instance.
- Node.js and the server don't have to be co-located, but co-locating is recommended
  for reliability and simplicity. This is the recommended starting point.

### Browser (Client) — `@swmansion/smelter-web-client`

React runs **in the browser** and controls a Smelter server deployed elsewhere
(there's no way to start a server from the browser, so you must supply a connection
URL). Scene updates are sent over HTTP from the client.

- Bigger security surface: the browser talks directly to the Smelter API. A user
  could submit shader code that crashes the GPU, or (if web rendering is enabled)
  escape the Chromium sandbox. **Isolate** such Smelter instances from the rest of
  your infrastructure.
- If the user closes the tab, the server stops getting updates — fine for
  event-driven layout changes, but timers/periodic animations stop (streams keep
  playing).
- A backgrounded tab can be throttled by the browser.

### Browser (WASM) — `@swmansion/smelter-web-wasm`

The **entire engine runs in the browser**, compiled to WebAssembly in a Web Worker —
no separate server. React state changes are posted to that worker. This is the only
way to run Smelter fully client-side.

- React still runs on the main thread, so it can be throttled when backgrounded
  (rendering itself is in the worker).
- Chromium-based browsers only for now (Firefox/Safari in progress).
- GPU work is translated to WebGL — far faster than CPU-only server rendering, but
  significantly slower than the native server.
- Supported input/output protocols are limited compared to Node.js.

### Standalone server (no SDK)

Deploy the Smelter binary/Docker image and drive it directly over the HTTP API in
any language. Most flexible (multiple coordinated sources can update one instance),
but you lose type-checking/completion and work with raw JSON. Out of scope for the
TypeScript SDK; mentioned for completeness.

## Package landscape at a glance

| Package | Runtime | Engine location |
|---|---|---|
| `@swmansion/smelter-node` | Node.js | Native server (local by default, or remote) |
| `@swmansion/smelter-web-client` | Browser | Remote native server |
| `@swmansion/smelter-web-wasm` | Browser | WASM module in a Web Worker |
| `@swmansion/smelter` | — | Shared components/types (peer of the above) |
</content>
</invoke>
