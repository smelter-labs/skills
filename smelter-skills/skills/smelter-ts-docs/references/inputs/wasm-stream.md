# MediaStream input (Web API)

A generic browser input that accepts a `MediaStream` object. The stream can be user-generated or captured from browser APIs like camera, screen share, or a WebRTC connection.

**Availability:** Browser (WASM)

## Usage

```tsx
import Smelter from "@swmansion/smelter-web-wasm";

const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true,
});
const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", { type: "stream", stream });
```

## Type

```tsx
type RegisterStreamInput = {
  type: "stream";
  stream: MediaStream;
};
```

## Properties

### stream
The `MediaStream` to use as the input source.
- **Type**: `MediaStream`
