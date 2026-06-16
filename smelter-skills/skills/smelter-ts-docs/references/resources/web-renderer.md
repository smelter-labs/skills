# WebRenderer (resource)

Represents an instance of a website rendered using Chromium embedded in the Smelter instance. It is used by the `WebView` component (see `../components/web-view.md`).

**Requires the `web-renderer` feature.**

> **Note:** To use web rendering, the `SMELTER_WEB_RENDERER_ENABLE` environment variable must be set, and the Smelter binary must be built with web rendering support.

> ⚠️ **Caution:** Only one component can use a specific WebRenderer instance at a time.

## Type

```tsx
type RegisterWebRenderer = {
  url: string;
  resolution: {
    width: number;
    height: number;
  };
  embeddingMethod?:
    | "chromium_embedding"
    | "native_embedding_over_content"
    | "native_embedding_under_content";
};
```

## Properties

### url
URL of the website to render.
- **Type**: `string`

---

### resolution
Resolution of the rendered website.
- **Type**: `{ width: number; height: number; }`

---

### embeddingMethod
Mechanism used to render input frames on the website.
- **Type**: `"chromium_embedding" | "native_embedding_over_content" | "native_embedding_under_content"`
- `native_embedding_over_content` — render the website without inputs, then overlay the inputs onto it.
- `native_embedding_under_content` — render the website without inputs, then underlay the inputs beneath it.
- `chromium_embedding` — pass raw input frames as JS buffers so the website can render them (e.g. via a `<canvas>`). Can significantly impact performance, especially with many inputs.
