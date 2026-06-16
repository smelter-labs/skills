# Canvas output (Web API)

Renders mixed video to an `HTMLCanvasElement` and plays audio in the current browser tab using browser APIs. Used with `@swmansion/smelter-web-wasm`.

**Availability:** Browser (WASM)

## Usage

```tsx
import Smelter from "@swmansion/smelter-web-wasm";
import { View } from "@swmansion/smelter";

const canvas = document.createElement("canvas");
const smelter = new Smelter();
await smelter.init();
await smelter.registerOutput("example", <View />, {
  type: "canvas",
  video: {
    canvas,
    resolution: { width: 1920, height: 1080 },
  },
  audio: true,
});
```

## Type

```tsx
type RegisterCanvasOutput = {
  type: "canvas";
  video?: CanvasOutputVideo;
  audio?: boolean;
};

type CanvasOutputVideo = {
  canvas: HTMLCanvasElement;
  resolution: { width: number; height: number };
};
```

## Properties

### video
Output video parameters. See [CanvasOutputVideo](#canvasoutputvideo).
- **Type:** `CanvasOutputVideo`

---

### audio
If `true`, output audio plays in the browser tab.
- **Type:** `boolean`
- **Default:** `false`

## CanvasOutputVideo

- **canvas** — `HTMLCanvasElement`. Required. Canvas element the video is rendered onto.
- **resolution** — `{ width: number; height: number }`. Output video resolution.

## Encoders

Not applicable. This browser output renders directly to a canvas / tab audio; there are no codec/encoder options to configure.
