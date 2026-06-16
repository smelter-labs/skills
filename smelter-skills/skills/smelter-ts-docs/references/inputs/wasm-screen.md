# Screen capture input (Web API)

Captures screen output and audio using the Web API `getDisplayMedia()`.

**Availability:** Browser (WASM)

## Usage

```tsx
import Smelter from "@swmansion/smelter-web-wasm";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", { type: "screen_capture" });
```

## Type

```tsx
type RegisterScreenCaptureInput = {
  type: "screen_capture";
};
```

No additional properties.
