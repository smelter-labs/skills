# MP4

An output type that saves video and audio from Smelter to an MP4 file. Register it before use; see `routes.md` for output management.

## Usage

```http
POST: /api/output/:output_id/register
Content-Type: application/json

{
  "type": "mp4",
  "path": "/path/to/file.mp4",
  "video": {
    "resolution": { "width": 1280, "height": 720 },
    "encoder": { "type": "ffmpeg_h264" },
    "initial": {
      "root": { "type": "view" }
    }
  },
  "audio": {
    "encoder": { "type": "aac" },
    "channels": "stereo",
    "initial": {
      "inputs": [{ "input_id": "input_1", "volume": 1 }]
    }
  }
}
```

## Type

```tsx
type Mp4Output = {
  type: "mp4";
  path: string;
  video?: VideoOptions;
  audio?: AudioOptions;
  ffmpeg_options?: Map<string, string>;
};
```

## Properties

### path
Path to output MP4 file.

- **Type**: `string`

---

### video
Video track configuration.

- **Type**: `VideoOptions`

---

### audio
Audio track configuration.

- **Type**: `AudioOptions`

---

### ffmpeg_options
Raw FFmpeg muxer options. For codec-specific options see `ffmpeg_options` in the encoder option types.

- **Type**: `Map<string, string>`

## VideoOptions

```tsx
type VideoOptions = {
  resolution: {
    width: u32;
    height: u32;
  };
  send_eos_when?: OutputEndCondition;
  encoder: VideoEncoderOptions;
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

### encoder
Video encoder options.

- **Type**: `VideoEncoderOptions`

---

### initial
Root of a component tree/scene that should be rendered for the output. Use the `update_output` request (see `routes.md`) to update this value after registration.

- **Type**: `{ root: Component; }`

## VideoEncoderOptions

```tsx
type VideoEncoderOptions =
  | ({ type: "ffmpeg_h264"; } & FfmpegH264EncoderOptions)
  | ({ type: "vulkan_h264"; } & VulkanH264EncoderOptions);
```

Configuration for the video encoder, based on the selected codec. Available `type` values and their option fields:

- `ffmpeg_h264` — see `outputs/encoders/ffmpeg-h264.md`
- `vulkan_h264` — see `outputs/encoders/vulkan-h264.md` (requires the `gpu-video` build feature)

## AudioOptions

```tsx
type AudioOptions = {
  mixing_strategy?: "sum_clip" | "sum_scale";
  send_eos_when?: OutputEndCondition;
  encoder: AudioEncoderOptions;
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

### encoder
Audio encoder options.

- **Type**: `AudioEncoderOptions`

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
  | ({ type: "aac"; } & AacEncoderOptions);
```

Configuration for the audio encoder. Available `type` values and their option fields:

- `aac` — see `outputs/encoders/aac.md`

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

Defines when the end of an input stream should trigger the end of the output stream. Only one of these fields can be set at a time. Unless specified otherwise, an input stream is considered finished/ended when:
- TCP connection was dropped/closed.
- RTCP Goodbye packet (`BYE`) was received.
- MP4 track has ended.
- Input was unregistered already (or never registered).

```tsx
type OutputEndCondition = {
  any_of?: string[];
  all_of?: string[];
  any_input?: bool;
  all_inputs?: bool;
};
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
