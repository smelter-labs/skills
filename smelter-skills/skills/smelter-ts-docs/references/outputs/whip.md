# WHIP client output

Connects to a WHIP server endpoint and streams composed video and audio to it.

**Availability:** Node.js, Browser (Client)

> Note: this is the server-side (`@swmansion/smelter-node` / client) WHIP output. The WASM browser variant has a different, simpler shape — see `wasm-whip.md`.

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";
import { View } from "@swmansion/smelter";

const smelter = new Smelter();
await smelter.init();
await smelter.registerOutput("example", <View />, {
  type: "whip_client",
  endpointUrl: "https://example.com/whip",
  bearerToken: "<TOKEN>",
  video: {
    encoderPreferences: [{ type: "ffmpeg_h264" }, { type: "any" }],
    resolution: { width: 1920, height: 1080 },
  },
  audio: true,
});
```

## Type

```tsx
type RegisterWhipClientOutput = {
  type: "whip_client";
  endpointUrl: string;
  bearerToken?: string;
  video?: VideoOptions;
  audio?: true | AudioOptions;
};

type VideoOptions = {
  resolution: { width: number; height: number };
  sendEosWhen?: OutputEndCondition;
  encoderPreferences?: VideoEncoderOptions[];
  // each: { type: "ffmpeg_h264" } | { type: "ffmpeg_vp8" } | { type: "ffmpeg_vp9" }
  //       | { type: "vulkan_h264" } | { type: "any" }
};

type AudioOptions = {
  channels?: "mono" | "stereo";
  mixingStrategy?: "sum_clip" | "sum_scale";
  sendEosWhen?: OutputEndCondition;
  encoderPreferences?: AudioEncoderOptions[];
  // each: { type: "opus" } | { type: "any" }
};

type OutputEndCondition =
  | { anyOf: string[] }
  | { allOf: string[] }
  | { anyInput: boolean }
  | { allInputs: boolean };
```

## Properties

### endpointUrl
Destination WHIP URL for sending media.
- **Type:** `string`

---

### bearerToken
Authentication token for the WHIP endpoint.
- **Type:** `string`

---

### video
Video track configuration. See [VideoOptions](#videooptions).
- **Type:** `VideoOptions`

---

### audio
Audio configuration. When `true`, audio is enabled with options set automatically based on negotiation; otherwise pass `AudioOptions`.
- **Type:** `true | AudioOptions`

## VideoOptions

- **resolution** — `{ width: number; height: number }`. Output resolution in pixels.
- **sendEosWhen** — `OutputEndCondition`. When to terminate based on input stream states (EOS sent per track if both audio and video present).
- **encoderPreferences** — `VideoEncoderOptions[]`. Default `[{ type: "any" }]`. Ordered list of preferred encoders; first has highest priority during WHIP negotiation. If the list ends with `{ type: "any" }`, Smelter tries the listed encoders in order and falls back to any other supported negotiated codec if none match. If `"any"` is absent, only the listed encoders are considered and no fallback occurs. See [Video encoder options](#video-encoder-options).

## AudioOptions

- **channels** — `"mono" | "stereo"`. Default `"stereo"`.
- **mixingStrategy** — `"sum_clip" | "sum_scale"`. Default `"sum_clip"`. `sum_clip`: sum then clip to i16 PCM range. `sum_scale`: sum then scale down to fit i16 PCM range.
- **sendEosWhen** — `OutputEndCondition`.
- **encoderPreferences** — `AudioEncoderOptions[]`. Default `[{ type: "any" }]`. Same negotiation/fallback behavior as video. See [Audio encoder options](#audio-encoder-options).

## OutputEndCondition

Defines when the output stream ends based on input stream states. Set exactly one field. By default an input is considered ended when its TCP connection drops/closes, an RTCP BYE is received, an MP4 track ends, or the input was already/never registered.

- **anyOf** — `string[]`. Terminate when any input in the list finishes.
- **allOf** — `string[]`. Terminate when all inputs in the list finish.
- **anyInput** — `boolean`. Terminate when any input ends (incl. inputs added after registration); does not terminate if no inputs were ever connected.
- **allInputs** — `boolean`. Terminate when all inputs finish; terminates if no inputs were ever connected.

## Video encoder options

Each entry of `video.encoderPreferences` is one of the following, or `{ type: "any" }` (any supported negotiated codec). See the encoder file for the full option list:

- `{ type: "ffmpeg_h264" }` — software H.264. See `outputs/encoders/ffmpeg-h264.md`.
- `{ type: "ffmpeg_vp8" }` — software VP8. See `outputs/encoders/ffmpeg-vp8.md`.
- `{ type: "ffmpeg_vp9" }` — software VP9. See `outputs/encoders/ffmpeg-vp9.md`.
- `{ type: "vulkan_h264" }` — hardware H.264, requires the `gpu-video` build. See `outputs/encoders/vulkan-h264.md`.

## Audio encoder options

Each entry of `audio.encoderPreferences` is `{ type: "opus" }` or `{ type: "any" }` (any supported negotiated codec).

- `{ type: "opus" }` — see `outputs/encoders/opus.md`.
