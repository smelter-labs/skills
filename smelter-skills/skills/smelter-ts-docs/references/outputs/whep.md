# WHEP server output

Provides a WHEP server endpoint, broadcasting a media stream to multiple clients simultaneously. Complies with the WHEP spec (draft-ietf-wish-whep-02).

**Availability:** Node.js, Browser (Client)

Smelter exposes the WHEP endpoint on port `9000` under `/whep/:output_id` (configurable via the `SMELTER_WHIP_WHEP_SERVER_PORT` env var). `registerOutput` returns an object with `endpointRoute` (e.g. `/whep/example`) — use it to establish the WHEP connection.

## Usage

```tsx
import Smelter from "@swmansion/smelter-node";
import { View } from "@swmansion/smelter";

const smelter = new Smelter();
await smelter.init();
const { endpointRoute } = await smelter.registerOutput("example", <View />, {
  type: "whep_server",
  video: {
    encoder: { type: "ffmpeg_h264" },
    resolution: { width: 1920, height: 1080 },
  },
});
// endpointRoute === "/whep/example"
```

## Type

```tsx
type RegisterWhepServerOutput = {
  type: "whep_server";
  bearerToken?: string;
  video?: VideoOptions;
  audio?: AudioOptions;
};

type VideoOptions = {
  resolution: { width: number; height: number };
  sendEosWhen?: OutputEndCondition;
  encoder: VideoEncoderOptions;
  // { type: "ffmpeg_h264" } | { type: "ffmpeg_vp8" } | { type: "ffmpeg_vp9" } | { type: "vulkan_h264" }
};

type AudioOptions = {
  channels?: "mono" | "stereo";
  mixingStrategy?: "sum_clip" | "sum_scale";
  sendEosWhen?: OutputEndCondition;
  encoder: AudioEncoderOptions; // { type: "opus" }
};

type OutputEndCondition =
  | { anyOf: string[] }
  | { allOf: string[] }
  | { anyInput: boolean }
  | { allInputs: boolean };
```

## Properties

### bearerToken
Authentication token. If omitted, no authentication is required.
- **Type:** `string`

---

### video
Video track configuration. See [VideoOptions](#videooptions).
- **Type:** `VideoOptions`

---

### audio
Audio track configuration. See [AudioOptions](#audiooptions).
- **Type:** `AudioOptions`

## VideoOptions

- **resolution** — `{ width: number; height: number }`. Output resolution in pixels.
- **sendEosWhen** — `OutputEndCondition`. When to terminate based on input stream states (EOS sent per track if both audio and video present).
- **encoder** — `VideoEncoderOptions`. Required. See [Video encoder options](#video-encoder-options).

## AudioOptions

- **channels** — `"mono" | "stereo"`. Default `"stereo"`.
- **mixingStrategy** — `"sum_clip" | "sum_scale"`. Default `"sum_clip"`. `sum_clip`: sum then clip to i16 PCM range. `sum_scale`: sum then scale down to fit i16 PCM range.
- **sendEosWhen** — `OutputEndCondition`.
- **encoder** — `AudioEncoderOptions`. Required. See [Audio encoder options](#audio-encoder-options).

## OutputEndCondition

Defines when the output stream ends based on input stream states. Set exactly one field. By default an input is considered ended when its TCP connection drops/closes, an RTCP BYE is received, an MP4 track ends, or the input was already/never registered.

- **anyOf** — `string[]`. Terminate when any input in the list finishes.
- **allOf** — `string[]`. Terminate when all inputs in the list finish.
- **anyInput** — `boolean`. Terminate when any input ends (incl. inputs added after registration); does not terminate if no inputs were ever connected.
- **allInputs** — `boolean`. Terminate when all inputs finish; terminates if no inputs were ever connected.

## Video encoder options

`video.encoder` is one of (see the encoder file for the full option list):

- `{ type: "ffmpeg_h264" }` — software H.264. See `outputs/encoders/ffmpeg-h264.md`.
- `{ type: "ffmpeg_vp8" }` — software VP8. See `outputs/encoders/ffmpeg-vp8.md`.
- `{ type: "ffmpeg_vp9" }` — software VP9. See `outputs/encoders/ffmpeg-vp9.md`.
- `{ type: "vulkan_h264" }` — hardware H.264, requires the `gpu-video` build. See `outputs/encoders/vulkan-h264.md`.

## Audio encoder options

`audio.encoder` is one of:

- `{ type: "opus" }` — see `outputs/encoders/opus.md`.
