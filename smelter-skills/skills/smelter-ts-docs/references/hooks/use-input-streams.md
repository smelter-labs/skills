# useInputStreams

Returns an object describing all currently registered input streams and their live state. Use it to react to inputs connecting, finishing, or to read track durations (e.g. render a tile per connected stream).

## Usage

```tsx
import { InputStream, Text, Tiles, useInputStreams } from "@swmansion/smelter";

function ExampleApp() {
  const inputs = useInputStreams();
  return (
    <Tiles transition={{ durationMs: 200 }}>
      {Object.values(inputs).map((input) => {
        if (input.videoState === "finished") {
          return <Text key={input.inputId}>Stream {input.inputId} finished</Text>;
        }
        if (input.videoState === "playing") {
          return <InputStream key={input.inputId} inputId={input.inputId} />;
        }
        return <Text key={input.inputId}>Waiting for {input.inputId}</Text>;
      })}
    </Tiles>
  );
}
```

## Signature

```tsx
function useInputStreams(): Record<string, InputStreamInfo>;
```

## Returns

`Record<string, InputStreamInfo>` — maps each registered input id to its state info.

## Type

```tsx
type InputStreamInfo = {
  inputId: string;
  videoState?: "ready" | "playing" | "paused" | "finished";
  audioState?: "ready" | "playing" | "paused" | "finished";
  offsetMs?: number;
  videoDurationMs?: number;
  audioDurationMs?: number;
};
```

### InputStreamInfo fields
- **inputId** (`string`) — input id, as registered via `Smelter.registerInput`.
- **videoState** (`"ready" | "playing" | "paused" | "finished"`) — current state of the input's video track.
- **audioState** (`"ready" | "playing" | "paused" | "finished"`) — current state of the input's audio track.
- **offsetMs** (`number`) — timestamp (relative to queue start) when the input was added.
- **videoDurationMs** (`number`) — video track length, if known. Only available for some inputs (e.g. mp4).
- **audioDurationMs** (`number`) — audio track length, if known. Only available for some inputs (e.g. mp4).
