# InputStream

Displays a registered media input. Register the input first with `Smelter.registerInput` using a matching `inputId`.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { InputStream, Rescaler } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <Rescaler>
      <InputStream inputId="example_input" volume={0.5} />
    </Rescaler>
  );
}

// register the input before/after registering the output:
await smelter.registerInput("example_input", {
  type: "mp4",
  serverPath: "./inputExample.mp4",
});
```

## Type

```tsx
type InputStreamProps = {
  id?: string;
  inputId: string;
  volume?: number;
  muted?: boolean;
};
```

## Props

### inputId
ID of an input registered with `Smelter.registerInput`.
- **Type**: `string`

---

### id
Component ID.
- **Type**: `string`
- **Default**: value produced by the `useId` hook

---

### volume
Audio volume, in range `[0, 2]`.
- **Type**: `number`
- **Default**: `1`

---

### muted
Whether to mute the audio.
- **Type**: `boolean`
- **Default**: `false`
