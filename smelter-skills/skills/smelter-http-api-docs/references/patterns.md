# Patterns & recipes

How to drive a working Smelter composition over the HTTP API. Each recipe is a sequence of
requests you can adapt. For per-component fields see `components/*.md`, per-input/output
config see `inputs/*.md` / `outputs/*.md`, encoders see `outputs/encoders/*.md`, and the
layout sizing model see `overview.md`.

All requests are `POST` with `Content-Type: application/json` unless noted. The default API
port is `8081` (`routes.md`).

## Basic flow

The order is always: **start the server → register an output (with an initial scene) →
`POST /api/start` → register inputs → update the output's scene to show them.** `start`
makes every registered output begin producing frames; all timestamps/offsets are relative
to it.

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
  "audio": {
    "channels": "stereo",
    "encoder": { "type": "aac" },
    "initial": { "inputs": [] }
  }
}
```

```http
POST: /api/start
Content-Type: application/json

{}
```

This produces a blank `View`. Other output protocols are just a different `type` +
options: `rtp_stream`, `whip_client`, `whep_server`, `hls`, `mp4` (see `outputs/*.md`).

> ⚠️ **Caution:** For `mp4` output you must send `POST /api/output/:id/unregister` to flush
> the file metadata — killing the process leaves a corrupt file.

Then register inputs (they don't appear until referenced in the scene):

```http
POST: /api/input/input_1/register
Content-Type: application/json

{ "type": "mp4", "url": "https://example.com/input1.mp4" }
```

## Show a single input (and why you usually need Rescaler)

A bare `input_stream` is drawn at its native resolution — a 1920×1080 source on a 1280×720
output shows only a cropped portion, no auto-rescale. To fit it to a region, wrap it in a
`rescaler`:

```http
POST: /api/output/output_1/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "rescaler",
      "child": { "type": "input_stream", "input_id": "input_1" }
    }
  },
  "audio": { "inputs": [{ "input_id": "input_1", "volume": 0.9 }] }
}
```

`rescaler` (the only static child of the root) takes the full output size and scales the
input to fit, preserving aspect ratio (letterboxed). Use `"mode": "fill"` to cover the area
instead. Audio is mixed separately via `audio.inputs`, not the component tree.

## Side-by-side / split — View

`view` lays static children out in a row (default) or column, splitting space equally:

```json
{
  "type": "view",
  "background_color": "#4d4d4dff",
  "children": [
    { "type": "rescaler", "child": { "type": "input_stream", "input_id": "input_1" } },
    { "type": "rescaler", "child": { "type": "input_stream", "input_id": "input_2" } }
  ]
}
```

Two children of a 1280×720 root each get 640×720. Add `"direction": "column"` to stack
vertically.

## Grid / video-call layout — Tiles

`tiles` packs N children into the most space-efficient grid automatically — the default
choice for showing several inputs at once:

```json
{
  "type": "tiles",
  "background_color": "#4d4d4dff",
  "children": [
    { "type": "input_stream", "input_id": "input_1" },
    { "type": "input_stream", "input_id": "input_2" },
    { "type": "input_stream", "input_id": "input_3" }
  ]
}
```

Tune with `tile_aspect_ratio` (e.g. `"16:9"`), `margin`, `padding`, `horizontal_align`,
`vertical_align`. `tiles` does not support absolute positioning of children.

## Picture-in-picture / corner overlay

Give the overlay an explicit size plus absolute positioning. Absolutely positioned children
render on top and don't affect static siblings:

```json
{
  "type": "view",
  "children": [
    { "type": "rescaler", "child": { "type": "input_stream", "input_id": "input_1" } },
    {
      "type": "rescaler",
      "width": 320, "height": 180, "top": 20, "right": 20,
      "child": { "type": "input_stream", "input_id": "input_2" }
    }
  ]
}
```

## Lower-third / text-over-video overlay

An absolutely positioned child `view` floating over the video, with a semi-transparent
background (8-digit hex, `#RRGGBBAA`):

```json
{
  "type": "view",
  "children": [
    { "type": "rescaler", "child": { "type": "input_stream", "input_id": "input_1" } },
    {
      "type": "view",
      "height": 80, "bottom": 40, "left": 60, "right": 60,
      "background_color": "#00000080", "padding": 16,
      "children": [
        { "type": "text", "text": "Jane Doe — Host", "font_size": 36, "color": "#FFFFFFFF" }
      ]
    }
  ]
}
```

## Transitions / animation

Send an `update` request whose scene changes a field, and set `transition` on the component
that should animate. The component must keep the same `id` across the two scenes:

```json
{
  "video": {
    "root": {
      "type": "view",
      "children": [
        {
          "type": "rescaler",
          "id": "main",
          "width": 1280,
          "transition": { "duration_ms": 2000, "easing_function": { "function_name": "bounce" } },
          "child": { "type": "input_stream", "input_id": "input_1" }
        }
      ]
    }
  }
}
```

Only some fields animate (`width`/`height` within the same positioning mode;
`top`/`bottom`/`left`/`right`/`rotation` when the same field changes). Easing options:
`linear` (default), `bounce`, or `{ "function_name": "cubic_bezier", "points": [x1,y1,x2,y2] }`.

## Dynamic composition at runtime

The scene is fully re-settable. Register/unregister inputs and send `update` requests while
running — no need to re-register the output:

```http
POST: /api/input/input_3/register
Content-Type: application/json

{ "type": "mp4", "url": "https://example.com/input3.mp4" }
```

Then `update` the output's `video.root` to include `input_3`, and later
`POST /api/input/input_3/unregister`. Mutating requests (`update`, `unregister`) accept a
`schedule_time_ms` to apply the change at a specific stream timestamp (`0` = the start
request).

## Audio mixing

Audio is independent of the visual tree. List the inputs to mix in the output's
`audio.inputs`, each with an optional `volume` in `[0, 2]`:

```json
{ "audio": { "inputs": [
  { "input_id": "input_1", "volume": 0.9 },
  { "input_id": "input_2" }
] } }
```

Mixing strategy (`sum_clip` / `sum_scale`) and channel layout are set on the output's
`audio` config at registration (see `outputs/*.md`).

## Web rendering (experimental)

Requires a server build with web rendering and `SMELTER_WEB_RENDERER_ENABLE=true`. Register
a web-renderer resource, then reference it from a `web_view` component:

```http
POST: /api/web-renderer/example_website/register
Content-Type: application/json

{
  "url": "https://example.com",
  "resolution": { "width": 1920, "height": 1080 },
  "embedding_method": "native_embedding_over_content"
}
```

```json
{ "type": "web_view", "instance_id": "example_website" }
```

Only one `web_view` may use a given renderer instance at a time. See
`resources/web-renderer.md` and `components/web-view.md`.
