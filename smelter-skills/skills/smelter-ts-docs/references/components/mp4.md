# Mp4

Renders the content of an MP4 file. A simpler alternative to [InputStream](./input-stream.md) that needs no registration, with a more limited set of options.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

> ⚠️ **Caution:** `@swmansion/smelter-web-wasm` does not support audio from MP4 files.

## Usage

```tsx
import { Mp4, Rescaler } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <Rescaler>
      <Mp4 source="https://example.com/video.mp4" />
    </Rescaler>
  );
}
```

## Type

```tsx
type Mp4Props = {
  source: string;
  volume?: number;
  muted?: boolean;
};
```

## Props

### source
URL or local path to the MP4 file. A local path must be local to the machine running the Smelter server.
- **Type**: `string`

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
