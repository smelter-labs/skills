# useBlockingTask

Runs an async function from within a component. In offline processing it also blocks processing until the returned promise resolves — rendering of the next timestamp will not start while any blocking task is unresolved. Returns the resolved value, or `undefined` until it resolves.

> **Note:** Works for both live and offline processing, but primarily intended for offline processing.

## Usage

```tsx
import { Text, View, useBlockingTask } from "@swmansion/smelter";

function ExampleApp() {
  const result = useBlockingTask(async () => {
    await sleep(1000);
    return "Task result";
  });

  return (
    <View>
      <Text>{result}</Text>
    </View>
  );
}
```

## Signature

```tsx
function useBlockingTask<T>(fn: () => Promise<T>): T | undefined;
```

## Arguments
### fn
- **Type**: `() => Promise<T>`

Async function the hook executes while blocking processing (in offline mode).

## Returns
- **Type**: `T | undefined`

The value returned by `fn`, or `undefined` while the promise is still pending.
