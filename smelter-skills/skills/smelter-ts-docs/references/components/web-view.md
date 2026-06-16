# WebView

Renders a website using a Chromium engine embedded inside the Smelter instance. Register the renderer first with `Smelter.registerWebRenderer` using a matching `instanceId`.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

Requires the `web-renderer` feature to be enabled on the Smelter server.

> ⚠️ **Caution:** Only one component can use a given `instanceId` at a time.

## Usage

```tsx
import { View, WebView } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <View>
      <WebView instanceId="example_web_renderer" />
    </View>
  );
}

// register before use:
await smelter.registerWebRenderer("example_web_renderer", {
  url: "https://smelter.dev",
  resolution: { width: 1920, height: 1080 },
  embeddingMethod: "chromium_embedding",
});
```

## Type

```tsx
type WebViewProps = {
  id?: string;
  children?: ReactElement[];
  instanceId: string;
};
```

## Props

### instanceId
ID of a web renderer instance registered with `Smelter.registerWebRenderer`.
- **Type**: `string`

---

### children
Content to display within the `WebView`.
- **Type**: `ReactElement[]`

---

### id
Component ID.
- **Type**: `string`
- **Default**: value produced by the `useId` hook
