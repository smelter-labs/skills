# WHIP client

An output that connects to a WHIP server endpoint to stream video and audio to it. Register it before use; see `routes.md` for output management.

Unlike most outputs, WHIP negotiates the codec with the remote endpoint, so video/audio encoders are given as an ordered `encoder_preferences` list (highest priority first) rather than a single `encoder`.

> **Note:** To enable Twitch compatibility, `video.encoder_preferences` must contain only a single `ffmpeg_h264` entry: `"encoder_preferences": [{ "type": "ffmpeg_h264" }]`.

## Usage

```http
POST: /api/output/:output_id/register
Content-Type: application/json

{
  "type": "whip_client",
  "endpoint_url": "https://example.com/whip",
  "bearer_token": "<TOKEN>",
  "video": {
    "resolution": { "width": 1280, "height": 720 },
    "encoder_preferences": [
      { "type": "ffmpeg_h264", "preset": "ultrafast" },
      { "type": "ffmpeg_vp8" },
      { "type": "any" }
    ],
    "initial": {
      "root": { "type": "view" }
    }
  },
  "audio": {
    "channels": "stereo",
    "initial": {
      "inputs": [{ "input_id": "input_1", "volume": 1 }]
    }
  }
}
```

## Type

```tsx
type WhipClient = {
  type: "whip_client";
  endpoint_url: string;
  bearer_token?: string;
  video?: VideoOptions;
  audio?: AudioOptions;
};
```

## Properties

### endpoint_url
The destination URL for sending media streams using WHIP.

- **Type**: `string`

---

### bearer_token
Token used for authentication when connecting to the WHIP endpoint.

- **Type**: `string`

---

### video
Parameters of the video included in the WHIP stream.

- **Type**: `VideoOptions`

---

### audio
Parameters of the audio included in the WHIP stream.

- **Type**: `AudioOptions`

## VideoOptions

```tsx
type VideoOptions = {
  resolution: {
    width: u32;
    height: u32;
  };
  send_eos_when?: OutputEndCondition;
  encoder_preferences?: VideoEncoderOptions[];
  initial: { root: Component; };
};
```

### resolution
Output resolution in pixels.

- **Type**: `{ width: u32; height: u32; }`

---

### send_eos_when
Condition for termination of the output stream based on the input streams states. If the output includes both audio and video streams, then EOS needs to be sent for every type.

- **Type**: `OutputEndCondition`

---

### encoder_preferences
An ordered list of preferred video encoders. The first element has the highest priority during WHIP negotiation.

- **Type**: `VideoEncoderOptions[]`
- **Default value**: `[{ "type": "any" }]`

Behavior:
- If the list ends with `"any"`:
  - Smelter first tries the encoders explicitly listed (in order) and uses the first one that is supported and negotiated in WHIP signaling.
  - If none of the listed encoders are supported, Smelter falls back to any supported codec from the negotiated list that wasn't already in the preferences.
- If `"any"` is not included:
  - Only the encoders listed are considered.
  - If none are supported, no fallback occurs.

---

### initial
Root of a component tree/scene that should be rendered for the output.

- **Type**: `{ root: Component; }`

## VideoEncoderOptions

```tsx
type VideoEncoderOptions =
  | ({ type: "ffmpeg_h264"; } & FfmpegH264EncoderOptions)
  | ({ type: "ffmpeg_vp8"; } & FfmpegVp8EncoderOptions)
  | ({ type: "ffmpeg_vp9"; } & FfmpegVp9EncoderOptions)
  | ({ type: "vulkan_h264"; } & VulkanH264EncoderOptions)
  | { type: "any" };
```

Configuration for the video encoder, based on the selected codec. Available `type` values and their option fields:

- `ffmpeg_h264` — see `outputs/encoders/ffmpeg-h264.md`
- `ffmpeg_vp8` — see `outputs/encoders/ffmpeg-vp8.md`
- `ffmpeg_vp9` — see `outputs/encoders/ffmpeg-vp9.md`
- `vulkan_h264` — see `outputs/encoders/vulkan-h264.md` (requires the `gpu-video` build feature)
- `any` — any video encoder supported by Smelter may be used (used for negotiation/fallback; see `encoder_preferences` behavior).

## AudioOptions

```tsx
type AudioOptions = {
  mixing_strategy?: "sum_clip" | "sum_scale";
  send_eos_when?: OutputEndCondition;
  encoder_preferences?: AudioEncoderOptions[];
  channels?: "mono" | "stereo";
  initial: { inputs: InputAudio[]; };
};
```

### mixing_strategy
Specifies how audio should be mixed.

- **Type**: `"sum_clip" | "sum_scale"`
- **Default value**: `"sum_clip"`
- **Supported values**:
  - `sum_clip` - First, the input samples are summed. If the result exceeds the i16 PCM range, it is clipped.
  - `sum_scale` - First, the input samples are summed. If the result exceeds the i16 PCM range, the summed samples are scaled down by a factor to fit within the range.

---

### send_eos_when
Condition for termination of the output stream based on the input streams states. If the output includes both audio and video streams, then EOS needs to be sent for every type.

- **Type**: `OutputEndCondition`

---

### encoder_preferences
An ordered list of preferred audio encoders. The first element has the highest priority during WHIP negotiation.

- **Type**: `AudioEncoderOptions[]`
- **Default value**: `[{ "type": "any" }]`

Behavior:
- If the list ends with `"any"`:
  - Smelter first tries the encoders explicitly listed (in order) and uses the first one that is supported and negotiated in WHIP signaling.
  - If none of the listed encoders are supported, Smelter falls back to any supported codec from the negotiated list that wasn't already in the preferences.
- If `"any"` is not included:
  - Only the encoders listed are considered.
  - If none are supported, no fallback occurs.

---

### channels
Channels configuration.

- **Type**: `"mono" | "stereo"`
- **Default value**: `"stereo"`
- **Supported values**:
  - `mono` - Mono audio (single channel).
  - `stereo` - Stereo audio (two channels).

---

### initial
Initial audio mixer configuration for output.

- **Type**: `{ inputs: InputAudio[]; }`

## AudioEncoderOptions

```tsx
type AudioEncoderOptions =
  | ({ type: "opus"; } & OpusEncoderOptions)
  | ({ type: "any"; });
```

Configuration for the audio encoder. Available `type` values and their option fields:

- `opus` — see `outputs/encoders/opus.md`
- `any` — any audio encoder supported by Smelter may be used. If `"any"` is not included in `encoder_preferences`, Smelter will only use the encoders explicitly listed.

## InputAudio

```tsx
type InputAudio = {
  input_id: string;
  volume?: f32;
};
```

### input_id
ID of an input. It identifies a stream registered using a register-input request (see `routes.md`).

- **Type**: `string`

---

### volume
Input volume in range `[0, 2]`.

- **Type**: `f32`
- **Default value**: `1.0`
- **Supported values**: `[0, 2]`

## OutputEndCondition

Defines when the output stream should end based on the state of the input streams. Only one of the nested fields can be set at a time. By default, an input stream is considered finished/ended when:
- TCP connection was dropped/closed.
- RTCP Goodbye packet (`BYE`) was received.
- MP4 track has ended.
- Input was unregistered already (or never registered).

```tsx
type OutputEndCondition =
  | { any_of: string[]; }
  | { all_of: string[]; }
  | { any_input: bool; }
  | { all_inputs: bool; };
```

### any_of
List of input streams. The output stream will terminate if any stream in the list finishes.

- **Type**: `string[]`

---

### all_of
List of input streams. The output stream will terminate when all streams in the list finish.

- **Type**: `string[]`

---

### any_input
Terminate the output stream if any input stream ends, including streams added after the output was registered. The output stream will not terminate if no inputs were ever connected.

- **Type**: `bool`

---

### all_inputs
Terminate the output stream only when all input streams have finished. The output stream will terminate if no inputs were ever connected.

- **Type**: `bool`
