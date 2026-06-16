# useAfterTimestamp

Returns `true` once the given timestamp has passed, `false` before. Replaces `useEffect` + `setTimeout` patterns, which don't work in offline processing where there is no real-time clock.

> **Note:** Works for both live and offline processing, but primarily intended for offline processing.

## Usage

```tsx
import { Text, View, useAfterTimestamp } from "@swmansion/smelter";

function ExampleApp() {
  const afterTimestamp = useAfterTimestamp(5000);
  return (
    <View>
      {afterTimestamp ? (
        <Text>After 5 second timestamp</Text>
      ) : (
        <Text>Before 5 second timestamp</Text>
      )}
    </View>
  );
}
```

## Signature

```tsx
function useAfterTimestamp(timestampMs: number): boolean;
```

## Arguments
### timestampMs
- **Type**: `number`

Timestamp in milliseconds (relative to the queue/processing start).

## Returns
- **Type**: `boolean`

`true` if the timestamp has already passed, `false` otherwise.
