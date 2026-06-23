# Routes

The central HTTP reference for driving a Smelter server. The API is served by default on port **8081**; a different port can be configured via the `SMELTER_API_PORT` environment variable.

All request bodies are JSON (`Content-Type: application/json`) unless noted otherwise. Field names are snake_case and types use Rust-flavored spelling (`f32`, `f64`, `bool`, `string`, etc.).

Many requests accept a `schedule_time_ms` field. It is the time in milliseconds when the request should be applied. The value `0` represents the time of [the start request](#start-request).

## Start request

```http
POST: /api/start
Content-Type: application/json
```

```tsx
type RequestBody = {}
```

Starts the processing pipeline.

If an output was registered before the start request, then the actual output stream will start producing video/audio after this request.

## Reset request

```http
POST: /api/reset
Content-Type: application/json
```

```tsx
type RequestBody = {}
```

Resets the Smelter state to the initial configuration. Removes all inputs, outputs, and registered resources.

---

## Outputs configuration

### Register output

```http
POST: /api/output/:output_id/register
Content-Type: application/json
```

```tsx
type RequestBody = {
  type: "rtp_stream" | "mp4" | "whep_server" | "whip_client" | "rtmp_client"
  ... // output specific options
}
```

Register an external destination that can be used as a Smelter output. The body is output-specific — see the relevant output reference:

- RTP — `outputs/rtp.md`
- MP4 — `outputs/mp4.md`
- WHEP — `outputs/whep.md`
- WHIP — `outputs/whip.md`
- RTMP — `outputs/rtmp.md`

### Unregister output

```http
POST: /api/output/:output_id/unregister
Content-Type: application/json
```

```tsx
type RequestBody = {
  schedule_time_ms?: number;
}
```

Unregister a previously registered output with id `:output_id`.

- `schedule_time_ms` — Time in milliseconds when this request should be applied. Value `0` represents the time of [the start request](#start-request).

### Update output

```http
POST: /api/output/:output_id/update
Content-Type: application/json
```

```tsx
type RequestBody = {
  video?: {
    root: Component
  };
  audio?: {
    inputs: AudioInput[];
  };
  schedule_time_ms?: number;
}

type AudioInput = {
  input_id: InputId;
  volume?: number;
}
```

Update the scene definition and audio mixer configuration for the output with ID `:output_id`. The output must be registered first (see [register output](#register-output)).

- `video` — Configuration for video output.
- `video.root` — Root of a component tree/scene that should be rendered for the output. See the `components/*.md` references for available components.
- `audio` — Configuration for audio output.
- `audio.inputs` — Input streams that should be mixed together and their configuration.
- `audio.inputs[].input_id` — Input ID.
- `audio.inputs[].volume` — (default `1.0`) Float in the `[0, 2]` range representing volume.
- `schedule_time_ms` — Time in milliseconds when this request should be applied. Value `0` represents the time of [the start request](#start-request).

---

### Request keyframe

```http
POST: /api/output/:output_id/request_keyframe
Content-Type: application/json
```

```tsx
type RequestBody = {}
```

Requests an additional keyframe (I frame) on the video output.

## Inputs configuration

### Register input

```http
POST: /api/input/:input_id/register
Content-Type: application/json
```

```tsx
type RequestBody = {
  type: "rtp_stream" | "mp4" | "decklink" | "whip_server" | "whep_client" | "rtmp_server";
  ... // input specific options
}
```

Register an external source that can be used as a Smelter input. The body is input-specific — see the relevant input reference:

- RTP — `inputs/rtp.md`
- MP4 — `inputs/mp4.md`
- DeckLink — `inputs/decklink.md`
- WHEP — `inputs/whep.md`
- WHIP — `inputs/whip.md`
- RTMP — `inputs/rtmp.md`

### Unregister input

```http
POST: /api/input/:input_id/unregister
Content-Type: application/json
```

```tsx
type RequestBody = {
  schedule_time_ms?: number;
}
```

Unregister a previously registered input with id `:input_id`.

- `schedule_time_ms` — Time in milliseconds when this request should be applied. Value `0` represents the time of [the start request](#start-request).

### Update input

```http
POST: /api/input/:input_id/update
Content-Type: application/json
```

```tsx
type RequestBody = {
  pause?: bool;
  seek_ms?: f64;
}
```

Pause, resume, or seek a previously registered input.

- `pause` — When set to `true`, the input stops delivering frames/samples; rendering keeps the last frame and audio mixing skips this input until resumed. Setting to `false` resumes the input. Only supported for MP4 inputs (`inputs/mp4.md`).
- `seek_ms` — Seek to a specific position in milliseconds. Only supported for MP4 inputs (`inputs/mp4.md`).

Pausing and resuming emit `VIDEO_INPUT_PAUSED`/`AUDIO_INPUT_PAUSED` and then a new `VIDEO_INPUT_PLAYING`/`AUDIO_INPUT_PLAYING` WebSocket event (see `events.md`).

---

## Resources configuration

### Register image

```http
POST: /api/image/:image_id/register
Content-Type: application/json
```

Register an image asset. The request body is defined in `resources/image.md`.

### Unregister image

```http
POST: /api/image/:image_id/unregister
Content-Type: application/json
```

```tsx
type RequestBody = {
  schedule_time_ms?: number;
}
```

Unregister a previously registered image asset with id `:image_id`.

- `schedule_time_ms` — Time in milliseconds when this request should be applied. Value `0` represents the time of [the start request](#start-request).

### Register shader

```http
POST: /api/shader/:shader_id/register
Content-Type: application/json
```

Register a shader. The request body is defined in `resources/shader.md`.

### Unregister shader

```http
POST: /api/shader/:shader_id/unregister
Content-Type: application/json
```

```tsx
type RequestBody = {
  schedule_time_ms?: number;
}
```

Unregister a previously registered shader with id `:shader_id`.

- `schedule_time_ms` — Time in milliseconds when this request should be applied. Value `0` represents the time of [the start request](#start-request).

### Register web renderer instance

```http
POST: /api/web-renderer/:instance_id/register
Content-Type: application/json
```

Register a web renderer instance. The request body is defined in `resources/web-renderer.md`.

### Unregister web renderer instance

```http
POST: /api/web-renderer/:instance_id/unregister
Content-Type: application/json
```

```tsx
type RequestBody = {
  schedule_time_ms?: number;
}
```

Unregister a previously registered web renderer instance with id `:instance_id`.

- `schedule_time_ms` — Time in milliseconds when this request should be applied. Value `0` represents the time of [the start request](#start-request).

### Register font

```http
POST: /api/font/register
Content-Type: multipart/form-data
```

Upload additional fonts to the Smelter server. The body is a multipart form upload (not JSON). After the request completes, the new fonts can be used with the `Text` component (`components/text.md`).

## Status endpoint

```http
GET: /status
Content-Type: application/json
```

```tsx
type Response = {
  instance_id: string
}
```

Status/health check endpoint. Returns `200 OK`.

- `instance_id` — ID that can be provided via the `SMELTER_INSTANCE_ID` environment variable. Defaults to a random number.

## WebSocket endpoint

```http
GET: /ws
```

Establish a WebSocket connection to listen for Smelter events. The supported events and their payloads are documented in `events.md`.
