# Show

Schedules when an element is added, by absolute timestamp or by delay after mount. Primarily useful for offline processing; for live cases the same effect is achievable with `useEffect` + `setTimeout`.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { Mp4, Show, Tiles } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <Tiles style={{ backgroundColor: "#52505b" }} transition={{ durationMs: 300 }}>
      <Mp4 source="https://example.com/video1.mp4" />
      <Show delayMs={2000}>
        <Mp4 source="https://example.com/video2.mp4" />
      </Show>
      <Show timeRangeMs={{ start: 5000, end: 8000 }}>
        <Mp4 source="https://example.com/video3.mp4" />
      </Show>
    </Tiles>
  );
}
```

Either `timeRangeMs` or `delayMs` must be specified.

## Type

```tsx
type ShowProps = {
  children: ReactNode;
  timeRangeMs?: { start?: number; end?: number };
  delayMs?: number;
};
```

## Props

### children
Content displayed when the `timeRangeMs`/`delayMs` condition is met.
- **Type**: `ReactNode`

---

### timeRangeMs
Time range defined by `start` and `end` timestamps (ms). At least one of them must be defined.
- **Type**: `{ start?: number; end?: number }`

---

### delayMs
Duration after the `Show` component is mounted before its children become visible.
- **Type**: `number`
- **Default**: `1`
