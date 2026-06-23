# WebRenderer

An instance of a website rendered using Chromium embedded in the Smelter instance. Once registered, it is referenced by `instance_id` from a [WebView component](../components/web-view.md).

Requires a Smelter build with web rendering support, and the `SMELTER_WEB_RENDERER_ENABLE=true` environment variable must be set. Verify that your Smelter supports web rendering before using a web renderer.

> **Note:** Set `SMELTER_WEB_RENDERER_ENABLE=true` to enable web rendering capabilities (default: `false`).

> ⚠️ **Caution:** Only one component can use a specific instance at a time.

## Usage

```http
POST: /api/web-renderer/:instance_id/register
Content-Type: application/json

{
  "url": "https://example.com",
  "resolution": { "width": 1920, "height": 1080 },
  "embedding_method": "native_embedding_over_content"
}
```

## Type

```tsx
type WebRenderer = {
  url: string;
  resolution: {
    width: u32;
    height: u32;
  };
  embedding_method?:
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
- **Type**: `{ width: u32; height: u32; }`

---

### embedding_method
Mechanism used to render input frames on the website.
- **Type**: `"chromium_embedding" | "native_embedding_over_content" | "native_embedding_under_content"`
- **Values**:
    - `native_embedding_over_content` - Renders a website without any inputs, then overlays the inputs onto the website.
    - `native_embedding_under_content` - Renders a website without any inputs, then underlays the inputs beneath the website.
    - `chromium_embedding` - Pass raw input frames as JS buffers so they can be rendered, for example, using a `<canvas>` element.

> ⚠️ **Caution:** `chromium_embedding` can significantly impact performance, particularly when handling a large number of inputs.

## Environment variables

- `SMELTER_WEB_RENDERER_ENABLE` (default: `false`) - Enables web rendering capabilities.
- `SMELTER_WEB_RENDERER_GPU_ENABLE` (default: `true`) - If enabled, websites are rendered on the GPU. Otherwise, software-based rendering is used.
