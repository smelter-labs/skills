# Image

An image asset registered on the server. Once registered, it is referenced by `image_id` from an [Image component](../components/image.md).

## Usage

```http
POST: /api/image/:image_id/register
Content-Type: application/json

{
  "asset_type": "png",
  "url": "https://example.com/image.png"
}
```

## Type

```tsx
type Image = {
  asset_type: "jpeg" | "png" | "gif" | "svg" | "auto";
  url?: string;
  path?: string;
};
```

## Properties

### asset_type
Format of an image.
- **Type**: `"png" | "jpeg" | "gif" | "svg" | "auto"`
- **Values**:
    - `png`, `jpeg`, `gif`, `svg` - explicit image format.
    - `auto` - automatically determine the image format based on the file's content.

---

### url
URL to download an image. Mutually exclusive with `path`.
- **Type**: `string`

---

### path
Path to an image on the server's filesystem. Mutually exclusive with `url`.
- **Type**: `string`
