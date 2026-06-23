# Events

Smelter uses a WebSocket connection to send events to connected clients. Connect by opening a WebSocket to the server's `GET /ws` endpoint (see `routes.md`). Each message is a JSON object with a `type` field identifying the event. The supported events are listed below.

## `VIDEO_INPUT_DELIVERED`

```tsx
type Event = {
  type: "VIDEO_INPUT_DELIVERED";
  input_id: string;
}
```

Smelter received the input and the first frames are ready to be used. To ensure some inputs are ready before sending the [start request](routes.md#start-request), wait for these events for the specific inputs.

- `input_id` — ID of the input.

## `VIDEO_INPUT_PLAYING`

```tsx
type Event = {
  type: "VIDEO_INPUT_PLAYING";
  input_id: string;
}
```

Smelter received the input and is using the first frame for rendering. This event is not sent before the [start request](routes.md#start-request).

Usually sent at the same time as `VIDEO_INPUT_DELIVERED`, except for two cases:
- Before the start request.
- If the input has the `offset_ms` field defined.

- `input_id` — ID of the input.

## `VIDEO_INPUT_PAUSED`

```tsx
type Event = {
  type: "VIDEO_INPUT_PAUSED";
  input_id: string;
}
```

The input stream stopped delivering frames and rendering on that input was paused. Smelter keeps rendering the last frame until the input resumes or is unregistered. After the stream resumes, a new `VIDEO_INPUT_PLAYING` event is emitted.

- `input_id` — ID of the input.

## `VIDEO_INPUT_EOS`

```tsx
type Event = {
  type: "VIDEO_INPUT_EOS";
  input_id: string;
}
```

The input stream has ended and all frames were already processed. Not emitted on input unregister (see `routes.md`).

- `input_id` — ID of the input.

## `AUDIO_INPUT_DELIVERED`

```tsx
type Event = {
  type: "AUDIO_INPUT_DELIVERED";
  input_id: string;
}
```

Smelter received the input and the first audio samples are ready to be used. To ensure some inputs are ready before sending the [start request](routes.md#start-request), wait for these events for the specific inputs.

- `input_id` — ID of the input.

## `AUDIO_INPUT_PLAYING`

```tsx
type Event = {
  type: "AUDIO_INPUT_PLAYING";
  input_id: string;
}
```

Smelter received the input and is using the first samples for rendering. This event is not sent before the [start request](routes.md#start-request).

Usually sent at the same time as `AUDIO_INPUT_DELIVERED`, except for two cases:
- Before the start request.
- If the input has the `offset_ms` field defined.

- `input_id` — ID of the input.

## `AUDIO_INPUT_PAUSED`

```tsx
type Event = {
  type: "AUDIO_INPUT_PAUSED";
  input_id: string;
}
```

The input stream stopped delivering audio samples and mixing of that input was paused. After the stream resumes, a new `AUDIO_INPUT_PLAYING` event is emitted.

- `input_id` — ID of the input.

## `AUDIO_INPUT_EOS`

```tsx
type Event = {
  type: "AUDIO_INPUT_EOS";
  input_id: string;
}
```

The input stream has ended and all audio samples were already processed. Not emitted on input unregister (see `routes.md`).

- `input_id` — ID of the input.

## `OUTPUT_DONE`

```tsx
type Event = {
  type: "OUTPUT_DONE",
  output_id: string
}
```

The output has ended. All video frames and audio samples were sent/written.

- `output_id` — ID of the output.

## `OUTPUT_ERROR`

```tsx
type Event = {
  type: "OUTPUT_ERROR",
  output_id: string,
  severity: "critical" | "transient" | "warning",
  err: string,
  stack: string,
}
```

A runtime error occurred on an output.

- `output_id` — ID of the output.
- `err` — Error message.
- `stack` — Error stack trace.
- `severity` — Error severity, one of:
  - `"critical"` — unrecoverable failure; the output has fully stopped or disconnected.
  - `"transient"` — a user-facing issue (e.g. artifacts or dropped frames) from which the output is expected to recover automatically.
  - `"warning"` — incorrect behavior that should be investigated but did not cause any user-facing effects.
