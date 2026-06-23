# WebView

Renders a website using a Chromium engine embedded inside the Smelter instance. Requires the `web-renderer` build feature.

> **Note:** To use this component, first register the web renderer with a matching `instance_id` using a register web renderer request (see `resources/web-renderer.md` and `routes.md`).

> ⚠️ **Caution:** Only one component can use a specific `instance_id` at a time.

## Usage

Register a web renderer first:

```http
POST: /api/web-renderer/example_web_renderer/register
Content-Type: application/json

{
  "url": "https://smelter.dev",
  "resolution": { "width": 1920, "height": 1080 },
  "embedding_method": "chromium_embedding"
}
```

Then use the WebView component in an output scene:

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "view",
      "children": [
        {
          "type": "web_view",
          "instance_id": "example_web_renderer"
        }
      ]
    }
  }
}
```

## Type

```tsx
type WebView = {
  type: "web_view";
  id?: string;
  children?: Component[];
  instance_id: string;
}
```

## Properties

### type
Component type discriminant. Must be `"web_view"`.
- **Type**: `string`

---

### id
ID of the component.
- **Type**: `string`

---

### children
List of the component's children.
- **Type**: `Component[]`

---

### instance_id
ID of a web renderer instance registered using a register web renderer request (see `resources/web-renderer.md`).
- **Type**: `string`

> ⚠️ **Caution:** You can only refer to a specific instance in one component at a time.
