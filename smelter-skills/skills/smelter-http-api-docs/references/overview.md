# Concepts & model

The deeper conceptual model behind the HTTP API. The essentials are in `SKILL.md`; open
this when you need the layout sizing rules (the non-obvious part — read before non-trivial
layout work), the live-vs-offline model, the glossary, or the shader concept.

## The scene / component model

A **scene** is a component tree assigned to a Smelter output. It starts with a single
**root** component and includes all of its children. The scene is set in two places:

- when registering an output, via `video.initial.root` (and `audio.initial.inputs`);
- afterwards, via the `POST /api/output/:output_id/update` request (`video.root` /
  `audio.inputs`). See `routes.md`.

Every component is a JSON object with a `type` discriminant (`"view"`, `"tiles"`,
`"rescaler"`, `"text"`, `"image"`, `"input_stream"`, `"shader"`, `"web_view"`). Components
divide into two groups:

- **Layout components** (`View`, `Tiles`, `Rescaler`) — position and size their children.
- **Non-layout components** (`Image`, `Text`, `InputStream`, and the special `Shader` /
  `WebView` which *do* take children) — render something concrete.

To show a registered input you place an `input_stream` component (`{ "type":
"input_stream", "input_id": "..." }`) somewhere in the tree. Audio is separate from the
visual tree: it's mixed via `audio.inputs` on the output, not via components.

## Layout sizing rules (the foundation for every layout)

Size resolution for layout components (`View`, `Tiles`, `Rescaler`):

| Placement | Size |
|---|---|
| Root of the component tree | Based on the output stream's declared resolution. |
| Child of a **non-layout** component (`Shader`, `WebView`) | **Must** be set explicitly (`width`/`height`). |
| **Statically** positioned child of a layout component | Based on the area the parent gives it, unless explicitly sized. |
| **Absolutely** positioned child of a layout component | Same size as the parent, unless explicitly sized. |

Explicit `width`/`height` always win. Practical consequences:
- Don't size the root component — the output resolution already defines it.
- When nesting layouts, you usually set only `width` *or* `height`, or nothing.
- A child of `Shader`/`WebView` always needs an explicit size.

### Absolute vs static positioning

A component becomes **absolutely positioned** when it sets any of `top` / `bottom` /
`left` / `right` / `rotation` (distances in pixels from the parent's corresponding edge;
rotation in degrees). An absolutely positioned component ignores its parent's normal
layout and is drawn on top, not affecting sibling layout.

Only **layout** components respect these values on their children — but a non-layout
component can carry them too (to position *itself* within a layout parent). Statically
positioned children (no absolute fields) are laid out next to each other along the parent's
`direction`.

> ⚠️ **Caution:** A `View` does not auto-expand to fit its children, and rotation of
> complex elements is not fully supported yet.

## Live vs offline processing

- **Live processing** — any real-time input or output is involved. Processing is
  synchronized to the wall clock: a 1-second segment takes ~1 second to produce.
- **Offline processing** — only non-real-time inputs/outputs (e.g. combining MP4 files).
  Processing runs as fast as the hardware allows, decoupled from real time. Enable the
  server's offline behavior with `SMELTER_OFFLINE_PROCESSING_ENABLE=true` (see
  `deployment.md`).

**Timestamps** are in milliseconds, measured from the queue start, in *stream* time (not
wall-clock). Example: converting a 5-minute MP4 might take 2 minutes of real time, but the
final timestamp is 5 minutes.

**Input offset** is the timestamp at which a stream starts relative to queue start; if
unset it's derived from the arrival time of the first packet. An input marked **required**
forces Smelter to block until data for the current timestamp is available — in general all
inputs should be required for offline processing and none for live, with rare exceptions.

## Inputs, outputs, resources

All three must be **registered** before use (see `routes.md`):
- **Input** — a source of frames/samples (RTP stream, MP4 file, camera, …). Referenced in
  a scene with an `input_stream` component and mixed via `audio.inputs`.
- **Output** — a destination for generated frames (RTP stream, MP4 file, WHIP, …). Each
  output owns a scene.
- **Resource** — something that is neither an input nor an output but is needed by a
  component: a registered `image`, `shader` source, `web-renderer` instance, or `font`.

## Shaders (WGSL)

Smelter renders on `wgpu`, so custom shaders are written in **WGSL**. Built-in
transformations are themselves shaders; you register your own with a `shader` resource
(`resources/shader.md`) and use it via the `Shader` component (`components/shader.md`),
whose children are exposed to the shader as textures.

Two shader stages: a **vertex** shader (videos are two triangles spanning clip space
`[-1,1]×[-1,1]`; rarely customized) and a **fragment** shader (runs per output pixel,
returns an RGBA `vec4<f32>` with each channel in `[0,1]`).

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

- Sample a child texture with `textureSample(textures[i], sampler_, tex_coords)`.
- `plane_id` is `-1` when there are no input textures (a single rectangle is passed —
  useful for generative shaders).
- Custom uniforms bind at `@group(1) @binding(0) var<uniform> name: T;` and are supplied
  via the component's `shader_param` field.
- Entry points must be `@vertex fn vs_main(input: VertexInput) -> A` and
  `@fragment fn fs_main(input: A) -> @location(0) vec4<f32>`.
