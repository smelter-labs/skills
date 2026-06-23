# Image

A component for rendering images (from external URLs or a local path).

> **Note:** To use this component, first register the image with a matching `image_id` using a register image request (see `resources/image.md` and `routes.md`).

## Usage

Register an image with id `example_image`:

```http
POST: /api/image/example_image/register
Content-Type: application/json

{
  "asset_type": "svg",
  "url": "https://example.com/image.svg"
}
```

Update an output with a scene that uses image `example_image`:

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "view",
      "background_color": "#52505b",
      "children": [
        {
          "type": "image",
          "image_id": "example_image"
        }
      ]
    }
  }
}
```

## Type

```tsx
type Image = {
  type: "image";
  id?: string;
  image_id: string;
  width?: f32;
  height?: f32;
}
```

## Properties

### type
Component type discriminant. Must be `"image"`.
- **Type**: `string`

---

### id
ID of the component.
- **Type**: `string`

---

### image_id
ID of an image registered using a register image request (see `resources/image.md`).
- **Type**: `string`

---

### width
Width of the image in pixels. If `height` is not provided, the image adjusts its height to keep the original aspect ratio relative to the width.
- **Type**: `f32`

---

### height
Height of the image in pixels. If `width` is not provided, the image adjusts its width to keep the original aspect ratio relative to the height.
- **Type**: `f32`
