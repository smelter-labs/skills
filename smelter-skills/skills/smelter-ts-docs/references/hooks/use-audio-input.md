# useAudioInput

Controls audio configuration (volume) for a registered input. Alternative to setting the `mute`/`volume` props on the `InputStream` component (see `../components/input-stream.md`).

> ⚠️ **Caution:** Using this hook (or the `<InputStream />` component) more than once for the same input sums the configured volume.

## Usage

```tsx
import { View, useAudioInput } from "@swmansion/smelter";

function ExampleApp() {
  useAudioInput("input_1", { volume: 0.5 });
  return <View />;
}
```

## Signature

```tsx
function useAudioInput(inputId: string, audioOptions: AudioOptions): void;
```

## Type

```tsx
type AudioOptions = {
  volume: number;
};
```

## Arguments
### inputId
- **Type**: `string`

Input id, as registered via `Smelter.registerInput`.

### audioOptions
- **Type**: `{ volume: number }`

`volume` — number in range `[0, 2]` representing the audio volume.

## Returns
Nothing.
