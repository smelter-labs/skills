# MediaStream output (Web API)

A generic browser output. `registerOutput` returns a [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) that can be consumed by browser APIs (rendering to a canvas, sending over a WebRTC connection, etc.). Used with `@swmansion/smelter-web-wasm`.

**Availability:** Browser (WASM)

## Usage

```tsx
import Smelter from "@swmansion/smelter-web-wasm";
import { View } from "@swmansion/smelter";

const smelter = new Smelter();
await smelter.init();
const { stream } = await smelter.registerOutput("example", <View />, {
  type: "stream",
  video: {
    resolution: { width: 1920, height: 1080 },
  },
  audio: true,
});
```

## Type

```tsx
type RegisterStreamOutput = {
  type: "stream";
  video?: StreamOutputVideo;
  audio?: boolean;
};

type StreamOutputVideo = {
  resolution: { width: number; height: number };
};
```

## Properties

### video
Parameters of the video track included in the returned `MediaStream`. See [StreamOutputVideo](#streamoutputvideo).
- **Type:** `StreamOutputVideo`

---

### audio
If `true`, the returned `MediaStream` includes an audio track.
- **Type:** `boolean`
- **Default:** `false`

## StreamOutputVideo

- **resolution** — `{ width: number; height: number }`. Output video resolution.

## Encoders

Not applicable. This browser output yields a `MediaStream`; there are no codec/encoder options to configure.
