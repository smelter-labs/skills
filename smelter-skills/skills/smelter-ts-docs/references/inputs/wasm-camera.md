# Camera input (Web API)

Captures camera and microphone output using the Web API `getUserMedia()`.

**Availability:** Browser (WASM)

## Usage

```tsx
import Smelter from "@swmansion/smelter-web-wasm";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", { type: "camera" });
```

## Type

```tsx
type RegisterCameraInput = {
  type: "camera";
};
```

No additional properties.
